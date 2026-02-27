"""
JWT token handling for authentication.
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from config import get_settings

# The application settings will supply the secret and algorithm
settings = get_settings()

# default lifetime of access tokens
ACCESS_TOKEN_EXPIRE_HOURS = 24


def create_access_token(user_id: int, role: str) -> str:
    """
    Generate a short-lived JWT containing the user's ID and role.

    The token is valid for `ACCESS_TOKEN_EXPIRE_HOURS` hours and is
    signed using the secret and algorithm from the project settings.
    """
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"user_id": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT.

    Returns the token payload on success, or ``None`` if the token is
    invalid or expired.
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
