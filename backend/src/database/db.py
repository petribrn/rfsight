import motor.motor_asyncio as motor_asyncio
import src.configs.constants as constants
from bson import CodecOptions


class DB:
  def __init__(self) -> None:
    self.__client = motor_asyncio.AsyncIOMotorClient(constants.MONGODB_URI)
    self.__database = self.__client.rfsight
    self.__codec_options = CodecOptions(tz_aware=True, tzinfo=constants.LOCAL_TIMEZONE)

    self.user_collection: motor_asyncio.AsyncIOMotorCollection = self.__get_collection('users')
    self.devices_collection: motor_asyncio.AsyncIOMotorCollection = self.__get_collection('devices')
    self.profiles_collection: motor_asyncio.AsyncIOMotorCollection = self.__get_collection('profiles')
    self.networks_collection: motor_asyncio.AsyncIOMotorCollection = self.__get_collection('networks')
    self.organizations_collection: motor_asyncio.AsyncIOMotorCollection = self.__get_collection('organizations')

  def __get_collection(self, collection_name: str):
    return self.__database.get_collection(collection_name, codec_options=self.__codec_options)

  def user_collection(self):
    return self.user_collection

  def devices_collection(self):
    return self.devices_collection

  def profiles_collection(self):
    return self.profiles_collection

  def networks_collection(self):
    return self.networks_collection

  def organizations_collection(self):
    return self.organizations_collection

def get_db():
  return DB()
