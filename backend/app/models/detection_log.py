from sqlalchemy import Column, String, Float, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class DetectionLog(Base):
    __tablename__ = "detection_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    frame_id = Column(UUID(as_uuid=True), ForeignKey("detection_frames.id", ondelete="CASCADE"), nullable=False)
    object_type = Column(String(50), nullable=False)  # person, weapon, vehicle, etc.
    confidence = Column(Float, nullable=False)
    bounding_box = Column(JSONB, nullable=False)  # {"x": 0, "y": 0, "width": 100, "height": 100}
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    frame = relationship("DetectionFrame", back_populates="detection_logs")
