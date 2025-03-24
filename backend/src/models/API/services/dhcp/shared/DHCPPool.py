from pydantic import BaseModel, Field


class DHCPPool(BaseModel):
  frm: str = Field(default='2000::1000', alias='from')
  to: str = Field(default='2000::ffff')
