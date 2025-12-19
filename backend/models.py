from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey, JSON
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(TIMESTAMP, server_default=func.now())

#video uploading part
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(255), nullable=False)
    upload_time = Column(TIMESTAMP, server_default=func.now())
    status = Column(
        Enum("pending", "processing", "completed", name="video_status"),
        default="pending",
        nullable=False
    )
    result_summary = Column(JSON)

#zone drawing part
from sqlalchemy import ForeignKey, JSON

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(100), nullable=False)
    coordinates = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    output_video_path = Column(String(500), nullable=False)
    frame_data_path = Column(String(500))
    total_count = Column(Integer, default=0)
    zone_counts = Column(JSON)
    processed_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())