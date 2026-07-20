from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional

# --- LAB 1: Hashing & Avalanche ---
class HashRequest(BaseModel):
    text: str
    algorithm: str = Field(..., description="MD5, SHA1, SHA256, SHA512, SHA3-256, SHA3-512")

class HashResponse(BaseModel):
    hash: str
    algorithm: str

class AvalancheRequest(BaseModel):
    text1: str
    text2: str
    algorithm: str

class AvalancheResponse(BaseModel):
    hash1: str
    hash2: str
    bin1: str
    bin2: str
    diff_bits: int
    total_bits: int
    percentage: float
    changed_indices: List[int]

class BenchmarkResponse(BaseModel):
    hash: str
    duration_10k_ms: float
    bit_length: int
    collision_resistance: str
    security_rating: str
    relative_speed: str

# --- LAB 2: Password Security ---
class PasswordStrengthRequest(BaseModel):
    password: str

class PasswordChecks(BaseModel):
    length: bool
    upper: bool
    lower: bool
    digit: bool
    special: bool

class PasswordStrengthResponse(BaseModel):
    score: int
    entropy: float
    crack_time: str
    feedback: List[str]
    rating: str
    checks: PasswordChecks

class PasswordHashRequest(BaseModel):
    password: str
    algorithm: str = Field(..., description="bcrypt, argon2id, pbkdf2")
    salt: Optional[str] = None

class PasswordHashResponse(BaseModel):
    hashed_value: str
    pepped_sha256_value: str
    duration_ms: float
    parameters: Dict[str, Any]

class SaltResponse(BaseModel):
    salt: str

# --- LAB 3: Symmetric Encryption ---
class SymmetricEncryptRequest(BaseModel):
    plaintext: str
    key: str
    algorithm: str = Field(..., description="AES, ChaCha20")
    mode: str = "GCM"

class SymmetricEncryptResponse(BaseModel):
    ciphertext: str
    iv: str
    tag: Optional[str] = None
    mode: str

class SymmetricDecryptRequest(BaseModel):
    ciphertext: str
    key: str
    iv: str
    algorithm: str
    mode: str = "GCM"
    tag: Optional[str] = None

class SymmetricDecryptResponse(BaseModel):
    plaintext: str

class SymmetricKeyRequest(BaseModel):
    algorithm: str
    key_size: int = 256

class SymmetricKeyResponse(BaseModel):
    key: str

# --- LAB 4: RSA Key Generation & Encryption ---
class RSAGenRequest(BaseModel):
    key_size: int = 2048

class RSAGenResponse(BaseModel):
    private_key: str
    public_key: str

class RSAEncryptRequest(BaseModel):
    plaintext: str
    public_key: str

class RSAEncryptResponse(BaseModel):
    ciphertext: str

class RSADecryptRequest(BaseModel):
    ciphertext: str
    private_key: str

class RSADecryptResponse(BaseModel):
    plaintext: str

# --- LAB 5: Digital Signatures ---
class SignRequest(BaseModel):
    message: str
    private_key: str

class SignResponse(BaseModel):
    signature: str

class VerifyRequest(BaseModel):
    message: str
    signature: str
    public_key: str

class VerifyResponse(BaseModel):
    valid: bool

# --- LAB 7: Certificate Explorer ---
class CertRequest(BaseModel):
    url: str

class CertResponse(BaseModel):
    success: bool
    domain: str
    subject_cn: Optional[str] = None
    issuer_cn: Optional[str] = None
    issuer_org: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    is_valid: Optional[bool] = None
    days_remaining: Optional[int] = None
    version: Optional[int] = None
    serial_number: Optional[str] = None
    subject_alt_names: Optional[List[str]] = None
    tls_version: Optional[str] = None
    cipher_suite: Optional[str] = None
    cipher_bits: Optional[int] = None
    error: Optional[str] = None

# --- LAB 8: Challenges ---
class ChallengeSchema(BaseModel):
    id: int
    title: str
    question: str
    options: List[str]
    difficulty: str
    category: str

    model_config = ConfigDict(from_attributes=True)

class ChallengeSubmitRequest(BaseModel):
    username: str
    challenge_id: int
    answer_index: int

class ChallengeSubmitResponse(BaseModel):
    correct: bool
    explanation: str
    score: int
    completed_challenges: List[int]

class UserScoreResponse(BaseModel):
    username: str
    score: int
    completed_challenges: List[int]

    model_config = ConfigDict(from_attributes=True)
