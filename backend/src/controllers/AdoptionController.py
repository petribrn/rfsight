import asyncio
import ipaddress
import subprocess as sp
from queue import Queue
from threading import Lock, Thread
from typing import List

import src.configs.constants as constants
import src.shared.http_exceptions as http_exceptions
from src.database.db import DB
from src.models.Device import Device, DeviceToAdopt, DiscoveredDevice
from src.repositories.profile import ProfileRepository
from src.services.device_driver import DeviceDriver
from src.shared.utils import wait_device_connectivity


class AdoptionController:
  def __init__(self, queue: Queue, available_devices_lock: Lock = Lock()) -> None:
    self.queue = queue
    self.lock = available_devices_lock
    self.thread = self._create_thread()
    self.available_devices: List[DiscoveredDevice] = []

  async def find_device(self, device: DeviceToAdopt, db: DB):
    # VALIDATE MAC AND IP NOT ALL NONE
    if all([x is None for x in [device.mac_address, device.ip_address]]):
      raise http_exceptions.INVALID_FIELD(field='Endereco IP ou MAC')

    found_device = None
    with self.lock:
      for available_device in self.available_devices:
        if device.ip_address and device.mac_address:
          if available_device.ip_address == device.ip_address and available_device.mac_address == device.mac_address:
            found_device = True
            break
          elif available_device.mac_address == device.mac_address:
            device.ip_address = available_device.ip_address
            found_device = True
            break
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

    profile = await ProfileRepository.get_profile_by(db=db, field='_id', value=device.profileId)
    if not profile:
      raise http_exceptions.DOCUMENT_INEXISTENT("Profile")

    device_driver = DeviceDriver(device=device, profile=profile)

    # Execute monitor actions (get inital device information)
    actions_to_run = []
    for action_name, action in profile.actions.items():
      if action.actionType == 'monitor' and action.httpDetails and action.httpDetails.responseMapping:
        actions_to_run.append(action_name)

    if not actions_to_run:
      print(f"Profile {profile.name} sem actions de monitoramento com responseMapping. Usando defaults.")

    # Run all found actions concurrently in threads
    tasks = [asyncio.to_thread(device_driver.execute_action, action_name) for action_name in actions_to_run]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Extract mapped data
    all_mapped_data = {}
    for i, res in enumerate(results):
      action_name = actions_to_run[i]
      if isinstance(res, Exception):
        print(f"Adoção: Ação '{action_name}' falhou: {res}")
      elif isinstance(res, dict):
        all_mapped_data.update(res)
      else:
        print(f"Adoção: Ação '{action_name}' não retornou um dict mapeado.")

    device_to_adopt = Device(
      is_active=True,
      name=all_mapped_data.get('name'),
      mac_address=device.mac_address,
      ip_address=device.ip_address,
      model=all_mapped_data.get('model'),
      user=device.user,
      password=device.password,
      fw_version=all_mapped_data.get('fw_version'),
      location=all_mapped_data.get('location'),
      networkId=device.networkId,
      profileId=profile.id
    )

    return device_to_adopt

  def match_discovered_device(self, mac, ip):
    with self.lock:
      for d in self.available_devices:
        if mac and ip:
          if (d.mac_address == mac and d.ip_address == ip) or \
            (d.mac_address == mac) or \
            (d.ip_address == ip):
              return d
        elif mac:
          if d.mac_address == mac:
            return d
        else:  # ip only
          if d.ip_address == ip:
            return d

      return None

  def _run_task(self):
    while True:
      try:
        devices_list = self.__device_arp_scan()
        with self.lock:
          current_macs = {dev.mac_address for dev in self.available_devices}
          new_devices = [dev for dev in devices_list if dev.mac_address not in current_macs]
          self.available_devices.extend(new_devices)
      except Exception as e:
        print(f"Erro ao executar task de discovery de adoção: {e}")

  def __device_arp_scan(self):
    try:
      command_return = sp.getoutput(constants.FIND_DEVICES_COMMAND)

      splitted_lines = [line.split() for line in command_return.splitlines() if line != '']

      devices_objects = []
      for line in splitted_lines:
        if len(line) > 2:
          continue
        else:
          try:
            valid_ip = ipaddress.ip_address(line[0])
            formatted_mac_address = line[1].upper().replace(':', '').replace('-', '')
            devices_objects.append(DiscoveredDevice(ip_address=valid_ip.compressed, mac_address=formatted_mac_address))
          except ValueError as v:
            print(f'Erro ao mapead dispositivo na descoberta: {v}')
            continue

      return devices_objects
    except Exception as e:
      print(f'Erro ao executar arp scan para adoção: {e}')
      return []

  def _create_thread(self):
    return Thread(target=self._run_task)

  def start(self):
    self.thread.start()

  def wait_end(self):
    self.thread.join()
