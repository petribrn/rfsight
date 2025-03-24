import ssl

import src.configs.constants as constants
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from src.configs.constants import API_PORT
from src.routers import (auth, configurations, devices, monitor, networks,
                         organizations, users)

load_dotenv()

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(devices.router)
app.include_router(organizations.router)
app.include_router(networks.router)
app.include_router(configurations.router)
# app.include_router(monitor.router)

origins = ['https://localhost',
           'localhost',
          'https://localhost:6791',
          'https://local.rfsight.com']

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
  expose_headers=["*"]
)

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(certfile=constants.SSL_CERT_PATH, keyfile=constants.SSL_KEY_PATH)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
  errors_messages = [x['msg'] for x in exc.errors()] # TODO Errors array for exceptions
  return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'detail': {'success': False, 'message': exc.errors()[0]['msg']}})


@app.get('/')
async def root():
  return {'message': 'This API holds the operation of RFSight'}

if __name__ == "__main__":
  uvicorn.run("app:app", host="0.0.0.0", port=API_PORT, reload=True)
