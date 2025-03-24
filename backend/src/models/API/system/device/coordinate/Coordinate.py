from pydantic import BaseModel, Field


class Coordinate(BaseModel):
  latitude: int = Field(default=0)
  longitude: int = Field(default=0)
