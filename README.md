<div align="center">

# 🛡️ CryptoLab

### *Interactive Cryptography Learning Platform & Cipher Visualizer*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://cryptolab-learning.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

**[🌐 View Live Demo](https://cryptolab-learning.vercel.app/)** • **[📖 Explore API Docs](https://cryptolab-learning.vercel.app/docs)** • **[🚀 Quick Start](#-getting-started)**

</div>

---

## 📌 Overview

**CryptoLab** is an educational cybersecurity web application built for students, security engineers, and developers. It bridges theoretical cryptography with hands-on, real-time visual exploration.

Instead of reading static equations, users can interactively manipulate ciphers, visualize block state matrices, test password entropy, simulate digital signature tampering, analyze SSL/TLS certificate chains, and track their learning path using a **Linear/Raycast-inspired SaaS dashboard**.

---

## ✨ Features & Interactive Laboratories

### ⚡ 1. Hashing Laboratory & Avalanche Visualizer
- **Supported Hash Algorithms**: SHA-256, SHA-512, SHA-3 (Keccak), MD5, SHA-1, BLAKE2, HMAC.
- **Avalanche Effect Calculator**: Compare two input strings side-by-side to observe bitwise flips, Hamming distance, and diffusion percentage.
- **Hash Rate Benchmarks**: Measure hashing throughput in real-time.

### 🔑 2. Password Security Sandbox
- **Modern KDFs**: Compare **Argon2id** (PHC winner), **bcrypt**, **PBKDF2**, and **scrypt**.
- **Password Strength & Entropy Calculator**: Real-time evaluation of password entropy (bits), character variance, and brute-force crack time estimations (offline vs. GPU rig).
- **Salt & Pepper Simulation**: See how cryptographic salts eliminate rainbow table attacks.

### 🛡️ 3. AES & Symmetric Ciphers Lab
- **Block & Stream Ciphers**: AES-128, AES-256 (CBC, GCM AEAD modes) and ChaCha20-Poly1305.
- **Key & IV Generators**: Hex/Base64 key generation with cryptographic randomness (`urandom`).
- **Authenticated Encryption**: Demonstrate ciphertext integrity tags (GCM MAC).

### 🔐 4. RSA & ECC Asymmetric Lab
- **Key Pair Generation**: Generate 2048-bit / 4096-bit RSA keys & ECC SECP256k1 keys.
- **PEM Export**: View formatted Public and Private PEM blocks.
- **Public Key Encryption**: Encrypt with recipient public keys and decrypt with matching private keys.

### ✍️ 5. Digital Signature & Tamper Lab
- **Signatures**: ECDSA & RSA-PSS signature creation and verification.
- **Tampering Sandbox**: Edit signed payload messages or signature bytes to observe instant tamper detection.

### 🌐 6. X.509 SSL/TLS Certificate Explorer
- **Live Domain Inspector**: Enter domain names (e.g., `google.com`) to inspect real SSL certificates, SANs, serial numbers, and validity periods.
- **Self-Signed Cert Generator**: Create custom X.509 certificates directly in your browser.

### 🧱 7. Animated Block Cipher Visualizer
- Step-by-step state matrix viewer showing AES round transformations: **SubBytes**, **ShiftRows**, **MixColumns**, and **AddRoundKey**.

### 🏆 8. Gamified Challenges & Quiz System
- Real-world cryptography quiz questions categorized by difficulty (*Easy, Medium, Hard*) with instant explanations and score tracking.

### 🧭 9. "My Crypto Journey" Progress Tracker Panel
- **SaaS Dashboard Drawer**: Slide-over panel (desktop) and modal (mobile) featuring:
  - **Animated Circular Progress Gauge**: Displays completion percentage and overall level (*Crypto Beginner* → *Crypto Master*).
  - **Learning Roadmap**: Step-by-step interactive timeline with checkmarks, glowing indicators, and lock states.
  - **Skill Badges & Achievements**: Real-time unlock notifications (*Hash Master*, *Encryption Explorer*, etc.).
  - **Cross-Tab Synchronization**: Real-time updates across multiple open browser tabs via `BroadcastChannel` and `storage` events.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + Custom Cyber Dark Aesthetics
- **Animations**: Framer Motion
- **Icons**: Lucide React

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Cryptography Engine**: Python `cryptography`, `pycryptodome`, `passlib`, `argon2-cffi`
- **Database**: SQLite / PostgreSQL with SQLAlchemy ORM & Pydantic V2 schemas
- **Testing**: `pytest` + Starlette TestClient + Vitest Frontend Testing

---

## 🔒 Security Architecture & Defensive Controls

1. **SSRF Mitigation (Certificate Explorer)**:
   - User-supplied domains in `CertService` undergo pre-flight DNS resolution and IP validation using `ipaddress`.
   - Blocks connections to loopback (`127.0.0.0/8`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), multicast, and cloud metadata endpoints (`169.254.169.254`).
2. **Strict CORS Compliance**:
   - Enforces specific `BACKEND_CORS_ORIGINS` whitelists with credential support (`allow_credentials=True`), adhering strictly to the W3C CORS specification (avoiding wildcard `*` with credentials).
3. **Rate Limiting & Payload Size Protection**:
   - **Payload Limit**: Request bodies exceeding 1 MB (`MAX_PAYLOAD_BYTES`) are rejected with `HTTP 413 Payload Too Large`.
   - **Sliding-Window Rate Limiter**: Limits requests to 60 req/min for general endpoints and 15 req/min for compute-heavy endpoints (Argon2 hashing, RSA key generation, benchmarking).
4. **Environment Pepper Security**:
   - `PASSWORD_PEPPER` is sourced via environment variable `os.getenv("PASSWORD_PEPPER", ...)` to demonstrate security key management practices.

---

## 🗄️ Database Architecture & Serverless Persistence

- **Local Development**: Default SQLite database stored at `./cryptolab.db`.
- **Serverless (Vercel)**: Uses ephemeral `/tmp/cryptolab.db` for serverless environments.
- **Production Persistence**: For persistent multi-user quiz leaderboards across serverless cold starts, set the `DATABASE_URL` environment variable to a hosted PostgreSQL instance (e.g., [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)).

> **Note on Quiz Leaderboard**: Username-based scoring (`/challenges/submit`) is intentionally unauthenticated to allow instant, friction-free interactive sandbox testing without mandatory user signup.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0` or higher
- **Python**: `v3.10` or higher
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/vrij87/Crypto-Lab.git
cd Crypto-Lab
```

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

> Backend will run at: **`http-[#]127.0.0.1:8000`**  
> Interactive API Docs: **`http-[#]127.0.0.1:8000/docs`**

---

### 3. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
# Navigate to frontend directory
cd Crypto-Lab/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> Web Application will run at: **`http-[#]localhost:5173/`**

---

## 🧪 Testing

### Backend Unit Tests

Run the backend test suite:

```bash
cd backend
python -m pytest tests
```

### Frontend Type Safety & Build Verification

```bash
cd frontend
npm run build
```

---

## 📂 Project Structure

```
Crypto-Lab/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions Pages deployment
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application entry point & seeds
│   │   ├── config.py             # Settings & CORS config
│   │   ├── database.py           # SQLAlchemy database setup
│   │   ├── models.py             # SQLite ORM models
│   │   ├── schemas.py            # Pydantic V2 schemas
│   │   ├── routers/              # Modular API endpoints
│   │   │   ├── hashing.py
│   │   │   ├── passwords.py
│   │   │   ├── symmetric.py
│   │   │   ├── asymmetric.py
│   │   │   ├── signatures.py
│   │   │   ├── certificate.py
│   │   │   ├── explorer.py
│   │   │   └── challenges.py
│   │   └── services/             # Cryptography logic implementations
│   ├── tests/
│   │   └── test_endpoints.py     # Automated API unit tests
│   ├── Dockerfile                # Container setup
│   ├── render.yaml               # Cloud deployment blueprint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CryptoJourneyDrawer.tsx
│   │   │   └── ProgressToastContainer.tsx
│   │   ├── context/
│   │   │   └── ProgressContext.tsx  # Real-time state & persistence
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Labs.tsx
│   │   │   ├── HashingLab.tsx
│   │   │   ├── PasswordLab.tsx
│   │   │   ├── SymmetricLab.tsx
│   │   │   ├── AsymmetricLab.tsx
│   │   │   ├── SignatureLab.tsx
│   │   │   ├── CertificateLab.tsx
│   │   │   ├── Explorer.tsx
│   │   │   ├── Challenges.tsx
│   │   │   └── DocPage.tsx
│   │   └── utils/
│   │       └── api.ts
│   └── package.json
├── development-log.md
└── README.md
```

---

## ☁️ Deployment

### Vercel Online Deployment (Frontend + Serverless Backend)
CryptoLab is deployed on Vercel as a full-stack application.
👉 **[https://cryptolab-learning.vercel.app/](https://cryptolab-learning.vercel.app/)**

The configuration is managed automatically via [`vercel.json`](file:///d:/Crypto%20Lab/vercel.json) and [`api/index.py`](file:///d:/Crypto%20Lab/api/index.py). Any new push to `main` triggers a live deployment on Vercel.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

Made with 🩵 for Cryptography & Security Education.

</div>
