from typing import List

from pydantic import BaseModel, Field
from src.models.API.network.gre.tunnel.Tunnel import Tunnel


class GRE(BaseModel):
  tunnel: List[Tunnel] = Field(default=[Tunnel()])
  enabled: bool = Field(default=False)
