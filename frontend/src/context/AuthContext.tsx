import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabaseClient';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  token: string | null;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseClient = getSupabaseClient();
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          setToken(session.access_token);
          localStorage.setItem('supabase_token', session.access_token);
        } else {
          localStorage.removeItem('supabase_token');
        }
      } catch (err) {
        console.error("Error fetching initial session", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event: string, currentSession: any) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setToken(currentSession.access_token);
        localStorage.setItem('supabase_token', currentSession.access_token);
      } else {
        setSession(null);
        setUser(null);
        setToken(null);
        localStorage.removeItem('supabase_token');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        token,
        isMock: !isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
