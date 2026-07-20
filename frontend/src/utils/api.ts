import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// API interfaces and functions
export interface HashRequest {
  text: string;
  algorithm: string;
}

export interface AvalancheRequest {
  text1: string;
  text2: string;
  algorithm: string;
}

export interface PasswordStrengthRequest {
  password: string;
}

export interface PasswordHashRequest {
  password: string;
  algorithm: string;
  salt?: string;
}

export interface SymmetricKeyRequest {
  algorithm: string;
  key_size: number;
}

export interface SymmetricEncryptRequest {
  plaintext: string;
  key: string;
  algorithm: string;
  mode: string;
}

export interface SymmetricDecryptRequest {
  ciphertext: string;
  key: string;
  iv: string;
  algorithm: string;
  mode: string;
  tag?: string;
}

export interface RSAGenRequest {
  key_size?: number;
}

export interface RSAEncryptRequest {
  plaintext: string;
  public_key: string;
}

export interface RSADecryptRequest {
  ciphertext: string;
  private_key: string;
}

export interface SignRequest {
  message: string;
  private_key: string;
}

export interface VerifyRequest {
  message: string;
  signature: string;
  public_key: string;
}

export interface CertRequest {
  url: string;
}

export interface ChallengeSubmitRequest {
  username: string;
  challenge_id: number;
  answer_index: number;
}
