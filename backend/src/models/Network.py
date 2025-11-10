import ipaddress
import re
from datetime import datetime
from typing import List, Optional

import pytz
from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, Field, field_validator
from pydantic_core import PydanticCustomError
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class Network(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  name: str = Field(min_length=3)
  network_type: str = Field(min_length=3)
  network_cidr: str = Field(...)
  location: str = Field(min_length=3)
  devices: List[PyObjectId] = []
  organizationId: PyObjectId | None = Field(default=None)
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('createdAt', 'updatedAt')
  @classmethod
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

  @field_validator('organizationId')
  def validate_organizationId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_organizationId_error',
        'O organizationId do dispositivo é inválido.',
        {'networkId': value},
      )

  @field_validator('network_cidr')
  def validate_network_cidr(cls, value):
    if value is None:
      return value
    value = str(value)

    try:
      ip = ipaddress.ip_network(value, strict=False)
      return ip.compressed
    except ValueError:
      raise PydanticCustomError(
        'invalid_network_cidr_error',
        'CIDR da rede é inválido.',
        {'network_cidr': value},
      )

class NetworkCollection(BaseModel):
  networks: List[Network]

class NetworkUpdate(BaseModel):
  name: Optional[str] = None
  network_type: Optional[str] = None
  network_cidr: Optional[str] = None
  location: Optional[str] = None
  organizationId: Optional[PyObjectId] | None = ''

  @field_validator('name')
  @classmethod
  def validate_name(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_name_error',
        'O nome da rede deve ter no mínimo 3 caracteres.',
        {'name': value},
      )
    return value

  @field_validator('network_type')
  @classmethod
  def validate_network_type(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_network_type_error',
        'O tipo da rede deve ter no mínimo 3 caracteres.',
        {'network_type': value},
      )
    return value

  @field_validator('network_cidr')
  def validate_network_cidr(cls, value):
    if value is None:
      return value
    value = str(value)

    try:
      ip = ipaddress.ip_network(value, strict=False)
      return ip.compressed
    except ValueError:
      raise PydanticCustomError(
        'invalid_network_cidr_error',
        'CIDR da rede é inválido.',
        {'network_cidr': value},
      )

  @field_validator('location')
  @classmethod
  def validate_location(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_location_error',
        'A localização da rede deve ter no mínimo 3 caracteres.',
        {'location': value},
      )
    return value

  @field_validator('organizationId')
  def validate_organizationId(cls, value):
    if value in (None, ''):
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
        raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_organizationId_error',
        'O organizationId do dispositivo é inválido.',
        {'networkId': value},
      )
