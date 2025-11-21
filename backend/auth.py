import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from backend.core.config import settings


def hash_password(password: str) -> str:
    """
    Hash a new plain password (used for user registration).
    bcrypt only uses the first 72 bytes of the input.
    """
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored bcrypt hash.
    """
    try:
        return bcrypt.checkpw(plain_password.encode()[:72], hashed_password.encode())
    except Exception as e:
        print("bcrypt verify error:", e)
        return False


def create_token(data: dict) -> str:
    """
    Generate a JWT containing username and role.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)