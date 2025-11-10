

from typing import Literal

from pydantic import BaseModel


class WebsocketMessage(BaseModel):
  messageType: Literal['topology', 'deviceMonitor']
  data: dict = {}
