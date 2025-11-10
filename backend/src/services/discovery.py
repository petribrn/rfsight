import asyncio
from ipaddress import ip_network
from typing import Dict, List, Optional, Tuple

import src.configs.constants as constants
from pysnmp.hlapi.v3arch.asyncio import *
from scapy.all import ARP, Ether, srp
from src.models.StationTable import StationTableModel


async def arp_sweep_async(network_cidr: str, iface: str = "eth0") -> dict:
  def _scan():
    net = ip_network(network_cidr, strict=False)
    # Broadcast ARP request
    pkt = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=str(net))
    ans, _ = srp(pkt, timeout=1, retry=1, iface=iface, verbose=0)

    results = {}
    for sent, received in ans:
      mac = received.hwsrc.upper().replace(":", "")
      ip  = received.psrc
      results[mac] = ip
    return results

  return await asyncio.to_thread(_scan)

async def snmp_get(ip: str, oid: str) -> Optional[str]:

    engine = SnmpEngine()
    iterator = get_cmd(
      engine,
      CommunityData(constants.SNMP_COMMUNITY),
      await UdpTransportTarget.create((ip, constants.SNMP_PORT)),
      ContextData(),
      ObjectType(ObjectIdentity(oid)),
      lookupMib=False
    )

    errInd, errStatus, errIndex, varBinds = await iterator
    engine.close_dispatcher()

    if errInd or errStatus:
      return None

    for oid_obj, val in varBinds:
      return val.prettyPrint()
    return None


async def snmp_walk(ip: str, oid: str) -> List[Tuple[str, str]]:

  engine = SnmpEngine()
  iterator = walk_cmd(
    engine,
    CommunityData(constants.SNMP_COMMUNITY),
    await UdpTransportTarget.create((ip, constants.SNMP_PORT)),
    ContextData(),
    ObjectType(ObjectIdentity(oid)),
    lookupMib=False
  )

  collected = [item async for item in iterator]
  engine.close_dispatcher()

  results: List[Tuple[str, str]] = []
  for errInd, errStatus, errIndex, varBinds in collected:
    if errInd or errStatus:
      break
    for vb in varBinds:
      if oid in vb[0].prettyPrint():
        results.append((vb[0].prettyPrint(), vb[1].prettyPrint()))
  return results

def parse_lldp(pairs: List[Tuple[str, str]]):
  sys_map = {}
  port_map = {}

  for oid, val in pairs:
    if constants.OID_REM_SYS in oid:
      sys_map[oid] = val
    if constants.OID_REM_PORT in oid:
      port_map[oid] = val

  def tail(oid: str) -> str:
    return ".".join(oid.split(".")[-3:])  # last 3 index comps

  neighbors = []
  for oid, sysname in sys_map.items():
    suffix = tail(oid)
    portid = None
    for oid2, val2 in port_map.items():
      if oid2.endswith(suffix):
        portid = val2
        break
    neighbors.append({
      "remote_sys_name": sysname,
      "remote_port_id": portid
    })

  return neighbors

def decode_mac(raw: str) -> str:
    raw = raw.strip().upper()

    # Hex-STRING: aa bb cc dd ee ff
    if raw.startswith("HEX-STRING"):
      hexstr = raw.split(":", 1)[1].strip().replace(" ", "")
      return hexstr

    # 0xAABBCCDDEEFF
    if raw.startswith("0X"):
      h = raw[2:]
      if len(h) % 2 != 0:
        h = "0" + h
      return h

    # Decimal-dot: 12.34.56.78.90.12
    parts = raw.split(".")
    if all(p.isdigit() for p in parts):
      return "".join(f"{int(p):02X}" for p in parts)

    # Already formatted (AA:BB:CC:DD:EE:FF)
    return raw.replace(":", "").replace("-", "")

def parse_if_phys_address(rows: List[Tuple[str, str]]):
  results = set()

  for oid, val in rows:
    if constants.OID_IF_PHYS_ADDRESS not in oid:
      continue

    mac = decode_mac(val)

    if mac and mac != "00:00:00:00:00:00":
      results.add(mac)

  return list(results)

def parse_station_table(rows: List[Tuple[str, str]], model: StationTableModel):
  stations: Dict[Tuple[str, ...], Dict] = {}

  root_parts = model.root_oid.split(".")
  root_len = len(root_parts)

  # Generic structure:
  # <root>.<entry>.<field_id>.<index...>
  index_offset = root_len + 2

  MAC_FIELD_NAMES = {"mac", "mac_address", "mac_addr"}

  for oid, val in rows:
    if not oid.startswith(model.root_oid):
      continue

    parts = oid.split(".")

    if len(parts) <= index_offset:
      # malformed
      continue

    # field_id is ALWAYS one position after entry_id
    field_id = parts[root_len + 1]

    # Get the logical field name defined by the user
    field_name = model.field_map.get(field_id)
    if not field_name:
      # not mapped → ignore
      continue

    # Index = everything after field_id
    index_tuple = tuple(parts[index_offset:])

    st = stations.setdefault(index_tuple, {})

    # Handle MAC field automatically based on name
    if field_name.lower() in MAC_FIELD_NAMES:
      st["mac"] = decode_mac(val)
    else:
      st[field_name] = val

  # Convert to list
  result = []
  for idx, st in stations.items():
    mac = st.get("mac")
    if not mac:
      # Station without MAC is invalid
      continue

    st["id"] = f"STA-{mac}"
    st["type"] = "wifi-station"
    result.append(st)

  return result
