import asyncio
from datetime import datetime
from typing import Any, Dict, List, Tuple

import src.configs.constants as constants
from fastapi import FastAPI, HTTPException
from src.models.Device import Device
from src.models.Monitor import ActionStatus, DeviceMonitorUpdate
from src.models.Profile import Profile
from src.models.TopologyMapping import MappingTable
from src.models.WebsocketMessage import WebsocketMessage
from src.repositories.device import DeviceRepository
from src.repositories.network import NetworkRepository
from src.repositories.profile import ProfileRepository
from src.services.device_driver import DeviceDriver
from src.services.discovery import *
from src.services.websocket_conn_manager import websocket_connection_manager
from src.shared.utils import async_ping


class MonitorController:
  topology_lock = asyncio.Lock()

  @staticmethod
  async def device_monitor_loop(app: FastAPI):
    # Wait for app to be ready
    await asyncio.sleep(5)
    print("Starting monitor loop...")

    db = app.state.db

    while True:
      try:
        async with MonitorController.topology_lock:
          # Get latest devices and profiles list
          updated_device_list = await DeviceRepository.list_devices(db)
          updated_profiles_map = await ProfileRepository.get_all_profiles_as_map(db)

          if not updated_device_list.devices or not updated_profiles_map:
            print("Monitor loop: No devices or profiles found. Skipping.")
            continue

          # Ping all devices and get latency
          ping_tasks = [async_ping(dev.ip_address) for dev in updated_device_list.devices]
          ping_results = await asyncio.gather(*ping_tasks, return_exceptions=True)

          monitor_updates: Dict[str, DeviceMonitorUpdate] = {}
          online_devices: List[Device] = []

          # Process ping results
          for i, res in enumerate(ping_results):
            dev = updated_device_list.devices[i]
            dev_id_str = str(dev.id)
            if isinstance(res, tuple) and res[0] is True:
              # Device is Online
              online_devices.append(dev)
              monitor_updates[dev_id_str] = DeviceMonitorUpdate(
                deviceId=dev_id_str,
                online=True,
                latency=res[1]
              )
            else:
              # Device is Offline
              monitor_updates[dev_id_str] = DeviceMonitorUpdate(
                  deviceId=dev_id_str,
                  online=False,
              )

          # Run all monitor actions for online devices
          device_tasks = []

          for dev in online_devices:
            profile = updated_profiles_map.get(dev.profileId)
            if not profile:
              continue

            # Create driver instance for this device
            driver = DeviceDriver(
              device=dev,
              profile=profile
            )

            # Create a single task to run all monitor actions for this device
            task = asyncio.to_thread(MonitorController.__run_device_monitor_sync, driver, profile)
            device_tasks.append((dev_id_str, task))

          # Gather results from all device threads
          all_device_results = await asyncio.gather(
            *[task for _, task in device_tasks],
            return_exceptions=True
          )

          # Aggregate results
          for (dev_id_str, _), res in zip(device_tasks, all_device_results):
            if isinstance(res, Exception):
              # The whole device task failed (e.g., driver init)
              monitor_updates[dev_id_str].actionsStatuses['driver'] = ActionStatus(status='error', message=str(res))
            else:
              stats, actions_statuses = res
              monitor_updates[dev_id_str].stats = stats
              monitor_updates[dev_id_str].actionsStatuses = actions_statuses

          # Broadcast through ws the final list of updates from monitoring
          final_update_list = [update.model_dump() for update in monitor_updates.values()]
          for monitor_update in final_update_list:
            monitor_update['timestamp'] = datetime.now(tz=constants.LOCAL_TIMEZONE).isoformat()
          if final_update_list:
            # Fetch devices and networks to build hierarchy
            all_devices = updated_device_list.devices
            networks = await NetworkRepository.list_networks(db)

            # Build lookup maps
            device_to_network = {str(d.id): str(d.networkId) for d in all_devices}
            network_to_org = {str(n.id): str(n.organizationId) for n in networks.networks}

            # Final aggregation structure
            aggregated = {}

            for d in final_update_list:
              dev_id = d["deviceId"]
              network_id = device_to_network.get(dev_id, "unassigned")
              organization_id = network_to_org.get(network_id, "unassigned")

              org_entry = aggregated.setdefault(organization_id, {"networks": {}})
              net_entry = org_entry["networks"].setdefault(network_id, {"devices": {}})

              net_entry["devices"][dev_id] = d

            await websocket_connection_manager.broadcast(WebsocketMessage(
              messageType='deviceMonitor',
              data={"organizations": aggregated}
            ).model_dump())
      except Exception as e:
        print(f"Error in monitor_loop: {e}")
      finally:
        await asyncio.sleep(constants.WEBSOCKET_DEVICE_MONITOR_POLL_RATE)

  def __run_device_monitor_sync(driver: DeviceDriver, profile: Profile) -> Tuple[Dict[str, Any], Dict[str, ActionStatus]]:

    stats = {}
    actions_statuses = {}

    # Find and execute all monitor actions
    for action_name, action in profile.actions.items():
      if action.actionType == 'monitor':
        try:
          result = driver.execute_action(action_name)

          if isinstance(result, dict) and result:
              if result['mapped']:
                stats.update(result['actionResponse'])
              else:
                stats.update({'unmappedData': result['actionResponse']})
          else:
              # Store simple results (e.g., from SSH)
              stats[action_name] = result

          actions_statuses[action_name] = ActionStatus(status='success')
        except HTTPException as httpex:
          print(f"Monitor Error: Device {driver.device.ip_address} action '{action_name}' failed: {httpex.detail}")
          actions_statuses[action_name] = ActionStatus(status='error', message=str(httpex.detail))
        except (HTTPException, Exception) as e:
          print(f"Monitor Error: Device {driver.device.ip_address} action '{action_name}' failed: {e}")
          actions_statuses[action_name] = ActionStatus(status='error', message=str(e))

    return stats, actions_statuses

  @staticmethod
  async def topology_loop(app: FastAPI):
    print('Running topology discovery')
    await asyncio.sleep(5)
    while True:
      graphs = await MonitorController.discover_networks_topology(app)
      websocket_msg = WebsocketMessage(messageType='topology', data={'organizations': graphs})
      await websocket_connection_manager.broadcast(websocket_msg.model_dump())
      await asyncio.sleep(constants.WEBSOCKET_TOPOLOGY_POLL_RATE)

  @staticmethod
  async def discover_networks_topology(app: FastAPI):
    db = app.state.db
    try:
      networks = await NetworkRepository.list_networks(db=db)
      if not networks or not networks.networks:
        return {}

      tasks = []
      for network in networks.networks:
        # create a task per-network
        t = asyncio.create_task(MonitorController.__single_network_discovery(db, network))
        tasks.append((network.id, t))

      raw_results = {}
      # wait for all to complete, catching exceptions per-network
      for network_id, task in tasks:
        try:
          graph = await task
          raw_results[str(network_id)] = graph
        except Exception as e:
          # log and continue; one network failing doesn't stop others
          print(f"[Network {network_id}] discovery failed: {e}")
          raw_results[str(network_id)] = {"error": str(e)}

      aggregated: Dict[str, Dict] = {}

      for network in networks.networks:
        net_id = str(network.id)
        org_id = str(network.organizationId)
        graph = raw_results.get(net_id, {})

        org_entry = aggregated.setdefault(org_id, {"networks": {}})
        org_entry["networks"][net_id] = graph

      return aggregated
    except (Exception, HTTPException) as e:
      print(f'Erro ao realizar discovery de topologia das redes: {e}')
      return {}

  @staticmethod
  async def __single_network_discovery(db, network) -> Dict:
    """
    Perform discovery for a single network.
    Returns a graph dict (nodes, links) or an error dict.
    """
    mapping = MappingTable()
    try:

      network_devices = await DeviceRepository.list_devices_by_compound_filter(
        db=db,
        compound_filter={'networkId': {'$in': [network.id]}}
      )
      if not network_devices or not network_devices.devices:
        return {"nodes": [], "links": [], "network": str(network.id)}

      profiles_map = await ProfileRepository.get_all_profiles_as_map(db=db)

      seeds: Dict[str, str | Profile] = []
      for dev in network_devices.devices:
        if profiles_map:
          dev_profile = profiles_map[dev.profileId] if dev.profileId in profiles_map else None
        seeds.append({'ip': dev.ip_address, 'profile': dev_profile, 'deviceId': str(dev.id)})

      print(f"\n=== Starting Topology Discovery for network {network.id} ({network.network_cidr}) ===")

      # run scan task for getting stations IPs
      scan_task = asyncio.create_task(arp_sweep_async(network.network_cidr, iface=constants.DOCKER_CONTAINER_API_INTERFACE))

      # discover seeds in parallel
      discover_tasks = [MonitorController.__discover_device(seed['ip'], mapping, seed['profile'], seed['deviceId']) for seed in seeds]
      discovered = await asyncio.gather(*discover_tasks, return_exceptions=False)

      graph = MonitorController.__build_graph(discovered, mapping)

      # wait scan results and then enrich (add IP for stations)
      print(f"[Network {network.id}] Waiting for ARP results...")
      arp_results = await scan_task

      updated_graph = MonitorController.__enrich_graph_with_nmap(graph, arp_results, mapping)

      async with MonitorController.topology_lock:
        for dev in network_devices.devices:
          name = dev.name or None
          mapped_ip = mapping.resolve_name(name) if name else None
          if mapped_ip and mapped_ip != dev.ip_address:
            try:
              async with constants.DEVICE_UPDATE_LOCK:
                await DeviceRepository.update_device_ip(db, dev.id, mapped_ip)
            except (Exception, HTTPException) as e:
              print(f'Ocorreu um erro ao atualizar o IP do dispositivo {dev.name}: {e}')

      return {"nodes": updated_graph["nodes"], "links": updated_graph["links"], "network": str(network.id)}

    except Exception as e:
      print(f"[Network {getattr(network,'id', '?')}] discovery exception: {e}")
      return {"error": str(e), "network": str(getattr(network, "id", "unknown"))}

  @staticmethod
  async def __discover_device(ip: str, mapping: MappingTable, profile: Profile | None, deviceId: str | None) -> Dict:
    print(f"\n=== Discovering {ip} ===")
    device = {"ip": ip, "name": None, "descr": None, "neighbors": [], "stations": []}
    if deviceId:
      device.update({'id': deviceId})

    # sysName/sysDescr
    name = await snmp_get(ip, constants.OID_SYSNAME)
    if name:
        device["name"] = name
        mapping.learn_name(name, ip)
        print("sysName:", name)

    descr = await snmp_get(ip, constants.OID_SYSDESCR)
    device["descr"] = descr
    print("sysDescr:", descr)

    # Interfaces physical addresses
    if_mac_rows = await snmp_walk(ip, constants.OID_IF_PHYS_ADDRESS)

    if_mac_list = []
    if if_mac_rows:
      if_mac_list = parse_if_phys_address(if_mac_rows)
      print(f"Interface MACs found: {len(if_mac_list)}")

      for if_mac in if_mac_list:
        mapping.learn_mac(if_mac, ip)

    device["interface_macs"] = if_mac_list

    # LLDP neighbors
    lldp_pairs = await snmp_walk(ip, constants.OID_LLDP_REM_TABLE)
    if lldp_pairs:
        lldp_neighbors = parse_lldp(lldp_pairs)
        if lldp_neighbors:
            device["neighbors"] = lldp_neighbors
            print("LLDP neighbors:", len(lldp_neighbors))
        else:
            print("LLDP walk returned other MIBs, no LLDP entries found.")

    if profile:
      # STA mapping
      station_rows = await snmp_walk(ip, profile.stationTable.root_oid)

      stations = []
      if station_rows:
          stations = parse_station_table(station_rows, profile.stationTable)
          device["stations"] = stations
          print("STAs found:", len(stations))

      device["stations"] = stations
    return device

  @staticmethod
  def __build_graph(devices: List[Dict], mapping: MappingTable):
    nodes: Dict[str, Dict] = {}
    links: List[Dict] = []

    def make_safe_id(primary: str | None, fallback_ip: str | None = None):
      if primary:
          return str(primary)

      if fallback_ip:
          return fallback_ip

      # Final fallback: generate stable unique ID
      h = hashlib.sha1(primary.encode()).hexdigest()[:8] if primary else "unknown"
      return f"UNKNOWN-{h}"

    for dev in devices:
      nid = make_safe_id(dev.get("id"), dev.get("ip"))

      # Create node
      nodes[nid] = {
        "id": nid,
        "ip": dev.get("ip"),
        "name": dev.get("name"),
        "interface_macs": dev.get("interface_macs", []),
        "sys_descr": dev.get("descr"),
        "type": "adoptedDevice",
      }

      # LLDP Neighbors
      for nbr in dev.get("neighbors", []):
        remote_name = nbr.get("remote_sys_name")
        remote_ip = nbr.get("remote_address")

        # Always resolve name → IP using mapping
        if remote_name:
            resolved_ip = mapping.resolve_name(remote_name)
        else:
            resolved_ip = remote_ip

        target_id = make_safe_id(resolved_ip, resolved_ip)

        # ensure target node exists
        nodes.setdefault(target_id, {"id": target_id, "type": "lldp"})

        links.append({
          "source": nid,
          "target": target_id,
          "type": "lldp",
          "port": nbr.get("remote_port_id")
        })

      # Stations
      for st in dev.get("stations", []):
        mac = st.get("mac")
        if not mac:
            continue

        station_id = f"STA-{mac}"

        # Dynamic station node: copy all SNMP fields
        node_data = {k: v for k, v in st.items()}

        node_data.update({
            "id": station_id,
            "type": "wifiStation"
        })

        nodes.setdefault(station_id, node_data)

        links.append({
            "source": nid,
            "target": station_id,
            "type": "wifiStation",
            "animated": True,
        })

    return {"nodes": list(nodes.values()), "links": links}

  @staticmethod
  def __enrich_graph_with_nmap(graph, arp_mac, mapping):
    for node in graph["nodes"]:
      if node.get("type") == "wifiStation":
        mac = node.get("mac")
        if mac:
          mac_norm = mac.upper()
          if not node.get("ip") and mac_norm in arp_mac:
            node["ip"] = arp_mac[mac_norm]
            mapping.learn_mac(mac_norm, node['ip'])
    return graph


