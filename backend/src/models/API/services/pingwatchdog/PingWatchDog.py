from pydantic import BaseModel, Field


class PingWatchDog(BaseModel):
  ip: str = Field(default='10.0.0.1')
  interval: int = Field(default=1)
  failcount: int = Field(default=2)
  enabled: bool = Field(default=False)
