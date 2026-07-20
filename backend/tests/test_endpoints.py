def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_hash_generation(client):
    response = client.post(
        "/api/hashing/hash",
        json={"text": "hello", "algorithm": "SHA256"}
    )
    assert response.status_code == 200
    assert response.json()["hash"] == "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    assert response.json()["algorithm"] == "SHA256"

def test_hash_avalanche(client):
    response = client.post(
        "/api/hashing/avalanche",
        json={"text1": "hello", "text2": "hellp", "algorithm": "SHA256"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "hash1" in data
    assert "hash2" in data
    assert "diff_bits" in data
    assert data["total_bits"] == 256
    assert data["percentage"] > 0

def test_password_strength(client):
    response = client.post(
        "/api/passwords/strength",
        json={"password": "Weak"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == "Very Weak"
    assert data["score"] < 50
    assert len(data["feedback"]) > 0

def test_password_hash_and_salt(client):
    salt_resp = client.post("/api/passwords/generate-salt")
    assert salt_resp.status_code == 200
    salt = salt_resp.json()["salt"]
    assert len(salt) == 32 # Hex of 16 bytes
    
    hash_resp = client.post(
        "/api/passwords/hash",
        json={"password": "MySecurePassword123!", "algorithm": "pbkdf2", "salt": salt}
    )
    assert hash_resp.status_code == 200
    hdata = hash_resp.json()
    assert "hashed_value" in hdata
    assert "duration_ms" in hdata
    assert hdata["parameters"]["algorithm"] == "PBKDF2-HMAC-SHA256"

def test_symmetric_aes(client):
    key_resp = client.post(
        "/api/symmetric/generate-key",
        json={"algorithm": "AES", "key_size": 256}
    )
    assert key_resp.status_code == 200
    key = key_resp.json()["key"]
    assert len(key) == 64 # Hex of 32 bytes
    
    plaintext = "Secret Message"
    enc_resp = client.post(
        "/api/symmetric/encrypt",
        json={"plaintext": plaintext, "key": key, "algorithm": "AES", "mode": "GCM"}
    )
    assert enc_resp.status_code == 200
    edata = enc_resp.json()
    assert "ciphertext" in edata
    assert "iv" in edata
    assert "tag" in edata
    
    dec_resp = client.post(
        "/api/symmetric/decrypt",
        json={
            "ciphertext": edata["ciphertext"],
            "key": key,
            "iv": edata["iv"],
            "algorithm": "AES",
            "mode": "GCM",
            "tag": edata["tag"]
        }
    )
    assert dec_resp.status_code == 200
    assert dec_resp.json()["plaintext"] == plaintext

def test_asymmetric_rsa(client):
    gen_resp = client.post(
        "/api/asymmetric/generate-rsa",
        json={"key_size": 2048}
    )
    assert gen_resp.status_code == 200
    keys = gen_resp.json()
    assert "private_key" in keys
    assert "public_key" in keys
    
    plaintext = "Hello RSA"
    enc_resp = client.post(
        "/api/asymmetric/encrypt",
        json={"plaintext": plaintext, "public_key": keys["public_key"]}
    )
    assert enc_resp.status_code == 200
    ciphertext = enc_resp.json()["ciphertext"]
    
    dec_resp = client.post(
        "/api/asymmetric/decrypt",
        json={"ciphertext": ciphertext, "private_key": keys["private_key"]}
    )
    assert dec_resp.status_code == 200
    assert dec_resp.json()["plaintext"] == plaintext

def test_digital_signatures(client):
    gen_resp = client.post(
        "/api/asymmetric/generate-rsa",
        json={"key_size": 2048}
    )
    keys = gen_resp.json()
    
    message = "Signed Message"
    sign_resp = client.post(
        "/api/signatures/sign",
        json={"message": message, "private_key": keys["private_key"]}
    )
    assert sign_resp.status_code == 200
    sig = sign_resp.json()["signature"]
    
    verify_resp = client.post(
        "/api/signatures/verify",
        json={"message": message, "signature": sig, "public_key": keys["public_key"]}
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True
    
    # Tamper
    verify_resp_fake = client.post(
        "/api/signatures/verify",
        json={"message": "Tampered Message", "signature": sig, "public_key": keys["public_key"]}
    )
    assert verify_resp_fake.status_code == 200
    assert verify_resp_fake.json()["valid"] is False

def test_algorithms_explorer(client):
    response = client.get("/api/explorer/algorithms")
    assert response.status_code == 200
    assert "SHA-256" in response.json()
    assert response.json()["SHA-256"]["type"] == "Hashing"

def test_certificate_analysis_failure(client):
    # Tests domain connection failure handling
    response = client.post(
        "/api/certificate/analyze",
        json={"url": "invalid-domain-name-that-does-not-exist.xyz"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is False
    assert "error" in response.json()

def test_challenges(client):
    list_resp = client.get("/api/challenges/list")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) > 0
    challenge_id = list_resp.json()[0]["id"]
    
    status_resp = client.get("/api/challenges/status/testuser")
    assert status_resp.status_code == 200
    assert status_resp.json()["score"] == 0
    
    # Submit incorrect answer
    sub_resp = client.post(
        "/api/challenges/submit",
        json={
            "username": "testuser",
            "challenge_id": challenge_id,
            "answer_index": 0 # Wrong answer for the MD5 broken challenge (SHA-256 is 0)
        }
    )
    assert sub_resp.status_code == 200
    assert sub_resp.json()["correct"] is False
    assert sub_resp.json()["score"] == 0
    
    # Submit correct answer (correct index is 1 for MD5)
    sub_resp_correct = client.post(
        "/api/challenges/submit",
        json={
            "username": "testuser",
            "challenge_id": challenge_id,
            "answer_index": 1
        }
    )
    assert sub_resp_correct.status_code == 200
    assert sub_resp_correct.json()["correct"] is True
    assert sub_resp_correct.json()["score"] == 10
