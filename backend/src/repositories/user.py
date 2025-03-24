from datetime import datetime
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from src.database.db import DB
from src.models.User import User, UserInDB, UserUpdate
from src.shared.utils import hash_passwd, validate_id


class UserRepository:

  password_exclude_filter = {"password": False}

  @classmethod
  async def list_users(cls, db: DB):
    users = await db.user_collection.find({}, cls.password_exclude_filter).to_list(1000)
    for user in users:
      user['_id'] = str(user['_id'])
    return {"users": users}

  @classmethod
  async def list_users_by_filter(cls, db: DB, **filters):
    if all(x in filters.keys() for x in ['permission', 'organizationId', 'createdAt', 'updatedAt']):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro de usuário')
    users = await db.user_collection.find(filters, cls.password_exclude_filter).to_list(1000)
    for user in users:
      user['_id'] = str(user['_id'])
    return users

  @classmethod
  async def get_user_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'username', 'email'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de usuário')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id do usuário')
    user = await db.user_collection.find_one({field: value})
    if not user:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')
    return User(**user)

  @classmethod
  async def create_user(cls, db: DB, user_data: User):
    username_already_taken = await db.user_collection.find_one({'username': user_data.username})
    email_already_taken = await db.user_collection.find_one({'email': user_data.email})

    if username_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de usuário')
    if email_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='E-mail')

    hashed_password = hash_passwd(user_data.password)

    user_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    user_data.updatedAt = user_data.createdAt

    new_user = UserInDB(**user_data.model_dump())
    new_user.password = str(hashed_password)

    user_to_db = await db.user_collection.insert_one(new_user.model_dump(by_alias=True, exclude=['id']))

    return user_to_db.inserted_id

  @classmethod
  async def edit_user_by_id(cls, db: DB, user_id: ObjectId, existent_user: dict, user_update_data: UserUpdate):
    # Check if new username is not already taken
    if user_update_data.username is not None and user_update_data.username != existent_user['username']:
      new_username_already_taken = await db.user_collection.find_one({"username": user_update_data.username})
      if new_username_already_taken:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de usuário')
    # Check if new email is not already taken
    if user_update_data.email is not None and user_update_data.email != existent_user['email']:
      new_email_already_taken = await db.user_collection.find_one({"email": user_update_data.email})
      if new_email_already_taken:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='E-mail')

    user_update_data_dict = user_update_data.model_dump()
    user_to_be_edited = existent_user.copy()

    # Update only provided values that are different from the already existent ones
    for key, value in user_update_data_dict.items():
      if (value == '' and key == 'organizationId') or (value is None and key != 'organizationId') or user_to_be_edited[key] == value:
        continue
      user_to_be_edited[key] = value

    updated_user = User(**user_to_be_edited)

    updated_user.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    updated_user_to_db = await db.user_collection.find_one_and_update({'_id': user_id},
                                                                      {'$set': updated_user.model_dump(by_alias=True, exclude=['id'])},
                                                                      return_document=True)

    return User(**updated_user_to_db)

  @classmethod
  async def update_user_password(cls, db: DB, user_id: ObjectId, new_user_password: str):
    user_id = validate_id(target_id=user_id, id_field_name='user_id')
    updated_at = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    hashed_password = hash_passwd(new_user_password)

    updated_user_to_db = await db.user_collection.find_one_and_update({'_id': user_id}, {'$set': {'password': hashed_password, 'updatedAt': updated_at}}, return_document=True)
    return User(**updated_user_to_db)

  @classmethod
  async def remove_users_organization(cls, db: DB, organization_id: ObjectId, users: List[ObjectId] = None):
    db_filter = {}
    if users:
      db_filter.update({'_id': {'$in': users}})
    else:
      db_filter.update({'organizationId': str(organization_id)})

    removed_users_org = await db.user_collection.update_many(db_filter, {'$set': {'organizationId': None}})
    return removed_users_org.acknowledged

  @classmethod
  async def delete_user(cls, db: DB, user_id: ObjectId):
    # Check if organization exists and delete it
    deleted_user = await db.user_collection.find_one_and_delete({"_id": user_id})
    if not deleted_user:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='usuário')
    return User(**deleted_user)
