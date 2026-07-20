import React, { useState, useEffect } from 'react';
import { Award, Terminal, CheckCircle2, AlertCircle, HelpCircle, User, RefreshCw, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useProgress } from '../context/ProgressContext';

interface Challenge {
  id: number;
  title: string;
  question: string;
  options: string[];
  difficulty: string;
  category: string;
}

const Challenges: React.FC = () => {
  const { markLabVisited, updateLabProgress } = useProgress();
  const [username, setUsername] = useState(() => localStorage.getItem('cryptolab_username') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [completedList, setCompletedList] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection/Submission States
  const [activeChal, setActiveChal] = useState<Challenge | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    markLabVisited('challenges', 'Crypto Challenges', '/challenges');
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (username) {
      localStorage.setItem('cryptolab_username', username);
      fetchUserStatus();
    }
  }, [username]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/challenges/list');
      setChallenges(response.data);
      if (response.data.length > 0) {
        setActiveChal(response.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const response = await api.get(`/challenges/status/${username}`);
      setUserScore(response.data.score);
      setCompletedList(response.data.completed_challenges || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cryptolab_username');
    setUsername('');
    setUserScore(0);
    setCompletedList([]);
  };

  const handleSubmitAnswer = async () => {
    if (!activeChal || selectedOpt === null) return;
    setSubmitting(true);
    try {
      const response = await api.post('/challenges/submit', {
        username,
        challenge_id: activeChal.id,
        answer_index: selectedOpt
      });
      setResult({
        correct: response.data.correct,
        explanation: response.data.explanation
      });
      setUserScore(response.data.score);
      const doneList = response.data.completed_challenges || [];
      setCompletedList(doneList);
      if (response.data.correct) {
        const percent = Math.min(100, Math.round((doneList.length / (challenges.length || 1)) * 100));
        updateLabProgress('challenges', Math.max(20, percent));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const selectChallenge = (chal: Challenge) => {
    setActiveChal(chal);
    setSelectedOpt(null);
    setResult(null);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
      case 'medium': return 'bg-yellow-950/40 text-yellow-400 border-yellow-900/40';
      default: return 'bg-rose-950/40 text-rose-400 border-rose-900/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title */}
      <div className="mb-8 border-b border-gray-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Terminal className="w-8 h-8 text-rose-400" />
            Crypto Challenges
          </h1>
          <p className="mt-1 text-gray-400 text-sm">
            Complete interactive scenario exercises, solve quizzes, and track your accomplishments on our database scoreboard.
          </p>
        </div>

        {username && (
          <div className="flex items-center space-x-3 bg-gray-900/60 p-2 px-4 rounded-lg border border-gray-800 text-xs">
            <User className="w-4 h-4 text-rose-400" />
            <span className="text-white font-mono font-bold">{username}</span>
            <span className="text-gray-500">|</span>
            <span className="text-rose-450 font-bold">Score: {userScore} pts</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors ml-2">Log out</button>
          </div>
        )}
      </div>

      {/* Username registration block */}
      {!username ? (
        <div className="max-w-md mx-auto py-12">
          <div className="glass-panel p-8 space-y-6 text-center border-rose-900/10">
            <Award className="w-12 h-12 text-rose-400 mx-auto animate-pulse" />
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Create Learning Identity</h2>
              <p className="text-gray-400 text-sm">
                Enter your name or handle to sync challenge completions and scores with the platform SQLite database.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="e.g. CyberSherlock"
                required
                className="w-full bg-cyber-darker border border-gray-800 rounded-lg p-3 text-center text-white focus:outline-none focus:border-rose-500 font-mono text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold hover:from-rose-500 hover:to-pink-500 transition-all text-sm"
              >
                Access Challenges
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Challenge list selector (Cols 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-gray-850 pb-2">Challenge Index</h3>
              
              {loading ? (
                <div className="text-center p-8 text-gray-500 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-450" />
                  Loading quizzes...
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {challenges.map((chal) => {
                    const isSolved = completedList.includes(chal.id);
                    return (
                      <button
                        key={chal.id}
                        onClick={() => selectChallenge(chal)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                          activeChal?.id === chal.id
                            ? 'bg-rose-950/20 border-rose-500/30 text-white'
                            : 'bg-cyber-darker/60 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="font-bold">{chal.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quiz presentation card (Cols 8) */}
          <div className="lg:col-span-8">
            {activeChal ? (
              <div className="glass-panel p-6 space-y-6">
                
                {/* Title info */}
                <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-rose-450 uppercase tracking-widest">{activeChal.category} Scenario</span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{activeChal.question}</h2>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(activeChal.difficulty)}`}>
                      {activeChal.difficulty}
                    </span>
                  </div>
                </div>

                {/* Option radios */}
                <div className="space-y-3">
                  {activeChal.options.map((opt, idx) => {
                    const isCompleted = completedList.includes(activeChal.id);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start space-x-3 p-3.5 rounded-lg border font-medium text-xs cursor-pointer transition-all ${
                          selectedOpt === idx
                            ? 'bg-rose-950/10 border-rose-500/40 text-white shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                            : 'bg-cyber-darker border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                        } ${isCompleted ? 'pointer-events-none opacity-80' : ''}`}
                      >
                        <input
                          type="radio"
                          name="quiz-options"
                          checked={selectedOpt === idx}
                          onChange={() => {
                            if (!isCompleted) {
                              setSelectedOpt(idx);
                              setResult(null);
                            }
                          }}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-gray-900 border-gray-700"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Submit button */}
                {!completedList.includes(activeChal.id) && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOpt === null || submitting}
                    className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </button>
                )}

                {/* Explanation block */}
                {(result || completedList.includes(activeChal.id)) && (
                  <div className="p-4 bg-cyber-darker border border-gray-800 rounded-lg text-xs leading-relaxed space-y-2">
                    <div className="flex items-center space-x-2">
                      {result?.correct || completedList.includes(activeChal.id) ? (
                        <div className="flex items-center text-emerald-400 font-bold space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-450 font-bold space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>Incorrect answer</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400">
                      {result?.explanation || 'You have already completed this exercise. Great job!'}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="glass-panel p-12 text-center text-gray-500 text-sm">
                No active challenge selection.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Challenges;
