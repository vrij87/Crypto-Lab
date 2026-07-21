import React, { useState, useEffect } from 'react';
import { CheckSquare, Edit3, ShieldCheck, ShieldAlert, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const SignatureLab: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  const [activeTab, setActiveTab] = useState<'sign' | 'verify' | 'sandbox' | 'concepts'>('sign');

  useEffect(() => {
    markLabVisited('signatures', 'Digital Signature Lab', '/labs/signatures');
  }, []);

  const handleTabChange = (tab: 'sign' | 'verify' | 'sandbox' | 'concepts') => {
    setActiveTab(tab);
    if (tab === 'verify') updateLabProgress('signatures', 60);
    if (tab === 'sandbox') updateLabProgress('signatures', 85);
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
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['sign', 'verify', 'sandbox', 'concepts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]' 
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
        title="Understanding Digital Signatures"
        analogyTitle="The Royal Wax Signet Ring"
        analogyDescription="Imagine a king stamping his unique signet ring into hot wax on a letter (Signing with Private Key). Anyone in the kingdom can compare the wax imprint against the public royal coat of arms (Verifying with Public Key). If a messenger changes even ONE word of the letter, the stamp breaks and verification fails!"
        bulletPoints={[
          "Authenticity: Proves who wrote the message (only the key owner has the signet ring).",
          "Integrity: Proves the letter was not altered in transit.",
          "Non-Repudiation: The sender cannot claim 'I didn't send that letter'."
        ]}
      />

      {/* Helper Keys Block */}
      <div className="glass-panel p-4 mb-6 bg-cyber-darker border border-pink-900/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-400 max-w-md">
          <span className="font-bold text-white block">Identity Keyring Status:</span>
          {pubKey ? 'RSA-2048 Identity Keys generated. You are ready to sign and verify.' : 'You need RSA asymmetric keys to sign and verify messages. Generate a pair first.'}
        </div>
        <button
          onClick={generateKeys}
          disabled={keyLoading}
          className="px-4 py-2 rounded border border-gray-700 bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-colors inline-flex items-center"
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
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signer Private Key (PEM)</label>
                  <textarea
                    value={privKey}
                    onChange={(e) => setPrivKey(e.target.value)}
                    rows={5}
                    placeholder="Generate identity keys above or paste private key PEM..."
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white font-mono text-[10px]"
                  />
                </div>

                <button
                  onClick={handleSign}
                  disabled={signLoading}
                  className="w-full inline-flex items-center justify-center p-2.5 rounded bg-pink-650 hover:bg-pink-600 text-white font-semibold"
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
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Signature (Base64)</label>
                    <textarea
                      value={sandSig}
                      onChange={(e) => setSandSig(e.target.value)}
                      rows={4}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-[9px] break-all"
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
    </div>
  );
};

export default SignatureLab;
