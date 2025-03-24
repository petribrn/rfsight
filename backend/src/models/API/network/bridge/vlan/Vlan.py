from pydantic import BaseModel, Field


class Eth0(BaseModel):
  enabled: bool = Field(default=True)

class Vlan(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=2)
  eth0: Eth0 = Field(default=Eth0())
