from typing import List

from pydantic import BaseModel, Field


class Incoming(BaseModel):
  speed: int = Field(default=1024)
  burst: int = Field(default=50)
  limited: bool = Field(default=False)

class Outgoing(BaseModel):
  speed: int = Field(default=2048)
  burst: int = Field(default=59)
  limited: bool = Field(default=True)

class Profile(BaseModel):
  name: str = Field(default='Default')
  incoming: Incoming = Field(default=Incoming())
  outgoing: Outgoing = Field(default=Outgoing())

class Master(BaseModel):
  enabled: bool = Field(default=False)
  profiles: List[Profile] = Field(default=[Profile()])

class Managed(Master):
  pass


class TC(BaseModel):
  master: Master = Field(default=Master())
  managed: Managed = Field(default=Managed())
