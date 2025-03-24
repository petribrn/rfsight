from pydantic import BaseModel, Field
from src.models.API.services.alert.alerts.Alerts import Alerts


class SNMPAlert(BaseModel):
  manager: str = Field(default='192.168.1.254')
  timeout: int = Field(default=5)
  port: int = Field(default=162)
  community: str = Field(default='public')
  inform: bool = Field(default=False)
  retry: int = Field(default=5)

class Andromeda(BaseModel):
  enabled: bool = Field(default=False)


class Alert(BaseModel):
  snmp: SNMPAlert = Field(default=SNMPAlert())
  enabled: bool = Field(default=False)
  interval: int = Field(default=10)
  alerts: Alerts = Field(default=Alerts())
  andromeda: Andromeda = Field(default=Andromeda())
