from pydantic import BaseModel, Field
from src.models.API.system.log.forward.Forward import Forward


class Log(BaseModel):
  level: str = Field(default='debug')
  forward: Forward = Field(default=Forward())
