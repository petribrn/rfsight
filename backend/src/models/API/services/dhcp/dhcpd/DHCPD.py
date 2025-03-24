from typing import List

from pydantic import BaseModel, Field
from src.models.API.services.dhcp.shared.DHCPPool import DHCPPool


class DHCPD(BaseModel):
  enabled: bool = Field(default=True)
  prefix: int = Field(default=24)
  staticleases: List = Field(default=[])
  leasetime: int = Field(default=86400)
  pool: DHCPPool = Field(default=DHCPPool(**{'to': '10.0.0.200', 'from': '10.0.0.101'}))
  gateway: str = Field(default='10.0.0.1')
