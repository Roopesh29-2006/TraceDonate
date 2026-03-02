"""
Victim request schemas for request and response validation.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# ======================================================
# 🔹 CREATE REQUEST
# ======================================================

class VictimRequestCreate(BaseModel):
    """Schema for creating a new victim request."""

    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10, max_length=2000)
    required_amount: float = Field(..., gt=0)

    # 🌍 Location
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

    # 🏥 Authority Verification (REQUIRED)
    authority_name: str = Field(..., min_length=3)
    authority_contact: str = Field(..., min_length=5)
    authority_organization: str = Field(..., min_length=3)
    authority_proof_url: str = Field(..., min_length=5)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Emergency Heart Surgery",
                "description": "Need urgent ICU support and ventilator assistance",
                "required_amount": 75000,
                "latitude": 13.0827,
                "longitude": 80.2707,
                "location_name": "Chennai Government Hospital",
                "authority_name": "Dr. Kumar",
                "authority_contact": "+91 9876543210",
                "authority_organization": "Chennai Government Hospital",
                "authority_proof_url": "https://hospital-docs.com/proof.pdf"
            }
        }


# ======================================================
# 🔹 UPDATE REQUEST
# ======================================================

class VictimRequestUpdate(BaseModel):
    """Schema for updating a victim request."""

    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    required_amount: Optional[float] = Field(None, gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Surgery Title",
                "required_amount": 90000
            }
        }


# ======================================================
# 🔹 RESPONSE (FULL DETAILS)
# ======================================================

class VictimRequestResponse(BaseModel):
    """Schema for victim request response."""

    id: int
    victim_id: int

    title: str
    description: str

    required_amount: float
    collected_amount: float

    urgency_level: str
    category: Optional[str] = None
    priority_score: Optional[int] = 0

    status: str
    is_pinned: bool

    # 🌍 Location
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

    # 🏥 Authority
    authority_name: Optional[str] = None
    authority_contact: Optional[str] = None
    authority_organization: Optional[str] = None
    authority_proof_url: Optional[str] = None
    is_verified_by_admin: bool = False

    # 🎉 Completion
    completion_story: Optional[str] = None
    completion_proof_url: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True


# ======================================================
# 🔹 LIST RESPONSE
# ======================================================

class VictimRequestListResponse(BaseModel):
    """Schema for list of victim requests."""

    total: int
    requests: list[VictimRequestResponse]

    class Config:
        json_schema_extra = {
            "example": {
                "total": 2,
                "requests": [
                    {
                        "id": 1,
                        "victim_id": 2,
                        "title": "Emergency Medical Surgery",
                        "description": "Need urgent ICU ventilator support",
                        "required_amount": 50000,
                        "collected_amount": 25000,
                        "urgency_level": "CRITICAL",
                        "category": "Medical",
                        "priority_score": 65,
                        "status": "APPROVED",
                        "is_pinned": True,
                        "latitude": 13.0827,
                        "longitude": 80.2707,
                        "location_name": "Chennai Hospital",
                        "authority_name": "Dr. Kumar",
                        "authority_contact": "+91 9876543210",
                        "authority_organization": "Chennai Hospital",
                        "authority_proof_url": "https://hospital-docs.com/proof.pdf",
                        "is_verified_by_admin": False,
                        "completion_story": None,
                        "completion_proof_url": None,
                        "created_at": "2026-02-26T10:30:00Z"
                    }
                ]
            }
        }