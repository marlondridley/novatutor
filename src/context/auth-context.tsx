'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseSessionOnly } from '@/lib/supabase-client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  grade: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  student_id?: string;
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

  // ⚡ Cache to prevent unnecessary fetches
  const profileCache = useRef<Map<string, { data: UserProfile; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Fetch user profile from database with caching
  const fetchUserProfile = async (userId: string, forceRefresh = false): Promise<UserProfile | null> => {
    try {
      // ⚡ Check cache first
      if (!forceRefresh) {
        const cached = profileCache.current.get(userId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // ⚡ Cache the result
      if (data) {
        profileCache.current.set(userId, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(setUser);
      }
      setLoading(false);
    });

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

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      // Choose storage based on "Remember Me" checkbox
      const authClient = rememberMe ? supabase : supabaseSessionOnly;
      
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }

      return { error: null, shouldRedirectToPricing: false };
    } catch (error) {
      console.error('Sign in error:', error);
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
        console.error('Auth signup error:', authError);
        throw new Error(authError.message || 'Failed to create account');
      }
      
      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      console.log('User created:', authData.user.id);

      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: authData.user.email!,
        ...profile,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(profileError.message || 'Failed to create user profile');
      }

      console.log('Profile created successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
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
