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
        seed_challenges = []
        # Seed 5 Hashing, 5 Overview, 3 Symmetric, 3 Passwords
        for i in range(1, 6):
            seed_challenges.append(
                Challenge(
                    id=i,
                    title=f"Hashing Challenge {i}",
                    question=f"Question hashing {i}?",
                    options=["Opt A", "Opt B", "Opt C", "Opt D"],
                    correct_option_index=1,
                    explanation=f"Hashing Explanation {i}",
                    difficulty="Easy" if i <= 2 else "Medium" if i <= 4 else "Hard",
                    category="Hashing"
                )
            )
        for i in range(6, 11):
            seed_challenges.append(
                Challenge(
                    id=i,
                    title=f"Overview Challenge {i}",
                    question=f"Question overview {i}?",
                    options=["Opt A", "Opt B", "Opt C", "Opt D"],
                    correct_option_index=1,
                    explanation=f"Overview Explanation {i}",
                    difficulty="Easy" if i <= 7 else "Medium" if i <= 9 else "Hard",
                    category="Overview"
                )
            )
        for i in range(11, 14):
            seed_challenges.append(
                Challenge(
                    id=i,
                    title=f"Symmetric Challenge {i}",
                    question=f"Question symmetric {i}?",
                    options=["Opt A", "Opt B", "Opt C", "Opt D"],
                    correct_option_index=1,
                    explanation=f"Symmetric Explanation {i}",
                    difficulty="Easy" if i == 11 else "Medium" if i == 12 else "Hard",
                    category="Symmetric"
                )
            )
        for i in range(14, 17):
            seed_challenges.append(
                Challenge(
                    id=i,
                    title=f"Passwords Challenge {i}",
                    question=f"Question passwords {i}?",
                    options=["Opt A", "Opt B", "Opt C", "Opt D"],
                    correct_option_index=1,
                    explanation=f"Passwords Explanation {i}",
                    difficulty="Easy" if i == 14 else "Medium" if i == 15 else "Hard",
                    category="Passwords"
                )
            )
        db_session.add_all(seed_challenges)
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
