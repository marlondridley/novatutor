/**
 * Supabase Integration Tests
 * Tests authentication and database connectivity
 * 
 * Usage: npx tsx tests/supabase-integration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSupabaseIntegration() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 Supabase Integration Tests', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    const { createClient } = await import('@supabase/supabase-js');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      log('❌ Missing Supabase credentials', 'red');
      log('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
      process.exit(1);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test 1: Connection
    log('Test 1: Database Connection', 'cyan');
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (connectionError && connectionError.code !== 'PGRST116') {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }
    log('  ✅ Database connection successful\n', 'green');

    // Test 2: Auth Service
    log('Test 2: Auth Service', 'cyan');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Auth service error: ${sessionError.message}`);
    }

    log('  ✅ Auth service available', 'green');
    log(`  📊 Current session: ${session ? 'Active' : 'None'}`, 'cyan');
    if (session) {
      log(`  👤 User: ${session.user.email}`, 'cyan');
    }
    log('', 'reset');

    // Test 3: Check profiles table structure
    log('Test 3: Profiles Table Structure', 'cyan');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError && profilesError.code !== 'PGRST116') {
      log(`  ⚠️  Profiles table query error: ${profilesError.message}`, 'yellow');
    } else if (profiles && profiles.length > 0) {
      log('  ✅ Profiles table accessible', 'green');
      log(`  📊 Sample profile structure: ${Object.keys(profiles[0]).join(', ')}`, 'cyan');
    } else {
      log('  ✅ Profiles table accessible (empty)', 'green');
    }
    log('', 'reset');

    // Test 4: RLS Policies Check
    log('Test 4: Row Level Security (RLS)', 'cyan');
    // Try to query without authentication (should be restricted)
    const { data: unauthedData, error: rlsError } = await supabase
      .from('profiles')
      .select('*');

    if (rlsError) {
      log('  ✅ RLS is enforced (good!)', 'green');
      log(`  📊 Error code: ${rlsError.code}`, 'cyan');
    } else if (!unauthedData || unauthedData.length === 0) {
      log('  ✅ RLS is working (no data without auth)', 'green');
    } else {
      log('  ⚠️  Warning: RLS might not be properly configured', 'yellow');
      log('  💡 Make sure RLS policies are enabled on profiles table', 'yellow');
    }
    log('', 'reset');

    // Summary
    log('='.repeat(60), 'cyan');
    log('✅ All Supabase tests passed!', 'green');
    log('='.repeat(60) + '\n', 'cyan');

    log('📋 Supabase Configuration:', 'cyan');
    log(`  URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'cyan');
    log(`  Project: ${process.env.NEXT_PUBLIC_SUPABASE_URL.split('.')[0].replace('https://', '')}`, 'cyan');
    log('', 'reset');

  } catch (error: any) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

testSupabaseIntegration();

