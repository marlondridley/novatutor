import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test 1: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Test 2: Create client
    const supabase = await createClient();
    
    // Test 3: Check auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Test 4: Try a simple query (doesn't require auth)
    let queryTest = { success: false, error: null as any };
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      queryTest = { success: !error, error: error?.message };
    } catch (e: any) {
      queryTest = { success: false, error: e.message };
    }
    
    const endTime = Date.now();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      latency: `${endTime - startTime}ms`,
      checks: {
        environment: {
          hasUrl,
          hasKey,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        },
        session: {
          exists: !!session,
          userId: session?.user?.id?.substring(0, 8) + '...',
          error: sessionError?.message,
        },
        query: queryTest,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

