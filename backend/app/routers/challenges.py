from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Challenge, UserScore
from app.schemas import ChallengeSchema, ChallengeSubmitRequest, ChallengeSubmitResponse, UserScoreResponse
from typing import List

router = APIRouter(prefix="/challenges", tags=["Crypto Challenges"])

@router.get("/list", response_model=List[ChallengeSchema])
def list_challenges(db: Session = Depends(get_db)):
    challenges = db.query(Challenge).all()
    return challenges

@router.get("/status/{username}", response_model=UserScoreResponse)
def get_user_status(username: str, db: Session = Depends(get_db)):
    user = db.query(UserScore).filter(UserScore.username == username).first()
    if not user:
        # Create a new user score entry if it doesn't exist
        user = UserScore(username=username, score=0, completed_challenges=[])
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/submit", response_model=ChallengeSubmitResponse)
def submit_answer(payload: ChallengeSubmitRequest, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    user = db.query(UserScore).filter(UserScore.username == payload.username).first()
    if not user:
        user = UserScore(username=payload.username, score=0, completed_challenges=[])
        db.add(user)
        db.commit()
        db.refresh(user)
        
    is_correct = challenge.correct_option_index == payload.answer_index
    
    # Calculate score update if correct and not already completed
    completed_list = list(user.completed_challenges or [])
    if is_correct and challenge.id not in completed_list:
        completed_list.append(challenge.id)
        # Assign points based on difficulty
        points = 10
        if challenge.difficulty.lower() == "medium":
            points = 20
        elif challenge.difficulty.lower() == "hard":
            points = 30
            
        user.score += points
        user.completed_challenges = completed_list
        db.commit()
        db.refresh(user)
        
    return ChallengeSubmitResponse(
        correct=is_correct,
        explanation=challenge.explanation,
        score=user.score,
        completed_challenges=user.completed_challenges
    )
