from pydantic import BaseModel, Field


class AutoUpdate(BaseModel):
  url: str = Field(default='')
  protocol: str = Field(default='http')
  username: str = Field(default='')
  enabled: bool = Field(default=False)
  password: str = Field(default='')
  path: str = Field(default='')
  source: str = Field(default='official')
  period: int = Field(default=24)
