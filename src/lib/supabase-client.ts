import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ⚡ Single client instance to avoid "Multiple GoTrueClient instances" warning
// We'll handle "Remember Me" by switching storage dynamically instead of creating multiple clients
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

function getSupabaseClient() {
  if (!clientInstance && typeof window !== 'undefined') {
    clientInstance = createSupabaseClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: window.localStorage, // Default to localStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
      },
    });
  }
  return clientInstance;
}

// Single client instance for browser
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient()! 
  : createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

// ⚡ DEPRECATED: Use supabase client with storage switching instead
// Keeping for backward compatibility but will use same instance
export const supabaseSessionOnly = supabase;

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

