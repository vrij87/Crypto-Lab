import React, { useState, useEffect } from 'react';
import { BookOpen, Book, Terminal, HelpCircle, ChevronRight } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const DocPage: React.FC = () => {
  const { markLabVisited } = useProgress();
  const [activeSection, setActiveSection] = useState<'start' | 'labs' | 'api' | 'faq'>('start');

  useEffect(() => {
    markLabVisited('intro', 'Cryptography Fundamentals', '/docs');
  }, []);

  const menuItems = [
    { id: 'start', name: 'Getting Started', icon: BookOpen },
    { id: 'labs', name: 'Labs Guide', icon: Book },
    { id: 'api', name: 'API Reference', icon: Terminal },
    { id: 'faq', name: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          Documentation & Guide
        </h1>
        <p className="mt-1 text-gray-400 text-sm">
          Everything you need to know about setting up, playing with the labs, and running APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Cols 4) */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                  activeSection === item.id
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-white'
                    : 'bg-cyber-darker/60 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className="w-4 h-4" />
                  <span className="font-bold">{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Panel (Cols 8) */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 space-y-6 text-gray-400 text-sm leading-relaxed">
            
            {/* GETTING STARTED */}
            {activeSection === 'start' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Getting Started</h2>
                <p>Welcome to CryptoLab! This web application consists of a **FastAPI backend** running locally to compute cryptographic ciphers, and a **React frontend** dashboard to visualize concepts.</p>
                
                <h3 className="font-bold text-white mt-4">System Requirements:</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Modern browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled.</li>
                  <li>Local Python environment to run backend server.</li>
                  <li>Node.js (v18+) to host frontend sandbox.</li>
                </ul>

                <h3 className="font-bold text-white mt-4">Running Locally:</h3>
                <div className="bg-cyber-darker p-3.5 rounded border border-gray-800 font-mono text-xs text-cyan-400 space-y-2">
                  <div># 1. Start the FastAPI Backend:</div>
                  <div className="bg-black p-2 rounded text-white">
                    cd backend <br />
                    python -m uvicorn app.main:app --reload
                  </div>
                  <div># 2. Run the Vite React Frontend:</div>
                  <div className="bg-black p-2 rounded text-white">
                    cd frontend <br />
                    npm run dev
                  </div>
                </div>
              </div>
            )}

            {/* LABS GUIDE */}
            {activeSection === 'labs' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Labs Guide</h2>
                
                <div className="space-y-3">
                  <div className="border border-gray-850 p-4 rounded bg-cyber-darker">
                    <h3 className="font-bold text-white">Lab 1: Hashing Laboratory</h3>
                    <p className="mt-1">
                      Input text data, configure digests, and evaluate bit transformations in real-time. Notice how changing a single byte scrambles the outputs.
                    </p>
                  </div>
                  <div className="border border-gray-850 p-4 rounded bg-cyber-darker">
                    <h3 className="font-bold text-white">Lab 2: Password Security Lab</h3>
                    <p className="mt-1">
                      Check strength entropy scores and simulate dictionary database compromises. Practice slow hashing settings with Argon2id, bcrypt, and salts.
                    </p>
                  </div>
                  <div className="border border-gray-850 p-4 rounded bg-cyber-darker">
                    <h3 className="font-bold text-white">Lab 3: Symmetric AES Encryption</h3>
                    <p className="mt-1">
                      Encrypt payloads using symmetric keys. Compare CBC chaining vectors with authenticated GCM checksum tag requirements.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API REFERENCE */}
            {activeSection === 'api' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">API Reference</h2>
                <p>All laboratory actions run via FastAPI router services. The following endpoints are exposed on port 8000:</p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="border border-gray-850 p-3 rounded bg-cyber-darker">
                    <span className="text-emerald-400 font-bold">POST</span> /api/hashing/hash
                    <div className="text-[10px] text-gray-500 mt-1">Payload: {"{ text: string, algorithm: string }"}</div>
                  </div>
                  <div className="border border-gray-850 p-3 rounded bg-cyber-darker">
                    <span className="text-emerald-400 font-bold">POST</span> /api/passwords/strength
                    <div className="text-[10px] text-gray-500 mt-1">Payload: {"{ password: string }"}</div>
                  </div>
                  <div className="border border-gray-850 p-3 rounded bg-cyber-darker">
                    <span className="text-emerald-400 font-bold">POST</span> /api/symmetric/encrypt
                    <div className="text-[10px] text-gray-500 mt-1">Payload: {"{ plaintext: str, key: str, algorithm: str, mode: str }"}</div>
                  </div>
                  <div className="border border-gray-850 p-3 rounded bg-cyber-darker">
                    <span className="text-emerald-400 font-bold">POST</span> /api/asymmetric/generate-rsa
                    <div className="text-[10px] text-gray-500 mt-1">Payload: {"{ key_size: int }"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeSection === 'faq' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white mb-1">Is this tool safe to hash my production credentials?</h4>
                    <p className="text-gray-400">
                      Yes, all cryptographic actions run locally inside your host machine. No data is sent to external web clouds. However, this is an **educational platform** and should not be used as a primary utility.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Why do my RSA key generations take so long?</h4>
                    <p className="text-gray-400">
                      Generating prime numbers for 4096-bit keys involves heavy mathematical testing (e.g. Miller-Rabin tests) and CPU cycles, which takes longer than smaller keys.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default DocPage;
