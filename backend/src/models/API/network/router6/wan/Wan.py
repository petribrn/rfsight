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
  ip: str = Field(default='2001::1')
  prefix: int = Field(default=64)

class Static(BaseModel):
  vlan: Vlan = Field(default=Vlan())
  dns: DnsStatic = Field(default=DnsStatic())
  ip: List[IP] = Field(default=[IP()])
  gateway: str = Field(default='2001::1')

class PPPoE(BaseModel):
  username: str = Field(default='user')
  password: str = Field(default='pass')
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())
  vlan: Vlan = Field(default=Vlan())
  mtu: int = Field(default=1492)

class Dynamic(BaseModel):
  vlan: Vlan = Field(default=Vlan())
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())
  stateful: bool = Field(default=False)
  prefixdelegation: bool = Field(default=False)


class Wan(BaseModel):
  static: Static = Field(default=Static())
  pppoe: PPPoE = Field(default=PPPoE())
  dynamic: Dynamic = Field(default=Dynamic())
  mode: str = Field(default='dynamic')
