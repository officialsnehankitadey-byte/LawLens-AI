import os
from typing import List

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings  # type: ignore
    except ImportError:
        from pydantic.v1 import BaseSettings  # type: ignore

class Settings(BaseSettings):
    PROJECT_NAME: str = "LawLens AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # AI Provider Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Database
    DATABASE_URL: str = "sqlite:///./lawlens.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

