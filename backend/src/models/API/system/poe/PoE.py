from pydantic import BaseModel, Field


class PoE(BaseModel):
  enabled: bool = Field(default=False)
