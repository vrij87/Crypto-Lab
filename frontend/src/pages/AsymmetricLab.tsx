import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Unlock, Copy, Check, RefreshCw, Info } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const AsymmetricLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'keygen' | 'encrypt' | 'decrypt' | 'flow' | 'about'>('keygen');

  useEffect(() => {
    markLabVisited('asymmetric', 'RSA & ECC Lab', '/labs/asymmetric');
    updateLabProgress('asymmetric', 100);
  }, []);

  // Keygen state
  const [keySize, setKeySize] = useState(2048);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Encrypt state
  const [encPlaintext, setEncPlaintext] = useState('An asymmetric secret message...');
  const [encPublicKey, setEncPublicKey] = useState('');
  const [encCiphertext, setEncCiphertext] = useState('');
  const [encLoading, setEncLoading] = useState(false);

  // Decrypt state
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decPrivateKey, setDecPrivateKey] = useState('');
  const [decPlaintext, setDecPlaintext] = useState<string | null>(null);
  const [decLoading, setDecLoading] = useState(false);
  const [decError, setDecError] = useState<string | null>(null);

  const generateKeys = async () => {
    setGenLoading(true);
    try {
      const response = await api.post('/asymmetric/generate-rsa', { key_size: keySize });
      setPrivateKey(response.data.private_key);
      setPublicKey(response.data.public_key);
      recordAlgorithmLearned('RSA2048');
      
      // Auto-populate helper variables
      setEncPublicKey(response.data.public_key);
      setDecPrivateKey(response.data.private_key);
    } catch (e) {
      alert('Key generation failed.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleEncrypt = async () => {
    if (!encPublicKey) {
      alert('Please enter or generate an RSA public key.');
      return;
    }
    setEncLoading(true);
    try {
      const response = await api.post('/asymmetric/encrypt', {
        plaintext: encPlaintext,
        public_key: encPublicKey
      });
      setEncCiphertext(response.data.ciphertext);
      setDecCiphertext(response.data.ciphertext);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Encryption failed. Check if public key format is valid PEM.');
    } finally {
      setEncLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decPrivateKey) {
      alert('Please enter your RSA private key.');
      return;
    }
    setDecLoading(true);
    setDecPlaintext(null);
    setDecError(null);
    try {
      const response = await api.post('/asymmetric/decrypt', {
        ciphertext: decCiphertext,
        private_key: decPrivateKey
      });
      setDecPlaintext(response.data.plaintext);
    } catch (e: any) {
      setDecError(e.response?.data?.detail || 'Decryption failed. Check key padding or ciphertext validity.');
    } finally {
      setDecLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            RSA Asymmetric Laboratory
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Generate RSA key pairs, encrypt with public keys, and decrypt with matching private keys.
          </p>
        </div>
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['keygen', 'encrypt', 'decrypt', 'flow', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
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
        title="Understanding Asymmetric (Public Key) Cryptography"
        analogyTitle="The Public Mailbox with Two Keys"
        analogyDescription="Imagine you put an open padlock on a public mailbox. ANYONE in the world can drop a secret letter into the slot and snap the padlock shut (Public Key Encryption). But ONLY YOU hold the physical key to unlock the mailbox door (Private Key Decryption). You never need to share your secret key with anyone!"
        bulletPoints={[
          "Public Key (Mailbox Padlock): Published publicly for anyone to send you encrypted messages.",
          "Private Key (House Key): Kept 100% secret by you to unlock received messages.",
          "No Prior Key Exchange: Solves the problem of sharing secret keys over untrusted networks."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: KEYGEN */}
          {activeTab === 'keygen' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">RSA Key Generation</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                    RSA Key Size (bits)
                    <Eli5Tooltip term="Key Size" simpleExplanation="How long and complex the prime numbers are. Larger keys are harder to hack but take longer to generate." analogy="Thicker steel on your mailbox padlock" />
                  </label>
                  <select
                    value={keySize}
                    onChange={(e) => setKeySize(Number(e.target.value))}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                  >
                    <option value={1024}>1024 bits (Weak / Legacy)</option>
                    <option value={2048}>2048 bits (Secure Standard)</option>
                    <option value={4096}>4096 bits (Military Grade / Slow)</option>
                  </select>
                </div>
                <button
                  onClick={generateKeys}
                  disabled={genLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-semibold"
                >
                  {genLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                  Generate Key Pair
                </button>
              </div>

              {(publicKey || privateKey) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                  <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs relative flex flex-col">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-850 pb-1.5 text-gray-400">
                      <span className="font-bold">Public Key (PEM)</span>
                      <button onClick={() => copyToClipboard(publicKey, 'pub')} className="hover:text-white">
                        {copiedField === 'pub' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={publicKey}
                      rows={8}
                      className="bg-transparent text-gray-300 w-full focus:outline-none text-[10px] resize-none font-mono"
                    />
                  </div>
                  <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs relative flex flex-col">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-850 pb-1.5 text-gray-400">
                      <span className="font-bold text-purple-400">Private Key (PEM)</span>
                      <button onClick={() => copyToClipboard(privateKey, 'priv')} className="hover:text-white">
                        {copiedField === 'priv' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={privateKey}
                      rows={8}
                      className="bg-transparent text-gray-300 w-full focus:outline-none text-[10px] resize-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENCRYPT */}
          {activeTab === 'encrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Encrypt Message (with Public Key)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Plaintext Message</label>
                  <textarea
                    value={encPlaintext}
                    onChange={(e) => setEncPlaintext(e.target.value)}
                    rows={3}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Recipient Public Key (PEM)</label>
                  <textarea
                    value={encPublicKey}
                    onChange={(e) => setEncPublicKey(e.target.value)}
                    rows={6}
                    placeholder="-----BEGIN PUBLIC KEY-----..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleEncrypt}
                  disabled={encLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {encLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Asymmetric Encrypt
                </button>

                {encCiphertext && (
                  <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-400 mb-1">
                      <span className="font-bold">Ciphertext (Base64 Encoded):</span>
                      <button onClick={() => copyToClipboard(encCiphertext, 'enc')} className="hover:text-white">
                        {copiedField === 'enc' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-indigo-400 break-all bg-gray-900 p-2 rounded leading-relaxed">{encCiphertext}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DECRYPT */}
          {activeTab === 'decrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Decrypt Ciphertext (with Private Key)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Ciphertext (Base64)</label>
                  <textarea
                    value={decCiphertext}
                    onChange={(e) => setDecCiphertext(e.target.value)}
                    rows={3}
                    placeholder="Paste Base64 encoded ciphertext..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px] break-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Your Private Key (PEM)</label>
                  <textarea
                    value={decPrivateKey}
                    onChange={(e) => setDecPrivateKey(e.target.value)}
                    rows={6}
                    placeholder="-----BEGIN PRIVATE KEY-----..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleDecrypt}
                  disabled={decLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white font-semibold"
                >
                  {decLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                  Asymmetric Decrypt
                </button>

                {decPlaintext && (
                  <div className="p-3 bg-cyber-bg border border-emerald-900/30 rounded-lg text-xs leading-relaxed">
                    <span className="font-bold text-emerald-400 uppercase block mb-1">Decrypted Output:</span>
                    <div className="text-white font-mono bg-gray-900 p-2 rounded">{decPlaintext}</div>
                  </div>
                )}

                {decError && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-450 leading-relaxed font-bold">
                    [ERROR] {decError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FLOW */}
          {activeTab === 'flow' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">How RSA Asymmetric Encryption Works</h2>
              
              <div className="flex flex-col items-center space-y-6 bg-cyber-darker p-8 rounded-lg border border-gray-800">
                <div className="flex items-center space-x-12">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-sm mx-auto mb-2">A</div>
                    <div className="text-[10px] text-gray-400">Sender (Alice)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-950/40 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-sm mx-auto mb-2">B</div>
                    <div className="text-[10px] text-gray-400">Recipient (Bob)</div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-center relative">
                  <div className="h-0.5 bg-gray-800 w-2/3 absolute" />
                  <div className="bg-cyber-darker border border-gray-800 px-3 py-1.5 rounded z-10 text-xs font-mono text-gray-300">
                    Bob publishes his **Public Key** to the world
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  <div className="border border-gray-850 p-4 rounded bg-gray-900/40 space-y-2">
                    <div className="text-xs font-bold text-white">1. Encryption (By Alice)</div>
                    <p className="text-[11px] text-gray-400">
                      Alice writes a message and encrypts it using Bob's published public key. Once encrypted, **only** Bob's private key can reverse it.
                    </p>
                    <div className="text-[10px] font-mono text-cyan-400 bg-black p-1.5 rounded">
                      Cipher = Message ^ Bob's_Public_Key
                    </div>
                  </div>
                  <div className="border border-gray-850 p-4 rounded bg-gray-900/40 space-y-2">
                    <div className="text-xs font-bold text-white">2. Decryption (By Bob)</div>
                    <p className="text-[11px] text-gray-400">
                      Bob receives the ciphertext and decrypts it with his secret private key, which he has never shared.
                    </p>
                    <div className="text-[10px] font-mono text-purple-400 bg-black p-1.5 rounded">
                      Original = Cipher ^ Bob's_Private_Key
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ABOUT RSA */}
          {activeTab === 'about' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">About Asymmetric Cryptography</h2>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                <p>
                  Asymmetric (or public-key) cryptography uses a **mathematically linked key pair**:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>**Public Key**: Can be shared openly. Anyone can use it to encrypt messages meant for you.</li>
                  <li>**Private Key**: Must be kept secret. Only you can use it to decrypt messages encrypted with your public key.</li>
                </ul>
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">OAEP Padding</h3>
                  <p className="mt-1">
                    RSA requires a padding scheme like **OAEP (Optimal Asymmetric Encryption Padding)** to be secure. Raw RSA encryption is deterministic and vulnerable to mathematical attacks. OAEP adds randomized structures before modular exponentiation to guarantee semantic security.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-gradient-to-b from-gray-900/40 to-cyber-bg text-xs">
            <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Asymmetric Guide
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-white mb-1">Key Exchange</h4>
                <p className="text-gray-400">
                  Because RSA is slow, it is rarely used to encrypt raw files. Instead, it is used to encrypt a small symmetric AES key (hybrid scheme) which then encrypts the files.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-1">RSA Security Margin</h4>
                <p className="text-gray-400">
                  Keys under 2048 bits are getting vulnerable to factoring. 2048-bit keys are standard, while 4096-bit keys offer absolute protection but run much slower.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where is Asymmetric Key Cryptography Used in Real Life?"
        subtitle="Public/private key pairs solve the key distribution problem across untrusted public networks."
        items={[
          {
            title: "SSH Server Remote Access",
            description: "Developers generate RSA or Ed25519 public/private key pairs to log into remote cloud servers securely without passwords.",
            example: "~/.ssh/id_rsa & id_rsa.pub",
            badge: "Server Access"
          },
          {
            title: "HTTPS Key Encapsulation",
            description: "When opening a website, public key cryptography establishes a secret session key (ECDHE) between browser and web server.",
            example: "ECDHE-RSA-AES128-GCM-SHA256",
            badge: "TLS Handshake"
          },
          {
            title: "Bitcoin & Blockchain Wallets",
            description: "Crypto wallet addresses are derived directly from Elliptic Curve (SECP256k1) public keys, allowing keyholders to authorize transfers.",
            example: "0x71C765... (SECP256k1)",
            badge: "Crypto Wallets"
          }
        ]}
      />
    </div>
  );
};

export default AsymmetricLab;
