from datetime import datetime
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from src.database.db import DB
from src.models.API.Configuration import DeviceConfiguration
from src.models.Configuration import Configuration, ConfigurationCollection
from src.shared.utils import validate_id


class ConfigurationRepository:
  @classmethod
  async def list_configurations(cls, db: DB):
    configurations = await db.configurations_collection.find().to_list(1000)
    return ConfigurationCollection(configurations=configurations)

  @classmethod
  async def list_configs_by_filter(cls, db: DB, **filters):
    if all(x in filters.keys() for x in ['_id', 'deviceId']):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro de config')
    configurations = await db.configurations_collection.find(filters).to_list(1000)
    return ConfigurationCollection(configurations=configurations)

  @classmethod
  async def get_configuration_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'deviceId'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de config')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id do config')
    configuration = await db.configurations_collection.find_one({field: value})
    if not configuration:
      return None
    return Configuration(**configuration)

  @classmethod
  async def create_configuration(cls, db: DB, new_configuration_data: Configuration):
    device_already_has_cfg = await db.configurations_collection.find_one({'deviceId': new_configuration_data.deviceId})

    if device_already_has_cfg:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='deviceId')

    new_configuration_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    new_configuration_data.updatedAt = new_configuration_data.createdAt

    configuration_to_db = await db.configurations_collection.insert_one(new_configuration_data.model_dump(by_alias=True, exclude=['id']))

    return configuration_to_db.inserted_id

  @classmethod
  async def edit_configuration_by_id(cls, db: DB, config_id: ObjectId, new_config: DeviceConfiguration):
    config_id = validate_id(target_id=config_id, id_field_name='configId')

    updated_config = Configuration(configs=new_config)

    updated_config.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    updated_config_to_db = await db.configurations_collection.find_one_and_update({'_id': config_id},
                                                                                  {'$set': updated_config.model_dump(by_alias=True,
                                                                                                                     exclude=['id', 'deviceId', 'createdAt'])},
                                                                                                                     return_document=True)

    return Configuration(**updated_config_to_db)

  @classmethod
  async def delete_config_by_device_id(cls, db: DB, device_id: ObjectId):
    device_id = validate_id(target_id=device_id, id_field_name='deviceId')
    # Check if config exists and delete it
    deleted_configuration = await db.configurations_collection.find_one_and_delete({"deviceId": device_id})
    if not deleted_configuration:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='configuração')
    return Configuration(**deleted_configuration)

  @classmethod
  async def delete_config_of_devices_list(cls, db: DB, devices_list: List[ObjectId]):
    devices_list_validated = [validate_id(target_id=x, id_field_name='deviceId') for x in devices_list]
    # Check if config exists and delete it
    deleted_configurations = await db.configurations_collection.delete_many({"deviceId": {'$in': devices_list_validated}})
    return deleted_configurations.acknowledged

  @classmethod
  async def delete_configuration_by_id(cls, db: DB, config_id: ObjectId):
    # Check if config exists and delete it
    deleted_configuration = await db.configurations_collection.find_one_and_delete({"_id": config_id})
    if not deleted_configuration:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='configuração')
    return Configuration(**deleted_configuration)
