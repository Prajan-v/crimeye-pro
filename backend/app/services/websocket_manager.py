import asyncio
import json
from typing import Dict, Set, Any
from fastapi import WebSocket
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        # Store active connections
        self.active_connections: Set[WebSocket] = set()
        # Store connections by camera ID for targeted broadcasts
        self.camera_subscriptions: Dict[str, Set[WebSocket]] = {}
        # Connection metadata
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str = None):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        self.connection_metadata[websocket] = {
            'user_id': user_id,
            'connected_at': datetime.utcnow().isoformat(),
            'subscribed_cameras': set()
        }
        logger.info(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message({
            'type': 'connection',
            'status': 'connected',
            'message': 'Connected to CrimeEye-Pro real-time service',
            'timestamp': datetime.utcnow().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        
        # Remove from camera subscriptions
        if websocket in self.connection_metadata:
            subscribed_cameras = self.connection_metadata[websocket].get('subscribed_cameras', set())
            for camera_id in subscribed_cameras:
                if camera_id in self.camera_subscriptions:
                    self.camera_subscriptions[camera_id].discard(websocket)
                    if not self.camera_subscriptions[camera_id]:
                        del self.camera_subscriptions[camera_id]
            
            del self.connection_metadata[websocket]
        
        logger.info(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients."""
        disconnected = set()
        
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_to_camera_subscribers(self, camera_id: str, message: Dict[str, Any]):
        """Broadcast a message to all clients subscribed to a specific camera."""
        if camera_id not in self.camera_subscriptions:
            return
        
        disconnected = set()
        subscribers = self.camera_subscriptions[camera_id].copy()
        
        for connection in subscribers:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to camera subscriber: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    def subscribe_to_camera(self, websocket: WebSocket, camera_id: str):
        """Subscribe a connection to camera updates."""
        if camera_id not in self.camera_subscriptions:
            self.camera_subscriptions[camera_id] = set()
        
        self.camera_subscriptions[camera_id].add(websocket)
        
        if websocket in self.connection_metadata:
            self.connection_metadata[websocket]['subscribed_cameras'].add(camera_id)
        
        logger.info(f"📹 Client subscribed to camera {camera_id}")
    
    def unsubscribe_from_camera(self, websocket: WebSocket, camera_id: str):
        """Unsubscribe a connection from camera updates."""
        if camera_id in self.camera_subscriptions:
            self.camera_subscriptions[camera_id].discard(websocket)
            
            if not self.camera_subscriptions[camera_id]:
                del self.camera_subscriptions[camera_id]
        
        if websocket in self.connection_metadata:
            self.connection_metadata[websocket]['subscribed_cameras'].discard(camera_id)
        
        logger.info(f"📹 Client unsubscribed from camera {camera_id}")
    
    async def send_detection_update(self, camera_id: str, detection_data: Dict[str, Any]):
        """Send detection update to subscribed clients."""
        message = {
            'type': 'detection',
            'camera_id': camera_id,
            'data': detection_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        await self.broadcast_to_camera_subscribers(camera_id, message)
    
    async def send_camera_status_update(self, camera_id: str, status: str):
        """Send camera status update to all clients."""
        message = {
            'type': 'camera_status',
            'camera_id': camera_id,
            'status': status,
            'timestamp': datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def send_alert(self, alert_data: Dict[str, Any]):
        """Send high-priority alert to all clients."""
        message = {
            'type': 'alert',
            'data': alert_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    async def send_fps_update(self, camera_id: str, fps: float):
        """Send FPS update for a camera."""
        message = {
            'type': 'fps_update',
            'camera_id': camera_id,
            'fps': round(fps, 1),
            'timestamp': datetime.utcnow().isoformat()
        }
        await self.broadcast_to_camera_subscribers(camera_id, message)
    
    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)
    
    def get_camera_subscriber_count(self, camera_id: str) -> int:
        """Get the number of subscribers for a specific camera."""
        return len(self.camera_subscriptions.get(camera_id, set()))

# Global connection manager instance
manager = ConnectionManager()
