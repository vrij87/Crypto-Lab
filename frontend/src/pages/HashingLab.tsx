import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';
import { Eli5Banner } from '../components/Eli5Banner';
import { Eli5Tooltip } from '../components/Eli5Tooltip';
import { RealWorldUsesCard } from '../components/RealWorldUsesCard';

const HashingLab: React.FC = () => {
  const { markLabVisited, updateLabProgress, recordAlgorithmLearned } = useProgress();
  const [activeTab, setActiveTab] = useState<'generator' | 'compare' | 'avalanche' | 'benchmark'>('generator');

  useEffect(() => {
    markLabVisited('hashing', 'Hashing Laboratory', '/labs/hashing');
  }, []);

  const handleTabChange = (tab: 'generator' | 'compare' | 'avalanche' | 'benchmark') => {
    setActiveTab(tab);
    if (tab === 'compare') updateLabProgress('hashing', 50);
    if (tab === 'avalanche') updateLabProgress('hashing', 75);
    if (tab === 'benchmark') updateLabProgress('hashing', 90);
  };

  // Tab 1: Generator State
  const [genInput, setGenInput] = useState('Hello, CryptoLab!');
  const [genAlg, setGenAlg] = useState('SHA-256');
  const [genOutput, setGenOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  // Tab 2: Compare State
  const [compInput1, setCompInput1] = useState('crypto');
  const [compInput2, setCompInput2] = useState('Crypto');
  const [compHash1, setCompHash1] = useState('');
  const [compHash2, setCompHash2] = useState('');
  const [compAlg, setCompAlg] = useState('SHA-256');

  // Tab 3: Avalanche State
  const [avaInput1, setAvaInput1] = useState('security');
  const [avaInput2, setAvaInput2] = useState('securitY');
  const [avaAlg, setAvaAlg] = useState('SHA-256');
  const [avaResult, setAvaResult] = useState<any>(null);
  const [avaLoading, setAvaLoading] = useState(false);

  // Tab 4: Benchmark State
  const [benchInput, setBenchInput] = useState('Benchmark Input Data');
  const [benchData, setBenchData] = useState<any>(null);
  const [benchLoading, setBenchLoading] = useState(false);

  // Auto hash generation for Generator tab
  useEffect(() => {
    if (activeTab === 'generator') {
      const delayDebounce = setTimeout(() => {
        generateHash();
      }, 250);
      return () => clearTimeout(delayDebounce);
    }
  }, [genInput, genAlg, activeTab]);

  // Auto hash generation for Compare tab
  useEffect(() => {
    if (activeTab === 'compare') {
      const getCompareHashes = async () => {
        try {
          const res1 = await api.post('/hashing/hash', { text: compInput1, algorithm: compAlg });
          const res2 = await api.post('/hashing/hash', { text: compInput2, algorithm: compAlg });
          setCompHash1(res1.data.hash);
          setCompHash2(res2.data.hash);
          updateLabProgress('hashing', 50);
        } catch (e) {
          console.error(e);
        }
      };
      getCompareHashes();
    }
  }, [compInput1, compInput2, compAlg, activeTab]);

  const generateHash = async () => {
    if (!genInput) {
      setGenOutput('');
      return;
    }
    setGenLoading(true);
    try {
      const response = await api.post('/hashing/hash', {
        text: genInput,
        algorithm: genAlg
      });
      setGenOutput(response.data.hash);
      const cleanName = genAlg.replace('-', '').replace(' ', '');
      recordAlgorithmLearned(cleanName);
      updateLabProgress('hashing', 35);
    } catch (err) {
      console.error(err);
    } finally {
      setGenLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runAvalancheAnalysis = async () => {
    setAvaLoading(true);
    try {
      const response = await api.post('/hashing/avalanche', {
        text1: avaInput1,
        text2: avaInput2,
        algorithm: avaAlg
      });
      setAvaResult(response.data);
      updateLabProgress('hashing', 80);
    } catch (err) {
      console.error(err);
    } finally {
      setAvaLoading(false);
    }
  };

  const runBenchmark = async () => {
    setBenchLoading(true);
    try {
      const response = await api.post('/hashing/benchmark', {
        text: benchInput,
        algorithm: 'SHA-256'
      });
      setBenchData(response.data);
      updateLabProgress('hashing', 100);
    } catch (err) {
      console.error(err);
    } finally {
      setBenchLoading(false);
    }
  };

  const getSecurityBadge = (rating: string) => {
    if (rating === 'Secure') {
      return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
    }
    return 'bg-rose-950/40 text-rose-400 border-rose-900/40';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Hash className="w-8 h-8 text-cyan-400" />
            Hashing Laboratory
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Learn mathematical one-way functions, test hashes, compare strings, and explore bit propagation.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-850">
          {(['generator', 'compare', 'avalanche', 'benchmark'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ELI5 Banner */}
      <Eli5Banner
        title="Understanding Hashing Functions"
        analogyTitle="The Digital Food Processor"
        analogyDescription="Imagine throwing fruits into a food processor. You press start and get a unique smoothie (a Hash Digest). You can NEVER un-blend a smoothie back into whole apples or bananas (One-Way property). If you change just 1 tiny seed, the entire smoothie color and flavor changes completely (Avalanche Effect)!"
        bulletPoints={[
          "One-Way: Easy to create a hash from text, impossible to reverse a hash back to text.",
          "Unique Fingerprint: The same text always produces the exact same hash output.",
          "Avalanche Effect: Changing 'Cat' to 'cat' produces a 100% different hash."
        ]}
      />

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: GENERATOR */}
          {activeTab === 'generator' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Hash Generator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Input String</label>
                  <textarea
                    value={genInput}
                    onChange={(e) => setGenInput(e.target.value)}
                    placeholder="Enter plain text..."
                    rows={4}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center">
                      Select Hash Algorithm
                      <Eli5Tooltip term="Hash Algorithm" simpleExplanation="A digital blender that turns your text into a unique fixed-length fingerprint string." analogy="Smoothie recipe fingerprint" />
                    </label>
                    <select
                      value={genAlg}
                      onChange={(e) => setGenAlg(e.target.value)}
                      className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
                    >
                      {['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'SHA3-256', 'SHA3-512'].map(alg => (
                        <option key={alg} value={alg}>{alg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generateHash}
                      disabled={genLoading}
                      className="w-full inline-flex items-center justify-center p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                    >
                      {genLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Generate Hash
                    </button>
                  </div>
                </div>

                {genOutput && (
                  <div className="bg-cyber-darker border border-gray-800 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono uppercase text-gray-400">{genAlg} Digest</span>
                      <button
                        onClick={() => copyToClipboard(genOutput)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-white font-mono break-all text-sm leading-relaxed p-1 bg-gray-900/60 rounded border border-gray-850">
                      {genOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPARE */}
          {activeTab === 'compare' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Compare Digests</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Input String 1</label>
                  <input
                    type="text"
                    value={compInput1}
                    onChange={(e) => setCompInput1(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Input String 2</label>
                  <input
                    type="text"
                    value={compInput2}
                    onChange={(e) => setCompInput2(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Algorithm</label>
                <select
                  value={compAlg}
                  onChange={(e) => setCompAlg(e.target.value)}
                  className="bg-cyber-darker border border-gray-800 rounded-lg p-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                >
                  {['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'SHA3-256', 'SHA3-512'].map(alg => (
                    <option key={alg} value={alg}>{alg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-800/80">
                <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs">
                  <div className="text-gray-400 mb-1">Hash 1:</div>
                  <div className="text-white break-all">{compHash1}</div>
                </div>
                <div className="p-3 bg-cyber-darker rounded border border-gray-800 font-mono text-xs">
                  <div className="text-gray-400 mb-1">Hash 2:</div>
                  <div className="text-white break-all">{compHash2}</div>
                </div>

                <div className="flex items-center justify-center p-4 rounded-lg bg-gray-900 border border-gray-800">
                  {compHash1 === compHash2 ? (
                    <div className="flex items-center text-emerald-400 font-bold text-sm space-x-2">
                      <Check className="w-5 h-5" />
                      <span>Hashes Match (Same Inputs)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-rose-400 font-bold text-sm space-x-2">
                      <ShieldAlert className="w-5 h-5" />
                      <span>Hashes Do Not Match (Diff Inputs)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVALANCHE EFFECT */}
          {activeTab === 'avalanche' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Avalanche Effect</h2>
              <p className="text-gray-400 text-sm">
                The Avalanche Effect requires that a small change in key/plaintext causes a drastic change in hash bits. Check how many bits change when editing 1 character!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Input 1</label>
                  <input
                    type="text"
                    value={avaInput1}
                    onChange={(e) => setAvaInput1(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Input 2 (Edit slightly)</label>
                  <input
                    type="text"
                    value={avaInput2}
                    onChange={(e) => setAvaInput2(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Algorithm</label>
                  <select
                    value={avaAlg}
                    onChange={(e) => setAvaAlg(e.target.value)}
                    className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                  >
                    {['MD5', 'SHA-1', 'SHA-256', 'SHA-512', 'SHA3-256', 'SHA3-512'].map(alg => (
                      <option key={alg} value={alg}>{alg}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={runAvalancheAnalysis}
                  disabled={avaLoading}
                  className="inline-flex items-center justify-center p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  {avaLoading && <RefreshCw className="w-4 h-4 animate-spin mr-2" />}
                  Analyze Avalanche
                </button>
              </div>

              {avaResult && (
                <div className="space-y-6 pt-6 border-t border-gray-800/80">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-cyber-darker p-3 rounded border border-gray-800">
                      <div className="text-2xl font-extrabold text-cyan-400">{avaResult.diff_bits}</div>
                      <div className="text-xs text-gray-400 mt-1">Bits Changed</div>
                    </div>
                    <div className="bg-cyber-darker p-3 rounded border border-gray-800">
                      <div className="text-2xl font-extrabold text-cyan-400">{avaResult.percentage}%</div>
                      <div className="text-xs text-gray-400 mt-1">Bit Difference</div>
                    </div>
                    <div className="bg-cyber-darker p-3 rounded border border-gray-800">
                      <div className="text-2xl font-extrabold text-cyan-400">{avaResult.total_bits}</div>
                      <div className="text-xs text-gray-400 mt-1">Total Bits</div>
                    </div>
                  </div>

                  {/* Bit Visualizer Grid */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-3">Binary Bit Mismatch Grid (Green = Unchanged, Red = Changed)</label>
                    <div 
                      className="grid gap-1 bg-cyber-darker p-4 rounded-lg border border-gray-800"
                      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(8px, 1fr))' }}
                    >
                      {avaResult.bin1.split('').map((bit: string, i: number) => {
                        const isChanged = avaResult.changed_indices.includes(i);
                        return (
                          <div
                            key={i}
                            className={`w-full aspect-square rounded-sm flex items-center justify-center text-[8px] font-mono font-bold ${
                              isChanged ? 'bg-rose-500/80 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-950'
                            }`}
                            title={`Bit ${i}: Hash1=${bit}, Hash2=${avaResult.bin2[i]}`}
                          >
                            {avaResult.bin2[i]}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BENCHMARKS */}
          {activeTab === 'benchmark' && (
            <div className="glass-panel p-6 space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Benchmark Hash Algorithms</h2>
              <p className="text-gray-400 text-sm">
                Benchmarks run 10,000 iterations of hashes on the backend server, tracking latency, length, collision levels, and safety ratings.
              </p>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={benchInput}
                  onChange={(e) => setBenchInput(e.target.value)}
                  className="flex-grow bg-cyber-darker border border-gray-800 rounded-lg p-2.5 text-white font-mono text-sm"
                />
                <button
                  onClick={runBenchmark}
                  disabled={benchLoading}
                  className="inline-flex items-center px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
                >
                  {benchLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <BarChart2 className="w-4 h-4 mr-2" />}
                  Run Benchmark
                </button>
              </div>

              {benchData && (
                <div className="overflow-x-auto border border-gray-800 rounded-lg bg-cyber-darker">
                  <table className="min-w-full divide-y divide-gray-800 text-left text-sm">
                    <thead className="bg-gray-900/60 font-mono text-xs uppercase text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Algorithm</th>
                        <th className="px-4 py-3">10k Runs (ms)</th>
                        <th className="px-4 py-3">Output size</th>
                        <th className="px-4 py-3">Collision Resistance</th>
                        <th className="px-4 py-3">Security</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-white font-mono text-xs">
                      {Object.keys(benchData).map((alg) => (
                        <tr key={alg} className="hover:bg-gray-800/20">
                          <td className="px-4 py-3 font-bold text-cyan-400">{alg}</td>
                          <td className="px-4 py-3">{benchData[alg].duration_10k_ms} ms</td>
                          <td className="px-4 py-3">{benchData[alg].bit_length} bits</td>
                          <td className="px-4 py-3 text-gray-400">{benchData[alg].collision_resistance}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getSecurityBadge(benchData[alg].security_rating)}`}>
                              {benchData[alg].security_rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-6 bg-gradient-to-b from-gray-900/40 to-cyber-bg">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              What is Hashing?
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cryptographic hashing maps arbitrary sized inputs into fixed size binary strings (digests). It is a **one-way function**, meaning it is computationally impossible to reverse ciphertext back to plaintext.
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-cyber-darker rounded border border-gray-800">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-1">Key Properties:</h4>
                <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
                  <li>**Deterministic**: Same input always yields the same hash.</li>
                  <li>**Fast to compute**: Quick hash generations.</li>
                  <li>**Pre-image resistant**: Irreversible.</li>
                  <li>**Collision resistant**: Hard to find two inputs sharing one hash.</li>
                </ul>
              </div>
              <div className="p-3 bg-cyber-darker rounded border border-gray-800">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase mb-1">Real-World Uses:</h4>
                <p className="text-xs text-gray-400">
                  Integrity verifications, checksum downloads, blockchain state records, and digital signature envelopes.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <RealWorldUsesCard
        title="Where is Hashing Used in Real Life?"
        subtitle="Cryptographic hash functions operate behind the scenes in almost every software application you use."
        items={[
          {
            title: "Git Code Versioning",
            description: "Git uses SHA-1 and SHA-256 hashes to uniquely identify every commit, tree, and file blob in your project repository.",
            example: "git commit sha: a95eda2...",
            badge: "Version Control"
          },
          {
            title: "Software Integrity Checks",
            description: "Operating system ISOs and app installers publish SHA-256 checksums so users can verify downloads aren't corrupted or tampered with.",
            example: "sha256sum ubuntu-24.04.iso",
            badge: "Security Integrity"
          },
          {
            title: "API Authentication (HMAC)",
            description: "Services like Stripe, AWS, and GitHub API sign webhook payloads using HMAC-SHA256 to prove authenticity.",
            example: "X-Stripe-Signature: t=16200...",
            badge: "Web APIs"
          }
        ]}
      />
    </div>
  );
};

export default HashingLab;
