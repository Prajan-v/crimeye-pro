import asyncio
import httpx
import numpy as np
import cv2
import base64
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

@dataclass
class Detection:
    """Detection result from YOLO."""
    class_id: int
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    threat_level: str

class YOLOIntegrationService:
    """Service for integrating with existing Flask YOLO service."""
    
    def __init__(self):
        self.yolo_url = settings.YOLO_SERVICE_URL
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.fps = settings.YOLO_FPS
        self.frame_interval = 1.0 / self.fps
        self.last_process_time = {}
        self.client = None
        
        # Threat level mapping based on YOLO service classes
        self.threat_classes = {
            'knife': 'high',
            'scissors': 'high',
            'gun': 'high',
            'weapon': 'high',
            'backpack': 'medium',
            'handbag': 'medium',
            'suitcase': 'medium',
            'person': 'low',
            'vehicle': 'low',
            'car': 'low',
            'truck': 'low'
        }
    
    async def initialize(self):
        """Initialize the HTTP client for YOLO service."""
        try:
            self.client = httpx.AsyncClient(timeout=5.0)
            
            # Test connection to YOLO service
            response = await self.client.get(f"{self.yolo_url}/yolo-health")
            if response.status_code == 200:
                logger.info(f"✅ Connected to YOLO service at {self.yolo_url}")
            else:
                logger.warning(f"⚠️ YOLO service responded with status {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to YOLO service: {e}")
            logger.info("System will continue without YOLO detection")
    
    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
    
    def should_process_frame(self, camera_id: str) -> bool:
        """Check if enough time has passed to process next frame (FPS control)."""
        current_time = asyncio.get_event_loop().time()
        last_time = self.last_process_time.get(camera_id, 0)
        
        if current_time - last_time >= self.frame_interval:
            self.last_process_time[camera_id] = current_time
            return True
        return False
    
    async def process_frame(self, frame: np.ndarray, camera_id: str) -> Optional[Dict[str, Any]]:
        """Process a single frame through YOLO service."""
        if not self.client:
            logger.warning("YOLO client not initialized")
            return None
        
        # FPS control - skip if not enough time passed
        if not self.should_process_frame(camera_id):
            return None
        
        try:
            # Convert frame to base64
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            frame_data = f"data:image/jpeg;base64,{frame_base64}"
            
            # Send to YOLO service
            response = await self.client.post(
                f"{self.yolo_url}/detect-frame",
                json={"frame": frame_data},
                timeout=2.0  # 2 second timeout for low latency
            )
            
            if response.status_code == 200:
                result = response.json()
                return result
            else:
                logger.error(f"YOLO service error: {response.status_code}")
                return None
                
        except httpx.TimeoutException:
            logger.warning(f"YOLO request timeout for camera {camera_id}")
            return None
        except Exception as e:
            logger.error(f"Error processing frame through YOLO: {e}")
            return None
    
    def parse_yolo_response(self, yolo_response: Dict[str, Any]) -> tuple[List[str], str, bool]:
        """Parse YOLO service response and extract alerts, threat level, and trigger status."""
        if not yolo_response or not yolo_response.get('success'):
            return [], 'low', False
        
        alerts = yolo_response.get('yolo_alerts', [])
        trigger_llm = yolo_response.get('trigger_llm', False)
        person_count = yolo_response.get('person_count', 0)
        
        # Determine overall threat level
        threat_level = 'low'
        for alert in alerts:
            if 'CRITICAL' in alert or 'Weapon' in alert:
                threat_level = 'high'
                break
            elif 'MEDIUM' in alert or 'Suspicious' in alert:
                threat_level = 'medium'
        
        return alerts, threat_level, trigger_llm
    
    def create_detection_metadata(
        self, 
        alerts: List[str], 
        threat_level: str, 
        person_count: int = 0
    ) -> Dict[str, Any]:
        """Create detection metadata for storage."""
        return {
            'alerts': alerts,
            'threat_level': threat_level,
            'person_count': person_count,
            'timestamp': asyncio.get_event_loop().time()
        }
    
    async def health_check(self) -> bool:
        """Check if YOLO service is healthy."""
        try:
            if not self.client:
                return False
            
            response = await self.client.get(
                f"{self.yolo_url}/yolo-health",
                timeout=2.0
            )
            return response.status_code == 200
        except Exception:
            return False

# Global YOLO integration service
yolo_integration = YOLOIntegrationService()
