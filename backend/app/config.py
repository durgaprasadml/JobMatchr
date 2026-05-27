import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "JobMatchr API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./jobmatchr.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    JSEARCH_API_KEY: str = os.getenv("JSEARCH_API_KEY", "")
    JSEARCH_CACHE_TTL: int = 1800  # 30 minutes
    JSEARCH_MAX_QUERIES_PER_UPLOAD: int = 2
    JSEARCH_MAX_RESULTS_PER_QUERY: int = 20
    
    # Session config
    SESSION_EXPIRY_SECONDS: int = 1800  # 30 minutes
    
    # JWT security config
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jobmatchr_super_secret_key_change_me_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    class Config:
        case_sensitive = True

settings = Settings()
