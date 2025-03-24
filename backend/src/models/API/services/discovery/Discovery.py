from pydantic import BaseModel, Field


class Discovery(BaseModel):
  legacy: bool = Field(default=False)
  lldp: bool = Field(default=True)
  ssdp: bool = Field(default=True)
  mdns: bool = Field(default=True)
  enabled: bool = Field(default=True)
