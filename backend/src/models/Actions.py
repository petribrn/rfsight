from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ActionExecutionPayload(BaseModel):
    action_name: str = Field(...)
    # The payload is optional (e.g., for a 'reboot' action)
    payload: Optional[Dict[str, Any]] = Field(default=None)

class ActionSequencePayload(BaseModel):
  actions: List[ActionExecutionPayload]

class ActionSequenceResponse(BaseModel):
  action: str = Field(...)
  status: Literal['success', 'failed'] = Field(...)
  message: str = Field(...)
  # data will contain the mapped response, if any
  data: Optional[Any] = Field(default=None)
