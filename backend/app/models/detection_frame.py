from sqlalchemy import Column, String, DateTime, func, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, BYTEA, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class DetectionFrame(Base):
    __tablename__ = "detection_frames"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    camera_id = Column(UUID(as_uuid=True), ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    frame_data = Column(BYTEA, nullable=False)  # Binary frame data
    detections = Column(JSONB, nullable=False)  # JSON array of detections
    threat_level = Column(String(20), nullable=False)  # low, medium, high
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    camera = relationship("Camera", back_populates="detection_frames")
    detection_logs = relationship("DetectionLog", back_populates="frame", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="frame", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_detection_frames_camera_timestamp', 'camera_id', 'timestamp'),
        Index('idx_detection_frames_threat_level', 'threat_level'),
    )
