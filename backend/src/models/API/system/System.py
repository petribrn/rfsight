from typing import List

from pydantic import BaseModel, Field
from src.models.API.system.authorization.Authorization import Authorization
from src.models.API.system.date.Date import Date
from src.models.API.system.device.Device import Device
from src.models.API.system.log.Log import Log
from src.models.API.system.poe.PoE import PoE
from src.models.API.system.publicstatus.PublicStatus import PublicStatus
from src.models.API.system.simplemode.SimpleMode import SimpleMode
from src.models.API.system.tacacs.Tacacs import Tacacs
from src.models.API.system.user.User import User


class System(BaseModel):
  simplemode: SimpleMode = Field(default=SimpleMode())
  publicstatus: PublicStatus = Field(default=PublicStatus())
  authorization: Authorization = Field(default=Authorization())
  poe: PoE = Field(default=PoE())
  tacacs: Tacacs = Field(default=Tacacs())
  users: List[User] = Field(default=[User()])
  log: Log = Field(default=Log())
  device: Device = Field(default=Device())
  date: Date = Field(default=Date())
