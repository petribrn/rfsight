from fastapi import APIRouter, Depends, HTTPException, status
from src.configs import constants
from src.database.db import DB, get_db
from src.models.Profile import Profile, ProfileUpdate
from src.models.User import User
from src.repositories.device import DeviceRepository
from src.repositories.profile import ProfileRepository
from src.services.oauth import get_current_user
from src.shared import http_exceptions
from src.shared.utils import validate_id

router = APIRouter(prefix='/profiles', tags=['profiles'])

@router.get('', status_code=status.HTTP_200_OK)
async def profiles(current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    profiles = await ProfileRepository.list_profiles(db)
    return profiles.model_dump(by_alias=False)
  except HTTPException as h:
    raise h
  except Exception as error:
    raise http_exceptions.INTERNAL_ERROR(detail=str(error))

@router.get('/id/{profile_id}', status_code=status.HTTP_200_OK)
async def get_profile(profile_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    profile_id = validate_id(target_id=profile_id, id_field_name='profile_id')

    profile_existent = await ProfileRepository.get_profile_by(db, field='_id', value=profile_id)
    if not profile_existent:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')

    return profile_existent.model_dump(by_alias=True, exclude=['password'])
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.post('/new', status_code=status.HTTP_201_CREATED)
async def new_profile(profile: Profile, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:

    # Only users with guest_admin, admin and master permission can update profiles
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    new_profile_id = await ProfileRepository.create_profile(db, profile_data=profile)

    return {'success': True, 'message': f'Profile criado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.put('/{profile_id}/update', status_code=status.HTTP_201_CREATED)
async def update_profile(profile_id: str, new_profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    profile_id = validate_id(profile_id, 'profile_id')

    # Only users with guest_admin, admin and master permission can update profiles
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    if new_profile_data is None or all([x is None for x in new_profile_data.model_dump().values()]):
      return {'success': True, 'message': f'Nenhuma alteração realizada.'}

    # Check if profile exists
    existent_profile = await ProfileRepository.get_profile_by(db, field='_id', value=profile_id)
    if not existent_profile:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='profile')
    existent_profile = existent_profile.model_dump(by_alias=True, exclude=['id'])

    updated_profile = await ProfileRepository.update_profile_by_id(db, profile_id=profile_id, existent_profile=existent_profile,
                                                                   profile_update_data=new_profile_data)

    return {'success': True, 'message': 'Profile atualizado.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))

@router.delete('/{profile_id}/delete', status_code=status.HTTP_201_CREATED)
async def delete_profile(profile_id: str, current_user: User = Depends(get_current_user), db: DB = Depends(get_db)):
  try:
    profile_id = validate_id(target_id=profile_id, id_field_name='profile_id')

    # Only users with guest_admin, admin and master permission can delete profiles
    if current_user.permission not in (constants.USER_PERMISSIONS['guest_admin'],
                                       constants.USER_PERMISSIONS['admin'], constants.USER_PERMISSIONS['master']):
      raise http_exceptions.NO_PERMISSION

    # Delete profile document
    deleted_profile = await ProfileRepository.delete_profile(db, profile_id=profile_id)

    # Remove deleted profile from devices and set device is_active to false
    clear_devices_profile_relationships = await DeviceRepository.remove_devices_profile(db, profileId=profile_id)

    return {'success': True, 'message': f'Profile removido.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise http_exceptions.INTERNAL_ERROR(detail=str(e))
