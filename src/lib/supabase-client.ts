// ⚠️ This file is kept for backward compatibility
// New code should use: import { createClient } from '@/utils/supabase/client'

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ⚡ Use the official Supabase SSR client for browser
// This automatically handles cookies correctly
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!clientInstance && typeof window !== 'undefined') {
    clientInstance = createBrowserClient(
      supabaseUrl!,
      supabaseAnonKey!
    );
  }
  return clientInstance;
}

// Single client instance for browser
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient()! 
  : createBrowserClient(supabaseUrl!, supabaseAnonKey!);

// ⚡ DEPRECATED: Use supabase client
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

