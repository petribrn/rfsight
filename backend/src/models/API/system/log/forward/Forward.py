from pydantic import BaseModel, Field
from src.models.API.system.log.logserver.LogServer import LogServer


class Forward(BaseModel):
  server1: LogServer = Field(default=LogServer())
  server2: LogServer = Field(default=LogServer())
  enabled: bool = Field(default=False)
