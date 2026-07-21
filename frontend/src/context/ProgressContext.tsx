import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RoadmapModule {
  id: string;
  name: string;
  category: string;
  path: string;
  status: 'completed' | 'in_progress' | 'locked';
  estTime: string;
  description: string;
}

export interface AlgorithmItem {
  name: string;
  type: string;
  status: 'completed' | 'learning' | 'locked';
  desc: string;
  badgeColor: 'emerald' | 'cyan' | 'amber' | 'gray';
}

export interface SkillItem {
  name: string;
  category: string;
  level: number; // 0 - 100
  badge: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  iconName: string;
  description: string;
  status: 'unlocked' | 'in_progress' | 'locked';
  unlockedDate?: string;
  progressPercent: number;
}

export interface RecentVisit {
  id: string;
  name: string;
  path: string;
  timestamp: string;
}

export interface CurrentGoal {
  title: string;
  labName: string;
  path: string;
  estMinutes: number;
  progress: number;
}

export interface ProgressNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'level' | 'lab' | 'algorithm';
  timestamp: number;
}

export interface ProgressState {
  overallPercentage: number;
  level: string;
  labsCompletedCount: number;
  totalLabs: number;
  currentGoal: CurrentGoal;
  roadmap: RoadmapModule[];
  labProgress: Record<string, number>;
  algorithms: AlgorithmItem[];
  skills: SkillItem[];
  recentVisited: RecentVisit[];
  achievements: AchievementBadge[];
}

