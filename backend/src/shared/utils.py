import asyncio
import hashlib
import json
import socket
import time

import bcrypt
import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from bson import ObjectId
from retry import retry
from src.models.API.Configuration import DeviceConfiguration


def hash_passwd(password: str):
  encoded_passwd = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_passwd = bcrypt.hashpw(encoded_passwd, salt)
  return hashed_passwd.decode()

def verify_passwd(plain_text_password, hashed_passwd):
  return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_passwd.encode('utf-8'))

def validate_id(target_id: str, id_field_name: str):
  if isinstance(target_id, ObjectId):
    return target_id
  if not ObjectId.is_valid(target_id):
    raise http_exceptions.INVALID_FIELD(field=id_field_name)

  target_id = ObjectId(target_id)
  return target_id

def wait_device_connectivity(host: str, port=80, timeout: int = constants.DEVICE_CONN_TIMEOUT) -> bool:
  start_time = time.time()
  recheck = 0
  while True:
    try:
      time.sleep(1)
      if check_port(host, port):
        recheck +=1
        if recheck >= 5: return True
      else:
        if time.time() - start_time >= timeout:
          return False
        continue
    except (ConnectionError, ConnectionAbortedError, ConnectionRefusedError, ConnectionResetError) as e:
      continue

def check_port(host: str, port: int) -> bool:
  s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  try:
    s.settimeout(5)
    s.connect((host, 80))
    s.shutdown(2)
    return True
  except socket.error as e:
    return False

def hash_device_config(device_config: DeviceConfiguration):
  dhash = hashlib.md5()
  config_dict = device_config.model_dump(by_alias=True)
  encoded = json.dumps(config_dict, sort_keys=True).encode()
  dhash.update(encoded)
  return dhash.hexdigest()
