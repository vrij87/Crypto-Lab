import React, { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface Eli5TooltipProps {
  term: string;
  simpleExplanation: string;
  analogy?: string;
}

export const Eli5Tooltip: React.FC<Eli5TooltipProps> = ({ term, simpleExplanation, analogy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isEli5Mode } = useProgress();

  return (
    <span className="relative inline-block ml-1.5 align-middle">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`p-0.5 rounded-full transition-all flex items-center justify-center ${
          isEli5Mode
            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 ring-1 ring-amber-500/40 animate-pulse'
            : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
        }`}
        title={`What is ${term}?`}
      >
        {isEli5Mode ? (
          <span className="text-[10px] px-1 font-bold">🐣</span>
        ) : (
          <HelpCircle className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-xl bg-[#0b0e24] border border-amber-500/40 shadow-2xl z-50 text-left text-xs space-y-1.5 animate-fade-in pointer-events-none">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold border-b border-amber-500/20 pb-1">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>ELI5: {term}</span>
          </div>
          <p className="text-gray-200 text-[11px] leading-relaxed">{simpleExplanation}</p>
          {analogy && (
            <div className="text-[10px] text-amber-300/90 italic bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
              💡 Analogy: {analogy}
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0b0e24]" />
        </div>
      )}
    </span>
  );
};
