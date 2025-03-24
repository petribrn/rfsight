from pydantic import BaseModel, Field


class TacacsServer(BaseModel):
  port: int = Field(default=49)
  address: str = Field(default='192.168.2.1')
  password: str = Field(default='')
