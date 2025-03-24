from pydantic import BaseModel, Field


class SimpleMode(BaseModel):
  enabled: bool = Field(default=False)
