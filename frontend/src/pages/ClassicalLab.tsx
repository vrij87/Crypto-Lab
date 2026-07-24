import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Copy, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

// Standard English Letter Frequencies (%)
const ENGLISH_FREQUENCIES: Record<string, number> = {
  A: 8.17, B: 1.49, C: 2.78, D: 4.25, E: 12.70, F: 2.23, G: 2.02, H: 6.09, I: 6.97,
  J: 0.15, K: 0.77, L: 4.03, M: 2.41, N: 6.75, O: 7.51, P: 1.93, Q: 0.10, R: 5.99,
  S: 6.33, T: 9.06, U: 2.76, V: 0.98, W: 2.36, X: 0.15, Y: 1.97, Z: 0.07
};

const ClassicalLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'analysis' | 'about'>('encrypt');
  const [activeCipher, setActiveCipher] = useState<'caesar' | 'vigenere' | 'rot13'>('caesar');
  
  // Inputs
  const [plaintext, setPlaintext] = useState('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG');
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [copied, setCopied] = useState(false);
  const [decCiphertext, setDecCiphertext] = useState('');
  
  // Decryption keys
  const [decCaesarShift, setDecCaesarShift] = useState(3);
  const [decVigenereKey, setDecVigenereKey] = useState('KEY');

  useEffect(() => {
    markLabVisited('classical', 'Classical Ciphers Lab', '/labs/classical');
  }, []);

  const handleTabChange = (tab: 'encrypt' | 'decrypt' | 'analysis' | 'about') => {
    setActiveTab(tab);
    if (tab === 'decrypt') updateLabProgress('classical', 50);
    if (tab === 'analysis') updateLabProgress('classical', 80);
    if (tab === 'about') updateLabProgress('classical', 100);
  };

  // Caesar Cipher Functions
  const caesarEncrypt = (text: string, shift: number): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    }).join('');
  };

  const caesarDecrypt = (text: string, shift: number): string => {
    return caesarEncrypt(text, (26 - shift) % 26);
  };

  // Vigenère Cipher Functions
  const vigenereEncrypt = (text: string, key: string): string => {
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) return text;
    
    let keyIndex = 0;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      let isUpper = code >= 65 && code <= 90;
      let isLower = code >= 97 && code <= 122;
      
      if (isUpper || isLower) {
        const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        keyIndex++;
        
        if (isUpper) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
      }
      return char;
    }).join('');
  };

  const vigenereDecrypt = (text: string, key: string): string => {
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanKey) return text;
    
    let keyIndex = 0;
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      let isUpper = code >= 65 && code <= 90;
      let isLower = code >= 97 && code <= 122;
      
      if (isUpper || isLower) {
        const shift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const deShift = (26 - shift) % 26;
        keyIndex++;
        
        if (isUpper) {
          return String.fromCharCode(((code - 65 + deShift) % 26) + 65);
        } else {
          return String.fromCharCode(((code - 97 + deShift) % 26) + 97);
        }
      }
      return char;
    }).join('');
  };

  // Encryption execution
  const ciphertext = useMemo(() => {
    let result = '';
    if (activeCipher === 'caesar') {
      result = caesarEncrypt(plaintext, caesarShift);
    } else if (activeCipher === 'vigenere') {
      result = vigenereEncrypt(plaintext, vigenereKey);
    } else if (activeCipher === 'rot13') {
      result = caesarEncrypt(plaintext, 13);
    }
    return result;
  }, [plaintext, activeCipher, caesarShift, vigenereKey]);

  // Decryption execution
  const decryptedText = useMemo(() => {
    if (!decCiphertext) return '';
    if (activeCipher === 'caesar') {
      return caesarDecrypt(decCiphertext, decCaesarShift);
    } else if (activeCipher === 'vigenere') {
      return vigenereDecrypt(decCiphertext, decVigenereKey);
    } else if (activeCipher === 'rot13') {
      return caesarDecrypt(decCiphertext, 13);
    }
    return '';
  }, [decCiphertext, activeCipher, decCaesarShift, decVigenereKey]);

  // Frequency Analysis calculations
  const ciphertextFrequencies = useMemo(() => {
    const letters = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    const total = letters.length || 1;
    const counts: Record<string, number> = {};
    for (let i = 65; i <= 90; i++) {
      counts[String.fromCharCode(i)] = 0;
    }
    for (const char of letters) {
      counts[char] = (counts[char] || 0) + 1;
    }
    const frequencies: Record<string, number> = {};
    for (let i = 65; i <= 90; i++) {
      const char = String.fromCharCode(i);
      frequencies[char] = Number(((counts[char] / total) * 100).toFixed(2));
    }
    return frequencies;
  }, [ciphertext]);

  // Trigger achievement records when playing around
  useEffect(() => {
    if (ciphertext && ciphertext !== plaintext) {
      if (activeCipher === 'caesar') {
        recordAlgorithmLearned('Caesar');
        updateLabProgress('classical', 20);
      } else if (activeCipher === 'vigenere') {
        recordAlgorithmLearned('Vigenere');
        updateLabProgress('classical', 40);
      } else if (activeCipher === 'rot13') {
        recordAlgorithmLearned('ROT13');
        updateLabProgress('classical', 30);
      }
    }
  }, [ciphertext, activeCipher]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-amber-400" />
            Historical & Classical Ciphers
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Play with Caesar shifting, multi-letter Vigenère substitution keywords, and ROT13. Analyze letter frequencies to see ciphers break.
          </p>
        </div>
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['encrypt', 'decrypt', 'analysis', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
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
        title="Understanding Classical Ciphers"
        analogyTitle="The Decoder Ring & Secret Keyword"
        analogyDescription="Imagine a physical slider (Caesar Ring) where sliding it shifts all letters of the alphabet forward. If you shift by 3, A becomes D, B becomes E. It is fast, but if an attacker tests all 25 shifts, they break it. Vigenère uses a keyword (e.g. 'KEY') so every letter shifts by a different amount, creating multiple rotating layers of protection!"
        bulletPoints={[
          "Caesar Cipher: Monoalphabetic substitution. Shift the entire alphabet by a fixed offset.",
          "ROT13: Standard Caesar cipher with a shift key of 13. Encrypting twice returns the original text.",
          "Vigenère Cipher: Polyalphabetic substitution. Rotates shift ciphers according to a repeating key word.",
          "Frequency Attack: English letters like E, T, A occur most often. Simple ciphers leave this footprint visible!"
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters and inputs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: ENCRYPT */}
          {activeTab === 'encrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-850 pb-4">
                <h2 className="text-xl font-bold text-white">Encrypt Message</h2>
                <div className="flex bg-cyber-darker p-1 rounded-lg border border-gray-800 text-xs">
                  {(['caesar', 'vigenere', 'rot13'] as const).map((cipher) => (
                    <button
                      key={cipher}
                      onClick={() => {
                        setActiveCipher(cipher);
                        if (cipher === 'rot13') setCaesarShift(13);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
                        activeCipher === cipher 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cipher.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                    Plaintext Message
                    <Eli5Tooltip term="Plaintext" simpleExplanation="Your original readable message before being encrypted." analogy="An open postcard that anyone can read." />
                  </label>
                  <textarea
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value.toUpperCase())}
                    rows={3}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase"
                  />
                </div>

                {/* Cipher specific inputs */}
                {activeCipher === 'caesar' && (
                  <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                      <span>CAESAR SHIFT PARAMETER:</span>
                      <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        {caesarShift} Letters
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={caesarShift}
                      onChange={(e) => setCaesarShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-600">
                      <span>SHIFT 0 (A=A)</span>
                      <span>SHIFT 13 (ROT13)</span>
                      <span>SHIFT 25 (A=Z)</span>
                    </div>
                  </div>
                )}

                {activeCipher === 'vigenere' && (
                  <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 space-y-3">
                    <label className="block text-xs font-mono uppercase text-gray-400 flex items-center">
                      Vigenère Substitution Keyword
                      <Eli5Tooltip term="Keyword" simpleExplanation="A word used to shift letters dynamically. E.g. key 'KEY' means 1st letter shifts by K (10), 2nd by E (4), 3rd by Y (24), repeating." analogy="Using a pattern of shifts instead of just one single offset." />
                    </label>
                    <input
                      type="text"
                      value={vigenereKey}
                      onChange={(e) => setVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                      placeholder="e.g. SECRET"
                      className="w-full bg-cyber-dark border border-gray-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase"
                    />
                  </div>
                )}

                {activeCipher === 'rot13' && (
                  <div className="p-3.5 bg-amber-950/10 border border-amber-900/20 rounded-lg text-xs leading-relaxed text-amber-400">
                    <strong>ROT13 (Rotate 13)</strong> has a fixed shift of 13. Encrypting twice yields the original message because 13 is half of the English alphabet length (26).
                  </div>
                )}

                <div className="relative">
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400 mb-2">
                    <span>Ciphertext Output (Encrypted)</span>
                    <button
                      onClick={() => copyToClipboard(ciphertext)}
                      className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                    </button>
                  </div>
                  <div className="w-full bg-cyber-darker/60 border border-gray-800 rounded-lg p-3 text-amber-400 font-mono text-sm break-all min-h-[80px]">
                    {ciphertext || 'Scrambled text will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DECRYPT */}
          {activeTab === 'decrypt' && (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-850 pb-4">
                <h2 className="text-xl font-bold text-white">Decrypt Message</h2>
                <div className="flex bg-cyber-darker p-1 rounded-lg border border-gray-800 text-xs">
                  {(['caesar', 'vigenere', 'rot13'] as const).map((cipher) => (
                    <button
                      key={cipher}
                      onClick={() => {
                        setActiveCipher(cipher);
                        if (cipher === 'rot13') setDecCaesarShift(13);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
                        activeCipher === cipher 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {cipher.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
                    Ciphertext Message (Encrypted Text)
                  </label>
                  <textarea
                    value={decCiphertext}
                    onChange={(e) => setDecCiphertext(e.target.value.toUpperCase())}
                    rows={3}
                    placeholder="PASTE SCRAMBLED CIPHERTEXT HERE..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase"
                  />
                </div>

                {/* Decrypt parameters */}
                {activeCipher === 'caesar' && (
                  <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                      <span>DECRYPT SHIFT DECODER:</span>
                      <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        {decCaesarShift} Letters
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={decCaesarShift}
                      onChange={(e) => setDecCaesarShift(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}

                {activeCipher === 'vigenere' && (
                  <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 space-y-3">
                    <label className="block text-xs font-mono uppercase text-gray-400">
                      Vigenère Keyword Decoder
                    </label>
                    <input
                      type="text"
                      value={decVigenereKey}
                      onChange={(e) => setDecVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                      placeholder="e.g. KEY"
                      className="w-full bg-cyber-dark border border-gray-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase"
                    />
                  </div>
                )}

                {activeCipher === 'rot13' && (
                  <div className="p-3.5 bg-amber-950/10 border border-amber-900/20 rounded-lg text-xs leading-relaxed text-amber-400">
                    ROT13 runs symmetrically: decrypting a message is mathematically identical to encrypting it again.
                  </div>
                )}

                <div>
                  <h3 className="block text-xs font-mono uppercase text-gray-400 mb-2">Decrypted Plaintext Output</h3>
                  <div className="w-full bg-cyber-darker/60 border border-gray-800 rounded-lg p-3 text-emerald-400 font-mono text-sm break-all min-h-[80px]">
                    {decryptedText || 'Decrypted readable text will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Frequency Analysis Visualizer</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                By comparing the frequency of letters in the ciphertext (amber bars) to standard English distributions (cyan bars), you can crack simple ciphers. Notice how sliding a Caesar shift moves the peak shapes along the alphabet, whilst a Vigenère key flattens out frequencies.
              </p>

              {/* Stacked comparison charts */}
              <div className="space-y-6">
                
                {/* 1. English Standard Frequencies */}
                <div>
                  <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>1. English Baseline Standard Frequencies</span>
                    <span className="text-[10px] text-gray-500">Fixed target averages</span>
                  </h3>
                  
                  {/* CSS Bar Chart */}
                  <div className="bg-cyber-darker p-4 rounded-xl border border-gray-800 flex items-end justify-between h-[120px] select-none">
                    {Object.entries(ENGLISH_FREQUENCIES).map(([char, percent]) => (
                      <div key={char} className="flex flex-col items-center group relative w-full px-0.5">
                        {/* Tooltip */}
                        <div className="absolute bottom-[100%] mb-1.5 hidden group-hover:block bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-lg z-25 whitespace-nowrap">
                          {char}: {percent}%
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full bg-cyan-500/25 border-t border-cyan-400 rounded-t shadow-[0_0_8px_rgba(34,211,238,0.1)] transition-all group-hover:bg-cyan-500/50 animate-bar-rise"
                          style={{ height: `${percent * 7.5}px` }}
                        />
                        <span className="text-[9px] font-mono text-gray-500 mt-1">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Ciphertext Frequencies */}
                <div>
                  <h3 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>2. Active Ciphertext Frequencies</span>
                    <span className="text-[10px] text-gray-500">Calculated from encrypted output</span>
                  </h3>

                  <div className="bg-cyber-darker p-4 rounded-xl border border-gray-800 flex items-end justify-between h-[120px] select-none">
                    {Object.entries(ciphertextFrequencies).map(([char, percent]) => (
                      <div key={char} className="flex flex-col items-center group relative w-full px-0.5">
                        {/* Tooltip */}
                        <div className="absolute bottom-[100%] mb-1.5 hidden group-hover:block bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-lg z-25 whitespace-nowrap">
                          {char}: {percent}%
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full bg-amber-500/25 border-t border-amber-400 rounded-t shadow-[0_0_8px_rgba(245,158,11,0.1)] transition-all group-hover:bg-amber-500/50 animate-bar-rise"
                          style={{ height: `${percent * 7.5}px` }}
                        />
                        <span className="text-[9px] font-mono text-gray-500 mt-1">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT */}
          {activeTab === 'about' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Historical Cryptography Primitives</h2>
              
              <div className="space-y-4 text-xs text-gray-400 leading-relaxed">
                <div className="border-b border-gray-850 pb-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">Caesar Cipher</h3>
                  <p>
                    Used by Julius Caesar in the Roman Empire to send classified messages to his legions. It shifts letters down the alphabet by a set rotation key. It is classified as a monoalphabetic substitution cipher, which makes it extremely vulnerable to simple **frequency analysis** attacks. Since English text always has peak frequencies (e.g. 'E' occurs ~12% of the time), a simple shift leaves the pattern shape fully visible.
                  </p>
                </div>
                <div className="border-b border-gray-850 pb-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">ROT13</h3>
                  <p>
                    A simple variation of the Caesar cipher with a shift of 13. Since there are 26 letters in the Latin alphabet, rotating by 13 is self-inverse: executing ROT13 on an already encrypted string decrypts it back to plaintext. It is mostly used online to hide spoilers or answers, rather than for security purposes.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase mb-2">Vigenère Cipher</h3>
                  <p>
                    Described in 1553 by Giovan Battista Bellaso, and later misattributed to Blaise de Vigenère. Known as "le chiffre indéchiffrable" (the indecipherable cipher), it withstood cryptanalysis for over 300 years until Kasiski broke it in 1863. It works by shifting letters dynamically based on a repeating keyword, creating multiple Caesar offsets (polyalphabetic substitution) which flattens the frequency counts of single letters.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Informational cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-gray-850 pb-2">Cipher Parameters</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Cipher selected:</span>
                <span className="text-white font-mono font-bold uppercase">{activeCipher}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Operation:</span>
                <span className="text-amber-400 font-bold uppercase">{activeTab}</span>
              </div>
              <div className="flex justify-between border-b border-gray-850 pb-2">
                <span className="text-gray-500">Security rating:</span>
                <span className="text-rose-500 font-bold">Unsafe / Historic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Keyspace:</span>
                <span className="text-gray-300 font-mono">
                  {activeCipher === 'caesar' ? '26 combinations' : activeCipher === 'rot13' ? '1 combination' : '26^N combinations'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <RealWorldUsesCard
        title="Real-World Historic Uses"
        items={[
          {
            title: "Roman Military",
            description: "Caesar cipher was used to protect communication sent between field generals and Rome during military operations.",
            example: "Caesar shift key=3",
            badge: "Historic"
          },
          {
            title: "Usenet spoiler tags",
            description: "ROT13 is commonly used to mask movie spoilers, puzzle solutions, or adult content on internet forums.",
            example: "ROT13 text rotate",
            badge: "Spoiler Mask"
          },
          {
            title: "Historic Codes",
            description: "Vigenère remained a highly reliable military cipher standard through the American Civil War before automated math analysis was introduced.",
            example: "Vigenère secret keys",
            badge: "Military"
          }
        ]}
      />
    </div>
  );
};

export default ClassicalLab;
