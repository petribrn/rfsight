from pydantic import BaseModel, Field


class Authorization(BaseModel):
  protocol: str = Field(default='local')
