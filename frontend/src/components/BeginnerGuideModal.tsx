import React, { useState } from 'react';
import {
  X,
  Hash,
  Lock,
  Key,
  FileCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Globe,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface GuideStep {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  analogy: string;
  explanation: string;
  realWorldUses: { title: string; desc: string }[];
  labPath: string;
  labName: string;
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: 'Hashing' | 'Passwords' | 'Symmetric' | 'Asymmetric' | 'Signatures';
  securityLevel: 'secure' | 'legacy' | 'broken';
  securityBadge: string;
  securityDesc: string;
  recommendedUse: string;
  whereUsed: string;
  labPath: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'hash',
    title: '⚡ 1. Cryptographic Hashing',
    badge: 'Digital Fingerprint',
    icon: Hash,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    analogy: '🍹 Fruit Blender Analogy',
    explanation:
      'Hashing takes any text, file, or image and converts it into a fixed-length string of characters (a hash). It is a ONE-WAY function: like blending fruit into a smoothie, you cannot reverse the hash back into the original text.',
    realWorldUses: [
      {
        title: '🔑 Password Security',
        desc: 'Websites store hashes of passwords instead of plain text. When you log in, they hash your input and check if the hash matches.',
      },
      {
        title: '📦 File Downloads & Git',
        desc: 'Git commit hashes (e.g. a95eda2) and download checksums ensure files have not been corrupted or tampered with.',
      },
    ],
    labPath: '/labs/hashing',
    labName: 'Open Hashing Lab',
  },
  {
    id: 'symmetric',
    title: '🛡️ 2. Symmetric Key Encryption',
    badge: 'Shared Secret Key',
    icon: Lock,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    analogy: '🔑 The Physical Lock & Key',
    explanation:
      'Symmetric encryption uses the SAME single secret key to both lock (encrypt) and unlock (decrypt) data. It is extremely fast and ideal for encrypting large amounts of data.',
    realWorldUses: [
      {
        title: '🌐 HTTPS Web Browsing',
        desc: 'AES-256-GCM encrypts web pages and API requests between your web browser and websites.',
      },
      {
        title: '💬 Encrypted Chat Apps',
        desc: 'WhatsApp and Signal use symmetric ciphers (AES/ChaCha20) to encrypt chat message payloads.',
      },
    ],
    labPath: '/labs/symmetric',
    labName: 'Open AES Symmetric Lab',
  },
  {
    id: 'asymmetric',
    title: '🔐 3. Asymmetric Key Encryption',
    badge: 'Public & Private Key Pair',
    icon: Key,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    analogy: '📮 The Street Mailbox',
    explanation:
      'Asymmetric encryption uses a PAIR of mathematically linked keys: a PUBLIC key (which anyone can use to deposit an encrypted message) and a PRIVATE key (which only YOU hold to unlock it).',
    realWorldUses: [
      {
        title: '🖥️ SSH Server Keys',
        desc: 'Developers log into remote cloud servers securely using RSA or Ed25519 public/private key pairs without passwords.',
      },
      {
        title: '💰 Crypto Wallets',
        desc: 'Bitcoin and Ethereum wallet addresses are derived from your public key, while your private key signs transfers.',
      },
    ],
    labPath: '/labs/asymmetric',
    labName: 'Open RSA & ECC Lab',
  },
  {
    id: 'signatures',
    title: '✍️ 4. Digital Signatures',
    badge: 'Tamper-Proof Wax Seal',
    icon: FileCheck,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    analogy: '📜 Royal Wax Stamp',
    explanation:
      'A digital signature proves WHO wrote a message (Authenticity) and guarantees that the message HAS NOT BEEN ALTERED (Integrity). You sign with your Private Key, and anyone can verify it using your Public Key.',
    realWorldUses: [
      {
        title: '💻 Software Updates',
        desc: 'Windows, macOS, and Android verify digital signatures on app installers before running them to prevent malware.',
      },
      {
        title: '📄 Legal PDF Signing',
        desc: 'DocuSign and electronic contracts use cryptographic digital signatures to legally verify identity.',
      },
    ],
    labPath: '/labs/signatures',
    labName: 'Open Digital Signature Lab',
  },
  {
    id: 'certificates',
    title: '🌐 5. SSL/TLS Certificates',
    badge: 'Digital Identity & Trust',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    analogy: '🪪 Official Passport / ID Card',
    explanation:
      'An SSL/TLS certificate is a digital passport issued by a trusted Certificate Authority (CA) that binds a website domain name (like google.com) to its public key, proving the site is authentic.',
    realWorldUses: [
      {
        title: '🔒 Browser Padlock Icon',
        desc: 'Browsers verify X.509 SSL certificates to show the green/lock icon and establish encrypted HTTPS sessions.',
      },
      {
        title: '🏢 Enterprise VPNs',
        desc: 'Companies issue client certificates to employee laptops to authenticate device identities.',
      },
    ],
    labPath: '/labs/certificates',
    labName: 'Open SSL Certificate Lab',
  },
  {
    id: 'rsa-sandbox',
    title: '🧮 6. RSA Mathematical Sandbox',
    badge: 'Modular Math Primes',
    icon: Cpu,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    analogy: '🧩 Clock Arithmetic Analogy',
    explanation:
      '📚 RSA ALGORITHM GUIDE (How Math is Done):\n\n' +
      '1. Secret Primes (p, q): Select two prime numbers (e.g. p=3, q=11).\n' +
      '2. Modulus N (p * q): Modulus N serves as the base. Numbers wrap at N, like hours on a clock wrapping at 12. Example: N = 3 * 11 = 33.\n' +
      '3. Euler Totient φ (p-1)*(q-1): Calculates numbers coprime to N. Crucial for matching key exponents. Example: φ = 2 * 10 = 20.\n' +
      '4. Public Exponent e: A prime coprime to φ. Used publicly to encrypt message codes (c = m^e % N). Example: e=3.\n' +
      '5. Private Inverse d: The secret exponent satisfying (d * e) % φ = 1. Used to decrypt cipher codes (m = c^d % N). Example: d=7 (since 7 * 3 = 21, and 21 % 20 = 1).\n\n' +
      '🛡️ SECURITY OF RSA SANDBOX:\n' +
      '• Sandbox Math (Broken): Selecting tiny primes (e.g. p, q < 100) generates small moduli (like N=33 or N=143). An attacker can factor N back to p and q in microseconds using simple trial division, instantly breaking the private key.\n' +
      '• Production RSA (Secure): Real-world systems select massive 2048-bit or 4096-bit primes (numbers with hundreds of digits). Modulus N is so massive that factoring it back to p and q is computationally impossible, taking supercomputers billions of years.\n\n' +
      '🎮 EXAMPLES TO TRY BELOW:\n' +
      '• Example 1: Set p = 3, q = 11. Modulus N is 33, φ is 20. Public exponent e is 3, Private exponent d is 7. Try encrypting code 5: 5³ % 33 = 26. Try decrypting 26: 26⁷ % 33 = 5!\n' +
      '• Example 2: Set p = 5, q = 11. Modulus N is 55, φ is 40. Public exponent e is 7, Private exponent d is 23. Try encrypting code 2: 2⁷ % 55 = 18. Try decrypting 18: 18²³ % 55 = 2!',
    realWorldUses: [
      {
        title: '🔑 Factorization Hardness',
        desc: 'Security depends on the inability to factor N back into p and q. For small sandbox values this is easy, but for 2048-bit numbers it is impossible.',
      },
      {
        title: '📐 Modular Arithmetic Wrapping',
        desc: 'Teaches modular wrapping. If a message character code is larger than modulus N, wrapping collides (causing decryption to fail).',
      },
    ],
    labPath: '/labs/rsa-sandbox',
    labName: 'Open RSA Math Sandbox',
  },
];

