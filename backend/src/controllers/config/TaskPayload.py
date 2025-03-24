from typing import Literal, Optional

from pydantic import BaseModel, Field
from src.models.API.Configuration import ConfigurationUpdate
from src.models.Device import Device


class TaskPayload(BaseModel):
  method: Literal['get', 'post'] = Field(default='get')
  device_info: Device = Field(...)
  data: Optional[ConfigurationUpdate] = Field(default=None)
