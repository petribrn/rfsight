import asyncio
import functools
import hashlib
import json
import socket
import time
from typing import Any, Dict

import bcrypt
import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from retry import retry
from src.models.API.Configuration import DeviceConfiguration


def hash_passwd(password: str):
  encoded_passwd = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_passwd = bcrypt.hashpw(encoded_passwd, salt)
  return hashed_passwd.decode()

def verify_passwd(plain_text_password, hashed_passwd):
  return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_passwd.encode('utf-8'))

def validate_id(target_id: str, id_field_name: str):
  if isinstance(target_id, ObjectId):
    return target_id
  if not ObjectId.is_valid(target_id):
    raise http_exceptions.INVALID_FIELD(field=id_field_name)

  target_id = ObjectId(target_id)
  return target_id

def wait_device_connectivity(host: str, port=80, timeout: int = constants.DEVICE_CONN_TIMEOUT) -> bool:
  start_time = time.time()
  recheck = 0
  while True:
    try:
      time.sleep(1)
      if check_port(host, port):
        recheck +=1
        if recheck >= 5: return True
      else:
        if time.time() - start_time >= timeout:
          return False
        continue
    except (ConnectionError, ConnectionAbortedError, ConnectionRefusedError, ConnectionResetError) as e:
      continue

def check_port(host: str, port: int) -> bool:
  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  try:
    s.settimeout(5)
    s.connect((host, 80))
    s.shutdown(2)
    return True
  except socket.error as e:
    return False

def hash_device_config(device_config: DeviceConfiguration):
  dhash = hashlib.md5()
  config_dict = device_config.model_dump(by_alias=True)
  encoded = json.dumps(config_dict, sort_keys=True).encode()
  dhash.update(encoded)
  return dhash.hexdigest()

def get_nested_value(data_dict: dict, key_path: str):
    """
    Retrieves a value from a nested dictionary using a dot-separated key path.
    """
    try:
        return functools.reduce(lambda d, key: d[key], key_path.split('.'), data_dict)
    except (KeyError, TypeError, AttributeError):
        return None

def get_value_from_response(response: Any, path: str) -> Any:
  """
  Extracts a value from a requests.Response object or a JSON dict
  using a dot-separated path.

  Special prefixes:
  - 'cookies.' -> accesses response.cookies
  - 'headers.' -> accesses response.headers
  - 'json.'    -> accesses response.json()
  """
  if not path:
      return None

  try:
    if path.startswith('cookies.'):
      key = path.split('.', 1)[1]
      return response.cookies.get(key)
    elif path.startswith('headers.'):
      key = path.split('.', 1)[1]
      return response.headers.get(key)
    elif path.startswith('json.'):
      key_path = path.split('.', 1)[1]
      return get_nested_value(response.json(), key_path)
    else:
      return get_nested_value(response, key_path=path)
  except Exception:
    return None

def hydrate_payload(template: Any, values: Dict[str, str]) -> Any:
  """
  Recursively replaces placeholder strings in a payload template.
  Placeholders are in the format '{{KEY}}'.
  """
  if isinstance(template, dict):
    # Recursively hydrate dictionary values
    return {k: hydrate_payload(v, values) for k, v in template.items()}
  elif isinstance(template, list):
    # Recursively hydrate list items
    return [hydrate_payload(item, values) for item in template]
  elif isinstance(template, str):
    # Replace placeholders in strings
    for key, value in values.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    return template
  else:
    # Return other types (int, bool, etc.) as-is
    return template
