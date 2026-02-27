"""
Victim request schemas for request and response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class VictimRequestCreate(BaseModel):
    """Schema for creating a new victim request."""
    title: str = Field(..., min_length=5, max_length=255, description="Request title")
    description: str = Field(..., min_length=10, max_length=2000, description="Request description")
    required_amount: float = Field(..., gt=0, description="Required amount in currency")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Emergency Medical Surgery",
                "description": "Need urgent ICU ventilator support for life support",
                "required_amount": 50000.0
            }
        }


class VictimRequestUpdate(BaseModel):
    """Schema for updating a victim request."""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    required_amount: Optional[float] = Field(None, gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Title",
                "required_amount": 75000.0
            }
        }


class VictimRequestResponse(BaseModel):
    """Schema for victim request response."""
    id: int
    victim_id: int
    title: str
    description: str
    required_amount: float
    collected_amount: float
    urgency_level: str
    status: str
    is_pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "victim_id": 2,
                "title": "Emergency Medical Surgery",
                "description": "Need urgent ICU ventilator support for life support",
                "required_amount": 50000.0,
                "collected_amount": 25000.0,
                "urgency_level": "CRITICAL",
                "status": "APPROVED",
                "is_pinned": True,
                "created_at": "2026-02-26T10:30:00Z"
            }
        }


class VictimRequestListResponse(BaseModel):
    """Schema for list of victim requests."""
    total: int
    requests: list[VictimRequestResponse]

    class Config:
        json_schema_extra = {
            "example": {
                "total": 10,
                "requests": [
                    {
                        "id": 1,
                        "victim_id": 2,
                        "title": "Emergency Medical Surgery",
                        "description": "Need urgent ICU ventilator support",
                        "required_amount": 50000.0,
                        "collected_amount": 25000.0,
                        "urgency_level": "CRITICAL",
                        "status": "APPROVED",
                        "is_pinned": True,
                        "created_at": "2026-02-26T10:30:00Z"
                    }
                ]
            }
        }
