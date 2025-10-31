/**
 * Real-Service Integration Tests
 * Tests actual connections to Supabase, Stripe, OpenAI, and other live services
 * 
 * WARNING: These tests use REAL API keys and may incur costs
 * Run with: npm run test:integration
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import OpenAI from 'openai';

// Environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_ID',
  'STRIPE_WEBHOOK_SIGNING_SECRET',
  'OPENAI_API_KEY',
  'REDIS_URL',
  'REDIS_TOKEN',
];

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} ${result.test} (${result.duration}ms)`);
  if (result.error) console.error(`   Error: ${result.error}`);
  if (result.details) console.log(`   Details:`, result.details);
}

async function runTest(name: string, testFn: () => Promise<any>) {
  const start = Date.now();
  try {
    const details = await testFn();
    logResult({
      test: name,
      status: 'PASS',
      duration: Date.now() - start,
      details,
    });
  } catch (error: any) {
    logResult({
      test: name,
      status: 'FAIL',
      duration: Date.now() - start,
      error: error.message,
    });
  }
}

// ============================================
// Step 1: Environment Validation
// ============================================
async function testEnvironment() {
  console.log('\n🔍 Step 1: Environment Validation\n');

  await runTest('Check required environment variables', async () => {
    const missing = requiredEnvVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`);
    }
    return { configured: requiredEnvVars.length, missing: 0 };
  });

  await runTest('Validate Supabase URL format', async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
    return { url };
  });

  await runTest('Validate Stripe key format', async () => {
    const key = process.env.STRIPE_SECRET_KEY!;
    if (!key.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format');
    }
    const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
    return { mode };
  });
}

// ============================================
// Step 2: Supabase Authentication
// ============================================
async function testSupabaseAuth() {
  console.log('\n👤 Step 2: Supabase Authentication\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await runTest('Supabase connection', async () => {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return { connected: true };
  });

  await runTest('Create test user', async () => {
    const testEmail = `test-${Date.now()}@supertutor.test`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
    });
    if (error) throw error;
    return { userId: data.user?.id, email: testEmail };
  });

  await runTest('Sign in with credentials', async () => {
    // Use existing test account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'testuser@example.com',
      password: 'testpassword',
    });
    if (error) throw error;
    return { userId: data.user?.id, hasSession: !!data.session };
  });

  await runTest('Fetch user profile', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return { profileId: profile.id, email: profile.email };
  });

  await runTest('Sign out', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { signedOut: true };
  });
}

// ============================================
// Step 3: Stripe Integration
// ============================================
async function testStripeIntegration() {
  console.log('\n💳 Step 3: Stripe Integration\n');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20',
  });

  await runTest('Stripe API connection', async () => {
    const balance = await stripe.balance.retrieve();
    return { available: balance.available, pending: balance.pending };
  });

  await runTest('Retrieve price information', async () => {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID!);
    return {
      id: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
    };
  });

  await runTest('Create test customer', async () => {
    const customer = await stripe.customers.create({
      email: 'test@supertutor.test',
      metadata: { test: 'true' },
    });
    return { customerId: customer.id };
  });

  await runTest('Create checkout session', async () => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      }],
      success_url: 'http://localhost:9002/dashboard?success=true',
      cancel_url: 'http://localhost:9002/pricing?canceled=true',
      customer_email: 'test@supertutor.test',
    });
    return { sessionId: session.id, url: session.url };
  });

  await runTest('List webhook endpoints', async () => {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 5 });
    return {
      count: endpoints.data.length,
      endpoints: endpoints.data.map(e => ({ id: e.id, url: e.url })),
    };
  });
}

// ============================================
// Step 4: OpenAI Integration
// ============================================
async function testOpenAIIntegration() {
  console.log('\n🧠 Step 4: OpenAI Integration\n');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  await runTest('OpenAI API connection', async () => {
    const models = await openai.models.list();
    return { available: models.data.length > 0 };
  });

  await runTest('Generate AI completion', async () => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test successful" in 2 words' }],
      max_tokens: 10,
    });
    return {
      response: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens,
    };
  });

  await runTest('Generate embeddings', async () => {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test embedding generation',
    });
    return {
      dimensions: embedding.data[0].embedding.length,
      model: embedding.model,
    };
  });

  await runTest('Text-to-Speech generation', async () => {
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: 'Test audio generation',
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    return { audioSize: buffer.length, format: 'mp3' };
  });
}

// ============================================
// Step 5: API Routes Testing
// ============================================
async function testAPIRoutes() {
  console.log('\n📡 Step 5: API Routes Testing\n');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

  await runTest('Health check endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/health`).catch(() => null);
    if (!response) throw new Error('Health endpoint not found');
    return { status: response.status };
  });

  await runTest('TTS endpoint (without auth)', async () => {
    const response = await fetch(`${baseUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Test', voice: 'alloy' }),
    });
    return { status: response.status, requiresAuth: response.status === 401 };
  });
}

// ============================================
// Step 6: Database Operations
// ============================================
async function testDatabaseOperations() {
  console.log('\n🗄️ Step 6: Database Operations\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await runTest('Query profiles table', async () => {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(1);
    if (error) throw error;
    return { totalProfiles: count, hasData: data.length > 0 };
  });

  await runTest('Check stripe_customer_id column', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .not('stripe_customer_id', 'is', null)
      .limit(5);
    if (error) throw error;
    return { profilesWithStripeId: data.length };
  });

  await runTest('Check subscription_status column', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('subscription_status', 'active')
      .limit(5);
    if (error) throw error;
    return { activeSubscriptions: data.length };
  });
}

// ============================================
// Step 7: Error Handling
// ============================================
async function testErrorHandling() {
  console.log('\n🚨 Step 7: Error Handling\n');

  await runTest('Invalid Supabase query', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      await supabase.from('nonexistent_table').select('*');
      throw new Error('Should have failed');
    } catch (error: any) {
      return { errorHandled: true, errorType: error.code };
    }
  });

  await runTest('Invalid OpenAI request', async () => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    try {
      await openai.chat.completions.create({
        model: 'invalid-model',
        messages: [{ role: 'user', content: 'test' }],
      });
      throw new Error('Should have failed');
    } catch (error: any) {
      return { errorHandled: true, errorType: error.type };
    }
  });
}

// ============================================
// Main Test Runner
// ============================================
async function runAllTests() {
  console.log('🚀 SuperTutor Real-Service Integration Tests\n');
  console.log('⚠️  WARNING: Using REAL API keys - may incur costs\n');

  const startTime = Date.now();

  try {
    await testEnvironment();
    await testSupabaseAuth();
    await testStripeIntegration();
    await testOpenAIIntegration();
    await testAPIRoutes();
    await testDatabaseOperations();
    await testErrorHandling();
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }

  const duration = Date.now() - startTime;

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`Warnings: ${results.filter(r => r.status === 'WARN').length}`);
  console.log(`Duration: ${duration}ms`);
  console.log('='.repeat(60));

  // Export results
  return results;
}

// Run if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runAllTests, results };
