import requests
from src.database.db import DB
from src.models.Device import Device
from src.models.Profile import Action, Profile
from src.repositories.profile import ProfileRepository


class DeviceDriver:
  def __init__(self, device: Device, db: DB):
    self.device = device
    self.profile: Profile = ProfileRepository.get_profile_by(db, field='_id', value=self.device.id)
    self.http_session = requests.Session()
    self.ssh_session = None

  def execute(self, action_name: str, payload: str):
    action_info = self.profile.actions.get(action_name)

    match action_info.actionType:
      case "manage":
        return self.__run_manage_action(action_info, payload)
      case "monitor":
        return self.__run_monitor_action(action_info, payload)


  def __run_monitor_action(self, action_info: Action, payload: str):
    pass

  def __run_manage_action(self, action_info: Action, payload: str):
    pass

  def __create_http_task(self):
    pass

  def __create_ssh_task(self):
    pass
