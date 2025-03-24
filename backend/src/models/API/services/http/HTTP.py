from pydantic import BaseModel, Field


class HTTP(BaseModel):
  port: int = Field(default=80)
  enabled: bool = Field(default=True)
