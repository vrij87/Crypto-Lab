import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Key, Lock, Unlock, RefreshCw, Copy, Check, Info, ArrowRight, Code, ShieldAlert, RotateCcw, Compass, CheckCircle2, Package, PackageOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const SymmetricLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'animation' | 'flowchart' | 'about'>('encrypt');

  useEffect(() => {
    markLabVisited('symmetric', 'AES Encryption Lab', '/labs/symmetric');
  }, []);

  const handleTabChange = (tab: 'encrypt' | 'decrypt' | 'animation' | 'flowchart' | 'about') => {
    setActiveTab(tab);
    if (tab === 'decrypt') updateLabProgress('symmetric', 60);
    if (tab === 'animation') updateLabProgress('symmetric', 80);
    if (tab === 'flowchart') updateLabProgress('symmetric', 90);
    if (tab === 'about') updateLabProgress('symmetric', 100);
  };

  // Encryption state
  const [encPlaintext, setEncPlaintext] = useState('My secret cryptographic message...');
  const [encAlg, setEncAlg] = useState('AES');
  const [encMode, setEncMode] = useState('GCM');
  const [encKeySize, setEncKeySize] = useState(256);
  const [encKey, setEncKey] = useState('');
  const [encResult, setEncResult] = useState<any>(null);
  const [encLoading, setEncLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [codeLang, setCodeLang] = useState<'python' | 'node'>('python');
  const [copiedCode, setCopiedCode] = useState(false);

  // Bit-flipping sandbox states
  const [tamperMap, setTamperMap] = useState<Record<number, string>>({});
  const [tamperDecResult, setTamperDecResult] = useState<string | null>(null);
  const [tamperDecError, setTamperDecError] = useState<string | null>(null);
  const [tamperLoading, setTamperLoading] = useState(false);

  // Symmetric Cartoon Animation States
  const [symMessage, setSymMessage] = useState('Secret Package 📦');
  const [symState, setSymState] = useState<'idle' | 'locked' | 'unlocked'>('idle');
  const [symCiphertext, setSymCiphertext] = useState('');
  const [symDecryptedText, setSymDecryptedText] = useState('');

  const symChestSlotRef = useRef<HTMLDivElement>(null);
  const symChestLockRef = useRef<HTMLDivElement>(null);

  const handleSymPackageDragEnd = (_event: any, info: any) => {
    if (!symChestSlotRef.current) return;
    const slotRect = symChestSlotRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (
      dropX >= slotRect.left &&
      dropX <= slotRect.right &&
      dropY >= slotRect.top &&
      dropY <= slotRect.bottom
    ) {
      setSymState('locked');
      // Simple mock base64 ciphertext showing dynamic encryption
      const rawB64 = btoa(symMessage);
      setSymCiphertext(rawB64.substring(0, 16) + "..." + rawB64.substring(rawB64.length - 16));
      setSymDecryptedText('');
    }
  };

  const handleSymKeyDragEnd = (_event: any, info: any) => {
    if (!symChestLockRef.current) return;
    const lockRect = symChestLockRef.current.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (
      dropX >= lockRect.left &&
      dropX <= lockRect.right &&
      dropY >= lockRect.top &&
      dropY <= lockRect.bottom
    ) {
      if (symState === 'locked') {
        setSymState('unlocked');
        setSymDecryptedText(symMessage);
      }
    }
  };

  const triggerSymAutoEncrypt = () => {
    setSymState('locked');
    const rawB64 = btoa(symMessage);
    setSymCiphertext(rawB64.substring(0, 16) + "..." + rawB64.substring(rawB64.length - 16));
    setSymDecryptedText('');
  };

  const triggerSymAutoDecrypt = () => {
    if (symState === 'locked') {
      setSymState('unlocked');
      setSymDecryptedText(symMessage);
    }
  };

  // Reset bit-flipping when encryption results change
  const [isQuestMode, setIsQuestMode] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('quest') === 'true');
  const [questStep, setQuestStep] = useState(1);
  const [showQuestSuccessModal, setShowQuestSuccessModal] = useState(false);

  // Quest verification conditions
  const isStep1Complete = useMemo(() => {
    return isQuestMode && questStep === 1 && encPlaintext.trim() === 'CONFIDENTIAL' && encMode === 'GCM' && encResult !== null;
  }, [isQuestMode, questStep, encPlaintext, encMode, encResult]);

  const isStep2Complete = useMemo(() => {
    return isQuestMode && questStep === 2 && Object.keys(tamperMap).length > 0 && (tamperDecError !== null || tamperDecResult !== null);
  }, [isQuestMode, questStep, tamperMap, tamperDecError, tamperDecResult]);

  // Handle auto-routing and pre-filling variables per quest step
  useEffect(() => {
    if (isQuestMode) {
      if (questStep === 1) {
        setActiveTab('encrypt');
        setEncPlaintext('CONFIDENTIAL');
        setEncMode('GCM');
        setEncAlg('AES');
        setEncKeySize(256);
        setEncResult(null);
      } else if (questStep === 2) {
        setActiveTab('encrypt');
      }
    }
  }, [isQuestMode, questStep]);

  // Reset bit-flipping when encryption results change
  useEffect(() => {
    setTamperMap({});
    setTamperDecResult(null);
    setTamperDecError(null);
  }, [encResult]);

  const getSymmetricCodeRecipe = () => {
    const keyHex = encKey || "00".repeat(encKeySize / 8);
    const ivHex = encResult?.iv || "00".repeat(encAlg === 'AES' ? (encMode === 'GCM' ? 12 : 16) : 16);
    const plaintextEscaped = encPlaintext.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    if (codeLang === 'python') {
      let pythonCode = `from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
import os

# Inputs
plaintext = b"${plaintextEscaped}"
key = bytes.fromhex("${keyHex}")
iv = bytes.fromhex("${ivHex}")
`;

      if (encAlg === 'AES') {
        if (encMode === 'GCM') {
          pythonCode += `
# AES-GCM Setup
cipher = Cipher(algorithms.AES(key), modes.GCM(iv))
encryptor = cipher.encryptor()

# Encrypt
ciphertext = encryptor.update(plaintext) + encryptor.finalize()
tag = encryptor.tag

print(f"Ciphertext (hex): {ciphertext.hex()}")
print(f"Auth Tag (hex): {tag.hex()}")`;
        } else {
          pythonCode += `
# AES-CBC Setup (requires padding to 16-byte block size)
cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
encryptor = cipher.encryptor()

# PKCS7 Padder
padder = padding.PKCS7(128).padder()
padded_data = padder.update(plaintext) + padder.finalize()

# Encrypt
ciphertext = encryptor.update(padded_data) + encryptor.finalize()
print(f"Ciphertext (hex): {ciphertext.hex()}")`;
        }
      } else {
        // ChaCha20
        pythonCode += `
# ChaCha20 Setup (stream cipher, no padding required)
cipher = Cipher(algorithms.ChaCha20(key, iv), mode=None)
encryptor = cipher.encryptor()

# Encrypt
ciphertext = encryptor.update(plaintext) + encryptor.finalize()
print(f"Ciphertext (hex): {ciphertext.hex()}")`;
      }
      return pythonCode;
    } else {
      // Node.js
      let nodeCode = `const crypto = require('crypto');

// Inputs
const plaintext = "${plaintextEscaped}";
const key = Buffer.from("${keyHex}", "hex");
const iv = Buffer.from("${ivHex}", "hex");
`;

      if (encAlg === 'AES') {
        const method = `aes-${encKeySize}-${encMode.toLowerCase()}`;
        if (encMode === 'GCM') {
          nodeCode += `
// AES-GCM Encryption
const cipher = crypto.createCipheriv('${method}', key, iv);
let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
ciphertext += cipher.final('hex');
const tag = cipher.getAuthTag().toString('hex');

console.log(\`Ciphertext: \${ciphertext}\`);
console.log(\`Auth Tag: \${tag}\`);`;
        } else {
          nodeCode += `
// AES-CBC Encryption
const cipher = crypto.createCipheriv('${method}', key, iv);
let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
ciphertext += cipher.final('hex');

console.log(\`Ciphertext: \${ciphertext}\`);`;
        }
      } else {
        // ChaCha20
        nodeCode += `
// ChaCha20 Encryption
const cipher = crypto.createCipheriv('chacha20', key, iv);
let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
ciphertext += cipher.final('hex');

console.log(\`Ciphertext: \${ciphertext}\`);`;
      }
      return nodeCode;
    }
  };

  // Decryption state
  const [decCiphertext, setDecCiphertext] = useState('');
  const [decKey, setDecKey] = useState('');
  const [decIv, setDecIv] = useState('');
  const [decTag, setDecTag] = useState('');
  const [decAlg, setDecAlg] = useState('AES');
  const [decMode, setDecMode] = useState('GCM');
  const [decResult, setDecResult] = useState<string | null>(null);
  const [decLoading, setDecLoading] = useState(false);
  const [decError, setDecError] = useState<string | null>(null);

  const generateKey = async (target: 'encrypt' | 'decrypt') => {
    try {
      const response = await api.post('/symmetric/generate-key', {
        algorithm: target === 'encrypt' ? encAlg : decAlg,
        key_size: target === 'encrypt' ? encKeySize : 256
      });
      if (target === 'encrypt') {
        setEncKey(response.data.key);
      } else {
        setDecKey(response.data.key);
      }
      updateLabProgress('symmetric', 40);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEncrypt = async () => {
    if (!encKey) {
      alert('Please generate or enter a symmetric secret key first.');
      return;
    }
    setEncLoading(true);
    setEncResult(null);
    try {
      const response = await api.post('/symmetric/encrypt', {
        plaintext: encPlaintext,
        key: encKey,
        algorithm: encAlg,
        mode: encMode
      });
      setEncResult(response.data);
      recordAlgorithmLearned(`${encAlg}${encKeySize}`);
      updateLabProgress('symmetric', 75);
      
      // Auto-populate decryption fields for testing convenience
      setDecCiphertext(response.data.ciphertext);
      setDecKey(encKey);
      setDecIv(response.data.iv);
      setDecTag(response.data.tag || '');
      setDecAlg(encAlg);
      setDecMode(encMode);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Encryption failed. Check key hex structure.');
    } finally {
      setEncLoading(false);
    }
  };

  const handleTamperDecrypt = async () => {
    if (!encResult) return;
    
    const originalCiphertext = encResult.ciphertext;
    const bytes: string[] = [];
    for (let i = 0; i < originalCiphertext.length; i += 2) {
      bytes.push(originalCiphertext.substr(i, 2));
    }
    
    const modifiedCiphertext = bytes.map((b, idx) => tamperMap[idx] !== undefined ? tamperMap[idx] : b).join('');
    
    setTamperLoading(true);
    setTamperDecResult(null);
    setTamperDecError(null);
    
    try {
      const response = await api.post('/symmetric/decrypt', {
        ciphertext: modifiedCiphertext,
        key: encKey,
        iv: encResult.iv,
        algorithm: encAlg,
        mode: encMode,
        tag: encResult.tag || undefined
      });
      setTamperDecResult(response.data.plaintext);
    } catch (e: any) {
      setTamperDecError(e.response?.data?.detail || 'Decryption failed.');
    } finally {
      setTamperLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!decCiphertext || !decKey || !decIv) {
      alert('Please fill in Ciphertext, Secret Key, and IV.');
      return;
    }
    setDecLoading(true);
    setDecResult(null);
    setDecError(null);
    try {
      const response = await api.post('/symmetric/decrypt', {
        ciphertext: decCiphertext,
        key: decKey,
        iv: decIv,
        algorithm: decAlg,
        mode: decMode,
        tag: decTag || undefined
      });
      setDecResult(response.data.plaintext);
      updateLabProgress('symmetric', 100);
    } catch (e: any) {
      setDecError(e.response?.data?.detail || 'Decryption failed. Check keys or IV integrity.');
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
    <div className="max-w-7xl mx-auto px-4 sm:6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Key className="w-8 h-8 text-blue-400" />
            Symmetric Encryption Laboratory
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Encrypt and decrypt payloads, manage secret keys, and compare CBC (block ciphers) with GCM (authenticated modes).
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
                ? 'bg-blue-500 text-black border-blue-400 hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'bg-cyber-darker text-blue-400 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5'
            }`}
          >
            <Compass className={`w-4 h-4 ${isQuestMode ? 'animate-spin-slow' : ''}`} />
            {isQuestMode ? 'Exit Quest' : 'Start Guided Quest'}
          </button>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
            {(['encrypt', 'decrypt', 'animation', 'flowchart', 'about'] as const).map((tab) => (
              <button
                key={tab}
                disabled={isQuestMode}
                onClick={() => !isQuestMode && handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                    : isQuestMode
                    ? 'text-gray-650 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'encrypt' ? '1. Encrypt' : tab === 'decrypt' ? '2. Decrypt' : tab === 'animation' ? '3. Animation' : tab === 'flowchart' ? '4. Flowchart' : '5. About'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Quest HUD when active */}
      {isQuestMode && (
        <div className="glass-panel p-5 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-gray-900/50 border border-blue-500/30 rounded-xl space-y-4 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.05)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-850/80 pb-3">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-blue-400 animate-spin-slow" />
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Guided Learning Quest: Symmetric AES Ciphers
                </h2>
                <p className="text-[10px] text-gray-400 font-mono">Step {questStep} of 2</p>
              </div>
            </div>
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center text-[10px] font-bold font-mono ${
                    questStep > stepNum
                      ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : questStep === stepNum
                      ? 'bg-blue-500 border-blue-400 text-black shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-pulse'
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
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Story: Authenticated AES-GCM
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Symmetric ciphers use the same key for encryption and decryption. **AES-GCM** is an authenticated encryption scheme (AEAD) that appends a signature tag to prove the ciphertext has not been altered.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-blue-400 font-semibold font-mono">Action Required:</strong> Type plaintext as <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">CONFIDENTIAL</span>, ensure Mode is **GCM**, and click the **"Encrypt Plaintext"** button.
                  </p>
                </div>
              )}

              {questStep === 2 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Story: The Active Tamper Attack
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    What happens if a hacker alters a single bit of your ciphertext in transit? Let's try corrupting the message and watch AES-GCM reject it during decryption.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-blue-400 font-semibold font-mono">Action Required:</strong> In the **Bit-Flipping Integrity Playground** below, click on any byte block to corrupt it, then click **"Decrypt Tampered Payload"**.
                  </p>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
              {((questStep === 1 && isStep1Complete) ||
                (questStep === 2 && isStep2Complete)) ? (
                <button
                  onClick={() => {
                    if (questStep < 2) {
                      setQuestStep(prev => prev + 1);
                    } else {
                      updateLabProgress('symmetric', 100);
                      setShowQuestSuccessModal(true);
                      setIsQuestMode(false);
                      setQuestStep(1);
                    }
                  }}
                  className="w-full lg:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {questStep === 2 ? 'Complete Quest!' : 'Advance to Next Step'}
                </button>
              ) : (
                <div className="w-full text-center lg:text-right border border-gray-850 bg-cyber-darker/60 rounded-lg p-3 text-[11px] font-mono text-blue-400 animate-pulse">
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
          title="Understanding Symmetric Encryption"
          analogyTitle="The One-Key Physical Lockbox"
          analogyDescription="Imagine a steel lockbox with a single key. You put a secret letter inside and turn the key (Encrypt). Anyone holding an identical key can turn it back to open the box (Decrypt). If an attacker finds the locked box without the key, all they see is scrambled metal!"
          bulletPoints={[
            "Shared Secret: Both sender and receiver use the exact SAME key.",
            "IV (Initialization Vector): A random coin toss so locking the same secret twice produces a different-looking box.",
            "GCM Mode / AEAD Tag: A tamper-evident wax seal that breaks if an attacker tries to scratch or alter the box."
          ]}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: ENCRYPT */}
          {activeTab === 'encrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Encrypt Message</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                    Plaintext Message
                    <Eli5Tooltip term="Plaintext" simpleExplanation="Your original readable secret message before being scrambled by the cipher key." analogy="Unlocked letter inside the envelope" />
                  </label>
                  <textarea
                    value={encPlaintext}
                    onChange={(e) => setEncPlaintext(e.target.value)}
                    placeholder="Type plaintext message to encrypt..."
                    rows={3}
                    disabled={isQuestMode && questStep !== 1}
                    className={`w-full bg-cyber-darker border rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm transition-all ${
                      isQuestMode && questStep === 1 && encPlaintext.trim() !== 'CONFIDENTIAL'
                        ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Algorithm</label>
                    <select
                      value={encAlg}
                      onChange={(e) => {
                        setEncAlg(e.target.value);
                        if (e.target.value === 'ChaCha20') {
                          setEncMode('Stream');
                        } else {
                          setEncMode('GCM');
                        }
                      }}
                      disabled={isQuestMode}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm font-semibold"
                    >
                      <option value="AES">AES (Block Cipher)</option>
                      <option value="ChaCha20">ChaCha20 (Stream Cipher)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Mode / Scheme</label>
                    <select
                      value={encMode}
                      onChange={(e) => setEncMode(e.target.value)}
                      disabled={isQuestMode || encAlg === 'ChaCha20'}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm disabled:opacity-50 font-semibold"
                    >
                      <option value="GCM">GCM (Authenticated)</option>
                      <option value="CBC">CBC (Chaining Mode)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Key Bit Length</label>
                    <select
                      value={encKeySize}
                      onChange={(e) => setEncKeySize(Number(e.target.value))}
                      disabled={isQuestMode || encAlg === 'ChaCha20'}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm disabled:opacity-50 font-semibold"
                    >
                      <option value={128}>128-bit (16 Bytes)</option>
                      <option value={192}>192-bit (24 Bytes)</option>
                      <option value={256}>256-bit (32 Bytes)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Secret Key (Hex String)</label>
                    <input
                      type="text"
                      value={encKey}
                      onChange={(e) => setEncKey(e.target.value)}
                      placeholder="Paste or generate a symmetric key..."
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <button
                      type="button"
                      onClick={() => generateKey('encrypt')}
                      className="w-full p-2.5 rounded-lg border border-gray-700 bg-gray-800 text-white font-medium text-sm hover:bg-gray-700 transition-colors"
                    >
                      Generate Key
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleEncrypt}
                  disabled={encLoading}
                  className={`w-full inline-flex items-center justify-center p-2.5 rounded-lg text-white font-semibold transition-all ${
                    isQuestMode && questStep === 1 && encPlaintext.trim() === 'CONFIDENTIAL' && encResult === null
                      ? 'bg-blue-505 hover:bg-blue-500 ring-2 ring-blue-500/40 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer'
                      : 'bg-blue-600 hover:bg-blue-550 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  {encLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  Encrypt Plaintext
                </button>

                {encResult && (
                  <div className="space-y-4 pt-4 border-t border-gray-800">
                    <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase">Ciphertext (Hex):</span>
                        <button onClick={() => copyToClipboard(encResult.ciphertext, 'cipher')} className="text-gray-400 hover:text-white">
                          {copiedField === 'cipher' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="text-blue-400 break-all bg-gray-900 p-2 rounded">{encResult.ciphertext}</div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-2 border-t border-gray-850">
                        <div>
                          <div className="flex justify-between items-center text-gray-500 mb-1">
                            <span>Initialization Vector (IV / Nonce):</span>
                            <button onClick={() => copyToClipboard(encResult.iv, 'iv')} className="text-gray-500 hover:text-white">
                              {copiedField === 'iv' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-white break-all bg-gray-900 p-1.5 rounded">{encResult.iv}</div>
                        </div>
                        {encResult.tag && (
                          <div>
                            <div className="flex justify-between items-center text-gray-500 mb-1">
                              <span>Authentication Tag:</span>
                              <button onClick={() => copyToClipboard(encResult.tag, 'tag')} className="text-gray-500 hover:text-white">
                                {copiedField === 'tag' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="text-white break-all bg-gray-900 p-1.5 rounded">{encResult.tag}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bit-Flipping Integrity Sandbox */}
                    <div className="bg-cyber-darker border border-gray-800 rounded-lg p-4 space-y-4">
                      <div>
                        <span className="text-xs font-mono uppercase text-rose-450 flex items-center gap-1.5 font-bold">
                          <ShieldAlert className="w-4 h-4" />
                          Bit-Flipping Integrity Playground
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                          Click any byte block below to flip its bits (corrupting it). Try decrypting to see how AES-GCM tags reject changes, whereas AES-CBC decrypts into garbage!
                        </p>
                      </div>

                      {/* Byte Grid */}
                      <div className={`flex flex-wrap gap-1.5 p-3 bg-black/30 rounded border max-h-36 overflow-y-auto font-mono text-xs transition-all ${
                        isQuestMode && questStep === 2 && Object.keys(tamperMap).length === 0
                          ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse'
                          : 'border-gray-900'
                      }`}>
                        {(() => {
                          const originalHex = encResult.ciphertext;
                          const bytes: string[] = [];
                          for (let i = 0; i < originalHex.length; i += 2) {
                            bytes.push(originalHex.substr(i, 2));
                          }
                          return bytes.map((byte, idx) => {
                            const isTampered = tamperMap[idx] !== undefined;
                            const displayByte = isTampered ? tamperMap[idx] : byte;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setTamperMap(prev => {
                                    const next = { ...prev };
                                    if (next[idx] !== undefined) {
                                      delete next[idx];
                                    } else {
                                      next[idx] = '00'; // Tampered value
                                    }
                                    return next;
                                  });
                                }}
                                className={`px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer ${
                                  isTampered
                                    ? 'bg-rose-950/40 border-rose-500 text-rose-450 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                    : 'bg-gray-900 border-gray-850 hover:border-gray-700 text-gray-500'
                                }`}
                                title={`Byte ${idx}: Click to toggle tamper`}
                              >
                                {displayByte}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Tamper controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleTamperDecrypt}
                          disabled={tamperLoading}
                          className={`px-4 py-2 text-white rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                            isQuestMode && questStep === 2 && Object.keys(tamperMap).length > 0 && tamperDecError === null && tamperDecResult === null
                              ? 'bg-rose-500 hover:bg-rose-400 ring-2 ring-rose-500/40 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                              : 'bg-rose-600 hover:bg-rose-500'
                          }`}
                        >
                          {tamperLoading ? 'Decrypting...' : 'Decrypt Tampered Payload'}
                        </button>
                        {Object.keys(tamperMap).length > 0 && (
                          <button
                            onClick={() => {
                              setTamperMap({});
                              setTamperDecResult(null);
                              setTamperDecError(null);
                            }}
                            className="text-[10px] text-gray-500 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset Tampering
                          </button>
                        )}
                      </div>

                      {/* Decryption Result */}
                      {tamperDecResult && (
                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded text-xs">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                            ✔ Decryption Succeeded (CBC Mode Garbage):
                          </span>
                          <span className="font-mono text-white break-all bg-gray-900 p-2 rounded block">{tamperDecResult}</span>
                        </div>
                      )}
                      
                      {tamperDecError && (
                        <div className="p-3 bg-rose-950/25 border border-rose-900/30 rounded text-xs">
                          <span className="text-[10px] text-rose-455 font-bold uppercase block mb-1">
                            ❌ Decryption Refused (GCM Integrity Catch):
                          </span>
                          <span className="text-gray-300">
                            Authentication Tag check failed! The engine detected ciphertext tampering and aborted decryption.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Code Recipes Panel */}
                    <div className="bg-blue-950/5 border border-blue-500/10 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-blue-400 flex items-center gap-1.5 font-bold">
                          <Code className="w-3.5 h-3.5" />
                          View Code Recipe
                        </span>
                        
                        <div className="flex gap-2">
                          <div className="flex bg-cyber-darker rounded p-0.5 border border-gray-850 text-[10px]">
                            <button
                              onClick={() => setCodeLang('python')}
                              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                codeLang === 'python'
                                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              Python
                            </button>
                            <button
                              onClick={() => setCodeLang('node')}
                              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                codeLang === 'node'
                                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                                  : 'text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              Node.js
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(getSymmetricCodeRecipe());
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
                        {getSymmetricCodeRecipe()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DECRYPT */}
          {activeTab === 'decrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Decrypt Ciphertext</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Algorithm</label>
                    <select
                      value={decAlg}
                      onChange={(e) => {
                        setDecAlg(e.target.value);
                        if (e.target.value === 'ChaCha20') setDecMode('Stream');
                        else setDecMode('GCM');
                      }}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                    >
                      <option value="AES">AES (Block Cipher)</option>
                      <option value="ChaCha20">ChaCha20 (Stream Cipher)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Mode</label>
                    <select
                      value={decMode}
                      onChange={(e) => setDecMode(e.target.value)}
                      disabled={decAlg === 'ChaCha20'}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm disabled:opacity-50"
                    >
                      <option value="GCM">GCM (Authenticated)</option>
                      <option value="CBC">CBC (Chaining Mode)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Ciphertext (Hex)</label>
                  <textarea
                    value={decCiphertext}
                    onChange={(e) => setDecCiphertext(e.target.value)}
                    rows={2}
                    placeholder="Enter hexadecimal encrypted text..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Secret Key (Hex)</label>
                    <input
                      type="text"
                      value={decKey}
                      onChange={(e) => setDecKey(e.target.value)}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">IV / Nonce (Hex)</label>
                    <input
                      type="text"
                      value={decIv}
                      onChange={(e) => setDecIv(e.target.value)}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {decMode === 'GCM' && decAlg === 'AES' && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Authentication Tag (Hex)</label>
                    <input
                      type="text"
                      value={decTag}
                      onChange={(e) => setDecTag(e.target.value)}
                      placeholder="Required for GCM mode validation..."
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs focus:border-blue-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleDecrypt}
                  disabled={decLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {decLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                  Decrypt Ciphertext
                </button>

                {decResult && (
                  <div className="p-3 bg-cyber-bg border border-emerald-900/30 rounded-lg text-xs leading-relaxed">
                    <span className="font-bold text-emerald-400 uppercase block mb-1">Decrypted Plaintext:</span>
                    <div className="text-white font-mono bg-gray-900 p-2 rounded border border-gray-850 break-all">{decResult}</div>
                  </div>
                )}

                {decError && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-400 leading-relaxed font-bold">
                    [ERROR] {decError}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB: ANIMATION */}
          {activeTab === 'animation' && (
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  Symmetric Encryption: The Shared Lockbox Analogy
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Symmetric cryptography uses the <strong>same single key</strong> to lock (encrypt) and unlock (decrypt) information. Both Alice and Bob must securely exchange this secret key beforehand.
                </p>
              </div>

              {/* Suitcase Interactive Sandbox */}
              <div className="bg-cyber-darker p-6 rounded-2xl border border-gray-800 space-y-8 relative overflow-hidden select-none">
                
                {/* HUD Instructions */}
                <div className="bg-blue-950/20 border border-blue-500/20 p-3 rounded-xl text-center text-xs text-blue-300 font-mono flex items-center justify-center gap-2">
                  <Compass className="w-4 h-4 animate-spin-slow text-blue-400" />
                  <span>
                    {symState === 'idle' && "Drag the Package into the Suitcase opening to encrypt and lock it!"}
                    {symState === 'locked' && "Package is locked with AES-256! Drag the Shared Secret Key onto the Lock to open it!"}
                    {symState === 'unlocked' && "Decryption successful! The same key unlocked the symmetric trunk."}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
                  
                  {/* Left Column: Alice's Package */}
                  <div className="flex flex-col items-center justify-between p-4 bg-gray-900/40 border border-gray-850 rounded-xl space-y-4">
                    <div className="w-full text-center">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                        Alice (Sender)
                      </span>
                      <h4 className="text-xs font-bold text-white mt-2">Pack Secret Cargo</h4>
                    </div>

                    <textarea
                      value={symMessage}
                      disabled={symState !== 'idle'}
                      onChange={(e) => setSymMessage(e.target.value)}
                      className="w-full h-20 bg-cyber-darker border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
                      placeholder="Type secret cargo..."
                    />

                    {symState === 'idle' ? (
                      <motion.div
                        drag
                        dragSnapToOrigin
                        dragElastic={0.2}
                        onDragEnd={handleSymPackageDragEnd}
                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                        className="w-36 h-24 bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-600 rounded-lg shadow-xl cursor-grab active:cursor-grabbing flex flex-col justify-between p-2.5 text-white font-semibold text-[10px] relative hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-6 h-6 bg-amber-800 rounded border border-amber-750 flex items-center justify-center text-xs font-mono">📦</div>
                          <div className="text-[7px] text-amber-300 font-mono tracking-wider font-bold">FRAGILE</div>
                        </div>
                        <div className="truncate text-center font-mono font-bold">{symMessage || 'EMPTY'}</div>
                        <div className="text-[7px] text-amber-400 text-right">AES-256 DATA</div>
                      </motion.div>
                    ) : (
                      <div className="w-36 h-24 bg-gray-950/60 border border-dashed border-gray-800 rounded-lg flex items-center justify-center text-[10px] text-gray-600 font-mono">
                        Cargo Packed
                      </div>
                    )}

                    <div className="w-full">
                      {symState === 'idle' ? (
                        <button
                          onClick={triggerSymAutoEncrypt}
                          className="w-full py-1.5 bg-blue-950/30 hover:bg-blue-900/50 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer"
                        >
                          ⚡ Auto Lock
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSymState('idle');
                            setSymCiphertext('');
                            setSymDecryptedText('');
                          }}
                          className="w-full py-1.5 bg-gray-850 hover:bg-gray-800 border border-gray-850 text-gray-400 text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer"
                        >
                          Reset Analogy
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: The Lockbox Suitcase */}
                  <div className="flex flex-col items-center justify-between p-4 bg-gray-900/60 border border-gray-800 rounded-xl relative space-y-6 min-h-[300px]">
                    <div className="w-full text-center">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                        Symmetric Storage Chest
                      </span>
                    </div>

                    {/* Cartoon Suitcase */}
                    <div className="relative w-44 h-48 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl border border-slate-650 flex flex-col items-center justify-between p-3 relative shadow-2xl">
                      
                      {/* Box top opening */}
                      <div 
                        ref={symChestSlotRef}
                        className={`w-32 py-2.5 rounded-md border text-center transition-all relative ${
                          symState === 'idle'
                            ? 'bg-blue-950/40 border-blue-500/40 animate-pulse text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            : 'bg-gray-900 border-gray-800 text-gray-500'
                        }`}
                      >
                        <div className="w-20 h-1 bg-black rounded mx-auto mb-1.5 border border-gray-850" />
                        <span className="text-[8px] font-mono uppercase font-bold tracking-wider">
                          Chest Opening
                        </span>
                      </div>

                      {/* Locked/Unlocked display */}
                      <div className="w-full flex-grow flex items-center justify-center p-2 relative">
                        {symState === 'unlocked' ? (
                          <div className="w-full h-full bg-emerald-950/10 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between animate-fade-in text-[10px] font-sans">
                            <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest block border-b border-emerald-900/30 pb-1 flex items-center gap-1">
                              <PackageOpen className="w-3 h-3" /> Unlocked Chest
                            </span>
                            <p className="text-white italic mt-1.5 break-all max-h-16 overflow-y-auto">
                              "{symDecryptedText}"
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                            {symState === 'locked' ? (
                              <div className="w-full text-center space-y-1.5">
                                <div 
                                  ref={symChestLockRef}
                                  className="w-10 h-10 bg-blue-950/40 border border-blue-500/40 rounded-full flex items-center justify-center text-blue-500 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.25)] animate-pulse"
                                >
                                  <Lock className="w-4 h-4" />
                                </div>
                                <span className="text-[8px] font-mono uppercase text-blue-400 tracking-widest">
                                  locked
                                </span>
                              </div>
                            ) : (
                              <div className="text-center text-[9px] text-gray-500 font-mono uppercase animate-pulse">
                                Awaiting Cargo...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Ciphertext representation */}
                      {symState === 'locked' && (
                        <div className="w-full bg-gray-900/90 border border-gray-800 p-1.5 rounded-lg text-[8px] font-mono text-gray-400 break-all select-all max-h-12 overflow-y-auto leading-tight">
                          <span className="text-blue-400 font-bold block text-[7px] uppercase">AES Ciphertext (HEX):</span>
                          {symCiphertext}
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] font-mono text-gray-500 text-center uppercase tracking-wider">
                      Shared Key Security
                    </div>
                  </div>

                  {/* Right Column: Shared Key */}
                  <div className="flex flex-col items-center justify-between p-4 bg-gray-900/40 border border-gray-850 rounded-xl space-y-4">
                    <div className="w-full text-center">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                        Shared Secret Key
                      </span>
                      <h4 className="text-xs font-bold text-white mt-2">Symmetric Key (256-bit)</h4>
                    </div>

                    <div className="flex-grow flex items-center justify-center">
                      {symState === 'locked' ? (
                        <motion.div
                          drag
                          dragSnapToOrigin
                          dragElastic={0.2}
                          onDragEnd={handleSymKeyDragEnd}
                          whileDrag={{ scale: 1.1, zIndex: 50 }}
                          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 border border-blue-300 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_25px_rgba(59,130,246,0.45)] cursor-grab active:cursor-grabbing flex items-center justify-center text-white relative transition-shadow"
                        >
                          <Key className="w-8 h-8 text-black" />
                          <div className="absolute -bottom-6 w-24 text-[8px] font-mono text-blue-400 uppercase tracking-widest text-center">
                            Shared Key
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-950/60 border border-dashed border-gray-800 rounded-full flex items-center justify-center text-gray-650">
                          <Key className="w-8 h-8 opacity-25" />
                        </div>
                      )}
                    </div>

                    <div className="w-full">
                      {symState === 'locked' ? (
                        <button
                          onClick={triggerSymAutoDecrypt}
                          className="w-full py-1.5 bg-blue-950/30 hover:bg-blue-900/50 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer"
                        >
                          ⚡ Auto Unlock
                        </button>
                      ) : (
                        <div className="w-full py-1.5 bg-gray-950 border border-gray-850 text-gray-650 text-[10px] font-mono uppercase rounded-lg text-center select-none cursor-not-allowed">
                          Key Locked
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLOWCHART */}
          {activeTab === 'flowchart' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Symmetric Encryption Data Flow</h2>
              
              <div className="flex flex-col items-center space-y-6 bg-cyber-darker p-8 rounded-lg border border-gray-800">
                {/* Step 1: Input */}
                <div className="flex items-center justify-center bg-gray-900 border border-gray-700 px-4 py-2 rounded font-mono text-sm">
                  <span>Plaintext message</span>
                </div>
                
                <ArrowRight className="w-6 h-6 text-gray-500 transform rotate-90" />
                
                {/* Step 2: Key Mix */}
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-950/50 border border-blue-500/30 text-blue-400 px-4 py-2 rounded text-xs font-mono">
                    <span>Secret Key (e.g. 256-bit)</span>
                  </div>
                  <span className="text-gray-500 font-bold">+</span>
                  <div className="bg-purple-950/50 border border-purple-500/30 text-purple-400 px-4 py-2 rounded text-xs font-mono">
                    <span>Unique IV (12-16 bytes)</span>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-gray-500 transform rotate-90" />

                {/* Step 3: Block cipher mixing */}
                <div className="text-center bg-gray-900 border border-blue-500 p-4 rounded-lg relative">
                  <div className="font-bold text-white mb-1">AES-256-GCM Block Engine</div>
                  <div className="text-[10px] text-gray-500 font-mono">SubBytes → ShiftRows → MixColumns → AddRoundKey (14 Rounds)</div>
                </div>

                <ArrowRight className="w-6 h-6 text-gray-500 transform rotate-90" />

                {/* Step 4: Ciphertext + Tag */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 p-3 rounded font-mono text-xs text-center">
                    <div className="font-bold mb-1">Ciphertext</div>
                    <div className="text-[10px] text-gray-500">Confidential data bytes</div>
                  </div>
                  <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 p-3 rounded font-mono text-xs text-center">
                    <div className="font-bold mb-1">Auth Tag</div>
                    <div className="text-[10px] text-gray-500">Integrity check checksum</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT AES */}
          {activeTab === 'about' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">About AES and Symmetric Standards</h2>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                <p>
                  Symmetric cryptography uses the **same secret key** to encrypt and decrypt data. It is computationally fast, making it suitable for encrypting large volumes of data.
                </p>
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">GCM vs CBC Mode</h3>
                  <ul className="list-disc pl-4 space-y-2 mt-2">
                    <li>**GCM (Galois/Counter Mode)**: An AEAD mode that provides both confidentiality and authentication. If an attacker tampers with even one byte of the ciphertext, decryption will fail because the tag won't match. Always prefer GCM.</li>
                    <li>**CBC (Cipher Block Chaining)**: A legacy block mode. It requires an Initialization Vector (IV) and block padding. Because it doesn't authenticate, it is vulnerable to padding oracle attacks.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-gradient-to-b from-gray-900/40 to-cyber-bg text-xs">
            <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Symmetric Guide
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-white mb-1">Key Sizes</h4>
                <p className="text-gray-400">
                  AES keys are either 128, 192, or 256 bits. 256-bit is standard for government secrets and is quantum-resistant.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-1">The Role of IVs</h4>
                <p className="text-gray-400">
                  The Initialization Vector guarantees that encrypting the same message twice yields completely different ciphertext, preventing pattern leaks. Never reuse IVs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">ChaCha20</h4>
                <p className="text-gray-400">
                  A modern stream cipher. It is faster in software-only environments (e.g. mobile CPUs) that lack native AES hardware execution units.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where is Symmetric Encryption Used in Real Life?"
        subtitle="Symmetric ciphers provide high-speed, bulk encryption for network data in transit and files at rest."
        items={[
          {
            title: "HTTPS Web Security (TLS 1.3)",
            description: "Over 95% of modern web traffic uses AES-256-GCM or ChaCha20-Poly1305 to encrypt web pages and API requests between browsers and servers.",
            example: "Cipher: TLS_AES_256_GCM_SHA384",
            badge: "Web Traffic"
          },
          {
            title: "Full Disk Encryption",
            description: "Windows BitLocker, macOS FileVault, and Android storage encrypt your hard drive sectors using AES-XTS mode so lost laptops cannot be read.",
            example: "BitLocker AES-256-XTS",
            badge: "Disk Storage"
          },
          {
            title: "End-to-End Messaging",
            description: "WhatsApp, Signal, and Telegram secret chats use ChaCha20 / AES-256 to encrypt chat messages before sending them across internet relays.",
            example: "Signal Protocol Payload",
            badge: "Secure Chat"
          }
        ]}
      />

      {/* Quest Success Celebration Modal */}
      {showQuestSuccessModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-cyber-dark border-2 border-blue-500/50 rounded-2xl p-8 max-w-md text-center shadow-[0_0_40px_rgba(59,130,246,0.15)] relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">🏆</div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2 font-mono">
              Quest Completed!
            </h2>
            <p className="text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              🎖️ Master of Symmetric Integrity
            </p>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Congratulations! You've successfully completed the Symmetric Encryption Laboratory Quest. You encrypted payloads using AES-GCM and witnessed how authentication tags protect ciphertext from byte-flipping attacks.
            </p>

            <div className="bg-cyber-darker p-4 rounded-xl border border-gray-850 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Milestone reached:</span>
                <span className="text-blue-400 font-bold">100% Completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Skills updated:</span>
                <span className="text-white font-mono font-bold">AES-GCM, Byte Tampering Sandbox</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">XP Reward:</span>
                <span className="text-amber-400 font-bold">+50 XP</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestSuccessModal(false)}
              className="w-full py-2.5 bg-blue-650 hover:bg-blue-600 text-white text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer animate-pulse"
            >
              Back to Laboratories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymmetricLab;
