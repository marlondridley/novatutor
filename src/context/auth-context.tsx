'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Create singleton Supabase client
const supabase = createClient();

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  grade: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  student_id?: string;
  premium_voice_enabled?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; shouldRedirectToPricing?: boolean }>;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'email'>) => Promise<{ error: Error | null; shouldRedirectToPricing?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cache to prevent unnecessary fetches
  const profileCache = useRef<Map<string, { data: UserProfile; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Fetch user profile from database with caching
  const fetchUserProfile = async (userId: string, forceRefresh = false): Promise<UserProfile | null> => {
    try {
      console.log('[Auth] fetchUserProfile called for:', userId, 'forceRefresh:', forceRefresh);
      
      // Check cache first
      if (!forceRefresh) {
        const cached = profileCache.current.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log('[Auth] Using cached profile');
          return cached.data;
        }
      }

      // First check if we have a valid session
      console.log('[Auth] Checking session...');
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log('[Auth] No active session');
        return null;
      }
      
      // Try query with shorter timeout
      console.log('[Auth] Fetching profile from Supabase...');
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ]);

      if (error || !data) {
        console.error('[Auth] Profile query error:', error);
        return null;
      }
      
      console.log('[Auth] Profile fetched successfully');
      profileCache.current.set(userId, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      console.error('[Auth] fetchUserProfile exception:', err);
      return null;
    }
  };

  useEffect(() => {
    // Safety timeout - force loading to false after 10 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('[Auth] Safety timeout reached - forcing loading to false');
      setLoading(false);
    }, 10000);

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Session check:', !!session, session?.user?.email);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        console.log('[Auth] Fetching profile for:', session.user.id);
        fetchUserProfile(session.user.id)
          .then((profile) => {
            console.log('[Auth] Profile fetched:', !!profile);
            setUser(profile);
            setLoading(false);
            clearTimeout(safetyTimeout);
          })
          .catch((err) => {
            console.error('[Auth] Profile fetch error:', err);
            setLoading(false);
            clearTimeout(safetyTimeout);
          });
      } else {
        console.log('[Auth] No session, setting loading to false');
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    }).catch((err) => {
      console.error('[Auth] Session check error:', err);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => clearTimeout(safetyTimeout);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, _rememberMe: boolean = true) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from Supabase');
      }

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        throw new Error('Please verify your email before logging in. Check your inbox for the confirmation link.');
      }

      // Fetch user profile with retry
      let profile = await fetchUserProfile(data.user.id);
      
      // Retry once if it fails
      if (!profile) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        profile = await fetchUserProfile(data.user.id);
      }
      
      if (!profile) {
        // Create a minimal profile from auth data as fallback
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || 'Student',
          age: data.user.user_metadata?.age || 0,
          grade: data.user.user_metadata?.grade || '',
          role: data.user.user_metadata?.role || 'student',
        };
      }

      setUser(profile);

      return { error: null, shouldRedirectToPricing: false };
    } catch (error: any) {
      return { error: error as Error, shouldRedirectToPricing: false };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profile: Omit<UserProfile, 'id' | 'email'>
  ) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Failed to create account');
      }
      
      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: authData.user.email!,
        ...profile,
      });

      if (profileError) {
        throw new Error(profileError.message || 'Failed to create user profile');
      }

      return { error: null };
    } catch (error: any) {
      return { 
        error: new Error(error?.message || error?.toString() || 'An unknown error occurred during signup') 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    router.push('/login');
  };

  const refreshProfile = async () => {
    if (supabaseUser?.id) {
      const profile = await fetchUserProfile(supabaseUser.id, true);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
