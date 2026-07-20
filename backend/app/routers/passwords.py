from fastapi import APIRouter, HTTPException
from app.schemas import PasswordStrengthRequest, PasswordStrengthResponse, PasswordHashRequest, PasswordHashResponse, SaltResponse
from app.services.crypto_service import CryptoService

router = APIRouter(prefix="/passwords", tags=["Password Security Lab"])

@router.post("/strength", response_model=PasswordStrengthResponse)
def check_strength(payload: PasswordStrengthRequest):
    result = CryptoService.estimate_password_strength(payload.password)
    return PasswordStrengthResponse(**result)

@router.post("/hash", response_model=PasswordHashResponse)
def hash_password(payload: PasswordHashRequest):
    try:
        result = CryptoService.hash_password(payload.password, payload.algorithm, payload.salt)
        return PasswordHashResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-salt", response_model=SaltResponse)
def generate_salt():
    salt = CryptoService.generate_salt()
    return SaltResponse(salt=salt)
