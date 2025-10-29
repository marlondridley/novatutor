/**
 * Upstash Redis Integration Tests
 * Tests caching, rate limiting, and cost tracking
 * 
 * Usage: npx tsx tests/redis-integration.ts
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
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRedisIntegration() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 Upstash Redis Integration Tests', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    const { Redis } = await import('@upstash/redis');
    const { Ratelimit } = await import('@upstash/ratelimit');

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      log('❌ Missing Upstash Redis credentials', 'red');
      log('Required: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN', 'yellow');
      log('Note: Redis is optional but recommended for production', 'yellow');
      process.exit(1);
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test 1: Basic Read/Write
    log('Test 1: Basic Read/Write Operations', 'cyan');
    const testKey = `test:${Date.now()}`;
    const testValue = { message: 'Hello Redis!', timestamp: Date.now() };

    const startTime1 = Date.now();
    await redis.set(testKey, JSON.stringify(testValue), { ex: 60 });
    const writeTime = Date.now() - startTime1;

    const startTime2 = Date.now();
    const retrieved = await redis.get(testKey);
    const readTime = Date.now() - startTime2;

    const parsed = retrieved ? JSON.parse(retrieved as string) : null;

    if (parsed && parsed.message === 'Hello Redis!') {
      log(`  ✅ Write successful (${writeTime}ms)`, 'green');
      log(`  ✅ Read successful (${readTime}ms)`, 'green');
      log(`  📊 Retrieved: ${JSON.stringify(parsed)}`, 'cyan');
    } else {
      throw new Error('Read/Write test failed');
    }

    await redis.del(testKey);
    log(`  ✅ Delete successful\n`, 'green');

    // Test 2: TTL (Time To Live)
    log('Test 2: TTL (Expiration)', 'cyan');
    const ttlKey = `test:ttl:${Date.now()}`;
    await redis.set(ttlKey, 'expires soon', { ex: 5 }); // 5 seconds

    const ttl = await redis.ttl(ttlKey);
    log(`  ✅ TTL set successfully`, 'green');
    log(`  📊 Expires in: ${ttl} seconds`, 'cyan');

    await redis.del(ttlKey);
    log('', 'reset');

    // Test 3: Atomic Operations
    log('Test 3: Atomic Operations (Increment)', 'cyan');
    const counterKey = `test:counter:${Date.now()}`;

    await redis.set(counterKey, 0);
    await redis.incr(counterKey);
    await redis.incr(counterKey);
    await redis.incr(counterKey);

    const counter = await redis.get(counterKey);
    if (counter === 3) {
      log(`  ✅ Atomic increment working`, 'green');
      log(`  📊 Counter value: ${counter}`, 'cyan');
    } else {
      throw new Error(`Expected counter=3, got ${counter}`);
    }

    await redis.del(counterKey);
    log('', 'reset');

    // Test 4: Rate Limiting
    log('Test 4: Rate Limiting', 'cyan');
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'), // 5 requests per 10 seconds
      analytics: true,
      prefix: 'test:ratelimit',
    });

    const testId = `user-${Date.now()}`;
    const results = [];

    log(`  Testing ${testId}...`, 'cyan');

    for (let i = 0; i < 6; i++) {
      const result = await limiter.limit(testId);
      results.push(result);
      log(`    Request ${i + 1}: ${result.success ? '✅ Allowed' : '❌ Blocked'} (${result.remaining} remaining)`, 
          result.success ? 'green' : 'red');
    }

    const firstFiveSuccess = results.slice(0, 5).every(r => r.success);
    const sixthBlocked = !results[5].success;

    if (firstFiveSuccess && sixthBlocked) {
      log(`  ✅ Rate limiting working correctly!`, 'green');
    } else {
      throw new Error('Rate limiting test failed');
    }
    log('', 'reset');

    // Test 5: Hash Operations (User Session)
    log('Test 5: Hash Operations (Session Storage)', 'cyan');
    const sessionKey = `test:session:${Date.now()}`;
    const sessionData = {
      userId: 'user-123',
      lastActivity: Date.now(),
      subject: 'Math',
    };

    await redis.hset(sessionKey, sessionData);
    const retrievedSession = await redis.hgetall(sessionKey);

    if (retrievedSession && retrievedSession.userId === 'user-123') {
      log(`  ✅ Hash operations working`, 'green');
      log(`  📊 Session: ${JSON.stringify(retrievedSession)}`, 'cyan');
    } else {
      throw new Error('Hash operations test failed');
    }

    await redis.del(sessionKey);
    log('', 'reset');

    // Test 6: Cost Tracking Simulation
    log('Test 6: Cost Tracking Simulation', 'cyan');
    const userId = `test-user-${Date.now()}`;
    const month = new Date().toISOString().slice(0, 7);

    // Simulate tracking costs
    await redis.incrbyfloat(`cost:user:${userId}:${month}`, 0.001);
    await redis.incrbyfloat(`cost:user:${userId}:${month}`, 0.002);
    await redis.incrbyfloat(`cost:user:${userId}:${month}`, 0.003);

    const totalCost = await redis.get(`cost:user:${userId}:${month}`);
    const expected = 0.006;

    if (Math.abs((totalCost as number) - expected) < 0.0001) {
      log(`  ✅ Cost tracking working`, 'green');
      log(`  📊 Total cost: $${(totalCost as number).toFixed(4)}`, 'cyan');
    } else {
      throw new Error(`Expected cost=${expected}, got ${totalCost}`);
    }

    await redis.del(`cost:user:${userId}:${month}`);
    log('', 'reset');

    // Summary
    log('='.repeat(60), 'cyan');
    log('✅ All Redis tests passed!', 'green');
    log('='.repeat(60) + '\n', 'cyan');

    log('📋 Redis Configuration:', 'cyan');
    log(`  URL: ${process.env.UPSTASH_REDIS_REST_URL}`, 'cyan');
    log(`  Region: ${process.env.UPSTASH_REDIS_REST_URL.split('.')[1]}`, 'cyan');
    log('', 'reset');

    log('💡 Redis Features Tested:', 'cyan');
    log('  ✅ Read/Write operations', 'green');
    log('  ✅ TTL (expiration)', 'green');
    log('  ✅ Atomic operations (incr)', 'green');
    log('  ✅ Rate limiting', 'green');
    log('  ✅ Hash operations (sessions)', 'green');
    log('  ✅ Cost tracking (float operations)', 'green');
    log('', 'reset');

  } catch (error: any) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

testRedisIntegration();

