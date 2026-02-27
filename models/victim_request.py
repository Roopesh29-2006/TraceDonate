"""
VictimRequest model for victim donation requests.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class RequestStatus(str, enum.Enum):
    """Status of a victim request."""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


class UrgencyLevel(str, enum.Enum):
    """Urgency level of a victim request."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class VictimRequest(Base):
    """Model for victim donation requests."""
    __tablename__ = "victim_requests"

    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=False)
    required_amount = Column(Float, nullable=False)
    collected_amount = Column(Float, default=0.0)
    urgency_level = Column(Enum(UrgencyLevel), default=UrgencyLevel.LOW, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    victim = relationship("User", back_populates="victim_requests", foreign_keys=[victim_id])
    donations = relationship("Donation", back_populates="request")
    proof_stories = relationship("ProofStory", back_populates="request")

    def __repr__(self):
        return f"<VictimRequest(id={self.id}, victim_id={self.victim_id}, status='{self.status}', urgency='{self.urgency_level}')>"
