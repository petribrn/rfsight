import asyncio
import os

import pytz
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig
from requests.adapters import HTTPAdapter
from urllib3 import Retry

load_dotenv()

API_HOST = os.getenv('API_HOST')
API_PORT = int(os.getenv('API_PORT'))
UI_HOST = os.getenv('UI_HOST')

SECRET_KEY = os.getenv('SECRET_KEY') # openssl rand -hex 32
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 1
RESET_PASSWORD_EXPIRE_MINUTES = 10

EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')

API_MAIL_CONF = ConnectionConfig(
  MAIL_USERNAME=EMAIL_ADDRESS,
  MAIL_PASSWORD=os.getenv('EMAIL_PASSWORD'),
  MAIL_FROM= EMAIL_ADDRESS,
  MAIL_FROM_NAME= EMAIL_ADDRESS,
  MAIL_SERVER=os.getenv('EMAIL_SERVER'),
  MAIL_PORT=os.getenv('EMAIL_PORT'),
  MAIL_STARTTLS=False,
  MAIL_SSL_TLS=False,
  USE_CREDENTIALS=True,
  TEMPLATE_FOLDER='/app/src/templates/email'
)

LOCAL_TIMEZONE = pytz.timezone('America/Sao_Paulo')

USER_PERMISSIONS = {'guest': 0, 'guest_monitor': 1, 'monitor': 2, 'guest_admin': 3, 'admin': 4, 'master': 5}

MONGODB_HOST = os.getenv('MONGODB_HOST')
MONGODB_LOGIN = os.getenv('MONGODB_LOGIN')
MONGODB_PASSWD = os.getenv('MONGODB_PASSWD')
MONGODB_PORT = os.getenv('MONGODB_PORT')
MONGODB_DATABASE = os.getenv('MONGODB_DATABASE')
MONGODB_URI = f'mongodb://{MONGODB_LOGIN}:{MONGODB_PASSWD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_DATABASE}?directConnection=true&?authSource={MONGODB_DATABASE}'

VALIDATE_MAC_REGEX = '^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$'

VALIDATE_PASSWD_FORMAT_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^*-]).{8,}$"

BASE_PLACEHOLDERS = {
  "DEVICE_IP_ADDRESS": "device.ip_address",
  "DEVICE_MAC_ADDRESS": "device.mac_address",
  "DEVICE_USER": "device.user",
  "DEVICE_PASSWORD": "device.password",
  "DEVICE_MODEL": "device.model",
}

# SNMP AND DISCOVERY RELATED
WEBSOCKET_DEVICE_MONITOR_POLL_RATE = 10
WEBSOCKET_TOPOLOGY_POLL_RATE = 30
DOCKER_CONTAINER_API_INTERFACE = os.getenv('API_CONTAINER_INTERFACE')
FIND_DEVICES_COMMAND = f"""arp-scan -I {DOCKER_CONTAINER_API_INTERFACE} --localnet -q"""
DEVICE_CONN_TIMEOUT = 20
MAC_FIELD_NAMES = {"mac", "mac_address", "mac_addr"}

DEVICE_UPDATE_LOCK = asyncio.Lock()

RETRY_STRATEGY = Retry(
  total=3,
  status_forcelist=[429, 500, 501, 502, 503, 504],
  allowed_methods=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE"],
  backoff_factor = 1
)

HTTP_ADAPTER = HTTPAdapter(max_retries=RETRY_STRATEGY)

SNMP_COMMUNITY = "public"
SNMP_PORT = 161
OID_SYSNAME  = "1.3.6.1.2.1.1.5.0"
OID_SYSDESCR = "1.3.6.1.2.1.1.1.0"
OID_IF_PHYS_ADDRESS = "1.3.6.1.2.1.2.2.1.6"
OID_LLDP_REM_TABLE = "1.0.8802.1.1.2.1.4"
OID_REM_SYS = "1.0.8802.1.1.2.1.4.1.1.9"
OID_REM_PORT = "1.0.8802.1.1.2.1.4.1.1.7"
