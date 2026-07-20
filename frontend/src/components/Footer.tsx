import React from 'react';
import { Shield, Globe, Heart, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cyber-darker border-t border-gray-800/80 text-gray-500 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white mb-4">
              <Shield className="w-6 h-6 text-cyan-400 fill-cyan-400/10" />
              <span className="font-bold text-lg tracking-wider">CryptoLab</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              CryptoLab is an interactive, visual cryptography playground designed to make cryptography and cybersecurity concepts easy and approachable for everyone.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Learning path links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Labs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/labs/hashing" className="hover:text-cyan-400 transition-colors">Hashing Lab</Link>
              </li>
              <li>
                <Link to="/labs/passwords" className="hover:text-cyan-400 transition-colors">Password Security</Link>
              </li>
              <li>
                <Link to="/labs/symmetric" className="hover:text-cyan-400 transition-colors">AES Encryption</Link>
              </li>
              <li>
                <Link to="/labs/asymmetric" className="hover:text-cyan-400 transition-colors">RSA Lab</Link>
              </li>
              <li>
                <Link to="/labs/signatures" className="hover:text-cyan-400 transition-colors">Digital Signatures</Link>
              </li>
            </ul>
          </div>

          {/* Docs & site links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explorer" className="hover:text-cyan-400 transition-colors">Algorithm Explorer</Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/challenges" className="hover:text-cyan-400 transition-colors">Crypto Quizzes</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/80 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>© {new Date().getFullYear()} CryptoLab. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
            <span>for Cybersecurity Education</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
