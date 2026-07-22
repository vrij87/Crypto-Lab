from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    question = Column(String, nullable=False)
    options = Column(JSON, nullable=False)  # JSON array of strings
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # Easy, Medium, Hard
    category = Column(String, nullable=False)    # Hashing, Symmetric, Asymmetric, Passwords, etc.

class UserScore(Base):
    __tablename__ = "user_scores"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    score = Column(Integer, default=0)
    completed_challenges = Column(JSON, default=list)  # JSON array of challenge IDs

class UserProgress(Base):
    __tablename__ = "user_progress"

    user_id = Column(String, primary_key=True, index=True)  # Supabase UUID / ID
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    score = Column(Integer, default=0)
    completed_challenges = Column(JSON, default=list)  # JSON array of challenge IDs
    progress_data = Column(JSON, default=dict)  # Complete JSON representation of ProgressState

