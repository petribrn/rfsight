from typing import List

from pydantic import BaseModel, Field


class DnsStatic(BaseModel):
  servers: List[str] = Field(default=['',''])

class DnsWithEnabledField(DnsStatic):
  enabled: bool = Field(default=False)

class IP(BaseModel):
  ip: str = Field(default='2000::1')
  prefix: int = Field(default=64)

class Static(BaseModel):
  ip: List[IP] = Field(default=[IP()])
  dns: DnsStatic = Field(default=DnsStatic())
  gateway: str = Field(default='2000::1')

class Dynamic(BaseModel):
  stateful: bool = Field(default=False)
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())


class Management6(BaseModel):
  static: Static = Field(default=Static())
  dynamic: Dynamic = Field(default=Dynamic())
  mode: str = Field(default='dynamic')
