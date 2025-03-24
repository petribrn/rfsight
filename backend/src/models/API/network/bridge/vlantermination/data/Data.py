from pydantic import BaseModel, Field


class Data(BaseModel):
  enabled: bool = Field(default=False)
  id: int = Field(default=100)
  stbdhcp: bool = Field(default=False)
