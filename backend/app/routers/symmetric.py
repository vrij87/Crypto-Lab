from fastapi import APIRouter, HTTPException
from app.schemas import SymmetricEncryptRequest, SymmetricEncryptResponse, SymmetricDecryptRequest, SymmetricDecryptResponse, SymmetricKeyRequest, SymmetricKeyResponse
from app.services.crypto_service import CryptoService

router = APIRouter(prefix="/symmetric", tags=["Symmetric AES Lab"])

@router.post("/generate-key", response_model=SymmetricKeyResponse)
def generate_key(payload: SymmetricKeyRequest):
    try:
        key = CryptoService.generate_symmetric_key(payload.algorithm, payload.key_size)
        return SymmetricKeyResponse(key=key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/encrypt", response_model=SymmetricEncryptResponse)
def encrypt(payload: SymmetricEncryptRequest):
    try:
        result = CryptoService.symmetric_encrypt(
            payload.plaintext, payload.key, payload.algorithm, payload.mode
        )
        return SymmetricEncryptResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt", response_model=SymmetricDecryptResponse)
def decrypt(payload: SymmetricDecryptRequest):
    try:
        plaintext = CryptoService.symmetric_decrypt(
            payload.ciphertext, payload.key, payload.iv, payload.algorithm, payload.mode, payload.tag
        )
        return SymmetricDecryptResponse(plaintext=plaintext)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
