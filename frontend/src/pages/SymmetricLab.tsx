import React, { useState, useEffect } from 'react';
import { Key, Lock, Unlock, RefreshCw, Copy, Check, Info, ArrowRight, Code, ShieldAlert, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const SymmetricLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'flowchart' | 'about'>('encrypt');

  useEffect(() => {
    markLabVisited('symmetric', 'AES Encryption Lab', '/labs/symmetric');
  }, []);

  const handleTabChange = (tab: 'encrypt' | 'decrypt' | 'flowchart' | 'about') => {
    setActiveTab(tab);
    if (tab === 'decrypt') updateLabProgress('symmetric', 60);
    if (tab === 'flowchart') updateLabProgress('symmetric', 85);
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
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['encrypt', 'decrypt', 'flowchart', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
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
        title="Understanding Symmetric Encryption"
        analogyTitle="The One-Key Physical Lockbox"
        analogyDescription="Imagine a steel lockbox with a single key. You put a secret letter inside and turn the key (Encrypt). Anyone holding an identical key can turn it back to open the box (Decrypt). If an attacker finds the locked box without the key, all they see is scrambled metal!"
        bulletPoints={[
          "Shared Secret: Both sender and receiver use the exact SAME key.",
          "IV (Initialization Vector): A random coin toss so locking the same secret twice produces a different-looking box.",
          "GCM Mode / AEAD Tag: A tamper-evident wax seal that breaks if an attacker tries to scratch or alter the box."
        ]}
      />

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
                    rows={3}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 font-mono text-sm"
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
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
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
                      disabled={encAlg === 'ChaCha20'}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm disabled:opacity-50"
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
                      disabled={encAlg === 'ChaCha20'}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm disabled:opacity-50"
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
                  className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)]"
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
                      <div className="flex flex-wrap gap-1.5 p-3 bg-black/30 rounded border border-gray-900 max-h-36 overflow-y-auto font-mono text-xs">
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
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold uppercase transition-colors cursor-pointer"
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
    </div>
  );
};

export default SymmetricLab;
