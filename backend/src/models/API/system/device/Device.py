from pydantic import BaseModel, Field
from src.models.API.system.device.coordinate.Coordinate import Coordinate


class Device(BaseModel):
  contact: str = Field(default='Contact')
  locale: str = Field(default='pt_BR')
  firmwareid: str = Field(default='APCPE.QA-3')
  name: str = Field(default='CPE')
  location: str = Field(default='Device location')
  coordinate: Coordinate = Field(default=Coordinate())
