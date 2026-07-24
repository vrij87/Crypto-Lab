import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, RefreshCw, Server, ShieldCheck, Award, FileText, Lock, Unlock, 
  ChevronRight, RotateCcw, CheckCircle2, AlertTriangle, ShieldAlert,
  ArrowRight, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';

interface StepDetails {
  title: string;
  desc: string;
  sender: 'client' | 'server' | 'both' | 'none';
  packetLabel: string;
}

const HANDSHAKE_STEPS: StepDetails[] = [
  { 
    title: "0. Insecure Session", 
    desc: "Connection is unencrypted. The browser is requesting access over HTTP.",
    sender: 'none', 
    packetLabel: "" 
  },
  { 
    title: "1. Client Hello", 
    desc: "Browser initiates the handshake, offering supported TLS versions and cipher suites.",
    sender: 'client', 
    packetLabel: "ClientHello ✉️" 
  },
  { 
    title: "2. Server Hello & Certificate", 
    desc: "Server picks a cipher suite, sends its public key share, and presents its identity certificate.",
    sender: 'server', 
    packetLabel: "ServerHello + Cert 📜" 
  },
  { 
    title: "3. Key Agreement (DH Share)", 
    desc: "Browser sends its public key share. Both sides perform magic modular math to derive a shared session key.",
    sender: 'client', 
    packetLabel: "Client DH Share 🔑" 
  },
  { 
    title: "4. Change Cipher Spec", 
    desc: "Both sides confirm that all future packets will be encrypted using the negotiated session key.",
    sender: 'both', 
    packetLabel: "Finished (Encrypted) 🔒" 
  },
  { 
    title: "5. HTTPS Secured!", 
    desc: "Session established. Secure application data flows back and forth.",
    sender: 'none', 
    packetLabel: "" 
  }
];

