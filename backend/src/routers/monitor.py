import asyncio
from typing import Dict, List

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from src.database.db import DB, get_db
from src.models.Device import Device
from src.models.Monitor import ActionStatus, DeviceMonitorUpdate
from src.models.Profile import Profile
from src.repositories.device import DeviceRepository
from src.repositories.profile import ProfileRepository
from src.services.device_driver import DeviceDriver
from src.services.monitor_service import manager  # Import the singleton
from src.shared.utils import async_ping

router = APIRouter(prefix='/monitor', tags=['monitor'])

WEBSOCKET_POLL_RATE = 10  # Seconds

async def monitor_loop():
    """
    The main background task that runs every 10 seconds,
    polls all devices, and broadcasts updates.
    """
    # Wait for app to be ready
    await asyncio.sleep(5)
    print("Starting monitor loop...")

    while True:
        await asyncio.sleep(WEBSOCKET_POLL_RATE)

        # 1. Get DB instance for this loop iteration
        db = get_db() # Get a new DB session

        try:
            # 2. Fetch all devices and profiles
            devices = await DeviceRepository.list_devices(db)
            profile_map = await ProfileRepository.get_all_profiles_as_map(db)

            if not devices.devices or not profile_map:
                print("Monitor loop: No devices or profiles found. Skipping.")
                continue

            # 3. Phase 1: Ping all devices
            ping_tasks = [async_ping(dev.ip_address) for dev in devices.devices]
            ping_results = await asyncio.gather(*ping_tasks, return_exceptions=True)

            monitor_updates: Dict[str, DeviceMonitorUpdate] = {}
            online_devices: List[Device] = []

            # Process ping results
            for i, res in enumerate(ping_results):
                dev = devices.devices[i]
                dev_id_str = str(dev.id)
                if isinstance(res, tuple) and res[0] is True:
                    # Device is Online
                    online_devices.append(dev)
                    monitor_updates[dev_id_str] = DeviceMonitorUpdate(
                        deviceId=dev_id_str,
                        online=True,
                        latency=res[1]   # Latency in ms
                    )
                else:
                    # Device is Offline
                    monitor_updates[dev_id_str] = DeviceMonitorUpdate(
                        deviceId=dev_id_str,
                        online=False,
                    )

            # 4. Phase 2: Run monitor actions for *online* devices
            action_tasks = []
            device_task_map = {} # To map results back to devices

            for dev in online_devices:
                profile = profile_map.get(dev.profileId)
                if not profile:
                    # TODO: set device inactive
                    continue

                # Create driver instance for this device
                driver = DeviceDriver(
                    device=dev,
                    profile=profile
                )

                # Find all monitor actions for this profile
                for action_name, action in profile.actions.items():
                    if action.actionType == 'monitor':
                        # Run the synchronous driver method in a thread
                        task = asyncio.to_thread(driver.execute_action, action_name)
                        action_tasks.append(task)
                        # Store which device and action this task belongs to
                        device_task_map[task] = (str(dev.id), action_name, action)

            # Run all monitor actions in parallel
            action_results = await asyncio.gather(*action_tasks, return_exceptions=True)

            # 5. Aggregate action results
            for task, res in zip(action_tasks, action_results):
                dev_id_str, action_name, action = device_task_map[task]

                if isinstance(res, Exception):
                    print(f"Monitor Error: Device {dev_id_str} action '{action_name}' failed: {res}")
                    # If any action fails, mark device as 'error'
                    monitor_updates[dev_id_str].actionsStatuses[action_name] = ActionStatus(status='error', message=str(res))
                elif isinstance(res, dict) and res:
                    # Merge the stats from this action into the device's update
                    monitor_updates[dev_id_str].stats.update(res)
                    monitor_updates[dev_id_str].actionsStatuses[action_name] = ActionStatus(status='success')
                    # Check for topology data
                    if action_name == 'get-neighbors' and res.get('neighbors'):
                         monitor_updates[dev_id_str].neighbors = res.get('neighbors')

            # 6. Broadcast the final list of updates
            final_update_list = [update.model_dump() for update in monitor_updates.values()]
            if final_update_list:
                await manager.broadcast(final_update_list)

        except Exception as e:
            print(f"Error in monitor_loop: {e}")
        finally:
            # Close the DB client if it's motor
            if hasattr(db, "_DB__client"):
                pass # Let FastAPI handle dependency closing if needed

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  print('websocket')
  await manager.connect(websocket)
  try:
      while True:
          # Keep connection alive
          await websocket.receive_text()
  except WebSocketDisconnect:
      manager.disconnect(websocket)
