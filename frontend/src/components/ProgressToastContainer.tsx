import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, CheckCircle, X } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const ProgressToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useProgress();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[150] flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          let icon = <Sparkles className="w-5 h-5 text-cyan-400" />;
          let border = 'border-cyan-500/40 bg-cyan-950/80 shadow-[0_0_20px_rgba(6,182,212,0.25)]';

          if (notif.type === 'level') {
            icon = <Trophy className="w-5 h-5 text-amber-400" />;
            border = 'border-amber-500/40 bg-gray-900/90 shadow-[0_0_20px_rgba(245,158,11,0.25)]';
          } else if (notif.type === 'lab') {
            icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
            border = 'border-emerald-500/40 bg-gray-900/90 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
          } else if (notif.type === 'algorithm') {
            icon = <Zap className="w-5 h-5 text-purple-400" />;
            border = 'border-purple-500/40 bg-gray-900/90 shadow-[0_0_20px_rgba(168,85,247,0.25)]';
          }

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-xl flex items-start space-x-3 text-white ${border}`}
            >
              <div className="p-2 rounded-lg bg-gray-800/80 flex-shrink-0 mt-0.5">{icon}</div>

              <div className="flex-grow min-w-0">
                <h4 className="text-xs font-bold tracking-tight text-white">{notif.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{notif.message}</p>
              </div>

              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-gray-400 hover:text-white p-1 rounded-md transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ProgressToastContainer;
