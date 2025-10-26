import asyncio
import cv2
import numpy as np
from ultralytics import YOLO
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

class YOLOProcessor:
    """YOLO processing service for real-time object detection."""
    
    def __init__(self):
        self.model = None
        self.confidence_threshold = settings.YOLO_CONFIDENCE_THRESHOLD
        self.fps = settings.YOLO_FPS
        self.frame_interval = 1.0 / self.fps
        self.last_process_time = 0
        
        # Threat level mapping
        self.threat_classes = {
            'person': 'medium',
            'knife': 'high',
            'gun': 'high',
            'weapon': 'high',
            'vehicle': 'low',
            'bicycle': 'low',
            'motorcycle': 'low'
        }
    
    async def initialize(self):
        """Initialize the YOLO model."""
        try:
            # Load YOLOv8 model (you can use different sizes: n, s, m, l, x)
            self.model = YOLO('yolov8n.pt')  # nano model for speed
            logger.info("YOLO model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize YOLO model: {e}")
            raise
    
    async def process_frame(self, frame: np.ndarray) -> List[Detection]:
        """Process a single frame and return detections."""
        current_time = asyncio.get_event_loop().time()
        
        # Skip processing if not enough time has passed (FPS control)
        if current_time - self.last_process_time < self.frame_interval:
            return []
        
        self.last_process_time = current_time
        
        try:
            # Run YOLO inference
            results = self.model(frame, conf=self.confidence_threshold, verbose=False)
            
            detections = []
            for result in results:
                if result.boxes is not None:
                    for box in result.boxes:
                        # Extract detection data
                        class_id = int(box.cls[0])
                        class_name = self.model.names[class_id]
                        confidence = float(box.conf[0])
                        bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                        
                        # Determine threat level
                        threat_level = self.threat_classes.get(class_name, 'low')
                        
                        detection = Detection(
                            class_id=class_id,
                            class_name=class_name,
                            confidence=confidence,
                            bbox=bbox,
                            threat_level=threat_level
                        )
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return []
    
    def get_overall_threat_level(self, detections: List[Detection]) -> str:
        """Determine overall threat level from detections."""
        if not detections:
            return 'low'
        
        threat_levels = [det.threat_level for det in detections]
        
        if 'high' in threat_levels:
            return 'high'
        elif 'medium' in threat_levels:
            return 'medium'
        else:
            return 'low'

# Global YOLO processor instance
yolo_processor = YOLOProcessor()
