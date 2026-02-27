"""
Donation model for tracking donations made by donors.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class DonationStatus(str, enum.Enum):
    """Status of a donation."""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Donation(Base):
    """Model for tracking donations."""
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    request_id = Column(Integer, ForeignKey("victim_requests.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    trace_token = Column(String(20), unique=True, nullable=False, index=True)
    payment_id = Column(String(255), nullable=True)  # For payment gateway reference
    status = Column(Enum(DonationStatus), default=DonationStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    donor = relationship("User", back_populates="donations", foreign_keys=[donor_id])
    request = relationship("VictimRequest", back_populates="donations", foreign_keys=[request_id])

    def __repr__(self):
        return f"<Donation(id={self.id}, trace_token='{self.trace_token}', amount={self.amount}, status='{self.status}')>"
