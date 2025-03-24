from typing import List, Literal

from pydantic import BaseModel, Field
from src.models.API.wireless.radio.vap.Vap import Vap

# --------- INNER RADIO FIELDS ---------

class Rts(BaseModel):
  size: int = Field(default=2346)
  enabled: bool = Field(default=False)

class Channel(BaseModel):
  extension: str = Field('upper')
  select: Literal['all', 'list'] = Field(default='all') # if list --> a new parameter is added: list: List[int] = Field(default=[0])
  list_: List[int] | None = Field(default=None, alias='list')
  width: int = Field(default=80)
  offset: int = Field(default=0)
  autowidth: bool = Field(default=False)
  bgautochannel: bool = Field(default=False)

class WjetPolling(BaseModel):
  mbps: float = Field(default=0.8)
  interval: int = Field(default=10)
  pps: int = Field(default=900)
  count: int = Field(default=10)

class Wjet(BaseModel):
  enabled: bool = Field(default=True)
  version: str = Field(default='auto')
  polling: List[WjetPolling] = Field(default=[
    WjetPolling(),
    WjetPolling(mbps=0.6, interval=5, pps=700, count=20),
    WjetPolling(mbps=0.5, interval=1, pps=600, count=30),
    WjetPolling(mbps=0.1, interval=10, pps=200, count=40)
  ])

class Fragmentation(BaseModel):
  size: int = Field(default=256)
  enabled: bool = Field(default=False)

# --------- INNER RADIO FIELDS ---------

class Radio(BaseModel):
  vap: List[Vap] = Field(default=[Vap()])
  acktimeout: int = Field(default=100)
  ifname: str = Field(default='wifi0')
  rts: Rts = Field(default=Rts())
  atpcperiod: int = Field(default=1000)
  txpower: int = Field(default=29)
  channel: Channel = Field(default=Channel())
  missedbeaconlimit: int = Field(default=2)
  amsdu: bool = Field(default=True)
  enabled: bool = Field(default=True)
  bawinsize: int = Field(default=64)
  atpctarget: int = Field(default=-44)
  wjet: Wjet = Field(default=Wjet())
  fragmentation: Fragmentation = Field(default=Fragmentation())
  atpc: bool = Field(default=True)
  ieeemode: str = Field(default='anac')
  antennagain: int = Field(default=0)
  dfs: bool = Field(default=False)
