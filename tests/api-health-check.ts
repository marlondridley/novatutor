/**
 * API Health Check Tests
 * Run this to verify all external services are reachable
 * 
 * Usage: npx tsx tests/api-health-check.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface TestResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

// ===========================================
// 1. SUPABASE TESTS
// ===========================================

async function testSupabase(): Promise<TestResult> {
  log('\n🧪 Testing Supabase...', 'cyan');
  const startTime = Date.now();

  try {
    const { createClient } = await import('@supabase/supabase-js');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        service: 'Supabase',
        status: 'skip',
        message: 'Missing credentials (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
      };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test 1: Connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (acceptable)
      throw error;
    }

    // Test 2: Auth health
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }

    const duration = Date.now() - startTime;
    log('  ✅ Connection successful', 'green');
    log(`  ✅ Auth service available`, 'green');
    log(`  ⏱️  Response time: ${duration}ms`, 'blue');

    return {
      service: 'Supabase',
      status: 'pass',
      message: `Connected successfully (${duration}ms)`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`  ❌ Failed: ${error.message}`, 'red');
    return {
      service: 'Supabase',
      status: 'fail',
      message: error.message,
      duration,
    };
  }
}

// ===========================================
// 2. DEEPSEEK TESTS
// ===========================================

async function testDeepSeek(): Promise<TestResult> {
  log('\n🧪 Testing DeepSeek API...', 'cyan');
  const startTime = Date.now();

  try {
    const OpenAI = (await import('openai')).default;

    if (!process.env.DEEPSEEK_API_KEY) {
      return {
        service: 'DeepSeek',
        status: 'skip',
        message: 'Missing credentials (DEEPSEEK_API_KEY)',
      };
    }

    const openai = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // Test: Simple completion
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Say "test successful" if you can read this.' }],
      max_tokens: 20,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokens = completion.usage?.total_tokens || 0;
    const duration = Date.now() - startTime;

    log('  ✅ Connection successful', 'green');
    log(`  ✅ Model response: "${response.substring(0, 50)}..."`, 'green');
    log(`  📊 Tokens used: ${tokens}`, 'blue');
    log(`  ⏱️  Response time: ${duration}ms`, 'blue');

    return {
      service: 'DeepSeek',
      status: 'pass',
      message: `Connected successfully (${duration}ms, ${tokens} tokens)`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`  ❌ Failed: ${error.message}`, 'red');
    return {
      service: 'DeepSeek',
      status: 'fail',
      message: error.message,
      duration,
    };
  }
}

// ===========================================
// 3. OPENAI TESTS
// ===========================================

async function testOpenAI(): Promise<TestResult> {
  log('\n🧪 Testing OpenAI API...', 'cyan');
  const startTime = Date.now();

  try {
    const OpenAI = (await import('openai')).default;

    if (!process.env.OPENAI_API_KEY) {
      return {
        service: 'OpenAI',
        status: 'skip',
        message: 'Missing credentials (OPENAI_API_KEY)',
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test: List available models (lightweight check)
    const models = await openai.models.list();
    const modelCount = models.data.length;
    const duration = Date.now() - startTime;

    // Check if required models are available
    const hasGPT4 = models.data.some(m => m.id.includes('gpt-4'));
    const hasTTS = models.data.some(m => m.id.includes('tts'));
    const hasWhisper = models.data.some(m => m.id.includes('whisper'));
    const hasDalle = models.data.some(m => m.id.includes('dall-e'));

    log('  ✅ Connection successful', 'green');
    log(`  📊 Available models: ${modelCount}`, 'blue');
    log(`  ${hasGPT4 ? '✅' : '⚠️'} GPT-4: ${hasGPT4 ? 'Available' : 'Not found'}`, hasGPT4 ? 'green' : 'yellow');
    log(`  ${hasTTS ? '✅' : '⚠️'} TTS: ${hasTTS ? 'Available' : 'Not found'}`, hasTTS ? 'green' : 'yellow');
    log(`  ${hasWhisper ? '✅' : '⚠️'} Whisper: ${hasWhisper ? 'Available' : 'Not found'}`, hasWhisper ? 'green' : 'yellow');
    log(`  ${hasDalle ? '✅' : '⚠️'} DALL-E: ${hasDalle ? 'Available' : 'Not found'}`, hasDalle ? 'green' : 'yellow');
    log(`  ⏱️  Response time: ${duration}ms`, 'blue');

    return {
      service: 'OpenAI',
      status: 'pass',
      message: `Connected successfully (${duration}ms, ${modelCount} models)`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`  ❌ Failed: ${error.message}`, 'red');
    return {
      service: 'OpenAI',
      status: 'fail',
      message: error.message,
      duration,
    };
  }
}

// ===========================================
// 4. UPSTASH REDIS TESTS
// ===========================================

async function testUpstash(): Promise<TestResult> {
  log('\n🧪 Testing Upstash Redis...', 'cyan');
  const startTime = Date.now();

  try {
    const { Redis } = await import('@upstash/redis');

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      log('  ⚠️  Skipped (optional service)', 'yellow');
      return {
        service: 'Upstash Redis',
        status: 'skip',
        message: 'Missing credentials (UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN) - Optional',
      };
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test 1: Write
    const testKey = `health-check:${Date.now()}`;
    await redis.set(testKey, 'test-value', { ex: 60 }); // Expires in 60s

    // Test 2: Read
    const value = await redis.get(testKey);

    // Test 3: Delete
    await redis.del(testKey);

    const duration = Date.now() - startTime;

    if (value !== 'test-value') {
      throw new Error('Write/Read test failed');
    }

    log('  ✅ Connection successful', 'green');
    log('  ✅ Write operation successful', 'green');
    log('  ✅ Read operation successful', 'green');
    log('  ✅ Delete operation successful', 'green');
    log(`  ⏱️  Response time: ${duration}ms`, 'blue');

    return {
      service: 'Upstash Redis',
      status: 'pass',
      message: `Connected successfully (${duration}ms)`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`  ❌ Failed: ${error.message}`, 'red');
    return {
      service: 'Upstash Redis',
      status: 'fail',
      message: error.message,
      duration,
    };
  }
}

// ===========================================
// 5. RATE LIMITING TEST (if Redis available)
// ===========================================

async function testRateLimiting(): Promise<TestResult> {
  log('\n🧪 Testing Rate Limiting...', 'cyan');
  const startTime = Date.now();

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      log('  ⚠️  Skipped (requires Redis)', 'yellow');
      return {
        service: 'Rate Limiting',
        status: 'skip',
        message: 'Requires Redis (optional)',
      };
    }

    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create a test rate limiter (5 requests per 10 seconds)
    const testLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      analytics: true,
      prefix: 'test:ratelimit',
    });

    // Test rate limiting
    const testIdentifier = `test-user-${Date.now()}`;
    const results = [];

    for (let i = 0; i < 6; i++) {
      const result = await testLimiter.limit(testIdentifier);
      results.push(result);
    }

    const duration = Date.now() - startTime;

    // First 5 should succeed, 6th should fail
    const firstFiveSuccess = results.slice(0, 5).every(r => r.success);
    const sixthFailed = !results[5].success;

    if (!firstFiveSuccess || !sixthFailed) {
      throw new Error('Rate limiting not working as expected');
    }

    log('  ✅ Rate limiter initialized', 'green');
    log('  ✅ First 5 requests allowed', 'green');
    log('  ✅ 6th request blocked (as expected)', 'green');
    log(`  ⏱️  Response time: ${duration}ms`, 'blue');

    return {
      service: 'Rate Limiting',
      status: 'pass',
      message: `Working correctly (${duration}ms)`,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    log(`  ❌ Failed: ${error.message}`, 'red');
    return {
      service: 'Rate Limiting',
      status: 'fail',
      message: error.message,
      duration,
    };
  }
}

// ===========================================
// RUN ALL TESTS
// ===========================================

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 SuperNOVA Tutor - API Health Check', 'cyan');
  log('='.repeat(60), 'cyan');

  // Run tests sequentially
  results.push(await testSupabase());
  results.push(await testDeepSeek());
  results.push(await testOpenAI());
  results.push(await testUpstash());
  results.push(await testRateLimiting());

  // Print summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const color = result.status === 'pass' ? 'green' : result.status === 'fail' ? 'red' : 'yellow';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    log(`${icon} ${result.service}: ${result.message}${duration}`, color);
  });

  log('\n' + '-'.repeat(60), 'blue');
  log(`Total: ${results.length} tests`, 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'blue');
  log(`⚠️  Skipped: ${skipped}`, 'yellow');
  log('-'.repeat(60), 'blue');

  if (failed > 0) {
    log('\n⚠️  Some tests failed. Check the errors above.', 'red');
    log('💡 Tip: Make sure all required environment variables are set in .env.local', 'yellow');
    process.exit(1);
  } else if (passed === 0) {
    log('\n⚠️  No tests passed. Check your .env.local configuration.', 'yellow');
    process.exit(1);
  } else {
    log('\n🎉 All tests passed! Your APIs are configured correctly.', 'green');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

