from pydantic import BaseModel, Field
from src.models.API.network.bridge.vlantermination.data.Data import Data
from src.models.API.network.bridge.vlantermination.multicast.Multicast import \
  Multicast


class VlanTermination(BaseModel):
  data: Data = Field(default=Data())
  multicast: Multicast = Field(default=Multicast())
