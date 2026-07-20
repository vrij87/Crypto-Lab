from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CryptoLab API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # SQLite Database
    DATABASE_URL: str = "sqlite:///./cryptolab.db"
    
    # Pepper for password hashing demo
    PASSWORD_PEPPER: str = "CryptoLabSuperSecurePepper2026!"
    
    # Security & Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    HEAVY_RATE_LIMIT_PER_MINUTE: int = 15
    MAX_PAYLOAD_BYTES: int = 1_048_576  # 1 MB limit

settings = Settings()

