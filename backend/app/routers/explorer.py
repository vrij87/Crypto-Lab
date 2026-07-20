from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/explorer", tags=["Algorithm Explorer"])

ALGORITHMS_INFO = {
    "SHA-256": {
        "name": "SHA-256 (Secure Hash Algorithm 2)",
        "type": "Hashing",
        "description": "A cryptographic hash function designed by the NSA. It produces a 256-bit (32-byte) hash value, typically represented as a 64-digit hexadecimal number.",
        "output_size": "256 bits (32 bytes)",
        "security_level": "Secure",
        "use_cases": ["Data integrity verification", "Blockchain / Bitcoin proof-of-work", "TLS/SSL certificates", "Software package signing"],
        "advantages": ["High security", "Collision resistant", "Widely supported and standard", "One-way function"],
        "disadvantages": ["Vulnerable to length-extension attacks (use HMAC instead)", "Fast speed makes it less suitable for raw password storage without salts and iteration"],
        "examples": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "references": "RFC 6234, FIPS PUB 180-4"
    },
    "SHA-512": {
        "name": "SHA-512 (Secure Hash Algorithm 2)",
        "type": "Hashing",
        "description": "Part of the SHA-2 family, it produces a 512-bit (64-byte) digest. It is designed for 64-bit architectures, making it faster than SHA-256 on 64-bit systems.",
        "output_size": "512 bits (64 bytes)",
        "security_level": "Secure",
        "use_cases": ["High-security digital signatures", "File integrity checking", "HMAC implementations"],
        "advantages": ["Extremely high collision resistance", "Optimized for 64-bit hardware", "Stronger security margin than SHA-256"],
        "disadvantages": ["Longer outputs require more storage/bandwidth", "Vulnerable to length-extension attacks"],
        "examples": "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
        "references": "RFC 6234, FIPS PUB 180-4"
    },
    "SHA-3": {
        "name": "SHA-3 (Keccak)",
        "type": "Hashing",
        "description": "The latest member of the Secure Hash Algorithm family, released by NIST in 2015. It uses the Keccak sponge construction, making it completely different in internal structure from SHA-2.",
        "output_size": "Flexible (typically 224, 256, 384, or 512 bits)",
        "security_level": "Secure",
        "use_cases": ["Modern security systems", "Ethereum blockchain (Keccak-256)", "Next-generation software signing"],
        "advantages": ["Immune to length-extension attacks", "Highly diverse architecture from SHA-2 (great backup if SHA-2 fails)", "Hardware-efficient"],
        "disadvantages": ["Slower in software than SHA-2 on many standard CPUs", "Adoption is still lagging behind SHA-2"],
        "examples": "61159d2ad0c9e400f50b49c71f41a0b32235c345155f65f0ca08412e2b96315c (SHA3-256)",
        "references": "FIPS PUB 202"
    },
    "MD5": {
        "name": "MD5 (Message-Digest Algorithm 5)",
        "type": "Hashing",
        "description": "A widely used cryptographic hash function producing a 128-bit digest. It is now cryptographically broken and should not be used for security purposes.",
        "output_size": "128 bits (16 bytes)",
        "security_level": "Insecure / Broken",
        "use_cases": ["Non-cryptographic checksums", "Legacy database indexing compatibility", "Ad-hoc file identification"],
        "advantages": ["Extremely fast", "Low computational footprint", "Very short output length"],
        "disadvantages": ["High vulnerability to collision attacks (two inputs yielding same hash)", "Broken for digital signatures and authentication"],
        "examples": "d41d8cd98f00b204e9800998ecf8427e",
        "references": "RFC 1321"
    },
    "SHA-1": {
        "name": "SHA-1 (Secure Hash Algorithm 1)",
        "type": "Hashing",
        "description": "Produces a 160-bit digest. It was standard for many systems but has been deprecated since 2011 due to theoretical and practical collision vulnerabilities.",
        "output_size": "160 bits (20 bytes)",
        "security_level": "Insecure / Deprecated",
        "use_cases": ["Git revision tracking (non-security metadata)", "Legacy systems support"],
        "advantages": ["Fast performance", "Vast legacy compatibility"],
        "disadvantages": ["Vulnerable to collision attacks (broken by SHAttered in 2017)", "Unsuitable for modern digital signatures or SSL/TLS certificates"],
        "examples": "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        "references": "RFC 3174, RFC 6194"
    },
    "AES": {
        "name": "AES (Advanced Encryption Standard)",
        "type": "Symmetric",
        "description": "The global standard for symmetric block cipher encryption. Established by NIST in 2001, it operates on 128-bit blocks of data with key sizes of 128, 192, or 256 bits.",
        "output_size": "Same as input (block-size is 128 bits)",
        "security_level": "Secure",
        "use_cases": ["File/Disk encryption (BitLocker, FileVault)", "TLS/HTTPS data encryption", "WiFi security (WPA3)", "Database encryption"],
        "advantages": ["Extremely secure and efficient", "Hardware acceleration on modern CPUs (AES-NI)", "Industry standard and standard for government secrets"],
        "disadvantages": ["Requires complex modes (like GCM, CBC) to encrypt files safely", "Improper key management breaks everything"],
        "examples": "Ciphertext (Hex): 7e05e5d36e8b4e78... using key size 256 bits",
        "references": "FIPS PUB 197"
    },
    "ChaCha20": {
        "name": "ChaCha20",
        "type": "Symmetric",
        "description": "A modern, high-speed stream cipher developed by Daniel J. Bernstein. It is commonly paired with Poly1305 for authentication (AEAD scheme).",
        "output_size": "Same as input",
        "security_level": "Secure",
        "use_cases": ["Mobile communication (used by Google on Android)", "SSH connection traffic encryption", "WireGuard VPN protocol"],
        "advantages": ["Extremely fast in software (much faster than AES on devices lacking AES hardware instructions)", "Immune to cache-timing side-channel attacks", "Simpler to implement than AES"],
        "disadvantages": ["Less hardware-accelerated support compared to AES", "Nonce reuse is catastrophic (always use a unique 96-bit nonce)"],
        "examples": "Stream cipher XOR output with key and nonce.",
        "references": "RFC 8439"
    },
    "RSA": {
        "name": "RSA (Rivest-Shamir-Adleman)",
        "type": "Asymmetric",
        "description": "One of the first public-key cryptosystems, widely used for secure data transmission. It relies on the mathematical difficulty of factoring the product of two large prime numbers.",
        "output_size": "Depends on key size (typically 2048, 3072, or 4096 bits)",
        "security_level": "Secure (2048-bit minimum key size)",
        "use_cases": ["Secure key exchange (hybrid encryption)", "Digital signatures (certificates)", "Secure Email (PGP)"],
        "advantages": ["Elegant mathematical public/private key system", "Supports both encryption and digital signatures", "Widely established"],
        "disadvantages": ["Extremely slow compared to symmetric algorithms", "Requires very large key sizes (2048+ bits) for adequate security", "Vulnerable to quantum computer Shor's algorithm"],
        "examples": "Public Key (e, n) / Private Key (d, n)",
        "references": "RFC 8017"
    },
    "ECC": {
        "name": "ECC (Elliptic Curve Cryptography)",
        "type": "Asymmetric",
        "description": "An approach to public-key cryptography based on the algebraic structure of elliptic curves over finite fields. It provides equivalent security to RSA but with much smaller key sizes.",
        "output_size": "Typically 256 to 521 bits",
        "security_level": "Secure",
        "use_cases": ["TLS/SSL key exchanges (ECDHE)", "Mobile applications", "Bitcoin and Ethereum signatures (ECDSA)", "SSH key authentication (Ed25519)"],
        "advantages": ["Small key sizes (256-bit ECC is as secure as 3072-bit RSA)", "Significantly faster key generation and decryption than RSA", "Reduced bandwidth and battery power consumption"],
        "disadvantages": ["More complex mathematics than RSA", "Vulnerable to quantum computers", "Some curves had security trust concerns (e.g. Dual_EC_DRBG)"],
        "examples": "Curve25519, secp256k1",
        "references": "RFC 5903, RFC 7748"
    },
    "Argon2id": {
        "name": "Argon2id",
        "type": "Passwords",
        "description": "The winner of the Password Hashing Competition (PHC) in 2015. It is a memory-hard password hashing function designed to resist GPU/ASIC brute-force attacks.",
        "output_size": "Configurable (standard is 256 bits)",
        "security_level": "Secure (Industry Best Practice)",
        "use_cases": ["Modern user password storage", "Key derivation from master passwords"],
        "advantages": ["Resists GPU and ASIC brute-forcing via adjustable memory-hardness", "Combines Argon2d (data-dependent) and Argon2i (data-independent) to resist side-channel attacks", "Configurable memory, time, and parallelism parameters"],
        "disadvantages": ["High CPU and memory usage (intentionally slow/heavy)", "Not supported natively in older platforms without native extension libraries"],
        "examples": "$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHQ$...",
        "references": "RFC 9106"
    },
    "bcrypt": {
        "name": "bcrypt",
        "type": "Passwords",
        "description": "A password hashing function based on the Blowfish cipher. It incorporates a work factor (rounds) that makes it slow, resisting brute-force attacks.",
        "output_size": "184 bits (23 bytes)",
        "security_level": "Secure",
        "use_cases": ["Standard web application password hashing", "Legacy database user credential storage"],
        "advantages": ["Tried, tested, and secure for over 20 years", "Work factor is adjustable to adapt to faster hardware", "Very widely supported across all languages"],
        "disadvantages": ["Limited password length to 72 bytes (longer passwords are truncated)", "Does not utilize memory-hardness, making it vulnerable to specialized FPGA/ASIC hardware brute-forcing compared to Argon2"],
        "examples": "$2b$12$R9h/lIPbuRR.chQDQAo0sO.1AWR0pY3N...",
        "references": "USENIX 1999"
    },
    "PBKDF2": {
        "name": "PBKDF2 (Password-Based Key Derivation Function 2)",
        "type": "Passwords",
        "description": "A key derivation function with a sliding work factor, commonly utilizing HMAC-SHA256. It is recommended by NIST for password hashing when memory-hard functions cannot be used.",
        "output_size": "Configurable",
        "security_level": "Secure (with high iteration counts)",
        "use_cases": ["Wi-Fi security (WPA2)", "Password storage in enterprise platforms", "Deriving keys from master passwords (e.g. 1Password, Bitwarden)"],
        "advantages": ["Part of NIST standards", "Extremely easy to implement on any platform", "Highly compatible without third-party dependencies"],
        "disadvantages": ["Vulnerable to GPU and ASIC acceleration because it is not memory-hard, requiring very high iteration counts (e.g., 600k for PBKDF2-HMAC-SHA256) to be secure"],
        "examples": "$pbkdf2-sha256$i=100000$salt$...hash...",
        "references": "RFC 8018, NIST SP 800-132"
    }
}

@router.get("/algorithms", response_model=Dict[str, Any])
def get_algorithms():
    return ALGORITHMS_INFO
