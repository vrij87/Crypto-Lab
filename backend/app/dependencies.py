from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
from app.config import settings

def get_current_user(request: Request) -> dict | None:
    """
    FastAPI dependency to extract and verify the user from the Supabase JWT.
    Supports a signature-bypass fallback in development when SUPABASE_JWT_SECRET is empty.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
        
    token = parts[1]
    
    # Check if a JWT Secret is configured
    if not settings.SUPABASE_JWT_SECRET or settings.SUPABASE_JWT_SECRET == "placeholder":
        # Insecure Dev Mode Fallback: Decode claims without verifying signature.
        # This allows local testing without setting up actual Supabase project keys.
        try:
            payload = jwt.get_unverified_claims(token)
            user_metadata = payload.get("user_metadata", {})
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "username": user_metadata.get("username") or payload.get("email", "").split("@")[0]
            }
        except JWTError:
            return None
            
    try:
        # Secure Production Mode: Verify signature using HMAC-SHA256 (HS256) key
        # We disable audience verification since Supabase JWT aud defaults to 'authenticated'
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_metadata = payload.get("user_metadata", {})
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "username": user_metadata.get("username") or payload.get("email", "").split("@")[0]
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired authorization token")
