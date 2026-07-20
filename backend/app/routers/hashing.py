from fastapi import APIRouter, HTTPException
from app.schemas import HashRequest, HashResponse, AvalancheRequest, AvalancheResponse, BenchmarkResponse
from app.services.crypto_service import CryptoService
from typing import Dict

router = APIRouter(prefix="/hashing", tags=["Hashing Lab"])

@router.post("/hash", response_model=HashResponse)
def hash_text(payload: HashRequest):
    try:
        hashed = CryptoService.generate_hash(payload.text, payload.algorithm)
        return HashResponse(hash=hashed, algorithm=payload.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/avalanche", response_model=AvalancheResponse)
def avalanche_effect(payload: AvalancheRequest):
    try:
        result = CryptoService.calculate_avalanche(payload.text1, payload.text2, payload.algorithm)
        return AvalancheResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/benchmark", response_model=Dict[str, BenchmarkResponse])
def benchmark(payload: HashRequest):
    try:
        results = CryptoService.benchmark_algorithms(payload.text)
        return {alg: BenchmarkResponse(**data) for alg, data in results.items()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
