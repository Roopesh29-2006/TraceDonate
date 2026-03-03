from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PaymentIntentRequest(BaseModel):
    request_id: int
    amount: float = Field(..., gt=0)
    payment_method: str = Field(..., description="UPI or CARD")

class PaymentIntentResponse(BaseModel):
    transaction_id: str
    amount: float
    payment_method: str
    qr_code_base64: Optional[str] = None
    status: str

class PaymentConfirmRequest(BaseModel):
    transaction_id: str

class PaymentConfirmResponse(BaseModel):
    status: str
    message: str
    receipt_url: Optional[str] = None
    trace_token: Optional[str] = None
