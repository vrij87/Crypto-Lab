import React from 'react';
import { Lightbulb, Sparkles, HelpCircle } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface Eli5BannerProps {
  title: string;
  analogyTitle: string;
  analogyDescription: string;
  bulletPoints?: string[];
  icon?: React.ReactNode;
}

export const Eli5Banner: React.FC<Eli5BannerProps> = ({
  title,
  analogyTitle,
  analogyDescription,
  bulletPoints = [],
  icon,
}) => {
  const { isEli5Mode, toggleEli5Mode } = useProgress();

  if (!isEli5Mode) {
    return (
      <div className="my-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between transition-all">
        <div className="flex items-center space-x-3 text-amber-300 text-xs">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            New to cryptography? Enable <strong>ELI5 Mode</strong> for simple physical-world analogies!
          </span>
        </div>
        <button
          onClick={toggleEli5Mode}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-semibold text-xs flex items-center space-x-1.5 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Enable ELI5 Mode 🐣</span>
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/30 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] relative overflow-hidden animate-fade-in">
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            {icon || <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                🐣 ELI5 Mode Active
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            </div>
            <p className="text-xs text-amber-200/90 font-medium mt-0.5">
              Physical Analogy: <span className="text-amber-300 font-bold">{analogyTitle}</span>
            </p>
          </div>
        </div>

        <button
          onClick={toggleEli5Mode}
          className="text-xs text-amber-400/80 hover:text-amber-200 underline flex items-center space-x-1 transition-colors"
          title="Switch to Technical View"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Switch to Standard View</span>
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-amber-500/20">
        {analogyDescription}
      </p>

      {bulletPoints.length > 0 && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {bulletPoints.map((pt, i) => (
            <div key={i} className="flex items-center space-x-2 text-[11px] text-amber-200/90">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
