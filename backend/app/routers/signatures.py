from fastapi import APIRouter, HTTPException
from app.schemas import SignRequest, SignResponse, VerifyRequest, VerifyResponse
from app.services.crypto_service import CryptoService

router = APIRouter(prefix="/signatures", tags=["Digital Signatures Lab"])

@router.post("/sign", response_model=SignResponse)
def sign_message(payload: SignRequest):
    try:
        sig = CryptoService.rsa_sign(payload.message, payload.private_key)
        return SignResponse(signature=sig)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify", response_model=VerifyResponse)
def verify_signature(payload: VerifyRequest):
    valid = CryptoService.rsa_verify(payload.message, payload.signature, payload.public_key)
    return VerifyResponse(valid=valid)
