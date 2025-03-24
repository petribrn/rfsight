from pydantic import BaseModel, Field


class Vlan(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=2)

class Tunnel(BaseModel):
  enabled: bool = Field(default=True)
  mode: str = Field(default='L2')
  tunnelip: str = Field(default='')
  interface: str = Field(default='gre1')
  localip: str = Field(default='')
  remoteip: str = Field(default='')
  vlan: Vlan = Field(default=Vlan())
  pmtudiscovery: bool = Field(default=False)
  mss: int = Field(default=1410)
  mtu: int = Field(default=1476)
