from pydantic import BaseModel, Field


class IP(BaseModel):
  ip: str = Field(default='10.0.0.2')
  prefix: int = Field(default=24)


class Secondary(BaseModel):
  enabled: bool = Field(default=False)
  ip: IP = Field(default=IP())
