from pydantic import BaseModel, Field


class LogServer(BaseModel):
  port: int = Field(default=514)
  address: str = Field(default='')
