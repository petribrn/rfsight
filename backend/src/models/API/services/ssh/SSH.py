from pydantic import BaseModel, Field


class SSH(BaseModel):
  port: int = Field(default=22)
  enabled: bool = Field(default=True)
