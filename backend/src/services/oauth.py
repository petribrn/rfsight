from datetime import datetime, timedelta, timezone
from typing import Literal

import src.configs.constants as constants
import src.models.Auth as auth_models
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from src.database.db import DB, get_db
from src.models.User import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/login')
oauth2_scheme.auto_error = False

def create_access_token(data: dict):
  to_encode = data.copy()
  expire_time = datetime.now(timezone.utc) + timedelta(minutes=constants.ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({'exp': expire_time, 'mode': 'access_token'})

  encoded_jwt = jwt.encode(to_encode, constants.SECRET_KEY, constants.ALGORITHM)

  return encoded_jwt

def create_refresh_token(data: dict):
  to_encode = data.copy()
  expire_time = datetime.now(timezone.utc) + timedelta(days=constants.REFRESH_TOKEN_EXPIRE_DAYS)
  to_encode.update({'exp': expire_time, 'mode': 'refresh_token'})

  encoded_jwt = jwt.encode(to_encode, constants.SECRET_KEY, constants.ALGORITHM)

  return encoded_jwt

def create_reset_passwd_token(data: dict):
  to_encode = data.copy()
  expire_time = datetime.now(timezone.utc) + timedelta(minutes=constants.RESET_PASSWORD_EXPIRE_MINUTES)
  to_encode.update({'exp': expire_time, 'mode': 'reset_passwd'})

  encoded_jwt = jwt.encode(to_encode, constants.SECRET_KEY, constants.ALGORITHM)

  return encoded_jwt

def verify_token(token: str, token_mode: Literal['access_token', 'refresh_token', 'reset_passwd']):
  try:
    if not token: raise http_exceptions.INVALID_CREDENTIALS
    payload = jwt.decode(token, constants.SECRET_KEY, algorithms=constants.ALGORITHM)

    sub: str = payload.get("sub")
    expire: str = payload.get("exp")
    mode: str = payload.get("mode")

    fields_to_check = [sub, expire, mode]

    if token_mode == 'access_token' or token_mode == 'refresh_token':
      permission: int = payload.get('permission')
      fields_to_check.append(permission)

    if None in fields_to_check or mode != token_mode:
      raise http_exceptions.INVALID_CREDENTIALS

    token_data = auth_models.TokenData(**payload)
    return token_data
  except ExpiredSignatureError:
    raise http_exceptions.EXPIRED_TOKEN
  except JWTError as e:
    raise http_exceptions.INVALID_CREDENTIALS

async def get_current_user(token: str = Depends(oauth2_scheme), db: DB = Depends(get_db)):
  token_data = verify_token(token, token_mode='access_token')

  user = await db.user_collection.find_one({"_id": ObjectId(token_data.sub)})

  if not user: raise http_exceptions.INVALID_CREDENTIALS
  return User(**user)

async def check_cookie(request: Request):
    cookie = request.cookies
    if not cookie:
        return None
    if cookie.get('refreshToken'):
        return cookie.get('refreshToken')

async def authorize(token: str = Depends(check_cookie), db: DB = Depends(get_db)):
  token_data = verify_token(token=token, token_mode='refresh_token')

  user = await db.user_collection.find_one({"_id": ObjectId(token_data.sub)})

  if not user: raise http_exceptions.INVALID_CREDENTIALS
  user_model = User(**user)

  payload = {"sub": str(user['_id']), 'permission': user_model.permission}
  access_token = create_access_token(payload)

  return auth_models.RefreshToken(username=user_model.username, accessToken=access_token)
