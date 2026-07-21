import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CryptoLab API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS Origins (support env override via comma-separated string if provided)
    BACKEND_CORS_ORIGINS: list[str] = (
        [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS").split(",") if origin.strip()]
        if os.getenv("BACKEND_CORS_ORIGINS")
        else [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "https://cryptolab-learning.vercel.app",
        ]
    )
    
    # SQLite Database (Use /tmp on Vercel serverless environment)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/cryptolab.db" if os.getenv("VERCEL") else "sqlite:///./cryptolab.db"
    )
    
    # Pepper for password hashing demo (pulled from environment variable with fallback)
    PASSWORD_PEPPER: str = os.getenv("PASSWORD_PEPPER", "CryptoLabSuperSecurePepper2026!")
    
    # Security & Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    HEAVY_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("HEAVY_RATE_LIMIT_PER_MINUTE", "15"))
    MAX_PAYLOAD_BYTES: int = int(os.getenv("MAX_PAYLOAD_BYTES", "1048576"))  # 1 MB limit

settings = Settings()


