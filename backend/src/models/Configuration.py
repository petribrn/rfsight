import hashlib
import json
from datetime import datetime
from typing import List, Optional

import pytz
from pydantic import (BaseModel, BeforeValidator, Field, computed_field,
                      field_validator)
from src.models.API.Configuration import DeviceConfiguration
from src.shared.utils import hash_device_config
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]


class Configuration(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  deviceId: PyObjectId | None = Field(default=None)
  configs: DeviceConfiguration = Field(default=None)
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('createdAt', 'updatedAt')
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

  @computed_field
  @property
  def config_hash(self) -> str:
    cfg_hash = hash_device_config(self.configs)
    return cfg_hash


class ConfigurationUpdate(BaseModel):
  configs: DeviceConfiguration = Field(default=None)


class ConfigurationCollection(BaseModel):
  configurations: List[Configuration]
