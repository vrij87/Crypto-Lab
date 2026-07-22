import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, ToggleLeft, ToggleRight, Compass, Terminal, Shield, User, ArrowRight
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';

interface OptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OptionsDrawer: React.FC<OptionsDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    openDrawer: openJourneyDrawer,
    progress,
    isEli5Mode,
    toggleEli5Mode,
    userLevel,
    openOnboardingModal,
    openBeginnerGuide,
  } = useProgress();

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const triggerJourney = () => {
    onClose();
    // Small delay to let the options drawer slide out first
    setTimeout(() => {
      openJourneyDrawer();
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-start overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full sm:w-[360px] h-full bg-[#060816]/95 backdrop-blur-2xl border-r border-cyan-500/20 shadow-[5px_0_50px_rgba(6,182,212,0.1)] flex flex-col z-[101] text-gray-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-800/80 bg-gray-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm uppercase tracking-widest bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                  Control Center
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scroll Body */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6">
              
              {/* 1. Beginner Course / Pro Mode switcher */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Learning Experience
                </span>
                <button
                  onClick={() => {
                    onClose();
                    userLevel === 'beginner' ? openBeginnerGuide() : openOnboardingModal();
                  }}
                  className="w-full text-left p-4 rounded-xl bg-cyber-darker border border-gray-850 hover:border-emerald-500/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {userLevel === 'beginner' ? '🌱 Beginner Course' : '🚀 Mode: Pro'}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {userLevel === 'beginner' ? 'Open interactive guides' : 'Change experience level'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* 2. ELI5 Toggle Button */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Simplification Mode
                </span>
                <button
                  onClick={toggleEli5Mode}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isEli5Mode 
                      ? 'bg-amber-500/5 border-amber-500/30' 
                      : 'bg-cyber-darker border-gray-850 hover:border-amber-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isEli5Mode ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                      <span className="text-sm leading-none">🐣</span>
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold transition-colors ${isEli5Mode ? 'text-amber-400' : 'text-white'}`}>
                        ELI5 Mode
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Explain ciphers with simple analogies
                      </p>
                    </div>
                  </div>
                  {isEli5Mode ? (
                    <ToggleRight className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>

              {/* 3. My Journey Progress Tracker */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Milestones & Badges
                </span>
                <button
                  onClick={triggerJourney}
                  className="w-full text-left p-4 rounded-xl bg-cyber-darker border border-gray-850 hover:border-cyan-500/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        My Learning Journey
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Level roadmap & achievements
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold border border-cyan-500/30">
                    {progress.overallPercentage}%
                  </span>
                </button>
              </div>

              {/* 4. Challenges Quick Button */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Gamified Sandbox
                </span>
                <button
                  onClick={() => handleNavigate('/challenges')}
                  className="w-full text-left p-4 rounded-xl bg-cyber-darker border border-gray-850 hover:border-blue-500/30 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Crypto Challenges
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Test your cryptographic skills
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
              </div>

            </div>

            {/* Footer User Info display if logged in */}
            {user && (
              <div className="p-4 border-t border-gray-800 bg-gray-950/40 text-xs flex items-center space-x-2 font-mono truncate text-gray-500">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">Learner: {user.user_metadata?.username || user.email}</span>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OptionsDrawer;
