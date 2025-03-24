from typing import List

from pydantic import BaseModel, Field
from src.models.API.system.tacacs.server.TacacsServer import TacacsServer


class Tacacs(BaseModel):
  service: str = Field(default='ppp')
  servers: List[TacacsServer] = Field(default=[TacacsServer()])
