import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from fastapi import APIRouter, Depends, HTTPException, status
from src.database.db import DB, get_db
from src.models.Organization import (Organization, OrganizationCollection,
                                     OrganizationUpdate)
from src.models.User import User
from src.repositories.network import NetworkRepository
from src.repositories.organization import OrganizationRepository
from src.repositories.user import UserRepository
from src.services.oauth import get_current_user
from src.shared.utils import validate_id

router = APIRouter(prefix='/organizations', tags=['organizations'])

@router.get('', status_code=status.HTTP_200_OK, response_model=OrganizationCollection, response_model_by_alias=False)
async def organizations(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organization_collection = await OrganizationRepository.list_organizations(db)
    return organization_collection
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.get('/{organization_id}', status_code=status.HTTP_200_OK, response_model=Organization, response_model_by_alias=False)
async def get_organization(organization_id, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organization_id = validate_id(target_id=organization_id, id_field_name='organization_id')

    organization_existent = await OrganizationRepository.get_organization_by(db, field='_id', value=organization_id)
    if not organization_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')

    return organization_existent
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.get('/{organization_id}/users', status_code=status.HTTP_200_OK)
async def get_organization_users(organization_id, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organization_id = validate_id(target_id=organization_id, id_field_name='organization_id')

    organization_existent = await OrganizationRepository.get_organization_by(db, field='_id', value=organization_id)
    if not organization_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')

    organization_users = await UserRepository.list_users_by_filter(db, organizationId=str(organization_id))
    return {'users': organization_users}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post('/new', status_code=status.HTTP_201_CREATED)
async def create_organization(organization: Organization, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    # Only users with admin and master permission can create new organizations
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                        constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    new_organization_id = await OrganizationRepository.create_organization(db, new_organization_data=organization)

    return {'success': True, 'organizationId': str(new_organization_id)}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.patch('/{organization_id}/edit', status_code=status.HTTP_201_CREATED)
async def edit_organization(organization_id: str, new_organization_data: OrganizationUpdate,
                            current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organization_id = validate_id(target_id=organization_id, id_field_name='organization_id')

    # Only users with admin and master permission can edit organizations
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    updated_organization = await OrganizationRepository.edit_organization_by_id(db, organization_id=organization_id,
                                                                                new_organization_data=new_organization_data)

    return {'success': True, 'message': f'Organização {updated_organization.id} atualizada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.delete('/{organization_id}/delete', status_code=status.HTTP_201_CREATED)
async def delete_organization(organization_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    organization_id = validate_id(target_id=organization_id, id_field_name='organization_id')

    # Only users with guest_admin, admin and master permission can delete organizations
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    # TODO --->  SET ALL ITS USERS ORGANIZATION TO NONE BEFORE DELETING IT
    removed_users_org = await UserRepository.remove_users_organization(db, organization_id=organization_id)
    if not removed_users_org:
      raise http_exceptions.REMOVE_ITEM_FROM_ORG_FAILED(item_type='usuários')

    removed_networks_org = await NetworkRepository.remove_networks_organization(db, organization_id=organization_id)
    if not removed_networks_org:
      raise http_exceptions.REMOVE_ITEM_FROM_ORG_FAILED(item_type='redes')

    deleted_organization = await OrganizationRepository.delete_organization_by_id(db, organization_id=organization_id)

    return {'success': True, 'message': f'Organização {deleted_organization.id} deletada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
