import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Compass, User, LogOut } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import OptionsDrawer from './OptionsDrawer';

const CustomOptionsIcon: React.FC = () => (
  <svg 
    className="w-5 h-5 cursor-pointer text-gray-400 hover:text-cyan-400 active:scale-95 transition-all" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <rect x="3" y="5" width="12" height="3.2" rx="1.6" />
    <rect x="3" y="10.4" width="18" height="3.2" rx="1.6" />
    <rect x="3" y="15.8" width="15" height="3.2" rx="1.6" />
  </svg>
);

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const location = useLocation();
  const {
    openDrawer,
    progress,
    toggleEli5Mode,
    isEli5Mode,
  } = useProgress();
  const { user, signOut } = useAuth();

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
    <>
      <nav className="sticky top-0 z-50 bg-[#060816]/90 backdrop-blur-xl border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Control Center Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOptionsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-800/40 hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-center mr-1"
              title="Open Controls Center"
            >
              <CustomOptionsIcon />
            </button>
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

          {/* Desktop Right Actions (De-congested: only auth profile status) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-cyber-darker border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 font-medium text-xs transition-all duration-200 cursor-pointer"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="max-w-[90px] truncate">{user.user_metadata?.username || user.email}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#080a15] border border-gray-800/80 shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-800/60 text-[10px] text-gray-500 truncate font-mono">
                      {user.email}
                    </div>
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await signOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition-all cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyber-darker border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 font-medium text-xs transition-all duration-200"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </Link>
            )}
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
            className="block w-full text-center px-4 py-2 mt-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-all duration-200 font-semibold"
          >
            Crypto Challenges
          </Link>

          {user ? (
            <div className="border-t border-gray-800 pt-3 mt-3">
              <div className="px-3 py-1.5 text-xs text-gray-500 truncate font-mono">
                Learner: <span className="text-cyan-400">{user.user_metadata?.username || user.email}</span>
              </div>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await signOut();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2 mt-2 rounded-lg border border-cyan-500/40 text-cyan-400 font-semibold transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      </nav>
      {/* Slide-over Control Options Panel Drawer */}
      <OptionsDrawer isOpen={isOptionsOpen} onClose={() => setIsOptionsOpen(false)} />
    </>
  );
};

export default Navbar;
