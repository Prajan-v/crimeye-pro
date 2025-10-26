from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    phone: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Camera Schemas
class CameraBase(BaseModel):
    name: str
    rtsp_url: str
    location: Optional[str] = None


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    rtsp_url: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class CameraResponse(CameraBase):
    id: UUID
    status: str
    is_system_camera: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Detection Schemas
class DetectionFrameResponse(BaseModel):
    id: UUID
    camera_id: UUID
    detections: dict
    threat_level: str
    timestamp: datetime

    class Config:
        from_attributes = True


class DetectionLogResponse(BaseModel):
    id: UUID
    frame_id: UUID
    object_type: str
    confidence: float
    bounding_box: dict
    timestamp: datetime

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: UUID
    frame_id: UUID
    alert_type: str
    message: str
    sent_via: str
    sent_at: datetime
    acknowledged: bool

    class Config:
        from_attributes = True
