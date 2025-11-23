import asyncio
import json
import random
import threading
from datetime import datetime
from queue import Queue
from typing import Iterator, List, Literal

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from src.controllers.AdoptionController import AdoptionController
from src.controllers.config.ConfigController import ConfigController
from src.database.db import DB, get_db
from src.models.Actions import ActionSequencePayload, ActionSequenceResponse
from src.models.API.Configuration import DeviceConfiguration
from src.models.Configuration import Configuration
from src.models.Device import (Device, DeviceCollection, DeviceToAdopt,
                               DeviceUpdate)
from src.models.User import User
from src.repositories.configuration import ConfigurationRepository
from src.repositories.device import DeviceRepository
from src.repositories.network import NetworkRepository
from src.repositories.organization import OrganizationRepository
from src.repositories.profile import ProfileRepository
from src.services.device_driver import DeviceDriver
from src.services.oauth import get_current_user
from src.shared.utils import validate_id
from sse_starlette import EventSourceResponse

router = APIRouter(prefix='/devices', tags=['devices'])

queue = Queue()
lock = threading.Lock()
adoption_controller = AdoptionController(queue=queue, available_devices_lock=lock)
adoption_controller.start()

config_controller = ConfigController()

@router.get('/list', status_code=status.HTTP_200_OK, response_model=DeviceCollection, response_model_by_alias=False)
async def devices(organizationId: str, networkId: str = None, profileId: str = None, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organizationId = validate_id(target_id=organizationId, id_field_name='organizationId')

    existent_organization = await OrganizationRepository.get_organization_by(db, field='_id', value=organizationId)
    if not existent_organization:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')

    device_filter = {}
    if networkId:
      networkId = validate_id(target_id=networkId, id_field_name='networkId')
      if networkId not in existent_organization.networks:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')
      networks_filter = [x for x in existent_organization.networks if x == networkId]
      device_filter.update({'networkId': {'$in': networks_filter}})
    else:
      networks_filter = existent_organization.networks
      device_filter.update({'networkId': {'$in': networks_filter}})

    if profileId:
      profileId = validate_id(target_id=profileId, id_field_name='profileId')
      device_filter.update({'profileId': profileId})

    # Returns the entire collection of devices
    device_collection = await DeviceRepository.list_devices_by_compound_filter(db, compound_filter=device_filter)
    return device_collection
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

# TODO: LIST DEVICES BY PROFILE

@router.post('/adopt', status_code=status.HTTP_201_CREATED)
async def adopt_device(device_adopt_data: DeviceToAdopt, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    # Only users with guest_admin, admin and master permission can add devices
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    if device_adopt_data.networkId:
      # Check if network exists
      device_network = await NetworkRepository.get_network_by(db, field='_id', value=device_adopt_data.networkId)
      if not device_network:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='rede do dispositivo')

    # Check if device is not already adopted
    if all([x is None for x in [device_adopt_data.mac_address, device_adopt_data.ip_address]]):
      raise http_exceptions.INVALID_FIELD(field='Endereco IP ou MAC')
    field = 'mac_address' if device_adopt_data.mac_address else 'ip_address'
    value = device_adopt_data.mac_address if field == 'mac_address' else device_adopt_data.ip_address

    device_already_adopted = await DeviceRepository.get_device_by(db, field=field, value=value)
    if device_already_adopted:
      raise http_exceptions.DEVICE_ALREADY_ADOPTED

    # Search for device and get initial info
    discovered_device_to_adopt = await adoption_controller.find_device(device=device_adopt_data, db=db)

    # Create the new device record
    new_device_id = await DeviceRepository.create_device(db, new_device_data=discovered_device_to_adopt)

    # Move device into network
    device_moved_to_net = await NetworkRepository.move_device_to_network(db,
                                                                         device_id=new_device_id,
                                                                         initial_network_id=None,
                                                                         target_network_id=discovered_device_to_adopt.networkId)
    if not device_moved_to_net:
      await DeviceRepository.delete_device(db, device_id=new_device_id)
      raise http_exceptions.MOVE_DEVICE_TO_NET_FAILED

    return {'success': True, 'message': f'Dispositivo adotado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

async def generate_random_data():
    """
    Generates random value between 0 and 100

    :return: String containing current timestamp (YYYY-mm-dd HH:MM:SS) and randomly generated data.
    """

    while True:
        data = {
              "y": random.random() * 100,
              "x": datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat(),
            }
        print(f'sent {data}')

        yield f"event: new_message\ndata: {json.dumps(data)}\n\n"

        await asyncio.sleep(10)

@router.get('/chart-data')
async def chart_data(request: Request):
  return StreamingResponse(generate_random_data(), media_type='text/event-stream')

@router.get('/{device_id}', status_code=status.HTTP_200_OK, response_model=Device, response_model_by_alias=False)
async def get_device(device_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    device_id = validate_id(target_id=device_id, id_field_name='device_id')

    device_existent = await DeviceRepository.get_device_by(db, field='_id', value=device_id)
    if not device_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')

    return device_existent
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post(
    '/{device_id}/execute-sequence',
    status_code=status.HTTP_200_OK,
    response_model=List[ActionSequenceResponse], # Returns a list of results
    summary="Execute a sequence of 'manage' actions on a device"
)
async def execute_device_action_sequence(
    device_id: str,
    sequence: ActionSequencePayload, # Body: {"actions": [{"action_name": "reboot", "payload": null}]}
    current_user: User = Depends(get_current_user),
    db: DB = Depends(get_db)
):
    """
    Executes a list of 'manage' actions sequentially on a single device.

    - A single `DeviceDriver` instance is created to share the session.
    - Actions are executed in the order they are received.
    - If any action fails, the sequence is **stopped**, and the results
      up to that point are returned.
    """
    try:
      if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                          constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
        raise http_exceptions.NO_PERMISSION

      device_id_obj = validate_id(target_id=device_id, id_field_name='device_id')
      existent_device = await DeviceRepository.get_device_by(db, field='_id', value=device_id_obj)
      if not existent_device:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')

      if not existent_device.profileId:
        raise http_exceptions.DOCUMENT_INEXISTENT("Dispositivo não possui profile associado.")

      profile = await ProfileRepository.get_profile_by(db, "_id", existent_device.profileId)
      if not profile:
        raise http_exceptions.DOCUMENT_INEXISTENT("Profile não encontrado.")

      driver = DeviceDriver(device=existent_device, profile=profile)

      results: List[ActionSequenceResponse] = []

      for action_payload in sequence.actions:
        action_name = action_payload.action_name
        payload = action_payload.payload

        action_to_run = profile.actions.get(action_name)

        if not action_to_run:
          results.append(ActionSequenceResponse(
            action=action_name,
            status='failed',
            message=f"Ação '{action_name}' não encontrada no profile."
          ))
          break

        if action_to_run.actionType != 'manage':
          results.append(ActionSequenceResponse(
            action=action_name,
            status='failed',
            message=f"Ação '{action_name}' não é do tipo 'manage'."
          ))
          break

        try:
          print(f"Executing action '{action_name}' for device {existent_device.ip_address}...")

          result = await asyncio.to_thread(
            driver.execute_action,
            action_name,
            payload
          )

          results.append(ActionSequenceResponse(
            action=action_name,
            status='success',
            message=f"Ação '{action_name}' executada com sucesso.",
            data=result
          ))

        except HTTPException as httpex:
          print(f"Action '{action_name}' failed: {httpex.detail}")
          results.append(ActionSequenceResponse(
            action=action_name,
            status='failed',
            message=str(httpex.detail)
          ))
          break
        except Exception as e:
          print(f"Action '{action_name}' failed: {e}")
          results.append(ActionSequenceResponse(
            action=action_name,
            status='failed',
            message=str(e)
          ))
          break

      return results

    except HTTPException as h:
      raise h
    except Exception as e:
      return [ActionSequenceResponse(
        action="setup",
        status="failed",
        message=f"Erro ao preparar execução: {e}"
      )]

@router.get('/{device_id}/config', status_code=status.HTTP_200_OK)
async def get_device_config(device_id: str, filter: Literal['complete', 'wireless', 'system', 'services', 'network', 'andromeda'] | None = None,
                            current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    device_id = validate_id(target_id=device_id, id_field_name='device_id')

    # Only users with guest_admin, admin and master permission can add devices
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    existent_device = await DeviceRepository.get_device_by(db, field='_id', value=device_id)
    if not existent_device:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')

    # TODO: check device online status

    # Fetch device config using requests
    device_config = config_controller.get_device_config(device_info=existent_device, format='dict')
    device_config_model = Configuration(configs=DeviceConfiguration(**device_config))

    # Get db stored configs of device
    stored_device_config = await ConfigurationRepository.get_configuration_by(db, field='_id', value=existent_device.configId)

    # If db configs are different of device fetched configs, update device and db config registries
    if stored_device_config.config_hash != device_config_model.config_hash:
      print(f'configs hashes are different --> stored: {stored_device_config.config_hash} / device: {device_config_model.config_hash}')
      # Create device update instance in order to update device info changed in config
      new_config_to_store = DeviceUpdate(wireless_configs=device_config_model.configs.wireless,
                                         services_configs=device_config_model.configs.services,
                                         network_configs=device_config_model.configs.network,
                                         system_configs=device_config_model.configs.system,
                                         andromeda_configs=device_config_model.configs.andromeda)

      # --------------------- DEVICE UPDATE ---------------------

      validated_new_device = await DeviceRepository.validate_new_device_info(db, existent_device=existent_device,
                                                                             new_device_data=new_config_to_store,
                                                                             config_update_needed=True,
                                                                             network_update_needed=False)

      updated_device = await DeviceRepository.edit_device_by_id(db, device_id=device_id,
                                                                new_device_data=validated_new_device)

      # --------------------- CONFIG UPDATE ---------------------

      # Store new config to DB
      stored_device_config = await ConfigurationRepository.edit_configuration_by_id(db,
                                                                                    config_id=updated_device.configId,
                                                                                    new_config=device_config_model.configs)

    return device_config if filter in (None, 'complete') else device_config[filter]
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.put('/{device_id}/config', status_code=status.HTTP_201_CREATED)
async def update_device_config(device_id: str, new_device_data: DeviceUpdate, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    device_id = validate_id(target_id=device_id, id_field_name='device_id')

    # Only users with guest_admin, admin and master permission can add devices
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    # DB stored device info
    existent_device = await DeviceRepository.get_device_by(db, field='_id', value=device_id)
    if not existent_device:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')

    # Check if networkId update is required, if so, check if network exists
    network_update_needed = new_device_data.networkId != '' and new_device_data.networkId != existent_device.networkId
    if network_update_needed and new_device_data.networkId and not await NetworkRepository.get_network_by(db, field='_id', value=new_device_data.networkId):
      raise http_exceptions.DOCUMENT_INEXISTENT(document='nova rede do dispositivo')

    # Check if any configuration object was sent - config needed
    config_update_needed = not all([x is None for x in [new_device_data.wireless_configs,
                                                        new_device_data.network_configs,
                                                        new_device_data.system_configs,
                                                        new_device_data.services_configs,
                                                        new_device_data.andromeda_configs]])

    # Validate new device data/configs
    validated_new_device = await DeviceRepository.validate_new_device_info(db, existent_device=existent_device,
                                                                           new_device_data=new_device_data,
                                                                           config_update_needed=config_update_needed,
                                                                           network_update_needed=network_update_needed)

    # --------------------- DEVICE UPDATE ---------------------

    updated_device = await DeviceRepository.edit_device_by_id(db, device_id=device_id,
                                                              new_device_data=validated_new_device)

    # --------------------- CONFIG UPDATE ---------------------

    if config_update_needed:
      # Fetch device config using requests
      existent_device_config = config_controller.get_device_config(device_info=updated_device)

      # Send new configs to device using new_device_data and requests
      device_config_updated = config_controller.update_device_config(device_info=updated_device,
                                                                     config_to_update=existent_device_config,
                                                                     wireless_config=new_device_data.wireless_configs,
                                                                     network_config=new_device_data.network_configs,
                                                                     system_config=new_device_data.system_configs,
                                                                     services_config=new_device_data.services_configs,
                                                                     andromeda_config=new_device_data.andromeda_configs)

      # Store new config to DB
      stored_device_config = await ConfigurationRepository.edit_configuration_by_id(db,
                                                                                    config_id=updated_device.configId,
                                                                                    new_config=device_config_updated)

    # --------------------- NETWORK UPDATE ---------------------
    if network_update_needed:
      moved_device_to_net = await NetworkRepository.move_device_to_network(db, device_id=updated_device.id,
                                                                           initial_network_id=existent_device.networkId,
                                                                           target_network_id=updated_device.networkId)
      if not moved_device_to_net:
        raise http_exceptions.MOVE_DEVICE_TO_NET_FAILED

    return {'success': True, 'message': f'Configuração atualizada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))


@router.get('/statistics', status_code=status.HTTP_201_CREATED)
async def get_statistics(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  # TODO
  pass

@router.delete('/{device_id}/delete', status_code=status.HTTP_201_CREATED)
async def delete_device(device_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    device_id = validate_id(target_id=device_id, id_field_name='device_id')

    # Only users with guest_admin, admin and master permission can delete devices
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    # Delete device document
    deleted_device = await DeviceRepository.delete_device(db, device_id=device_id)

    deleted_config = await ConfigurationRepository.delete_config_by_device_id(db, device_id=deleted_device.id)
    if not deleted_config:
      raise http_exceptions.CONFIG_ACTION_FAILED(action='apagar')

    # If device has a network, remove device from it
    if deleted_device.networkId is not None:
      removed_device_from_net = await NetworkRepository.remove_device_from_network(db,
                                                                                   device_id=device_id,
                                                                                   network_id=deleted_device.networkId)
      if not removed_device_from_net:
        raise http_exceptions.REMOVE_DEVICE_FROM_NET_FAILED

    return {'success': True, 'message': f'Dispositivo removido.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
