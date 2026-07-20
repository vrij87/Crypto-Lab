import React, { useState, useEffect } from 'react';
import { BookOpen, Search, BookMarked, HelpCircle, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';

interface AlgorithmDetail {
  name: string;
  type: string;
  description: string;
  output_size: string;
  security_level: string;
  use_cases: string[];
  advantages: string[];
  disadvantages: string[];
  examples: string;
  references: string;
}

const Explorer: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  const [algorithms, setAlgorithms] = useState<Record<string, AlgorithmDetail>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Hashing' | 'Symmetric' | 'Asymmetric' | 'Passwords'>('All');
  const [selectedAlg, setSelectedAlg] = useState<string | null>(null);

  useEffect(() => {
    markLabVisited('explorer', 'Algorithm Explorer', '/explorer');
    updateLabProgress('explorer', 100);
  }, []);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await api.get('/explorer/algorithms');
        setAlgorithms(response.data);
        // Default select the first item
        const keys = Object.keys(response.data);
        if (keys.length > 0) {
          setSelectedAlg(keys[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAlgorithms();
  }, []);

  const getFilteredKeys = () => {
    return Object.keys(algorithms).filter((key) => {
      const alg = algorithms[key];
      const matchesSearch = alg.name.toLowerCase().includes(search.toLowerCase()) || 
                            key.toLowerCase().includes(search.toLowerCase()) ||
                            alg.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = activeFilter === 'All' || alg.type.toLowerCase() === activeFilter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  };

  const getSecurityBadge = (rating: string) => {
    if (rating.toLowerCase().includes('secure')) {
      return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
    }
    if (rating.toLowerCase().includes('deprecated') || rating.toLowerCase().includes('weak')) {
      return 'bg-yellow-950/40 text-yellow-400 border-yellow-900/40';
    }
    return 'bg-rose-950/40 text-rose-400 border-rose-900/40';
  };

  const filteredKeys = getFilteredKeys();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-amber-400" />
          Algorithm Explorer
        </h1>
        <p className="mt-1 text-gray-400 text-sm">
          Comprehensive dictionary of modern standards, parameters, block lengths, security margins, and references.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Search & Sidebar Lists (Cols 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search algorithms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-1.5 border-b border-gray-800 pb-3">
              {(['All', 'Hashing', 'Symmetric', 'Asymmetric', 'Passwords'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                    activeFilter === filter
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-gray-400 hover:text-white bg-cyber-darker border border-gray-850'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center p-8 text-gray-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                Loading definitions...
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {filteredKeys.length > 0 ? (
                  filteredKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedAlg(key)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex justify-between items-center ${
                        selectedAlg === key
                          ? 'bg-amber-950/20 border-amber-500/30 text-white'
                          : 'bg-cyber-darker/60 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold">{key}</span>
                      <span className="text-[10px] opacity-60 font-mono">{algorithms[key].type}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500 text-xs">
                    No matching algorithms.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Detail Panel (Cols 8) */}
        <div className="lg:col-span-8">
          {selectedAlg && algorithms[selectedAlg] ? (
            <div className="glass-panel p-6 space-y-6">
              
              {/* Header Title */}
              <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">{algorithms[selectedAlg].name}</h2>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">{algorithms[selectedAlg].type} Scheme</span>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded text-xs font-bold border ${getSecurityBadge(algorithms[selectedAlg].security_level)}`}>
                    Security: {algorithms[selectedAlg].security_level}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-gray-400">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{algorithms[selectedAlg].description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Specs */}
                <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 text-xs space-y-3">
                  <div>
                    <span className="text-gray-500 block uppercase font-mono text-[10px] mb-0.5">Output Bit Size</span>
                    <span className="text-white font-bold">{algorithms[selectedAlg].output_size}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase font-mono text-[10px] mb-0.5">Standards / RFC Reference</span>
                    <span className="text-amber-400 font-mono flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5" />
                      {algorithms[selectedAlg].references}
                    </span>
                  </div>
                </div>

                {/* Example Payload */}
                <div className="bg-cyber-darker p-4 rounded-lg border border-gray-800 text-xs flex flex-col justify-between">
                  <div>
                    <span className="text-gray-500 block uppercase font-mono text-[10px] mb-0.5">Example / Format</span>
                    <div className="text-white font-mono break-all leading-relaxed p-1 bg-gray-900 rounded">{algorithms[selectedAlg].examples}</div>
                  </div>
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-850">
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase text-emerald-400">Advantages</h3>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                    {algorithms[selectedAlg].advantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase text-rose-400">Disadvantages</h3>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                    {algorithms[selectedAlg].disadvantages.map((dis, i) => (
                      <li key={i}>{dis}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Use Cases */}
              <div className="space-y-3 pt-4 border-t border-gray-850">
                <h3 className="text-xs font-mono uppercase text-gray-400">Standard Use Cases</h3>
                <div className="flex flex-wrap gap-2">
                  {algorithms[selectedAlg].use_cases.map((uc, i) => (
                    <span key={i} className="text-xs px-3 py-1 bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-gray-500 text-sm">
              <HelpCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              Select an algorithm from the sidebar catalog to view its cryptographic profile sheet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Explorer;
