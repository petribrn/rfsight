import concurrent.futures
from typing import Literal

import src.shared.http_exceptions as http_exceptions
from fastapi import HTTPException
from src.controllers.config.TaskPayload import TaskPayload
from src.models.API.andromeda.Andromeda import Andromeda
from src.models.API.Configuration import (ConfigurationUpdate,
                                          DeviceConfiguration)
from src.models.API.network.Network import Network
from src.models.API.services.Services import Services
from src.models.API.system.System import System
from src.models.API.wireless.Wireless import Wireless
from src.models.Device import Device
from src.services.device_api import DeviceAPI
from src.shared.utils import wait_device_connectivity

consumer_threadpool = concurrent.futures.ThreadPoolExecutor()
producer_threadpool = concurrent.futures.ThreadPoolExecutor()


class ConfigController:
  def __init__(self) -> None:
    pass

  def update_device_config(self,
                           device_info: Device,
                           config_to_update: DeviceConfiguration,
                           wireless_config: Wireless | None = None,
                           system_config: System | None = None,
                           services_config: Services | None = None,
                           network_config: Network | None = None,
                           andromeda_config: Andromeda | None = None):
    if wireless_config:
      config_to_update.wireless = wireless_config

    if services_config:
      config_to_update.services = services_config

    if network_config:
      config_to_update.network = network_config

    if system_config:
      config_to_update.system.simplemode = system_config.simplemode
      config_to_update.system.publicstatus = system_config.publicstatus
      config_to_update.system.authorization = system_config.authorization
      config_to_update.system.poe = system_config.poe
      config_to_update.system.tacacs = system_config.tacacs
      config_to_update.system.log = system_config.log
      config_to_update.system.device = system_config.device
      config_to_update.system.date = system_config.date

    if andromeda_config:
      config_to_update.andromeda = andromeda_config

    configs_update = ConfigurationUpdate(config=config_to_update)
    task_payload = TaskPayload(method='post', device_info=device_info, data=configs_update)
    device_configuration = producer_threadpool.submit(self._produce_task, task_payload)
    return device_configuration.result()

  def get_device_config(self, device_info: Device, format: Literal['model', 'dict'] = 'model'):
    task_payload = TaskPayload(method='get', device_info=device_info)
    device_configuration = producer_threadpool.submit(self._produce_task, task_payload)
    result = device_configuration.result()
    return result.model_dump(by_alias=True) if format == 'dict' else result

  def _produce_task(self, task_payload: TaskPayload):
    future = consumer_threadpool.submit(self._consumer, task_payload)
    future_task_result = future.result()
    return future_task_result

  def _consumer(self, task_payload: TaskPayload):
    while True:
      try:
        target_device = task_payload.device_info
        device_api = DeviceAPI(ip_address=target_device.ip_address,
                               user=target_device.user,
                               password=target_device.password)

        if not wait_device_connectivity(target_device.ip_address):
          raise http_exceptions.DEVICE_INACCESSIBLE

        device_api.login()

        task_return = None
        if task_payload.method == 'get':
          task_return = device_api.get_device_config()
          if not task_return:
            raise http_exceptions.CONFIG_ACTION_FAILED('buscar')

        if task_payload.method == 'post':
          set_device_config = device_api.set_device_config(device_config_data=task_payload.data)
          if not set_device_config:
            raise http_exceptions.CONFIG_ACTION_FAILED('atualizar')
          task_return = device_api.get_device_config()
          if not task_return:
            raise http_exceptions.CONFIG_ACTION_FAILED('atualizar e buscar')

        return task_return
      except HTTPException as h:
        raise h
      except Exception as e:
        raise http_exceptions.INTERNAL_ERROR(detail=str(e))
