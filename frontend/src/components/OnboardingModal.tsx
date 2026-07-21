import React from 'react';
import { Sparkles, BookOpen, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

export const OnboardingModal: React.FC = () => {
  const {
    showOnboardingModal,
    closeOnboardingModal,
    setUserLevel,
    openBeginnerGuide,
  } = useProgress();

  if (!showOnboardingModal) return null;

  const handleSelectLevel = (level: 'beginner' | 'intermediate') => {
    setUserLevel(level);
    closeOnboardingModal();
    if (level === 'beginner') {
      openBeginnerGuide();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glowing Background Accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to CryptoLab
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Choose Your Learning Path
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Select your experience level so we can tailor the interface and guide you through ciphers effectively.
          </p>
        </div>

        {/* 2 Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Beginner Choice */}
          <button
            onClick={() => handleSelectLevel('beginner')}
            className="group relative text-left p-6 rounded-xl bg-slate-950/70 border border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-950/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Recommended
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                🌱 Beginner
              </h3>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                I'm new to cryptography! Explain all key concepts using simple terms, everyday analogies, and real-world uses.
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>5-Step Beginner Crash Course</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Simple Everyday Analogies</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Real-World Application Cards</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Start Beginner Guide</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Intermediate Choice */}
          <button
            onClick={() => handleSelectLevel('intermediate')}
            className="group relative text-left p-6 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-400 hover:bg-slate-950/90 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  Advanced
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                🚀 Intermediate / Pro
              </h3>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                I already know the basics! Take me directly to the interactive cipher laboratories, state matrix visualizers, and APIs.
              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Direct Access to all 8 Labs</span>
                </li>
                <li className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Full Key/IV Parameter Control</span>
                </li>
                <li className="flex items-center gap-2 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>AES Round State Explorer</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Jump to Interactive Labs</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-500">
            You can change your level anytime using the badge in the top navbar.
          </p>
        </div>
      </div>
    </div>
  );
};
