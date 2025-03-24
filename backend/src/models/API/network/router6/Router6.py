from pydantic import BaseModel, Field
from src.models.API.network.router6.lan.Lan import Lan
from src.models.API.network.router6.wan.Wan import Wan


class Router6(BaseModel):
  lan: Lan = Field(default=Lan())
  wan: Wan = Field(default=Wan())
