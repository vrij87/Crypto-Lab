import time
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, SessionLocal
from app.models import Base, Challenge
from app.routers import hashing, passwords, symmetric, asymmetric, signatures, explorer, certificate, challenges, progress

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed challenges database if empty
    db = SessionLocal()
    try:
        # Auto-update seeder: ensures old databases get upgraded to the full 16 challenges
        if db.query(Challenge).count() < 16:
            db.query(Challenge).delete()
            db.commit()

            seed_challenges = [
                Challenge(
                    title="Identify the Secure Algorithm",
                    question="Which of the following hash functions is currently considered cryptographically broken and insecure for digital signatures?",
                    options=["SHA-256", "MD5", "SHA-3", "SHA-512"],
                    correct_option_index=1,
                    explanation="MD5 is vulnerable to collision attacks, meaning two different inputs can produce the same hash, making it insecure for digital signatures.",
                    difficulty="Easy",
                    category="Hashing"
                ),
                Challenge(
                    title="Choose Correct Encryption Method",
                    question="When encrypting sensitive web traffic over HTTPS, which symmetric encryption mode is preferred because it provides both confidentiality and integrity (Authenticated Encryption)?",
                    options=["AES-CBC", "AES-ECB", "AES-GCM", "Triple DES"],
                    correct_option_index=2,
                    explanation="AES-GCM (Galois/Counter Mode) is an AEAD (Authenticated Encryption with Associated Data) mode that provides both confidentiality and verification that the ciphertext has not been tampered with.",
                    difficulty="Medium",
                    category="Symmetric"
                ),
                Challenge(
                    title="Understand Password Security",
                    question="Why are memory-hard functions like Argon2id preferred for password hashing over fast hashing functions like SHA-256?",
                    options=[
                        "SHA-256 is structurally insecure and has collisions.",
                        "Memory-hard functions are faster to compute.",
                        "Argon2id increases the hardware RAM requirements, slowing down massive parallel brute-force attacks run on ASICs or GPUs.",
                        "Argon2id produces shorter hashes."
                    ],
                    correct_option_index=2,
                    explanation="Memory-hard functions require a significant amount of RAM to compute, which makes building highly parallel brute-forcing rigs (GPUs, FPGAs, ASICs) extremely expensive and slow.",
                    difficulty="Hard",
                    category="Passwords"
                ),
                Challenge(
                    title="Select Proper Hash Function",
                    question="What does the avalanche effect in cryptographic hashing mean?",
                    options=[
                        "The hashing speed increases exponentially as the input length grows.",
                        "A minor change in the input text (even a single bit) results in a completely different and unpredictable hash output.",
                        "The output hash gets smaller for larger input text.",
                        "The hash function is immune to collisions."
                    ],
                    correct_option_index=1,
                    explanation="The avalanche effect is a crucial property where a small change in the input results in a major, uncorrelated change in the output, preventing patterns from being analyzed.",
                    difficulty="Easy",
                    category="Hashing"
                ),
                Challenge(
                    title="RSA Encryption Key Selection",
                    question="In public-key cryptography (like RSA), which key should be used to encrypt a message that only a specific recipient should be able to read?",
                    options=[
                        "The sender's private key",
                        "The recipient's public key",
                        "The sender's public key",
                        "The recipient's private key"
                    ],
                    correct_option_index=1,
                    explanation="To send an encrypted message that only the recipient can read, you encrypt it with the recipient's public key. Only the matching recipient's private key can decrypt it.",
                    difficulty="Medium",
                    category="Asymmetric"
                ),
                Challenge(
                    title="Digital Signature Purpose",
                    question="What properties does a digital signature provide to a message transmission?",
                    options=[
                        "Confidentiality and High Performance",
                        "Authenticity, Integrity, and Non-repudiation",
                        "Encryption and Salting",
                        "Collision Resistance and Entropy"
                    ],
                    correct_option_index=1,
                    explanation="Digital signatures prove who wrote the message (authenticity), check that the message hasn't been altered (integrity), and prevent the sender from claiming they didn't send it (non-repudiation).",
                    difficulty="Medium",
                    category="Signature"
                ),
                Challenge(
                    title="Caesar Cipher Shift Decoding",
                    question="If you encrypt the word 'HAL' using a Caesar Cipher with a shift key of 1, what is the resulting ciphertext?",
                    options=["IBM", "GZK", "IJM", "JAK"],
                    correct_option_index=0,
                    explanation="Shifting the letters H, A, L forward by 1 in the alphabet yields I, B, M. (H+1=I, A+1=B, L+1=M). This was famously referenced as the source of the computer name HAL from 2001: A Space Odyssey relative to IBM.",
                    difficulty="Easy",
                    category="Overview"
                ),
                Challenge(
                    title="Vigenère Cipher Characteristics",
                    question="Why does the Vigenère cipher flatten the frequency analysis distribution of single letters compared to the Caesar cipher?",
                    options=[
                        "It uses an asymmetric public/private key pair.",
                        "It is a polyalphabetic cipher that uses a repeating keyword to apply different shifts to consecutive letters.",
                        "It uses cryptographically secure random numbers for every letter.",
                        "It hashes the plaintext before encrypting."
                    ],
                    correct_option_index=1,
                    explanation="Because Vigenère shifts each letter using a different letter of the keyword, a single plaintext letter (like E) maps to multiple different ciphertext letters, smoothing out the frequency peaks.",
                    difficulty="Medium",
                    category="Overview"
                ),
                Challenge(
                    title="HMAC Security Properties",
                    question="What primary security property does an HMAC (Hash-based Message Authentication Code) provide that a standard SHA-256 hash does not?",
                    options=[
                        "Confidentiality of the message payload",
                        "Resistance to quantum computer decryption keys",
                        "Data integrity and authenticity of the sender via a shared secret key",
                        "Speed improvement during encryption operations"
                    ],
                    correct_option_index=2,
                    explanation="An HMAC uses a cryptographic hash function in combination with a secret key. This guarantees both that the data has not been modified (integrity) and that the sender knows the secret key (authenticity).",
                    difficulty="Easy",
                    category="Hashing"
                ),
                Challenge(
                    title="Length Extension Vulnerability",
                    question="Which of the following hash constructions is vulnerable to length extension attacks, leading to the creation of SHA-3?",
                    options=["SHA-256", "SHA-3-256", "BLAKE2", "HMAC-SHA-256"],
                    correct_option_index=0,
                    explanation="Hash functions based on the Merkle-Damgård construction (like SHA-256, SHA-512, MD5, and SHA-1) are vulnerable to length extension attacks, where an attacker can compute H(message || extension) without knowing the secret prefix of H(secret || message).",
                    difficulty="Hard",
                    category="Hashing"
                ),
                Challenge(
                    title="Role of Pepper in Password Storage",
                    question="In secure password storage, what is the main architectural difference between a Salt and a Pepper?",
                    options=[
                        "Salts are computed via SHA-256; Peppers are computed via bcrypt.",
                        "Salts are stored in the database next to the password hash; Peppers are stored separately in configuration files or key managers.",
                        "Salts are public; Peppers are encrypted with asymmetric public keys.",
                        "Salts protect against brute-force; Peppers protect against dictionary attacks."
                    ],
                    correct_option_index=1,
                    explanation="A salt is unique per user and stored directly in the database. A pepper is a system-wide secret key stored outside the database (e.g., in environment configurations), preventing hashing attacks even if the database is fully leaked.",
                    difficulty="Medium",
                    category="Passwords"
                ),
                Challenge(
                    title="Argon2 Memory Hardness",
                    question="What makes Argon2id highly resistant to GPU/ASIC brute-force attacks compared to legacy SHA-256 based KDFs?",
                    options=[
                        "It uses asymmetric prime factorization.",
                        "It enforces a multi-threaded CPU thread lock.",
                        "It is a memory-hard function that requires a configurable amount of RAM to compute, making hardware parallelization expensive.",
                        "It produces variable-length hashes."
                    ],
                    correct_option_index=2,
                    explanation="Argon2id requires a significant amount of memory (RAM) to compute each hash. Creating highly parallel hardware rigs (ASICs/GPUs) with gigabytes of fast memory per core is extremely expensive, which dramatically slows down parallel brute-force attacks.",
                    difficulty="Hard",
                    category="Passwords"
                ),
                Challenge(
                    title="AES Galois/Counter Mode (GCM)",
                    question="What does GCM (Galois/Counter Mode) provide in AES encryption that CBC (Cipher Block Chaining) does not without helper codes?",
                    options=[
                        "Slower computation overhead",
                        "Public key signature exchange",
                        "Authenticated Encryption (AEAD) proving ciphertext integrity and protecting against bit-flipping attacks",
                        "Initialization vector randomness"
                    ],
                    correct_option_index=2,
                    explanation="AES-GCM is an AEAD mode. It computes an authentication tag (MAC) alongside the ciphertext. If an attacker alters any bit in the ciphertext during transit, the decryption process fails the tag validation, preventing decryption of tampered payloads.",
                    difficulty="Medium",
                    category="Symmetric"
                ),
                Challenge(
                    title="Forward Secrecy in Key Exchange",
                    question="In TLS/SSL handshake protocols, what does Perfect Forward Secrecy (PFS) guarantee?",
                    options=[
                        "The server private key is never shared with the CDN.",
                        "Compromise of the server's long-term private key does not compromise past session keys generated during handshakes.",
                        "The client can decrypt all future requests.",
                        "The certificate is signed by a root CA."
                    ],
                    correct_option_index=1,
                    explanation="Perfect Forward Secrecy ensures that temporary/ephemeral session keys are generated dynamically per handshake (e.g., using Ephemeral Diffie-Hellman). Even if an attacker steals the server's long-term private key later, they cannot decrypt recorded historical traffic.",
                    difficulty="Hard",
                    category="Asymmetric"
                ),
                Challenge(
                    title="ECDSA vs. RSA Signatures",
                    question="What is the primary advantage of ECDSA (Elliptic Curve Digital Signature Algorithm) over standard RSA signatures at equivalent security levels?",
                    options=[
                        "ECDSA is older and more widely tested.",
                        "ECDSA signatures and key sizes are much smaller, leading to lower bandwidth and memory overhead.",
                        "ECDSA does not require a hash function.",
                        "ECDSA is immune to quantum attacks."
                    ],
                    correct_option_index=1,
                    explanation="ECDSA achieves the same cryptographic strength as RSA with significantly smaller keys (e.g., 256-bit ECC matches 3072-bit RSA) and smaller signature sizes, reducing traffic overhead for handshakes.",
                    difficulty="Medium",
                    category="Signature"
                ),
                Challenge(
                    title="Public Key Certificate Trust Anchor",
                    question="How does a web browser verify that an X.509 certificate presented by a domain (e.g., google.com) is authentic and trustworthy?",
                    options=[
                        "It runs a DNS lookup validation check on 127.0.0.1.",
                        "It decrypts the entire webpage using the server's public key.",
                        "It verifies the digital signature chain of the certificate back to a trusted Root Certificate Authority (CA) pre-installed in the browser's store.",
                        "It queries the Supabase database."
                    ],
                    correct_option_index=2,
                    explanation="Browsers and operating systems come pre-installed with a list of trusted Root Certificate Authorities. The browser follows the certificate signature chain (Server Cert -> Intermediate CA -> Root CA) and verifies each signature using the CA's public key.",
                    difficulty="Hard",
                    category="Certificates"
                )
            ]
            db.add_all(seed_challenges)
            db.commit()
    except Exception as e:
        print(f"Error seeding challenges: {e}")
    finally:
        db.close()
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware (Proper origins list with credential support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sliding Window Rate Limiter & Payload Size Enforcement
_request_history = defaultdict(list)
_heavy_endpoints = {
    "/api/hashing/benchmark",
    "/api/passwords/hash",
    "/api/asymmetric/generate-rsa",
    "/api/asymmetric/generate-ecc",
    "/api/signatures/sign",
}

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Payload Size Check
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            length_bytes = int(content_length)
            if length_bytes > settings.MAX_PAYLOAD_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": f"Payload too large. Maximum allowed size is {settings.MAX_PAYLOAD_BYTES} bytes."}
                )
        except ValueError:
            pass

    # 2. Rate Limiting Check
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    path = request.url.path
    
    # Keep only timestamps within 60 second window
    _request_history[client_ip] = [t for t in _request_history[client_ip] if now - t < 60.0]
    
    limit = (
        settings.HEAVY_RATE_LIMIT_PER_MINUTE
        if any(path.startswith(h) for h in _heavy_endpoints)
        else settings.RATE_LIMIT_PER_MINUTE
    )
    
    if len(_request_history[client_ip]) >= limit:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please wait a moment before sending more requests."}
        )
        
    _request_history[client_ip].append(now)
    
    response = await call_next(request)
    return response

# Register routers cleanly under /api prefix
routers = [
    hashing.router,
    passwords.router,
    symmetric.router,
    asymmetric.router,
    signatures.router,
    explorer.router,
    certificate.router,
    challenges.router,
    progress.router,
]

for r in routers:
    app.include_router(r, prefix=settings.API_V1_STR)

@app.get("/")
@app.get("/api")
@app.get("/api/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} v{settings.VERSION}!"}

