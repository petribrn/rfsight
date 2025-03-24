from typing import List

from pydantic import BaseModel, Field
from src.models.API.network.router.dmz.DMZ import DMZ
from src.models.API.network.router.lan.Lan import Lan
from src.models.API.network.router.secondary.Secondary import Secondary
from src.models.API.network.router.wan.Wan import Wan


class Router(BaseModel):
  routes: List = Field(default=[])
  dmz: DMZ = Field(default=DMZ())
  portforward: List = Field(default=[])
  wan: Wan = Field(default=Wan())
  lan: Lan = Field(default=Lan())
  secondary: Secondary = Field(default=Secondary())
