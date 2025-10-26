from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://prajanv@localhost:5432/crimeye_db"
    
    # JWT
    SECRET_KEY: str = "crimeye-pro-secret-key-2024-secure-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    NODEJS_BACKEND_URL: str = "http://localhost:5001"
    
    # Email
    MAIL_USERNAME: str = "crimeeye935@gmail.com"
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "crimeeye935@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    
    # SMS (Twilio)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    ADMIN_PHONE: str = "+917010132407"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # YOLO Integration
    YOLO_SERVICE_URL: str = "http://localhost:5002"
    YOLO_CONFIDENCE_THRESHOLD: float = 0.4
    YOLO_FPS: int = 10
    
    # Frame Retention
    FRAME_RETENTION_DAYS: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    LOGIN_ATTEMPTS_LIMIT: int = 5
    LOGIN_ATTEMPTS_WINDOW: int = 900  # 15 minutes
    
    # Server Ports
    FASTAPI_PORT: int = 8000
    NODEJS_PORT: int = 5001
    YOLO_PORT: int = 5002
    
    # Default Webcam Configuration
    ENABLE_DEFAULT_WEBCAM: bool = True
    DEFAULT_WEBCAM_NAME: str = "Mac Webcam"
    DEFAULT_WEBCAM_RTSP_URL: str = "rtsp://localhost:8554/demo"
    DEFAULT_WEBCAM_LOCATION: str = "Demo Room"
    WEBCAM_DEVICE_ID: str = "0"  # FaceTime HD Camera
    WEBCAM_RTSP_PORT: int = 8554
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()
