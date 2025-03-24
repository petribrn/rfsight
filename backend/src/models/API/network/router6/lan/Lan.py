from pydantic import BaseModel, Field


class IP(BaseModel):
  ip: str = Field(default='2000::1')
  prefix: int = Field(default=64)


class Lan(BaseModel):
  ip: IP = Field(default=IP())
