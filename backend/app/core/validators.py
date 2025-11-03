"""Input validators for enhanced security"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List
import re


class CameraCreateRequest(BaseModel):
    """Validated camera creation request"""
    name: str = Field(..., min_length=1, max_length=100, description="Camera name")
    rtsp_url: str = Field(..., description="RTSP URL for camera stream")
    location: str = Field(..., min_length=1, max_length=200, description="Camera location")
    
    @validator('rtsp_url')
    def validate_rtsp_url(cls, v):
        if not v.startswith(('rtsp://', 'rtmp://', 'http://', 'https://')):
            raise ValueError('Invalid stream URL format')
        return v
    
    @validator('name', 'location')
    def sanitize_input(cls, v):
        # Remove any potential XSS attempts
        cleaned = re.sub(r'<[^>]*>', '', v)
        cleaned = cleaned.strip()
        if not cleaned:
            raise ValueError('Field cannot be empty after sanitization')
        return cleaned


class CameraUpdateRequest(BaseModel):
    """Validated camera update request"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    rtsp_url: Optional[str] = None
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    status: Optional[str] = Field(None, regex='^(online|offline|maintenance)$')
    
    @validator('rtsp_url')
    def validate_rtsp_url(cls, v):
        if v and not v.startswith(('rtsp://', 'rtmp://', 'http://', 'https://')):
            raise ValueError('Invalid stream URL format')
        return v
    
    @validator('name', 'location')
    def sanitize_input(cls, v):
        if v:
            cleaned = re.sub(r'<[^>]*>', '', v)
            cleaned = cleaned.strip()
            if not cleaned:
                raise ValueError('Field cannot be empty after sanitization')
            return cleaned
        return v


class LoginRequest(BaseModel):
    """Validated login request"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v


class RegisterRequest(BaseModel):
    """Validated registration request"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    phone: Optional[str] = Field(None, regex=r'^\+?[1-9]\d{1,14}$')
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v
    
    @validator('password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


class DetectionFilterRequest(BaseModel):
    """Validated detection filter request"""
    camera_id: Optional[str] = None
    threat_level: Optional[str] = Field(None, regex='^(low|medium|high|critical)$')
    start_date: Optional[str] = Field(None, regex=r'^\d{4}-\d{2}-\d{2}$')
    end_date: Optional[str] = Field(None, regex=r'^\d{4}-\d{2}-\d{2}$')
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
