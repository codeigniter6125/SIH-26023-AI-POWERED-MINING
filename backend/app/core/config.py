from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoMine AI Backend (SIH26023)"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database & Storage
    DATABASE_URL: str = "sqlite+aiosqlite:///./geomine.db"
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    STORAGE_DIR: str = "./uploads"

    # AI & Multi-Agent Keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
