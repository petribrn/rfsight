import asyncio
import threading
from queue import Queue
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from src.controllers.AdoptionController import AdoptionController
from src.controllers.ConfigController import ConfigController
from src.database.db import DB, get_db
from src.models.Actions import ActionSequencePayload, ActionSequenceResponse
from src.models.Device import (Device, DeviceCollection, DeviceToAdopt,
                               DeviceUpdate)
from src.models.User import User
from src.repositories.device import DeviceRepository
from src.repositories.network import NetworkRepository
from src.repositories.organization import OrganizationRepository
from src.repositories.profile import ProfileRepository
from src.services.oauth import get_current_user
from src.shared.utils import validate_id

router = APIRouter(prefix='/devices', tags=['devices'])

queue = Queue()
lock = threading.Lock()
adoption_controller = AdoptionController(queue=queue, available_devices_lock=lock)
adoption_controller.start()


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

    print(f'Discovery: {discovered_device_to_adopt}')

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

@router.post('/{device_id}/edit', status_code=status.HTTP_200_OK)
async def edit_device(device_id: str, payload: DeviceUpdate, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    # Validate device_id
    validated_device_id = validate_id(device_id, "device_id")

    # Fetch existing device
    existent_device = await DeviceRepository.get_device_by(
      db, field="_id", value=validated_device_id
    )
    if not existent_device:
      raise http_exceptions.DOCUMENT_INEXISTENT(document="dispositivo")

    if not payload.mac_address and not payload.ip_address:
      raise http_exceptions.INVALID_FIELD(field="Endereco IP ou MAC")

    mac_changed = payload.mac_address is not None and payload.mac_address != existent_device.mac_address
    ip_changed = payload.ip_address is not None and payload.ip_address != existent_device.ip_address

    if mac_changed or ip_changed:
      # Check if new mac/ip is available in discovered devices list, block update if not
      matched = adoption_controller.match_discovered_device(mac=payload.mac_address, ip=payload.ip_address)
      if not matched:
        raise http_exceptions.DEVICE_TO_ADOPT_NOT_FOUND

    # Detect whether network/profile update is needed
    network_update_needed = False
    profile_update_needed = False
    if payload.networkId:
      validated_network_id = validate_id(payload.networkId, "network_id")
      network = await NetworkRepository.get_network_by(db, field='_id', value=validated_network_id)
      if not network:
        raise http_exceptions.DOCUMENT_INEXISTENT(document="rede")
      network_update_needed = payload.networkId != existent_device.networkId

    if payload.profileId:
      validated_profile_id = validate_id(payload.profileId, "profile_id")
      profile = await ProfileRepository.get_profile_by(db, field='_id', value=validated_profile_id)
      if not profile:
        raise http_exceptions.DOCUMENT_INEXISTENT(document="profile")
      profile_update_needed = payload.profileId != existent_device.profileId

    # Validate and merge updates
    validated_device = await DeviceRepository.validate_new_device_info(
      db=db,
      existent_device=existent_device,
      new_device_data=payload,
      profile_update_needed=profile_update_needed,
      network_update_needed=network_update_needed
    )

    # If critical information for topology changed, lock db access for update
    if mac_changed or ip_changed:
      async with constants.DEVICE_UPDATE_LOCK:
        updated_device = await DeviceRepository.edit_device_by_id(
          db=db,
          device_id=validated_device_id,
          new_device_data=validated_device
        )
    else:
      updated_device = await DeviceRepository.edit_device_by_id(
        db=db,
        device_id=validated_device_id,
        new_device_data=validated_device
      )

    return {
      "success": True,
      "message": "Dispositivo atualizado com sucesso.",
    }
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post(
    '/{device_id}/execute-sequence',
    status_code=status.HTTP_200_OK,
    response_model=List[ActionSequenceResponse],
    summary="Execute a sequence of 'manage' actions on a device"
)
async def execute_device_action_sequence(
    device_id: str,
    sequence: ActionSequencePayload,
    current_user: User = Depends(get_current_user),
    db: DB = Depends(get_db)
):
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

      results: List[ActionSequenceResponse] = await ConfigController.execute_sequence(device=existent_device, profile=profile, sequence=sequence)

      return results

    except HTTPException as h:
      raise h
    except Exception as e:
      return [ActionSequenceResponse(
        action="setup",
        status="failed",
        message=f"Erro ao preparar execução: {e}"
      )]

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
