import json
from typing import Any, List

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: Any):
        """
        Broadcasts a JSON message to all connected clients.
        """
        message_json = json.dumps(data)
        for connection in self.active_connections:
            try:
                await connection.send_text(message_json)
            except Exception:
                # Client disconnected uncleanly
                self.active_connections.remove(connection)

# Create a single instance to be imported by other files
manager = ConnectionManager()
