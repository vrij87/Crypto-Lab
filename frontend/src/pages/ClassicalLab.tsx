import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Copy, Check, Shield, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [activeTab, setActiveTab] = useState<'encrypt' | 'decrypt' | 'animation' | 'analysis' | 'about'>('encrypt');
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

  // Gamified Mission Tracker State
  const [missionInput, setMissionInput] = useState('');
  const TARGET_PLAINTEXT = 'CRYPTO IS FUN';

  const missionSolved = useMemo(() => {
    return missionInput.trim().toUpperCase() === TARGET_PLAINTEXT;
  }, [missionInput]);

  // Quest/Tutorial Mode States
  const [isQuestMode, setIsQuestMode] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('quest') === 'true');
  const [questStep, setQuestStep] = useState(1);
  const [questFrequencyAnswer, setQuestFrequencyAnswer] = useState<number | null>(null);
  const [showQuestSuccessModal, setShowQuestSuccessModal] = useState(false);

  // Handle auto-routing and pre-filling variables per quest step
  useEffect(() => {
    if (isQuestMode) {
      if (questStep === 1) {
        setActiveTab('encrypt');
        setActiveCipher('caesar');
        setPlaintext('ATTACK AT DAWN');
        setCaesarShift(0);
      } else if (questStep === 2) {
        setActiveTab('decrypt');
        setActiveCipher('caesar');
        setDecCiphertext('DWWDFN DW GDZQ');
        setDecCaesarShift(0);
      } else if (questStep === 3) {
        setActiveTab('analysis');
        setQuestFrequencyAnswer(null);
      } else if (questStep === 4) {
        setActiveTab('encrypt');
        setActiveCipher('vigenere');
        setPlaintext('SECRET CODE');
        setVigenereKey('');
      }
    }
  }, [isQuestMode, questStep]);

  useEffect(() => {
    if (missionSolved) {
      updateLabProgress('classical', 60);
    }
  }, [missionSolved]);

  useEffect(() => {
    markLabVisited('classical', 'Classical Ciphers Lab', '/labs/classical');
  }, []);

  const handleTabChange = (tab: 'encrypt' | 'decrypt' | 'animation' | 'analysis' | 'about') => {
    setActiveTab(tab);
    if (tab === 'decrypt') updateLabProgress('classical', 40);
    if (tab === 'animation') updateLabProgress('classical', 65);
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

  // Quest verification conditions
  const isStep1Complete = useMemo(() => {
    return isQuestMode && questStep === 1 && plaintext.trim().toUpperCase() === 'ATTACK AT DAWN' && caesarShift === 3;
  }, [isQuestMode, questStep, plaintext, caesarShift]);

  const isStep2Complete = useMemo(() => {
    return isQuestMode && questStep === 2 && decCiphertext.trim().toUpperCase() === 'DWWDFN DW GDZQ' && decCaesarShift === 3 && decryptedText.trim().toUpperCase() === 'ATTACK AT DAWN';
  }, [isQuestMode, questStep, decCiphertext, decCaesarShift, decryptedText]);

  const isStep3Complete = useMemo(() => {
    return isQuestMode && questStep === 3 && questFrequencyAnswer === 3;
  }, [isQuestMode, questStep, questFrequencyAnswer]);

  const isStep4Complete = useMemo(() => {
    return isQuestMode && questStep === 4 && plaintext.trim().toUpperCase() === 'SECRET CODE' && activeCipher === 'vigenere' && vigenereKey === 'ROME';
  }, [isQuestMode, questStep, plaintext, activeCipher, vigenereKey]);

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
                ? 'bg-amber-500 text-black border-amber-400 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-cyber-darker text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5'
            }`}
          >
            <Compass className={`w-4 h-4 ${isQuestMode ? 'animate-spin-slow' : ''}`} />
            {isQuestMode ? 'Exit Quest' : 'Start Guided Quest'}
          </button>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
            {(['encrypt', 'decrypt', 'animation', 'analysis', 'about'] as const).map((tab) => (
              <button
                key={tab}
                disabled={isQuestMode}
                onClick={() => !isQuestMode && handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                    : isQuestMode
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'encrypt' ? '1. Encrypt' : tab === 'decrypt' ? '2. Decrypt' : tab === 'animation' ? '3. Animation' : tab === 'analysis' ? '4. Frequency Analysis' : '5. About'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Quest HUD when active */}
      {isQuestMode && (
        <div className="glass-panel p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-gray-900/50 border border-amber-500/30 rounded-xl space-y-4 mb-8 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-850/80 pb-3">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Guided Learning Quest: Classical Ciphers
                </h2>
                <p className="text-[10px] text-gray-400 font-mono">Step {questStep} of 4</p>
              </div>
            </div>
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center text-[10px] font-bold font-mono ${
                    questStep > stepNum
                      ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : questStep === stepNum
                      ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse'
                      : 'bg-gray-900 border-gray-800 text-gray-600'
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
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Story: Julius Caesar's Secret Command
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    You are a general in Julius Caesar's legion. You must send a secret command: <span className="font-mono text-amber-300 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-gray-850">ATTACK AT DAWN</span>.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-amber-400 font-semibold font-mono">Action Required:</strong> Type <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">ATTACK AT DAWN</span> into the Plaintext box and slide the Shift slider to <span className="font-mono text-white font-bold bg-black/40 px-1.5 py-0.5 rounded">3</span>.
                  </p>
                </div>
              )}

              {questStep === 2 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Story: Decoding on the Battlefield
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Caesar's message was scrambled into <span className="font-mono text-amber-300 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-gray-850">DWWDFN DW GDZQ</span>. The receiving general needs to decode it back into readable text.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-amber-400 font-semibold font-mono">Action Required:</strong> Slide the Decrypt Decoder shift to <span className="font-mono text-white font-bold bg-black/40 px-1.5 py-0.5 rounded">3</span> in the active DECRYPT panel.
                  </p>
                </div>
              )}

              {questStep === 3 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Story: Spying & Frequency Analysis
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Simple ciphers are easily cracked by looking at letter frequency counts. Scroll down to compare standard English peaks (Cyan) vs ciphertext peaks (Amber).
                  </p>
                  <div className="text-xs text-gray-300 bg-cyber-darker p-3 rounded-lg border border-gray-800 space-y-2">
                    <p className="font-semibold text-white">Question: By how many positions did the peak shifts offset relative to standard English frequencies?</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[1, 3, 5, 13].map((val) => (
                        <button
                          key={val}
                          onClick={() => setQuestFrequencyAnswer(val)}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer transition-all border ${
                            questFrequencyAnswer === val
                              ? val === 3
                                ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                : 'bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-shake'
                              : 'bg-cyber-dark border-gray-800 hover:border-amber-500/50 text-gray-400 hover:text-white'
                          }`}
                        >
                          {val === 13 ? '13 (ROT13)' : `${val} Positions`}
                        </button>
                      ))}
                    </div>
                    {questFrequencyAnswer !== null && questFrequencyAnswer !== 3 && (
                      <p className="text-[10px] text-rose-400">Incorrect shift. Hint: Compare English peak 'E' with ciphertext peak 'H'.</p>
                    )}
                    {questFrequencyAnswer === 3 && (
                      <p className="text-[10px] text-emerald-400">Correct! The standard peak 'E' (position 4) shifted by 3 positions forward to 'H' (position 7).</p>
                    )}
                  </div>
                </div>
              )}

              {questStep === 4 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Story: Vigenère - Polyalphabetic Security
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    To prevent frequency analysis, we use a rotating keyword. This creates multiple shifting keys to flatten single letter peaks.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-amber-400 font-semibold font-mono">Action Required:</strong> Type plaintext <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">SECRET CODE</span> and set the Vigenère keyword key to <span className="font-mono text-white font-bold bg-black/40 px-1.5 py-0.5 rounded">ROME</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Status & Next Button */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
              {((questStep === 1 && isStep1Complete) ||
                (questStep === 2 && isStep2Complete) ||
                (questStep === 3 && isStep3Complete) ||
                (questStep === 4 && isStep4Complete)) ? (
                <button
                  onClick={() => {
                    if (questStep < 4) {
                      setQuestStep(prev => prev + 1);
                    } else {
                      updateLabProgress('classical', 100);
                      recordAlgorithmLearned('Caesar');
                      recordAlgorithmLearned('Vigenere');
                      recordAlgorithmLearned('ROT13');
                      setShowQuestSuccessModal(true);
                      setIsQuestMode(false);
                      setQuestStep(1);
                    }
                  }}
                  className="w-full lg:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {questStep === 4 ? 'Complete Quest!' : 'Advance to Next Step'}
                </button>
              ) : (
                <div className="w-full text-center lg:text-right border border-gray-800 bg-cyber-darker/60 rounded-lg p-3 text-[11px] font-mono text-amber-500/80 animate-pulse">
                  ⚠️ Step conditions incomplete. Follow the action instructions above to proceed.
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
      )}

      {/* Cyber Agent Mission Tracker */}
      {!isQuestMode && (
        <div className="glass-panel p-5 bg-gradient-to-r from-amber-500/5 to-amber-600/5 border border-amber-500/10 rounded-xl space-y-4 mb-8">
        <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cyber Agent Objective</h2>
              <p className="text-[10px] text-gray-505">Decrypt the spy's intercept and authorize the challenges link.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
            Active Mission
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Mission Objective 1 */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-[10px] font-bold ${missionSolved ? 'bg-emerald-500 text-black animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                {missionSolved ? '✔' : '1'}
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Objective 1: Decrypt Caesar Intercept</p>
                <p className="text-[11px] text-gray-400">
                  Intercepted message: <span className="font-mono text-amber-300 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-gray-850">FUBSWR LV IXQ</span> (Caesar Shift: 3).
                </p>
              </div>
            </div>

            {/* Input field */}
            <div className="pl-6 flex gap-2">
              <input
                type="text"
                value={missionInput}
                onChange={(e) => setMissionInput(e.target.value.toUpperCase())}
                placeholder="Enter decrypted plaintext..."
                disabled={missionSolved}
                className="bg-cyber-darker border border-gray-800 rounded-lg p-2 px-3 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500 w-full max-w-xs disabled:opacity-50"
              />
              {missionSolved && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Decrypted!
                </span>
              )}
            </div>
          </div>

          {/* Mission Objective 2 */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-gray-800/80 pt-4 md:pt-0 md:pl-6 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-[10px] font-bold ${missionSolved ? 'bg-emerald-500 text-black' : 'bg-gray-900 text-gray-600'}`}>
                {missionSolved ? '✔' : '2'}
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Objective 2: Master Server Quiz</p>
                <p className="text-[11px] text-gray-400">
                  Submit credentials and claim score on scoreboard.
                </p>
              </div>
            </div>

            <div className="pl-6">
              <a
                href="/challenges"
                onClick={(e) => {
                  if (!missionSolved) {
                    e.preventDefault();
                    alert('Complete Objective 1 first to authorize connection!');
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold font-mono uppercase transition-all ${
                  missionSolved
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer'
                    : 'bg-gray-850 text-gray-550 cursor-not-allowed border border-gray-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Go to Challenges
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>
      )}

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
                      disabled={isQuestMode}
                      onClick={() => {
                        setActiveCipher(cipher);
                        if (cipher === 'rot13') setCaesarShift(13);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
                        activeCipher === cipher 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : isQuestMode
                          ? 'text-gray-600 cursor-not-allowed'
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
                    disabled={isQuestMode && questStep !== 1 && questStep !== 4}
                    className={`w-full bg-cyber-darker border rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase transition-all ${
                      isQuestMode && questStep === 1 && plaintext.trim().toUpperCase() !== 'ATTACK AT DAWN'
                        ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                        : isQuestMode && questStep === 4 && plaintext.trim().toUpperCase() !== 'SECRET CODE'
                        ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                {/* Cipher specific inputs */}
                {activeCipher === 'caesar' && (
                  <div className={`bg-cyber-darker p-4 rounded-lg border transition-all ${
                    isQuestMode && questStep === 1 && plaintext.trim().toUpperCase() === 'ATTACK AT DAWN' && caesarShift !== 3
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                      : 'border-gray-800'
                  } space-y-3`}>
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
                      disabled={isQuestMode && questStep !== 1}
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
                  <div className={`bg-cyber-darker p-4 rounded-lg border transition-all ${
                    isQuestMode && questStep === 4 && plaintext.trim().toUpperCase() === 'SECRET CODE' && vigenereKey !== 'ROME'
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                      : 'border-gray-800'
                  } space-y-3`}>
                    <label className="block text-xs font-mono uppercase text-gray-400 flex items-center">
                      Vigenère Substitution Keyword
                      <Eli5Tooltip term="Keyword" simpleExplanation="A word used to shift letters dynamically. E.g. key 'KEY' means 1st letter shifts by K (10), 2nd by E (4), 3rd by Y (24), repeating." analogy="Using a pattern of shifts instead of just one single offset." />
                    </label>
                    <input
                      type="text"
                      value={vigenereKey}
                      disabled={isQuestMode && questStep !== 4}
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
                      disabled={isQuestMode}
                      onClick={() => {
                        setActiveCipher(cipher);
                        if (cipher === 'rot13') setDecCaesarShift(13);
                      }}
                      className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
                        activeCipher === cipher 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : isQuestMode
                          ? 'text-gray-600 cursor-not-allowed'
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
                    disabled={isQuestMode && questStep !== 2}
                    placeholder="PASTE SCRAMBLED CIPHERTEXT HERE..."
                    className={`w-full bg-cyber-darker border rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono text-sm uppercase transition-all ${
                      isQuestMode && questStep === 2 && decCiphertext.trim().toUpperCase() !== 'DWWDFN DW GDZQ'
                        ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                {/* Decrypt parameters */}
                {activeCipher === 'caesar' && (
                  <div className={`bg-cyber-darker p-4 rounded-lg border transition-all ${
                    isQuestMode && questStep === 2 && decCaesarShift !== 3
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                      : 'border-gray-800'
                  } space-y-3`}>
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
                      disabled={isQuestMode && questStep !== 2}
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

          {/* TAB: ANIMATION */}
          {activeTab === 'animation' && (
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  Classical Encryption: The Caesar Shift Cylinder
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  The Caesar Cipher encrypts text by shifting letters in the alphabet by a set number of positions. This interactive cylinder aligns the outer ciphertext ring with the inner plaintext ring.
                </p>
              </div>

              {/* Slider & Cylinder Controls */}
              <div className="bg-cyber-darker p-6 rounded-2xl border border-gray-800 space-y-8 relative overflow-hidden select-none">
                
                {/* Visual Instructions */}
                <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl text-center text-xs text-amber-300 font-mono flex items-center justify-center gap-2">
                  <Compass className="w-4 h-4 animate-spin-slow text-amber-400" />
                  <span>
                    Adjust the Shift Dial Slider below to watch the cryptographic barrel rotate and transform the characters!
                  </span>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  {/* Slider Control */}
                  <div className="w-full max-w-md bg-gray-900/60 p-4 rounded-xl border border-gray-850 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                      <span>CYLINDER SHIFT VALUE:</span>
                      <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                        +{caesarShift} positions
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
                  </div>

                  {/* The Cartoon Cylinder / Slide Tape */}
                  <div className="w-full max-w-2xl bg-gradient-to-b from-amber-950/15 via-gray-950/40 to-amber-950/5 border border-amber-500/10 rounded-2xl p-6 space-y-6 shadow-[inset_0_0_30px_rgba(245,158,11,0.05)] relative">
                    
                    {/* Metal barrel ends */}
                    <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-gray-800 to-gray-950 border-r border-gray-800 rounded-l-2xl" />
                    <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-gray-800 to-gray-950 border-l border-gray-800 rounded-r-2xl" />

                    <div className="px-4 space-y-6 overflow-hidden">
                      {/* Row 1: Plaintext Tape (Fixed) */}
                      <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest pl-2">
                          Plaintext Alphabet (Inner Cylinder)
                        </span>
                        <div className="flex items-center gap-1 bg-gray-900/80 p-2.5 rounded-lg border border-gray-850 justify-between">
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => (
                            <div key={`plain-${char}`} className="w-8 h-8 flex items-center justify-center font-mono font-bold text-sm text-gray-400 border-r border-gray-850/40 last:border-0">
                              {char}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 2: Ciphertext Tape (Slides based on shift) */}
                      <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest pl-2">
                          Ciphertext Alphabet (Outer Rotating Barrel)
                        </span>
                        <div className="bg-gray-900/80 p-2.5 rounded-lg border border-amber-500/20 relative overflow-hidden h-14 flex items-center shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                          
                          {/* Sliding Wrapper */}
                          <motion.div
                            animate={{ x: -((caesarShift) * 32.2) }}
                            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                            className="flex gap-0 absolute left-2.5"
                          >
                            {/* Duplicate the alphabet to facilitate wrap-around visuals during shifts */}
                            {('ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).map((char, index) => (
                              <div
                                key={`cipher-${char}-${index}`}
                                className="w-[32.2px] h-8 flex items-center justify-center font-mono font-bold text-sm text-amber-300 border-r border-amber-500/10 last:border-0"
                              >
                                {char}
                              </div>
                            ))}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Character conversion stream */}
                  <div className="w-full max-w-2xl bg-gray-900/40 p-4 border border-gray-850 rounded-xl space-y-4">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block border-b border-gray-850 pb-2">
                      Live Cylinder Conversion Output
                    </span>

                    <div className="flex flex-wrap gap-2.5 justify-center py-2">
                      {plaintext.slice(0, 30).split('').map((char, i) => {
                        const isLetter = /[A-Z]/i.test(char);
                        const cleanChar = char.toUpperCase();
                        const code = cleanChar.charCodeAt(0);
                        const ciphChar = isLetter 
                          ? String.fromCharCode(((code - 65 + caesarShift) % 26) + 65)
                          : char;
                        
                        return (
                          <div key={i} className="flex flex-col items-center bg-cyber-dark border border-gray-800 p-2 rounded-lg min-w-10">
                            <span className="text-[10px] text-gray-500 font-mono">IN</span>
                            <span className="text-sm font-bold text-white font-mono">{cleanChar === ' ' ? '␣' : cleanChar}</span>
                            <div className="w-4 h-0.5 bg-gray-700 my-1" />
                            <span className="text-[10px] text-gray-500 font-mono">OUT</span>
                            <span className="text-sm font-bold text-amber-400 font-mono">{ciphChar === ' ' ? '␣' : ciphChar}</span>
                          </div>
                        );
                      })}
                    </div>
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

      {/* Quest Success Celebration Modal */}
      {showQuestSuccessModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-cyber-dark border-2 border-emerald-500/50 rounded-2xl p-8 max-w-md text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">🏆</div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2 font-mono">
              Quest Completed!
            </h2>
            <p className="text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              🎖️ Master of Classical Ciphers
            </p>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Congratulations! You've successfully completed the Classical Ciphers Quest. You learned how to encrypt/decrypt using fixed offset ciphers, observed the vulnerability of frequency peaks, and successfully deployed polyalphabetic keyword protection.
            </p>

            <div className="bg-cyber-darker p-4 rounded-xl border border-gray-850 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Milestone reached:</span>
                <span className="text-emerald-400 font-bold">100% Completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Skills updated:</span>
                <span className="text-white font-mono font-bold">Caesar, Vigenère, ROT13</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">XP Reward:</span>
                <span className="text-amber-400 font-bold">+50 XP</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestSuccessModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              Back to Laboratories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassicalLab;