const DEFAULT_PROGRESS: ProgressState = {
  overallPercentage: 62,
  level: 'Crypto Explorer',
  labsCompletedCount: 4,
  totalLabs: 8,
  currentGoal: {
    title: 'Complete Password Security Lab',
    labName: 'Password Security Lab',
    path: '/labs/passwords',
    estMinutes: 15,
    progress: 75,
  },
  roadmap: [
    {
      id: 'intro',
      name: 'Cryptography Fundamentals',
      category: 'Overview',
      path: '/docs',
      status: 'completed',
      estTime: '10 min',
      description: 'Foundational concepts, ciphers, and security principles.',
    },
    {
      id: 'hashing',
      name: 'Hashing Lab',
      category: 'Hashing',
      path: '/labs/hashing',
      status: 'completed',
      estTime: '15 min',
      description: 'SHA-256, MD5, SHA-3, HMAC, and avalanche effect.',
    },
    {
      id: 'passwords',
      name: 'Password Security Lab',
      category: 'Passwords',
      path: '/labs/passwords',
      status: 'completed',
      estTime: '20 min',
      description: 'Argon2id, bcrypt, PBKDF2, scrypt & entropy analysis.',
    },
    {
      id: 'symmetric',
      name: 'AES Encryption Lab',
      category: 'Symmetric',
      path: '/labs/symmetric',
      status: 'completed',
      estTime: '25 min',
      description: 'AES-CBC, AES-GCM, ChaCha20-Poly1305 modes.',
    },
    {
      id: 'asymmetric',
      name: 'RSA & ECC Lab',
      category: 'Asymmetric',
      path: '/labs/asymmetric',
      status: 'in_progress',
      estTime: '30 min',
      description: 'RSA 2048/4096 & ECC SECP256k1 key generation and encryption.',
    },
    {
      id: 'signatures',
      name: 'Digital Signature Lab',
      category: 'Signatures',
      path: '/labs/signatures',
      status: 'locked',
      estTime: '20 min',
      description: 'ECDSA & RSA-PSS signing, verification & tamper detection.',
    },
    {
      id: 'certificates',
      name: 'Certificate Explorer',
      category: 'PKI',
      path: '/labs/certificates',
      status: 'locked',
      estTime: '25 min',
      description: 'X.509 self-signed certificates, SANs, and SSL inspection.',
    },
    {
      id: 'challenges',
      name: 'Crypto Challenges',
      category: 'Gamified',
      path: '/challenges',
      status: 'locked',
      estTime: '45 min',
      description: 'Real-world crypto puzzles, quiz questions, and scoring.',
    },
  ],
  labProgress: {
    hashing: 100,
    passwords: 100,
    symmetric: 100,
    asymmetric: 65,
    signatures: 25,
    certificates: 10,
    explorer: 80,
    challenges: 40,
  },
  algorithms: [
    {
      name: 'SHA256',
      type: 'Hash Function',
      status: 'completed',
      desc: '256-bit secure cryptographic hash algorithm used in Bitcoin & TLS.',
      badgeColor: 'emerald',
    },
    {
      name: 'SHA512',
      type: 'Hash Function',
      status: 'completed',
      desc: '512-bit digest function for high performance 64-bit architectures.',
      badgeColor: 'emerald',
    },
    {
      name: 'SHA3',
      type: 'Keccak Hash',
      status: 'completed',
      desc: 'NIST sponge-construction standard immune to length extension.',
      badgeColor: 'emerald',
    },
    {
      name: 'MD5',
      type: 'Legacy Hash',
      status: 'completed',
      desc: '128-bit broken hash studied for historic collision vulnerabilities.',
      badgeColor: 'emerald',
    },
    {
      name: 'Argon2',
      type: 'KDF / Password',
      status: 'completed',
      desc: 'Memory-hard password hashing winner of PHC (Argon2id mode).',
      badgeColor: 'emerald',
    },
    {
      name: 'AES256',
      type: 'Symmetric Cipher',
      status: 'learning',
      desc: 'Advanced Encryption Standard using 256-bit keys and GCM AEAD.',
      badgeColor: 'cyan',
    },
    {
      name: 'RSA2048',
      type: 'Asymmetric PKI',
      status: 'learning',
      desc: 'Public key algorithm relying on prime factorization hardness.',
      badgeColor: 'amber',
    },
  ],
  skills: [
    {
      name: 'Hashing',
      category: 'Core Primitive',
      level: 95,
      badge: 'Master',
    },
    {
      name: 'Password Security',
      category: 'Authentication',
      level: 88,
      badge: 'Expert',
    },
    {
      name: 'Symmetric Encryption',
      category: 'Confidentiality',
      level: 82,
      badge: 'Advanced',
    },
    {
      name: 'Asymmetric Encryption',
      category: 'Public Key Infra',
      level: 60,
      badge: 'Intermediate',
    },
    {
      name: 'Digital Signatures',
      category: 'Non-Repudiation',
      level: 45,
      badge: 'Practitioner',
    },
    {
      name: 'Cryptography Fundamentals',
      category: 'Theory',
      level: 90,
      badge: 'Master',
    },
  ],
  recentVisited: [
    {
      id: 'asymmetric',
      name: 'RSA & ECC Lab',
      path: '/labs/asymmetric',
      timestamp: '15 minutes ago',
    },
    {
      id: 'symmetric',
      name: 'AES Encryption Lab',
      path: '/labs/symmetric',
      timestamp: '2 hours ago',
    },
    {
      id: 'passwords',
      name: 'Password Security Lab',
      path: '/labs/passwords',
      timestamp: 'Yesterday',
    },
    {
      id: 'hashing',
      name: 'Hashing Lab',
      path: '/labs/hashing',
      timestamp: '2 days ago',
    },
  ],
  achievements: [
    {
      id: 'beginner',
      title: 'Crypto Beginner',
      iconName: 'Shield',
      description: 'Completed introduction to cryptographic primitives & safety principles.',
      status: 'unlocked',
      unlockedDate: 'July 18, 2026',
      progressPercent: 100,
    },
    {
      id: 'hash_master',
      title: 'Hash Master',
      iconName: 'Zap',
      description: 'Mastered SHA-256, SHA-3, HMAC & Avalanche effect calculations.',
      status: 'unlocked',
      unlockedDate: 'July 19, 2026',
      progressPercent: 100,
    },
    {
      id: 'enc_explorer',
      title: 'Encryption Explorer',
      iconName: 'Lock',
      description: 'Configured AES-GCM & ChaCha20-Poly1305 symmetric authenticated ciphers.',
      status: 'unlocked',
      unlockedDate: 'July 20, 2026',
      progressPercent: 100,
    },
    {
      id: 'sec_enthusiast',
      title: 'Security Enthusiast',
      iconName: 'Award',
      description: 'Analyzed Argon2id memory hardness and password entropy formulas.',
      status: 'in_progress',
      progressPercent: 75,
    },
    {
      id: 'cipher_sleuth',
      title: 'Cipher Sleuth',
      iconName: 'Trophy',
      description: 'Solved all gamified cryptography challenges with 100% accuracy.',
      status: 'locked',
      progressPercent: 40,
    },
  ],
};

