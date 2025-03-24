from pydantic import BaseModel, Field


class Eth0(BaseModel):
  speed: int = Field(default=100)
  advertise: str = Field(default="auto")
  enabled: bool = Field(default=True)
  duplex: str = Field(default="full")
  autoneg: bool = Field(default=True)
