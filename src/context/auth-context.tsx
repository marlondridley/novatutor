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
          console.log('🔄 Using cached profile');
          return cached.data;
        }
      }

      console.log('🔄 Querying database for profile:', userId);
      console.log('🔄 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔄 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('🔄 Database query completed, data:', !!data, 'error:', !!error);

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return null;
      }

      // ⚡ Cache the result
      if (data) {
        console.log('✅ Profile data received:', data);
        profileCache.current.set(userId, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 Auth context initializing...');
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 Initial session check:', session ? 'Session exists' : 'No session');
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        console.log('🔄 Fetching profile for user:', session.user.id);
        fetchUserProfile(session.user.id)
          .then((profile) => {
            console.log('🔄 Profile loaded:', profile);
            setUser(profile);
            setLoading(false);
          })
          .catch((err) => {
            console.error('❌ Error fetching profile:', err);
            setLoading(false);
          });
      } else {
        console.log('🔄 No session, setting loading to false');
        setLoading(false);
      }
    }).catch((err) => {
      console.error('❌ Error getting session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        console.log('🔄 Fetching profile after auth change:', session.user.id);
        try {
          const profile = await fetchUserProfile(session.user.id);
          console.log('🔄 Profile loaded after auth change:', profile);
          setUser(profile);
        } catch (err) {
          console.error('❌ Error fetching profile after auth change:', err);
          setUser(null);
        }
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
      
      console.log('Attempting to sign in...', email);
      
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from Supabase');
      }

      console.log('User authenticated:', data.user.id);
      console.log('Email confirmed:', data.user.email_confirmed_at);

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        throw new Error('Please verify your email before logging in. Check your inbox for the confirmation link.');
      }

      // Fetch user profile
      console.log('Fetching user profile...');
      const profile = await fetchUserProfile(data.user.id);
      
      if (!profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      console.log('Profile loaded:', profile);
      setUser(profile);

      return { error: null, shouldRedirectToPricing: false };
    } catch (error: any) {
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
