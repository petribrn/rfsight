from pydantic import BaseModel, Field
from src.models.API.network.ethernet.eth0.eth0 import Eth0
from src.models.API.network.ethernet.eth1.eth1 import Eth1


class Ethernet(BaseModel):
  eth0: Eth0 = Field(default=Eth0())
  eth1: Eth1 = Field(default=Eth1())
