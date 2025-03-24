import src.configs.constants as constants
import src.services.oauth as oauth
import src.shared.http_exceptions as http_exceptions
import src.shared.utils as utils
from fastapi import (APIRouter, Depends, HTTPException, Request, Response,
                     status)
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_mail import FastMail, MessageSchema, MessageType
from pyisemail import is_email
from src.database.db import DB, get_db
from src.models.Auth import (ForgetPasswordPayload, RefreshToken,
                             ResetPasswordPayload, Token)
from src.models.User import User
from src.repositories.user import UserRepository

router = APIRouter(prefix='/auth', tags=['authentication'])

@router.post('/login', status_code=status.HTTP_200_OK, response_model=Token)
async def login(response: Response, userdetails: OAuth2PasswordRequestForm = Depends(), db: DB = Depends(get_db)):
  try:
    query = {"username": userdetails.username } if not is_email(userdetails.username) else {"email": userdetails.username}
    user = await db.user_collection.find_one(query)

    if not user: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"success": False, "message": "Usuário inválido."})
    user_model = User(**user)

    if not utils.verify_passwd(userdetails.password, user['password']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"success": False, "message": "Senha inválida."})

    payload = {"sub": str(user["_id"]), 'permission': user_model.permission}
    access_token = oauth.create_access_token(payload)
    refresh_token = oauth.create_refresh_token(payload)

    response.set_cookie(key='refreshToken', value=refresh_token, httponly=True, secure=True, samesite='none')
    return Token(accessToken=access_token)
  except HTTPException as h:
      raise h
  except Exception as e:
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"success": False, "message": str(e)})

@router.get('/refresh', status_code=status.HTTP_201_CREATED, response_model=RefreshToken, response_model_by_alias=False)
async def refresh_auth(response: Response, token_data: Token = Depends(oauth.authorize)):
  return token_data

@router.post('/forgot-password', status_code=status.HTTP_200_OK)
async def forgot_password(forget_password_payload: ForgetPasswordPayload, request: Request, db: DB = Depends(get_db)):
  try:
    is_valid_email = is_email(forget_password_payload.email)
    if not is_valid_email:
      raise http_exceptions.INVALID_FIELD('email')
    user = await db.user_collection.find_one({"email": forget_password_payload.email})
    if not user: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"success": False, "message": "Usuário inexistente."})
    user_model = User(**user)

    reset_data = {'sub': user_model.email}
    reset_password_token = oauth.create_reset_passwd_token(data=reset_data)

    request_host = request.headers.get('HOST')

    forget_passwd_link = f'https://{request_host}/reset-password/{reset_password_token}'

    email_body = {"firstName": user_model.firstName,
                  "linkExpireTime": constants.RESET_PASSWORD_EXPIRE_MINUTES,
                  "resetLink": forget_passwd_link }

    message = MessageSchema(
            subject="Password Reset Instructions",
            recipients=[forget_password_payload.email],
            template_body=email_body,
            subtype=MessageType.html
          )

    fm = FastMail(constants.API_MAIL_CONF)

    await fm.send_message(message=message, template_name='reset_password.html')

    return {'success': True, 'message': 'E-mail enviado.'}
  except HTTPException as h:
      raise h
  except Exception as e:
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"success": False, "message": str(e)})

@router.post('/reset-password', status_code=status.HTTP_201_CREATED)
async def reset_password(reset_password_payload: ResetPasswordPayload, db: DB = Depends(get_db)):
  try:
    reset_token_data = oauth.verify_token(reset_password_payload.token, token_mode="reset_passwd")

    user = await UserRepository.get_user_by(db, field='email', value=reset_token_data.sub)
    if not user: raise http_exceptions.INVALID_CREDENTIALS

    updated_user_password = await UserRepository.update_user_password(db, user.id, reset_password_payload.password)
    if not updated_user_password:
      raise http_exceptions.PASSWD_UPDATE_FAILED

    return {'success': True, 'message': 'Senha atualizada.'}
  except HTTPException as h:
    raise h
  except Exception as e:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"success": False, "message": str(e)})

@router.get('/logout', status_code=status.HTTP_200_OK)
async def logout(response: Response):
  try:
    response.delete_cookie('refreshToken', httponly=True, secure=True)
    return {'success': True, 'message': 'Logout realizado com sucesso.'}
  except HTTPException as h:
      raise h
  except Exception as e:
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"success": False, "message": str(e)})
