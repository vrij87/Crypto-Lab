import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if actual credentials are configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

/**
 * Mock Auth Client to provide a zero-setup local playground.
 * Simulates standard Supabase auth behaviors using localStorage persistence.
 */
class MockSupabaseAuth {
  private listener: ((event: string, session: any) => void) | null = null;
  private currentUser: any = null;

  constructor() {
    try {
      const savedUser = localStorage.getItem('mock_supabase_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.error("Failed to restore mock user state", e);
    }
  }

  async signInWithPassword({ email, password }: any) {
    if (!email || !password) {
      return { data: { user: null, session: null }, error: new Error('Email and password are required') };
    }
    
    const username = email.split('@')[0];
    const mockUser = {
      id: 'mock-user-uuid-12345678',
      email,
      user_metadata: { username },
    };
    
    const mockSession = {
      access_token: 'mock-jwt-token-abcdef123456',
      user: mockUser,
    };
    
    this.currentUser = mockUser;
    localStorage.setItem('mock_supabase_user', JSON.stringify(mockUser));
    localStorage.setItem('supabase_token', mockSession.access_token);
    
    if (this.listener) {
      this.listener('SIGNED_IN', mockSession);
    }
    
    return { data: { user: mockUser, session: mockSession }, error: null };
  }

  async signUp({ email, password, options }: any) {
    if (!email || !password) {
      return { data: { user: null, session: null }, error: new Error('Email and password are required') };
    }
    
    const username = options?.data?.username || email.split('@')[0];
    const mockUser = {
      id: 'mock-user-uuid-12345678',
      email,
      user_metadata: { username },
    };
    
    const mockSession = {
      access_token: 'mock-jwt-token-abcdef123456',
      user: mockUser,
    };
    
    this.currentUser = mockUser;
    localStorage.setItem('mock_supabase_user', JSON.stringify(mockUser));
    localStorage.setItem('supabase_token', mockSession.access_token);
    
    if (this.listener) {
      this.listener('SIGNED_IN', mockSession);
    }
    
    return { data: { user: mockUser, session: mockSession }, error: null };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('mock_supabase_user');
    localStorage.removeItem('supabase_token');
    
    if (this.listener) {
      this.listener('SIGNED_OUT', null);
    }
    
    return { error: null };
  }

  async getUser() {
    if (this.currentUser) {
      return { data: { user: this.currentUser }, error: null };
    }
    return { data: { user: null }, error: null };
  }

  async getSession() {
    if (this.currentUser) {
      const token = localStorage.getItem('supabase_token') || 'mock-jwt-token-abcdef123456';
      return {
        data: {
          session: {
            access_token: token,
            user: this.currentUser,
          },
        },
        error: null,
      };
    }
    return { data: { session: null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listener = callback;
    
    // Immediately emit current state upon binding
    if (this.currentUser) {
      const token = localStorage.getItem('supabase_token') || 'mock-jwt-token-abcdef123456';
      callback('SIGNED_IN', { access_token: token, user: this.currentUser });
    } else {
      callback('SIGNED_OUT', null);
    }
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listener = null;
          },
        },
      },
    };
  }
}

export const mockSupabase = {
  auth: new MockSupabaseAuth(),
};

/**
 * Returns the active client: true Supabase client if configured, otherwise simulated Mock auth.
 */
export const getSupabaseClient = () => {
  return isSupabaseConfigured ? supabase : (mockSupabase as any);
};
