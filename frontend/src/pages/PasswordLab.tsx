import React, { useState, useEffect } from 'react';
import { 
  Lock, ShieldCheck, ShieldAlert, Check, X, RefreshCw, Eye, EyeOff, Play, ShieldEllipsis 
} from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const PasswordLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'strength' | 'hash' | 'salts' | 'standards'>('strength');

  useEffect(() => {
    markLabVisited('passwords', 'Password Security Lab', '/labs/passwords');
    updateLabProgress('passwords', 100);
  }, []);

  // Tab 1: Strength Checker
  const [passwordInput, setPasswordInput] = useState('');
  const [strengthResult, setStrengthResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Tab 2: Hash Password
  const [hashPassword, setHashPassword] = useState('PasswordToHash123');
  const [hashAlg, setHashAlg] = useState('bcrypt');
  const [hashSalt, setHashSalt] = useState('');
  const [hashResult, setHashResult] = useState<any>(null);
  const [hashLoading, setHashLoading] = useState(false);

  // Tab 3: Salt & Pepper Simulation
  const [simPassword, setSimPassword] = useState('admin123');
  const [simState, setSimState] = useState<'idle' | 'hashing' | 'cracking' | 'success' | 'protected'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [useSalt, setUseSalt] = useState(false);

  useEffect(() => {
    if (activeTab === 'strength') {
      const checkStrength = async () => {
        if (!passwordInput) {
          setStrengthResult(null);
          return;
        }
        try {
          const response = await api.post('/passwords/strength', { password: passwordInput });
          setStrengthResult(response.data);
        } catch (e) {
          console.error(e);
        }
      };
      const debounce = setTimeout(checkStrength, 200);
      return () => clearTimeout(debounce);
    }
  }, [passwordInput, activeTab]);

  const generateSalt = async () => {
    try {
      const res = await api.post('/passwords/generate-salt');
      setHashSalt(res.data.salt);
    } catch (e) {
      console.error(e);
    }
  };

  const handleHashPassword = async () => {
    if (!hashPassword) return;
    setHashLoading(true);
    try {
      const res = await api.post('/passwords/hash', {
        password: hashPassword,
        algorithm: hashAlg,
        salt: hashSalt || undefined
      });
      setHashResult(res.data);
      recordAlgorithmLearned(hashAlg.toUpperCase());
    } catch (e) {
      console.error(e);
    } finally {
      setHashLoading(false);
    }
  };

  const runSimulation = () => {
    setSimState('hashing');
    setSimLogs([`[INIT] Registering new user account...`]);
    
    setTimeout(() => {
      if (!useSalt) {
        setSimLogs(prev => [
          ...prev,
          `[WARNING] Storing unsalted hash!`,
          `[HASH] Calculating raw MD5 digest: "${simPassword}" -> c2860a169b1c93a0279d63c438ee2e85`,
          `[ATTACK] Initiating Dictionary Attack... Loading 10M common password list.`,
        ]);
        setSimState('cracking');
        
        setTimeout(() => {
          setSimLogs(prev => [
            ...prev,
            `[ATTACK] Scanning dictionary file...`,
            `[MATCH] Match found! Index 4827: "${simPassword}" -> Hash matched!`,
            `[CRACK] Password compromised in 12ms!`
          ]);
          setSimState('success');
        }, 1500);
      } else {
        const salt = "8a2f4c9b";
        setSimLogs(prev => [
          ...prev,
          `[SALT] Attaching cryptographically secure Salt: "${salt}"`,
          `[HASH] Hash computation: Hash(Password + Salt) -> H("${simPassword}" + "${salt}") -> 7d9a1f2c4b8e5...`,
          `[ATTACK] Initiating Dictionary Attack... Loading rainbow tables.`,
        ]);
        setSimState('cracking');
        
        setTimeout(() => {
          setSimLogs(prev => [
            ...prev,
            `[ATTACK] Scanning for matching salt signatures...`,
            `[FAIL] No precomputed digests exist for salt "${salt}"!`,
            `[FAIL] Attack aborted. Offline brute forcing is required (would take 8.2 years).`,
            `[SAFE] Account remains PROTECTED.`
          ]);
          setSimState('protected');
        }, 2000);
      }
    }, 1000);
  };

  const getStrengthColor = (score: number) => {
    if (score < 30) return 'bg-rose-500';
    if (score < 55) return 'bg-amber-500';
    if (score < 75) return 'bg-yellow-500';
    if (score < 90) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'Very Strong':
      case 'Strong':
        return <ShieldCheck className="w-12 h-12 text-emerald-400" />;
      case 'Medium':
        return <ShieldEllipsis className="w-12 h-12 text-yellow-400" />;
      default:
        return <ShieldAlert className="w-12 h-12 text-rose-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-purple-400" />
            Password Security Lab
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Check password entropy, explore salts and peppers, and hash inputs with modern standards.
          </p>
        </div>

        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['strength', 'hash', 'salts', 'standards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ELI5 Banner */}
      <Eli5Banner
        title="Understanding Password Security & Salts"
        analogyTitle="Unique Seasoning for Every Dish"
        analogyDescription="Imagine storing cake recipes in a public cookbook. If two people bake chocolate cake (password '123456'), their cakes look identical! A 'Salt' is a random secret ingredient added to each recipe so even identical cakes come out looking totally unique. Attackers can't use pre-printed lookup cheat sheets (Rainbow Tables)!"
        bulletPoints={[
          "Password Entropy: How unpredictable your password is (like rolling 20 dice vs 2 dice).",
          "Cryptographic Salt: Random noise added to passwords to prevent lookup attacks.",
          "Argon2id / bcrypt: Slow 'memory-hard' functions designed to burn attacker GPU processing power."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: STRENGTH CHECKER */}
          {activeTab === 'strength' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Password Strength Analyzer</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                    Enter Password
                    <Eli5Tooltip term="Password Entropy" simpleExplanation="Measures how hard your secret password is to guess based on random character variety." analogy="Rolling 20 dice vs rolling 2 dice" />
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Type a password..."
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {strengthResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-800">
                    
                    {/* Gauge Display */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-cyber-darker rounded-lg border border-gray-800 text-center">
                      {getRatingIcon(strengthResult.rating)}
                      <div className="text-xl font-bold text-white mt-2">{strengthResult.rating}</div>
                      <div className="text-xs text-gray-500 mt-1">Entropy: {strengthResult.entropy} bits</div>
                    </div>

                    {/* Progress Bar & Feedback */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                          <span>Strength Score</span>
                          <span>{strengthResult.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getStrengthColor(strengthResult.score)}`}
                            style={{ width: `${strengthResult.score}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-gray-400">
                        <div>**Estimated Crack Time**: <span className="text-white font-bold">{strengthResult.crack_time}</span></div>
                        <div className="text-[10px] text-gray-500">Assuming an offline attacker checking 10 billion keys per second.</div>
                      </div>

                      {/* Checklist */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: '12+ Characters', checked: strengthResult.checks.length },
                          { label: 'Uppercase letter', checked: strengthResult.checks.upper },
                          { label: 'Lowercase letter', checked: strengthResult.checks.lower },
                          { label: 'Numeric digit', checked: strengthResult.checks.digit },
                          { label: 'Special character', checked: strengthResult.checks.special },
                        ].map((c, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            {c.checked ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-rose-450" />
                            )}
                            <span className={c.checked ? 'text-gray-300' : 'text-gray-500'}>{c.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Feedback tips */}
                      {strengthResult.feedback.length > 0 && (
                        <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-lg text-xs text-rose-400 space-y-1">
                          <div className="font-bold">Recommendations:</div>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {strengthResult.feedback.map((tip: string, i: number) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>

                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500 text-sm">
                    Type a password to analyze its cryptographic strength score.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HASH PASSWORD */}
          {activeTab === 'hash' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Slow Cryptographic Hashing</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Password Input</label>
                    <input
                      type="text"
                      value={hashPassword}
                      onChange={(e) => setHashPassword(e.target.value)}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Hashing Function</label>
                    <select
                      value={hashAlg}
                      onChange={(e) => setHashAlg(e.target.value)}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                    >
                      <option value="bcrypt">bcrypt (Slow Blowfish)</option>
                      <option value="argon2id">Argon2id (Memory Hard)</option>
                      <option value="pbkdf2">PBKDF2 (HMAC-SHA256)</option>
                    </select>
                  </div>
                </div>

                {hashAlg === 'pbkdf2' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Salt (Hex String)</label>
                      <input
                        type="text"
                        value={hashSalt}
                        onChange={(e) => setHashSalt(e.target.value)}
                        placeholder="Automatic generation if left blank..."
                        className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={generateSalt}
                        className="w-full p-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors"
                      >
                        Generate Random Salt
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleHashPassword}
                  disabled={hashLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  {hashLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Derive Secure Password Hash
                </button>

                {hashResult && (
                  <div className="space-y-4 pt-4 border-t border-gray-800">
                    <div className="bg-cyber-darker p-3.5 rounded border border-gray-800 font-mono text-xs space-y-2">
                      <div className="text-gray-400 font-bold uppercase">Computed Password Hash:</div>
                      <div className="text-purple-400 break-all bg-gray-900 p-2 rounded border border-gray-850 leading-relaxed">
                        {hashResult.hashed_value}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-500 pt-2 border-t border-gray-850">
                        <div>Computation Latency: <span className="text-white">{hashResult.duration_ms} ms</span></div>
                        <div>Work parameters: <span className="text-white">{JSON.stringify(hashResult.parameters)}</span></div>
                      </div>
                    </div>

                    <div className="bg-purple-950/10 p-3.5 rounded border border-purple-900/20 text-xs text-gray-400 leading-relaxed">
                      <span className="font-bold text-white block mb-1">Pepper Simulation:</span>
                      To protect against total database leaks, we appended a secret server-side **Pepper** (`PASSWORD_PEPPER`) to the password. Even if the hash is leaked, the attacker cannot attempt dictionary cracks without knowing the secret pepper.
                      <div className="mt-2 text-cyan-400 font-mono break-all bg-gray-900 p-1.5 rounded">
                        SHA256(Pass + Pepper): {hashResult.pepped_sha256_value}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: SALTS & PEPPERS SIMULATION */}
          {activeTab === 'salts' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Salts & Peppers Attack Simulation</h2>
              <p className="text-gray-400 text-sm">
                Understand how salts thwart precomputed dictionary attacks. Run the simulator to see what happens when an attacker leaks a password database database.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Simulate Password</label>
                  <input
                    type="text"
                    value={simPassword}
                    onChange={(e) => setSimPassword(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 text-sm text-gray-300 mb-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSalt}
                      onChange={(e) => setUseSalt(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Attach Secure Salt to Hashing Flow</span>
                  </label>
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={simState === 'hashing' || simState === 'cracking'}
                className="w-full inline-flex items-center justify-center p-2.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                <Play className="w-4 h-4 mr-2" />
                Launch attack simulation
              </button>

              {simLogs.length > 0 && (
                <div className="bg-black p-4 rounded-lg border border-gray-800 font-mono text-xs space-y-1.5 leading-relaxed">
                  <div className="text-gray-500 border-b border-gray-850 pb-1 mb-2 uppercase flex justify-between">
                    <span>Attack Console logs</span>
                    <span>Status: {simState}</span>
                  </div>
                  {simLogs.map((log, i) => {
                    let color = 'text-cyan-400';
                    if (log.includes('[FAIL]') || log.includes('[CRACK]')) color = 'text-rose-450';
                    if (log.includes('[MATCH]') || log.includes('[SAFE]')) color = 'text-emerald-400';
                    if (log.includes('[SALT]')) color = 'text-yellow-400';
                    return <div key={i} className={color}>{log}</div>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STANDARDS */}
          {activeTab === 'standards' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Password Storage Best Practices</h2>
              
              <div className="space-y-4 text-gray-400 text-sm">
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">1. NEVER Use Fast Hashing Functions</h3>
                  <p>
                    Algorithms like MD5, SHA-1, SHA-256, or SHA-512 are designed for raw data integrity verification and are **extremely fast**. Attackers can execute billions of guesses per second on cheap GPUs.
                  </p>
                </div>
                
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">2. Use Memory-Hard Work Factors</h3>
                  <p>
                    Modern standards require slow, memory-hard functions (Argon2id, bcrypt, PBKDF2) which slow down the hashing computation to ~100-250ms per check. This latency is unnoticeable to a logging-in user, but makes trying trillions of combinations mathematically impossible for hackers.
                  </p>
                </div>

                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">3. Unique Salts For Every User</h3>
                  <p>
                    A salt is a random value added to the password before hashing. It prevents attackers from looking up stolen hashes in precomputed databases called **Rainbow Tables**.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-gradient-to-b from-gray-900/40 to-cyber-bg">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Slow Hash Properties
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-cyber-darker rounded border border-gray-800">
                <h4 className="font-bold text-purple-400 mb-1">Argon2id</h4>
                <p className="text-gray-400">
                  Configures time (rounds), memory (KB), and parallelism keys. Hardens computation memory requirements to defeat ASIC miners.
                </p>
              </div>
              <div className="p-3 bg-cyber-darker rounded border border-gray-800">
                <h4 className="font-bold text-cyan-400 mb-1">bcrypt</h4>
                <p className="text-gray-400">
                  Blowfish-based. Standard work factor rounds scale exponentially to increase computation cost as CPU architectures get faster.
                </p>
              </div>
              <div className="p-3 bg-cyber-darker rounded border border-gray-800">
                <h4 className="font-bold text-indigo-400 mb-1">PBKDF2</h4>
                <p className="text-gray-400">
                  Runs standard cryptographic digests (SHA-256) inside a loop for thousands of iterations.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where are Key Derivation Functions (KDFs) Used in Real Life?"
        subtitle="Slow, memory-hard KDFs protect user credentials against massive password database breaches and offline GPU brute-forcing."
        items={[
          {
            title: "Web App Login Authentication",
            description: "Modern web platforms like 1Password and Bitwarden hash user passwords using Argon2id so attackers cannot easily crack stolen database dumps.",
            example: "$argon2id$v=19$m=65536...",
            badge: "User Auth"
          },
          {
            title: "Password Managers (Master Key)",
            description: "Password vaults run PBKDF2 or Argon2 for 100,000+ iterations on your master password to generate your 256-bit vault encryption key.",
            example: "vault_key = PBKDF2(pass, salt, 600000)",
            badge: "Password Vaults"
          },
          {
            title: "Cryptocurrency Keystores",
            description: "Ethereum JSON keystore wallets use scrypt to encrypt your private key on disk using your wallet passphrase.",
            example: "scrypt kdf: N=262144, r=8",
            badge: "Crypto Wallets"
          }
        ]}
      />
    </div>
  );
};

export default PasswordLab;
