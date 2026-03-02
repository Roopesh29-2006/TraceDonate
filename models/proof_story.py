from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class ProofStory(Base):
    __tablename__ = "proof_stories"

    id = Column(Integer, primary_key=True, index=True)

    request_id = Column(Integer, ForeignKey("victim_requests.id"), nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    media_url = Column(String(500), nullable=True)
    description = Column(String(2000), nullable=False)

    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    request = relationship("VictimRequest", back_populates="proof_stories")
    uploader = relationship("User")

    def __repr__(self):
        return f"<ProofStory(id={self.id}, request_id={self.request_id}, verified={self.is_verified})>"