from pydantic import BaseModel, Field


class Zapd(BaseModel):
  enabled: bool = Field(default=False)
