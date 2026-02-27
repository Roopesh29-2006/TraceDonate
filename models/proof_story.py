"""
ProofStory model for storing proof of usage stories and media.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class ProofStory(Base):
    """Model for proof stories and media uploads."""
    __tablename__ = "proof_stories"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("victim_requests.id"), nullable=False, index=True)
    media_url = Column(String(500), nullable=True)  # URL to uploaded media
    description = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    request = relationship("VictimRequest", back_populates="proof_stories", foreign_keys=[request_id])

    def __repr__(self):
        return f"<ProofStory(id={self.id}, request_id={self.request_id}, created_at={self.created_at})>"
