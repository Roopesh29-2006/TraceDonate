"""
User schemas for request and response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=255, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, max_length=255, description="User's password")
    role: str = Field(default="DONOR", description="User role: DONOR, VICTIM, ADMIN, NGO")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "SecurePass123!",
                "role": "DONOR"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    name: str
    email: str
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "role": "DONOR",
                "is_verified": True,
                "created_at": "2026-02-26T10:30:00Z"
            }
        }


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "role": "DONOR",
                    "is_verified": True,
                    "created_at": "2026-02-26T10:30:00Z"
                }
            }
        }
