import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Server, ShieldCheck, Award, FileText, Lock, ChevronRight } from 'lucide-react';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';

const CertificateLab: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  const [urlInput, setUrlInput] = useState('google.com');
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    markLabVisited('certificates', 'Certificate Explorer', '/labs/certificates');
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8 text-emerald-400" />
          Certificate Explorer & TLS Lab
        </h1>
        <p className="mt-1 text-gray-400 text-sm">
          Retrieve, decode, and analyze SSL/TLS certificate chains of any live HTTPS domain.
        </p>
      </div>

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
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
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

              {/* Handshake Flow diagram */}
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
                <p className="text-gray-400">
                  TLS (Transport Layer Security) is the cryptographic protocol replacing SSL. It encrypts communication over a computer network to secure HTTPS, email, and instant messaging.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-1">The Handshake</h4>
                <p className="text-gray-400">
                  Before data is exchanged, a client and server agree on key sizes, verify certificate trust chains, and derive asymmetric keys via Diffie-Hellman key exchanges.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Why Certificates Expire</h4>
                <p className="text-gray-400">
                  SSL certificates expire within 398 days to guarantee keys are updated and cryptographic parameters match modern security margins against hardware advances.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where are X.509 Certificates Used in Real Life?"
        subtitle="X.509 public key certificates establish trust and identity across websites, mobile apps, and enterprise networks."
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
  );
};

export default CertificateLab;
