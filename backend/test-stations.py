#!/usr/bin/env python3
import asyncio
import ipaddress
import re
import socket
import subprocess
from typing import Dict, List, Optional, Tuple

from pysnmp.hlapi.v3arch.asyncio import *

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
COMMUNITY = "public"
SNMP_PORT = 161

OID_SYSNAME  = "1.3.6.1.2.1.1.5.0"
OID_SYSDESCR = "1.3.6.1.2.1.1.1.0"
IF_PHYS_ADDRESS = "1.3.6.1.2.1.2.2.1.6"

# LLDP remote table root (walk subtree)
LLDP_REM_TABLE = "1.0.8802.1.1.2.1.4"

class StationTableModel:
    def __init__(
        self,
        root_oid: str,
        field_map: Dict[str, str],
        index_from: int,
        mac_field: str,
        mac_format: str = "hex-or-decimal"
    ):
        """
        root_oid: root OID to walk   (e.g. Intelbras: '1.3.6.1.4.1.43265.3.10.1.3.2.1')
        field_map: mapping of field-id -> attribute name
                   (e.g. {'1':'mac', '2':'assoc', '5':'rssi', '6':'snr'})
        index_from: index starting position in the OID split list
        mac_field: field-id corresponding to MAC field
        mac_format: 'hex', 'decimal', 'hex-or-decimal'
        """
        self.root_oid = root_oid
        self.field_map = field_map
        self.index_from = index_from
        self.mac_field = mac_field
        self.mac_format = mac_format

CURRENT_STATION_MODEL = StationTableModel(
    root_oid="1.3.6.1.4.1.43265.3.10.1.3.2.1",
    field_map={
        "1": "mac",
        "2": "assoc",
        "3": "tx_bytes",
        "4": "rx_bytes",
        "5": "rssi",
        "6": "snr",
    },
    index_from=None,
    mac_field="1",
)

NETWORK_TO_SCAN = "15.0.0.0/24"

async def run_nmap_scan(network_cidr: str) -> Dict[str, str]:
    """
    Runs: nmap -sn <network_cidr>
    Returns a dict: { mac_lower : ip }
    """

    command = ["sudo", "nmap", "-sn", network_cidr]

    try:
        output = await asyncio.to_thread(subprocess.check_output, command, stderr=subprocess.STDOUT, text=True)
    except Exception as e:
        print(f"[NMAP SCAN ERROR] {e}")
        return {}

    ip = None
    mac_to_ip = {}

    for line in output.splitlines():
        line = line.strip()

        # Parse IP line
        ip_match = re.match(r"Nmap scan report for (\S+)", line)
        if ip_match:
            ip = ip_match.group(1)
            continue

        # Parse MAC line
        mac_match = re.match(r"MAC Address: ([0-9A-Fa-f:]{17})", line)
        if mac_match and ip:
            mac = mac_match.group(1).upper().replace(":", "")
            mac_to_ip[mac] = ip

            # Reset for next host
            ip = None
    return mac_to_ip

