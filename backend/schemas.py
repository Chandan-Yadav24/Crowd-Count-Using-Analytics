from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    role: str


#video uploading part
class VideoUpload(BaseModel):
    username: str
    filename: str

class VideoResponse(BaseModel):
    id: int
    filename: str
    status: str
    class Config:
        from_attributes = True

#zone drawing part
class ZoneCreate(BaseModel):
    username: str
    video_id: int
    label: str
    coordinates: list

class ZoneResponse(BaseModel):
    id: int
    label: str
    coordinates: list
    class Config:
        from_attributes = True