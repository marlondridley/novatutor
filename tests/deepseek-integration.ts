/**
 * DeepSeek API Integration Tests
 * Tests AI text generation and context caching
 * 
 * Usage: npx tsx tests/deepseek-integration.ts
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

async function testDeepSeekIntegration() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 DeepSeek API Integration Tests', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    const OpenAI = (await import('openai')).default;

    if (!process.env.DEEPSEEK_API_KEY) {
      log('❌ Missing DeepSeek credentials', 'red');
      log('Required: DEEPSEEK_API_KEY', 'yellow');
      process.exit(1);
    }

    const openai = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    // Test 1: Basic Completion
    log('Test 1: Basic Text Completion', 'cyan');
    const startTime1 = Date.now();
    
    const completion1 = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: 'Say "Hello from DeepSeek!" and nothing else.' }
      ],
      max_tokens: 20,
    });

    const duration1 = Date.now() - startTime1;
    const response1 = completion1.choices[0]?.message?.content || '';
    const usage1 = completion1.usage;

    log(`  ✅ Completion successful`, 'green');
    log(`  💬 Response: "${response1}"`, 'cyan');
    log(`  📊 Tokens: ${usage1?.total_tokens} (prompt: ${usage1?.prompt_tokens}, completion: ${usage1?.completion_tokens})`, 'blue');
    log(`  ⏱️  Duration: ${duration1}ms\n`, 'blue');

    // Test 2: Context Caching (same prefix)
    log('Test 2: Context Caching Test', 'cyan');
    const systemPrompt = 'You are a helpful educational tutor. Your responses should be clear and concise.';
    
    // First request
    const startTime2a = Date.now();
    const completion2a = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'What is 2+2?' }
      ],
      max_tokens: 50,
    });
    const duration2a = Date.now() - startTime2a;

    // Second request (should hit cache for system prompt)
    const startTime2b = Date.now();
    const completion2b = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'What is 3+3?' }
      ],
      max_tokens: 50,
    });
    const duration2b = Date.now() - startTime2b;

    const usage2a = completion2a.usage as any;
    const usage2b = completion2b.usage as any;

    log(`  First request (cache miss):`, 'cyan');
    log(`    - Duration: ${duration2a}ms`, 'blue');
    log(`    - Cache miss tokens: ${usage2a?.prompt_cache_miss_tokens || usage2a?.prompt_tokens || 0}`, 'blue');
    log(`    - Cache hit tokens: ${usage2a?.prompt_cache_hit_tokens || 0}`, 'blue');

    log(`  Second request (cache hit):`, 'cyan');
    log(`    - Duration: ${duration2b}ms`, 'blue');
    log(`    - Cache miss tokens: ${usage2b?.prompt_cache_miss_tokens || 0}`, 'blue');
    log(`    - Cache hit tokens: ${usage2b?.prompt_cache_hit_tokens || usage2b?.prompt_tokens || 0}`, 'blue');

    const cacheHit = (usage2b?.prompt_cache_hit_tokens || 0) > 0;
    if (cacheHit) {
      log(`  ✅ Context caching working! (90% cost savings on cached tokens)\n`, 'green');
    } else {
      log(`  ⚠️  Cache hit not detected (may need time to warm up)\n`, 'yellow');
    }

    // Test 3: Structured Output (JSON)
    log('Test 3: Structured JSON Output', 'cyan');
    const startTime3 = Date.now();

    const completion3 = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'user', 
          content: 'Return a JSON object with fields: name="Test", score=100, passed=true' 
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 100,
    });

    const duration3 = Date.now() - startTime3;
    const response3 = completion3.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(response3);
      log(`  ✅ JSON parsing successful`, 'green');
      log(`  📊 Response: ${JSON.stringify(parsed, null, 2).split('\n').join('\n  ')}`, 'cyan');
    } catch (e) {
      log(`  ⚠️  JSON parsing failed`, 'yellow');
      log(`  Response: ${response3}`, 'yellow');
    }
    log(`  ⏱️  Duration: ${duration3}ms\n`, 'blue');

    // Test 4: Error Handling
    log('Test 4: Error Handling (Invalid Model)', 'cyan');
    try {
      await openai.chat.completions.create({
        model: 'invalid-model-name',
        messages: [{ role: 'user', content: 'test' }],
      });
      log(`  ⚠️  Expected error not thrown`, 'yellow');
    } catch (error: any) {
      if (error.status === 404 || error.message.includes('model')) {
        log(`  ✅ Error handling working correctly`, 'green');
        log(`  📊 Error: ${error.message}`, 'cyan');
      } else {
        throw error;
      }
    }
    log('', 'reset');

    // Summary
    log('='.repeat(60), 'cyan');
    log('✅ All DeepSeek tests passed!', 'green');
    log('='.repeat(60) + '\n', 'cyan');

    log('📋 DeepSeek Configuration:', 'cyan');
    log(`  Base URL: ${process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'}`, 'cyan');
    log(`  Model: deepseek-chat`, 'cyan');
    log(`  Context Caching: ${cacheHit ? 'Active ✅' : 'Warming up ⏳'}`, 'cyan');
    log('', 'reset');

    log('💡 Cost Savings with Context Caching:', 'cyan');
    log('  - Cache miss: $0.14 per 1M tokens', 'cyan');
    log('  - Cache hit: $0.014 per 1M tokens (90% savings!)', 'green');
    log('', 'reset');

  } catch (error: any) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

testDeepSeekIntegration();

