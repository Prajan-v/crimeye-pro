from sqlalchemy import Column, String, Text, Boolean, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    frame_id = Column(UUID(as_uuid=True), ForeignKey("detection_frames.id", ondelete="CASCADE"), nullable=False)
    alert_type = Column(String(50), nullable=False)  # email, sms, both
    message = Column(Text, nullable=False)
    sent_via = Column(String(20), nullable=False)  # email, sms, both
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    frame = relationship("DetectionFrame", back_populates="alerts")
