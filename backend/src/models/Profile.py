from datetime import datetime
from email.policy import default
from typing import Annotated, Any, Dict, List, Literal, Optional

import pytz
from pydantic import BaseModel, BeforeValidator, Field, field_validator
from pydantic_core import PydanticCustomError
from src.models.StationTable import StationTableModel

PyObjectId = Annotated[str, BeforeValidator(str)]

class HttpDetails(BaseModel):
  port: Optional[int] = Field(default=80)
  method: Literal['GET', 'PATCH', 'PUT', 'POST', 'DELETE'] = Field(default=None)
  successStatusCode: int = Field(default=200)
  path: str = Field(default=None)
  queryParameters: Optional[Dict[str, (str | int | float | bool)]] = Field(default=None)
  payloadType: Optional[Literal['file', 'text/plain', 'text/json']] = Field(default=None)
  payloadTemplate: Optional[Any] = Field(default=None)
  responseType: Literal['text/plain', 'text/json', 'boolean', 'blank'] = Field(default=None)
  responseMapping: Optional[Dict[str, str]] = Field(default=None)
  responseHeaderMapping: Optional[Dict[str, str]] = Field(default=None)

  @field_validator('method')
  @classmethod
  def validate_method(cls, value):
    value = str(value).upper()
    if value not in ['GET', 'PATCH', 'PUT', 'POST', 'DELETE']:
      raise PydanticCustomError(
        'invalid_method_error',
        'O método http é inválido.',
        {'method': value},
      )
    return value

class SshDetails(BaseModel):
  port: int = Field(default=22)
  command: str = Field(default=None)

class Action(BaseModel):
  actionType: Literal['monitor', 'manage', 'auth'] = Field(default=None)
  protocol: Literal['http', 'ssh'] = Field(default=None)
  sshDetails: Optional[SshDetails] = Field(default=None)
  httpDetails: Optional[HttpDetails] = Field(default=None)

class Profile(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  name: str = Field(default=None)
  stationTable: StationTableModel = Field(default=None)
  apiBaseUrl: str = Field(default=None)
  actions: Dict[str, Action] = Field(default=None)
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('name')
  @classmethod
  def validate_name(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_name_error',
        'O nome de profile deve ter no mínimo 3 caracteres.',
        {'name': value},
      )
    return value

  @field_validator('createdAt', 'updatedAt')
  @classmethod
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

class ProfileUpdate(BaseModel):
  name: Optional[str] = Field(default=None)
  stationTable: Optional[StationTableModel] = Field(default=None)
  apiBaseUrl: Optional[str] = Field(default=None)
  actions: Optional[Dict[str, Action]] = Field(default=None)

  @field_validator('name')
  @classmethod
  def validate_name(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_name_error',
        'O nome de profile deve ter no mínimo 3 caracteres.',
        {'name': value},
      )
    return value

class ProfileCollection(BaseModel):
  profiles: List[Profile]
