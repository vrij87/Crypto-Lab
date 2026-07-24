import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Lock, Unlock, Copy, Check, Code, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

// Available small primes for learning selection
const SMALL_PRIMES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 71, 73, 79, 83, 89, 97];

// DH Color presets
const ALICE_COLORS = [
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Forest Green', hex: '#10b981' },
  { name: 'Neon Purple', hex: '#8b5cf6' },
  { name: 'Ruby Red', hex: '#ef4444' },
  { name: 'Electric Cyan', hex: '#06b6d4' }
];

const BOB_COLORS = [
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Hot Pink', hex: '#ec4899' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Amethyst', hex: '#7c3aed' },
  { name: 'Crimson', hex: '#b91c1c' }
];

// Greatest Common Divisor helper
const gcd = (a: number, b: number): number => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Modular Inverse helper (Extended Euclidean Algorithm)
const getModInverse = (e: number, phi: number): number => {
  let t = 0;
  let newt = 1;
  let r = phi;
  let newr = e;

  while (newr !== 0) {
    const quotient = Math.floor(r / newr);
    const tempT = t;
    t = newt;
    newt = tempT - quotient * newt;
    const tempR = r;
    r = newr;
    newr = tempR - quotient * newr;
  }

  if (r > 1) return -1; // Not invertible
  if (t < 0) t = t + phi;
  return t;
};

// Modular Exponentiation helper (base^exp % mod)
const powerMod = (base: number, exp: number, mod: number): number => {
  if (mod === 1) return 0;
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) {
      result = (result * b) % mod;
    }
    e = Math.floor(e / 2);
    b = (b * b) % mod;
  }
  return result;
};

