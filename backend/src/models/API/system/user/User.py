from pydantic import BaseModel, Field


class User(BaseModel):
  agreement: bool = Field(default=True)
  password: str = Field(default='admin')
  name: str = Field(default='admin')
  home: str = Field(default='/data')
