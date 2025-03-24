from pydantic import BaseModel, Field


class IP(BaseModel):
  ip: str = Field(default='10.0.0.1')
  prefix: int = Field(default=24)


class Lan(BaseModel):
  ip: IP = Field(default=IP())
