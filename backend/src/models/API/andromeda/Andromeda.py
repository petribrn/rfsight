from pydantic import BaseModel, Field


class Cloud(BaseModel):
  groupid: str = Field(default='')
  organization: str = Field(default='000000000000')
  host: str = Field(default='domain-or-ip')


class Andromeda(BaseModel):
  enabled: bool = Field(default=False)
  mode: str = Field(default='cloud')
  cloud: Cloud = Field(default=Cloud())
