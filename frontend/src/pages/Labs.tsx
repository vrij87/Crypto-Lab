import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Hash, Lock, Key, Shield, CheckSquare, Globe, BookOpen, Terminal, Compass
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const Labs: React.FC = () => {
  const { openDrawer, progress } = useProgress();

  const labs = [
    {
      id: 'hashing',
      title: 'Hashing Laboratory',
      description: 'Explore cryptographic hash functions, compare digest sizes, and benchmark hashing speeds. Observe the Avalanche Effect in real-time.',
      path: '/labs/hashing',
      icon: Hash,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/10',
      difficulty: 'Easy',
      algorithms: ['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'SHA-3'],
      status: 'Ready'
    },
    {
      id: 'passwords',
      title: 'Password Security Lab',
      description: 'Analyze entropy, test salts & peppers, and compare slow memory-hard hashing standards like bcrypt, Argon2id, and PBKDF2.',
      path: '/labs/passwords',
      icon: Lock,
      color: 'text-purple-400 border-purple-500/20 bg-purple-950/10',
      difficulty: 'Medium',
      algorithms: ['bcrypt', 'Argon2id', 'PBKDF2'],
      status: 'Ready'
    },
    {
      id: 'symmetric',
      title: 'AES & Symmetric Ciphers',
      description: 'Encrypt and decrypt using key standards. Compare GCM & CBC block modes and explore stream ciphers like ChaCha20.',
      path: '/labs/symmetric',
      icon: Key,
      color: 'text-blue-400 border-blue-500/20 bg-blue-950/10',
      difficulty: 'Medium',
      algorithms: ['AES-128', 'AES-256', 'ChaCha20'],
      status: 'Ready'
    },
    {
      id: 'asymmetric',
      title: 'RSA & Asymmetric Encryption',
      description: 'Generate key pairs, encrypt with public keys, decrypt with private keys, and study public key exchange mechanics.',
      path: '/labs/asymmetric',
      icon: Shield,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-950/10',
      difficulty: 'Hard',
      algorithms: ['RSA-2048', 'RSA-4096', 'Key Exchange'],
      status: 'Ready'
    },
    {
      id: 'signatures',
      title: 'Digital Signature Lab',
      description: 'Sign documents and verify signatures. Modify signatures or payload text to see how tamper detection works instantly.',
      path: '/labs/signatures',
      icon: CheckSquare,
      color: 'text-pink-400 border-pink-500/20 bg-pink-950/10',
      difficulty: 'Hard',
      algorithms: ['RSA-PSS', 'SHA-256 Signatures'],
      status: 'Ready'
    },
    {
      id: 'certificates',
      title: 'Certificate Explorer',
      description: 'Lookup and analyze SSL/TLS certificate chains of any live domain in real-time, verifying issuer details and trust anchors.',
      path: '/labs/certificates',
      icon: Globe,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10',
      difficulty: 'Easy',
      algorithms: ['TLS v1.3', 'SSL Certificates', 'HTTPS'],
      status: 'Ready'
    },
    {
      id: 'explorer',
      title: 'Algorithm Explorer',
      description: 'An educational database detailing description, security levels, pros, cons, and code references of common algorithms.',
      path: '/explorer',
      icon: BookOpen,
      color: 'text-amber-400 border-amber-500/20 bg-amber-950/10',
      difficulty: 'Easy',
      algorithms: ['All Algorithms catalog'],
      status: 'Ready'
    },
    {
      id: 'challenges',
      title: 'Crypto Challenges & Quizzes',
      description: 'Take on interactive challenges, answer multiple-choice questions on password storage, symmetric keying, and track progress.',
      path: '/challenges',
      icon: Terminal,
      color: 'text-rose-400 border-rose-500/20 bg-rose-950/10',
      difficulty: 'Medium',
      algorithms: ['Quiz challenges'],
      status: 'Ready'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="mb-12 border-b border-gray-800/80 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive Laboratories
          </h1>
          <p className="mt-2 text-gray-400 text-base max-w-2xl">
            Choose a laboratory sandbox below to start configuring inputs, adjusting keys, and observing visual cryptography simulations.
          </p>
        </div>

        <button
          onClick={openDrawer}
          className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-[1.02] cursor-pointer self-start md:self-auto"
        >
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>My Crypto Journey</span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 text-[10px] font-bold border border-cyan-500/30">
            {progress.overallPercentage}%
          </span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {labs.map((lab, i) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className={`glass-panel p-6 border-l-4 flex flex-col justify-between ${lab.color} hover:bg-gray-900/70 transition-all`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <lab.icon className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-white">{lab.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {lab.difficulty}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-900/40">
                    {lab.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {lab.description}
              </p>

              {/* Algorithm Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {lab.algorithms.map((alg) => (
                  <span
                    key={alg}
                    className="text-xs font-mono bg-cyber-darker text-gray-400 px-2 py-1 rounded border border-gray-800"
                  >
                    {alg}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">LAB-{i + 1}</span>
              <Link
                to={lab.path}
                className="inline-flex items-center px-4 py-2 rounded bg-gray-800 hover:bg-cyan-950/30 border border-gray-700 hover:border-cyan-500/30 text-sm font-medium text-white hover:text-cyan-400 transition-all"
              >
                Open Lab
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Labs;
