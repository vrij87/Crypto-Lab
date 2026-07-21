import React, { useState } from 'react';
import {
  X,
  Hash,
  Lock,
  Key,
  FileCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface GuideStep {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  analogy: string;
  explanation: string;
  realWorldUses: { title: string; desc: string }[];
  labPath: string;
  labName: string;
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'hash',
    title: '⚡ 1. Cryptographic Hashing',
    badge: 'Digital Fingerprint',
    icon: Hash,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    analogy: '🍹 Fruit Blender Analogy',
    explanation:
      'Hashing takes any text, file, or image and converts it into a fixed-length string of characters (a hash). It is a ONE-WAY function: like blending fruit into a smoothie, you cannot reverse the hash back into the original text.',
    realWorldUses: [
      {
        title: '🔑 Password Security',
        desc: 'Websites store hashes of passwords instead of plain text. When you log in, they hash your input and check if the hash matches.',
      },
      {
        title: '📦 File Downloads & Git',
        desc: 'Git commit hashes (e.g. a95eda2) and download checksums ensure files have not been corrupted or tampered with.',
      },
    ],
    labPath: '/labs/hashing',
    labName: 'Open Hashing Lab',
  },
  {
    id: 'symmetric',
    title: '🛡️ 2. Symmetric Key Encryption',
    badge: 'Shared Secret Key',
    icon: Lock,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    analogy: '🔑 The Physical Lock & Key',
    explanation:
      'Symmetric encryption uses the SAME single secret key to both lock (encrypt) and unlock (decrypt) data. It is extremely fast and ideal for encrypting large amounts of data.',
    realWorldUses: [
      {
        title: '🌐 HTTPS Web Browsing',
        desc: 'AES-256-GCM encrypts web pages and API requests between your web browser and websites.',
      },
      {
        title: '💬 Encrypted Chat Apps',
        desc: 'WhatsApp and Signal use symmetric ciphers (AES/ChaCha20) to encrypt chat message payloads.',
      },
    ],
    labPath: '/labs/symmetric',
    labName: 'Open AES Symmetric Lab',
  },
  {
    id: 'asymmetric',
    title: '🔐 3. Asymmetric Key Encryption',
    badge: 'Public & Private Key Pair',
    icon: Key,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    analogy: '📮 The Street Mailbox',
    explanation:
      'Asymmetric encryption uses a PAIR of mathematically linked keys: a PUBLIC key (which anyone can use to deposit an encrypted message) and a PRIVATE key (which only YOU hold to unlock it).',
    realWorldUses: [
      {
        title: '🖥️ SSH Server Keys',
        desc: 'Developers log into remote cloud servers securely using RSA or Ed25519 public/private key pairs without passwords.',
      },
      {
        title: '💰 Crypto Wallets',
        desc: 'Bitcoin and Ethereum wallet addresses are derived from your public key, while your private key signs transfers.',
      },
    ],
    labPath: '/labs/asymmetric',
    labName: 'Open RSA & ECC Lab',
  },
  {
    id: 'signatures',
    title: '✍️ 4. Digital Signatures',
    badge: 'Tamper-Proof Wax Seal',
    icon: FileCheck,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    analogy: '📜 Royal Wax Stamp',
    explanation:
      'A digital signature proves WHO wrote a message (Authenticity) and guarantees that the message HAS NOT BEEN ALTERED (Integrity). You sign with your Private Key, and anyone can verify it using your Public Key.',
    realWorldUses: [
      {
        title: '💻 Software Updates',
        desc: 'Windows, macOS, and Android verify digital signatures on app installers before running them to prevent malware.',
      },
      {
        title: '📄 Legal PDF Signing',
        desc: 'DocuSign and electronic contracts use cryptographic digital signatures to legally verify identity.',
      },
    ],
    labPath: '/labs/signatures',
    labName: 'Open Digital Signature Lab',
  },
  {
    id: 'certificates',
    title: '🌐 5. SSL/TLS Certificates',
    badge: 'Digital Identity & Trust',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    analogy: '🪪 Official Passport / ID Card',
    explanation:
      'An SSL/TLS certificate is a digital passport issued by a trusted Certificate Authority (CA) that binds a website domain name (like google.com) to its public key, proving the site is authentic.',
    realWorldUses: [
      {
        title: '🔒 Browser Padlock Icon',
        desc: 'Browsers verify X.509 SSL certificates to show the green/lock icon and establish encrypted HTTPS sessions.',
      },
      {
        title: '🏢 Enterprise VPNs',
        desc: 'Companies issue client certificates to employee laptops to authenticate device identities.',
      },
    ],
    labPath: '/labs/certificates',
    labName: 'Open SSL Certificate Lab',
  },
];

export const BeginnerGuideModal: React.FC = () => {
  const { showBeginnerGuide, closeBeginnerGuide } = useProgress();
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!showBeginnerGuide) return null;

  const activeStep = GUIDE_STEPS[currentIdx];
  const StepIcon = activeStep.icon;

  const handleNext = () => {
    if (currentIdx < GUIDE_STEPS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                🌱 Beginner Cryptography Crash Course
              </h2>
              <p className="text-[11px] text-slate-400">
                Step {currentIdx + 1} of {GUIDE_STEPS.length}: {activeStep.badge}
              </p>
            </div>
          </div>

          <button
            onClick={closeBeginnerGuide}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          {GUIDE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentIdx;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentIdx(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${step.color}`} />
                <span>{step.title.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${activeStep.bgColor} ${activeStep.color} border ${activeStep.borderColor}`}
                >
                  {activeStep.badge}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {activeStep.title}
              </h3>
            </div>

            <div
              className={`p-3.5 rounded-2xl ${activeStep.bgColor} border ${activeStep.borderColor} ${activeStep.color}`}
            >
              <StepIcon className="w-8 h-8" />
            </div>
          </div>

          {/* Analogy Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>{activeStep.analogy}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mt-1">
              {activeStep.explanation}
            </p>
          </div>

          {/* Real World Uses Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Where is it used in real life?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeStep.realWorldUses.map((use, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                >
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {use.title}
                  </h5>
                  <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                    {use.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentIdx === GUIDE_STEPS.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-white transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <a
            href={activeStep.labPath}
            onClick={closeBeginnerGuide}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <span>{activeStep.labName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
