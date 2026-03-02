from sqlalchemy import Column, Integer, Float, ForeignKey, String, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base


# ================================
# Donation Status Enum
# ================================

class DonationStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"


# ================================
# Donation Model
# ================================

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)

    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("victim_requests.id"), nullable=False)

    amount = Column(Float, nullable=False)

    status = Column(
        Enum(DonationStatus),
        default=DonationStatus.PENDING,
        nullable=False
    )

    trace_token = Column(String, nullable=True)  # For payment gateway tracking

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    donor = relationship("User", back_populates="donations")
    request = relationship("VictimRequest", back_populates="donations")