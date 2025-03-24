from typing import List

from pydantic import BaseModel, Field
from src.models.API.wireless.radio.vap.failover.Failover import Failover
from src.models.API.wireless.radio.vap.security.Security import Security


class Rate(BaseModel):
  legacy: str = Field(default='auto')
  maxLimit: int = Field(default=9)
  mcs: str = Field(default='auto')

class PPPoECircuitID(BaseModel):
  enabled: bool = Field(default=False)

class DHCP82(BaseModel):
  enabled: bool = Field(default=False)
  remotemode: str = Field(default='Radio')
  circuitmode: str = Field(default='datavlan')

class BSSID(BaseModel):
  value: str = Field(default='00:00:00:00:00:00')
  enabled: bool = Field(default=False)

class Egress(BaseModel):
  speed: int = Field(default=10)
  enabled: bool = Field(default=False)

class Ingress(Egress):
  pass

class TrafficControl(BaseModel):
  enabled: bool = Field(default=False)
  egress: Egress = Field(default=Egress())
  ingress: Ingress = Field(default=Ingress())

class FromURL(BaseModel):
  autoupdate: bool = Field(default=False)
  interval: int = Field(default=60)
  url: str = Field(default='')

class ACL(BaseModel):
  source: str = Field(default='manually')
  fromurl: FromURL = Field(default=FromURL())
  policy: str = Field(default='open')

class SSID2Vlan(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=10)

class Management(BaseModel):
  enabled: bool = Field(default=True)
  tagged: bool = Field(default=True)


class Vap(BaseModel):
  rate: Rate = Field(default=Rate())
  pppoecircuitid: PPPoECircuitID = Field(default=PPPoECircuitID())
  cwm: bool = Field(default=False)
  dhcp82: DHCP82 = Field(default=DHCP82())
  bssid: BSSID = Field(default=BSSID())
  maxclients: int = Field(default=128)
  trafficcontrol: TrafficControl = Field(default=TrafficControl())
  l2isolation: bool = Field(default=False)
  security: Security = Field(default=Security())
  preamble: str = Field(default='short')
  wds: bool = Field(default=True)
  ssid: str = Field(default='IBS AC')
  acl: ACL = Field(default=ACL())
  failover: Failover = Field(default=Failover())
  minsignal: int = Field(default=-90)
  hidden: bool = Field(default=False)
  mcastenhance: bool = Field(default=True)
  ifname: str = Field(default='ath0')
  multicastecho: bool = Field(default=True)
  shortgi: bool = Field(default=True)
  wmm: bool = Field(default=True)
  mode: str = Field(default='sta')
  ssid2vlan: SSID2Vlan = Field(default=SSID2Vlan())
  vapisolation: bool = Field(default=False)
  mfp: str = Field(default='optional')
  wmmpreferdscp: bool = Field(default=False)
  management: Management = Field(default=Management())
