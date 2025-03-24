# import src.shared.http_exceptions as http_exceptions
# from bson import ObjectId
# from fastapi import APIRouter, Depends, HTTPException, Request, status
# from fastapi.responses import StreamingResponse
# from src.controllers.monitor.MonitorController import MonitorController
# from src.database.db import DB, get_db
# from src.repositories.device import DeviceRepository
# from src.repositories.network import NetworkRepository

# router = APIRouter(prefix='/monitor', tags=['monitor', 'statistics'])




# @router.get('/{network_id}/devices-status', status_code=status.HTTP_200_OK)
# async def monitor_devices_status(network_id: str, request: Request, db: DB = Depends(get_db)):
#   try:
#     existent_network = await NetworkRepository.get_network_by(db, field='_id', value=network_id)
#     if not existent_network:
#       raise http_exceptions.DOCUMENT_INEXISTENT(document='rede')

#     devices_ids = [ObjectId(x) for x in existent_network.devices]
#     all_network_devices_info = await DeviceRepository.get_all_devices_from_list(db, list_of_devices=devices_ids)
#     monitorController = MonitorController(all_network_devices_info.devices)
#     return StreamingResponse(monitorController.check_devices_status(), media_type='text/event-stream')
#   except HTTPException as h:
#     raise h
#   except Exception as e:
#     raise http_exceptions.INTERNAL_ERROR(detail=str(e))
