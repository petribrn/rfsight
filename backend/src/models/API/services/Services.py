from pydantic import BaseModel, Field
from src.models.API.services.alert.Alert import Alert
from src.models.API.services.autoupdate.AutoUpdate import AutoUpdate
from src.models.API.services.dhcp.dhcp6d.DHCP6D import DHCP6D
from src.models.API.services.dhcp.dhcpd.DHCPD import DHCPD
from src.models.API.services.discovery.Discovery import Discovery
from src.models.API.services.http.HTTP import HTTP
from src.models.API.services.ledd.LedD import LedD
from src.models.API.services.ntp.NTP import NTP
from src.models.API.services.pingwatchdog.PingWatchDog import PingWatchDog
from src.models.API.services.pppoerelay.PPPoERelay import PPPoERelay
from src.models.API.services.qos.QOS import QOS
from src.models.API.services.resetd.ResetD import ResetD
from src.models.API.services.snmp.SNMP import SNMP
from src.models.API.services.ssh.SSH import SSH
from src.models.API.services.tc.TC import TC
from src.models.API.services.telnet.Telnet import Telnet
from src.models.API.services.wnms.WNMS import WNMS
from src.models.API.services.zapd.Zapd import Zapd


class Services(BaseModel):
  snmp: SNMP = Field(default=SNMP())
  pppoerelay: PPPoERelay = Field(default=PPPoERelay())
  ledd: LedD = Field(default=LedD())
  dhcp6d: DHCP6D = Field(default=DHCP6D())
  resetd: ResetD = Field(default=ResetD())
  autoupdate: AutoUpdate = Field(default=AutoUpdate())
  http: HTTP = Field(default=HTTP())
  wnms: WNMS = Field(default=WNMS())
  ssh: SSH = Field(default=SSH())
  pingwatchdog: PingWatchDog = Field(default=PingWatchDog())
  dhcpd: DHCPD = Field(default=DHCPD())
  discovery: Discovery = Field(default=Discovery())
  alert: Alert = Field(default=Alert())
  qos: QOS = Field(default=QOS())
  telnet: Telnet = Field(default=Telnet())
  zapd: Zapd = Field(default=Zapd())
  tc: TC = Field(default=TC())
  ntp: NTP = Field(default=NTP())
