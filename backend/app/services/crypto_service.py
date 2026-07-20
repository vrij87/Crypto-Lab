import os
import time
import hashlib
import base64
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.asymmetric.padding import OAEP, MGF1, PSS
from passlib.hash import bcrypt, argon2
from app.config import settings

class CryptoService:
    
    # ----------------------------------------------------
    # LAB 1: Hashing & Avalanche
    # ----------------------------------------------------
    @staticmethod
    def generate_hash(text: str, algorithm: str) -> str:
        """Generates a cryptographic hash for the given text."""
        data = text.encode("utf-8")
        alg = algorithm.upper()
        
        if alg == "MD5":
            return hashlib.md5(data).hexdigest()
        elif alg == "SHA1":
            return hashlib.sha1(data).hexdigest()
        elif alg == "SHA256":
            return hashlib.sha256(data).hexdigest()
        elif alg == "SHA512":
            return hashlib.sha512(data).hexdigest()
        elif alg == "SHA3-256":
            return hashlib.sha3_256(data).hexdigest()
        elif alg == "SHA3-512":
            return hashlib.sha3_512(data).hexdigest()
        else:
            raise ValueError(f"Unsupported hashing algorithm: {algorithm}")

    @staticmethod
    def calculate_avalanche(text1: str, text2: str, algorithm: str) -> Dict[str, Any]:
        """Calculates the avalanche effect (bit differences) between two hashes."""
        hash1 = CryptoService.generate_hash(text1, algorithm)
        hash2 = CryptoService.generate_hash(text2, algorithm)
        
        # Convert hex hashes to binary strings
        bin1 = bin(int(hash1, 16))[2:].zfill(len(hash1) * 4)
        bin2 = bin(int(hash2, 16))[2:].zfill(len(hash2) * 4)
        
        # Count different bits
        diff_bits = sum(b1 != b2 for b1, b2 in zip(bin1, bin2))
        total_bits = len(bin1)
        percentage = (diff_bits / total_bits) * 100
        
        # Find index positions of changed bits
        changed_indices = [i for i, (b1, b2) in enumerate(zip(bin1, bin2)) if b1 != b2]
        
        return {
            "hash1": hash1,
            "hash2": hash2,
            "bin1": bin1,
            "bin2": bin2,
            "diff_bits": diff_bits,
            "total_bits": total_bits,
            "percentage": round(percentage, 2),
            "changed_indices": changed_indices
        }

    @staticmethod
    def benchmark_algorithms(text: str) -> Dict[str, Any]:
        """Benchmarks the hashing speed and properties of supported algorithms."""
        algorithms_to_test = ["MD5", "SHA1", "SHA256", "SHA512", "SHA3-256", "SHA3-512"]
        results = {}
        
        for alg in algorithms_to_test:
            start_time = time.perf_counter()
            # Perform hashing 10,000 times for speed benchmark
            for _ in range(10000):
                CryptoService.generate_hash(text, alg)
            end_time = time.perf_counter()
            duration_ms = (end_time - start_time) * 1000
            
            # Metadata
            properties = {
                "MD5": {"bits": 128, "collision": "Very Low (Broken)", "security": "Insecure", "speed": "Extremely Fast"},
                "SHA1": {"bits": 160, "collision": "Low (Broken)", "security": "Insecure", "speed": "Very Fast"},
                "SHA256": {"bits": 256, "collision": "High", "security": "Secure", "speed": "Fast"},
                "SHA512": {"bits": 512, "collision": "Very High", "security": "Secure", "speed": "Fast (on 64-bit)"},
                "SHA3-256": {"bits": 256, "collision": "Very High", "security": "Secure", "speed": "Moderate"},
                "SHA3-512": {"bits": 512, "collision": "Very High", "security": "Secure", "speed": "Moderate"},
            }
            
            results[alg] = {
                "hash": CryptoService.generate_hash(text, alg),
                "duration_10k_ms": round(duration_ms, 3),
                "bit_length": properties[alg]["bits"],
                "collision_resistance": properties[alg]["collision"],
                "security_rating": properties[alg]["security"],
                "relative_speed": properties[alg]["speed"]
            }
            
        return results

    # ----------------------------------------------------
    # LAB 2: Password Security & Salts/Peppers
    # ----------------------------------------------------
    @staticmethod
    def estimate_password_strength(password: str) -> Dict[str, Any]:
        """Estimates password strength based on entropy, pattern matching, and key variables."""
        if not password:
            return {"score": 0, "entropy": 0, "crack_time": "Instant", "feedback": [], "rating": "Very Weak"}
            
        length = len(password)
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(not c.isalnum() for c in password)
        
        # Calculate charset size
        pool_size = 0
        if has_lower: pool_size += 26
        if has_upper: pool_size += 26
        if has_digit: pool_size += 10
        if has_special: pool_size += 33
        
        import math
        # Entropy = log2(pool_size ^ length) = length * log2(pool_size)
        entropy = length * math.log2(pool_size) if pool_size > 0 else 0
        
        # Custom scoring out of 100
        score = min(100, int((entropy / 80) * 100)) if entropy > 0 else 0
        
        # Simple guidelines feedback
        feedback = []
        if length < 8:
            feedback.append("Password is too short (aim for at least 12 characters)")
        if not has_upper:
            feedback.append("Add uppercase letters (A-Z)")
        if not has_lower:
            feedback.append("Add lowercase letters (a-z)")
        if not has_digit:
            feedback.append("Add numeric digits (0-9)")
        if not has_special:
            feedback.append("Add special characters (!@#$%^&*)")
            
        # Crack time estimator assumptions (assuming 10 billion hashes/sec for standard GPU offline attack)
        hashes_per_second = 10 * (10**9)
        combinations = pool_size ** length
        crack_seconds = combinations / (2 * hashes_per_second) if combinations > 0 else 0
        
        if crack_seconds < 1:
            crack_time = "Instant"
        elif crack_seconds < 60:
            crack_time = f"{int(crack_seconds)} seconds"
        elif crack_seconds < 3600:
            crack_time = f"{int(crack_seconds / 60)} minutes"
        elif crack_seconds < 86400:
            crack_time = f"{int(crack_seconds / 3600)} hours"
        elif crack_seconds < 31536000:
            crack_time = f"{int(crack_seconds / 86400)} days"
        elif crack_seconds < 31536000 * 100:
            crack_time = f"{int(crack_seconds / 31536000)} years"
        elif crack_seconds < 31536000 * 1000000:
            crack_time = f"{int(crack_seconds / (31536000 * 1000))} thousand years"
        else:
            crack_time = "Centuries"
            
        if score < 30:
            rating = "Very Weak"
        elif score < 50:
            rating = "Weak"
        elif score < 75:
            rating = "Medium"
        elif score < 90:
            rating = "Strong"
        else:
            rating = "Very Strong"
            
        return {
            "score": score,
            "entropy": round(entropy, 1),
            "crack_time": crack_time,
            "feedback": feedback,
            "rating": rating,
            "checks": {
                "length": length >= 12,
                "upper": has_upper,
                "lower": has_lower,
                "digit": has_digit,
                "special": has_special
            }
        }

    @staticmethod
    def generate_salt(length: int = 16) -> str:
        """Generates a cryptographically secure random salt in hex format."""
        return os.urandom(length).hex()

    @staticmethod
    def hash_password(password: str, algorithm: str, salt: str = None) -> Dict[str, Any]:
        """Hashes password using bcrypt, argon2id, or PBKDF2."""
        alg = algorithm.lower()
        start = time.perf_counter()
        
        # Include pepper simulation
        pepped_password = password + settings.PASSWORD_PEPPER
        
        hashed_val = ""
        parameters = {}
        
        if alg == "bcrypt":
            # bcrypt manages its own salt internally
            hashed_val = bcrypt.using(rounds=12).hash(password)
            parameters = {"rounds": 12, "algorithm": "bcrypt (Blowfish)"}
        elif alg == "argon2id":
            # argon2id manages its own salt internally
            hashed_val = argon2.using(type="ID", rounds=3, memory_cost=65536, parallelism=4).hash(password)
            parameters = {"time_cost (rounds)": 3, "memory_cost (KB)": 65536, "parallelism": 4, "algorithm": "Argon2id"}
        elif alg == "pbkdf2":
            # PBKDF2 uses standard HMAC + SHA256
            if not salt:
                salt = CryptoService.generate_salt(16)
            salt_bytes = bytes.fromhex(salt)
            iterations = 100000
            
            pbkdf2_hash = hashlib.pbkdf2_hmac(
                "sha256", 
                password.encode("utf-8"), 
                salt_bytes, 
                iterations
            )
            hashed_val = f"$pbkdf2-sha256$i={iterations}${salt}${pbkdf2_hash.hex()}"
            parameters = {"iterations": iterations, "digest": "SHA256", "salt": salt, "algorithm": "PBKDF2-HMAC-SHA256"}
        else:
            raise ValueError(f"Unsupported password hashing algorithm: {algorithm}")
            
        duration_ms = (time.perf_counter() - start) * 1000
        
        # Demonstration hash with pepper
        pepped_hash = hashlib.sha256(pepped_password.encode()).hexdigest()
        
        return {
            "hashed_value": hashed_val,
            "pepped_sha256_value": pepped_hash,
            "duration_ms": round(duration_ms, 2),
            "parameters": parameters
        }

    # ----------------------------------------------------
    # LAB 3: Symmetric Encryption (AES & ChaCha20)
    # ----------------------------------------------------
    @staticmethod
    def generate_symmetric_key(algorithm: str, key_size: int = 256) -> str:
        """Generates a secure key for symmetric encryption (Hex format)."""
        alg = algorithm.upper()
        if alg == "AES":
            if key_size not in [128, 192, 256]:
                key_size = 256
            return os.urandom(key_size // 8).hex()
        elif alg == "CHACHA20":
            return os.urandom(32).hex() # 256 bits only
        else:
            raise ValueError(f"Unsupported symmetric algorithm: {algorithm}")

    @staticmethod
    def symmetric_encrypt(plaintext: str, key_hex: str, algorithm: str, mode: str = "GCM") -> Dict[str, Any]:
        """Encrypts plaintext using AES-GCM, AES-CBC, or ChaCha20."""
        alg = algorithm.upper()
        mode = mode.upper()
        
        try:
            key_bytes = bytes.fromhex(key_hex)
        except ValueError:
            raise ValueError("Key must be a valid hex-encoded string.")
            
        plaintext_bytes = plaintext.encode("utf-8")
        
        if alg == "AES":
            if len(key_bytes) not in [16, 24, 32]:
                raise ValueError("AES key must be 16 (128-bit), 24 (192-bit), or 32 (256-bit) bytes in length.")
                
            if mode == "GCM":
                # Generate 12-byte IV for GCM
                iv = os.urandom(12)
                cipher = Cipher(algorithms.AES(key_bytes), modes.GCM(iv))
                encryptor = cipher.encryptor()
                ciphertext = encryptor.update(plaintext_bytes) + encryptor.finalize()
                
                return {
                    "ciphertext": ciphertext.hex(),
                    "iv": iv.hex(),
                    "tag": encryptor.tag.hex(),
                    "mode": "GCM"
                }
            elif mode == "CBC":
                # CBC requires 16-byte IV and PKCS7 padding
                iv = os.urandom(16)
                
                # Manual PKCS7 padding
                pad_len = 16 - (len(plaintext_bytes) % 16)
                padded_plaintext = plaintext_bytes + bytes([pad_len] * pad_len)
                
                cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv))
                encryptor = cipher.encryptor()
                ciphertext = encryptor.update(padded_plaintext) + encryptor.finalize()
                
                return {
                    "ciphertext": ciphertext.hex(),
                    "iv": iv.hex(),
                    "tag": None,
                    "mode": "CBC"
                }
            else:
                raise ValueError(f"Unsupported block cipher mode: {mode}")
                
        elif alg == "CHACHA20":
            if len(key_bytes) != 32:
                raise ValueError("ChaCha20 key must be 32 bytes (256-bit) in length.")
                
            # ChaCha20 uses a 16-byte nonce (or 12-byte for RFC7539, cryptography uses 16-byte IV here)
            # Actually, cryptography's ChaCha20 uses 16 bytes IV
            iv = os.urandom(16)
            cipher = Cipher(algorithms.ChaCha20(key_bytes, iv), mode=None)
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(plaintext_bytes) + encryptor.finalize()
            
            return {
                "ciphertext": ciphertext.hex(),
                "iv": iv.hex(),
                "tag": None,
                "mode": "Stream"
            }
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

    @staticmethod
    def symmetric_decrypt(ciphertext_hex: str, key_hex: str, iv_hex: str, algorithm: str, mode: str = "GCM", tag_hex: str = None) -> str:
        """Decrypts ciphertext using AES-GCM, AES-CBC, or ChaCha20."""
        alg = algorithm.upper()
        mode = mode.upper()
        
        try:
            key_bytes = bytes.fromhex(key_hex)
            iv_bytes = bytes.fromhex(iv_hex)
            ciphertext_bytes = bytes.fromhex(ciphertext_hex)
        except ValueError:
            raise ValueError("All inputs must be valid hex-encoded strings.")
            
        if alg == "AES":
            if mode == "GCM":
                if not tag_hex:
                    raise ValueError("Authentication tag (tag) is required for AES-GCM decryption.")
                tag_bytes = bytes.fromhex(tag_hex)
                
                cipher = Cipher(algorithms.AES(key_bytes), modes.GCM(iv_bytes, tag_bytes))
                decryptor = cipher.decryptor()
                decrypted_bytes = decryptor.update(ciphertext_bytes) + decryptor.finalize()
                return decrypted_bytes.decode("utf-8")
                
            elif mode == "CBC":
                cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv_bytes))
                decryptor = cipher.decryptor()
                padded_plaintext = decryptor.update(ciphertext_bytes) + decryptor.finalize()
                
                # Remove PKCS7 padding
                pad_len = padded_plaintext[-1]
                if pad_len < 1 or pad_len > 16:
                    raise ValueError("Invalid padding detected during decryption. Key or IV may be incorrect.")
                if not all(p == pad_len for p in padded_plaintext[-pad_len:]):
                    raise ValueError("Padding mismatch. Decryption failed.")
                    
                return padded_plaintext[:-pad_len].decode("utf-8")
            else:
                raise ValueError(f"Unsupported block cipher mode: {mode}")
                
        elif alg == "CHACHA20":
            cipher = Cipher(algorithms.ChaCha20(key_bytes, iv_bytes), mode=None)
            decryptor = cipher.decryptor()
            decrypted_bytes = decryptor.update(ciphertext_bytes) + decryptor.finalize()
            return decrypted_bytes.decode("utf-8")
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")

    # ----------------------------------------------------
    # LAB 4: RSA Key Generation & Asymmetric Encryption
    # ----------------------------------------------------
    @staticmethod
    def generate_rsa_keypair(key_size: int = 2048) -> Tuple[str, str]:
        """Generates an RSA private and public key pair in PEM format."""
        if key_size not in [1024, 2048, 4096]:
            key_size = 2048
            
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size
        )
        
        # Serialize private key to PEM
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode("utf-8")
        
        # Serialize public key to PEM
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode("utf-8")
        
        return private_pem, public_pem

    @staticmethod
    def rsa_encrypt(plaintext: str, public_key_pem: str) -> str:
        """Encrypts message using RSA public key with OAEP padding."""
        try:
            pub_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
            ciphertext = pub_key.encrypt(
                plaintext.encode("utf-8"),
                OAEP(
                    mgf=MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return base64.b64encode(ciphertext).decode("utf-8")
        except Exception as e:
            raise ValueError(f"RSA Encryption failed: {str(e)}")

    @staticmethod
    def rsa_decrypt(ciphertext_b64: str, private_key_pem: str) -> str:
        """Decrypts message using RSA private key with OAEP padding."""
        try:
            priv_key = serialization.load_pem_private_key(
                private_key_pem.encode("utf-8"),
                password=None
            )
            ciphertext = base64.b64decode(ciphertext_b64.encode("utf-8"))
            decrypted = priv_key.decrypt(
                ciphertext,
                OAEP(
                    mgf=MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return decrypted.decode("utf-8")
        except Exception as e:
            raise ValueError(f"RSA Decryption failed: {str(e)}")

    # ----------------------------------------------------
    # LAB 5: Digital Signatures
    # ----------------------------------------------------
    @staticmethod
    def rsa_sign(message: str, private_key_pem: str) -> str:
        """Signs a message using the RSA private key (PSS padding + SHA256)."""
        try:
            priv_key = serialization.load_pem_private_key(
                private_key_pem.encode("utf-8"),
                password=None
            )
            signature = priv_key.sign(
                message.encode("utf-8"),
                PSS(
                    mgf=MGF1(hashes.SHA256()),
                    salt_length=PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return base64.b64encode(signature).decode("utf-8")
        except Exception as e:
            raise ValueError(f"Signing failed: {str(e)}")

    @staticmethod
    def rsa_verify(message: str, signature_b64: str, public_key_pem: str) -> bool:
        """Verifies an RSA signature for a message using the public key."""
        try:
            pub_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
            signature = base64.b64decode(signature_b64.encode("utf-8"))
            pub_key.verify(
                signature,
                message.encode("utf-8"),
                PSS(
                    mgf=MGF1(hashes.SHA256()),
                    salt_length=PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
