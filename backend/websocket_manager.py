from typing import Dict, List, Any
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.matchmaking_queue: List[str] = []
        # Maps game_id to set of public_ids who are watching
        self.spectators: Dict[int, set] = {}

    async def connect(self, public_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[public_id] = websocket

    def disconnect(self, public_id: str, websocket: WebSocket):
        if public_id in self.active_connections:
            if self.active_connections[public_id] == websocket:
                del self.active_connections[public_id]

    async def send_personal_message(self, message: str, public_id: str):
        if public_id in self.active_connections:
            websocket = self.active_connections[public_id]
            from starlette.websockets import WebSocketState
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    print(f"DEBUG: Error sending to {public_id}: {e}")
                    self.disconnect(public_id, websocket)
            else:
                self.disconnect(public_id, websocket)
        else:
            print(f"DEBUG: User {public_id} NOT CONNECTED")

    async def broadcast(self, message: str):
        for public_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, public_id)

    async def broadcast_to_game(self, game_id: int, message: str, exclude_id: str = None):
        """Send message to both players and all spectators of a game."""
        targets = list(self.spectators.get(game_id, []))
        for pid in targets:
            if pid != exclude_id:
                await self.send_personal_message(message, pid)

manager = ConnectionManager()
