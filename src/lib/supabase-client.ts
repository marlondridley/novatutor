import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Single client instance for browser (prevents multiple instances warning)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage for persistence across browser sessions
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Auto-refresh token before it expires (keeps user logged in)
    autoRefreshToken: true,
    // Persist session across browser tabs and restarts
    persistSession: true,
    // Detect session in URL (for email confirmations, password resets, etc.)
    detectSessionInUrl: true,
    // Session will be stored and auto-refresh for 7 days
    storageKey: 'supabase.auth.token',
  },
});

// Session-only client (for when "Remember Me" is unchecked)
export const supabaseSessionOnly = typeof window !== 'undefined' 
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.sessionStorage, // Cleared when browser closes
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.session',
      },
    })
  : supabase; // Fallback to default for SSR

// Database types will be generated here later
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          age: number
          grade: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          age: number
          grade: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          age?: number
          grade?: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

