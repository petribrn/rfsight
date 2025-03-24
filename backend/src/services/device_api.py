import requests
import src.shared.http_exceptions as http_exceptions
from fastapi import HTTPException
from retry import retry
from src.models.API.Configuration import (ConfigurationUpdate,
                                          DeviceConfiguration)


class DeviceAPI:
  def __init__(self, ip_address: str, user: str, password: str) -> None:
    self.ip_address = ip_address
    self.default_url = f'http://{ip_address}/cgi-bin/main.cgi'
    self.user = user
    self.password = password
    self.session = requests.Session()

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def login(self):
    try:
      login_data = {
        "username": self.user,
        "password": self.password,
        "language": 'pt_BR'
      }
      post_response = self.session.post(f'{self.default_url}/login', json=login_data)

      if post_response.status_code != 200:
        if post_response.status_code == 404:
          raise http_exceptions.DEVICE_NOT_MANAGEABLE
        raise http_exceptions.DEVICE_LOGIN_FAIL

      auth_token = post_response.cookies.get('token')
      csrf_token = post_response.cookies.get('CSRF-TOKEN')

      self.session.headers.update({'Authorization': f'Token {auth_token}', 'CSRF-TOKEN': csrf_token})
      return True
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def logout(self):
    try:
      post_response = self.session.post(f'{self.default_url}/logout')

      if post_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro no logout - {post_response.status_code}')

      return True
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_device_config(self):
    try:
      get_response = self.session.get(f'{self.default_url}/config')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar config do dispositivo - {get_response.status_code}')

      json_data = get_response.json()

      return DeviceConfiguration(**json_data)
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def set_device_config(self, device_config_data: ConfigurationUpdate):
    try:
      post_response = self.session.post(f'{self.default_url}/config', json=device_config_data.model_dump(by_alias=True))

      if post_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao atualizar a configuração do produto - {post_response.status_code}')

      return True
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_device_log(self):
    try:
      get_response = self.session.get(f'{self.default_url}/syslog')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar logs do dispositivo - {get_response.status_code}')

      json_data = get_response.json()

      return json_data
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_real_time_statistics(self):
    try:
      get_response = self.session.get(f'{self.default_url}/periodic')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar estatísticas em tempo real do dispositivo - {get_response.status_code}')

      json_data = get_response.json()

      return json_data
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_device_statistics(self, types: list = ['general']):
    try:
      get_response = self.session.get(f'{self.default_url}/statistics?type={",".join(types)}')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar estatísticas do dispositivo - {get_response.status_code}')

      json_data = get_response.json()

      return json_data
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_device_capabilities(self):
    try:
      get_response = self.session.get(f'{self.default_url}/capabilities')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar capacidades do dispositivos - {get_response.status_code}')

      json_data = get_response.json()

      return json_data
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  @retry((HTTPException, Exception), tries=5, delay=1.5)
  def get_current_user_info(self):
    try:
      get_response = self.session.get(f'{self.default_url}/current_user')

      if get_response.status_code != 200:
        raise http_exceptions.DEVICE_API_FAIL(detail=f'Erro ao buscar dados do usuário atual - {get_response.status_code}')

      json_data = get_response.json()

      return json_data
    except HTTPException as h:
      raise h
    except Exception as e:
      raise http_exceptions.DEVICE_API_FAIL(detail=e)

  def dhcp_lease_update(self):
    # TODO
    pass

  def wireless_survey(self):
    # TODO
    pass
