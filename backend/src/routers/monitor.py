from bson import ObjectId
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from src.services.oauth import verify_token
from src.services.websocket_conn_manager import websocket_connection_manager

router = APIRouter(prefix='/monitor', tags=['monitor'])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept to get token
    await websocket_connection_manager.connect(websocket)

    token = websocket.query_params.get("token")

    if not token:
      await websocket.close(1008)
      websocket_connection_manager.disconnect(websocket)  # Unauthorized
      return

    # Verify token
    try:
        token_data = verify_token(token, token_mode="access_token")
    except Exception:
      await websocket.close(1008)
      websocket_connection_manager.disconnect(websocket)
      return

    # Check user
    db = websocket.app.state.db
    user_data = await db.user_collection.find_one({"_id": ObjectId(token_data.sub)})

    if not user_data:
      await websocket.close(1008)
      websocket_connection_manager.disconnect(websocket)
      return

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_connection_manager.disconnect(websocket)
