from pydantic import BaseModel, Field


class LedD(BaseModel):
  enabled: bool = Field(default=True)
