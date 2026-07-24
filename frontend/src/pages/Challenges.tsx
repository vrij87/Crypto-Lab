import React, { useState, useEffect } from 'react';
import { Award, Terminal, CheckCircle2, AlertCircle, HelpCircle, User, RefreshCw, ChevronRight, XCircle } from 'lucide-react';
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
  const { markLabVisited, updateLabProgress, progress } = useProgress();
  const [username, setUsername] = useState(() => localStorage.getItem('cryptolab_username') || '');
  const [tempUsername, setTempUsername] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [completedList, setCompletedList] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Unique Username & Suggestions States
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Selection/Submission States
  const [activeChal, setActiveChal] = useState<Challenge | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, { selectedIndex: number; correct: boolean; explanation: string }>>({});

  useEffect(() => {
    markLabVisited('challenges', 'Crypto Challenges', '/challenges');
  }, []);

  useEffect(() => {
    if (username) {
      localStorage.setItem('cryptolab_username', username);
      fetchUserStatus();
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchChallenges();
    }
  }, [progress?.overallPercentage, JSON.stringify(progress?.labProgress), username]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const completedLabsList = Object.entries(progress?.labProgress || {})
        .filter(([_, percent]) => percent > 0)
        .map(([labId]) => labId)
        .join(',');
        
      const overallPercent = progress?.overallPercentage || 0;

      const response = await api.get('/challenges/list', {
        params: {
          overall_progress: overallPercent,
          completed_labs: completedLabsList
        }
      });
      setChallenges(response.data);
      if (response.data.length > 0) {
        setActiveChal((prev) => {
          if (prev && response.data.some((c: Challenge) => c.id === prev.id)) {
            return prev;
          }
          return response.data[0];
        });
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
      if (response.data.token) {
        localStorage.setItem('cryptolab_scoreboard_token', response.data.token);
      }
      setUserScore(response.data.score);
      setCompletedList(response.data.completed_challenges || []);
      setUsernameError(null);
      setSuggestions([]);
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        localStorage.removeItem('cryptolab_username');
        localStorage.removeItem('cryptolab_scoreboard_token');
        setUsername('');
        const detail = e.response.data.detail;
        setUsernameError(detail.message || 'Session expired or username taken.');
        setSuggestions(detail.suggestions || []);
      }
    }
  };

  const handleDirectRegister = async (nameToRegister: string) => {
    setUsernameError(null);
    setSuggestions([]);
    try {
      localStorage.removeItem('cryptolab_scoreboard_token');
      const response = await api.get(`/challenges/status/${nameToRegister}`);
      if (response.data.token) {
        localStorage.setItem('cryptolab_scoreboard_token', response.data.token);
      }
      setUsername(nameToRegister);
      localStorage.setItem('cryptolab_username', nameToRegister);
      setUserScore(response.data.score);
      setCompletedList(response.data.completed_challenges || []);
      setUserAnswers({}); // Clear past session answers on new sign-in
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        const detail = err.response.data.detail;
        setUsernameError(detail.message || 'Username is already taken');
        setSuggestions(detail.suggestions || []);
      } else {
        setUsernameError('An error occurred. Please try again.');
      }
      console.error(err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      handleDirectRegister(tempUsername.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cryptolab_username');
    localStorage.removeItem('cryptolab_scoreboard_token');
    setUsername('');
    setUserScore(0);
    setCompletedList([]);
    setTempUsername('');
    setUsernameError(null);
    setSuggestions([]);
    setUserAnswers({});
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
      
      const correct = response.data.correct;
      setUserAnswers(prev => ({
        ...prev,
        [activeChal.id]: {
          selectedIndex: selectedOpt,
          correct: correct,
          explanation: response.data.explanation
        }
      }));

      if (correct) {
        setCompletedList(prev => [...prev, activeChal.id]);
      }
      
      setUserScore(response.data.score);
      const doneList = response.data.completed_challenges || [];
      
      if (correct) {
        const percent = Math.min(100, Math.round((doneList.length / (challenges.length || 1)) * 100));
        updateLabProgress('challenges', Math.max(20, percent));
      }
      
      // Auto-advance to the next unanswered/unattempted question after a brief transition delay
      setTimeout(() => {
        const currentIndex = challenges.findIndex(c => c.id === activeChal.id);
        const nextUnanswered = 
          challenges.slice(currentIndex + 1).find(c => c.id !== activeChal.id && userAnswers[c.id] === undefined) ||
          challenges.slice(0, currentIndex).find(c => c.id !== activeChal.id && userAnswers[c.id] === undefined);
          
        if (nextUnanswered) {
          setActiveChal(nextUnanswered);
          setSelectedOpt(null);
        }
      }, 600);
      
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        localStorage.removeItem('cryptolab_username');
        localStorage.removeItem('cryptolab_scoreboard_token');
        setUsername('');
        const detail = e.response.data.detail;
        setUsernameError(detail.message || 'Session expired or username taken.');
        setSuggestions(detail.suggestions || []);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectChallenge = (chal: Challenge) => {
    setActiveChal(chal);
    const attempted = userAnswers[chal.id];
    if (attempted) {
      setSelectedOpt(attempted.selectedIndex);
    } else {
      setSelectedOpt(null);
    }
  };

  const isQuizFinished = challenges.length > 0 && challenges.every(c => userAnswers[c.id] !== undefined);

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
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">Solved: {completedList.length}</span>
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
              {usernameError && (
                <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-450 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-rose-450">{usernameError}</p>
                    {suggestions.length > 0 && (
                      <div className="mt-2.5">
                        <p className="text-[11px] text-gray-400 mb-1.5 font-medium">Available alternatives:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => {
                                setTempUsername(sug);
                                handleDirectRegister(sug);
                              }}
                              className="px-2 py-0.5 rounded bg-cyber-dark border border-gray-850 hover:border-rose-500/50 text-[11px] text-rose-400 hover:text-white font-mono transition-all cursor-pointer"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold hover:from-rose-500 hover:to-pink-500 transition-all text-sm cursor-pointer"
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
                    const ans = userAnswers[chal.id];
                    const isAnswered = ans !== undefined;
                    const isAnsCorrect = ans?.correct;
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
                          {isAnswered ? (
                            isAnsCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            )
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
            {isQuizFinished ? (
              <div className="glass-panel p-6 space-y-6">
                <div className="border-b border-gray-800 pb-4">
                  <span className="text-[10px] font-mono text-rose-450 uppercase tracking-widest text-glow">Assessment Completed</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">Quiz Summary & Solutions</h2>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-cyber-darker p-3 rounded-lg border border-gray-800 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block">ATTEMPTED</span>
                    <span className="text-lg font-bold text-white">{challenges.length} / {challenges.length}</span>
                  </div>
                  <div className="bg-cyber-darker p-3 rounded-lg border border-gray-800 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block">CORRECT</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {challenges.filter(c => userAnswers[c.id]?.correct).length}
                    </span>
                  </div>
                  <div className="bg-cyber-darker p-3 rounded-lg border border-gray-800 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block">SUCCESS RATE</span>
                    <span className="text-lg font-bold text-rose-400">
                      {Math.round(
                        (challenges.filter(c => userAnswers[c.id]?.correct).length /
                          (challenges.length || 1)) *
                          100
                      )}%
                    </span>
                  </div>
                  <div className="bg-cyber-darker p-3 rounded-lg border border-gray-800 text-center">
                    <span className="text-[10px] text-gray-500 font-mono block">YOUR SCORE</span>
                    <span className="text-lg font-bold text-white">{userScore} pts</span>
                  </div>
                </div>

                {/* Solutions List */}
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {challenges.map((chal, index) => {
                    const ans = userAnswers[chal.id] || { correct: false, explanation: '', selectedIndex: 0 };
                    const isCorrect = ans.correct;
                    const explanation = ans.explanation;
                    const chosenText = chal.options[ans.selectedIndex] || 'Unanswered';

                    return (
                      <div key={chal.id} className="p-4 bg-cyber-darker/50 border border-gray-800 rounded-lg space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-gray-500 uppercase">Question {index + 1} • {chal.category}</span>
                            <h4 className="text-xs font-bold text-white leading-tight">{chal.question}</h4>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCorrect 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                              : 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                          }`}>
                            {isCorrect ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-rose-400" />}
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>

                        <div className="text-[11px] space-y-1 text-gray-400 bg-cyber-darker p-2.5 rounded border border-gray-850">
                          <p><span className="text-gray-500 font-mono">Your Answer:</span> <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{chosenText}</span></p>
                        </div>

                        <div className="text-[11px] leading-relaxed text-gray-400 border-l-2 border-rose-500/50 pl-3">
                          <p className="font-semibold text-rose-400 font-mono text-[9px] uppercase tracking-wider mb-0.5">Solution Explanation</p>
                          <p>{explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Retake button */}
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setSelectedOpt(null);
                    if (challenges.length > 0) {
                      setActiveChal(challenges[0]);
                    }
                  }}
                  className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Retake Quiz
                </button>
              </div>
            ) : activeChal ? (
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
                    const isCompleted = userAnswers[activeChal.id] !== undefined;
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
                            }
                          }}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-gray-900 border-gray-700 font-mono"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Submit button */}
                {userAnswers[activeChal.id] === undefined && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOpt === null || submitting}
                    className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </button>
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
