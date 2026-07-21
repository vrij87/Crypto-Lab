from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, SessionLocal
from app.models import Base, Challenge
from app.routers import hashing, passwords, symmetric, asymmetric, signatures, explorer, certificate, challenges

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed challenges database if empty
    db = SessionLocal()
    try:
        if db.query(Challenge).count() == 0:
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(hashing.router, prefix=settings.API_V1_STR)
app.include_router(passwords.router, prefix=settings.API_V1_STR)
app.include_router(symmetric.router, prefix=settings.API_V1_STR)
app.include_router(asymmetric.router, prefix=settings.API_V1_STR)
app.include_router(signatures.router, prefix=settings.API_V1_STR)
app.include_router(explorer.router, prefix=settings.API_V1_STR)
app.include_router(certificate.router, prefix=settings.API_V1_STR)
app.include_router(challenges.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} v{settings.VERSION}!"}
