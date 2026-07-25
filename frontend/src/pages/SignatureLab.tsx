import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, Edit3, ShieldCheck, ShieldAlert, Copy, Check, RefreshCw, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const SignatureLab: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  const [activeTab, setActiveTab] = useState<'sign' | 'verify' | 'animation' | 'sandbox' | 'concepts'>('sign');

  useEffect(() => {
    markLabVisited('signatures', 'Digital Signature Lab', '/labs/signatures');
  }, []);

  const handleTabChange = (tab: 'sign' | 'verify' | 'animation' | 'sandbox' | 'concepts') => {
    setActiveTab(tab);
    if (tab === 'verify') updateLabProgress('signatures', 40);
    if (tab === 'animation') updateLabProgress('signatures', 60);
    if (tab === 'sandbox') updateLabProgress('signatures', 80);
    if (tab === 'concepts') updateLabProgress('signatures', 100);
  };

  // Key pair sharing
  const [privKey, setPrivKey] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);

  // Sign state
  const [message, setMessage] = useState('Transfer $500 to Bob.');
  const [signature, setSignature] = useState('');
  const [signLoading, setSignLoading] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);

  // Signature Cartoon Animation States
  const [sigMessage, setSigMessage] = useState('Transfer $500 to Bob.');
  const [sigState, setSigState] = useState<'idle' | 'signed' | 'tampered' | 'verified'>('idle');
  const [sigSignature, setSigSignature] = useState('');

  const triggerSignWax = () => {
    setSigState('signed');
    const rawB64 = btoa(sigMessage);
    setSigSignature("SIG_RSA254_" + rawB64.substring(0, 16) + "_SEAL");
  };

  const triggerVerifyWax = () => {
    if (sigState === 'signed') {
      setSigState('verified');
    }
  };

  const handleSigMsgChange = (val: string) => {
    setSigMessage(val);
    if (sigState === 'signed' || sigState === 'verified') {
      setSigState('tampered');
    }
  };

  // Verify state
  const [verifyMsg, setVerifyMsg] = useState('Transfer $500 to Bob.');
  const [verifySig, setVerifySig] = useState('');
  const [verifyPubKey, setVerifyPubKey] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Sandbox state
  const [sandMsg, setSandMsg] = useState('Pay Bob $1000.');
  const [sandSig, setSandSig] = useState('');
  const [sandPubKey, setSandPubKey] = useState('');
  const [sandValid, setSandValid] = useState<boolean | null>(null);
  const [sandChecking, setSandChecking] = useState(false);

  // Quest/Tutorial Mode States
  const [isQuestMode, setIsQuestMode] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('quest') === 'true');
  const [questStep, setQuestStep] = useState(1);
  const [showQuestSuccessModal, setShowQuestSuccessModal] = useState(false);

  // Quest verification conditions
  const isStep1Complete = useMemo(() => {
    return isQuestMode && questStep === 1 && privKey !== '' && message.trim() === 'VERIFIED' && signature !== '';
  }, [isQuestMode, questStep, privKey, message, signature]);

  const isStep2Complete = useMemo(() => {
    return isQuestMode && questStep === 2 && sandMsg === 'VERIFIED!' && sandValid === false;
  }, [isQuestMode, questStep, sandMsg, sandValid]);

  // Handle auto-routing and pre-filling variables per quest step
  useEffect(() => {
    if (isQuestMode) {
      if (questStep === 1) {
        setActiveTab('sign');
        setMessage('VERIFIED');
        setSignature('');
      } else if (questStep === 2) {
        setActiveTab('sandbox');
      }
    }
  }, [isQuestMode, questStep]);

  const generateKeys = async () => {
    setKeyLoading(true);
    try {
      const response = await api.post('/asymmetric/generate-rsa', { key_size: 2048 });
      setPrivKey(response.data.private_key);
      setPubKey(response.data.public_key);
      updateLabProgress('signatures', 40);
      
      // Auto fill verify fields
      setVerifyPubKey(response.data.public_key);
      setSandPubKey(response.data.public_key);
    } catch (e) {
      alert('Key generation failed.');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSign = async () => {
    if (!privKey) {
      alert('Please generate RSA keys first.');
      return;
    }
    setSignLoading(true);
    try {
      const response = await api.post('/signatures/sign', {
        message: message,
        private_key: privKey
      });
      setSignature(response.data.signature);
      updateLabProgress('signatures', 70);
      
      // Auto fill validation
      setVerifyMsg(message);
      setVerifySig(response.data.signature);
      
      // Sandbox fill
      setSandMsg(message);
      setSandSig(response.data.signature);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Signing failed.');
    } finally {
      setSignLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyPubKey || !verifySig) {
      alert('Please make sure Public Key and Signature are provided.');
      return;
    }
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const response = await api.post('/signatures/verify', {
        message: verifyMsg,
        signature: verifySig,
        public_key: verifyPubKey
      });
      setVerifyResult(response.data.valid);
      updateLabProgress('signatures', 100);
    } catch (e) {
      setVerifyResult(false);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Auto validation for Sandbox tab
  useEffect(() => {
    if (activeTab === 'sandbox' && sandMsg && sandSig && sandPubKey) {
      updateLabProgress('signatures', 90);
      const runSandboxCheck = async () => {
        setSandChecking(true);
        try {
          const response = await api.post('/signatures/verify', {
            message: sandMsg,
            signature: sandSig,
            public_key: sandPubKey
          });
          setSandValid(response.data.valid);
        } catch (e) {
          setSandValid(false);
        } finally {
          setSandChecking(false);
        }
      };
      const debounce = setTimeout(runSandboxCheck, 250);
      return () => clearTimeout(debounce);
    }
  }, [sandMsg, sandSig, sandPubKey, activeTab]);

  const copySignature = () => {
    navigator.clipboard.writeText(signature);
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-pink-400" />
            Digital Signature Laboratory
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Sign payloads with private keys, verify authenticity with public keys, and check integrity via the Sandbox.
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
                ? 'bg-pink-500 text-black border-pink-400 hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'bg-cyber-darker text-pink-400 border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/5'
            }`}
          >
            <Compass className={`w-4 h-4 ${isQuestMode ? 'animate-spin-slow' : ''}`} />
            {isQuestMode ? 'Exit Quest' : 'Start Guided Quest'}
          </button>

          <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
            {(['sign', 'verify', 'animation', 'sandbox', 'concepts'] as const).map((tab) => (
              <button
                key={tab}
                disabled={isQuestMode}
                onClick={() => !isQuestMode && handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]' 
                    : isQuestMode
                    ? 'text-gray-650 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'sign' ? '1. Sign' : tab === 'verify' ? '2. Verify' : tab === 'animation' ? '3. Animation' : tab === 'sandbox' ? '4. Sandbox' : '5. Concepts'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Quest HUD when active */}
      {isQuestMode && (
        <div className="glass-panel p-5 bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-gray-900/50 border border-pink-500/30 rounded-xl space-y-4 mb-8 shadow-[0_0_20px_rgba(236,72,153,0.05)] animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-850/80 pb-3">
            <div className="flex items-center gap-3">
              <Compass className="w-6 h-6 text-pink-400 animate-spin-slow" />
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Guided Learning Quest: Digital Signatures & Tampering
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
                      ? 'bg-pink-500 border-pink-400 text-black shadow-[0_0_8px_rgba(236,72,153,0.3)] animate-pulse'
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
                  <span className="text-[10px] uppercase font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                    Story: Signing Message Authenticity
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    Digital signatures use a private key to create a cryptographic seal on a message. Let's sign the message <span className="font-mono text-pink-300 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-gray-850">VERIFIED</span>.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-pink-400 font-semibold font-mono">Action Required:</strong> Click **"Generate Identity Keys"** first (if you haven't already), then type message as <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">VERIFIED</span> and click **"Sign Message"** under the sign tab.
                  </p>
                </div>
              )}

              {questStep === 2 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                    Story: Catching the Tampering
                  </span>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    If an attacker intercepts the signed message and alters it, the validation will fail because the signature no longer matches the message. Let's simulate a tamper attack.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong className="text-pink-400 font-semibold font-mono">Action Required:</strong> Under the **Integrity Tampering Sandbox** tab (automatically active), change Alice's message to <span className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">VERIFIED!</span> (adding an exclamation mark) and watch verification fail.
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
                      updateLabProgress('signatures', 100);
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
                <div className="w-full text-center lg:text-right border border-gray-850 bg-cyber-darker/60 rounded-lg p-3 text-[11px] font-mono text-pink-400 animate-pulse">
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
          title="Understanding Digital Signatures"
          analogyTitle="The Royal Wax Signet Ring"
          analogyDescription="Imagine a king stamping his unique signet ring into hot wax on a letter (Signing with Private Key). Anyone in the kingdom can compare the wax imprint against the public royal coat of arms (Verifying with Public Key). If a messenger changes even ONE word of the letter, the stamp breaks and verification fails!"
          bulletPoints={[
            "Authenticity: Proves who wrote the message (only the key owner has the signet ring).",
            "Integrity: Proves the letter was not altered in transit.",
            "Non-Repudiation: The sender cannot claim 'I didn't send that letter'."
          ]}
        />
      )}

      {/* Helper Keys Block */}
      <div className="glass-panel p-4 mb-6 bg-cyber-darker border border-pink-900/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-400 max-w-md">
          <span className="font-bold text-white block">Identity Keyring Status:</span>
          {pubKey ? 'RSA-2048 Identity Keys generated. You are ready to sign and verify.' : 'You need RSA asymmetric keys to sign and verify messages. Generate a pair first.'}
        </div>
        <button
          onClick={generateKeys}
          disabled={keyLoading}
          className={`px-4 py-2 rounded border transition-all inline-flex items-center text-xs font-semibold cursor-pointer ${
            isQuestMode && questStep === 1 && !pubKey
              ? 'bg-pink-500 hover:bg-pink-400 text-black border-pink-400 ring-2 ring-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse'
              : 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {keyLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
          Generate Identity Keys
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: SIGN */}
          {activeTab === 'sign' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Sign Message</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                    Message To Sign
                    <Eli5Tooltip term="Digital Signature" simpleExplanation="Creating a tamper-evident wax seal on your text using your secret signet ring (Private Key)." analogy="Wax seal on a royal letter" />
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    disabled={isQuestMode && questStep !== 1}
                    className={`w-full bg-cyber-darker border rounded-lg p-3 text-white font-mono text-sm focus:outline-none transition-all ${
                      isQuestMode && questStep === 1 && pubKey && message.trim() !== 'VERIFIED'
                        ? 'border-pink-500 ring-2 ring-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signer Private Key (PEM)</label>
                  <textarea
                    value={privKey}
                    onChange={(e) => setPrivKey(e.target.value)}
                    rows={5}
                    disabled={isQuestMode}
                    placeholder="Generate identity keys above or paste private key PEM..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleSign}
                  disabled={signLoading}
                  className={`w-full inline-flex items-center justify-center p-2.5 rounded text-white font-semibold transition-all ${
                    isQuestMode && questStep === 1 && pubKey && message.trim() === 'VERIFIED' && signature === ''
                      ? 'bg-pink-550 hover:bg-pink-500 ring-2 ring-pink-500/40 animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer'
                      : 'bg-pink-650 hover:bg-pink-600 cursor-pointer'
                  }`}
                >
                  {signLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                  Sign Message
                </button>

                {signature && (
                  <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-400 mb-1">
                      <span className="font-bold">Cryptographic Digital Signature (Base64):</span>
                      <button onClick={copySignature} className="hover:text-white">
                        {copiedSig ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-pink-400 break-all bg-gray-900 p-2 rounded leading-relaxed">{signature}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VERIFY */}
          {activeTab === 'verify' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Verify Signature</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Plaintext Message</label>
                  <textarea
                    value={verifyMsg}
                    onChange={(e) => setVerifyMsg(e.target.value)}
                    rows={2}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signature (Base64)</label>
                  <textarea
                    value={verifySig}
                    onChange={(e) => setVerifySig(e.target.value)}
                    rows={2}
                    placeholder="Paste Base64 signature..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-xs break-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signer Public Key (PEM)</label>
                  <textarea
                    value={verifyPubKey}
                    onChange={(e) => setVerifyPubKey(e.target.value)}
                    rows={5}
                    placeholder="-----BEGIN PUBLIC KEY-----..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verifyLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded bg-pink-600 text-white font-semibold"
                >
                  Verify Authenticity
                </button>

                {verifyResult !== null && (
                  <div className="flex items-center justify-center p-4 rounded-lg bg-gray-900 border border-gray-800">
                    {verifyResult ? (
                      <div className="flex items-center text-emerald-400 font-bold space-x-2">
                        <ShieldCheck className="w-6 h-6" />
                        <span>Signature VALID: Message is authentic and unaltered!</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-rose-450 font-bold space-x-2">
                        <ShieldAlert className="w-6 h-6" />
                        <span>Signature INVALID: Signature doesn't match, or key is wrong.</span>
                      </div>
                    )}
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
                  <Edit3 className="w-5 h-5 text-pink-400" />
                  Digital Signatures: The Notary Wax Seal Analogy
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  A digital signature guarantees <strong>authenticity</strong> and <strong>integrity</strong>. Think of it as a wax seal: Bob stamps the document with his private seal. If anyone alters even one character in transit, the seal instantly shatters!
                </p>
              </div>

              {/* Wax Seal Interactive Sandbox */}
              <div className="bg-cyber-darker p-6 rounded-2xl border border-gray-800 space-y-8 relative overflow-hidden select-none">
                
                {/* HUD Instructions */}
                <div className="bg-pink-950/20 border border-pink-500/20 p-3 rounded-xl text-center text-xs text-pink-300 font-mono flex items-center justify-center gap-2">
                  <Compass className="w-4 h-4 animate-spin-slow text-pink-400" />
                  <span>
                    {sigState === 'idle' && "Write the contract, then click 'Pour Wax & Stamp' to sign it!"}
                    {sigState === 'signed' && "Signed! Now click 'Verify' to validate, OR edit the contract text to see the seal shatter!"}
                    {sigState === 'verified' && "🟢 VALID SEAL! The document signature matches and has not been tampered with."}
                    {sigState === 'tampered' && "🔴 SEAL SHATTERED! The document text was modified after the signature was stamped."}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center">
                  
                  {/* Left Column: Contract & Controls */}
                  <div className="flex flex-col p-4 bg-gray-900/40 border border-gray-850 rounded-xl space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 uppercase">
                        Document Editor
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase text-gray-400">Contract Content (Try editing this!)</label>
                      <textarea
                        value={sigMessage}
                        onChange={(e) => handleSigMsgChange(e.target.value)}
                        rows={3}
                        className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-pink-500 font-sans resize-none"
                        placeholder="Write contract terms..."
                      />
                    </div>

                    <div className="flex gap-2">
                      {sigState === 'idle' || sigState === 'tampered' ? (
                        <button
                          onClick={triggerSignWax}
                          disabled={!sigMessage.trim()}
                          className="flex-1 py-2 bg-pink-650 hover:bg-pink-600 text-white font-extrabold text-xs uppercase tracking-wider font-mono rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)] cursor-pointer"
                        >
                          🩸 Pour Wax & Stamp
                        </button>
                      ) : (
                        <button
                          onClick={triggerVerifyWax}
                          disabled={sigState !== 'signed'}
                          className={`flex-1 py-2 font-extrabold text-xs uppercase tracking-wider font-mono rounded-lg transition-all cursor-pointer ${
                            sigState === 'signed'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-850'
                          }`}
                        >
                          🔍 Verify Signature
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSigState('idle');
                          setSigMessage('Transfer $500 to Bob.');
                          setSigSignature('');
                        }}
                        className="py-2 px-4 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-400 text-xs font-mono uppercase rounded-lg transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Cartoon Wax Seal Contract */}
                  <div className="flex flex-col items-center justify-center bg-gray-900/20 border border-gray-850 p-6 rounded-2xl relative min-h-[300px]">
                    {/* Visual Contract sheet */}
                    <div className="w-52 h-64 bg-gradient-to-b from-[#fbf6e9] to-[#f4ecd8] border border-amber-800/20 rounded-md shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                      
                      {/* Faux script lines */}
                      <div className="space-y-2.5">
                        <div className="text-[10px] font-serif text-amber-900 font-bold border-b border-amber-900/10 pb-1 uppercase tracking-wider text-center">
                          📜 Official Agreement
                        </div>
                        <p className="text-[9px] font-serif text-amber-950 italic break-words leading-relaxed max-h-24 overflow-y-auto">
                          "{sigMessage}"
                        </p>
                      </div>

                      {/* Wax Seal Overlay Area */}
                      <div className="flex justify-center items-center h-16 relative">
                        <AnimatePresence>
                          {sigState === 'idle' && (
                            <div className="text-[8px] font-mono text-amber-900/30 uppercase tracking-widest border border-dashed border-amber-900/10 rounded px-2.5 py-1 animate-pulse">
                              Awaiting Seal
                            </div>
                          )}

                          {sigState === 'signed' && (
                            <motion.div
                              initial={{ scale: 2.2, opacity: 0, rotate: -20 }}
                              animate={{ scale: 1.0, opacity: 1, rotate: 0 }}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-800 border-2 border-red-400 shadow-md flex items-center justify-center text-white text-xs font-bold font-serif cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.3)] relative"
                              title="Monogram Monarchy Stamp"
                            >
                              BOB
                            </motion.div>
                          )}

                          {sigState === 'verified' && (
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: [1, 1.1, 1] }}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-400 shadow-md flex items-center justify-center text-white text-base font-serif cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] relative"
                            >
                              ✓
                            </motion.div>
                          )}

                          {sigState === 'tampered' && (
                            <motion.div
                              initial={{ scale: 1.1 }}
                              animate={{ scale: [1, 0.95, 1], rotate: [-5, 5, 0] }}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-dashed border-red-500 shadow-md flex items-center justify-center text-rose-500 text-xs font-bold font-serif relative"
                            >
                              ✕
                              <div className="absolute inset-0 border-t border-red-500/80 transform rotate-45" />
                              <div className="absolute inset-0 border-t border-red-500/80 transform -rotate-45" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Base64 signature banner */}
                      {sigSignature && (
                        <div className="mt-2 text-[7px] font-mono text-amber-900/60 truncate border-t border-amber-900/10 pt-1.5 uppercase text-center">
                          {sigSignature}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TAMPER SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Integrity Tampering Sandbox</h2>
              <p className="text-gray-400 text-sm">
                Try modifying the message text below (even adding a space or changing a capital letter). The sandbox will automatically execute verification to see if the signature holds!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex justify-between">
                    <span>Alice's Plaintext Message (Try editing it!)</span>
                    {sandChecking && <span className="text-cyan-400 font-normal animate-pulse">Checking...</span>}
                  </label>
                  <input
                    type="text"
                    value={sandMsg}
                    onChange={(e) => setSandMsg(e.target.value)}
                    disabled={isQuestMode && questStep !== 2}
                    className={`w-full bg-cyber-darker border rounded-lg p-2.5 text-white font-mono text-sm focus:border-pink-500 transition-all ${
                      isQuestMode && questStep === 2 && sandMsg !== 'VERIFIED!'
                        ? 'border-pink-500 ring-2 ring-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse'
                        : 'border-gray-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signature (Base64)</label>
                    <textarea
                      value={sandSig}
                      onChange={(e) => setSandSig(e.target.value)}
                      rows={4}
                      disabled={isQuestMode}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-[9px] break-all animate-pulse"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Public Key (PEM)</label>
                    <textarea
                      readOnly
                      value={sandPubKey}
                      rows={4}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-gray-500 font-mono text-[9px] cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center p-4 rounded-lg bg-gray-900 border border-gray-800 transition-all">
                  {sandValid === null ? (
                    <div className="text-gray-500 text-xs">
                      Sign a message first to load the Sandbox.
                    </div>
                  ) : sandValid ? (
                    <div className="flex items-center text-emerald-400 font-bold text-sm space-x-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span>VALID SIGNATURE: Integrity & authenticity verified.</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-rose-400 font-bold text-sm space-x-2 animate-bounce">
                      <AlertTriangle className="w-5 h-5 text-rose-450" />
                      <span>TAMPER DETECTED: Payload altered, verification failed!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONCEPTS */}
          {activeTab === 'concepts' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Core Principles of Digital Signatures</h2>
              
              <div className="grid grid-cols-1 gap-4 text-gray-400 text-sm">
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">1. Authenticity</h3>
                  <p>
                    Because the signature is generated using a private key that only the sender owns, it serves as undeniable proof that the sender generated the message.
                  </p>
                </div>
                
                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">2. Integrity</h3>
                  <p>
                    A hash of the message is signed. If anyone alters even a single character of the message during transit, the hash recalculated by the recipient won't match, failing verification.
                  </p>
                </div>

                <div className="p-4 bg-cyber-darker rounded border border-gray-800">
                  <h3 className="font-bold text-white mb-1">3. Non-Repudiation</h3>
                  <p>
                    The sender cannot deny writing the message because they are the only entity holding the private key. No one else could have computed the signature.
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
              <CheckSquare className="w-4 h-4 text-pink-400" />
              Signature Process
            </h3>
            
            <div className="space-y-3 text-gray-400 leading-relaxed">
              <div className="border border-gray-850 p-2.5 rounded bg-cyber-darker">
                <span className="font-bold text-white block mb-1">1. Hashing</span>
                The message is hashed (e.g. using SHA-256) to create a short, fixed digest.
              </div>
              <div className="border border-gray-850 p-2.5 rounded bg-cyber-darker">
                <span className="font-bold text-white block mb-1">2. Key Signing</span>
                The digest is encrypted using the sender's **Private Key**.
              </div>
              <div className="border border-gray-850 p-2.5 rounded bg-cyber-darker">
                <span className="font-bold text-white block mb-1">3. Recipient Verification</span>
                The receiver decrypts the signature with the sender's **Public Key** and compares it to the fresh hash of the message.
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where are Digital Signatures Used in Real Life?"
        subtitle="Digital signatures provide authenticity, integrity, and non-repudiation across software updates, financial transactions, and legal documents."
        items={[
          {
            title: "OS & App Software Updates",
            description: "Windows, macOS, and Linux package managers verify developer RSA/ECDSA digital signatures before installing software updates to block malware injection.",
            example: "codesign --verify app.dmg",
            badge: "App Integrity"
          },
          {
            title: "Legal & PDF Document Signing",
            description: "DocuSign, Adobe Sign, and electronic contracts attach cryptographic signatures to PDFs to legally prove who signed the document.",
            example: "Adobe PKCS#7 PDF Signature",
            badge: "Legal Tech"
          },
          {
            title: "Cryptocurrency Transactions",
            description: "Every Bitcoin or Ethereum transaction requires an ECDSA / Schnorr signature created with the sender's private key to authorize spending funds.",
            example: "ECDSA (secp256k1) Signature",
            badge: "Financial Networks"
          }
        ]}
      />

      {/* Quest Success Celebration Modal */}
      {showQuestSuccessModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-cyber-dark border-2 border-pink-500/50 rounded-2xl p-8 max-w-md text-center shadow-[0_0_40px_rgba(236,72,153,0.15)] relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">🏆</div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2 font-mono">
              Quest Completed!
            </h2>
            <p className="text-pink-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              🎖️ Master of Signature Integrity
            </p>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Congratulations! You've successfully completed the Digital Signature Laboratory Quest. You signed custom messages using private keys and verified authenticity checks using the tampering sandbox.
            </p>

            <div className="bg-cyber-darker p-4 rounded-xl border border-gray-850 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Milestone reached:</span>
                <span className="text-pink-400 font-bold">100% Completion</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Skills updated:</span>
                <span className="text-white font-mono font-bold">RSA Signatures, Tampering Sandbox</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">XP Reward:</span>
                <span className="text-amber-400 font-bold">+50 XP</span>
              </div>
            </div>

            <button
              onClick={() => setShowQuestSuccessModal(false)}
              className="w-full py-2.5 bg-pink-650 hover:bg-pink-600 text-white text-xs font-mono font-extrabold uppercase rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer animate-pulse"
            >
              Back to Laboratories
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureLab;
