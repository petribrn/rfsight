from datetime import datetime

from bson import ObjectId
from src.configs import constants
from src.database.db import DB
from src.models.Profile import Profile, ProfileCollection, ProfileUpdate
from src.shared import http_exceptions
from src.shared.utils import validate_id


class ProfileRepository:

  @classmethod
  async def list_profiles(cls, db: DB):
    profiles = await db.profiles_collection.find({}).to_list(1000)
    return ProfileCollection(profiles=profiles)

  @classmethod
  async def list_profiles_by_filter(cls, db: DB, **filters):
    if all(x in filters.keys() for x in ['_id', 'name']):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro de profile')
    profiles = await db.profiles_collection.find(filters).to_list(1000)
    for profile in profiles:
      profile['_id'] = str(profile['_id'])
    return profiles

  @classmethod
  async def get_all_profiles_as_map(cls, db: DB):
    profiles = await db.profiles_collection.find({}).to_list(1000)
    collection = ProfileCollection(profiles=profiles)
    mapping = {x.id: x for x in collection.profiles}
    return mapping

  @classmethod
  async def get_profile_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'name'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de profile')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id do profile')
    profile = await db.profiles_collection.find_one({field: value})
    if not profile:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='profile')
    return Profile(**profile)

  @classmethod
  async def create_profile(cls, db: DB, profile_data: Profile):
    name_already_taken = await db.profiles_collection.find_one({'name': profile_data.name})

    if name_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de profile')

    profile_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    profile_data.updatedAt = profile_data.createdAt

    inserted_profile = await db.profiles_collection.insert_one(profile_data.model_dump(by_alias=True, exclude=['id']))

    return inserted_profile.inserted_id

  @classmethod
  async def update_profile_by_id(cls, db: DB, profile_id: ObjectId, existent_profile: dict, profile_update_data: ProfileUpdate):
    # Check if new name is not already taken
    if profile_update_data.name is not None and profile_update_data.name != existent_profile['name']:
      new_name_already_taken = await db.profiles_collection.find_one({"name": profile_update_data.name})
      if new_name_already_taken:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de profile')

    updated_profile = Profile(**existent_profile)
    need_update = False

    if profile_update_data.name:
      updated_profile.name = profile_update_data.name
      need_update = True

    if profile_update_data.apiBaseUrl:
      updated_profile.apiBaseUrl = profile_update_data.apiBaseUrl
      need_update = True

    if profile_update_data.stationTable:
      updated_profile.stationTable = profile_update_data.stationTable
      need_update = True

    if profile_update_data.actions:
      updated_profile.actions = profile_update_data.actions
      need_update = True

    if not need_update:
      return Profile(**existent_profile)

    updated_profile.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    updated_profile_to_db = await db.profiles_collection.find_one_and_update({'_id': profile_id},
                                                                             {'$set': updated_profile.model_dump(by_alias=True, exclude=['id'])},
                                                                             return_document=True)

    return Profile(**updated_profile_to_db)

  @classmethod
  async def delete_profile(cls, db: DB, profile_id: ObjectId):
    # Check if profile exists and delete it
    deleted_profile = await db.profiles_collection.find_one_and_delete({"_id": profile_id})
    if not deleted_profile:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='profile')
    return Profile(**deleted_profile)
