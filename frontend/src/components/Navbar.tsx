import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Terminal, Compass, BookOpen } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const {
    openDrawer,
    progress,
    isEli5Mode,
    toggleEli5Mode,
    userLevel,
    openOnboardingModal,
    openBeginnerGuide,
  } = useProgress();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Labs', path: '/labs' },
    { name: 'Algorithms', path: '/explorer' },
    { name: 'Docs', path: '/docs' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#060816]/90 backdrop-blur-xl border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white group">
              <Shield className="w-8 h-8 text-cyan-400 fill-cyan-400/10 group-hover:scale-105 transition-transform" />
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                CryptoLab
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-6 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-cyan-400 bg-cyan-950/20 border-b-2 border-cyan-400 rounded-b-none'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Beginner Guide & Level Switcher */}
            <button
              onClick={userLevel === 'beginner' ? openBeginnerGuide : openOnboardingModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all duration-200"
              title="Open Beginner Cryptography Crash Course & Level Selector"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{userLevel === 'beginner' ? '🌱 Beginner Course' : '🚀 Mode: Pro'}</span>
            </button>

            {/* ELI5 Toggle Button */}
            <button
              onClick={toggleEli5Mode}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                isEli5Mode
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.02]'
                  : 'bg-cyber-darker/80 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
              title="Toggle Explain Like I'm 5 beginner mode"
            >
              <span className="text-sm">🐣</span>
              <span>ELI5 Mode</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded font-extrabold ${
                  isEli5Mode ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {isEli5Mode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* My Crypto Journey Progress Tracker Trigger Pill */}
            <button
              onClick={openDrawer}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 hover:border-cyan-400/80 text-cyan-300 font-medium text-xs transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95"
            >
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>My Journey</span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 text-[10px] font-bold border border-cyan-500/30">
                {progress.overallPercentage}%
              </span>
            </button>

            {/* Challenges Quick Button */}
            <Link
              to="/challenges"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs transition-all duration-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Challenges</span>
            </Link>
          </div>

          {/* Mobile menu & journey trigger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleEli5Mode}
              className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center space-x-1 ${
                isEli5Mode
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <span>🐣 ELI5: {isEli5Mode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#060816] border-b border-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'text-cyan-400 bg-cyan-950/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={() => {
              setIsOpen(false);
              openDrawer();
            }}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-cyan-300 bg-cyan-950/30 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>My Crypto Journey</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              {progress.overallPercentage}%
            </span>
          </button>

          <Link
            to="/challenges"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-4 py-2 mt-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-all duration-200"
          >
            Crypto Challenges
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
