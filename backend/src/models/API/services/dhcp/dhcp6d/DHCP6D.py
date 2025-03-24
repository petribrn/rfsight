from pydantic import BaseModel, Field
from src.models.API.services.dhcp.shared.DHCPPool import DHCPPool


class DHCP6D(BaseModel):
  stateful: bool = Field(default=False)
  leasetime: int = Field(default=86400)
  enabled: bool = Field(default=True)
  prefix: int = Field(default=64)
  pool: DHCPPool = Field(default=DHCPPool())
  gateway: str = Field(default='2000::1')
