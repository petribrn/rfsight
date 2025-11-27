import ipaddress
from datetime import datetime
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from src.database.db import DB
from src.models.Device import Device, DeviceCollection, DeviceUpdate
from src.shared.utils import validate_id


class DeviceRepository:

  @classmethod
  async def list_devices(cls, db: DB):
    devices = await db.devices_collection.find().to_list(1000)
    return DeviceCollection(devices=devices)

  @classmethod
  async def list_devices_by_networks(cls, db: DB, networks: List[str]):
    devices = await db.devices_collection.find({'networkId': {'$in': networks}}).to_list(1000)
    return DeviceCollection(devices=devices)

  @classmethod
  async def list_devices_by_compound_filter(cls, db: DB, compound_filter: dict):
    devices = await db.devices_collection.find(compound_filter).to_list(1000)
    return DeviceCollection(devices=devices)

  @classmethod
  async def list_devices_by_filter(cls, db: DB, **filters):
    if all(x in filters.keys() for x in ['model', 'fw_version', 'location', 'networkId', 'profileId', 'createdAt', 'updatedAt']):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro de dispositivo')
    devices = await db.devices_collection.find(filters).to_list(1000)
    return DeviceCollection(devices=devices)

  @classmethod
  async def get_all_devices_from_list(cls, db: DB, list_of_devices: List[ObjectId]):
    devices = await db.devices_collection.find({'_id': {'$in': list_of_devices}}).to_list(1000)
    return DeviceCollection(devices=devices)

  @classmethod
  async def get_device_by(cls, db: DB, field: str, value):
    if field not in ('_id', 'name', 'mac_address', 'ip_address'):
      raise http_exceptions.INVALID_FIELD(field=f'campo de filtro {field} de dispositivo')
    if field == '_id':
      value = validate_id(target_id=value, id_field_name='valor de _id do dispositivo')
    device = await db.devices_collection.find_one({field: value})
    if not device:
      return None
    return Device(**device)

  @classmethod
  async def create_device(cls, db: DB, new_device_data: Device):
    name_already_taken = await db.devices_collection.find_one({'name': new_device_data.name})
    mac_address_already_taken = await db.devices_collection.find_one({'mac_address': new_device_data.mac_address})
    ip_address_already_taken = await db.devices_collection.find_one({'ip_address': new_device_data.ip_address})

    if name_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Nome do dispositivo')
    if mac_address_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Endereço MAC')
    if ip_address_already_taken:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Endereço IP')

    new_device_data.createdAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())
    new_device_data.updatedAt = new_device_data.createdAt

    device_to_db = await db.devices_collection.insert_one(new_device_data.model_dump(by_alias=True, exclude=['id']))

    return device_to_db.inserted_id

  @classmethod
  async def validate_new_device_info(cls, db: DB, existent_device: Device, new_device_data: DeviceUpdate,
                                     profile_update_needed: bool, network_update_needed: bool):

    # Create a copy from original device to be updated
    validated_new_device = existent_device.model_copy()

    # CHECK NEW MAC
    if new_device_data.mac_address and existent_device.mac_address != new_device_data.mac_address:
      new_mac_address_already_taken = await cls.get_device_by(db, field="mac_address", value=new_device_data.mac_address)
      if new_mac_address_already_taken:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Endereço MAC')
      validated_new_device.mac_address = new_device_data.mac_address

    # CHECK NEW IP
    if new_device_data.ip_address and existent_device.ip_address != new_device_data.ip_address:
      new_ip_address_already_taken = await cls.get_device_by(db, field="ip_address", value=new_device_data.ip_address)
      if new_ip_address_already_taken:
        raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Endereço IP')
      validated_new_device.ip_address = new_device_data.ip_address

    # CHECK NEW USER
    if new_device_data.user and existent_device.user != new_device_data.user:
      validated_new_device.user = new_device_data.user

    # CHECK NEW PASSWORD
    if new_device_data.password and existent_device.password != new_device_data.password:
      validated_new_device.password = new_device_data.password

    # CHECK NETWORK UPDATE NEEDED
    if network_update_needed:
      validated_new_device.networkId = new_device_data.networkId

    if profile_update_needed:
      validated_new_device.profileId = new_device_data.profileId

    return validated_new_device

  @classmethod
  async def edit_device_by_id(cls, db: DB, device_id: ObjectId, new_device_data: Device):

    new_device_data.updatedAt = datetime.fromisoformat(datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat())

    stored_new_device_data = await db.devices_collection.find_one_and_update({'_id': device_id},
                                                                             {'$set': new_device_data.model_dump(by_alias=True, exclude=['id'])},
                                                                             return_document=True)

    return Device(**stored_new_device_data)

  @classmethod
  async def update_device_ip(cls, db: DB, device_id: ObjectId, new_ip_address: str) -> Device:
    # Validate device ID and find the device
    device = await cls.get_device_by(db, field="_id", value=device_id)
    if not device:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')

    # If same IP, nothing to update
    if device.ip_address == new_ip_address:
      return device

    try:
      valid_new_ip_address = ipaddress.ip_address(new_ip_address)
    except ValueError:
      raise http_exceptions.INVALID_FIELD(field='new ip_address')

    # Check if new IP address already exists in another device
    ip_conflict = await cls.get_device_by(db, field="ip_address", value=valid_new_ip_address)
    if ip_conflict:
      raise http_exceptions.UNIQUE_FIELD_DATA_ALREADY_EXISTS(field='Endereço IP')

    # Apply update
    updated_at = datetime.fromisoformat(
      datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat()
    )

    update_data = {
      "ip_address": valid_new_ip_address,
      "updatedAt": updated_at
    }

    stored_new_device_data = await db.devices_collection.find_one_and_update(
      {"_id": validate_id(device_id, "device_id")},
      {"$set": update_data},
      return_document=True
    )

    return Device(**stored_new_device_data)

  @classmethod
  async def remove_devices_network(cls, db: DB, network_id: ObjectId, devices: List[ObjectId] = None):
    db_filter = {}
    if devices:
      db_filter.update({'_id': {'$in': devices}})
    else:
      db_filter.update({'networkId': str(network_id)})

    removed_devices_network = await db.devices_collection.update_many(db_filter, {'$set': {'networkId': None}})
    return removed_devices_network.acknowledged

  @classmethod
  async def remove_devices_profile(cls, db: DB, profileId: ObjectId, devices: List[ObjectId] = None):
    db_filter = {}
    if devices:
      db_filter.update({'_id': {'$in': devices}})
    else:
      db_filter.update({'profileId': str(profileId)})

    removed_devices_profile = await db.profiles_collection.update_many(db_filter, {'$set': {'profileId': None, 'is_active': False}})
    return removed_devices_profile.acknowledged

  @classmethod
  async def remove_all_network_devices(cls, db: DB, network_id: ObjectId):
    devices_from_network = await db.devices_collection.find({'networkId': str(network_id)}).to_list(1000)
    if not devices_from_network:
      return True, []
    removed_network_devices = await db.devices_collection.delete_many({'networkId': str(network_id)})
    return removed_network_devices.acknowledged, [x['_id'] for x in devices_from_network]

  @classmethod
  async def delete_device(cls, db: DB, device_id: ObjectId):
    # Check if device exists and delete it
    deleted_device = await db.devices_collection.find_one_and_delete({"_id": device_id})
    if not deleted_device:
      raise http_exceptions.DOCUMENT_INEXISTENT(document='dispositivo')
    return Device(**deleted_device)
