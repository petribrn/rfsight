from pydantic import BaseModel, Field


class PublicStatus(BaseModel):
  enabled: bool = Field(default=False)
