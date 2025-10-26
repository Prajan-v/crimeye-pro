from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.schemas import CameraCreate, CameraUpdate, CameraResponse
from app.models.camera import Camera
from app.middleware.auth import get_current_active_user
from app.models.admin_user import AdminUser

router = APIRouter(prefix="/api/cameras", tags=["cameras"])

@router.get("/", response_model=List[CameraResponse])
async def get_cameras(
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all cameras."""
    result = await db.execute(select(Camera).order_by(Camera.created_at.desc()))
    cameras = result.scalars().all()
    return cameras

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: UUID,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific camera."""
    result = await db.execute(select(Camera).where(Camera.id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    return camera

@router.post("/", response_model=CameraResponse)
async def create_camera(
    camera_data: CameraCreate,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new camera."""
    camera = Camera(
        name=camera_data.name,
        rtsp_url=camera_data.rtsp_url,
        location=camera_data.location,
        status="offline"
    )
    
    try:
        db.add(camera)
        await db.commit()
        await db.refresh(camera)
        return camera
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Camera with this name already exists"
        )

@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: UUID,
    camera_update: CameraUpdate,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a camera."""
    result = await db.execute(select(Camera).where(Camera.id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    update_data = camera_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(camera, field, value)
    
    try:
        await db.commit()
        await db.refresh(camera)
        return camera
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Camera with this name already exists"
        )

@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: UUID,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a camera."""
    result = await db.execute(select(Camera).where(Camera.id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    await db.delete(camera)
    await db.commit()
    
    return {"message": "Camera deleted successfully"}

@router.post("/{camera_id}/test-connection")
async def test_camera_connection(
    camera_id: UUID,
    current_user: AdminUser = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Test camera connection."""
    result = await db.execute(select(Camera).where(Camera.id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    # TODO: Implement actual RTSP connection test
    # For now, return a mock response
    return {
        "status": "success",
        "message": "Camera connection test completed",
        "camera_status": "online"
    }
