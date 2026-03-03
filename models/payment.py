from sqlalchemy import Column, Integer, Float, ForeignKey, String, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base

class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    CARD = "CARD"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("victim_requests.id"), nullable=False)
    amount = Column(Float, nullable=False)
    
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    transaction_id = Column(String, unique=True, index=True, nullable=True) # E.g., Razorpay/Stripe ID
    campaign_id_ref = Column(String, nullable=True) # Optional ref
    trace_token = Column(String, unique=True, index=True, nullable=True) # Unique ID per transaction
    
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    donor = relationship("User")
    request = relationship("VictimRequest")
