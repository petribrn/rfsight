from pydantic import BaseModel, Field


class AuthenticationFailOver(BaseModel):
  eap: str = Field(default='ttls')
  password: str = Field(default='')
  hmacsha1key: str = Field(default='')
  identity: str = Field(default='')
  credentials: str = Field(default='user')

class WPAEnterpriseFailOver(BaseModel):
  authentication: AuthenticationFailOver = Field(default=AuthenticationFailOver())
  wpa2only: bool = Field(default=False)

class WPAPSKFailOver(BaseModel):
  wpa2only: bool = Field(default=False)
  passphrase: str = Field(default='')

class WEPFailOver(BaseModel):
  index: int = Field(default=1)
  length: int = Field(default=128)
  key: str = Field(default='')

class SecurityFailOver(BaseModel):
  wpaenterprise: WPAEnterpriseFailOver = Field(default=WPAEnterpriseFailOver())
  wpapsk: WPAPSKFailOver = Field(default=WPAPSKFailOver())
  wep: WEPFailOver = Field(default=WEPFailOver())
  mode: str = Field(default='open')
