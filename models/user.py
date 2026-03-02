"""
User model for the application.
Supports multiple roles: DONOR, VICTIM, ADMIN, NGO
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    DONOR = "DONOR"
    VICTIM = "VICTIM"
    ADMIN = "ADMIN"
    NGO = "NGO"


class User(Base):
    """User model for storing user information."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DONOR, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    victim_requests = relationship("VictimRequest", back_populates="victim", foreign_keys="VictimRequest.victim_id")
    donations = relationship("Donation", back_populates="donor", foreign_keys="Donation.donor_id")
    proof_stories = relationship("ProofStory", back_populates="uploader")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
