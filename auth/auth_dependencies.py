"""
Authentication dependencies for protecting routes.

Contains utilities to fetch the current user from a JWT and to
construct role-based dependencies dynamically.
"""
from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from auth.jwt_handler import verify_token
from models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials=Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Return the user corresponding to the bearer token.

    The token must be valid and contain a ``user_id`` field.  If the
    token is missing, invalid, or the user does not exist a 401/404 is
    raised.
    """
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


def require_role(allowed_roles: List[str]):
    """Return a dependency which ensures the current user has one of the
    ``allowed_roles``.

    Usage::

        @router.get("/admin")
        def admin_endpoint(user: User = Depends(require_role(["ADMIN"]))):
            ...
    """

    async def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )
        return current_user

    return dependency
