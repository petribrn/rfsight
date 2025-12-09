import asyncio
from typing import List

from fastapi import HTTPException
from src.models.Actions import ActionSequencePayload, ActionSequenceResponse
from src.models.Device import Device
from src.models.Profile import Profile
from src.services.device_driver import DeviceDriver


class ConfigController:

  @staticmethod
  async def execute_sequence(
      device: Device,
      profile: Profile,
      sequence: ActionSequencePayload
    ) -> List[ActionSequenceResponse]:

      driver = DeviceDriver(device=device, profile=profile)
      results: List[ActionSequenceResponse] = []

      for action_payload in sequence.actions:
        action_name = action_payload.action_name
        payload = action_payload.payload

        action_to_run = profile.actions.get(action_name)

        # Validate action
        if not action_to_run:
          results.append(ActionSequenceResponse(
              action=action_name,
              status="failed",
              message=f"Ação '{action_name}' não encontrada no profile."
          ))
          break

        if action_to_run.actionType != "manage":
          results.append(ActionSequenceResponse(
              action=action_name,
              status="failed",
              message=f"Ação '{action_name}' não é do tipo 'manage'."
          ))
          break

        try:
          print(f"Executing action '{action_name}' for device {device.ip_address}...")

          # Execute action thread-safe
          result = await asyncio.to_thread(
            driver.execute_action,
            action_name,
            payload
          )

          results.append(ActionSequenceResponse(
            action=action_name,
            status="success",
            message=f"Ação '{action_name}' executada com sucesso.",
            data=result
          ))

        except HTTPException as httpex:
          results.append(ActionSequenceResponse(
            action=action_name,
            status="failed",
            message=str(httpex.detail)
          ))
          break

        except Exception as e:
          results.append(ActionSequenceResponse(
            action=action_name,
            status="failed",
            message=str(e)
          ))
          break

      return results
