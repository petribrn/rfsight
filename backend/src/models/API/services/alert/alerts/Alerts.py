from typing import List

from pydantic import BaseModel, Field


class EtherStatus(BaseModel):
  trap: bool = Field(default=False)

class Host(BaseModel):
  ip: str = Field(default='')
  time: int = Field(default=1000)

class Ping(BaseModel):
  trap: bool = Field(default=False)
  hosts: List[Host] = Field(default=[Host()])

class Noise(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=-90)

class Reboot(BaseModel):
  trap: bool = Field(default=False)

class TxRetryPct(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=15)

class Uptime(BaseModel):
  trap: bool = Field(default=False)
  interval: int = Field(default=60)

class RSSI(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=60)

class RxDrop(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=1000)

class RadioStatus(BaseModel):
  trap: bool = Field(default=False)

class RxDropPct(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=15)

class TxRetry(BaseModel):
  trap: bool = Field(default=False)
  limit: int = Field(default=100)

class FreqChange(BaseModel):
  trap: bool = Field(default=False)

class Alerts(BaseModel):
  etherstatus: EtherStatus = Field(default=EtherStatus())
  ping: Ping = Field(default=Ping())
  noise: Noise = Field(default=Noise())
  reboot: Reboot = Field(default=Reboot())
  txretry_pct: TxRetryPct = Field(default=TxRetryPct())
  uptime: Uptime = Field(default=Uptime())
  rssi: RSSI = Field(default=RSSI())
  rxdrop: RxDrop = Field(default=RxDrop())
  radiostatus: RadioStatus = Field(default=RadioStatus())
  rxdrop_pct: RxDropPct = Field(default=RxDropPct())
  txretry: TxRetry = Field(default=TxRetry())
  freqchange: FreqChange = Field(default=FreqChange())
