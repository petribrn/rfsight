from datetime import datetime
from typing import List, Optional

import pytz
from pydantic import BaseModel, BeforeValidator, Field, field_validator
from pydantic_core import PydanticCustomError
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class Organization(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  name: str = Field(min_length=3)
  users: List[PyObjectId] = []
  networks: List[PyObjectId] = []
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('createdAt', 'updatedAt')
  @classmethod
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

class OrganizationCollection(BaseModel):
  organizations: List[Organization]

class OrganizationUpdate(BaseModel):
  name: Optional[str]

  @field_validator('name')
  @classmethod
  def validate_name(cls, value):
    value = str(value)
    if len(value) < 3:
      raise PydanticCustomError(
        'invalid_name_error',
        'O nome da organização deve ter no mínimo 3 caracteres.',
        {'name': value},
      )
    return value
