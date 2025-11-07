import ipaddress
import subprocess as sp
from queue import Queue
from threading import Lock, Thread
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from src.models.Device import Device, DeviceToAdopt
from src.services.device_api import DeviceAPI
from src.shared.utils import wait_device_connectivity


class AdoptionController:
  def __init__(self, queue: Queue, available_devices_lock: Lock = Lock()) -> None:
    self.queue = queue
    self.lock = available_devices_lock
    self.thread = self._create_thread()
    self.available_devices: List[DeviceToAdopt] = []

  async def find_device(self, device: DeviceToAdopt):
    # VALIDATE MAC AND IP NOT ALL NONE
    if all([x is None for x in [device.mac_address, device.ip_address]]):
      raise http_exceptions.INVALID_FIELD(field='Endereco IP ou MAC')

    found_device = None
    with self.lock:
      print(device)
      print(self.available_devices)
      for available_device in self.available_devices:
        if device.ip_address and device.mac_address:
          if available_device.ip_address == device.ip_address and available_device.mac_address == device.mac_address:
            found_device = True
            break
          elif available_device.mac_address == device.mac_address:
            device.ip_address = available_device.ip_address
            found_device = True
            break
          # IS THIS NECESSARY?
          elif available_device.ip_address == device.ip_address:
            device.mac_address = available_device.mac_address
            found_device = True
            break
          continue
        elif device.mac_address:
          if available_device.mac_address == device.mac_address:
            if available_device.ip_address != device.ip_address:
              device.ip_address = available_device.ip_address
            found_device = True
            break
        else:
          if available_device.ip_address == device.ip_address:
            if available_device.mac_address != device.mac_address:
              device.mac_address = available_device.mac_address
            found_device = True
            break
        continue

    if not found_device:
      raise http_exceptions.DEVICE_TO_ADOPT_NOT_FOUND

    if not wait_device_connectivity(host=device.ip_address):
      raise http_exceptions.DEVICE_INACCESSIBLE

    # Execute device driver actions

    device_to_adopt = Device(name=device_info['deviceName'],
                             mac_address=device.mac_address,
                             ip_address=device.ip_address,
                             model=device_info['productName'],
                             user=device.user,
                             password=device.password,
                             fw_version=device_info['firmwareVersion']['active'],
                             location=device_info['deviceLocation'],
                             networkId=device.networkId)
    return device_to_adopt

  def _run_task(self):
    while True:
      try:
        # scan for devices
        devices_list = self.__device_arp_scan()

        with self.lock:
          for device in devices_list:
            if device not in self.available_devices:
              self.available_devices.append(device)
      except Exception as e:
        pass

  def __device_arp_scan(self):
    try:
      command_return = sp.getoutput(constants.FIND_DEVICES_COMMAND)

      splitted_lines = [line.split() for line in command_return.splitlines() if line != '']

      devices_objects = []
      for line in splitted_lines:
        try:
          valid_ip = ipaddress.ip_address(line[0])
          devices_objects.append(DeviceToAdopt(ip_address=valid_ip.compressed, mac_address=line[1]))
        except ValueError:
          continue

      return devices_objects
    except Exception as e:
      print(e) # Change for logging
      return []

  def _create_thread(self):
    return Thread(target=self._run_task)

  def start(self):
    self.thread.start()

  def wait_end(self):
    self.thread.join()
