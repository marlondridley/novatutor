// Quick environment variable check
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Environment Variable Check:\n');

const checks = [
  { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY, required: true },
  { name: 'STRIPE_PRICE_ID', value: process.env.STRIPE_PRICE_ID, required: true },
  { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET, required: false },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL, required: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY, required: true },
  { name: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL, required: true },
];

let allGood = true;

checks.forEach(({ name, value, required }) => {
  const status = value ? '✅' : (required ? '❌' : '⚠️');
  const message = value 
    ? `${status} ${name}: ${value.substring(0, 20)}...` 
    : `${status} ${name}: MISSING ${required ? '(REQUIRED!)' : '(optional)'}`;
  
  console.log(message);
  
  if (required && !value) {
    allGood = false;
  }
});

console.log('\n' + (allGood ? '✅ All required variables set!' : '❌ Missing required variables!') + '\n');

// Check if STRIPE_PRICE_ID matches expected
if (process.env.STRIPE_PRICE_ID) {
  const expectedPrice = 'price_1SCYwwGxHdRwEkVK4k4b6Iw0';
  if (process.env.STRIPE_PRICE_ID === expectedPrice) {
    console.log(`✅ STRIPE_PRICE_ID correct: ${expectedPrice}`);
  } else {
    console.log(`⚠️  STRIPE_PRICE_ID found but doesn't match expected:`);
    console.log(`   Found:    ${process.env.STRIPE_PRICE_ID}`);
    console.log(`   Expected: ${expectedPrice}`);
  }
}

console.log('');

