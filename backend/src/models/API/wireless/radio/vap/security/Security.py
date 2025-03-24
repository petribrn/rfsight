from typing import List

from pydantic import BaseModel, Field


class Das(BaseModel):
  port: int = Field(default=3799)
  clientip: str = Field(default='0.0.0.0')
  secret: str = Field(default='')
  enabled: bool = Field(default=False)

class Server(BaseModel):
  port: int = Field(default=1813)
  secret: str = Field(default='')
  address: str = Field(default='0.0.0.0')

class Accounting(BaseModel):
  servers: List[Server] = Field(default=[Server()])
  enabled: bool = Field(default=True)

class Authentication(BaseModel):
  servers: List[Server] = Field(default=[Server(port=1812)])
  eap: str = Field(default='ttls')
  password: str = Field(default='')
  hmacsha1key: str = Field(default='')
  identity: str = Field(default='')
  credentials: str = Field(default='user')

class WPAEnterprise(BaseModel):
  das: Das = Field(default=Das())
  accounting: Accounting = Field(default=Accounting())
  wpa2only: bool = Field(default=False)
  nasid: str = Field(default='')
  authentication: Authentication = Field(default=Authentication())

class WPAPSK(BaseModel):
  wpa2only: bool = Field(default=False)
  passphrase: str = Field(default='')

class WEP(BaseModel):
  index: int = Field(default=1)
  length: int = Field(default=128)
  key: str = Field(default='')

class Security(BaseModel):
  wpaenterprise: WPAEnterprise = Field(default=WPAEnterprise())
  wpapsk: WPAPSK = Field(default=WPAPSK())
  wep: WEP = Field(default=WEP())
  mode: str = Field(default='wpapsk')
