from pydantic import BaseModel, Field
from src.models.API.network.bridge.Bridge import Bridge
from src.models.API.network.ethernet.Ethernet import Ethernet
from src.models.API.network.gre.GRE import GRE
from src.models.API.network.router6.Router6 import Router6
from src.models.API.network.router.Router import Router


class Network(BaseModel):
  gre: GRE = Field(default=GRE())
  router6: Router6 = Field(default=Router6())
  nat: bool = Field(default=True)
  bridge: Bridge = Field(default=Bridge())
  router: Router = Field(default=Router())
  ethernet: Ethernet = Field(default=Ethernet())
  topology: str = Field(default='bridge')
