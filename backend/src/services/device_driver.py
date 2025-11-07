import functools
import re
from typing import Any, Dict

import paramiko
import requests
from src.database.db import DB
from src.models.Device import Device
from src.models.Profile import Action, Profile
from src.repositories.profile import ProfileRepository
from src.shared import http_exceptions
from src.shared.utils import (get_nested_value, get_value_from_response,
                              hydrate_payload)

# Placeholder map for merge fields.
# We add DEVICE_IP, DEVICE_USER, DEVICE_PASSWORD from the device object.
# Others (like {{cookies.token}}) come from the response itself.
BASE_PLACEHOLDERS = {
    "DEVICE_IP_ADDRESS": "device.ip_address",
    "DEVICE_MAC_ADDRESS": "device.mac_address",
    "DEVICE_USER": "device.user",
    "DEVICE_PASSWORD": "device.password",
    "DEVICE_MODEL": "device.model",
}


class DeviceDriver:
  """
  Generic Device Driver that executes actions based on a device Profile.
  Manages HTTP sessions and SSH connections.
  This class is SYNCHRONOUS (blocking) and intended to be run in a thread.
  """

  def __init__(self, device: Device, profile: Profile):
    if not profile.apiBaseUrl:
        raise ValueError("Profile is missing a required 'baseUrl'.")

    self.device = device
    self.profile = profile

    # Create the base set of values for placeholder hydration
    self.placeholder_values = {}
    for key, path in BASE_PLACEHOLDERS.items():
        self.placeholder_values[key] = get_nested_value(device.model_dump(), path.replace('device.', ''))

    # Hydrate baseUrl, e.g., 'http://{{DEVICE_IP}}/api'
    self.base_url = hydrate_payload(self.profile.apiBaseUrl, self.placeholder_values)

    # HTTP State
    self.http_session = requests.Session()
    self.http_is_authenticated = False

    # SSH State
    self.ssh_client = None # Not used for session-based, but could be


  def execute_action(self, action_name: str, payload: dict | None = None) -> Any:
    """
    Public method to execute a defined action.
    """
    try:
        action = self.profile.actions[action_name]
    except KeyError:
        raise http_exceptions.CONFIG_ACTION_FAILED(
            f"Ação '{action_name}' não definida no profile '{self.profile.name}'."
        )

    # Automatically authenticate if this is not an auth action
    if action.actionType != 'auth' and action.protocol == 'http' and not self.http_is_authenticated:
        self._authenticate_http()

    if action.protocol == 'http':
        return self._execute_http(action, payload)
    elif action.protocol == 'ssh':
        return self._execute_ssh(action)
    else:
        raise NotImplementedError(f"Protocolo '{action.protocol}' não implementado.")

  def _authenticate_http(self):
    """
    Finds and executes the 'auth' action for HTTP.
    """
    if self.http_is_authenticated:
        return True

    auth_action = None
    for action in self.profile.actions.values():
        if action.actionType == 'auth' and action.protocol == 'http':
            auth_action = action
            break

    if not auth_action:
        # No 'auth' action defined, assume no auth is needed.
        self.http_is_authenticated = True
        return True

    try:
        # Auth actions use payloadTemplate, so payload is None
        self._execute_http(auth_action, payload=None)
        self.http_is_authenticated = True
        return True
    except Exception as e:
        self.http_is_authenticated = False
        raise http_exceptions.DEVICE_LOGIN_FAIL(f"Falha na autenticação HTTP: {e}")

  def _execute_http(self, action: Action, payload: dict | None) -> Any:
    """
    Handles execution of a single HTTP action. (SYNCHRONOUS)
    """
    http_details = action.httpDetails
    if not http_details:
        raise ValueError(f"Ação HTTP '{action}' não possui httpDetails.")

    # 1. Prepare URL with Path Variables
    url_path = http_details.path
    if http_details.pathVariables:
        # Hydrate path variables using the base placeholders (e.g., {{DEVICE_IP}})
        hydrated_vars = hydrate_payload(http_details.pathVariables, self.placeholder_values)

        # Build query string, e.g., "?type=general"
        query_string = "&".join([f"{key}={value}" for key, value in hydrated_vars.items()])
        if query_string:
            # Check if path already has query params
            separator = "?" if "?" not in url_path else "&"
            url_path += separator + query_string

    url = self.base_url + (f":{http_details.port}" if http_details.port != 80 else '') + url_path

    # 2. Prepare Payload
    data_to_send = None
    if action.actionType == 'auth':
        # For 'auth' actions, hydrate the payload template using base values
        data_to_send = hydrate_payload(http_details.payloadTemplate, self.placeholder_values)
    elif payload:
        # For 'manage' actions, use the provided payload
        data_to_send = payload

    try:
        # 3. Prepare Request
        request_args = {
            "method": http_details.method,
            "url": url,
            "timeout": 10,
        }
        if http_details.payloadType == 'text/json' and data_to_send:
            request_args["json"] = data_to_send
        elif http_details.payloadType == 'text/plain' and data_to_send:
            request_args["data"] = str(data_to_send)

        # Execute Request
        response = self.http_session.request(**request_args)

        if response.status_code != http_details.successStatusCode:
            raise http_exceptions.DEVICE_API_FAIL(
                f"Ação falhou com status {response.status_code}. Resposta: {response.text}"
            )

        # If auth -> handle header mapping
        if action.actionType == 'auth' and http_details.responseHeaderMapping:
            placeholders_to_find = set()
            regex = r"\{\{(.*?)\}\}" # Find text inside {{...}}
            for template_string in http_details.responseHeaderMapping.values():
                found = re.findall(regex, template_string)
                placeholders_to_find.update(found)

            # Build a dictionary of the actual values from the response
            extracted_values = {}
            for placeholder_path in placeholders_to_find:
                extracted_values[placeholder_path] = get_value_from_response(response, placeholder_path)

            # Hydrate and set the session headers
            for header_key, header_template in http_details.responseHeaderMapping.items():
                final_header_value = hydrate_payload(header_template, extracted_values)
                if final_header_value:
                    self.http_session.headers.update({header_key: str(final_header_value)})

            self.http_is_authenticated = True # Mark session as authenticated

        # 7. Handle Data Response
        if http_details.responseType == 'blank' or http_details.responseType == 'boolean':
            return True

        raw_data = response.json() if http_details.responseType == 'text/json' else response.text

        if not http_details.responseMapping:
            return raw_data

        # Apply response mapping
        mapped_data = {}
        for rfsight_key, device_key_path in http_details.responseMapping.items():
            mapped_data[rfsight_key] = get_nested_value(raw_data, device_key_path)

        return mapped_data

    except requests.exceptions.RequestException as e:
        raise http_exceptions.DEVICE_API_FAIL(f"Falha na conexão HTTP: {e}")
    except Exception as e:
        raise http_exceptions.DEVICE_API_FAIL(f"Erro ao executar HTTP: {e}")

  def _execute_ssh(self, action: Action) -> str:
    """
    Handles execution of SSH actions using Paramiko. (SYNCHRONOUS)
    """
    ssh_details = action.sshDetails
    if not ssh_details:
        raise ValueError(f"Ação SSH '{action}' não possui sshDetails.")

    try:
        with paramiko.SSHClient() as client:
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            client.connect(
                hostname=self.device.ip_address,
                port=ssh_details.port,
                username=self.device.user,
                password=self.device.password,
                timeout=5
            )

            # Hydrate command with base placeholders (e.g., {{DEVICE_IP}})
            command_to_exec = hydrate_payload(ssh_details.command, self.placeholder_values)

            stdin, stdout, stderr = client.exec_command(command_to_exec)

            error = stderr.read().decode().strip()
            if error:
                raise http_exceptions.DEVICE_API_FAIL(f"Erro SSH: {error}")

            output = stdout.read().decode().strip()

            return output

    except paramiko.ssh_exception.AuthenticationException:
        raise http_exceptions.DEVICE_LOGIN_FAIL("Credenciais SSH inválidas.")
    except Exception as e:
        raise http_exceptions.DEVICE_API_FAIL(f"Falha na ação SSH: {e}")
