import re

import src.configs.constants as constants
from email_validator import EmailNotValidError, ValidatedEmail, validate_email
from pydantic import BaseModel, Field, field_validator, model_validator
from pydantic_core import PydanticCustomError


class Token(BaseModel):
  accessToken: str

class RefreshToken(BaseModel):
  username: str
  accessToken: str

class ForgetPasswordPayload(BaseModel):
  email: str = Field(...)

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

class ValidatePasswordPayload(BaseModel):
  userId: str
  currentPassword: str

class ResetPasswordAdminPayload(BaseModel):
  userId: str
  newPassword: str

class ResetPasswordPayload(BaseModel):
  password: str = Field(min_length=8)
  passwordConfirmation: str = Field(min_length=8)
  token: str = Field(...)

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

  @model_validator(mode='after')
  def check_passwd_match(self):
    passwd = self.password
    passwd_confirmation = self.passwordConfirmation

    if passwd is not None and passwd_confirmation is not None and passwd != passwd_confirmation:
      raise PydanticCustomError(
        'password_match_error',
        'Senha e confirmação de senha são diferentes.',
        {'password': passwd, 'passwordConfirmation': passwd_confirmation},
      )
    return self


class TokenData(BaseModel):
  sub: str | None = None
  mode: str | None = None
  exp: int | None = None
  permission: int | None = None
