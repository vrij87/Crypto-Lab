import React from 'react';
import { Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface UseCaseItem {
  icon?: React.ElementType;
  title: string;
  description: string;
  example: string;
  badge?: string;
}

interface RealWorldUsesCardProps {
  title: string;
  subtitle?: string;
  items: UseCaseItem[];
}

export const RealWorldUsesCard: React.FC<RealWorldUsesCardProps> = ({
  title,
  subtitle = "Discover how this cryptographic primitive protects systems you interact with daily.",
  items,
}) => {
  return (
    <div className="mt-10 rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-emerald-950/10 transition-all hover:border-emerald-500/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            🌍 {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon || ShieldCheck;
          return (
            <div
              key={idx}
              className="group relative rounded-xl bg-slate-950/60 border border-slate-800 p-4 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-slate-800/80 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-semibold text-sm text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{item.example}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
