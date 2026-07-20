import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models import Challenge

from sqlalchemy.pool import StaticPool

# In-memory SQLite for testing with StaticPool to keep the connection open
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    
    # Seed default challenges for testing
    if db_session.query(Challenge).count() == 0:
        test_challenge = Challenge(
            id=1,
            title="Identify the Secure Algorithm",
            question="Which of the following hash functions is currently considered cryptographically broken and insecure for digital signatures?",
            options=["SHA-256", "MD5", "SHA-3", "SHA-512"],
            correct_option_index=1,
            explanation="MD5 is vulnerable to collision attacks.",
            difficulty="Easy",
            category="Hashing"
        )
        db_session.add(test_challenge)
        db_session.commit()
        
    yield db_session
    db_session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
