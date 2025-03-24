import ipaddress
import re
from datetime import datetime
from typing import List, Optional

import pytz
import src.configs.constants as constants
from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, Field, field_validator
from pydantic_core import PydanticCustomError
from src.models.API.andromeda.Andromeda import Andromeda
from src.models.API.network.Network import Network
from src.models.API.services.Services import Services
from src.models.API.system.System import System
from src.models.API.wireless.Wireless import Wireless
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class DeviceToAdopt(BaseModel):
  mac_address: Optional[str] = Field(min_length=12, default=None)
  ip_address: Optional[str] = Field(default=None)
  user: str = Field(default='admin')
  password: str = Field(default='admin')
  networkId: PyObjectId | None = Field(default=None)

  @field_validator('mac_address')
  def validate_mac_address(cls, value):
    if value is None:
      return value
    value = str(value).upper()

    if not re.match(constants.VALIDATE_MAC_REGEX, value):
      raise PydanticCustomError(
        'invalid_mac_address_error',
        'O endereço MAC do dispositivo é inválido.',
        {'mac_address': value},
      )

    return value.replace(':', '').replace('-', '')

  @field_validator('ip_address')
  def validate_ip_address(cls, value):
    if value is None:
      return value
    value = str(value)

    try:
      ip = ipaddress.ip_address(value)
      return ip.compressed
    except ValueError:
      raise PydanticCustomError(
        'invalid_ip_address_error',
        'O endereço IP do dispositivo é inválido.',
        {'ip_address': value},
      )

  @field_validator('networkId')
  def validate_networkId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_networkId_error',
        'O networkId do dispositivo é inválido.',
        {'networkId': value},
      )


class Device(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  name: str = Field(min_length=3)
  mac_address: str = Field(min_length=12)
  ip_address: str = Field(...)
  model: str = Field(min_length=3)
  user: str = Field(...)
  password: str = Field(...)
  fw_version: str = Field(min_length=1)
  location: str = Field(min_length=3)
  networkId: PyObjectId | None = Field(default=None)
  configId: PyObjectId | None = Field(default=None)
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('createdAt', 'updatedAt')
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

  @field_validator('mac_address')
  def validate_mac_address(cls, value):
    value = str(value).upper()

    if not re.match(constants.VALIDATE_MAC_REGEX, value):
      raise PydanticCustomError(
        'invalid_mac_address_error',
        'O endereço MAC do dispositivo é inválido.',
        {'mac_address': value},
      )

    return value.replace(':', '').replace('-', '')

  @field_validator('ip_address')
  def validate_ip_address(cls, value):
    value = str(value)

    try:
      ip = ipaddress.ip_address(value)
      return ip.compressed
    except ValueError:
      raise PydanticCustomError(
        'invalid_ip_address_error',
        'O endereço IP do dispositivo é inválido.',
        {'ip_address': value},
      )

  @field_validator('networkId')
  def validate_networkId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_networkId_error',
        'O networkId do dispositivo é inválido.',
        {'networkId': value},
      )

  @field_validator('configId')
  def validate_configId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_configId_error',
        'O configId do dispositivo é inválido.',
        {'configId': value},
      )

class DeviceCollection(BaseModel):
  devices: List[Device]

class DeviceUpdate(BaseModel):
  mac_address: Optional[str] = None
  ip_address: Optional[str] = Field(default=None)
  user: Optional[str] = Field(default=None)
  password: Optional[str] = Field(default=None)
  wireless_configs: Optional[Wireless] = None
  network_configs: Optional[Network] = None
  system_configs: Optional[System] = None
  services_configs: Optional[Services] = None
  andromeda_configs: Optional[Andromeda] = None
  networkId: Optional[PyObjectId] | None = ''


  @field_validator('mac_address')
  def validate_mac_address(cls, value):
    value = str(value).upper()

    if not re.match(constants.VALIDATE_MAC_REGEX, value):
      raise PydanticCustomError(
        'invalid_mac_address_error',
        'O endereço MAC do dispositivo é inválido.',
        {'mac_address': value},
      )

    return value.replace(':', '').replace('-', '')

  @field_validator('ip_address')
  def validate_ip_address(cls, value):
    value = str(value)

    try:
      ip = ipaddress.ip_address(value)
      return ip.compressed
    except ValueError:
      raise PydanticCustomError(
        'invalid_ip_address_error',
        'O endereço IP do dispositivo é inválido.',
        {'ip_address': value},
      )

  @field_validator('networkId')
  def validate_networkId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_networkId_error',
        'O networkId do dispositivo é inválido.',
        {'networkId': value},
      )
