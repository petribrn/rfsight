from pydantic import BaseModel, Field


class SNMP(BaseModel):
  enabled: bool = Field(default=False)
  rouser: str = Field(default='public')
  ropassword: str = Field(default='password')
  authalgorithm: str = Field(default='MD5')
  version: str = Field(default='1')
  privpassword: str = Field(default='adminadmin')
  authpassword: str = Field(default='adminadmin')
  rocommunity: str = Field(default='public')
  authuser: str = Field(default='private')
  privalgorithm: str = Field(default='DES')
  securitylevel: str = Field(default='authPriv')
