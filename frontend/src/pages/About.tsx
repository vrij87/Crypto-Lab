import React from 'react';
import { Shield, BookOpen, Eye, Award } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      title: 'Built for Learners',
      desc: 'No cybersecurity or deep engineering background is required. We explain cryptographic concepts step-by-step.',
      icon: BookOpen,
      color: 'text-cyan-400'
    },
    {
      title: 'Privacy First',
      desc: 'All computations happen locally inside your local host server or browser sandbox. We never record your secret strings.',
      icon: Eye,
      color: 'text-purple-400'
    },
    {
      title: 'Modern Standards',
      desc: 'We demonstrate secure, active cryptographic practices (like AES-GCM, Argon2id, SHA-3) to prepare developers.',
      icon: Shield,
      color: 'text-blue-400'
    },
    {
      title: 'Open Source',
      desc: 'The code is fully transparent, showcasing backend FastAPI structures, REST API endpoints, and clean React architecture.',
      icon: Award,
      color: 'text-rose-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          About CryptoLab
        </h1>
        <p className="mt-4 text-gray-400 text-base leading-relaxed">
          CryptoLab is an interactive playground designed to teach the mechanics and applications of modern cryptography. We visualised complex mathematical structures like asymmetric RSA key exchanges, hashing grids, and salts to make cybersecurity accessible.
        </p>
      </div>

      {/* Grid Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        {values.map((v, i) => (
          <div key={i} className="glass-panel p-6 flex items-start space-x-4">
            <div className={`p-2.5 bg-gray-900 rounded-lg border border-gray-800 flex-shrink-0 ${v.color}`}>
              <v.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mission / Vision text block */}
      <div className="glass-panel p-8 bg-gradient-to-r from-cyan-950/15 via-cyber-bg to-purple-950/15 border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Our Mission</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our mission is to bridge the gap between abstract academic cryptography textbooks and hands-on developer experiences. We believe that by creating real-time visual sandboxes, students can easily identify secure practices, analyze algorithms, and prevent credentials leak flaws in their apps.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Our Vision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We envision a web development ecosystem where every engineer understands secure password storage, authenticates payloads via digital signatures, validates TLS certificate chains, and uses modern standards rather than outdated legacy schemes like raw SHA-256 or MD5.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