const ALGORITHMS_DATABASE: AlgorithmInfo[] = [
  // Hashing
  {
    id: 'sha256',
    name: 'SHA-256',
    category: 'Hashing',
    securityLevel: 'secure',
    securityBadge: '🟢 Highly Secure (Gold Standard)',
    securityDesc: '256-bit cryptographic digest. Currently collision-resistant and quantum-safe for pre-image resistance.',
    recommendedUse: 'Recommended for all general-purpose hashing, SHA-256 checksums, and API HMAC signing.',
    whereUsed: 'Bitcoin proof-of-work, Git commits, SSL/TLS certificates, API payload verification.',
    labPath: '/labs/hashing',
  },
  {
    id: 'sha512',
    name: 'SHA-512',
    category: 'Hashing',
    securityLevel: 'secure',
    securityBadge: '🟢 Ultra Secure (64-bit Architecture)',
    securityDesc: '512-bit digest offering double the security margin of SHA-256 with fast 64-bit CPU execution.',
    recommendedUse: 'Recommended for high-security applications, financial systems, and certificate authorities.',
    whereUsed: 'High-security government standards, TLS 1.3 key derivation, OpenSSL digests.',
    labPath: '/labs/hashing',
  },
  {
    id: 'sha3',
    name: 'SHA-3 (Keccak)',
    category: 'Hashing',
    securityLevel: 'secure',
    securityBadge: '🟢 Highly Secure (Next-Gen Sponge)',
    securityDesc: 'NIST sponge construction standard mathematically independent from SHA-2. Immune to length extension attacks.',
    recommendedUse: 'Recommended for next-generation system architectures and post-quantum fallback.',
    whereUsed: 'Ethereum smart contracts (Keccak-256), modern hardware security modules.',
    labPath: '/labs/hashing',
  },
  {
    id: 'blake2',
    name: 'BLAKE2',
    category: 'Hashing',
    securityLevel: 'secure',
    securityBadge: '🟢 Highly Secure & Ultra Fast',
    securityDesc: 'As secure as SHA-3 but faster than MD5 on 64-bit CPUs. Provides built-in keying.',
    recommendedUse: 'Recommended for high-performance software applications requiring maximum hashing speed.',
    whereUsed: 'Linux kernel crypto, WireGuard VPN, Zcash, Argon2 core compression.',
    labPath: '/labs/hashing',
  },
  {
    id: 'hmac',
    name: 'HMAC-SHA256',
    category: 'Hashing',
    securityLevel: 'secure',
    securityBadge: '🟢 Secure Message Authentication',
    securityDesc: 'Hash-based Message Authentication Code combining a secret key with SHA-256.',
    recommendedUse: 'Recommended for verifying API webhook requests and authenticating data in transit.',
    whereUsed: 'Stripe API webhooks, GitHub Webhooks, AWS Request Signing v4, JWT tokens.',
    labPath: '/labs/hashing',
  },
  {
    id: 'md5',
    name: 'MD5',
    category: 'Hashing',
    securityLevel: 'broken',
    securityBadge: '🔴 Cryptographically Broken',
    securityDesc: '128-bit legacy digest. Severe collision vulnerabilities allow generating identical hashes for different inputs in seconds.',
    recommendedUse: 'DO NOT USE for security or passwords. Only acceptable for non-security checksums (e.g. file duplication check).',
    whereUsed: 'Legacy database checksums, non-security file integrity verification.',
    labPath: '/labs/hashing',
  },
  {
    id: 'sha1',
    name: 'SHA-1',
    category: 'Hashing',
    securityLevel: 'broken',
    securityBadge: '🔴 Deprecated & Unsafe',
    securityDesc: '160-bit digest proven vulnerable to collision attacks (SHAttered attack in 2017).',
    recommendedUse: 'DO NOT USE for digital signatures or certificates. Transition all systems to SHA-256.',
    whereUsed: 'Legacy Git commit hashes (transitioning to SHA-256), older SSL certs.',
    labPath: '/labs/hashing',
  },

  // Password KDFs
  {
    id: 'argon2id',
    name: 'Argon2id',
    category: 'Passwords',
    securityLevel: 'secure',
    securityBadge: '🟢 Top Choice (PHC Winner)',
    securityDesc: 'Memory-hard password hashing winner of the Password Hashing Competition. Highly resistant to GPU/ASIC brute-forcing.',
    recommendedUse: 'STRONGLY RECOMMENDED for all new web application user password storage.',
    whereUsed: 'Bitwarden, 1Password, OWASP Password Storage Guidelines, modern Linux distros.',
    labPath: '/labs/passwords',
  },
  {
    id: 'bcrypt',
    name: 'bcrypt',
    category: 'Passwords',
    securityLevel: 'secure',
    securityBadge: '🟢 Industry Standard',
    securityDesc: 'Blowfish-based adaptive key derivation function with adjustable cost factors.',
    recommendedUse: 'Recommended for web apps where Argon2id is not available. Fully secure when cost factor >= 12.',
    whereUsed: 'Node.js passport, Django auth, Spring Security, Ruby on Rails.',
    labPath: '/labs/passwords',
  },
  {
    id: 'scrypt',
    name: 'scrypt',
    category: 'Passwords',
    securityLevel: 'secure',
    securityBadge: '🟢 Secure Memory-Hard KDF',
    securityDesc: 'Requires significant RAM resources to compute, frustrating ASIC parallel brute-forcing.',
    recommendedUse: 'Recommended for key derivation in cryptocurrency keystores and file encryption.',
    whereUsed: 'Ethereum UTC/JSON keystore files, Litecoin proof-of-work, Android disk encryption.',
    labPath: '/labs/passwords',
  },
  {
    id: 'pbkdf2',
    name: 'PBKDF2',
    category: 'Passwords',
    securityLevel: 'legacy',
    securityBadge: '🟡 Acceptable / FIPS Compliant',
    securityDesc: 'Iterative hash algorithm (NIST standard). Lacks memory-hardness, making it vulnerable to GPU rigs if iteration counts are low.',
    recommendedUse: 'Recommended for FIPS-140 compliance environments. Use 600,000+ iterations for HMAC-SHA256.',
    whereUsed: 'WPA2 Wi-Fi authentication, legacy password managers, FIPS-compliant enterprise apps.',
    labPath: '/labs/passwords',
  },

  // Symmetric
  {
    id: 'aes-gcm',
    name: 'AES-256-GCM',
    category: 'Symmetric',
    securityLevel: 'secure',
    securityBadge: '🟢 Gold Standard (AEAD)',
    securityDesc: 'Galois/Counter Mode provides both confidentiality and built-in ciphertext authentication tags.',
    recommendedUse: 'STRONGLY RECOMMENDED for all bulk encryption, HTTPS traffic, and sensitive data storage.',
    whereUsed: 'HTTPS (TLS 1.3), Google Cloud, AWS KMS, BitLocker, IPsec VPNs.',
    labPath: '/labs/symmetric',
  },
  {
    id: 'chacha20',
    name: 'ChaCha20-Poly1305',
    category: 'Symmetric',
    securityLevel: 'secure',
    securityBadge: '🟢 High Speed Mobile Stream Cipher',
    securityDesc: '256-bit stream cipher combined with Poly1305 MAC. Faster in software than AES on CPUs without AES-NI hardware instructions.',
    recommendedUse: 'Recommended for mobile apps (Android/iOS) and software-only environments.',
    whereUsed: 'WireGuard VPN, Chrome for Android HTTPS, WhatsApp message payload encryption.',
    labPath: '/labs/symmetric',
  },
  {
    id: 'aes-cbc',
    name: 'AES-256-CBC',
    category: 'Symmetric',
    securityLevel: 'legacy',
    securityBadge: '🟡 Moderate / Requires HMAC',
    securityDesc: 'Cipher Block Chaining mode. Encrypts blocks sequentially. Vulnerable to padding oracle attacks if not combined with HMAC.',
    recommendedUse: 'Legacy use only. Always use HMAC-SHA256 for integrity verification if GCM mode is unavailable.',
    whereUsed: 'Legacy file encryptors, older VPN protocols, Android legacy storage.',
    labPath: '/labs/symmetric',
  },

  // Asymmetric & Signatures
  {
    id: 'rsa',
    name: 'RSA (2048 / 4096-bit)',
    category: 'Asymmetric',
    securityLevel: 'secure',
    securityBadge: '🟢 Secure (2048+ bits)',
    securityDesc: 'Relies on the mathematical difficulty of factoring large prime numbers.',
    recommendedUse: 'Recommended for SSH login keys (2048+ bits) and SSL certificates. 4096-bit for long-term root CAs.',
    whereUsed: 'SSH keys, HTTPS web certificates, PGP email encryption, TLS handshakes.',
    labPath: '/labs/asymmetric',
  },
  {
    id: 'ecc',
    name: 'ECC (SECP256k1 / Ed25519)',
    category: 'Asymmetric',
    securityLevel: 'secure',
    securityBadge: '🟢 Top Choice (High Performance)',
    securityDesc: 'Elliptic Curve Cryptography provides 256-bit keys with security equivalent to 3072-bit RSA with 10x smaller key size.',
    recommendedUse: 'STRONGLY RECOMMENDED for modern public key cryptography, digital signatures, and cryptocurrency.',
    whereUsed: 'Bitcoin & Ethereum addresses (SECP256k1), OpenSSH Ed25519 keys, Apple iMessage.',
    labPath: '/labs/asymmetric',
  },
  {
    id: 'ecdsa',
    name: 'ECDSA & RSA-PSS',
    category: 'Signatures',
    securityLevel: 'secure',
    securityBadge: '🟢 Secure Digital Signatures',
    securityDesc: 'Provides authentic signature creation and message tampering detection.',
    recommendedUse: 'Recommended for software update signing, JWT authentication tokens, and legal PDF signatures.',
    whereUsed: 'macOS & Windows app update verification, DocuSign PDFs, Git signed commits.',
    labPath: '/labs/signatures',
  },
  {
    id: 'rsa-sandbox-algo',
    name: 'RSA Sandbox Math (Small Primes)',
    category: 'Asymmetric',
    securityLevel: 'broken',
    securityBadge: '🔴 Cryptographically Broken',
    securityDesc: 'Using small prime factors (p, q < 100) makes the modulus N easily factorable in microseconds by simple trial division or Fermat factorization.',
    recommendedUse: 'ONLY for educational sandboxing, visual key generation step walkthroughs, and learning arithmetic wrapping. Never use small prime sizes in production keys.',
    whereUsed: 'CryptoLab RSA Math Sandbox, academic cryptographic modular arithmetic demonstrations.',
    labPath: '/labs/rsa-sandbox',
  },
];

