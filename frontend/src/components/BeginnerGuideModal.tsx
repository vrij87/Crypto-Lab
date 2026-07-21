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
];

export const BeginnerGuideModal: React.FC = () => {
  const { showBeginnerGuide, closeBeginnerGuide } = useProgress();
  const [viewMode, setViewMode] = useState<'crash_course' | 'algorithms_matrix'>('crash_course');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [algCategory, setAlgCategory] = useState<string>('All');

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
