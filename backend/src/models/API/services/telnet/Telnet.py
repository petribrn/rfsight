from pydantic import BaseModel, Field


class Telnet(BaseModel):
  port: int = Field(default=23)
  enabled: bool = Field(default=False)
