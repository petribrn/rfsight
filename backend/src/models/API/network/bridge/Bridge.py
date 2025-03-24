from typing import List

from pydantic import BaseModel, Field
from src.models.API.network.bridge.management6.Management6 import Management6
from src.models.API.network.bridge.management.Management import Management
from src.models.API.network.bridge.vlan.Vlan import Vlan
from src.models.API.network.bridge.vlantermination.VlanTermination import \
  VlanTermination


class Bridge(BaseModel):
  management: Management = Field(default=Management())
  vlantermination: VlanTermination = Field(default=VlanTermination())
  vlan: Vlan = Field(default=Vlan())
  stp: bool = Field(default=False)
  ipv6: bool = Field(default=False)
  management6: Management6 = Field(default=Management6())
