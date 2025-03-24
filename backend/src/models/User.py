import re
from datetime import datetime
from typing import List, Optional

import pytz
import src.configs.constants as constants
from bson import ObjectId
from email_validator import EmailNotValidError, ValidatedEmail, validate_email
from pydantic import BaseModel, BeforeValidator, Field, field_validator
from pydantic_core import PydanticCustomError
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
  id: Optional[PyObjectId] = Field(alias="_id", default=None)
  username: str = Field(min_length=3)
  email: str = Field(...)
  firstName: str = Field(min_length=3)
  lastName: str = Field(min_length=3)
  password: str = Field(min_length=8)
  permission: int = Field(ge=0, le=5, default=5) # 0: guest | 1: guest monitor | 2: guest admin | 3: monitor | 4: admin | master: 5
  organizationId: PyObjectId | None = Field(default=None)
  createdAt: datetime | None = Optional[Field(...)]
  updatedAt: datetime | None = Optional[Field(...)]

  @field_validator('createdAt', 'updatedAt')
  @classmethod
  def string_to_date(cls, v: object) -> object:
    if isinstance(v, str):
      return datetime.fromisoformat(v).astimezone(tzinfo=pytz.timezone('America/Sao_Paulo'))
    return v

  @field_validator('password')
  @classmethod
  def validate_password(cls, value):
    value = str(value)

    if not re.match(constants.VALIDATE_PASSWD_FORMAT_REGEX, value):
      raise PydanticCustomError(
        'password_pattern_error',
        'A senha não atende os requisitos mínimos de segurança.',
        {'password': value},
      )

    return value

  @field_validator('email')
  @classmethod
  def validate_user_email(cls, value):
    value = str(value)
    try:
      validated_email: ValidatedEmail = validate_email(value)
      return validated_email.normalized
    except EmailNotValidError:
      raise PydanticCustomError(
        'invalid_email_error',
        'Formato de e-mail inválido.',
        {'email': value},
      )

  @field_validator('organizationId')
  def validate_organizationId(cls, value):
    if value is None:
      return value
    try:
      is_valid_id = ObjectId.is_valid(value)
      if not is_valid_id:
          raise Exception
      return value
    except Exception as e:
      raise PydanticCustomError(
        'invalid_organizationId_error',
        'O organizationId do dispositivo é inválido.',
        {'networkId': value},
      )

class UserInDB(User):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    permission: Optional[int] = None # 0: guest | 1: guest monitor | 2: guest admin | 3: monitor | 4: admin | master: 5
    organizationId: Optional[PyObjectId] | None = ''

    @field_validator('username')
    @classmethod
    def validate_username(cls, value):
      value = str(value)
      if len(value) < 3:
        raise PydanticCustomError(
          'invalid_username_error',
          'O nome de usuário deve ter no mínimo 3 caracteres.',
          {'username': value},
        )
      return value

    @field_validator('firstName')
    @classmethod
    def validate_first_name(cls, value):
      value = str(value)
      if len(value) < 2:
        raise PydanticCustomError(
          'invalid_firstName_error',
          'O primeiro nome deve ter no mínimo 2 caracteres.',
          {'firstName': value},
        )
      return value

    @field_validator('lastName')
    @classmethod
    def validate_last_name(cls, value):
      value = str(value)
      if len(value) < 2:
        raise PydanticCustomError(
          'invalid_lastName_error',
          'O último nome deve ter no mínimo 2 caracteres.',
          {'lastName': value},
        )
      return value

    @field_validator('permission')
    @classmethod
    def validate_permission(cls, value):
      value = int(value)
      if value < 0 or value > 5:
        raise PydanticCustomError(
          'invalid_permission_error',
          'A permissão deve estar no intervalo de 0 a 5 [0,5]',
          {'permission': value},
        )
      return value

    @field_validator('email')
    @classmethod
    def validate_user_email(cls, value):
      value = str(value)
      try:
        validated_email: ValidatedEmail = validate_email(value)
        return validated_email.normalized
      except EmailNotValidError:
        raise PydanticCustomError(
          'invalid_email_error',
          'Formato de e-mail inválido.',
          {'email': value},
        )

    @field_validator('organizationId')
    def validate_organizationId(cls, value):
      if value is None:
        return value
      try:
        is_valid_id = ObjectId.is_valid(value)
        if not is_valid_id:
            raise Exception
        return value
      except Exception as e:
        raise PydanticCustomError(
          'invalid_organizationId_error',
          'O organizationId do dispositivo é inválido.',
          {'networkId': value},
        )

class UserCollection(BaseModel):
  users: List[User]
