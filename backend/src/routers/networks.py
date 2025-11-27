import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from src.database.db import DB, get_db
from src.models.Network import Network, NetworkUpdate
from src.models.User import User
from src.repositories.device import DeviceRepository
from src.repositories.network import NetworkRepository
from src.repositories.organization import OrganizationRepository
from src.services.oauth import get_current_user
from src.shared.utils import validate_id

router = APIRouter(prefix='/networks', tags=['networks'])

@router.get('', status_code=status.HTTP_200_OK)
async def networks(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    networks = await NetworkRepository.list_networks(db)
    return networks.model_dump(by_alias=False)
  except HTTPException as h:
    raise h
  except Exception as error:
    raise http_exceptions.INTERNAL_ERROR(detail=str(error))

@router.get('/list', status_code=status.HTTP_200_OK)
async def networks_list(organizationId: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    networks = await NetworkRepository.list_networks_by_filter(db, organizationId=organizationId)
    return networks.model_dump(by_alias=False)
  except HTTPException as h:
    raise h
  except Exception as error:
    raise http_exceptions.INTERNAL_ERROR(detail=str(error))

@router.get('/{network_id}', status_code=status.HTTP_200_OK, response_model=Network, response_model_by_alias=False)
async def get_network(network_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    network_id = validate_id(target_id=network_id, id_field_name='network_id')

    network_existent = await NetworkRepository.get_network_by(db, field='_id', value=network_id)
    if not network_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')

    return network_existent
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.get('/{network_id}/devices', status_code=status.HTTP_200_OK)
async def get_network_devices(network_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    network_id = validate_id(target_id=network_id, id_field_name='network_id')

    network_existent = await NetworkRepository.get_network_by(db, field='_id', value=network_id)
    if not network_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')

    network_devices = await DeviceRepository.list_devices_by_filter(db, networkId=str(network_id))
    return {'devices': network_devices}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post('/new', status_code=status.HTTP_201_CREATED)
async def new_network(network: Network, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    if network.organizationId:
      # Check if organization exists
      network_organization = await OrganizationRepository.get_organization_by(db, field='_id', value=network.organizationId)
      if not network_organization:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='organização da rede')

    new_network_id = await NetworkRepository.create_network(db, new_network_data=network)
    new_network_obj = await NetworkRepository.get_network_by(db, field='_id', value=new_network_id)

    # Move network into organization
    network_moved_to_organization = await OrganizationRepository.move_item_to_organization(db,
                                                                                           item_id=new_network_obj.id,
                                                                                           item_list='networks',
                                                                                           initial_organization_id=None,
                                                                                           target_organization_id=new_network_obj.organizationId)
    if not network_moved_to_organization:
      raise http_exceptions.MOVE_ITEM_TO_ORGANIZATION_FAILED(item_type='rede')

    return {'success': True, 'message': f'Rede criada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.patch('/{network_id}/edit', status_code=status.HTTP_201_CREATED)
async def edit_network(network_id: str, new_network_data: NetworkUpdate, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    network_id = validate_id(network_id, 'network_id')

    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    # Check if network exists
    existent_network = await NetworkRepository.get_network_by(db, field='_id', value=network_id)
    if not existent_network:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')
    existent_network = existent_network.model_dump(by_alias=True, exclude=['id'])

    organization_to_update = new_network_data.organizationId != '' and new_network_data.organizationId != existent_network['organizationId']
    if organization_to_update and new_network_data.organizationId and not await OrganizationRepository.get_organization_by(db, field='_id',
                                                                                                                            value=new_network_data.organizationId):
      raise http_exceptions.DOCUMENT_INEXISTENT(document='nova organização do usuário')

    updated_network = await NetworkRepository.edit_network_by_id(db, network_id=network_id, new_network_data=new_network_data)

    # --------------------- ORGANIZATION RELATED ---------------------
    if organization_to_update:
      moved_network_to_org = await OrganizationRepository.move_item_to_organization(db,
                                                                                    item_id=updated_network.id,
                                                                                    item_list='networks',
                                                                                    initial_organization_id=existent_network['organizationId'],
                                                                                    target_organization_id=updated_network.organizationId)
      if not moved_network_to_org:
        raise http_exceptions.MOVE_ITEM_TO_ORGANIZATION_FAILED(item_type='rede')
    # --------------------- ORGANIZATION RELATED ---------------------

    return {'success': True, 'message': f'Rede atualizada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.delete('/{network_id}/delete', status_code=status.HTTP_201_CREATED)
async def delete_network(network_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    network_id = validate_id(network_id, 'network_id')

    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    deleted_network = await NetworkRepository.delete_network_by_id(db, network_id=network_id)

    if deleted_network.organizationId is not None:
      removed_network_from_org = await OrganizationRepository.remove_item_from_organization(db, item_id=network_id,
                                                                                            item_list='networks',
                                                                                            organization_id=deleted_network.organizationId)
      if not removed_network_from_org:
        raise http_exceptions.REMOVE_ITEM_FROM_ORG_FAILED(item_type='rede')

    removed_adopted_devices, devices_ids_list = await DeviceRepository.remove_all_network_devices(db, network_id=network_id)
    if not removed_adopted_devices:
        raise http_exceptions.REMOVE_DEVICE_FROM_NET_FAILED

    return {'success': True, 'message': f'Rede removida.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
