import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from src.database.db import DB, get_db
from src.models.Organization import Organization
from src.models.User import User, UserRow, UserUpdate
from src.repositories.organization import OrganizationRepository
from src.repositories.user import UserRepository
from src.services.oauth import get_current_user
from src.shared.utils import validate_id

router = APIRouter(prefix='/users', tags=['users'])

@router.get('', status_code=status.HTTP_200_OK)
async def users(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    users = await UserRepository.list_users(db)
    users = users["users"]

    # coletar todos organizationIds válidos
    org_ids = list({u.get("organizationId") for u in users if u.get("organizationId")})

    # consultar todas as orgs em uma unica query
    org_map = await OrganizationRepository.get_organizations_by_ids(db, org_ids)

    # montar resposta
    result = []
    for u in users:
      org_info = None
      org_id = u.get("organizationId")

      if org_id and org_id in org_map:
        org_info = {
          "organizationId": org_id,
          "name": org_map[org_id]["name"]
        }
      result.append(UserRow(**u, organizationInfo=org_info).model_dump(by_alias=False))

    return result
  except HTTPException as h:
    raise h
  except Exception as error:
    raise http_exceptions.INTERNAL_ERROR(detail=str(error))

@router.get('/id/{user_id}', status_code=status.HTTP_200_OK)
async def get_user(user_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    user_id = validate_id(target_id=user_id, id_field_name='user_id')

    user_existent = await UserRepository.get_user_by(db, field='_id', value=user_id)
    if not user_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')

    return user_existent.model_dump(by_alias=True, exclude=['password'])
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.get('/{username}', status_code=status.HTTP_200_OK)
async def get_user(username: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    user_existent = await UserRepository.get_user_by(db, field='username', value=username)
    if not user_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')

    return user_existent.model_dump(by_alias=False, exclude=['password'])
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.get('/{user_id}/organization', status_code=status.HTTP_200_OK, response_model=Organization, response_model_by_alias=False)
async def get_user_org(user_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    user_id = validate_id(target_id=user_id, id_field_name='user_id')

    user_existent = await UserRepository.get_user_by(db, field='_id', value=user_id)
    if not user_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')

    if not user_existent.organizationId:
      raise http_exceptions.DOCUMENT_INEXISTENT('organização do usuário')

    user_organization = await OrganizationRepository.get_organization_by(db, field='_id', value=user_existent.organizationId)
    if not user_organization:
      raise http_exceptions.DOCUMENT_INEXISTENT('organização do usuário')

    return user_organization
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post('/new', status_code=status.HTTP_201_CREATED)
async def new_user(user: User, db: DB = Depends(get_db)):
  try:
    if user.organizationId:
      # Check if organization exists
      user_organization = await OrganizationRepository.get_organization_by(db, field='_id', value=user.organizationId)
      if not user_organization:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='organização do usuário')

    new_user_id = await UserRepository.create_user(db, user_data=user)
    new_user_obj = await UserRepository.get_user_by(db, field='_id', value=new_user_id)

    # Move user into organization
    user_moved_to_organization = await OrganizationRepository.move_item_to_organization(db, item_id=new_user_obj.id,
                                                                                        item_list='users',
                                                                                        initial_organization_id=None,
                                                                                        target_organization_id=new_user_obj.organizationId)
    if not user_moved_to_organization:
      raise http_exceptions.MOVE_ITEM_TO_ORGANIZATION_FAILED(item_type='usuário')

    return {'success': True, 'message': f'Usuário criado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.patch('/{user_id}/edit', status_code=status.HTTP_201_CREATED)
async def edit_user(user_id: str, new_user_data: UserUpdate, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    user_id = validate_id(user_id, 'user_id')

    # Only users with master permission (5) can edit other users
    if user_id != ObjectId(current_user.id):
      if current_user.permission != constants.USER_PERMISSIONS['master']:
        raise http_exceptions.NO_PERMISSION

    # Check if user exists
    existent_user = await UserRepository.get_user_by(db, field='_id', value=user_id)
    if not existent_user:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')
    existent_user = existent_user.model_dump(by_alias=True, exclude=['id'])

    organization_to_update = new_user_data.organizationId != '' and new_user_data.organizationId != existent_user['organizationId']
    if organization_to_update and new_user_data.organizationId and not await OrganizationRepository.get_organization_by(db, field='_id',
                                                                                                                        value=new_user_data.organizationId):
      raise http_exceptions.DOCUMENT_INEXISTENT(document='nova organização do usuário')

    updated_user = await UserRepository.edit_user_by_id(db, user_id=user_id, existent_user=existent_user, user_update_data=new_user_data)

    # --------------------- ORGANIZATION RELATED ---------------------
    if organization_to_update:
      moved_user_to_org = await OrganizationRepository.move_item_to_organization(db, item_id=updated_user.id,
                                                                                 item_list='users',
                                                                                 initial_organization_id=existent_user['organizationId'],
                                                                                 target_organization_id=updated_user.organizationId)
      if not moved_user_to_org:
        raise http_exceptions.MOVE_ITEM_TO_ORGANIZATION_FAILED(item_type='usuário')
    # --------------------- ORGANIZATION RELATED ---------------------

    return {'success': True, 'message': 'Usuário atualizado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.delete('/{user_id}/delete', status_code=status.HTTP_201_CREATED)
async def delete_user(user_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    user_id = validate_id(user_id, 'user_id')

    # Only users with master permission (5) can delete other users
    if user_id != ObjectId(current_user.id):
      if current_user.permission != constants.USER_PERMISSIONS['master']:
        raise http_exceptions.NO_PERMISSION

    deleted_user = await UserRepository.delete_user(db, user_id=user_id)

    if deleted_user.organizationId is not None:
      removed_user_from_org = await OrganizationRepository.remove_item_from_organization(db, item_id=user_id,
                                                                                         item_list='users',
                                                                                         organization_id=deleted_user.organizationId)
      if not removed_user_from_org:
        raise http_exceptions.REMOVE_ITEM_FROM_ORG_FAILED(item_type='usuário')

    return {'success': True, 'message': 'Usuário deletado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