export const BeginnerGuideModal: React.FC = () => {
  const { showBeginnerGuide, closeBeginnerGuide } = useProgress();
  const [viewMode, setViewMode] = useState<'crash_course' | 'algorithms_matrix'>('crash_course');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [algCategory, setAlgCategory] = useState<string>('All');

  // Mini Interactive Widgets States
  const [miniHashInput, setMiniHashInput] = useState('Hello, CryptoLab!');
  const [miniSymPlain, setMiniSymPlain] = useState('My secret message');
  const [miniSymKey, setMiniSymKey] = useState('SHARED_KEY');
  const [miniSymCipher, setMiniSymCipher] = useState('');
  const [miniSymDec, setMiniSymDec] = useState('');

  const [miniAsymPlain, setMiniAsymPlain] = useState('RSA is fun');
  const [miniAsymCipher, setMiniAsymCipher] = useState('');
  const [miniAsymDec, setMiniAsymDec] = useState('');

  const [miniSigMessage, setMiniSigMessage] = useState('Approve transaction of $100');
  const [miniSignature, setMiniSignature] = useState('');
  const [miniSigVerified, setMiniSigVerified] = useState<boolean | null>(null);

  const [showSSLDetails, setShowSSLDetails] = useState(false);

  // Mini RSA Sandbox States
  const [miniRSAp, setMiniRSAp] = useState(11);
  const [miniRSAq, setMiniRSAq] = useState(13);

  // 1. Simple Hash (DJB2 variation)
  const simpleHash = (str: string) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  };

  // 2. Simple Symmetric XOR
  const simpleXOR = (text: string, key: string) => {
    if (!key) return '';
    return text.split('').map((c, i) => {
      const k = key.charCodeAt(i % key.length);
      return String.fromCharCode(c.charCodeAt(0) ^ k);
    }).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  };

  const simpleXORDecrypt = (hex: string, key: string) => {
    if (!key || !hex) return '';
    try {
      const chars: string[] = [];
      for (let i = 0; i < hex.length; i += 2) {
        chars.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
      }
      return chars.map((c, i) => {
        const k = key.charCodeAt(i % key.length);
        return String.fromCharCode(c.charCodeAt(0) ^ k);
      }).join('');
    } catch (e) {
      return 'Decryption Error';
    }
  };

  // 3. Mini RSA Asymmetric Math (e=7, d=103, N=143)
  const rsaEncryptString = (text: string) => {
    const eVal = 7;
    const nVal = 143;
    return text.split('').map(char => {
      const m = char.charCodeAt(0);
      let result = 1;
      let base = m % nVal;
      let exp = eVal;
      while (exp > 0) {
        if (exp % 2 === 1) result = (result * base) % nVal;
        base = (base * base) % nVal;
        exp = Math.floor(exp / 2);
      }
      return result.toString(16).padStart(2, '0');
    }).join(' ');
  };

  const rsaDecryptString = (hexString: string) => {
    const dVal = 103;
    const nVal = 143;
    if (!hexString) return '';
    try {
      return hexString.split(' ').map(hex => {
        const c = parseInt(hex, 16);
        if (isNaN(c)) return '';
        let result = 1;
        let base = c % nVal;
        let exp = dVal;
        while (exp > 0) {
          if (exp % 2 === 1) result = (result * base) % nVal;
          base = (base * base) % nVal;
          exp = Math.floor(exp / 2);
        }
        return String.fromCharCode(result);
      }).join('');
    } catch (e) {
      return 'Decryption Error';
    }
  };

  // 4. Mini RSA Signatures (Alice Private key d=103, Bob Public key e=7, N=143)
  const getSignature = (text: string) => {
    const h = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 143;
    let s = 1;
    let base = h % 143;
    let exp = 103;
    while (exp > 0) {
      if (exp % 2 === 1) s = (s * base) % 143;
      base = (base * base) % 143;
      exp = Math.floor(exp / 2);
    }
    return s.toString(16).toUpperCase();
  };

  const verifySignature = (text: string, sigHex: string) => {
    const hActual = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 143;
    const s = parseInt(sigHex, 16);
    if (isNaN(s)) return false;
    let hExpected = 1;
    let base = s % 143;
    let exp = 7;
    while (exp > 0) {
      if (exp % 2 === 1) hExpected = (hExpected * base) % 143;
      base = (base * base) % 143;
      exp = Math.floor(exp / 2);
    }
    return hActual === hExpected;
  };

  if (!showBeginnerGuide) return null;

  const activeStep = GUIDE_STEPS[currentIdx];
  const StepIcon = activeStep.icon;

  const handleNext = () => {
    if (currentIdx < GUIDE_STEPS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const filteredAlgorithms =
    algCategory === 'All'
      ? ALGORITHMS_DATABASE
      : ALGORITHMS_DATABASE.filter((a) => a.category === algCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                🌱 Beginner Cryptography Knowledge Center
              </h2>
              <p className="text-[11px] text-slate-400">
                Master core concepts, analogies, and real-world algorithm recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={closeBeginnerGuide}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('crash_course')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'crash_course'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>📖 5-Step Crash Course</span>
            </button>

            <button
              onClick={() => setViewMode('algorithms_matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'algorithms_matrix'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>🔐 Algorithms Guide & Security</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline-block font-mono">
            {viewMode === 'crash_course' ? 'Step-by-step primitives' : `${ALGORITHMS_DATABASE.length} Algorithms indexed`}
          </span>
        </div>

        {/* Content Body */}
        {viewMode === 'crash_course' ? (
          <>
            {/* Steps Sub-Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-950/30 border-b border-slate-800/60 overflow-x-auto scrollbar-none">
              {GUIDE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentIdx;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-800 text-white shadow border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                    <span>{step.title.split('.')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Crash Course Slide */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${activeStep.bgColor} ${activeStep.color} border ${activeStep.borderColor}`}
                  >
                    {activeStep.badge}
                  </span>
                  <h3 className="text-xl font-extrabold text-white">
                    {activeStep.title}
                  </h3>
                </div>

                <div
                  className={`p-3.5 rounded-2xl ${activeStep.bgColor} border ${activeStep.borderColor} ${activeStep.color}`}
                >
                  <StepIcon className="w-8 h-8" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {activeStep.analogy}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mt-1">
                  {activeStep.explanation}
                </p>
              </div>

              {/* 1. Cryptographic Hashing Widget */}
              {activeStep.id === 'hash' && (
                <div className="bg-slate-950/50 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      🔬 Interactive Hashing Sandbox
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">One-Way Fingerprint</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={miniHashInput}
                      onChange={(e) => setMiniHashInput(e.target.value)}
                      placeholder="Type message here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-xs">
                      <span className="text-slate-400">Simple Fletcher-32 Digest (Hex):</span>
                      <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest">
                        {simpleHash(miniHashInput)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      Try changing just one character (e.g. capitalize a letter). Notice how the entire 8-character fingerprint changes completely (Avalanche Effect)!
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Symmetric Encryption Widget */}
              {activeStep.id === 'symmetric' && (
                <div className="bg-slate-950/50 border border-cyan-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">🔒 Interactive Symmetric XOR Sandbox</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 block">Plaintext Message</label>
                      <input
                        type="text"
                        value={miniSymPlain}
                        onChange={(e) => {
                          setMiniSymPlain(e.target.value);
                          const cipher = simpleXOR(e.target.value, miniSymKey);
                          setMiniSymCipher(cipher);
                          setMiniSymDec(simpleXORDecrypt(cipher, miniSymKey));
                        }}
                        placeholder="Type message..."
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 block">Shared Secret Key</label>
                      <input
                        type="text"
                        value={miniSymKey}
                        onChange={(e) => {
                          setMiniSymKey(e.target.value);
                          const cipher = simpleXOR(miniSymPlain, e.target.value);
                          setMiniSymCipher(cipher);
                          setMiniSymDec(simpleXORDecrypt(cipher, e.target.value));
                        }}
                        placeholder="Key..."
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850 font-mono text-xs">
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-850">
                      <span className="text-slate-400">Ciphertext (Hex):</span>
                      <span className="text-cyan-400 font-bold break-all bg-cyan-500/10 px-2 py-0.5 rounded">
                        {miniSymCipher || simpleXOR(miniSymPlain, miniSymKey)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-850">
                      <span className="text-slate-400">Decrypted Payload:</span>
                      <span className="text-emerald-400 font-bold">
                        {miniSymDec || simpleXORDecrypt(miniSymCipher || simpleXOR(miniSymPlain, miniSymKey), miniSymKey)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Asymmetric Encryption Widget */}
              {activeStep.id === 'asymmetric' && (
                <div className="bg-slate-950/50 border border-purple-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">🔑 Interactive Asymmetric RSA Sandbox</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Bob publishes his Public Key pair <span className="text-purple-400 font-bold">(e=7, N=143)</span>. Anyone can encrypt messages using it, but only Bob's Private Key <span className="text-purple-400 font-bold">(d=103)</span> can decrypt.
                  </p>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={miniAsymPlain}
                      onChange={(e) => setMiniAsymPlain(e.target.value)}
                      placeholder="Message to Bob..."
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                      <button
                        onClick={() => {
                          const cipher = rsaEncryptString(miniAsymPlain);
                          setMiniAsymCipher(cipher);
                          setMiniAsymDec('');
                        }}
                        className="px-3 py-1.5 bg-purple-650 hover:bg-purple-600 text-white rounded text-xs font-bold font-mono uppercase cursor-pointer"
                      >
                        Lock with Public Key (e=7, N=143)
                      </button>
                      
                      <button
                        onClick={() => {
                          const dec = rsaDecryptString(miniAsymCipher);
                          setMiniAsymDec(dec);
                        }}
                        disabled={!miniAsymCipher}
                        className="px-3 py-1.5 bg-indigo-955 text-indigo-300 border border-indigo-900/40 hover:bg-indigo-900/20 disabled:opacity-40 rounded text-xs font-bold font-mono uppercase cursor-pointer"
                      >
                        Unlock with Private Key (d=103)
                      </button>
                    </div>

                    {miniAsymCipher && (
                      <div className="space-y-2 pt-2 border-t border-slate-850 font-mono">
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-850">
                          <span className="text-slate-400">Ciphertext (RSA Exponents):</span>
                          <span className="text-purple-400 font-bold break-all bg-purple-500/10 px-2 py-0.5 rounded">{miniAsymCipher}</span>
                        </div>
                        {miniAsymDec && (
                          <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-850">
                            <span className="text-slate-400">Decrypted Message:</span>
                            <span className="text-emerald-400 font-bold">{miniAsymDec}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. Digital Signatures Widget */}
              {activeStep.id === 'signatures' && (
                <div className="bg-slate-950/50 border border-pink-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider block">✍️ Interactive Digital Signatures Sandbox</span>
                  
                  <div className="space-y-2 text-xs">
                    <label className="text-[10px] font-mono text-slate-500 block">Alice's Contract Text</label>
                    <input
                      type="text"
                      value={miniSigMessage}
                      onChange={(e) => {
                        setMiniSigMessage(e.target.value);
                        setMiniSigVerified(null);
                      }}
                      placeholder="Message to sign..."
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-pink-500 focus:outline-none"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                      <button
                        onClick={() => {
                          const sig = getSignature(miniSigMessage);
                          setMiniSignature(sig);
                          setMiniSigVerified(null);
                        }}
                        className="px-3 py-1.5 bg-pink-650 hover:bg-pink-600 text-white rounded text-xs font-bold font-mono uppercase cursor-pointer"
                      >
                        Sign with Alice's Private Key
                      </button>
                      
                      <button
                        onClick={() => {
                          const matches = verifySignature(miniSigMessage, miniSignature);
                          setMiniSigVerified(matches);
                        }}
                        disabled={!miniSignature}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-750 disabled:opacity-40 text-white rounded text-xs font-bold font-mono uppercase cursor-pointer"
                      >
                        Verify Signature with Alice's Public Key
                      </button>
                    </div>

                    {miniSignature && (
                      <div className="space-y-2 pt-2 border-t border-slate-850 font-mono">
                        <div className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-850">
                          <span className="text-slate-400">Cryptographic Seal / Signature:</span>
                          <span className="text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded">{miniSignature}</span>
                        </div>
                        
                        {miniSigVerified !== null && (
                          <div className={`p-2.5 rounded-lg border text-center ${
                            miniSigVerified
                              ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                              : 'bg-rose-950/20 border-rose-900/30 text-rose-450 font-bold'
                          }`}>
                            {miniSigVerified ? (
                              <span>✔ Signature Valid! Bob verifies Alice wrote this exact message.</span>
                            ) : (
                              <span>❌ Warning: Signature Invalid! The message has been altered or tampered with!</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. SSL/TLS Certificates Widget */}
              {activeStep.id === 'certificates' && (
                <div className="bg-slate-950/50 border border-amber-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">🪪 Browser TLS Certificate Verification</span>
                  
                  {/* Simulated Address Bar */}
                  <div className="bg-slate-900 rounded-lg p-2 border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-grow">
                      <button
                        onClick={() => setShowSSLDetails(prev => !prev)}
                        className="p-1 px-1.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Lock className="w-3.5 h-3.5 fill-amber-400" />
                        <span>HTTPS</span>
                      </button>
                      <span className="text-slate-300 font-mono select-none">https://cryptolab-bank.com</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                      Secure
                    </span>
                  </div>

                  {/* SSL Details Box */}
                  {showSSLDetails && (
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2 font-mono text-[10px] leading-relaxed animate-bar-rise">
                      <div className="border-b border-slate-850 pb-1 text-slate-400 font-bold uppercase tracking-wider">X.509 Certificate details:</div>
                      <p><span className="text-slate-500">Issued To:</span> cryptolab-bank.com</p>
                      <p><span className="text-slate-500">Issued By:</span> Let's Encrypt Authority X3</p>
                      <p><span className="text-slate-500">Serial Number:</span> 04:A3:F9:5D:EE:12:8B</p>
                      <p><span className="text-slate-500">Signature Alg:</span> sha256WithRSAEncryption</p>
                      <p><span className="text-slate-500">Validity:</span> Trusted & Active</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Click the lock icon next to the address to view the certificate details pop-up, proving identity!
                  </p>
                </div>
              )}

              {/* 6. RSA Math Sandbox Widget */}
              {activeStep.id === 'rsa-sandbox' && (
                <div className="bg-slate-950/50 border border-purple-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider block">📐 Interactive Miniature RSA Calculator</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 block">Prime Number p</label>
                      <select
                        value={miniRSAp}
                        onChange={(e) => setMiniRSAp(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                      >
                        {[3, 5, 7, 11, 13, 17, 19].map(prime => (
                          <option key={prime} value={prime}>{prime}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 block">Prime Number q</label>
                      <select
                        value={miniRSAq}
                        onChange={(e) => setMiniRSAq(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                      >
                        {[3, 5, 7, 11, 13, 17, 19].filter(prime => prime !== miniRSAp).map(prime => (
                          <option key={prime} value={prime}>{prime}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculations breakdown */}
                  {(() => {
                    const N_calc = miniRSAp * miniRSAq;
                    const phi_calc = (miniRSAp - 1) * (miniRSAq - 1);
                    
                    // Smallest e coprime to phi
                    let e_calc = 3;
                    const gcd_fn = (a: number, b: number): number => {
                      while (b !== 0) {
                        const temp = b;
                        b = a % b;
                        a = temp;
                      }
                      return a;
                    };
                    while (e_calc < phi_calc) {
                      if (gcd_fn(e_calc, phi_calc) === 1) break;
                      e_calc += 2;
                    }

                    // Modular inverse d
                    let d_calc = 1;
                    for (let x = 1; x < phi_calc; x++) {
                      if (((e_calc % phi_calc) * (x % phi_calc)) % phi_calc === 1) {
                        d_calc = x;
                        break;
                      }
                    }

                    return (
                      <div className="space-y-2 pt-2 border-t border-slate-850 font-mono text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 bg-slate-900 rounded border border-slate-850">
                            <span className="text-slate-500">Modulus N (p * q):</span>
                            <span className="text-white font-bold block text-xs mt-0.5">{N_calc}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-850">
                            <span className="text-slate-500">Euler Totient φ (p-1)*(q-1):</span>
                            <span className="text-white font-bold block text-xs mt-0.5">{phi_calc}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-850">
                            <span className="text-purple-400">Public Key Exponent e:</span>
                            <span className="text-purple-300 font-bold block text-xs mt-0.5">{e_calc}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded border border-slate-850">
                            <span className="text-emerald-400">Private Key Exponent d:</span>
                            <span className="text-emerald-300 font-bold block text-xs mt-0.5">{d_calc}</span>
                          </div>
                        </div>

                        {/* Interactive Encrypt/Decrypt Simulation */}
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 space-y-2 text-[10px]">
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Key Pairs Generated:</span>
                            <span className="text-white font-bold bg-slate-800 p-0.5 px-2 rounded">
                              Public: ({e_calc}, {N_calc}) | Private: ({d_calc}, {N_calc})
                            </span>
                          </div>
                          <p className="text-slate-500 leading-normal leading-relaxed">
                            Changing the prime options recalculates the public modulus $N$, Euler totient $\phi$, public key exponent $e$, and private key inverse $d$. Try larger primes in the full lab to expand keyspace!
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Where is it used in real life?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStep.realWorldUses.map((use, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                    >
                      <h5 className="text-xs font-bold text-white">
                        {use.title}
                      </h5>
                      <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                        {use.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crash Course Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIdx === GUIDE_STEPS.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-white transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <a
                href={activeStep.labPath}
                onClick={closeBeginnerGuide}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <span>{activeStep.labName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </>
        ) : (
          /* Algorithms Matrix View */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Hashing', 'Passwords', 'Symmetric', 'Asymmetric', 'Signatures'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setAlgCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      algCategory === cat
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Algorithms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlgorithms.map((alg) => {
                let badgeStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                let IconComponent = CheckCircle2;

                if (alg.securityLevel === 'legacy') {
                  badgeStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
                  IconComponent = AlertTriangle;
                } else if (alg.securityLevel === 'broken') {
                  badgeStyle = 'bg-red-500/10 border-red-500/30 text-red-400';
                  IconComponent = ShieldAlert;
                }

                return (
                  <div
                    key={alg.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          {alg.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeStyle}`}
                        >
                          <IconComponent className="w-3 h-3" />
                          <span>{alg.securityBadge}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{alg.name}</h4>

                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        <strong className="text-slate-200">Security:</strong> {alg.securityDesc}
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                        <span className="text-emerald-400 font-bold block mb-0.5">
                          💡 When & Where Recommended:
                        </span>
                        <span className="text-slate-300">{alg.recommendedUse}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2">
                        <strong className="text-slate-300">Real-World Examples:</strong> {alg.whereUsed}
                      </p>

                      {alg.id === 'rsa-sandbox-algo' && (
                        <div className="mt-3 p-3 bg-red-950/30 border border-red-500/25 rounded-xl text-[11px] leading-relaxed text-red-350">
                          <strong className="text-red-400 block mb-1">⚠️ CRITICAL STUDENT WARNING:</strong>
                          This sandbox uses tiny prime numbers (under 100) solely so the arithmetic is readable and easy to follow. 
                          <span className="font-bold text-red-250"> NEVER use small prime sizes in real-world keys.</span> A basic computer can factor small moduli in microseconds to steal your private keys. Real-world RSA requires massive primes (2048+ bits) to guarantee mathematical security.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                      <a
                        href={alg.labPath}
                        onClick={closeBeginnerGuide}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Test in Interactive Lab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
