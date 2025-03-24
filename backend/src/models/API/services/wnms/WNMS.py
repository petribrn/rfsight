from pydantic import BaseModel, Field


class WNMS(BaseModel):
  enabled: bool = Field(default=False)
  host: str = Field(default='')
