from pydantic import BaseModel, Field


class QOS(BaseModel):
  enabled: bool = Field(default=True)
