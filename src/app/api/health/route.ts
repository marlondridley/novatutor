import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Health Check Endpoint
 * Returns service status and connectivity checks
 * 
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // Check Supabase connection
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.from('profiles').select('count').limit(1);
    checks.supabase = {
      status: error ? 'unhealthy' : 'healthy',
      responseTime: Date.now() - startTime,
      error: error?.message,
    };
  } catch (error: any) {
    checks.supabase = {
      status: 'unhealthy',
      error: error.message,
    };
  }

  // Check Stripe configuration
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
    mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
  };

  // Check OpenAI configuration
  checks.openai = {
    status: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
  };

  // Check Redis configuration
  checks.redis = {
    status: (process.env.REDIS_URL && process.env.REDIS_TOKEN) ? 'configured' : 'missing',
  };

  // Overall status
  const allHealthy = Object.values(checks).every(
    (check: any) => check.status === 'healthy' || check.status === 'configured'
  );

  const status = allHealthy ? 'healthy' : 'degraded';
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    },
    { status: statusCode }
  );
}
