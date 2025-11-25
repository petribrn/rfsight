from datetime import datetime

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from pymongo import UpdateOne
from src.database.db import DB
from src.models.Organization import (Organization, OrganizationCollection,
                                     OrganizationUpdate)
from src.shared.utils import validate_id


class OrganizationRepository:

  @classmethod
  async def list_organizations(cls, db: DB):
    organizations = await db.organizations_collection.find().to_list(1000)
    return OrganizationCollection(organizations=organizations)

  @classmethod
  async def get_organizations_by_ids(cls, db: DB, ids: list[str]):
    object_ids = [ObjectId(i) for i in ids if ObjectId.is_valid(i)]
    orgs = await db.organizations_collection.find(
        { "_id": { "$in": object_ids } }
    ).to_list(1000)

    return { str(o["_id"]): o for o in orgs }

  @classmethod
  async def get_organization_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'username', 'email'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de organização')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id da organização')
    organization = await db.organizations_collection.find_one({field: value})
    if not organization:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')
    return Organization(**organization)

  @classmethod
  async def create_organization(cls, db: DB, new_organization_data: Organization):
    name_already_taken = await db.organizations_collection.find_one({"name": new_organization_data.name})

    if name_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de organização')

    new_organization_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    new_organization_data.updatedAt = new_organization_data.createdAt

    new_organization = await db.organizations_collection.insert_one(new_organization_data.model_dump(by_alias=True, exclude=['id']))

    return new_organization.inserted_id

  @classmethod
  async def edit_organization_by_id(cls, db: DB, organization_id: ObjectId, new_organization_data: OrganizationUpdate):

    # Check if organization exists
    existent_organization = await db.organizations_collection.find_one({"_id": organization_id}, {'_id': False})
    if not existent_organization:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')

    # Check if new name is not already registered
    if new_organization_data.name is not None and new_organization_data.name != existent_organization['name']:
      new_name_not_available = await db.organizations_collection.find_one({"name": new_organization_data.name})
      if new_name_not_available:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de organização')

    new_organization_data_dict = new_organization_data.model_dump()
    organization_to_be_edited = existent_organization.copy()

    if new_organization_data_dict['name'] is not None and organization_to_be_edited['name'] != new_organization_data_dict['name']:
      organization_to_be_edited['name'] = new_organization_data_dict['name']

    new_organization = Organization(**organization_to_be_edited)
    new_organization.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    updated_organization = await db.organizations_collection.find_one_and_update({"_id": organization_id},
                                                                                 {"$set": new_organization.model_dump(by_alias=True, exclude=['id'])},
                                                                                 return_document=True)

    return Organization(**updated_organization)

  @classmethod
  async def move_item_to_organization(cls, db: DB, item_id: ObjectId, item_list: str, initial_organization_id: str | None, target_organization_id: str | None):
    item_id = validate_id(target_id=item_id, id_field_name='item_id')
    if item_list not in ('users', 'networks'):
      raise http_exceptions.INVALID_FIELD('item_list')
    operations = []
    update_at_time = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    # If new_id and old_id are both None, update is not needed
    ids = [target_organization_id, initial_organization_id]
    if ids.count(None) == len(ids):
      return True

    # If both organization ids are equal, check if user already in it, and if it's not, update operations with push coroutine
    if initial_organization_id == target_organization_id:
      target_organization_id = validate_id(target_id=target_organization_id, id_field_name='organizationId da organização')
      org_existent = await db.organizations_collection.find_one({'_id': target_organization_id})
      if not org_existent:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')
      user_already_in_org = await db.organizations_collection.find_one({'_id': target_organization_id},
                                                                       {item_list: {'$in': [item_id]}})
      if user_already_in_org:
        return True
      else:
        operations.extend([
          UpdateOne({'_id': target_organization_id}, {'$push': {item_list: item_id}}),
          UpdateOne({'_id': target_organization_id}, {'$set': {'updatedAt': update_at_time}})
        ])
    else:
      # Check if initial_organization_id is valid and if it exists, update operations list with its own related coroutines
      if initial_organization_id is not None:
        initial_organization_id = validate_id(target_id=initial_organization_id, id_field_name='organizationId da antiga organização')
        initial_org_existent = await db.organizations_collection.find_one({'_id': initial_organization_id})
        if initial_org_existent:
          operations.extend([UpdateOne({'_id': initial_organization_id}, {'$pull': {item_list: {'$in': [item_id]}}}),
                             UpdateOne({'_id': initial_organization_id}, {'$set': {'updatedAt': update_at_time}})])

      # Check if target_organization_id is valid and if it exists, update operations list with its own related coroutines
      if target_organization_id is not None:
        target_organization_id = validate_id(target_id=target_organization_id, id_field_name='organizationId da organização')
        target_org_existent = await db.organizations_collection.find_one({'_id': target_organization_id})
        if not target_org_existent:
          raise http_exceptions.DOCUMENT_INEXISTENT(document='nova organização')
        operations.extend([
          UpdateOne({'_id': target_organization_id}, {'$pull': {item_list: {'$in': [item_id]}}}),
          UpdateOne({'_id': target_organization_id}, {'$push': {item_list: item_id}}),
          UpdateOne({'_id': target_organization_id}, {'$set': {'updatedAt': update_at_time}})
        ])

    change_user_org_result = await db.organizations_collection.bulk_write(operations)

    return change_user_org_result.acknowledged

  @classmethod
  async def remove_item_from_organization(cls, db: DB, item_id: ObjectId, item_list: str, organization_id: ObjectId):
    organization_id = validate_id(target_id=organization_id, id_field_name='organizationId')

    org_existent = await db.organizations_collection.find_one({'_id': organization_id})
    if not org_existent:
      return True

    user_to_remove = await db.organizations_collection.find_one({'_id': organization_id, item_list: {'$in': [item_id]} })
    if not user_to_remove:
      return True

    removed_user = await db.organizations_collection.update_one({'_id': organization_id}, {'$pull': {item_list: {'$in': [item_id]}}})

    return removed_user.acknowledged

  @classmethod
  async def delete_organization_by_id(cls, db: DB, organization_id: ObjectId):
    # Check if organization exists and delete it
    deleted_organization = await db.organizations_collection.find_one_and_delete({"_id": organization_id})
    if not deleted_organization:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='organização')
    return Organization(**deleted_organization)
