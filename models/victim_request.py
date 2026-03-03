"""
VictimRequest model for victim donation requests.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


class UrgencyLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class VictimRequest(Base):
    __tablename__ = "victim_requests"

    id = Column(Integer, primary_key=True, index=True)
    victim_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=False)
    required_amount = Column(Float, nullable=False)

    # 🌍 Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)

    # 💰 Financial
    collected_amount = Column(Float, default=0.0)

    # 🔥 AI Fields
    urgency_level = Column(Enum(UrgencyLevel), default=UrgencyLevel.LOW, nullable=False)
    category = Column(String, nullable=True)
    priority_score = Column(Integer, default=0)

    # 📊 Status
    status: RequestStatus = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    is_pinned: bool = Column(Boolean, default=False)
    is_verified_by_admin: bool = Column(Boolean, default=False)

    # 🏥 Authority Verification
    authority_name = Column(String(255), nullable=False)
    authority_contact = Column(String(100), nullable=False)
    authority_organization = Column(String(255), nullable=False)
    authority_proof_url = Column(String(500), nullable=False)

    # 🎉 Completion
    completion_story = Column(String(2000), nullable=True)
    completion_proof_url = Column(String(500), nullable=True)

    # ⏱ Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    victim = relationship("User", back_populates="victim_requests", foreign_keys=[victim_id])
    donations = relationship("Donation", back_populates="request")
    proof_stories = relationship("ProofStory", back_populates="request")

    def __repr__(self):
        return f"<VictimRequest(id={self.id}, victim_id={self.victim_id}, status='{self.status}', urgency='{self.urgency_level}')>"