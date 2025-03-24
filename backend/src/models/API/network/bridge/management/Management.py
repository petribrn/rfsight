from typing import List

from pydantic import BaseModel, Field


class DnsStatic(BaseModel):
  servers: List[str] = Field(default=['',''])

class DnsWithEnabledField(DnsStatic):
  enabled: bool = Field(default=False)

class IP(BaseModel):
  ip: str = Field(default='10.0.0.1')
  prefix: int = Field(default=24)

class Static(BaseModel):
  ip: List[IP] = Field(default=[IP()])
  dns: DnsStatic = Field(default=DnsStatic())
  gateway: str = Field(default='10.0.0.253')

class Dynamic(BaseModel):
  ip: List[IP] = Field(default=[IP()])
  dns: DnsWithEnabledField = Field(default=DnsWithEnabledField())
  fallback: bool = Field(default=True)
  gateway: str = Field(default='10.0.0.253')

class Secondary(BaseModel):
  enabled: bool = Field(default=True)
  ip: IP = Field(default=IP(ip='10.0.0.2'))


class Management(BaseModel):
  static: Static = Field(default=Static())
  dynamic: Dynamic = Field(default=Dynamic())
  mode: str = Field(default='static')
  secondary: Secondary = Field(default=Secondary())