const RSASandbox: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'keygen' | 'encrypt' | 'decrypt' | 'dh' | 'about'>('keygen');
  
  // Selection Primes
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [e, setE] = useState(7);
  const [copied, setCopied] = useState<string | null>(null);

  // Manual Sandbox states
  const [plainChar, setPlainChar] = useState('A');
  const [decCipherVal, setDecCipherVal] = useState<number>(104);

  // Code Recipe states
  const [codeLang, setCodeLang] = useState<'python' | 'node'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  // DH Mixer states
  const [dhStep, setDhStep] = useState<number>(0);
  const [aliceColor, setAliceColor] = useState<string>('#3b82f6');
  const [bobColor, setBobColor] = useState<string>('#ef4444');
  const PUBLIC_BASE_COLOR = '#facc15'; // Yellow

  const mixColors = (c1: string, c2: string) => {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);
    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);
    const r = Math.round((r1 + r2) / 2).toString(16).padStart(2, '0');
    const g = Math.round((g1 + g2) / 2).toString(16).padStart(2, '0');
    const b = Math.round((b1 + b2) / 2).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const mixThreeColors = (c1: string, c2: string, c3: string) => {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);
    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);
    const r3 = parseInt(c3.substring(1, 3), 16);
    const g3 = parseInt(c3.substring(3, 5), 16);
    const b3 = parseInt(c3.substring(5, 7), 16);
    const r = Math.round((r1 + r2 + r3) / 3).toString(16).padStart(2, '0');
    const g = Math.round((g1 + g2 + g3) / 3).toString(16).padStart(2, '0');
    const b = Math.round((b1 + b2 + b3) / 3).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const getRSACodeRecipe = () => {
    const plaintextEscaped = plainChar.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    if (codeLang === 'python') {
      return `from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
import base64

# Key Generation
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
public_key = private_key.public_key()

# Message to encrypt
message = b"${plaintextEscaped}"

# Encrypt with OAEP padding
ciphertext = public_key.encrypt(
    message,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)
print("Ciphertext (Base64):", base64.b64encode(ciphertext).decode())`;
    } else {
      return `const crypto = require('crypto');

// Generate 2048-bit RSA keypair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Message to encrypt
const message = Buffer.from("${plaintextEscaped}");

// Encrypt with OAEP padding
const ciphertext = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  message
);

console.log("Ciphertext (Base64):", ciphertext.toString('base64'));`;
    }
  };

  useEffect(() => {
    markLabVisited('rsa-sandbox', 'RSA Math Sandbox', '/labs/rsa-sandbox');
  }, []);

  const handleTabChange = (tab: 'keygen' | 'encrypt' | 'decrypt' | 'dh' | 'about') => {
    setActiveTab(tab);
    if (tab === 'encrypt') updateLabProgress('rsa-sandbox', 45);
    if (tab === 'decrypt') updateLabProgress('rsa-sandbox', 65);
    if (tab === 'dh') updateLabProgress('rsa-sandbox', 85);
    if (tab === 'about') updateLabProgress('rsa-sandbox', 100);
  };

  // Math computations
  const N = useMemo(() => p * q, [p, q]);
  const phi = useMemo(() => (p - 1) * (q - 1), [p, q]);

  // List valid public exponent choices for e
  const validExponents = useMemo(() => {
    const choices: number[] = [];
    // Only search up to 100 or phi - whichever is smaller to prevent massive dropdowns
    const limit = Math.min(phi, 120);
    for (let i = 2; i < limit; i++) {
      if (gcd(i, phi) === 1) {
        choices.push(i);
      }
    }
    return choices;
  }, [phi]);

  // Reset/Fallback check for e when p/q changes
  useEffect(() => {
    if (validExponents.length > 0) {
      if (!validExponents.includes(e)) {
        setE(validExponents[0]);
      }
    }
  }, [validExponents, e]);

  // Calculate private key d
  const d = useMemo(() => {
    return getModInverse(e, phi);
  }, [e, phi]);

  // Derived character ASCII conversion
  const mVal = useMemo(() => {
    return plainChar.length > 0 ? plainChar.charCodeAt(0) : 0;
  }, [plainChar]);

  // Encryption execution
  const cipherVal = useMemo(() => {
    return powerMod(mVal, e, N);
  }, [mVal, e, N]);

  // Decryption execution
  const decryptedMVal = useMemo(() => {
    return powerMod(decCipherVal, d, N);
  }, [decCipherVal, d, N]);

  const decryptedChar = useMemo(() => {
    if (decryptedMVal >= 32 && decryptedMVal <= 126) {
      return String.fromCharCode(decryptedMVal);
    }
    return '? (Non-printable)';
  }, [decryptedMVal]);

  // Record learnings
  useEffect(() => {
    if (p && q && d !== -1) {
      recordAlgorithmLearned('RSA');
      updateLabProgress('rsa-sandbox', 30);
    }
  }, [p, q, d]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-400" />
            RSA Key Generation & Math Sandbox
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Select custom primes, calculate intermediate totients, derive modular multiplicative inverses, and encrypt characters manually.
          </p>
        </div>
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['keygen', 'encrypt', 'decrypt', 'dh', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'keygen' ? '1. Keygen' : tab === 'encrypt' ? '2. Encrypt' : tab === 'decrypt' ? '3. Decrypt' : tab === 'dh' ? '4. DH Mixer' : '5. About'}
            </button>
          ))}
        </div>
      </div>

      {/* ELI5 Banner */}
      <Eli5Banner
        title="Understanding RSA Key Generation"
        analogyTitle="Two Secret Clues & A Modulo Wrap-Around"
        analogyDescription="Imagine multiplying two secret numbers p and q together to get N. Because N is public, anyone can send you a code wrapped around a modular circle. But only someone who knows the original factors (p and q) can calculate the reverse wrap-around key d to decrypt it. Without the factors, the math is a one-way street!"
        bulletPoints={[
          "Modulus N: The product of two primes p and q. Determines the mathematical boundary of the cipher.",
          "Euler Totient (phi): The amount of integers less than N that do not share factors with N. Computed as (p-1)*(q-1).",
          "Public Exponent e: Must share no common factors with totient phi.",
          "Private Exponent d: The modular multiplicative inverse of e, proving d * e = 1 modulo phi."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters and inputs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: KEYGEN */}
          {activeTab === 'keygen' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-gray-850 pb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Step 1: Key Generation Setup
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Prime selection P */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                    Prime Number p
                  </label>
                  <select
                    value={p}
                    onChange={(e) => setP(parseInt(e.target.value))}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                  >
                    {SMALL_PRIMES.map((prime) => (
                      <option key={`p-${prime}`} value={prime}>
                        p = {prime}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prime selection Q */}
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                    Prime Number q
                  </label>
                  <select
                    value={q}
                    onChange={(e) => setQ(parseInt(e.target.value))}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                  >
                    {SMALL_PRIMES.filter(pr => pr !== p).map((prime) => (
                      <option key={`q-${prime}`} value={prime}>
                        q = {prime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {p === q && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 text-rose-450 rounded-lg text-xs font-semibold">
                  Error: Primes p and q must be distinct. Select different numbers.
                </div>
              )}

              {/* Intermediate math equations list */}
              <div className="bg-cyber-darker p-4 rounded-xl border border-gray-800 space-y-4 text-xs font-mono">
                <div className="flex flex-col sm:flex-row justify-between border-b border-gray-850 pb-3 gap-2">
                  <span className="text-gray-400">1. MODULUS N = p * q:</span>
                  <span className="text-white font-bold">
                    {p} * {q} = <span className="text-purple-400 font-extrabold">{N}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between border-b border-gray-850 pb-3 gap-2">
                  <span className="text-gray-400">2. TOTIENT φ(N) = (p-1) * (q-1):</span>
                  <span className="text-white font-bold">
                    ({p}-1) * ({q}-1) = <span className="text-purple-400 font-extrabold">{phi}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between border-b border-gray-850 pb-3 gap-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    3. COPRIME PUBLIC EXPONENT e:
                    <Eli5Tooltip term="Exponent e" simpleExplanation="An encryption offset number that shares absolutely no divisors with phi besides 1." analogy="A dial selection that doesn't jam the gears." />
                  </span>
                  <div className="flex items-center gap-3">
                    <select
                      value={e}
                      onChange={(e) => setE(parseInt(e.target.value))}
                      className="bg-cyber-dark border border-gray-800 rounded px-2.5 py-1 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    >
                      {validExponents.map((val) => (
                        <option key={`e-${val}`} value={val}>
                          e = {val}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <span className="text-gray-400 flex items-center gap-1">
                    4. PRIVATE DECRYPTION EXPONENT d:
                    <Eli5Tooltip term="Decryption Key d" simpleExplanation="Calculated Modular Multiplicative Inverse of e mod phi. It guarantees (d * e) % phi === 1." analogy="The unique lock master key." />
                  </span>
                  <span className="text-white font-bold">
                    {d !== -1 ? (
                      <span>
                        d = <span className="text-emerald-400 font-extrabold">{d}</span>
                        <span className="text-[10px] text-gray-500 ml-2">({d} * {e} = {d * e} ≡ 1 mod {phi})</span>
                      </span>
                    ) : (
                      <span className="text-rose-500">Inversion Error (Change e)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Resulting Keys display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-purple-950/10 border border-purple-500/20 rounded-xl p-4 space-y-2 relative">
                  <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider">Public Key Pair (e, N)</span>
                  <div className="flex items-center justify-between text-base font-bold text-white font-mono">
                    <span>({e}, {N})</span>
                    <button
                      onClick={() => copyToClipboard(`(${e}, ${N})`, 'pub')}
                      className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied === 'pub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copied === 'pub' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-4 space-y-2 relative">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">Private Key Pair (d, N)</span>
                  <div className="flex items-center justify-between text-base font-bold text-white font-mono">
                    <span>({d}, {N})</span>
                    <button
                      onClick={() => copyToClipboard(`(${d}, ${N})`, 'priv')}
                      className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied === 'priv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copied === 'priv' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENCRYPT SANDBOX */}
          {activeTab === 'encrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-gray-850 pb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                Step 2: RSA Encryption Math Sandbox
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                    Enter A Character to Encrypt
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={plainChar}
                    onChange={(e) => setPlainChar(e.target.value.toUpperCase())}
                    className="w-20 bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-center text-white focus:outline-none focus:border-purple-500 font-mono text-lg font-bold"
                  />
                  <span className="text-xs text-gray-500 ml-4 font-mono">
                    ASCII code representation (m) = <span className="text-white font-bold">{mVal}</span>
                  </span>
                </div>

                {mVal >= N && (
                  <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 text-rose-450 rounded-lg text-xs leading-relaxed">
                    <strong>Warning: Modulus N ({N}) is too small</strong> to represent message code m ({mVal}). The wrapping math will collide! Go back to Step 1 and select larger primes $p$ and $q$ to raise N above {mVal}.
                  </div>
                )}

                {/* Mathematical computation step breakdown */}
                <div className="bg-cyber-darker p-4 rounded-xl border border-gray-800 space-y-4 text-xs font-mono leading-relaxed">
                  <h3 className="font-bold text-gray-200 border-b border-gray-850 pb-2 uppercase tracking-wide">
                    Modular Power Formula: c = m^e % N
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-gray-400">1. Substituting values:</p>
                    <p className="text-white font-semibold pl-4">
                      c = {mVal}^{e} mod {N}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400">2. Evaluating exponent exponentiation:</p>
                    <p className="text-white font-semibold pl-4">
                      {mVal}^{e} = {Math.pow(mVal, e) < Infinity ? Math.pow(mVal, e).toLocaleString() : 'Very Large Number'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400">3. Performing wrap-around modular division:</p>
                    <div className="pl-4">
                      <span className="p-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-sm font-bold">
                        Ciphertext c = {cipherVal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider">Resulting Ciphertext Value (c)</span>
                  <div className="flex items-center justify-between font-mono font-bold text-white text-lg">
                    <span>{cipherVal}</span>
                    <button
                      onClick={() => {
                        copyToClipboard(cipherVal.toString(), 'cipher');
                        setDecCipherVal(cipherVal);
                      }}
                      className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied === 'cipher' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copied === 'cipher' ? 'Copied & Passed' : 'Copy to Decrypt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DECRYPT SANDBOX */}
          {activeTab === 'decrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-gray-850 pb-3 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                Step 3: RSA Decryption Math Sandbox
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                    Enter Ciphertext Number to Decrypt (c)
                  </label>
                  <input
                    type="number"
                    value={decCipherVal}
                    onChange={(e) => setDecCipherVal(parseInt(e.target.value) || 0)}
                    className="w-32 bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-center text-white focus:outline-none focus:border-emerald-500 font-mono text-lg font-bold"
                  />
                  <span className="text-xs text-gray-500 ml-4 font-mono">
                    Decryption key exponent (d) = <span className="text-emerald-400 font-bold">{d}</span>
                  </span>
                </div>

                {/* Mathematical calculation steps */}
                <div className="bg-cyber-darker p-4 rounded-xl border border-gray-800 space-y-4 text-xs font-mono leading-relaxed">
                  <h3 className="font-bold text-gray-200 border-b border-gray-850 pb-2 uppercase tracking-wide">
                    Modular Decryption Formula: m = c^d % N
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-gray-400">1. Substituting key values:</p>
                    <p className="text-white font-semibold pl-4">
                      m = {decCipherVal}^{d} mod {N}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400">2. Evaluating binary modular exponentiation:</p>
                    <div className="pl-4 text-gray-300 space-y-1">
                      <p>Computing exponentiation wraps without integer overflow...</p>
                      <p className="text-white">m = {decryptedMVal}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400">3. Converting ASCII integer to String character:</p>
                    <div className="pl-4">
                      <span className="p-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-sm font-bold">
                        ASCII code {decryptedMVal} ➔ '{decryptedChar}'
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">Recovered Plaintext Letter</span>
                  <div className="font-mono font-bold text-white text-lg">
                    {decryptedChar}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIFFIE-HELLMAN MIXER */}
          {activeTab === 'dh' && (
            <div className="glass-panel p-6 space-y-6">
              <div className="border-b border-gray-850 pb-4">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest text-glow">Interactive Concept Playground</span>
                <h2 className="text-xl font-bold text-white mt-0.5">Diffie-Hellman Color-Mixing Analogy</h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Diffie-Hellman Key Exchange allows two parties to establish a shared secret color over an insecure channel without exchanging the secret color directly.
                </p>
              </div>

              {/* Mixing timeline flow */}
              <div className="space-y-6">
                
                {/* Step indicators */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase font-mono font-bold text-gray-500">
                  <div className={`pb-2 border-b-2 ${dhStep >= 0 ? 'border-purple-500 text-purple-400' : 'border-gray-800'}`}>1. Choose Secrets</div>
                  <div className={`pb-2 border-b-2 ${dhStep >= 1 ? 'border-purple-500 text-purple-400' : 'border-gray-800'}`}>2. Mix Public</div>
                  <div className={`pb-2 border-b-2 ${dhStep >= 2 ? 'border-purple-500 text-purple-400' : 'border-gray-800'}`}>3. Swap Mixtures</div>
                  <div className={`pb-2 border-b-2 ${dhStep >= 3 ? 'border-purple-500 text-purple-400' : 'border-gray-800'}`}>4. Derived Key</div>
                </div>

                {/* Main Visual mixer stage */}
                <div className="bg-cyber-darker/60 rounded-xl p-6 border border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  
                  {/* ALICE SIDE */}
                  <div className="flex flex-col items-center space-y-3 z-10 w-full md:w-1/3 text-center">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Alice</span>
                    
                    {/* Alice's Vials */}
                    <div className="flex gap-4 items-end h-28 justify-center">
                      {/* Alice Private Vial */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-16 rounded-b-xl border border-gray-700/80 relative flex items-end justify-center shadow-lg transition-all"
                          style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(31,41,55,0.3))' }}
                        >
                          <div 
                            className="w-8 h-10 rounded-b-lg mb-1 transition-all duration-500 animate-pulse"
                            style={{ backgroundColor: aliceColor, boxShadow: `0 0 15px ${aliceColor}60` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 mt-1">Private Key</span>
                      </div>

                      {/* Alice Mixed Vial (only visible step >= 1) */}
                      {dhStep >= 1 && (
                        <div className="flex flex-col items-center transition-all animate-bar-rise">
                          <div 
                            className="w-10 h-16 rounded-b-xl border border-gray-700/80 relative flex items-end justify-center shadow-lg"
                            style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(31,41,55,0.3))' }}
                          >
                            <div 
                              className="w-8 h-10 rounded-b-lg mb-1 transition-all duration-500"
                              style={{ 
                                backgroundColor: dhStep >= 2 ? (dhStep === 2 ? bobColor : mixThreeColors(aliceColor, bobColor, PUBLIC_BASE_COLOR)) : mixColors(aliceColor, PUBLIC_BASE_COLOR)
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 mt-1">
                            {dhStep === 1 ? 'Public Mix' : dhStep === 2 ? 'Swapped Mix' : 'Shared Secret'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Color picker selector in step 0 */}
                    {dhStep === 0 && (
                      <div className="space-y-1.5 text-center">
                        <label className="text-[9px] font-mono text-gray-400 block uppercase">Pick Secret Color</label>
                        <div className="flex gap-1.5 justify-center">
                          {ALICE_COLORS.map(c => (
                            <button
                              key={c.hex}
                              onClick={() => setAliceColor(c.hex)}
                              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${aliceColor === c.hex ? 'border-white scale-125 shadow-md' : 'border-transparent hover:scale-110'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PUBLIC/SHARED CENTER */}
                  <div className="flex flex-col items-center space-y-2 w-full md:w-1/4 py-4 md:py-0 relative text-center">
                    
                    {dhStep < 2 ? (
                      <div className="flex flex-col items-center space-y-1 z-10">
                        <span className="text-[9px] font-mono uppercase text-gray-500">Shared Public Base</span>
                        <div 
                          className="w-10 h-16 rounded-b-xl border border-gray-700/80 relative flex items-end justify-center shadow-lg"
                          style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(31,41,55,0.3))' }}
                        >
                          <div 
                            className="w-8 h-10 rounded-b-lg mb-1 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-yellow-400">Yellow</span>
                      </div>
                    ) : dhStep === 2 ? (
                      <div className="w-full flex items-center justify-center h-16 text-glow font-bold text-purple-400 animate-pulse text-[10px] font-mono border border-dashed border-purple-500/20 p-2 rounded-lg bg-purple-950/5">
                        ← SWAPPING MIXTURES OVER PUBLIC NETWORK →
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 text-center bg-emerald-950/15 border border-emerald-900/30 p-2 px-3 rounded-lg z-10">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Keys Match!</span>
                        <div 
                          className="w-6 h-6 rounded-full border border-white/20 animate-pulse mx-auto"
                          style={{ backgroundColor: mixThreeColors(aliceColor, bobColor, PUBLIC_BASE_COLOR) }}
                        />
                        <span className="text-[9px] font-mono text-white font-bold block mt-1">{mixThreeColors(aliceColor, bobColor, PUBLIC_BASE_COLOR)}</span>
                      </div>
                    )}
                  </div>

                  {/* BOB SIDE */}
                  <div className="flex flex-col items-center space-y-3 z-10 w-full md:w-1/3 text-center">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Bob</span>
                    
                    {/* Bob's Vials */}
                    <div className="flex gap-4 items-end h-28 justify-center">
                      {/* Bob Private Vial */}
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-10 h-16 rounded-b-xl border border-gray-700/80 relative flex items-end justify-center shadow-lg transition-all"
                          style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(31,41,55,0.3))' }}
                        >
                          <div 
                            className="w-8 h-10 rounded-b-lg mb-1 transition-all duration-500 animate-pulse"
                            style={{ backgroundColor: bobColor, boxShadow: `0 0 15px ${bobColor}60` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 mt-1">Private Key</span>
                      </div>

                      {/* Bob Mixed Vial (only visible step >= 1) */}
                      {dhStep >= 1 && (
                        <div className="flex flex-col items-center transition-all animate-bar-rise">
                          <div 
                            className="w-10 h-16 rounded-b-xl border border-gray-700/80 relative flex items-end justify-center shadow-lg"
                            style={{ background: 'linear-gradient(to top, rgba(17,24,39,0.9), rgba(31,41,55,0.3))' }}
                          >
                            <div 
                              className="w-8 h-10 rounded-b-lg mb-1 transition-all duration-500"
                              style={{ 
                                backgroundColor: dhStep >= 2 ? (dhStep === 2 ? aliceColor : mixThreeColors(aliceColor, bobColor, PUBLIC_BASE_COLOR)) : mixColors(bobColor, PUBLIC_BASE_COLOR)
                              }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 mt-1">
                            {dhStep === 1 ? 'Public Mix' : dhStep === 2 ? 'Swapped Mix' : 'Shared Secret'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Color picker selector in step 0 */}
                    {dhStep === 0 && (
                      <div className="space-y-1.5 text-center">
                        <label className="text-[9px] font-mono text-gray-400 block uppercase">Pick Secret Color</label>
                        <div className="flex gap-1.5 justify-center">
                          {BOB_COLORS.map(c => (
                            <button
                              key={c.hex}
                              onClick={() => setBobColor(c.hex)}
                              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${bobColor === c.hex ? 'border-white scale-125 shadow-md' : 'border-transparent hover:scale-110'}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text explanation box based on step */}
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-xs leading-relaxed text-gray-400 font-mono space-y-2">
                  {dhStep === 0 && (
                    <>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] text-purple-400 border-b border-gray-850 pb-1.5">Step 1: Establishing Secrets</p>
                      <p>Alice and Bob pick private color keys. Alice chose <span className="font-bold text-white">{aliceColor}</span> and Bob chose <span className="font-bold text-white">{bobColor}</span>. They keep these keys strictly private.</p>
                    </>
                  )}
                  {dhStep === 1 && (
                    <>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] text-purple-400 border-b border-gray-850 pb-1.5">Step 2: Mixing with Public Base</p>
                      <p>Both parties add the shared public Yellow base color (<span className="text-yellow-400 font-bold">#facc15</span>) to their private keys.</p>
                      <p>Alice's mix: <span className="font-bold text-white">{mixColors(aliceColor, PUBLIC_BASE_COLOR)}</span>. Bob's mix: <span className="font-bold text-white">{mixColors(bobColor, PUBLIC_BASE_COLOR)}</span>.</p>
                      <p className="text-gray-500 italic text-[10px]">Analogy: Adding Yellow paint creates a public mixture. Just like public key exponentiation, mixing paint is easy, but separating paint back to private colors is mathematically/physically impossible!</p>
                    </>
                  )}
                  {dhStep === 2 && (
                    <>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] text-purple-400 border-b border-gray-850 pb-1.5">Step 3: Exchange Mixtures Publicly</p>
                      <p>Alice sends her green mixture to Bob, and Bob sends his orange mixture to Alice over the insecure web connection.</p>
                      <p>Even if an eavesdropper intercepts the mixtures, they cannot isolate Alice or Bob's private colors due to the one-way nature of the blend.</p>
                    </>
                  )}
                  {dhStep === 3 && (
                    <>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] text-purple-400 border-b border-gray-850 pb-1.5">Step 4: Combine to derive Session Key</p>
                      <p>Alice takes Bob's public mixture (<span className="text-white font-bold">{mixColors(bobColor, PUBLIC_BASE_COLOR)}</span>) and adds her private key (<span className="text-white font-bold">{aliceColor}</span>).</p>
                      <p>Bob takes Alice's public mixture (<span className="text-white font-bold">{mixColors(aliceColor, PUBLIC_BASE_COLOR)}</span>) and adds his private key (<span className="text-white font-bold">{bobColor}</span>).</p>
                      <p>Both calculate the exact same final shared secret color: <span className="text-emerald-400 font-bold font-mono">{mixThreeColors(aliceColor, bobColor, PUBLIC_BASE_COLOR)}</span>!</p>
                    </>
                  )}
                </div>

                {/* Timeline controls */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    disabled={dhStep === 0}
                    onClick={() => setDhStep(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded text-xs font-bold font-mono uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  
                  {dhStep < 3 ? (
                    <button
                      onClick={() => setDhStep(prev => prev + 1)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold font-mono uppercase cursor-pointer"
                    >
                      Next Step
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDhStep(0)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/40 text-purple-300 border border-purple-900/40 hover:bg-purple-900/20 rounded text-xs font-bold font-mono uppercase cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Mixer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View Code Recipes Panel for RSA (visible on keygen, encrypt, decrypt) */}
          {(activeTab === 'keygen' || activeTab === 'encrypt' || activeTab === 'decrypt') && (
            <div className="bg-purple-950/5 border border-purple-500/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-purple-400 flex items-center gap-1.5 font-bold">
                  <Code className="w-3.5 h-3.5" />
                  View RSA Code Recipe
                </span>
                
                <div className="flex gap-2">
                  <div className="flex bg-cyber-darker rounded p-0.5 border border-gray-850 text-[10px]">
                    <button
                      onClick={() => setCodeLang('python')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        codeLang === 'python'
                          ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setCodeLang('node')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        codeLang === 'node'
                          ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Node.js
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getRSACodeRecipe());
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Code Recipe"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <pre className="bg-black/45 text-gray-300 font-mono text-[10px] p-3 rounded-lg overflow-x-auto leading-relaxed border border-gray-900 select-all">
                {getRSACodeRecipe()}
              </pre>
            </div>
          )}

          {/* TAB 5: ABOUT */}
          {activeTab === 'about' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">RSA Asymmetric Cryptography Math</h2>
              
              <div className="space-y-4 text-xs text-gray-400 leading-relaxed">
                <div className="border-b border-gray-850 pb-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">Who Created It?</h3>
                  <p>
                    RSA stands for Ron Rivest, Adi Shamir, and Leonard Adleman, who publicly described the algorithm in 1977. An equivalent asymmetric system was developed secretly in 1973 by British mathematician Clifford Cocks at GCHQ, but it was not declassified until 1997.
                  </p>
                </div>
                <div className="border-b border-gray-850 pb-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">The Factoring Hardness</h3>
                  <p>
                    If an attacker intercepts ciphertext $c$ and public key $(e, N)$, they want to find $d$. To compute $d$, they must know $\phi(N) = (p-1)(q-1)$. But they only know $N$. To find $p$ and $q$ from $N$, they must solve prime factorization. For a 2048-bit number $N$, this would take conventional supercomputers billions of years.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">Why small numbers wrap?</h3>
                  <p>
                    If the message code $m$ is greater than or equal to $N$, modular division ($m \pmod N$) discards the multiples of $N$, meaning distinct letters could map to the same encrypted number. Real-world RSA uses massive primes (often containing over 300 digits) so that the modulus $N$ is vastly larger than any single message payload.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Informational cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-gray-850 pb-2">Active Modulo States</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Primes selected:</span>
                <span className="text-white font-mono font-bold font-mono">p={p}, q={q}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Public modulus N:</span>
                <span className="text-purple-400 font-bold font-mono">{N}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Euler Totient φ:</span>
                <span className="text-white font-bold font-mono">{phi}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Public key exponent:</span>
                <span className="text-white font-bold font-mono">e={e}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Private key inverse:</span>
                <span className="text-emerald-400 font-bold font-mono">d={d !== -1 ? d : 'Error'}</span>
              </div>
            </div>
          </div>

          <RealWorldUsesCard
            title="Real-World Historic Uses"
            items={[
              {
                title: "SSH Handshakes",
                description: "RSA keys authenticate secure shell terminal connections to remote git or staging servers.",
                example: "ssh-rsa public keys",
                badge: "Authentication"
              },
              {
                title: "SSL/TLS certs",
                description: "Web browsers verify digital signatures on web site certs (RSA or ECDSA signatures) to trust connection encryption.",
                example: "HTTPS handshakes",
                badge: "Integrity"
              },
              {
                title: "PGP Secure Email",
                description: "Encrypts message files using symmetric session keys, then encrypts those keys using the recipient's RSA public key.",
                example: "PGP encryption payload",
                badge: "Privacy"
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default RSASandbox;
