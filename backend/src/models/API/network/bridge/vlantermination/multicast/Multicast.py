from pydantic import BaseModel, Field


class Multicast(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=100)
  priority: int = Field(default=7)
  stbdhcp: bool = Field(default=False)
