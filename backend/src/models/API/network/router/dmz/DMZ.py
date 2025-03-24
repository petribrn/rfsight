from pydantic import BaseModel, Field


class DMZ(BaseModel):
  ip: str = Field(default='0.0.0.0')
  managementports: bool = Field(default=False)
  enabled: bool = Field(default=False)
