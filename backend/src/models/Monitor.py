from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel


class ActionStatus(BaseModel):
  status: Literal['success', 'error']
  message: str | None = None


class DeviceMonitorUpdate(BaseModel):
    """
    Defines the standard update payload for a single device,
    sent over WebSocket.
    """
    deviceId: str
    online: bool
    actionsStatuses: Dict[str, ActionStatus] = {}
    latency: Optional[float] = None

    # Aggregated results from all 'monitor' actions
    stats: Dict[str, Any] = {}

    # Future: populated by a 'get-neighbors' action
    neighbors: List[str] = []
