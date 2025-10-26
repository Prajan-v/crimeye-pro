from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, text
from datetime import datetime, timedelta
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.detection_frame import DetectionFrame
from app.models.detection_log import DetectionLog
from app.models.camera import Camera
from app.models.alert import Alert
from app.middleware.auth import get_current_active_user
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
async def get_analytics_summary(
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get real-time analytics summary"""
    try:
        # Total detections
        total_detections_result = await session.execute(
            select(func.count(DetectionFrame.id))
        )
        total_detections = total_detections_result.scalar() or 0

        # High threat detections
        high_threat_result = await session.execute(
            select(func.count(DetectionFrame.id)).where(
                DetectionFrame.threat_level == "high"
            )
        )
        high_threat = high_threat_result.scalar() or 0

        # Medium threat detections
        medium_threat_result = await session.execute(
            select(func.count(DetectionFrame.id)).where(
                DetectionFrame.threat_level == "medium"
            )
        )
        medium_threat = medium_threat_result.scalar() or 0

        # Low threat detections
        low_threat_result = await session.execute(
            select(func.count(DetectionFrame.id)).where(
                DetectionFrame.threat_level == "low"
            )
        )
        low_threat = low_threat_result.scalar() or 0

        # Active cameras
        active_cameras_result = await session.execute(
            select(func.count(Camera.id)).where(Camera.status == "online")
        )
        active_cameras = active_cameras_result.scalar() or 0

        # Today's detections
        today = datetime.now().date()
        today_detections_result = await session.execute(
            select(func.count(DetectionFrame.id)).where(
                func.date(DetectionFrame.timestamp) == today
            )
        )
        today_detections = today_detections_result.scalar() or 0

        return {
            "totalDetections": total_detections,
            "highThreat": high_threat,
            "mediumThreat": medium_threat,
            "lowThreat": low_threat,
            "activeCameras": active_cameras,
            "todayDetections": today_detections,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics summary: {str(e)}")

@router.get("/trends")
async def get_detection_trends(
    hours: int = Query(24, description="Number of hours to look back"),
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get detection trends over time"""
    try:
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        # Group by hour and count detections
        trends_result = await session.execute(
            select(
                func.date_trunc('hour', DetectionFrame.timestamp).label('hour'),
                func.count(DetectionFrame.id).label('detections'),
                func.count(DetectionFrame.id).filter(
                    DetectionFrame.threat_level == "high"
                ).label('high_threat'),
                func.count(DetectionFrame.id).filter(
                    DetectionFrame.threat_level == "medium"
                ).label('medium_threat'),
                func.count(DetectionFrame.id).filter(
                    DetectionFrame.threat_level == "low"
                ).label('low_threat')
            )
            .where(
                and_(
                    DetectionFrame.timestamp >= start_time,
                    DetectionFrame.timestamp <= end_time
                )
            )
            .group_by(func.date_trunc('hour', DetectionFrame.timestamp))
            .order_by('hour')
        )
        
        trends = []
        for row in trends_result:
            trends.append({
                "timestamp": row.hour.isoformat(),
                "detections": row.detections,
                "highThreat": row.high_threat,
                "mediumThreat": row.medium_threat,
                "lowThreat": row.low_threat
            })
        
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")

@router.get("/threats")
async def get_threat_distribution(
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get threat level distribution"""
    try:
        threats_result = await session.execute(
            select(
                DetectionFrame.threat_level,
                func.count(DetectionFrame.id).label('count')
            )
            .group_by(DetectionFrame.threat_level)
            .order_by(desc('count'))
        )
        
        threat_colors = {
            "high": "#EF4444",
            "medium": "#F59E0B", 
            "low": "#10B981",
            "none": "#6B7280"
        }
        
        threats = []
        for row in threats_result:
            threats.append({
                "name": row.threat_level.title(),
                "value": row.count,
                "color": threat_colors.get(row.threat_level, "#6B7280")
            })
        
        return threats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching threat distribution: {str(e)}")

@router.get("/cameras")
async def get_camera_analytics(
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get camera status and uptime analytics"""
    try:
        cameras_result = await session.execute(
            select(Camera.name, Camera.status, Camera.created_at)
        )
        
        cameras = []
        for row in cameras_result:
            # Calculate uptime (simplified - in real implementation, track actual uptime)
            uptime_percentage = 95 if row.status == "online" else 0
            
            cameras.append({
                "name": row.name,
                "status": row.status,
                "uptime": uptime_percentage,
                "created_at": row.created_at.isoformat()
            })
        
        return cameras
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching camera analytics: {str(e)}")

@router.get("/top-objects")
async def get_top_detected_objects(
    limit: int = Query(10, description="Number of top objects to return"),
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get most frequently detected objects"""
    try:
        # Get detection logs and count object types
        objects_result = await session.execute(
            select(
                DetectionLog.object_type,
                func.count(DetectionLog.id).label('count')
            )
            .group_by(DetectionLog.object_type)
            .order_by(desc('count'))
            .limit(limit)
        )
        
        objects = []
        for row in objects_result:
            objects.append({
                "name": row.object_type.title(),
                "count": row.count
            })
        
        return objects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top objects: {str(e)}")

@router.get("/realtime")
async def get_realtime_data(
    session: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_active_user)
):
    """Get real-time data for WebSocket updates"""
    try:
        # Get last 5 minutes of data
        five_minutes_ago = datetime.now() - timedelta(minutes=5)
        
        # Recent detections
        recent_detections_result = await session.execute(
            select(func.count(DetectionFrame.id))
            .where(DetectionFrame.timestamp >= five_minutes_ago)
        )
        recent_detections = recent_detections_result.scalar() or 0
        
        # Active alerts
        active_alerts_result = await session.execute(
            select(func.count(Alert.id))
            .where(Alert.acknowledged == False)
        )
        active_alerts = active_alerts_result.scalar() or 0
        
        # Camera status
        online_cameras_result = await session.execute(
            select(func.count(Camera.id))
            .where(Camera.status == "online")
        )
        online_cameras = online_cameras_result.scalar() or 0
        
        total_cameras_result = await session.execute(
            select(func.count(Camera.id))
        )
        total_cameras = total_cameras_result.scalar() or 0
        
        return {
            "recentDetections": recent_detections,
            "activeAlerts": active_alerts,
            "onlineCameras": online_cameras,
            "totalCameras": total_cameras,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching realtime data: {str(e)}")
