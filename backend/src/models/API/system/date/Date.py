from pydantic import BaseModel, Field


class Date(BaseModel):
  time: str = Field(default='00:00')
  timezone: str = Field(default='UTC')
  date: str = Field(default='20/07/2023')
