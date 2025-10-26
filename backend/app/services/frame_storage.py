import asyncio
import cv2
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import io
import json
from datetime import datetime
from app.core.database import get_db
from app.models.camera import Camera
from app.models.detection_frame import DetectionFrame
from app.models.detection_log import DetectionLog
from app.services.yolo_service import Detection, yolo_processor
from app.services.notification_service import send_alert
import logging

logger = logging.getLogger(__name__)

class FrameStorageService:
    """Service for storing detection frames and logs."""
    
    def __init__(self):
        self.storage_path = "static/detections"
    
    async def save_detection_frame(
        self, 
        camera_id: UUID, 
        frame: np.ndarray, 
        detections: List[Detection]
    ) -> Optional[UUID]:
        """Save a detection frame with metadata."""
        if not detections:
            return None  # Only save frames with detections
        
        try:
            # Convert frame to bytes
            _, frame_bytes = cv2.imencode('.jpg', frame)
            frame_data = frame_bytes.tobytes()
            
            # Prepare detections data
            detections_data = []
            for detection in detections:
                detections_data.append({
                    "class_id": detection.class_id,
                    "class_name": detection.class_name,
                    "confidence": detection.confidence,
                    "bbox": detection.bbox,
                    "threat_level": detection.threat_level
                })
            
            # Determine overall threat level
            threat_level = yolo_processor.get_overall_threat_level(detections)
            
            # Create detection frame record
            detection_frame = DetectionFrame(
                camera_id=camera_id,
                frame_data=frame_data,
                detections=detections_data,
                threat_level=threat_level,
                timestamp=datetime.utcnow()
            )
            
            # Save to database
            async with get_db() as db:
                db.add(detection_frame)
                await db.commit()
                await db.refresh(detection_frame)
                
                # Create detection logs
                for detection in detections:
                    detection_log = DetectionLog(
                        frame_id=detection_frame.id,
                        object_type=detection.class_name,
                        confidence=detection.confidence,
                        bounding_box={
                            "x": detection.bbox[0],
                            "y": detection.bbox[1],
                            "width": detection.bbox[2] - detection.bbox[0],
                            "height": detection.bbox[3] - detection.bbox[1]
                        },
                        timestamp=datetime.utcnow()
                    )
                    db.add(detection_log)
                
                await db.commit()
                
                # Send alert if high threat
                if threat_level == 'high':
                    await send_alert(
                        alert_type="high_threat",
                        frame_id=detection_frame.id,
                        message=f"High threat detection: {detection.class_name}",
                        sent_via="both"
                    )
                
                logger.info(f"Saved detection frame {detection_frame.id} with {len(detections)} detections")
                return detection_frame.id
                
        except Exception as e:
            logger.error(f"Error saving detection frame: {e}")
            return None
    
    async def get_detection_frames(
        self,
        camera_id: Optional[UUID] = None,
        threat_level: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[DetectionFrame]:
        """Get detection frames with optional filters."""
        async with get_db() as db:
            query = select(DetectionFrame)
            
            if camera_id:
                query = query.where(DetectionFrame.camera_id == camera_id)
            
            if threat_level:
                query = query.where(DetectionFrame.threat_level == threat_level)
            
            query = query.order_by(DetectionFrame.timestamp.desc()).limit(limit).offset(offset)
            
            result = await db.execute(query)
            return result.scalars().all()
    
    async def delete_old_frames(self, retention_days: int = 30):
        """Delete old detection frames based on retention policy."""
        from datetime import datetime, timedelta
        from sqlalchemy import delete
        
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        
        async with get_db() as db:
            # Delete old detection frames (cascade will handle related records)
            result = await db.execute(
                delete(DetectionFrame).where(DetectionFrame.timestamp < cutoff_date)
            )
            deleted_count = result.rowcount
            await db.commit()
            
            logger.info(f"Deleted {deleted_count} old detection frames")
            return deleted_count

# Global frame storage service
frame_storage = FrameStorageService()
