/**
 * Quick diagnostic to check which AI provider is configured
 * 
 * Usage: npx tsx tests/ai-provider-check.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Checking AI Provider Configuration...\n');

const envVars = {
  deepseek: {
    key: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL,
    baseUrl: process.env.DEEPSEEK_BASE_URL,
  },
  azure: {
    key: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  },
  openai: {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  },
};

let foundProvider = false;

// Check Azure OpenAI
console.log('📦 Azure OpenAI:');
if (envVars.azure.key && envVars.azure.endpoint) {
  console.log('   ✅ CONFIGURED');
  console.log(`   - Endpoint: ${envVars.azure.endpoint}`);
  console.log(`   - Deployment: ${envVars.azure.deployment || 'gpt-4 (default)'}`);
  console.log(`   - API Key: ${envVars.azure.key.substring(0, 8)}...${envVars.azure.key.slice(-4)}`);
  foundProvider = true;
} else {
  console.log('   ❌ NOT CONFIGURED');
  if (!envVars.azure.key) console.log('   Missing: AZURE_OPENAI_API_KEY');
  if (!envVars.azure.endpoint) console.log('   Missing: AZURE_OPENAI_ENDPOINT');
}

console.log('');

// Check DeepSeek
console.log('🌊 DeepSeek:');
if (envVars.deepseek.key) {
  console.log('   ✅ CONFIGURED');
  console.log(`   - Model: ${envVars.deepseek.model || 'deepseek-chat (default)'}`);
  console.log(`   - Base URL: ${envVars.deepseek.baseUrl || 'https://api.deepseek.com (default)'}`);
  console.log(`   - API Key: ${envVars.deepseek.key.substring(0, 8)}...${envVars.deepseek.key.slice(-4)}`);
  if (!foundProvider) foundProvider = true;
} else {
  console.log('   ❌ NOT CONFIGURED');
  console.log('   Missing: DEEPSEEK_API_KEY');
}

console.log('');

// Check OpenAI
console.log('🤖 OpenAI:');
if (envVars.openai.key) {
  console.log('   ✅ CONFIGURED');
  console.log(`   - Model: ${envVars.openai.model || 'gpt-4 (default)'}`);
  console.log(`   - API Key: ${envVars.openai.key.substring(0, 8)}...${envVars.openai.key.slice(-4)}`);
  if (!foundProvider) foundProvider = true;
} else {
  console.log('   ❌ NOT CONFIGURED');
  console.log('   Missing: OPENAI_API_KEY');
}

console.log('\n' + '─'.repeat(60));

if (foundProvider) {
  console.log('\n✅ SUCCESS! At least one AI provider is configured.\n');
  console.log('The system will use providers in this priority order:');
  console.log('   1. Azure OpenAI (if configured)');
  console.log('   2. DeepSeek (if configured)');
  console.log('   3. OpenAI (if configured)\n');
  console.log('💡 Next step: Run the full AI test:');
  console.log('   npx tsx tests/test-learning-path-ai.ts\n');
  process.exit(0);
} else {
  console.log('\n❌ ERROR: No AI provider is configured!\n');
  console.log('To fix this, add one of the following to your .env.local file:\n');
  console.log('Option 1 - DeepSeek (Recommended):');
  console.log('   DEEPSEEK_API_KEY=sk-your-key-here\n');
  console.log('Option 2 - Azure OpenAI:');
  console.log('   AZURE_OPENAI_API_KEY=your-key-here');
  console.log('   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com\n');
  console.log('Option 3 - OpenAI:');
  console.log('   OPENAI_API_KEY=sk-your-key-here\n');
  console.log('📖 For detailed setup instructions, see:');
  console.log('   docs/AI_SETUP_GUIDE.md\n');
  process.exit(1);
}

