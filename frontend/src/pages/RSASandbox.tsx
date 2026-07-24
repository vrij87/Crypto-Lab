import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Lock, Unlock, Copy, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

// Available small primes for learning selection
const SMALL_PRIMES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 71, 73, 79, 83, 89, 97];

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
  const [activeTab, setActiveTab] = useState<'keygen' | 'encrypt' | 'decrypt' | 'about'>('keygen');
  
  // Selection Primes
  const [p, setP] = useState(11);
  const [q, setQ] = useState(13);
  const [e, setE] = useState(7);
  const [copied, setCopied] = useState<string | null>(null);

  // Manual Sandbox states
  const [plainChar, setPlainChar] = useState('A');
  const [decCipherVal, setDecCipherVal] = useState<number>(104);

  useEffect(() => {
    markLabVisited('rsa-sandbox', 'RSA Math Sandbox', '/labs/rsa-sandbox');
  }, []);

  const handleTabChange = (tab: 'keygen' | 'encrypt' | 'decrypt' | 'about') => {
    setActiveTab(tab);
    if (tab === 'encrypt') updateLabProgress('rsa-sandbox', 50);
    if (tab === 'decrypt') updateLabProgress('rsa-sandbox', 80);
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
          {(['keygen', 'encrypt', 'decrypt', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'keygen' ? '1. Key Generation' : tab === 'encrypt' ? '2. Encrypt Sandbox' : tab === 'decrypt' ? '3. Decrypt Sandbox' : '4. About'}
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

          {/* TAB 4: ABOUT */}
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
