from typing import List

from pydantic import BaseModel, Field
from src.models.API.wireless.radio.vap.failover.security.Security import \
  SecurityFailOver


class Recover(BaseModel):
  timeout: int = Field(default=720)
  enabled: bool = Field(default=True)

class BSSIDFailOver(BaseModel):
  value: str = Field(default='00:00:00:00:00:00')
  enabled: bool = Field(default=False)


class Failover(BaseModel):
  recover: Recover = Field(default=Recover())
  bssid: BSSIDFailOver = Field(default=BSSIDFailOver())
  security: SecurityFailOver = Field(default=SecurityFailOver())
  ssid: str = Field(default='failover-SSID')
  enabled: bool = Field(default=False)
