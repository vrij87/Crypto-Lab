from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserProgress
from app.dependencies import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/progress", tags=["User Progress"])

@router.get("", response_model=Dict[str, Any])
def get_progress(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    progress = db.query(UserProgress).filter(UserProgress.user_id == user["id"]).first()
    if not progress:
        # Initialize database progress record for new user
        progress = UserProgress(
            user_id=user["id"],
            email=user["email"],
            username=user["username"],
            score=0,
            completed_challenges=[],
            progress_data={}
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
        
    return {
        "progress_data": progress.progress_data or {},
        "score": progress.score,
        "completed_challenges": progress.completed_challenges or []
    }

@router.post("")
def save_progress(payload: Dict[str, Any], user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    progress = db.query(UserProgress).filter(UserProgress.user_id == user["id"]).first()
    if not progress:
        progress = UserProgress(
            user_id=user["id"],
            email=user["email"],
            username=user["username"],
            score=0,
            completed_challenges=[],
            progress_data=payload
        )
        db.add(progress)
    else:
        progress.progress_data = payload
        if user["username"]:
            progress.username = user["username"]
    db.commit()
    return {"status": "success"}