# ---------------------------------------------------------------------------
# Mapping Table
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# SNMP Helpers
# ---------------------------------------------------------------------------
async def snmp_get(ip: str, oid: str) -> Optional[str]:
    engine = SnmpEngine()
    iterator = get_cmd(
        engine,
        CommunityData(COMMUNITY),
        await UdpTransportTarget.create((ip, SNMP_PORT)),
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
    """
    Walk subtree as list of (oid, value).
    Uses documented walkCmd-like pattern (walk_cmd or walkCmd depending on pysnmp version).
    """
    engine = SnmpEngine()
    # walk_cmd vs walkCmd: using wildcard import keeps compatibility with your environment
    iterator = walk_cmd(
        engine,
        CommunityData(COMMUNITY),
        await UdpTransportTarget.create((ip, SNMP_PORT)),
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
            results.append((vb[0].prettyPrint(), vb[1].prettyPrint()))
    return results

# ---------------------------------------------------------------------------
# Parsers: LLDP / CDP / Bridge / Intelbras stations
# ---------------------------------------------------------------------------
def parse_lldp(pairs: List[Tuple[str, str]]):
    REM_SYS = "1.0.8802.1.1.2.1.4.1.1.9"
    REM_PORT = "1.0.8802.1.1.2.1.4.1.1.7"

    sys_map = {}
    port_map = {}

    for oid, val in pairs:
        if REM_SYS in oid:
            sys_map[oid] = val
        if REM_PORT in oid:
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
    """
    Parses IF-MIB::ifPhysAddress.<ifIndex> entries.
    Returns:
      [{"ifIndex": "3", "mac": "aa:bb:cc:dd:ee:ff"}, ...]
    """
    results = set()

    for oid, val in rows:
        if IF_PHYS_ADDRESS not in oid:
            continue

        mac = decode_mac(val)

        if mac and mac != "00:00:00:00:00:00":
            results.add(mac)

    return list(results)

def parse_station_table(rows: List[Tuple[str, str]], model: StationTableModel):
    stations: Dict[Tuple[str, ...], Dict] = {}

    root_parts = model.root_oid.split(".")
    root_len = len(root_parts)

    for oid, val in rows:
        if not oid.startswith(model.root_oid):
            continue

        parts = oid.split(".")

        # FIELD ID immediately after root_oid
        if len(parts) <= root_len:
            continue

        field_id = parts[root_len]

        # INDEX = everything after FIELD
        index = tuple(parts[root_len + 1:])

        if index not in stations:
            stations[index] = {}

        key = model.field_map.get(field_id)
        if key is None:
            continue

        # Handle MAC
        if field_id == model.mac_field:
            stations[index][key] = decode_mac(val)
        else:
            stations[index][key] = val

    # 3) Convert dictionary → list
    result = []
    for idx, st in stations.items():
        mac = st.get("mac")
        if not mac:
            continue

        st["id"] = f"STA-{mac}"
        st["type"] = "wifi-station"
        result.append(st)

    return result

# ---------------------------------------------------------------------------
# Device discovery
# ---------------------------------------------------------------------------
async def discover_device(ip: str, mapping: MappingTable) -> Dict:
    print(f"\n=== Discovering {ip} ===")
    device = {"ip": ip, "name": None, "descr": None, "neighbors": [], "stations": []}

    # sysName/sysDescr
    name = await snmp_get(ip, OID_SYSNAME)
    if name:
        device["name"] = name
        mapping.learn_name(name, ip)
        print("sysName:", name)

    descr = await snmp_get(ip, OID_SYSDESCR)
    device["descr"] = descr
    print("sysDescr:", descr)

    if_mac_rows = await snmp_walk(ip, IF_PHYS_ADDRESS)

    if_mac_list = []
    if if_mac_rows:
      if_mac_list = parse_if_phys_address(if_mac_rows)
      print(f"Interface MACs found: {len(if_mac_list)}")

      for if_mac in if_mac_list:
        mapping.learn_mac(if_mac, ip)

    device["interface_macs"] = if_mac_list

    # LLDP
    lldp_pairs = await snmp_walk(ip, LLDP_REM_TABLE)
    if lldp_pairs:
        lldp_neighbors = parse_lldp(lldp_pairs)
        if lldp_neighbors:
            device["neighbors"] = lldp_neighbors
            print("LLDP neighbors:", len(lldp_neighbors))
        else:
            print("LLDP walk returned other MIBs, no LLDP entries found.")

    station_rows = await snmp_walk(ip, CURRENT_STATION_MODEL.root_oid)

    stations = []
    if station_rows:
        stations = parse_station_table(station_rows, CURRENT_STATION_MODEL)
        device["stations"] = stations
        print("STAs found:", len(stations))

    device["stations"] = stations
    return device


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------
def build_graph(devices: List[Dict]):
    nodes: Dict[str, Dict] = {}
    links: List[Dict] = []

    for d in devices:
        nid = d.get("name") or d["ip"]
        nodes[nid] = {"id": nid, "ip": d["ip"], "interface_macs": d["interface_macs"], "sys_descr": d.get("descr")}

        # neighbors (LLDP / CDP unified)
        for nbr in d.get("neighbors", []):
            target = nbr.get("remote_sys_name") or (nbr.get("remote_address") or "")
            if not target:
                target = "<unknown>"
            nodes.setdefault(target, {"id": target})
            if "remote_port" in nbr:
                link_type = "cdp"
                port = nbr.get("remote_port")
            elif nbr.get("remote_port_id"):
                link_type = "lldp"
                port = nbr.get("remote_port_id")
            else:
                link_type = "unknown"
                port = None
            links.append({"source": nid, "target": target, "type": link_type, "port": port})

        # intelbras wireless stations
        for st in d.get("stations", []):
          if "mac" not in st or len(st["mac"]) < 8:
            continue

          station_node = f"STA-{st['mac']}"
          nodes.setdefault(station_node, {
              "id": station_node,
              "mac": st["mac"],
              "ip": st.get("ip"),
              "rssi": st.get("rssi"),
              "tx_bytes": st.get("tx_bytes"),
              "rx_bytes": st.get("rx_bytes"),
              "type": "wifi-station"
          })
          links.append({"source": nid, "target": station_node, "type": "wifi-station", "signal": st.get("rssi")})

    return {"nodes": list(nodes.values()), "links": links}

def enrich_graph_with_nmap(graph, nmap_map, mapping):
  for node in graph["nodes"]:
    if node.get("type") == "wifi-station":
      mac = node.get("mac")
      if mac:
        mac_norm = mac.upper()
        if not node.get("ip") and mac_norm in nmap_map:
          node["ip"] = nmap_map[mac_norm]
          mapping.learn_mac(mac_norm, node['ip'])
  return graph

# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------
async def discover_topology(seed_ips: List[str]):
    mapping = MappingTable()

    print("\n=== Starting Topology Discovery ===")
    print("Seeds:", seed_ips)

    nmap_task = asyncio.create_task(run_nmap_scan(NETWORK_TO_SCAN))

    # discover seeds in parallel
    discovered = await asyncio.gather(*[discover_device(ip, mapping) for ip in seed_ips])

    graph = build_graph(discovered)

    print("Waiting for Nmap results...")
    nmap_results = await nmap_task

    updated_graph = enrich_graph_with_nmap(graph, nmap_results, mapping)

    print("\n=== NODES ===")
    for n in updated_graph["nodes"]:
        print(n)

    print("\n=== LINKS ===")
    for l in updated_graph["links"]:
        print(l)

    return updated_graph

# ---------------------------------------------------------------------------
# CLI Runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    seed = input("Enter seed IP: ").strip()
    if seed:
        asyncio.run(discover_topology([seed]))
