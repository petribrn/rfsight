import os

import pytz
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig

load_dotenv()

API_HOST = '192.168.7.110'
API_PORT = int(os.getenv('API_PORT', 6792))

SECRET_KEY = os.getenv('SECRET_KEY') # openssl rand -hex 32
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 1
RESET_PASSWORD_EXPIRE_MINUTES = 10

SSL_CERT_PATH = './certs/cert.pem'
SSL_KEY_PATH = './certs/key.pem'

API_MAIL_CONF = ConnectionConfig(
    MAIL_USERNAME='teamtechversewpro@gmail.com',
    MAIL_PASSWORD='Lockinet@1-techrow13qwqw',
    MAIL_FROM= 'teamtechversewpro@gmail.com',
    MAIL_FROM_NAME= 'teamtechversewpro@gmail.com',
    MAIL_PORT=25,
    MAIL_SERVER='localhost',
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER='/app/src/templates/email'
)

LOCAL_TIMEZONE = pytz.timezone('America/Sao_Paulo')

USER_PERMISSIONS = {'guest': 0, 'guest_monitor': 1, 'guest_admin': 2, 'monitor': 3, 'admin': 4, 'master': 5}

MONGODB_HOST = os.getenv('MONGODB_HOST')
MONGODB_LOGIN = os.getenv('MONGODB_LOGIN')
MONGODB_PASSWD = os.getenv('MONGODB_PASSWD')
MONGODB_PORT = os.getenv('MONGODB_PORT')
MONGODB_DATABASE = os.getenv('MONGODB_DATABASE')
MONGODB_URI = f'mongodb://{MONGODB_LOGIN}:{MONGODB_PASSWD}@{MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_DATABASE}?directConnection=true&authSOurce=admin'

VALIDATE_MAC_REGEX = '^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$'

VALIDATE_PASSWD_FORMAT_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^*-]).{8,}$"

DOCKER_CONTAINER_API_INTERFACE = 'enp44s0'
FIND_DEVICES_COMMAND = f"""arp-scan -I {DOCKER_CONTAINER_API_INTERFACE} --localnet -q"""
DEVICE_CONN_TIMEOUT = 20

CONFIGURATION_THREAD_NUMBER = 10