interface ProgressContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isEli5Mode: boolean;
  toggleEli5Mode: () => void;
  userLevel: 'beginner' | 'intermediate' | null;
  setUserLevel: (level: 'beginner' | 'intermediate') => void;
  showOnboardingModal: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  showBeginnerGuide: boolean;
  openBeginnerGuide: () => void;
  closeBeginnerGuide: () => void;
  progress: ProgressState;
  notifications: ProgressNotification[];
  dismissNotification: (id: string) => void;
  markLabVisited: (id: string, name: string, path: string) => void;
  updateLabProgress: (id: string, percent: number) => void;
  recordAlgorithmLearned: (algoName: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'cryptolab_user_progress_v1';
const ELI5_STORAGE_KEY = 'cryptolab_eli5_mode';
const BROADCAST_CHANNEL = 'cryptolab_progress_broadcast';
const LEVEL_STORAGE_KEY = 'cryptolab_user_level';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userLevel, setUserLevelState] = useState<'beginner' | 'intermediate' | null>(() => {
    try {
      return (localStorage.getItem(LEVEL_STORAGE_KEY) as 'beginner' | 'intermediate') || null;
    } catch {
      return null;
    }
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(LEVEL_STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);

  const setUserLevel = (level: 'beginner' | 'intermediate') => {
    setUserLevelState(level);
    try {
      localStorage.setItem(LEVEL_STORAGE_KEY, level);
    } catch (e) {
      console.error(e);
    }
  };

  const openOnboardingModal = () => setShowOnboardingModal(true);
  const closeOnboardingModal = () => setShowOnboardingModal(false);
  const openBeginnerGuide = () => setShowBeginnerGuide(true);
  const closeBeginnerGuide = () => setShowBeginnerGuide(false);

  const [isEli5Mode, setIsEli5Mode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ELI5_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [notifications, setNotifications] = useState<ProgressNotification[]>([]);
  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });

  // Cross-Tab Real-time Broadcast Channel & Storage Sync
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_PROGRESS') {
          setProgress(event.data.payload);
        }
      };
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProgress(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync state to localStorage & BroadcastChannel
  const notifyStateChange = (newState: ProgressState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'SYNC_PROGRESS', payload: newState });
        bc.close();
      }
    } catch {
      // ignore
    }
  };

  const addToastNotification = (title: string, message: string, type: ProgressNotification['type']) => {
    const newNotif: ProgressNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 3)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const markLabVisited = (id: string, name: string, path: string) => {
    setProgress((prev) => {
      const filtered = prev.recentVisited.filter((v) => v.id !== id);
      const newVisit: RecentVisit = {
        id,
        name,
        path,
        timestamp: 'Just now',
      };
      const newState: ProgressState = {
        ...prev,
        recentVisited: [newVisit, ...filtered.slice(0, 4)],
      };
      notifyStateChange(newState);
      return newState;
    });
  };

  const updateLabProgress = (id: string, percent: number) => {
    setProgress((prev) => {
      const currentPercent = prev.labProgress[id] || 0;
      const newPercent = Math.min(100, Math.max(currentPercent, percent));
      
      if (newPercent === currentPercent) return prev; // No change needed

      const updatedLabs = { ...prev.labProgress, [id]: newPercent };
      
      // Re-calculate average & level
      const labValues = Object.values(updatedLabs);
      const avg = Math.round(labValues.reduce((a, b) => a + b, 0) / (labValues.length || 1));
      
      let level = 'Crypto Beginner';
      if (avg >= 85) level = 'Crypto Master';
      else if (avg >= 60) level = 'Crypto Explorer';
      else if (avg >= 35) level = 'Crypto Practitioner';

      // Update roadmap module status dynamically
      const updatedRoadmap = prev.roadmap.map((mod, idx, arr) => {
        if (mod.id === id) {
          const modStatus = newPercent >= 100 ? ('completed' as const) : ('in_progress' as const);
          // Unlock next module if completed
          if (newPercent >= 100 && arr[idx + 1] && arr[idx + 1].status === 'locked') {
            arr[idx + 1].status = 'in_progress';
          }
          return { ...mod, status: modStatus };
        }
        return mod;
      });

      const labsCompleted = updatedRoadmap.filter((m) => m.status === 'completed').length;

      // Toast notification if lab newly completed
      if (newPercent >= 100 && currentPercent < 100) {
        addToastNotification('🎉 Lab Completed!', `You reached 100% completion in ${id.toUpperCase()} Lab!`, 'lab');
      }

      if (level !== prev.level) {
        addToastNotification('🏆 Level Up!', `Congratulations! You achieved level: ${level}`, 'level');
      }

      const newState: ProgressState = {
        ...prev,
        labProgress: updatedLabs,
        overallPercentage: avg,
        level,
        labsCompletedCount: labsCompleted,
        roadmap: updatedRoadmap,
      };

      notifyStateChange(newState);
      return newState;
    });
  };

  const recordAlgorithmLearned = (algoName: string) => {
    setProgress((prev) => {
      let isNew = false;
      const updatedAlgos = prev.algorithms.map((a) => {
        if (a.name.toUpperCase() === algoName.toUpperCase() && a.status !== 'completed') {
          isNew = true;
          return { ...a, status: 'completed' as const, badgeColor: 'emerald' as const };
        }
        return a;
      });

      if (!isNew) return prev;

      addToastNotification('⚡ Algorithm Mastered!', `Unlocked algorithm milestone: ${algoName}`, 'algorithm');

      const newState: ProgressState = {
        ...prev,
        algorithms: updatedAlgos,
      };
      notifyStateChange(newState);
      return newState;
    });
  };

  const toggleEli5Mode = () => {
    setIsEli5Mode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ELI5_STORAGE_KEY, String(next));
      } catch (e) {
        console.error(e);
      }
      addToastNotification(
        next ? '🐣 ELI5 Mode Activated' : '⚙️ Standard Mode Active',
        next
          ? 'Simplifying complex cryptographic jargon with real-world analogies!'
          : 'Switched back to standard technical terminology.',
        'lab'
      );
      return next;
    });
  };

  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    setUserLevelState(null);
    setShowOnboardingModal(true);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEVEL_STORAGE_KEY);
    addToastNotification('🔄 Progress Reset', 'Learning statistics reset to baseline.', 'lab');
  };

  return (
    <ProgressContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        isEli5Mode,
        toggleEli5Mode,
        userLevel,
        setUserLevel,
        showOnboardingModal,
        openOnboardingModal,
        closeOnboardingModal,
        showBeginnerGuide,
        openBeginnerGuide,
        closeBeginnerGuide,
        progress,
        notifications,
        dismissNotification,
        markLabVisited,
        updateLabProgress,
        recordAlgorithmLearned,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
