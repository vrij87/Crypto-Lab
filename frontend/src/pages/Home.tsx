import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Hash, Lock, Key, Edit3, Award, 
  Server, ArrowRight, Activity, Terminal, Compass
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const Home: React.FC = () => {
  const { openDrawer, progress } = useProgress();

  const stats = [
    { label: 'Interactive Labs', value: '8+', icon: Shield, color: 'text-cyan-400' },
    { label: 'Algorithms Covered', value: '20+', icon: Activity, color: 'text-purple-400' },
    { label: 'Real-time Visualizations', value: 'Interactive', icon: Terminal, color: 'text-blue-400' },
    { label: 'Implementation', value: 'Python + React', icon: Server, color: 'text-emerald-400' },
  ];

  const featuredLabs = [
    {
      title: 'Hashing Lab',
      desc: 'Generate cryptographic digests, benchmark hashing speeds, and explore the avalanche effect.',
      path: '/labs/hashing',
      icon: Hash,
      difficulty: 'Easy',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    },
    {
      title: 'Password Security Lab',
      desc: 'Understand entropy, salts, peppers, and test modern hashes like bcrypt, Argon2id, and PBKDF2.',
      path: '/labs/passwords',
      icon: Lock,
      difficulty: 'Medium',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    },
    {
      title: 'AES Encryption Lab',
      desc: 'Encrypt and decrypt messages using symmetric key standards. Visualize GCM & CBC block ciphers.',
      path: '/labs/symmetric',
      icon: Key,
      difficulty: 'Medium',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'RSA Key Lab',
      desc: 'Generate public/private keys, encrypt messages, and study asymmetric key exchanges.',
      path: '/labs/asymmetric',
      icon: Shield,
      difficulty: 'Hard',
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
    },
    {
      title: 'Digital Signatures',
      desc: 'Sign messages using private keys and verify authenticity, ensuring integrity and non-repudiation.',
      path: '/labs/signatures',
      icon: Edit3,
      difficulty: 'Hard',
      color: 'from-pink-500/20 to-red-500/20 border-pink-500/30 text-pink-400',
    },
    {
      title: 'Certificate Explorer',
      desc: 'Enter any domain, parse its SSL/TLS certificate chains, and verify validity parameters in real-time.',
      path: '/labs/certificates',
      icon: Server,
      difficulty: 'Easy',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
  ];

  const steps = [
    { title: 'Choose Lab', desc: 'Select any cryptography concepts from hashing to TLS certificate checks.' },
    { title: 'Learn Concepts', desc: 'Read interactive explanations about mathematical structures and security standards.' },
    { title: 'Experiment Live', desc: 'Input custom messages, modify variables, and verify cryptographic outputs.' },
    { title: 'Visualize Flows', desc: 'Watch step-by-step block transformations, hashes, and key exchanges.' },
    { title: 'Test Skills', desc: 'Solve MCQ quizzes and mini challenges to verify your cybersecurity understanding.' }
  ];

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Text */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
                Now Live: Interactive Web Sandbox
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
                Learn. Experiment.<br />
                Master <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Cryptography.</span>
              </h1>
              <p className="text-gray-400 text-lg sm:text-xl font-normal leading-relaxed mb-8 max-w-xl">
                Interactive labs and real-time visualizations to help you understand cryptographic algorithms, symmetric ciphers, and security standards in the best way.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-center lg:justify-start">
                <Link
                  to="/labs"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all"
                >
                  Start Learning
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>

                <button
                  onClick={openDrawer}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 font-semibold hover:bg-cyan-900/60 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group cursor-pointer"
                >
                  <Compass className="mr-2 w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
                  <span>My Journey</span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                    {progress.overallPercentage}%
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Lock Vector */}
          <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative w-80 h-80 sm:w-96 sm:h-96"
            >
              {/* Spinning backdrop circles */}
              <div className="absolute inset-0 border-2 border-dashed border-cyan-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-8 border border-dashed border-purple-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-64 h-64 text-cyan-400 fill-none" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="cyan-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  {/* Grid base */}
                  <path d="M 40,150 L 100,180 L 160,150 L 100,120 Z" stroke="url(#cyan-purple)" strokeWidth="1" opacity="0.4" />
                  <path d="M 40,100 L 100,130 L 160,100 L 100,70 Z" stroke="url(#cyan-purple)" strokeWidth="1" opacity="0.2" />
                  
                  {/* Lock body */}
                  <rect x="70" y="90" width="60" height="50" rx="8" stroke="url(#cyan-purple)" strokeWidth="2.5" fill="#111827" fillOpacity="0.8" className="lock-line" />
                  {/* Shackle */}
                  <path d="M 82,90 L 82,65 A 18,18 0 0 1 118,65 L 118,90" stroke="url(#cyan-purple)" strokeWidth="2.5" strokeLinecap="round" className="lock-line" />
                  
                  {/* Keyhole */}
                  <circle cx="100" cy="110" r="4" fill="#06b6d4" />
                  <polygon points="98,112 102,112 104,124 96,124" fill="#06b6d4" />

                  {/* Pulsing light */}
                  <circle cx="100" cy="110" r="12" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="animate-ping" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="glass-panel p-6 flex flex-col items-center text-center glass-panel-hover"
            >
              <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
              <span className="text-3xl font-extrabold text-white mb-1">{stat.value}</span>
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Labs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Featured Laboratories
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Step into our interactive sandboxes to see encryption, decryption, hashes, and certificates working in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredLabs.map((lab, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className={`glass-panel p-6 border-l-4 flex flex-col justify-between ${lab.color} hover:bg-gray-900/80 transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <lab.icon className="w-8 h-8" />
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-800 text-gray-400">
                    {lab.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{lab.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {lab.desc}
                </p>
              </div>
              <Link
                to={lab.path}
                className="inline-flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-300 group"
              >
                Open Lab
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 sm:mt-32">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-cyber-darker/90 to-cyan-950/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-5 mb-8 lg:mb-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                How CryptoLab Works
              </h2>
              <p className="text-gray-400 leading-relaxed">
                We believe security should be learned through active manipulation and visualization, not just dry mathematics. Here is our modular learning formula.
              </p>
            </div>
            
            <div className="lg:col-span-7 space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-white font-bold">{step.title}</h4>
                    <p className="text-gray-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <div className="max-w-4xl mx-auto text-center px-4 mt-24 sm:mt-32">
        <div className="glass-panel p-8 sm:p-12 bg-gradient-to-r from-cyan-950/20 via-gray-900/60 to-purple-950/20 border-cyan-500/20">
          <Award className="w-12 h-12 text-cyan-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Ready to test your cryptography skills?
          </h2>
          <p className="text-gray-400 text-base mb-8 max-w-lg mx-auto">
            Take on interactive cryptography puzzles, analyze codes, and track your accomplishments on our dashboard.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Start Quiz Challenges
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
