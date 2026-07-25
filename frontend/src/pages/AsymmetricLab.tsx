import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Key, Lock, Unlock, Copy, Check, RefreshCw, Info, Code, Compass, CheckCircle2 } from 'lucide-react';
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
  }, []);

  const handleTabChange = (tab: 'keygen' | 'encrypt' | 'decrypt' | 'flow' | 'about') => {
    setActiveTab(tab);
    if (tab === 'encrypt') updateLabProgress('asymmetric', 55);
    if (tab === 'decrypt') updateLabProgress('asymmetric', 75);
    if (tab === 'flow') updateLabProgress('asymmetric', 90);
    if (tab === 'about') updateLabProgress('asymmetric', 100);
  };

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

  // Code Recipes states
  const [codeLang, setCodeLang] = useState<'python' | 'node'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  // Quest/Tutorial Mode States
  const [isQuestMode, setIsQuestMode] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('quest') === 'true');
  const [questStep, setQuestStep] = useState(1);
  const [showQuestSuccessModal, setShowQuestSuccessModal] = useState(false);

  // Quest verification conditions
  const isStep1Complete = useMemo(() => {
    return isQuestMode && questStep === 1 && publicKey !== '' && privateKey !== '' && keySize === 2048;
  }, [isQuestMode, questStep, publicKey, privateKey, keySize]);

  const isStep2Complete = useMemo(() => {
    return isQuestMode && questStep === 2 && encPlaintext.trim() === 'HELLO' && encCiphertext !== '';
  }, [isQuestMode, questStep, encPlaintext, encCiphertext]);

  const isStep3Complete = useMemo(() => {
    return isQuestMode && questStep === 3 && decPlaintext === 'HELLO';
  }, [isQuestMode, questStep, decPlaintext]);

  // Handle auto-routing and pre-filling variables per quest step
  useEffect(() => {
    if (isQuestMode) {
      if (questStep === 1) {
        setActiveTab('keygen');
        setKeySize(2048);
        setPublicKey('');
        setPrivateKey('');
      } else if (questStep === 2) {
        setActiveTab('encrypt');
        setEncPlaintext('HELLO');
        setEncCiphertext('');
      } else if (questStep === 3) {
        setActiveTab('decrypt');
        setDecPlaintext(null);
      }
    }
  }, [isQuestMode, questStep]);

  const getAsymmetricCodeRecipe = () => {
    const escapedPlaintext = encPlaintext.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    if (codeLang === 'python') {
      return `from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
import base64

# 1. Generate RSA Private/Public Keypair
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=${keySize}
)
public_key = private_key.public_key()

# 2. Plaintext to encrypt
plaintext = b"${escapedPlaintext}"

# 3. Encrypt using Recipient's Public Key (with OAEP padding)
ciphertext = public_key.encrypt(
    plaintext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

print("Ciphertext (Base64):", base64.b64encode(ciphertext).decode())

# 4. Decrypt using corresponding Private Key
decrypted_bytes = private_key.decrypt(
    ciphertext,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

print("Decrypted Plaintext:", decrypted_bytes.decode('utf-8'))`;
    } else {
      return `const crypto = require('crypto');

// 1. Generate RSA Private/Public Keypair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: ${keySize},
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// 2. Plaintext to encrypt
const message = Buffer.from("${escapedPlaintext}");

// 3. Encrypt using Recipient's Public Key (with OAEP padding)
const ciphertext = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  message
);

console.log("Ciphertext (Base64):", ciphertext.toString('base64'));

// 4. Decrypt using corresponding Private Key
const decrypted = crypto.privateDecrypt(
  {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  ciphertext
);

console.log("Decrypted:", decrypted.toString('utf8'));`;
    }
  };

  const generateKeys = async () => {
    setGenLoading(true);
    try {
      const response = await api.post('/asymmetric/generate-rsa', { key_size: keySize });
      setPrivateKey(response.data.private_key);
      setPublicKey(response.data.public_key);
      recordAlgorithmLearned('RSA2048');
      updateLabProgress('asymmetric', 40);
      
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
      updateLabProgress('asymmetric', 75);
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
      updateLabProgress('asymmetric', 100);
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isQuestMode) {
                setIsQuestMode(false);
                setQuestStep(1);
              } else {
                setIsQuestMode(true);
                setQuestStep(1);
              }
            }}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 cursor-pointer ${
              isQuestMode
                ? 'bg-indigo-500 text-black border-indigo-400 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'bg-cyber-darker text-indigo-400 border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5'
            }`}
          >
            <Compass className={`w-4 h-4 ${isQuestMode ? 'animate-spin-slow' : ''}`} />
            {isQuestMode ? 'Exit Quest' : 'Start Guided Quest'}
          </button>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
            {(['keygen', 'encrypt', 'decrypt', 'flow', 'about'] as const).map((tab) => (
              <button
                key={tab}
                disabled={isQuestMode}
                onClick={() => !isQuestMode && handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                    : isQuestMode
                    ? 'text-gray-650 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Quest HUD when active */}
      {isQuestMode && (
        <div className="glass-panel p-5 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-gray-900/50 border border-indigo-500/30 rounded-xl space-y-4 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.05)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-850/80 pb-3">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-indigo-400 animate-spin-slow" />
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Guided Learning Quest: RSA Asymmetric Keys
                </h2>
                <p className="text-[10px] text-gray-400 font-mono">Step {questStep} of 3</p>
              </div>
            </div>
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center text-[10px] font-bold font-mono ${
                    questStep > stepNum
                      ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : questStep === stepNum
                      ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)] animate-pulse'
                      : 'bg-gray-900 border-gray-800 text-gray-650'
                  }`}
                >
                  {questStep > stepNum ? '✓' : stepNum}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Instructions */}
            <div className="lg:col-span-8 space-y-3">
              {questStep === 1 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Story: Generating RSA Keys
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Unlike symmetric ciphers, asymmetric ciphers generate two mathematically linked keys: a **public key** for encryption, and a **private key** for decryption. Let's generate a new key pair.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-indigo-400 font-semibold font-mono">Action Required:</strong> Ensure Key Size is set to **2048-bit** and click **"Generate Key Pair"** under the keygen tab.
                  </p>
                </div>
              )}

              {questStep === 2 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Story: Public Key Lockbox
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Now we encrypt a secret message using the recipient's **public key**. This makes it so ONLY the matching private key can ever reverse it.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-indigo-400 font-semibold font-mono">Action Required:</strong> Type message text as <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">HELLO</span> under the encrypt tab, and click **"Asymmetric Encrypt"**.
                  </p>
                </div>
              )}

              {questStep === 3 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Story: Decrypting with the Secret Key
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    To read the message, the recipient uses their matching **private key** to decrypt the Base64 ciphertext back to plaintext.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-indigo-400 font-semibold font-mono">Action Required:</strong> Under the decrypt tab, verify your private key and ciphertext are loaded, then click **"Asymmetric Decrypt"**.
                  </p>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
              {((questStep === 1 && isStep1Complete) ||
                (questStep === 2 && isStep2Complete) ||
                (questStep === 3 && isStep3Complete)) ? (
                <button
                  onClick={() => {
                    if (questStep < 3) {
                      setQuestStep(prev => prev + 1);
                    } else {
                      updateLabProgress('asymmetric', 100);
                      setShowQuestSuccessModal(true);
                      setIsQuestMode(false);
                      setQuestStep(1);
                    }
                  }}
                  className="w-full lg:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {questStep === 3 ? 'Complete Quest!' : 'Advance to Next Step'}
                </button>
              ) : (
                <div className="w-full text-center lg:text-right border border-gray-850 bg-cyber-darker/60 rounded-lg p-3 text-[11px] font-mono text-indigo-400 animate-pulse">
                  ⚠️ Step conditions incomplete. Follow instructions above.
                </div>
              )}

              <button
                onClick={() => {
                  setIsQuestMode(false);
                  setQuestStep(1);
                }}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-400 border-b border-gray-800 hover:border-gray-500 pb-0.5 transition-all cursor-pointer"
              >
                Exit Tutorial & Return to Sandbox
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ELI5 Banner */}
      {!isQuestMode && (
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
      )}

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
                    disabled={isQuestMode}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm font-semibold"
                  >
                    <option value={1024}>1024 bits (Weak / Legacy)</option>
                    <option value={2048}>2048 bits (Secure Standard)</option>
                    <option value={4096}>4096 bits (Military Grade / Slow)</option>
                  </select>
                </div>
                <button
                  onClick={generateKeys}
                  disabled={genLoading}
                  className={`w-full inline-flex items-center justify-center p-2.5 rounded-lg text-white font-semibold transition-all ${
                    isQuestMode && questStep === 1 && publicKey === ''
                      ? 'bg-indigo-650 hover:bg-indigo-600 ring-2 ring-indigo-500/40 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer'
                      : 'bg-indigo-650 hover:bg-indigo-600 cursor-pointer'
                  }`}
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
                    disabled={isQuestMode && questStep !== 2}
                    className={`w-full bg-cyber-darker border rounded-lg p-3 text-white font-mono text-sm transition-all ${
                      isQuestMode && questStep === 2 && encPlaintext.trim() !== 'HELLO'
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Recipient Public Key (PEM)</label>
                  <textarea
                    value={encPublicKey}
                    onChange={(e) => setEncPublicKey(e.target.value)}
                    rows={6}
                    disabled={isQuestMode}
                    placeholder="-----BEGIN PUBLIC KEY-----..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleEncrypt}
                  disabled={encLoading}
                  className={`w-full inline-flex items-center justify-center p-2.5 rounded-lg text-white font-semibold transition-all ${
                    isQuestMode && questStep === 2 && encPlaintext.trim() === 'HELLO' && encCiphertext === ''
                      ? 'bg-indigo-550 hover:bg-indigo-500 ring-2 ring-indigo-500/40 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer'
                      : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                  }`}
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
                    disabled={isQuestMode}
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
                    disabled={isQuestMode}
                    placeholder="-----BEGIN PRIVATE KEY-----..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleDecrypt}
                  disabled={decLoading}
                  className={`w-full inline-flex items-center justify-center p-2.5 rounded-lg text-white font-semibold transition-all ${
                    isQuestMode && questStep === 3 && decPlaintext === null
                      ? 'bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-500/40 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer'
                      : 'bg-indigo-650 hover:bg-indigo-600 cursor-pointer'
                  }`}
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

          {/* View Code Recipes Panel for RSA Asymmetric (visible on keygen, encrypt, decrypt) */}
          {(activeTab === 'keygen' || activeTab === 'encrypt' || activeTab === 'decrypt') && (
            <div className="bg-indigo-950/5 border border-indigo-500/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-indigo-400 flex items-center gap-1.5 font-bold">
                  <Code className="w-3.5 h-3.5" />
                  View RSA Code Recipe
                </span>
                
                <div className="flex gap-2">
                  <div className="flex bg-cyber-darker rounded p-0.5 border border-gray-850 text-[10px]">
                    <button
                      onClick={() => setCodeLang('python')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        codeLang === 'python'
                          ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setCodeLang('node')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        codeLang === 'node'
                          ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      Node.js
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getAsymmetricCodeRecipe());
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
                {getAsymmetricCodeRecipe()}
              </pre>
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

      {/* Quest Success Celebration Modal */}
      {showQuestSuccessModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-cyber-dark border-2 border-indigo-500/50 rounded-2xl p-8 max-w-md text-center shadow-[0_0_40px_rgba(99,102,241,0.15)] relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">🏆</div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2 font-mono">
              Quest Completed!
            </h2>
            <p className="text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              🎖️ Master of Asymmetric Keys
            </p>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Congratulations! You've successfully completed the RSA Asymmetric Laboratory Quest. You generated custom 2048-bit keypairs, locked messages using public keys, and restored plaintext securely via private keys.
            </p>

            <div className="bg-cyber-darker p-4 rounded-xl border border-gray-850 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Milestone reached:</span>
                <span className="text-indigo-400 font-bold">100% Completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Skills updated:</span>
                <span className="text-white font-mono font-bold">RSA 2048, Keypair Encapsulation</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">XP Reward:</span>
                <span className="text-amber-400 font-bold">+50 XP</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestSuccessModal(false)}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer animate-pulse"
            >
              Back to Laboratories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsymmetricLab;