const CertificateLab: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  
  // Tab control: 'explorer' (original) or 'handshake' (new animator)
  const [activeTab, setActiveTab] = useState<'explorer' | 'handshake'>('explorer');

  // Explorer Tab States
  const [urlInput, setUrlInput] = useState('google.com');
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handshake Tab States
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cipherChoice, setCipherChoice] = useState<string>('');
  const [cipherFeedback, setCipherFeedback] = useState<{ status: 'idle' | 'success' | 'error', msg: string }>({ status: 'idle', msg: '' });
  const [certChecks, setCertChecks] = useState({ date: false, host: false, signature: false });
  const [certVerified, setCertVerified] = useState(false);
  const [secretDerived, setSecretDerived] = useState(false);
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>(["[System] Click 'Next Step' to initiate TLS connection..."]);
  const [packetFlowing, setPacketFlowing] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markLabVisited('certificates', 'Certificate Explorer', '/labs/certificates');
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handshakeLogs]);

  // Original Certificate Explorer Action
  const analyzeCert = async () => {
    if (!urlInput) return;
    setLoading(true);
    setError(null);
    setCertData(null);
    try {
      const response = await api.post('/certificate/analyze', { url: urlInput });
      if (response.data.success) {
        setCertData(response.data);
        updateLabProgress('certificates', 100);
      } else {
        setError(response.data.error || 'Failed to parse certificate.');
      }
    } catch (e) {
      setError('Connection failed. Make sure you enter a valid domain address.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  // Handshake helper to add logs
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHandshakeLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  // Handshake Step Navigation
  const handleNextStep = () => {
    if (packetFlowing) return;
    
    const nextStep = currentStep + 1;
    if (nextStep > 5) return;

    setPacketFlowing(true);

    // Trigger animations and logs based on transition
    if (nextStep === 1) {
      addLog(">>> [Client] Building ClientHello packet...");
      addLog(">>> [Client] Offering TLS 1.3 protocol support.");
      addLog(">>> [Client] Sent Random Value: 0x5a7e9b01cd...");
      addLog(">>> [Client] Sending package: ClientHello ➔ Server");
      
      setTimeout(() => {
        setCurrentStep(1);
        setPacketFlowing(false);
        addLog("<<< [Server] ClientHello received.");
      }, 1000);
    } 
    
    else if (nextStep === 2) {
      addLog(">>> [Server] Selecting cipher suite from Client's list...");
      addLog(">>> [Server] Building ServerHello + Certificate chain...");
      addLog(">>> [Server] Sending package: ServerHello + Cert ➔ Client");
      
      setTimeout(() => {
        setCurrentStep(2);
        setPacketFlowing(false);
        addLog("<<< [Client] Received ServerHello and certificate payload.");
        addLog("[System] INTERACTION REQUIRED: Negotiate Cipher Suite and Verify Certificate Trust!");
      }, 1000);
    } 
    
    else if (nextStep === 3) {
      if (cipherChoice !== 'TLS_AES_256_GCM_SHA384') {
        setPacketFlowing(false);
        alert("You must choose a cryptographically secure cipher suite to negotiate connection!");
        return;
      }
      if (!certVerified) {
        setPacketFlowing(false);
        alert("You must verify all certificate safety trust checks before exchanging key shares!");
        return;
      }

      addLog(">>> [Client] Certificate validated successfully.");
      addLog(">>> [Client] Sending Key Exchange payload: Client DH share ➔ Server");

      setTimeout(() => {
        setCurrentStep(3);
        setPacketFlowing(false);
        addLog("<<< [Server] Received client DH share. Ready to derive keys.");
        addLog("[System] INTERACTION REQUIRED: Perform Diffie-Hellman Math to derive the Session Key.");
      }, 1000);
    } 
    
    else if (nextStep === 4) {
      if (!secretDerived) {
        setPacketFlowing(false);
        alert("You must derive the shared session secret key first!");
        return;
      }

      addLog(">>> [Client] Sending ChangeCipherSpec: future packets will be encrypted...");
      addLog(">>> [Client] Sent Finished payload ➔ Server");

      setTimeout(() => {
        addLog("<<< [Server] Server derived matching session key.");
        addLog(">>> [Server] Sending ChangeCipherSpec + Finished ➔ Client");
        
        setTimeout(() => {
          setCurrentStep(4);
          setPacketFlowing(false);
          addLog("<<< [Client] Handshake Finished! Encrypted channel is active.");
        }, 800);
      }, 800);
    } 
    
    else if (nextStep === 5) {
      addLog(">>> [Client] Secure HTTP request (GET /index.html) sent.");
      
      setTimeout(() => {
        setCurrentStep(5);
        setPacketFlowing(false);
        addLog("<<< [Server] decrypted request successfully, sending HTTP 200 OK.");
        addLog("🎉 [Secure Session Secured] TLS 1.3 Handshake completed successfully!");
        updateLabProgress('certificates', 100);
      }, 1000);
    }
  };

  const handlePrevStep = () => {
    if (currentStep <= 0) return;
    const prev = currentStep - 1;
    setCurrentStep(prev);
    addLog(`[System] Reset back to Step ${prev}.`);
    
    if (prev < 2) {
      setCipherChoice('');
      setCipherFeedback({ status: 'idle', msg: '' });
      setCertChecks({ date: false, host: false, signature: false });
      setCertVerified(false);
    }
    if (prev < 3) {
      setSecretDerived(false);
    }
  };

  const resetHandshake = () => {
    setCurrentStep(0);
    setCipherChoice('');
    setCipherFeedback({ status: 'idle', msg: '' });
    setCertChecks({ date: false, host: false, signature: false });
    setCertVerified(false);
    setSecretDerived(false);
    setHandshakeLogs(["[System] Connection reset. Click 'Next Step' to begin..."]);
    setPacketFlowing(false);
  };

  // Step 2 Action: Select Cipher Suite
  const selectCipherSuite = (suite: string) => {
    if (suite === 'TLS_AES_256_GCM_SHA384') {
      setCipherChoice(suite);
      setCipherFeedback({
        status: 'success',
        msg: 'Perfect Choice! TLS 1.3 AES-GCM offers modern authenticated encryption (AEAD) and Forward Secrecy.'
      });
      addLog(`[Client] Negotiated cipher suite: ${suite}`);
    } else if (suite === 'TLS_RSA_WITH_3DES_EDE_CBC_SHA') {
      setCipherFeedback({
        status: 'error',
        msg: 'Insecure! 3DES is slow and vulnerable to Sweet32 attacks. Plain RSA key exchange does not provide Forward Secrecy.'
      });
      addLog("[Warning] Chosen suite TLS_RSA_WITH_3DES_EDE_CBC_SHA is legacy. Rejected!");
    } else {
      setCipherFeedback({
        status: 'error',
        msg: 'CBC cipher modes are vulnerable to padding oracle attacks. Choose GCM mode instead.'
      });
      addLog(`[Warning] Chosen suite ${suite} is vulnerable to BEAST/Padding checks. Rejected!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Page Title & Navigation Tabs */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-400" />
            Certificate Explorer & TLS Lab
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Retrieve X.509 certificates from domains or step through interactive TLS handshake packet flows.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'explorer' 
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            1. Certificate Explorer
          </button>
          <button
            onClick={() => setActiveTab('handshake')}
            className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'handshake' 
                ? 'bg-emerald-600 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            2. TLS Handshake Animator
          </button>
        </div>
      </div>

      {/* ELI5 Banner */}
      <Eli5Banner
        title={activeTab === 'explorer' ? "Understanding Certificate Chains" : "Understanding the SSL/TLS Handshake"}
        analogyTitle={activeTab === 'explorer' ? "The Passport Chain of Trust" : "The Secure Meeting Handshake"}
        analogyDescription={
          activeTab === 'explorer' 
            ? "When a web server shows you its SSL certificate, it's like showing a passport. The browser trusts the passport because it was signed by a government agency (Intermediate CA), which in turn was authorized by a global federation (Root CA) that your browser already knows and trust."
            : "Imagine meeting a courier. First, you say hello and ask which language to use (ClientHello). The courier shows their badge (Certificate). You both calculate a secret code by mixing colors (Diffie-Hellman). Once calculated, you lock the briefcase and speak only using the code (Encrypted Session)."
        }
        bulletPoints={
          activeTab === 'explorer' 
            ? [
                "Common Name (CN): The exact website domain name the certificate belongs to.",
                "Issuer: The Certificate Authority (CA) that validated the server's identity and signed the card.",
                "Root Certificate Stores: Hardcoded certificates preloaded into your operating system to anchor safety trust."
              ]
            : [
                "Asymmetric Phase: Used to verify server identity (Certificates) and exchange key shares securely.",
                "Diffie-Hellman math: Generates a temporary, shared symmetric key without sending the actual key over the wire.",
                "Symmetric Phase: Once session keys match, high-speed authenticated encryption (AES-GCM) protects the actual messages."
              ]
        }
      />

      {/* TAB 1: CERTIFICATE EXPLORER (Original) */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Domain lookup and outputs (Cols 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Lookup Card */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4">Analyze HTTPS Certificate</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. google.com, github.com"
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 pl-10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <Globe className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
                </div>
                <button
                  onClick={analyzeCert}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Analyze Domain
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-450 leading-relaxed font-bold">
                  [ERROR] {error}
                </div>
              )}
            </div>

            {/* Certificate Output Details */}
            {certData && (
              <div className="space-y-6">
                
                {/* Trust Badge Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 flex items-center space-x-3 border-l-4 border-l-emerald-500">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Certificate Status</span>
                      <span className="text-xs font-bold text-white">{certData.is_valid ? 'Valid / Trusted' : 'Expired / Untrusted'}</span>
                    </div>
                  </div>
                  <div className="glass-panel p-4 flex items-center space-x-3 border-l-4 border-l-cyan-500">
                    <Lock className="w-8 h-8 text-cyan-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Negotiated TLS</span>
                      <span className="text-xs font-bold text-white font-mono">{certData.tls_version}</span>
                    </div>
                  </div>
                  <div className="glass-panel p-4 flex items-center space-x-3 border-l-4 border-l-purple-500">
                    <Award className="w-8 h-8 text-purple-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-500 block">Days to Expiration</span>
                      <span className="text-xs font-bold text-white font-mono">{certData.days_remaining} Days</span>
                    </div>
                  </div>
                </div>

                {/* Certificate Sheet info */}
                <div className="glass-panel p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Certificate Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                    
                    {/* Subject and Issuer info */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Common Name (Domain Subject)</span>
                        <span className="text-white text-sm font-bold bg-cyber-darker p-2 rounded border border-gray-850 block">{certData.subject_cn}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Issuer Authority (Intermediate CA)</span>
                        <span className="text-cyan-400 text-sm font-bold bg-cyber-darker p-2 rounded border border-gray-850 block">{certData.issuer_cn}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Issuer Organization</span>
                        <span className="text-white text-sm bg-cyber-darker p-2 rounded border border-gray-850 block">{certData.issuer_org}</span>
                      </div>
                    </div>

                    {/* Date fields and Metadata */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Valid From (Activation Date)</span>
                        <span className="text-white bg-cyber-darker p-2 rounded border border-gray-850 block">{formatDate(certData.not_before)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Valid Until (Expiry Date)</span>
                        <span className="text-white bg-cyber-darker p-2 rounded border border-gray-850 block">{formatDate(certData.not_after)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase block mb-1">Cipher Suite Negotiated</span>
                        <span className="text-purple-400 bg-cyber-darker p-2 rounded border border-gray-850 block break-all text-[10px] leading-relaxed">
                          {certData.cipher_suite} ({certData.cipher_bits} bits)
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Subject Alternative Names */}
                  {certData.subject_alt_names && certData.subject_alt_names.length > 0 && (
                    <div className="pt-4 border-t border-gray-850">
                      <span className="text-xs text-gray-500 font-mono uppercase block mb-2">Subject Alternative Names (SANs)</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-cyber-darker p-3 rounded-lg border border-gray-850">
                        {certData.subject_alt_names.map((san: string) => (
                          <span key={san} className="text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded">
                            {san}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Chain / Trust Hierarchy */}
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white mb-2">Certificate Chain / Trust Hierarchy</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    How trust is checked: Browsers have standard Root certificates hardcoded. When visiting a site, the server presents a certificate signed by an Intermediate Authority, which in turn is signed by a Root Authority.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center p-6 bg-cyber-darker rounded-lg border border-gray-800 gap-4 sm:gap-0">
                    <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 p-3 rounded text-xs font-mono text-center max-w-[150px] w-full">
                      <span className="font-bold block">Root Authority</span>
                      <span className="text-[9px] opacity-60">e.g. DigiCert Root</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 rotate-90 sm:rotate-0" />
                    <div className="bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 p-3 rounded text-xs font-mono text-center max-w-[170px] w-full">
                      <span className="font-bold block">Intermediate CA</span>
                      <span className="text-[9px] opacity-60">e.g. {certData.issuer_org}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 rotate-90 sm:rotate-0" />
                    <div className="bg-gray-900 border border-gray-700 text-white p-3 rounded text-xs font-mono text-center max-w-[180px] w-full">
                      <span className="font-bold block">{certData.subject_cn}</span>
                      <span className="text-[9px] opacity-60">Target Domain Certificate</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Info Sidebar (Cols 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 space-y-6 bg-gradient-to-b from-gray-900/40 to-cyber-bg text-xs leading-relaxed">
              <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                HTTPS & TLS Basics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white mb-1">What is TLS?</h4>
                  <p className="text-gray-400 font-sans leading-relaxed">
                    TLS (Transport Layer Security) is the cryptographic protocol replacing SSL. It encrypts communication over a computer network to secure HTTPS, email, and instant messaging.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-1">The Handshake</h4>
                  <p className="text-gray-400 font-sans leading-relaxed">
                    Before data is exchanged, a client and server agree on key sizes, verify certificate trust chains, and derive asymmetric keys via Diffie-Hellman key exchanges.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">Why Certificates Expire</h4>
                  <p className="text-gray-400 font-sans leading-relaxed">
                    SSL certificates expire within 398 days to guarantee keys are updated and cryptographic parameters match modern security margins against hardware advances.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE HANDSHAKE SIMULATOR (New Feature) */}
      {activeTab === 'handshake' && (
        <div className="space-y-8">
          
          {/* Timeline Selector Progress Indicator */}
          <div className="glass-panel p-4 flex flex-wrap md:flex-nowrap justify-between gap-2 overflow-x-auto">
            {HANDSHAKE_STEPS.map((s, idx) => (
              <div 
                key={idx}
                className={`flex-1 min-w-[130px] p-2 rounded-lg border text-center transition-all ${
                  idx === currentStep 
                    ? 'bg-emerald-950/20 border-emerald-500 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : idx < currentStep
                      ? 'bg-gray-900 border-gray-850 text-emerald-500'
                      : 'bg-cyber-darker/40 border-gray-900 text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
                  {idx < currentStep ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] w-4 h-4 rounded-full border border-current inline-flex items-center justify-center flex-shrink-0">{idx}</span>
                  )}
                  <span>{s.title.split('. ')[1]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Core Animation Stage Panel */}
          <div className="glass-panel p-8 relative overflow-hidden">
            {/* Visual background grids */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center justify-center relative min-h-[220px] z-10">
              
              {/* Node 1: Client Web Browser */}
              <div className="md:col-span-4 flex flex-col items-center">
                <motion.div 
                  animate={{ 
                    scale: currentStep === 5 ? [1, 1.05, 1] : 1,
                    borderColor: currentStep === 5 ? "#10b981" : "#374151"
                  }}
                  transition={{ repeat: currentStep === 5 ? Infinity : 0, duration: 2 }}
                  className="w-full max-w-[240px] bg-cyber-darker border border-gray-800 rounded-xl overflow-hidden shadow-2xl"
                >
                  {/* Browser window top bar */}
                  <div className="bg-gray-900 px-3 py-2 flex items-center gap-1.5 border-b border-gray-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="ml-4 flex-grow bg-cyber-darker rounded px-2 py-0.5 text-[9px] font-mono text-gray-500 truncate flex items-center gap-1.5">
                      {currentStep === 5 ? (
                        <>
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">https://</span>
                          <span className="text-gray-300">secure-server.com</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span className="text-rose-500">http://</span>
                          <span className="text-gray-400">secure-server.com</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Browser Content preview */}
                  <div className="p-4 flex flex-col items-center justify-center min-h-[90px] text-center">
                    <span className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Local Browser</span>
                    {currentStep === 5 ? (
                      <div className="text-emerald-400 flex flex-col items-center gap-1 animate-fade-in">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <span className="text-[11px] font-bold">Secure HTTPS Webpage Load</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center gap-1">
                        <Globe className="w-8 h-8 text-gray-600 animate-spin-slow" />
                        <span className="text-[10px]">Unsecured Connection</span>
                      </div>
                    )}
                  </div>
                </motion.div>
                <span className="mt-2 text-xs font-mono text-gray-400">Client Node</span>
              </div>

              {/* Central Connection Cable Line Track */}
              <div className="md:col-span-4 h-16 md:h-full relative flex items-center justify-center">
                {/* Visual cable connection */}
                <div className={`w-1 bg-gray-800 h-full absolute md:w-full md:h-1 transition-all duration-1000 ${
                  currentStep >= 4 
                    ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]' 
                    : 'bg-gray-800'
                }`} />

                {/* Packet Animation (Framer Motion) */}
                <AnimatePresence>
                  {packetFlowing && HANDSHAKE_STEPS[currentStep + 1] && (
                    <motion.div
                      initial={{ 
                        left: HANDSHAKE_STEPS[currentStep + 1].sender === 'client' ? '0%' : '100%',
                        x: HANDSHAKE_STEPS[currentStep + 1].sender === 'client' ? -40 : 40,
                        opacity: 0 
                      }}
                      animate={{ 
                        left: HANDSHAKE_STEPS[currentStep + 1].sender === 'client' ? '100%' : '0%',
                        x: HANDSHAKE_STEPS[currentStep + 1].sender === 'client' ? 40 : -40,
                        opacity: 1 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/40 text-white text-[9px] font-bold font-mono rounded-full shadow-lg z-20 whitespace-nowrap"
                    >
                      {HANDSHAKE_STEPS[currentStep + 1].packetLabel}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glowing Encryption Lock overlay in step 4/5 */}
                {currentStep >= 4 && !packetFlowing && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-full text-emerald-400 z-10 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                  >
                    <Lock className="w-5 h-5 animate-pulse" />
                  </motion.div>
                )}
              </div>

              {/* Node 2: Web Server */}
              <div className="md:col-span-4 flex flex-col items-center">
                <motion.div 
                  animate={{ 
                    borderColor: currentStep >= 4 ? "#10b981" : "#374151"
                  }}
                  className="w-full max-w-[240px] bg-cyber-darker border border-gray-800 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-between"
                >
                  <Server className="w-10 h-10 text-gray-500 mb-2" />
                  
                  {/* Blinking LEDs representation */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  </div>

                  <div className="text-center font-mono text-[10px] text-gray-500 space-y-1">
                    <p className="text-white font-bold">TLS-Capable Web Server</p>
                    <p className="text-gray-500">Port 443 active</p>
                  </div>
                </motion.div>
                <span className="mt-2 text-xs font-mono text-gray-400">Server Node</span>
              </div>

            </div>

            {/* Instruction description card for active step */}
            <div className="mt-8 bg-cyber-darker p-4 rounded-xl border border-gray-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Current Step: {HANDSHAKE_STEPS[currentStep].title}</span>
              <p className="text-sm font-bold text-white mt-1">{HANDSHAKE_STEPS[currentStep].desc}</p>
            </div>

          </div>

          {/* Interactive Mini-Games / Checks Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Step-specific interaction controls (Cols 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STEP 2 INTERACTIVES: Cipher Match & Certificate Verify */}
              {currentStep === 2 && (
                <div className="glass-panel p-6 space-y-6 animate-fade-in">
                  <h3 className="text-base font-bold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Interactive verification checkpoint
                  </h3>

                  {/* Part 1: Cipher negotiation */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono uppercase text-gray-400">
                      1. Negotiate Cipher Suite
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      The server presented 3 matches. Click to negotiate a modern secure cipher suite:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => selectCipherSuite('TLS_RSA_WITH_3DES_EDE_CBC_SHA')}
                        className={`p-2.5 rounded border text-[10px] font-mono text-center transition-colors cursor-pointer ${
                          cipherChoice === 'TLS_RSA_WITH_3DES_EDE_CBC_SHA'
                            ? 'bg-rose-950/20 border-rose-500 text-rose-400'
                            : 'bg-cyber-dark border-gray-850 hover:border-rose-900/50 text-gray-400'
                        }`}
                      >
                        TLS_RSA_WITH_3DES_EDE_CBC_SHA
                      </button>

                      <button
                        onClick={() => selectCipherSuite('TLS_AES_256_GCM_SHA384')}
                        className={`p-2.5 rounded border text-[10px] font-mono text-center transition-colors cursor-pointer ${
                          cipherChoice === 'TLS_AES_256_GCM_SHA384'
                            ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-cyber-dark border-gray-850 hover:border-emerald-900/50 text-gray-400'
                        }`}
                      >
                        TLS_AES_256_GCM_SHA384
                      </button>

                      <button
                        onClick={() => selectCipherSuite('TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256')}
                        className={`p-2.5 rounded border text-[10px] font-mono text-center transition-colors cursor-pointer ${
                          cipherChoice === 'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256'
                            ? 'bg-rose-950/20 border-rose-500 text-rose-400'
                            : 'bg-cyber-dark border-gray-850 hover:border-rose-900/50 text-gray-400'
                        }`}
                      >
                        TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256
                      </button>
                    </div>

                    {cipherFeedback.msg && (
                      <div className={`p-3 rounded text-xs flex items-start gap-2 ${
                        cipherFeedback.status === 'success' 
                          ? 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-450' 
                          : 'bg-rose-950/20 border border-rose-900/30 text-rose-450'
                      }`}>
                        {cipherFeedback.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{cipherFeedback.msg}</span>
                      </div>
                    )}
                  </div>

                  {/* Part 2: Cert Trust Checklist */}
                  <div className="space-y-3 pt-4 border-t border-gray-850">
                    <label className="block text-xs font-mono uppercase text-gray-400">
                      2. Certificate Trust Checks
                    </label>
                    <p className="text-xs text-gray-500">
                      Simulate the browser's certificate engine. Check the elements to verify trust:
                    </p>

                    <div className="space-y-2 bg-cyber-darker p-4 rounded-xl border border-gray-850">
                      <label className="flex items-center gap-3 text-xs text-gray-300 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={certChecks.date}
                          onChange={(e) => setCertChecks(prev => ({ ...prev, date: e.target.checked }))}
                          className="rounded border-gray-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-cyber-dark"
                        />
                        <div>
                          <span className="font-bold block">Check Expiration Dates</span>
                          <span className="text-[10px] text-gray-500">Asserts current date falls inside the NotBefore / NotAfter range.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 text-xs text-gray-300 select-none cursor-pointer pt-3 border-t border-gray-900">
                        <input
                          type="checkbox"
                          checked={certChecks.host}
                          onChange={(e) => setCertChecks(prev => ({ ...prev, host: e.target.checked }))}
                          className="rounded border-gray-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-cyber-dark"
                        />
                        <div>
                          <span className="font-bold block">Match Domain Name</span>
                          <span className="text-[10px] text-gray-500">Matches the request domain (secure-server.com) to the Subject Common Name.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 text-xs text-gray-300 select-none cursor-pointer pt-3 border-t border-gray-900">
                        <input
                          type="checkbox"
                          checked={certChecks.signature}
                          onChange={(e) => setCertChecks(prev => ({ ...prev, signature: e.target.checked }))}
                          className="rounded border-gray-800 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-cyber-dark"
                        />
                        <div>
                          <span className="font-bold block">Verify Signature Trust Chain</span>
                          <span className="text-[10px] text-gray-500">Validates cryptographically that the certificate issuer signature stems from a trusted CA.</span>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        if (certChecks.date && certChecks.host && certChecks.signature) {
                          setCertVerified(true);
                          addLog("[Client] Certificate validated. Verification check completed.");
                        } else {
                          alert("You must check all validation boxes first to assert safety!");
                        }
                      }}
                      disabled={certVerified}
                      className={`w-full py-2.5 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
                        certVerified
                          ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {certVerified ? '✔ Certificate Trust Verified' : 'Verify Certificate Validity'}
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3 INTERACTIVES: DH Key derivation mathematical game */}
              {currentStep === 3 && (
                <div className="glass-panel p-6 space-y-6 animate-fade-in">
                  <h3 className="text-base font-bold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Diffie-Hellman Key Exchange Math
                  </h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Instead of sending encryption keys across the wire, both nodes calculate it locally using prime factors.
                  </p>

                  {/* Math Formula steps representation */}
                  <div className="bg-cyber-darker p-4 rounded-xl border border-gray-850 space-y-4 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-850 pb-4">
                      <div>
                        <span className="text-[10px] uppercase block text-purple-400 mb-1">Client calculation</span>
                        <p className="text-white">Secret factor a = <span className="font-bold">6</span></p>
                        <p className="text-gray-500 text-[10px] mt-1">Computes share A = g^a mod p</p>
                        <p className="text-white bg-cyber-dark px-2 py-1 rounded mt-1 border border-gray-900 inline-block">5^6 mod 23 = <span className="text-purple-400 font-bold">8</span></p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase block text-purple-400 mb-1">Server calculation</span>
                        <p className="text-white">Secret factor b = <span className="font-bold">8</span></p>
                        <p className="text-gray-500 text-[10px] mt-1">Computes share B = g^b mod p</p>
                        <p className="text-white bg-cyber-dark px-2 py-1 rounded mt-1 border border-gray-900 inline-block">5^8 mod 23 = <span className="text-purple-400 font-bold">16</span></p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase block text-emerald-400 mb-1">Derived Symmetric Secret S</span>
                      <p className="text-gray-400 leading-relaxed mb-3">
                        They swap public shares (<span className="text-purple-400">8</span> and <span className="text-purple-400">16</span>) and combine them with their private numbers:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-cyber-dark p-3 rounded border border-gray-900">
                          <p className="text-gray-500 text-[10px]">Client S = B^a mod p</p>
                          <p className="text-white font-bold mt-1">16^6 mod 23 = <span className="text-emerald-400 font-bold text-sm">9</span></p>
                        </div>
                        <div className="bg-cyber-dark p-3 rounded border border-gray-900">
                          <p className="text-gray-500 text-[10px]">Server S = A^b mod p</p>
                          <p className="text-white font-bold mt-1">8^8 mod 23 = <span className="text-emerald-400 font-bold text-sm">9</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSecretDerived(true);
                      addLog(">>> [Client & Server] Deriving master session key. Shared key computed: 0x09");
                      addLog(">>> [Client & Server] Deriving encryption keys: AES_256_GCM active.");
                    }}
                    disabled={secretDerived}
                    className={`w-full py-2.5 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
                      secretDerived 
                        ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {secretDerived ? '✔ Session Key 0x09 Derived!' : 'Compute Symmetric Session Key'}
                  </button>

                </div>
              )}

              {/* GENERAL ACTION CONTROLS */}
              <div className="glass-panel p-6 flex items-center justify-between gap-4">
                <button
                  onClick={resetHandshake}
                  className="inline-flex items-center px-4 py-2.5 rounded bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Reset
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep <= 0 || packetFlowing}
                    className="inline-flex items-center px-4 py-2.5 rounded bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStep >= 5 || packetFlowing}
                    className="inline-flex items-center px-5 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-50 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Box: Developer Log Terminal (Cols 5) */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="glass-panel border-gray-800/80 bg-black flex-grow flex flex-col rounded-xl overflow-hidden min-h-[300px] h-[380px] shadow-2xl">
                {/* Console header */}
                <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-900 flex items-center justify-between flex-shrink-0">
                  <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-bold">Local Connection Console Log</span>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                  </div>
                </div>
                {/* Console Lines output */}
                <div className="p-4 font-mono text-[10px] overflow-y-auto flex-grow space-y-2 text-emerald-500/80 select-all leading-relaxed">
                  {handshakeLogs.map((log, index) => {
                    let color = "text-emerald-500/80";
                    if (log.includes("[System]")) color = "text-cyan-400";
                    if (log.includes("[Warning]")) color = "text-amber-400 font-bold";
                    if (log.includes("[ERROR]")) color = "text-rose-400 font-bold";
                    if (log.includes("completed") || log.includes("Secured")) color = "text-emerald-400 font-extrabold";
                    
                    return (
                      <div key={index} className={color}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Shared Footer Informational Card */}
      <div className="mt-8">
        <RealWorldUsesCard
          title="Where are X.509 Certificates & TLS Handshakes Used?"
          subtitle="Public key certificates establish trust and identity across websites, mobile apps, and enterprise networks."
          items={[
            {
              title: "Browser HTTPS Padlock Icon",
              description: "Web browsers verify X.509 certificates issued by trusted Certificate Authorities (DigiCert, Let's Encrypt) before displaying HTTPS connection security.",
              example: "Issued by: Let's Encrypt Authority X3",
              badge: "Web Security"
            },
            {
              title: "Enterprise VPN & Zero Trust",
              description: "Corporate networks issue client X.509 certificates to employee laptops to authenticate device identities (mTLS) before granting network access.",
              example: "Mutual TLS (mTLS) Client Certs",
              badge: "Enterprise Networks"
            },
            {
              title: "Apple & Android App Store Signing",
              description: "Mobile apps compiled for iOS and Android must be signed with valid X.509 developer certificates to execute on mobile hardware.",
              example: "Apple Worldwide Developer CA",
              badge: "App Distribution"
            }
          ]}
        />
      </div>

    </div>
  );
};

export default CertificateLab;
