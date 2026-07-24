import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT bearer token or scoreboard token into headers if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const scoreboardToken = localStorage.getItem('cryptolab_scoreboard_token');
    if (scoreboardToken) {
      config.headers['X-Scoreboard-Token'] = scoreboardToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
