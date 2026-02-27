"""
Password hashing utilities using bcrypt via passlib.
"""
from passlib.context import CryptContext

# configure passlib to use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        password: The plain text password to hash.

    Returns:
        A bcrypt hash of the password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a stored hash.

    Args:
        plain_password: The password provided by the user.
        hashed_password: The stored bcrypt hash.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

