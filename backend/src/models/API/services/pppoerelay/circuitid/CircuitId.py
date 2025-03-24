from pydantic import BaseModel, Field


class CircuitId(BaseModel):
  enabled: bool = Field(default=False)
  id: str = Field(default='')
