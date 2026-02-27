"""
Donation schemas for request and response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class DonationCreate(BaseModel):
    """Schema for creating a donation."""
    request_id: int = Field(..., gt=0, description="ID of the victim request")
    amount: float = Field(..., gt=0, description="Donation amount")
    payment_id: Optional[str] = Field(None, description="Payment gateway reference ID")

    class Config:
        json_schema_extra = {
            "example": {
                "request_id": 1,
                "amount": 5000.0,
                "payment_id": "PAY123456789"
            }
        }


class DonationResponse(BaseModel):
    """Schema for donation response."""
    id: int
    donor_id: int
    request_id: int
    amount: float
    trace_token: str
    payment_id: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "donor_id": 1,
                "request_id": 1,
                "amount": 5000.0,
                "trace_token": "TRACE-A7F9B2C1",
                "payment_id": "PAY123456789",
                "status": "COMPLETED",
                "created_at": "2026-02-26T10:30:00Z"
            }
        }


class DonationTrack(BaseModel):
    """Schema for tracking donation by trace token."""
    trace_token: str = Field(..., description="Unique trace token for donation")
    donor_name: str
    request_title: str
    amount: float
    status: str
    created_at: datetime
    proof_stories: list[dict] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "trace_token": "TRACE-A7F9B2C1",
                "donor_name": "John Doe",
                "request_title": "Emergency Medical Surgery",
                "amount": 5000.0,
                "status": "COMPLETED",
                "created_at": "2026-02-26T10:30:00Z",
                "proof_stories": [
                    {
                        "description": "Treatment completed successfully",
                        "media_url": "https://example.com/media/story1.jpg",
                        "created_at": "2026-02-27T10:30:00Z"
                    }
                ]
            }
        }
