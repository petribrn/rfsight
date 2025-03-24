from datetime import datetime
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from pymongo import UpdateOne
from src.database.db import DB
from src.models.Network import Network, NetworkCollection, NetworkUpdate
from src.shared.utils import validate_id


class NetworkRepository:

  @classmethod
  async def list_networks(cls, db: DB):
    networks = await db.networks_collection.find().to_list(1000)
    return NetworkCollection(networks=networks)

  @classmethod
  async def list_networks_by_filter(cls, db: DB, **filters):
    if all(x in filters.keys() for x in ['network_type', 'location', 'organizationId', 'createdAt', 'updatedAt']):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro de redes')
    networks = await db.networks_collection.find(filters).to_list(1000)
    return NetworkCollection(networks=networks)

  @classmethod
  async def get_network_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'name'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de rede')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id da rede')
    network = await db.networks_collection.find_one({field: value})
    if not network:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')
    return Network(**network)

  @classmethod
  async def create_network(cls, db: DB, new_network_data: Network):
    name_already_taken = await db.networks_collection.find_one({"name": new_network_data.name})

    if name_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de rede')

    new_network_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    new_network_data.updatedAt = new_network_data.createdAt

    new_network = await db.networks_collection.insert_one(new_network_data.model_dump(by_alias=True, exclude=['id']))

    return new_network.inserted_id

  @classmethod
  async def edit_network_by_id(cls, db: DB, network_id: ObjectId, new_network_data: NetworkUpdate):

    # Check if network exists
    existent_network = await db.networks_collection.find_one({"_id": network_id}, {'_id': False})
    if not existent_network:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')

    # Check if new name is not already registered
    if new_network_data.name is not None and new_network_data.name != existent_network['name']:
      new_name_not_available = await db.networks_collection.find_one({"name": new_network_data.name})
      if new_name_not_available:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome de rede')

    new_network_data_dict = new_network_data.model_dump()
    network_to_be_edited = existent_network.copy()

    # Update only provided values that are different from the already existent ones
    for key, value in new_network_data_dict.items():
      if (value == '' and key == 'organizationId') or (value is None and key != 'organizationId') or network_to_be_edited[key] == value:
        continue
      network_to_be_edited[key] = value

    new_network = Network(**network_to_be_edited)
    new_network.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    updated_network = await db.networks_collection.find_one_and_update({"_id": network_id},
                                                                       {"$set": new_network.model_dump(by_alias=True, exclude=['id'])},
                                                                       return_document=True)

    return Network(**updated_network)

  @classmethod
  async def move_device_to_network(cls, db: DB, device_id: ObjectId, initial_network_id: str | None, target_network_id: str | None):
    device_id = validate_id(target_id=device_id, id_field_name='device_id')
    operations = []
    update_at_time = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    # If new_id and old_id are both None, update is not needed
    ids = [target_network_id, initial_network_id]
    if ids.count(None) == len(ids):
      return True

    # If both network ids are equal, check if device already in it, and if it's not, update operations with push coroutine
    if initial_network_id == target_network_id:
      target_network_id = validate_id(target_id=target_network_id, id_field_name='networkId da rede')
      net_existent = await db.networks_collection.find_one({'_id': target_network_id})
      if not net_existent:
        raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')
      device_already_in_net = await db.networks_collection.find_one({'_id': target_network_id},
                                                                       {'devices' : {'$in': [device_id]}})
      if device_already_in_net:
        return True
      else:
        operations.extend([
          UpdateOne({'_id': target_network_id}, {'$push': {'devices': device_id}}),
          UpdateOne({'_id': target_network_id}, {'$set': {'updatedAt': update_at_time}})
        ])
    else:
      # Check if initial_network_id is valid and if it exists, update operations list with its own related coroutines
      if initial_network_id is not None:
        initial_network_id = validate_id(target_id=initial_network_id, id_field_name='networkId da antiga rede')
        initial_net_existent = await db.networks_collection.find_one({'_id': initial_network_id})
        if initial_net_existent:
          operations.extend([UpdateOne({'_id': initial_network_id}, {'$pull': {'devices': {'$in': [device_id]}}}),
                             UpdateOne({'_id': initial_network_id}, {'$set': {'updatedAt': update_at_time}})])

      # Check if target_network_id is valid and if it exists, update operations list with its own related coroutines
      if target_network_id is not None:
        target_network_id = validate_id(target_id=target_network_id, id_field_name='networkId da rede')
        target_net_existent = await db.networks_collection.find_one({'_id': target_network_id})
        if not target_net_existent:
          raise http_exceptions.DOCUMENT_INEXISTENT(document='nova rede')
        operations.extend([
          UpdateOne({'_id': target_network_id}, {'$pull': {'devices': {'$in': [device_id]}}}),
          UpdateOne({'_id': target_network_id}, {'$push': {'devices': device_id}}),
          UpdateOne({'_id': target_network_id}, {'$set': {'updatedAt': update_at_time}})
        ])

    change_user_net_result = await db.networks_collection.bulk_write(operations)

    return change_user_net_result.acknowledged

  @classmethod
  async def remove_device_from_network(cls, db: DB, device_id: ObjectId, network_id: ObjectId):
    network_id = validate_id(target_id=network_id, id_field_name='networkId')

    network_existent = await db.networks_collection.find_one({'_id': network_id})
    if not network_existent:
      return True

    device_to_remove = await db.networks_collection.find_one({'_id': network_id, 'devices' : {'$in': [device_id]} })
    if not device_to_remove:
      return True

    removed_device = await db.networks_collection.update_one({'_id': network_id}, {'$pull': {'devices': {'$in': [device_id]}}})

    return removed_device.acknowledged

  @classmethod
  async def remove_networks_organization(cls, db: DB, organization_id: ObjectId, networks: List[ObjectId] = None):
    db_filter = {}
    if networks:
      db_filter.update({'_id': {'$in': networks}})
    else:
        db_filter.update({'organizationId': str(organization_id)})

    removed_networks_org = await db.networks_collection.update_many(db_filter, {'$set': {'organizationId': None}})
    return removed_networks_org.acknowledged

  @classmethod
  async def delete_network_by_id(cls, db: DB, network_id: ObjectId):
    # Check if network exists and delete it
    deleted_network = await db.networks_collection.find_one_and_delete({"_id": network_id})
    if not deleted_network:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')
    return Network(**deleted_network)
