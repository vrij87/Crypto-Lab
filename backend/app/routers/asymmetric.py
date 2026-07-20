from fastapi import APIRouter, HTTPException
from app.schemas import RSAGenRequest, RSAGenResponse, RSAEncryptRequest, RSAEncryptResponse, RSADecryptRequest, RSADecryptResponse
from app.services.crypto_service import CryptoService

router = APIRouter(prefix="/asymmetric", tags=["Asymmetric RSA Lab"])

@router.post("/generate-rsa", response_model=RSAGenResponse)
def generate_rsa(payload: RSAGenRequest):
    try:
        priv_pem, pub_pem = CryptoService.generate_rsa_keypair(payload.key_size)
        return RSAGenResponse(private_key=priv_pem, public_key=pub_pem)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/encrypt", response_model=RSAEncryptResponse)
def encrypt(payload: RSAEncryptRequest):
    try:
        ciphertext = CryptoService.rsa_encrypt(payload.plaintext, payload.public_key)
        return RSAEncryptResponse(ciphertext=ciphertext)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/decrypt", response_model=RSADecryptResponse)
def decrypt(payload: RSADecryptRequest):
    try:
        plaintext = CryptoService.rsa_decrypt(payload.ciphertext, payload.private_key)
        return RSADecryptResponse(plaintext=plaintext)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
