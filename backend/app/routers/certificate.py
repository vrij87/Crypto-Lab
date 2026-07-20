from fastapi import APIRouter
from app.schemas import CertRequest, CertResponse
from app.services.cert_service import CertService

router = APIRouter(prefix="/certificate", tags=["Certificate Explorer"])

@router.post("/analyze", response_model=CertResponse)
def analyze_cert(payload: CertRequest):
    result = CertService.analyze_certificate(payload.url)
    if not result.get("success", False):
        return CertResponse(success=False, domain=payload.url, error=result.get("error", "Unknown error occurred."))
    return CertResponse(**result)
