import re
import secrets
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
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

def generate_alternative_usernames(username: str, db: Session) -> List[str]:
    """Generates three alternative available usernames."""
    suggestions = []
    base = username
    
    suffixes = [
        lambda: str(random.randint(10, 99)),
        lambda: str(random.randint(100, 999)),
        lambda: "coder",
        lambda: "cyber",
        lambda: "sec",
        lambda: "pro",
    ]
    
    attempts = 0
    while len(suggestions) < 3 and attempts < 100:
        attempts += 1
        suffix = random.choice(suffixes)()
        candidate = f"{base}_{suffix}"
        
        exists = db.query(UserScore).filter(UserScore.username == candidate).first()
        if not exists and candidate not in suggestions:
            suggestions.append(candidate)
            
    while len(suggestions) < 3:
        candidate = f"{base}_{random.randint(1000, 9999)}"
        exists = db.query(UserScore).filter(UserScore.username == candidate).first()
        if not exists and candidate not in suggestions:
            suggestions.append(candidate)
            
    return suggestions

@router.get("/list", response_model=List[ChallengeSchema])
def list_challenges(db: Session = Depends(get_db)):
    """Returns list of available cryptography quiz challenges."""
    challenges = db.query(Challenge).all()
    return challenges

@router.get("/status/{username}", response_model=UserScoreResponse)
def get_user_status(
    username: str, 
    db: Session = Depends(get_db), 
    current_user: dict | None = Depends(get_current_user),
    x_scoreboard_token: str | None = Header(None, alias="X-Scoreboard-Token")
):
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
        new_token = secrets.token_hex(16)
        user = UserScore(username=clean_name, score=0, completed_challenges=[], token=new_token)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    # Backwards compatibility for existing rows without tokens
    if user.token is None:
        client_token = x_scoreboard_token if x_scoreboard_token else secrets.token_hex(16)
        user.token = client_token
        db.commit()
        db.refresh(user)
        return user

    # Authenticate token ownership
    if not x_scoreboard_token or x_scoreboard_token != user.token:
        alternatives = generate_alternative_usernames(clean_name, db)
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Username already taken",
                "suggestions": alternatives
            }
        )
        
    return user

@router.post("/submit", response_model=ChallengeSubmitResponse)
def submit_answer(
    payload: ChallengeSubmitRequest, 
    db: Session = Depends(get_db), 
    current_user: dict | None = Depends(get_current_user),
    x_scoreboard_token: str | None = Header(None, alias="X-Scoreboard-Token")
):
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
        new_token = secrets.token_hex(16)
        user = UserScore(username=clean_name, score=0, completed_challenges=[], token=new_token)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Check token ownership if user exists and has a token
        if user.token is not None:
            if not x_scoreboard_token or x_scoreboard_token != user.token:
                alternatives = generate_alternative_usernames(clean_name, db)
                raise HTTPException(
                    status_code=409,
                    detail={
                        "message": "Username already taken",
                        "suggestions": alternatives
                    }
                )
        else:
            # Backwards compatibility: adopt ownership of existing record if no token was set
            client_token = x_scoreboard_token if x_scoreboard_token else secrets.token_hex(16)
            user.token = client_token
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


