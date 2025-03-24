from pydantic import BaseModel, Field


class ResetD(BaseModel):
  enabled: bool = Field(default=True)
