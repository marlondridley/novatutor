import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for API routes
 * Reads auth from both cookies AND Authorization header
 */
export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  
  // Get Authorization header if present
  const authHeader = headerStore.get('authorization');
  const accessToken = authHeader?.replace('Bearer ', '');
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        cookie: cookieStore.toString(),
      },
    },
  });
}

