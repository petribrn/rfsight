from typing import Dict

from pydantic import BaseModel, Field


class StationTableModel(BaseModel):
  root_oid: str = Field(...)
  field_map: Dict[str, str]
  index_from: None | str | int = Field(default=None)
