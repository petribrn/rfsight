from typing import List

from pydantic import BaseModel, Field


class NTP(BaseModel):
  servers: List[str] = Field(default=['pool.ntp.org'])
  enabled: bool = Field(default=False)
