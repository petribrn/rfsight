from typing import List

from pydantic import BaseModel, Field


class Vlan(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=2)

class DnsStatic(BaseModel):
  servers: List[str] = Field(default=['',''])

class DnsWithEnabledField(DnsStatic):
  enabled: bool = Field(default=False)

class IP(BaseModel):
  ip: str = Field(default='192.168.3.66')
  prefix: int = Field(default=24)

class Static(BaseModel):
  vlan: Vlan = Field(default=Vlan())
  dns: DnsStatic = Field(default=DnsStatic())
  ip: List[IP] = Field(default=[IP()])
  gateway: str = Field(default='192.168.3.1')

class PPPoE(BaseModel):
  servicename: str = Field(default='')
  username: str = Field(default='')
  vlan: Vlan = Field(default=Vlan())
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())
  password: str = Field(default='')
  mtu: int = Field(default=1492)

class Dynamic(BaseModel):
  fallback: bool = Field(default=True)
  ip: List[IP] = Field(default=[IP()])
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())
  vlan: Vlan = Field(default=Vlan())
  gateway: str = Field(default='192.168.3.1')

class Wan(BaseModel):
  static: Static = Field(default=Static())
  pppoe: PPPoE = Field(default=PPPoE())
  dynamic: Dynamic = Field(default=Dynamic())
  mode: str = Field(default='dynamic')
