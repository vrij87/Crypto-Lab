import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

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
  timestamp: number | string;
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

export const formatRelativeTime = (timestamp: number | string): string => {
  if (typeof timestamp === 'string') {
    if (timestamp === 'Just now' || timestamp.includes('ago') || timestamp.includes('Yesterday')) {
      return timestamp;
    }
    const parsed = Date.parse(timestamp);
    if (isNaN(parsed)) return timestamp;
    timestamp = parsed;
  }
  
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Merges current guest progress context with progress context retrieved from Supabase PostgreSQL.
 * Retains the maximum level achieved in each lab.
 */
const mergeProgressState = (guest: ProgressState, dbData: ProgressState): ProgressState => {
  const mergedLabProgress = { ...dbData.labProgress };
  Object.keys(guest.labProgress || {}).forEach((key) => {
    mergedLabProgress[key] = Math.max(guest.labProgress[key] || 0, dbData.labProgress[key] || 0);
  });

  const labValues = Object.values(mergedLabProgress);
  const avg = Math.round(labValues.reduce((a, b) => a + b, 0) / (labValues.length || 1));

  let level = 'Crypto Beginner';
  if (avg >= 80) level = 'Crypto Master';
  else if (avg >= 55) level = 'Crypto Explorer';
  else if (avg >= 30) level = 'Crypto Practitioner';

  const mergedRoadmap = dbData.roadmap.map((dbMod) => {
    const guestMod = guest.roadmap.find((m) => m.id === dbMod.id);
    if (!guestMod) return dbMod;
    
    let status = dbMod.status;
    if (guestMod.status === 'completed' || dbMod.status === 'completed') {
      status = 'completed';
    } else if (guestMod.status === 'in_progress' || dbMod.status === 'in_progress') {
      status = 'in_progress';
    }
    return { ...dbMod, status };
  });

  const labsCompleted = mergedRoadmap.filter((m) => m.status === 'completed').length;

  const mergedAlgos = dbData.algorithms.map((dbAlg) => {
    const guestAlg = guest.algorithms.find((a) => a.name === dbAlg.name);
    if (!guestAlg) return dbAlg;
    
    if (guestAlg.status === 'completed' || dbAlg.status === 'completed') {
      return { ...dbAlg, status: 'completed' as const, badgeColor: 'emerald' as const };
    }
    return dbAlg;
  });

  const mergedSkills = dbData.skills.map((dbSkill) => {
    const guestSkill = guest.skills.find((s) => s.name === dbSkill.name);
    if (!guestSkill) return dbSkill;
    
    const newLvl = Math.max(guestSkill.level || 0, dbSkill.level || 0);
    return {
      ...dbSkill,
      level: newLvl,
      badge: newLvl >= 85 ? 'Master' : newLvl >= 60 ? 'Expert' : newLvl >= 30 ? 'Practitioner' : 'Novice',
    };
  });

  const mergedAchievements = dbData.achievements.map((dbAch) => {
    const guestAch = guest.achievements.find((a) => a.id === dbAch.id);
    if (!guestAch) return dbAch;
    
    if (guestAch.status === 'unlocked' || dbAch.status === 'unlocked') {
      return {
        ...dbAch,
        status: 'unlocked' as const,
        progressPercent: 100,
        unlockedDate: dbAch.unlockedDate || guestAch.unlockedDate || new Date().toLocaleDateString(),
      };
    }
    return dbAch;
  });

  const visitedMap = new Map();
  dbData.recentVisited.forEach((v) => visitedMap.set(v.id, v));
  guest.recentVisited.forEach((v) => visitedMap.set(v.id, v));
  const mergedVisited = Array.from(visitedMap.values()).slice(0, 4);

  return {
    ...dbData,
    overallPercentage: avg,
    level,
    labsCompletedCount: labsCompleted,
    labProgress: mergedLabProgress,
    roadmap: mergedRoadmap,
    algorithms: mergedAlgos,
    skills: mergedSkills,
    achievements: mergedAchievements,
    recentVisited: mergedVisited,
  };
};

const DEFAULT_PROGRESS: ProgressState = {
  overallPercentage: 0,
  level: 'Crypto Beginner',
  labsCompletedCount: 0,
  totalLabs: 10,
  currentGoal: {
    title: 'Explore Hashing Laboratory',
    labName: 'Hashing Laboratory',
    path: '/labs/hashing',
    estMinutes: 15,
    progress: 0,
  },
  roadmap: [
    {
      id: 'intro',
      name: 'Cryptography Fundamentals',
      category: 'Overview',
      path: '/docs',
      status: 'in_progress',
      estTime: '10 min',
      description: 'Foundational concepts, ciphers, and security principles.',
    },
    {
      id: 'classical',
      name: 'Classical Ciphers Lab',
      category: 'History & Theory',
      path: '/labs/classical',
      status: 'in_progress',
      estTime: '15 min',
      description: 'Caesar shift sliders, Vigenère keywords, and Frequency Analysis visualizers.',
    },
    {
      id: 'hashing',
      name: 'Hashing Lab',
      category: 'Hashing',
      path: '/labs/hashing',
      status: 'in_progress',
      estTime: '15 min',
      description: 'SHA-256, MD5, SHA-3, HMAC, and avalanche effect.',
    },
    {
      id: 'passwords',
      name: 'Password Security Lab',
      category: 'Passwords',
      path: '/labs/passwords',
      status: 'locked',
      estTime: '20 min',
      description: 'Argon2id, bcrypt, PBKDF2, scrypt & entropy analysis.',
    },
    {
      id: 'symmetric',
      name: 'AES Encryption Lab',
      category: 'Symmetric',
      path: '/labs/symmetric',
      status: 'locked',
      estTime: '25 min',
      description: 'AES-CBC, AES-GCM, ChaCha20-Poly1305 modes.',
    },
    {
      id: 'asymmetric',
      name: 'RSA & ECC Lab',
      category: 'Asymmetric',
      path: '/labs/asymmetric',
      status: 'locked',
      estTime: '30 min',
      description: 'RSA 2048/4596 & ECC SECP256k1 key generation and encryption.',
    },
    {
      id: 'rsa-sandbox',
      name: 'RSA Math Sandbox',
      category: 'Asymmetric Math',
      path: '/labs/rsa-sandbox',
      status: 'locked',
      estTime: '15 min',
      description: 'Explore prime multiplication, Euler totients, and modular arithmetic step-by-step.',
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
    classical: 0,
    hashing: 0,
    passwords: 0,
    symmetric: 0,
    asymmetric: 0,
    rsaSandbox: 0,
    signatures: 0,
    certificates: 0,
    explorer: 0,
    challenges: 0,
  },
  algorithms: [
    {
      name: 'SHA256',
      type: 'Hash Function',
      status: 'learning',
      desc: '256-bit secure cryptographic hash algorithm used in Bitcoin & TLS.',
      badgeColor: 'cyan',
    },
    {
      name: 'SHA512',
      type: 'Hash Function',
      status: 'learning',
      desc: '512-bit digest function for high performance 64-bit architectures.',
      badgeColor: 'cyan',
    },
    {
      name: 'SHA3',
      type: 'Keccak Hash',
      status: 'learning',
      desc: 'NIST sponge-construction standard immune to length extension.',
      badgeColor: 'cyan',
    },
    {
      name: 'MD5',
      type: 'Legacy Hash',
      status: 'learning',
      desc: '128-bit broken hash studied for historic collision vulnerabilities.',
      badgeColor: 'gray',
    },
    {
      name: 'Argon2',
      type: 'KDF / Password',
      status: 'learning',
      desc: 'Memory-hard password hashing winner of PHC (Argon2id mode).',
      badgeColor: 'cyan',
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
    { name: 'Hashing', category: 'Core Primitive', level: 0, badge: 'Novice' },
    { name: 'Password Security', category: 'Authentication', level: 0, badge: 'Novice' },
    { name: 'Symmetric Encryption', category: 'Confidentiality', level: 0, badge: 'Novice' },
    { name: 'Asymmetric Encryption', category: 'Public Key Infra', level: 0, badge: 'Novice' },
    { name: 'Digital Signatures', category: 'Non-Repudiation', level: 0, badge: 'Novice' },
    { name: 'Cryptography Fundamentals', category: 'Theory', level: 0, badge: 'Novice' },
  ],
  recentVisited: [],
  achievements: [
    {
      id: 'beginner',
      title: 'Crypto Beginner',
      iconName: 'Shield',
      description: 'Started introduction to cryptographic primitives & safety principles.',
      status: 'in_progress',
      progressPercent: 20,
    },
    {
      id: 'hash_master',
      title: 'Hash Master',
      iconName: 'Zap',
      description: 'Mastered SHA-256, SHA-3, HMAC & Avalanche effect calculations.',
      status: 'locked',
      progressPercent: 0,
    },
    {
      id: 'enc_explorer',
      title: 'Encryption Explorer',
      iconName: 'Lock',
      description: 'Configured AES-GCM & ChaCha20-Poly1305 symmetric authenticated ciphers.',
      status: 'locked',
      progressPercent: 0,
    },
    {
      id: 'sec_enthusiast',
      title: 'Security Enthusiast',
      iconName: 'Award',
      description: 'Analyzed Argon2id memory hardness and password entropy formulas.',
      status: 'locked',
      progressPercent: 0,
    },
    {
      id: 'cipher_sleuth',
      title: 'Cipher Sleuth',
      iconName: 'Trophy',
      description: 'Solved all gamified cryptography challenges with 100% accuracy.',
      status: 'locked',
      progressPercent: 0,
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
  const { user, token } = useAuth();
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
      // Guest progress should never persist across refreshes (0% default)
      // Only restore from localStorage cache if an auth session token exists
      const token = localStorage.getItem('supabase_token');
      if (token) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_PROGRESS, ...parsed };
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });

  // Load progress from backend when user logs in and merge guest progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (user && token) {
        try {
          const response = await api.get('/progress');
          const data = response.data;
          if (data && data.progress_data && Object.keys(data.progress_data).length > 0) {
            // Save and merge guest progress with existing DB records
            setProgress((prev) => {
              const merged = mergeProgressState(prev, data.progress_data);
              api.post('/progress', merged).catch((err) => console.error("Failed to sync merged progress", err));
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          } else {
            // First time login for this account: commit current guest progress to database
            await api.post('/progress', progress);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          }
        } catch (err) {
          console.error("Failed to load progress from backend", err);
        }
      }
    };
    
    fetchProgress();
  }, [user, token]);

  // Clear caches and reset state back to 0% on logout
  useEffect(() => {
    if (!user) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      setProgress(DEFAULT_PROGRESS);
    }
  }, [user]);

  // Debounced sync of progress state to backend database
  useEffect(() => {
    if (user && token) {
      const syncProgress = async () => {
        try {
          await api.post('/progress', progress);
        } catch (err) {
          console.error("Failed to save progress to backend", err);
        }
      };

      const delayDebounce = setTimeout(() => {
        syncProgress();
      }, 1000); // 1-second debounce

      return () => clearTimeout(delayDebounce);
    }
  }, [progress, user, token]);

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
      const token = localStorage.getItem('supabase_token');
      if (token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage({ type: 'SYNC_PROGRESS', payload: newState });
        bc.close();
      }
    } catch (e) {
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
    if (!user) return;
    setProgress((prev) => {
      const filtered = prev.recentVisited.filter((v) => v.id !== id);
      const newVisit: RecentVisit = {
        id,
        name,
        path,
        timestamp: Date.now(),
      };

      const currentPercent = prev.labProgress[id] || 0;
      const initialPercent = Math.max(currentPercent, 20);
      const updatedLabProgress = { ...prev.labProgress, [id]: initialPercent };

      const labValues = Object.values(updatedLabProgress);
      const avg = Math.round(labValues.reduce((a, b) => a + b, 0) / (labValues.length || 1));

      let level = 'Crypto Beginner';
      if (avg >= 80) level = 'Crypto Master';
      else if (avg >= 55) level = 'Crypto Explorer';
      else if (avg >= 30) level = 'Crypto Practitioner';

      const updatedRoadmap = prev.roadmap.map((mod) => {
        if (mod.id === id) {
          const modStatus = initialPercent >= 100 ? ('completed' as const) : ('in_progress' as const);
          return { ...mod, status: modStatus };
        }
        return mod;
      });

      const labsCompleted = updatedRoadmap.filter((m) => m.status === 'completed').length;

      const currentGoal: CurrentGoal =
        initialPercent < 100
          ? {
              title: `Complete ${name}`,
              labName: name,
              path,
              estMinutes: 15,
              progress: initialPercent,
            }
          : prev.currentGoal;

      const newState: ProgressState = {
        ...prev,
        recentVisited: [newVisit, ...filtered.slice(0, 4)],
        labProgress: updatedLabProgress,
        overallPercentage: avg,
        level,
        labsCompletedCount: labsCompleted,
        roadmap: updatedRoadmap,
        currentGoal,
      };

      notifyStateChange(newState);
      return newState;
    });
  };

  const updateLabProgress = (id: string, percent: number) => {
    if (!user) return;
    setProgress((prev) => {
      const currentPercent = prev.labProgress[id] || 0;
      const newPercent = Math.min(100, Math.max(currentPercent, percent));

      if (newPercent === currentPercent && prev.labProgress[id] !== undefined && prev.labProgress[id] > 0) {
        return prev;
      }

      const updatedLabs = { ...prev.labProgress, [id]: newPercent };
      const labValues = Object.values(updatedLabs);
      const avg = Math.round(labValues.reduce((a, b) => a + b, 0) / (labValues.length || 1));

      let level = 'Crypto Beginner';
      if (avg >= 80) level = 'Crypto Master';
      else if (avg >= 55) level = 'Crypto Explorer';
      else if (avg >= 30) level = 'Crypto Practitioner';

      let nextLabPath = prev.currentGoal.path;
      let nextLabTitle = prev.currentGoal.title;
      let nextLabName = prev.currentGoal.labName;

      const updatedRoadmap = prev.roadmap.map((mod, idx, arr) => {
        if (mod.id === id) {
          const modStatus = newPercent >= 100 ? ('completed' as const) : ('in_progress' as const);
          if (newPercent >= 100 && arr[idx + 1] && arr[idx + 1].status === 'locked') {
            arr[idx + 1].status = 'in_progress';
            nextLabPath = arr[idx + 1].path;
            nextLabTitle = `Complete ${arr[idx + 1].name}`;
            nextLabName = arr[idx + 1].name;
          }
          return { ...mod, status: modStatus };
        }
        return mod;
      });

      const labsCompleted = updatedRoadmap.filter((m) => m.status === 'completed').length;

      if (newPercent >= 100 && currentPercent < 100) {
        addToastNotification('🎉 Lab Completed!', `You reached 100% completion in ${id.toUpperCase()} Lab!`, 'lab');
      }

      if (level !== prev.level) {
        addToastNotification('🏆 Level Up!', `Congratulations! You achieved level: ${level}`, 'level');
      }

      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'beginner' && avg >= 15 && ach.status !== 'unlocked') {
          return {
            ...ach,
            status: 'unlocked' as const,
            progressPercent: 100,
            unlockedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
        if (ach.id === 'hash_master' && updatedLabs['hashing'] >= 100 && ach.status !== 'unlocked') {
          return {
            ...ach,
            status: 'unlocked' as const,
            progressPercent: 100,
            unlockedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
        if (ach.id === 'enc_explorer' && updatedLabs['symmetric'] >= 100 && ach.status !== 'unlocked') {
          return {
            ...ach,
            status: 'unlocked' as const,
            progressPercent: 100,
            unlockedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
        if (ach.id === 'sec_enthusiast' && updatedLabs['passwords'] >= 100 && ach.status !== 'unlocked') {
          return {
            ...ach,
            status: 'unlocked' as const,
            progressPercent: 100,
            unlockedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
        if (ach.id === 'cipher_sleuth' && updatedLabs['challenges'] >= 100 && ach.status !== 'unlocked') {
          return {
            ...ach,
            status: 'unlocked' as const,
            progressPercent: 100,
            unlockedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }
        return ach;
      });

      const updatedSkills = prev.skills.map((skill) => {
        let newLvl = skill.level;
        if (skill.name === 'Hashing' && updatedLabs['hashing']) newLvl = updatedLabs['hashing'];
        if (skill.name === 'Password Security' && updatedLabs['passwords']) newLvl = updatedLabs['passwords'];
        if (skill.name === 'Symmetric Encryption' && updatedLabs['symmetric']) newLvl = updatedLabs['symmetric'];
        if (skill.name === 'Asymmetric Encryption' && updatedLabs['asymmetric']) newLvl = updatedLabs['asymmetric'];
        if (skill.name === 'Digital Signatures' && updatedLabs['signatures']) newLvl = updatedLabs['signatures'];
        if (skill.name === 'Cryptography Fundamentals') newLvl = avg;
        return {
          ...skill,
          level: newLvl,
          badge: newLvl >= 85 ? 'Master' : newLvl >= 60 ? 'Expert' : newLvl >= 30 ? 'Practitioner' : 'Novice',
        };
      });

      const currentGoal: CurrentGoal = {
        title: newPercent < 100 ? `Complete ${id.toUpperCase()} Lab` : nextLabTitle,
        labName: newPercent < 100 ? `${id.toUpperCase()} Lab` : nextLabName,
        path: newPercent < 100 ? prev.currentGoal.path : nextLabPath,
        estMinutes: 15,
        progress: newPercent < 100 ? newPercent : 0,
      };

      const newState: ProgressState = {
        ...prev,
        labProgress: updatedLabs,
        overallPercentage: avg,
        level,
        labsCompletedCount: labsCompleted,
        roadmap: updatedRoadmap,
        achievements: updatedAchievements,
        skills: updatedSkills,
        currentGoal,
      };

      notifyStateChange(newState);
      return newState;
    });
  };

  const recordAlgorithmLearned = (algoName: string) => {
    if (!user) return;
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

