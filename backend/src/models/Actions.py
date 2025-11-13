# backend/src/models/Actions.py

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ActionExecutionPayload(BaseModel):
    """
    Defines a single action to be executed in a sequence.
    """
    action_name: str = Field(..., description="The name of the 'manage' action in the Profile.")
    # The payload is optional (e.g., for a 'reboot' action)
    payload: Optional[Dict[str, Any]] = Field(default=None, description="The JSON payload to send with the action (if any).")

class ActionSequencePayload(BaseModel):
    """
    The request body sent to the execute-sequence endpoint.
    """
    actions: List[ActionExecutionPayload]

class ActionSequenceResponse(BaseModel):
    """
    The response for a single executed action.
    The endpoint will return a list of these.
    """
    action: str = Field(..., description="The name of the action that was executed.")
    status: Literal['success', 'failed'] = Field(..., description="The execution status of this action.")
    message: str = Field(..., description="A success or error message.")
    # data will contain the mapped response, if any
    data: Optional[Any] = Field(default=None, description="The data returned by the action, if any.")
