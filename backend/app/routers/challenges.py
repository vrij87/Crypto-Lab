import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Challenge, UserScore, UserProgress
from app.dependencies import get_current_user
from app.schemas import ChallengeSchema, ChallengeSubmitRequest, ChallengeSubmitResponse, UserScoreResponse

router = APIRouter(prefix="/challenges", tags=["Crypto Challenges"])

def sanitize_username(username: str) -> str:
    """Sanitizes username input to prevent arbitrary string pollution."""
    clean = re.sub(r"[^\w\-\.]", "", username.strip())[:32]
    return clean if clean else "AnonymousLearner"

@router.get("/list", response_model=List[ChallengeSchema])
def list_challenges(db: Session = Depends(get_db)):
    """Returns list of available cryptography quiz challenges."""
    challenges = db.query(Challenge).all()
    return challenges

@router.get("/status/{username}", response_model=UserScoreResponse)
def get_user_status(username: str, db: Session = Depends(get_db), current_user: dict | None = Depends(get_current_user)):
    """
    Fetches or initializes user quiz progress.
    If authenticated (Authorization header present), tracks via UserProgress, using username/email.
    If unauthenticated, falls back to the existing UserScore table by username.
    """
    if current_user:
        user = db.query(UserProgress).filter(UserProgress.user_id == current_user["id"]).first()
        if not user:
            user = UserProgress(
                user_id=current_user["id"],
                email=current_user["email"],
                username=current_user["username"],
                score=0,
                completed_challenges=[],
                progress_data={}
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return UserScoreResponse(
            username=user.username or user.email,
            score=user.score,
            completed_challenges=user.completed_challenges or []
        )
        
    clean_name = sanitize_username(username)
    user = db.query(UserScore).filter(UserScore.username == clean_name).first()
    if not user:
        user = UserScore(username=clean_name, score=0, completed_challenges=[])
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/submit", response_model=ChallengeSubmitResponse)
def submit_answer(payload: ChallengeSubmitRequest, db: Session = Depends(get_db), current_user: dict | None = Depends(get_current_user)):
    """
    Evaluates challenge submission and updates user score.
    If authenticated, updates the UserProgress table.
    If unauthenticated, falls back to the UserScore table.
    """
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    is_correct = challenge.correct_option_index == payload.answer_index
    points = 0
    if is_correct:
        points = 10
        if challenge.difficulty.lower() == "medium":
            points = 20
        elif challenge.difficulty.lower() == "hard":
            points = 30

    if current_user:
        user = db.query(UserProgress).filter(UserProgress.user_id == current_user["id"]).first()
        if not user:
            user = UserProgress(
                user_id=current_user["id"],
                email=current_user["email"],
                username=current_user["username"],
                score=0,
                completed_challenges=[],
                progress_data={}
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        completed_list = list(user.completed_challenges or [])
        if is_correct and challenge.id not in completed_list:
            completed_list.append(challenge.id)
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
        
    clean_name = sanitize_username(payload.username)
    user = db.query(UserScore).filter(UserScore.username == clean_name).first()
    if not user:
        user = UserScore(username=clean_name, score=0, completed_challenges=[])
        db.add(user)
        db.commit()
        db.refresh(user)
        
    completed_list = list(user.completed_challenges or [])
    if is_correct and challenge.id not in completed_list:
        completed_list.append(challenge.id)
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


