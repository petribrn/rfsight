from typing import Dict, Optional


class MappingTable:
    def __init__(self):
      self.name_to_ip: Dict[str, str] = {}
      self.mac_to_ip: Dict[str, str] = {}

    def learn_name(self, name: str, ip: str):
      if name:
        self.name_to_ip[name] = ip

    def learn_mac(self, mac: str, ip: str):
      if mac:
        self.mac_to_ip[mac] = ip

    def resolve_name(self, name: str) -> Optional[str]:
      return self.name_to_ip.get(name)

    def resolve_mac(self, mac: str) -> Optional[str]:
      return self.mac_to_ip.get(mac)
