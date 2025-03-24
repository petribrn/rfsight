from typing import List

from pydantic import BaseModel, Field
from src.models.API.wireless.radio.Radio import Radio


class Wireless(BaseModel):
  scenario: str = Field(default='ptmp')
  countrycode: str = Field(default='BR')
  radio: List[Radio] = Field(default=[Radio()])
