from pydantic import BaseModel, Field
from src.models.API.andromeda.Andromeda import Andromeda
from src.models.API.network.Network import Network
from src.models.API.services.Services import Services
from src.models.API.system.System import System
from src.models.API.wireless.Wireless import Wireless


class DeviceConfiguration(BaseModel):
  wireless: Wireless = Field(default=Wireless())
  services: Services = Field(default=Services())
  network: Network = Field(default=Network())
  system: System = Field(default=System())
  andromeda: Andromeda = Field(default=Andromeda())

class ConfigurationUpdate(BaseModel):
  target: str = Field(default='save')
  config: DeviceConfiguration = Field(default=DeviceConfiguration())
