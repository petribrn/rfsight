from datetime import datetime
from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel


class ActionStatus(BaseModel):
  status: Literal['success', 'error']
  message: Optional[str] = None


class DeviceMonitorUpdate(BaseModel):
  """
  Defines the standard update payload for a single device,
  sent over WebSocket.
  """
  deviceId: str
  online: bool
  actionsStatuses: Dict[str, ActionStatus] = {}
  latency: Optional[float] = None
  stats: Dict[str, Any] = {}
  timestamp: datetime = None
