from sqlalchemy import Column, String, DateTime, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Camera(Base):
    __tablename__ = "cameras"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    rtsp_url = Column(String(500), nullable=False)
    location = Column(String(200), nullable=True)
    status = Column(String(20), default="offline", nullable=False)  # online, offline, error
    is_system_camera = Column(Boolean, default=False, nullable=False)  # Prevents accidental deletion
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    detection_frames = relationship("DetectionFrame", back_populates="camera", cascade="all, delete-orphan")
