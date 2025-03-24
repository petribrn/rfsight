from pydantic import BaseModel, Field
from src.models.API.services.pppoerelay.circuitid.CircuitId import CircuitId


class PPPoERelay(BaseModel):
  enabled: bool = Field(default=False)
  circuitid: CircuitId = Field(default=CircuitId())
