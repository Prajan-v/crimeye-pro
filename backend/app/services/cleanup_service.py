import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.detection_frame import DetectionFrame
from app.models.camera import Camera
from app.services.frame_storage import frame_storage
from app.services.notification_service import notification_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class CleanupService:
    """Service for scheduled cleanup and maintenance tasks."""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    async def start(self):
        """Start the cleanup scheduler."""
        if self.is_running:
            return
        
        # Schedule daily cleanup at 2 AM
        self.scheduler.add_job(
            self.daily_cleanup,
            CronTrigger(hour=2, minute=0),
            id='daily_cleanup',
            name='Daily Frame Cleanup',
            replace_existing=True
        )
        
        # Schedule daily summary at 6 AM
        self.scheduler.add_job(
            self.daily_summary,
            CronTrigger(hour=6, minute=0),
            id='daily_summary',
            name='Daily Summary Report',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        logger.info("Cleanup service started")
    
    async def stop(self):
        """Stop the cleanup scheduler."""
        if self.scheduler.running:
            self.scheduler.shutdown()
        self.is_running = False
        logger.info("Cleanup service stopped")
    
    async def daily_cleanup(self):
        """Perform daily cleanup tasks."""
        try:
            logger.info("Starting daily cleanup...")
            
            # Delete old frames based on retention policy
            deleted_count = await frame_storage.delete_old_frames(settings.FRAME_RETENTION_DAYS)
            
            logger.info(f"Daily cleanup completed. Deleted {deleted_count} old frames.")
            
        except Exception as e:
            logger.error(f"Error during daily cleanup: {e}")
    
    async def daily_summary(self):
        """Generate and send daily summary report."""
        try:
            logger.info("Generating daily summary...")
            
            # Get summary data for yesterday
            yesterday = datetime.utcnow() - timedelta(days=1)
            start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            async with get_db() as db:
                # Get detection counts by threat level
                result = await db.execute(
                    select(
                        DetectionFrame.threat_level,
                        func.count(DetectionFrame.id).label('count')
                    )
                    .where(DetectionFrame.timestamp.between(start_date, end_date))
                    .group_by(DetectionFrame.threat_level)
                )
                
                threat_counts = {row.threat_level: row.count for row in result}
                
                # Get active cameras count
                camera_result = await db.execute(select(func.count(Camera.id)))
                active_cameras = camera_result.scalar()
                
                # Prepare summary data
                summary_data = {
                    'date': yesterday.strftime('%Y-%m-%d'),
                    'total_detections': sum(threat_counts.values()),
                    'high_threat': threat_counts.get('high', 0),
                    'medium_threat': threat_counts.get('medium', 0),
                    'low_threat': threat_counts.get('low', 0),
                    'active_cameras': active_cameras
                }
                
                # Send summary email
                await notification_service.send_daily_summary(summary_data)
                
                logger.info("Daily summary sent successfully")
                
        except Exception as e:
            logger.error(f"Error generating daily summary: {e}")
    
    async def manual_cleanup(self, retention_days: int = None):
        """Manually trigger cleanup."""
        days = retention_days or settings.FRAME_RETENTION_DAYS
        return await frame_storage.delete_old_frames(days)
    
    async def get_storage_stats(self) -> dict:
        """Get storage statistics."""
        try:
            async with get_db() as db:
                # Get total frames count
                result = await db.execute(select(func.count(DetectionFrame.id)))
                total_frames = result.scalar()
                
                # Get frames by threat level
                result = await db.execute(
                    select(
                        DetectionFrame.threat_level,
                        func.count(DetectionFrame.id).label('count')
                    )
                    .group_by(DetectionFrame.threat_level)
                )
                threat_counts = {row.threat_level: row.count for row in result}
                
                # Get oldest frame date
                result = await db.execute(
                    select(func.min(DetectionFrame.timestamp))
                )
                oldest_frame = result.scalar()
                
                return {
                    'total_frames': total_frames,
                    'threat_counts': threat_counts,
                    'oldest_frame': oldest_frame.isoformat() if oldest_frame else None
                }
                
        except Exception as e:
            logger.error(f"Error getting storage stats: {e}")
            return {}

# Global cleanup service
cleanup_service = CleanupService()
