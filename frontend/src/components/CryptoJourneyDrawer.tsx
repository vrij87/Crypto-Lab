import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  Lock,
  Zap,
  Shield,
  Award,
  Trophy,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  BarChart3,
  Cpu,
  Flame,
  Check,
} from 'lucide-react';
import { useProgress, formatRelativeTime } from '../context/ProgressContext';

const CryptoJourneyDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, progress, resetProgress } = useProgress();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'roadmap' | 'labs' | 'algorithms' | 'skills'>('all');

  if (!isDrawerOpen) return null;

  const handleNavigate = (path: string) => {
    closeDrawer();
    navigate(path);
  };

  // Helper for SVG circular calculation
  const circleRadius = 52;
  const circumference = 2 * Math.PI * circleRadius; // ~326.7
  const strokeDashoffset = circumference - (progress.overallPercentage / 100) * circumference;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Slide-over Drawer Panel */}
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full md:w-[560px] lg:w-[620px] h-full bg-[#060816]/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col z-[101] text-gray-200"
        >
          {/* Top Header */}
          <div className="p-5 border-b border-gray-800/80 bg-gray-900/60 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                    My Crypto Journey
                  </h2>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {progress.level}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Track your cryptography mastery & skill milestones</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetProgress}
                title="Reset learning stats"
                className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800/60 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={closeDrawer}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Nav Tabs */}
          <div className="px-5 py-2.5 bg-gray-950/60 border-b border-gray-800/60 flex items-center space-x-1 overflow-x-auto no-scrollbar text-xs font-medium">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'roadmap', label: 'Roadmap' },
              { id: 'labs', label: 'Lab Progress' },
              { id: 'algorithms', label: 'Algorithms' },
              { id: 'skills', label: 'Skills & Badges' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Body Scroll Container */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* 1. Overall Learning Progress & Stats Hero */}
            {(activeTab === 'all' || activeTab === 'roadmap') && (
              <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Circular Progress Gauge */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r={circleRadius}
                        stroke="#1f2937"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="72"
                        cy="72"
                        r={circleRadius}
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-white tracking-tight">
                        {progress.overallPercentage}%
                      </span>
                      <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Summary & Stats Grid */}
                  <div className="flex-grow space-y-3 w-full">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300">Learning Status</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {progress.labsCompletedCount} of {progress.totalLabs} Labs Completed • Level:{' '}
                        <span className="text-cyan-400 font-semibold">{progress.level}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-2.5">
                        <div className="text-gray-400 text-[11px] flex items-center space-x-1">
                          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Labs Done</span>
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                          {progress.labsCompletedCount} / {progress.totalLabs}
                        </div>
                      </div>

                      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-2.5">
                        <div className="text-gray-400 text-[11px] flex items-center space-x-1">
                          <Cpu className="w-3.5 h-3.5 text-purple-400" />
                          <span>Algorithms</span>
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                          {progress.algorithms.filter((a) => a.status === 'completed').length} / {progress.algorithms.length}
                        </div>
                      </div>

                      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-2.5">
                        <div className="text-gray-400 text-[11px] flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Skills</span>
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                          {progress.skills.filter((s) => s.level >= 80).length} / {progress.skills.length}
                        </div>
                      </div>

                      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-2.5">
                        <div className="text-gray-400 text-[11px] flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Total XP</span>
                        </div>
                        <div className="text-base font-bold text-white mt-1">
                          {progress.overallPercentage * 15} XP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Current Goal Card */}
            {(activeTab === 'all' || activeTab === 'roadmap') && (
              <div className="bg-gradient-to-br from-cyan-950/40 via-gray-900 to-purple-950/30 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Current Active Goal</span>
                  </span>
                  <span className="text-xs text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Est. {progress.currentGoal.estMinutes} mins remaining</span>
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">{progress.currentGoal.title}</h4>
                <p className="text-xs text-gray-300 mt-1">
                  Master Argon2id memory hardness, salt generation, and cracking resistance.
                </p>

                {/* Progress bar inside goal */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Goal Progress</span>
                    <span className="text-cyan-400 font-semibold">{progress.currentGoal.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      style={{ width: `${progress.currentGoal.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleNavigate(progress.currentGoal.path)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] group"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* 3. Learning Roadmap */}
            {(activeTab === 'all' || activeTab === 'roadmap') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Learning Roadmap</span>
                  </h3>
                  <span className="text-xs text-gray-400">Step-by-step path</span>
                </div>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-4 relative">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-gray-800">
                    {progress.roadmap.map((module, idx) => {
                      const isCompleted = module.status === 'completed';
                      const isInProgress = module.status === 'in_progress';
                      const isLocked = module.status === 'locked';

                      return (
                        <div
                          key={module.id}
                          onClick={() => !isLocked && handleNavigate(module.path)}
                          className={`relative group cursor-pointer transition-all ${
                            isLocked ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        >
                          {/* Node Icon on Timeline */}
                          <div
                            className={`absolute -left-6 top-0.5 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform group-hover:scale-110 ${
                              isCompleted
                                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                : isInProgress
                                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isLocked ? (
                              <Lock className="w-3 h-3 text-gray-500" />
                            ) : (
                              <span className="font-bold">{idx + 1}</span>
                            )}
                          </div>

                          {/* Item Content Card */}
                          <div
                            className={`p-3 rounded-xl border transition-all ${
                              isInProgress
                                ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                                : isCompleted
                                ? 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                                : 'bg-gray-900/30 border-gray-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h4
                                  className={`text-xs font-bold ${
                                    isInProgress
                                      ? 'text-cyan-300'
                                      : isCompleted
                                      ? 'text-white'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {module.name}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                                  {module.category}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : isInProgress
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'bg-gray-800 text-gray-500'
                                }`}
                              >
                                {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Locked'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{module.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Lab Progress Bars */}
            {(activeTab === 'all' || activeTab === 'labs') && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Lab Progress Breakdown</span>
                </h3>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-4 space-y-4">
                  {[
                    { id: 'hashing', name: 'Hashing Lab', percent: progress.labProgress.hashing || 100, path: '/labs/hashing' },
                    { id: 'passwords', name: 'Password Security Lab', percent: progress.labProgress.passwords || 100, path: '/labs/passwords' },
                    { id: 'symmetric', name: 'AES Encryption Lab', percent: progress.labProgress.symmetric || 100, path: '/labs/symmetric' },
                    { id: 'asymmetric', name: 'RSA & ECC Lab', percent: progress.labProgress.asymmetric || 65, path: '/labs/asymmetric' },
                    { id: 'signatures', name: 'Digital Signature Lab', percent: progress.labProgress.signatures || 25, path: '/labs/signatures' },
                    { id: 'certificates', name: 'Certificate Explorer', percent: progress.labProgress.certificates || 10, path: '/labs/certificates' },
                  ].map((lab) => (
                    <div
                      key={lab.id}
                      onClick={() => handleNavigate(lab.path)}
                      className="group cursor-pointer space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-200 group-hover:text-cyan-300 transition-colors">
                          {lab.name}
                        </span>
                        <span className="text-cyan-400 font-bold">{lab.percent}%</span>
                      </div>

                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            lab.percent === 100
                              ? 'bg-emerald-400'
                              : lab.percent > 50
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                              : 'bg-amber-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${lab.percent}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Algorithms Learned */}
            {(activeTab === 'all' || activeTab === 'algorithms') && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Algorithms Learned</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {progress.algorithms.map((algo) => {
                    const isEmerald = algo.badgeColor === 'emerald';
                    const isCyan = algo.badgeColor === 'cyan';

                    return (
                      <div
                        key={algo.name}
                        className="bg-[#111827] border border-gray-800/80 hover:border-gray-700 rounded-xl p-3 space-y-1.5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{algo.name}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isEmerald
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isCyan
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {algo.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-400 font-medium">{algo.type}</div>
                        <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{algo.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Skills Learned */}
            {(activeTab === 'all' || activeTab === 'skills') && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Skills Learned</span>
                </h3>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-4 space-y-3">
                  {progress.skills.map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-200">{skill.name}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                            {skill.category}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">{skill.badge}</span>
                      </div>

                      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Achievement Badges */}
            {(activeTab === 'all' || activeTab === 'skills') && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Achievement Badges</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {progress.achievements.map((badge) => {
                    const isUnlocked = badge.status === 'unlocked';
                    const isInProg = badge.status === 'in_progress';

                    return (
                      <div
                        key={badge.id}
                        className={`border rounded-xl p-3 flex space-x-3 transition-all ${
                          isUnlocked
                            ? 'bg-gray-900/80 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.08)]'
                            : isInProg
                            ? 'bg-gray-900/40 border-cyan-500/30'
                            : 'bg-gray-900/20 border-gray-800/50 opacity-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isUnlocked
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : isInProg
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {badge.iconName === 'Shield' && <Shield className="w-5 h-5" />}
                          {badge.iconName === 'Zap' && <Zap className="w-5 h-5" />}
                          {badge.iconName === 'Lock' && <Lock className="w-5 h-5" />}
                          {badge.iconName === 'Award' && <Award className="w-5 h-5" />}
                          {badge.iconName === 'Trophy' && <Trophy className="w-5 h-5" />}
                        </div>

                        <div className="space-y-0.5 flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{badge.title}</h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isUnlocked
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isInProg
                                  ? 'bg-cyan-500/20 text-cyan-400'
                                  : 'bg-gray-800 text-gray-500'
                              }`}
                            >
                              {isUnlocked ? 'Unlocked' : isInProg ? `${badge.progressPercent}%` : 'Locked'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. Recently Visited Labs */}
            {activeTab === 'all' && progress.recentVisited.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Recently Visited Labs</span>
                </h3>

                <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-2 divide-y divide-gray-800/60">
                  {progress.recentVisited.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      className="p-2.5 flex items-center justify-between hover:bg-gray-800/40 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-200">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-medium">{formatRelativeTime(item.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer CTA */}
          <div className="p-4 border-t border-gray-800/80 bg-gray-950/90 flex items-center justify-between text-xs">
            <span className="text-gray-400">CryptoLab Educational Suite v1.2</span>
            <button
              onClick={() => handleNavigate('/challenges')}
              className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center space-x-1 transition-colors"
            >
              <span>Test Knowledge in Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};

export default CryptoJourneyDrawer;
