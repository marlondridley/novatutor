/**
 * Test script for Learning Path AI functionality
 * 
 * This script tests:
 * 1. AI connection and configuration
 * 2. Learning Path generation with enhanced inputs
 * 3. Response format validation
 * 
 * Usage: npx tsx tests/test-learning-path-ai.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { generatePersonalizedLearningPath } from '../src/ai/flows/generate-personalized-learning-path';

async function testLearningPathAI() {
  console.log('🧪 Testing Learning Path AI...\n');

  // Test data with all enhanced fields
  const testInput = {
    studentId: 'test-student-123',
    subject: 'Math',
    gradeLevel: 'high',
    learningStyle: 'visual',
    currentUnderstanding: 65,
    specificTopics: 'Quadratic equations, Graphing parabolas',
    learningGoals: 'Understand how to solve quadratic equations and pass my upcoming test',
    timeAvailable: 8,
    masteryScores: {
      "Introduction": 0.85,
      "Basic Concepts": 0.65,
      "Intermediate Topics": 0.45,
      "Advanced Concepts": 0.35,
    },
    interventionEffectiveness: {
      "Visual Aids": 0.95,
      "Practice Problems": 0.92,
      "Concept Videos": 0.92,
      "Interactive Exercises": 0.90,
      "Reading Materials": 0.80,
    },
  };

  console.log('📋 Test Input:');
  console.log(JSON.stringify(testInput, null, 2));
  console.log('\n⏳ Generating learning path...\n');

  try {
    const startTime = Date.now();
    const result = await generatePersonalizedLearningPath(testInput);
    const duration = Date.now() - startTime;

    console.log('✅ SUCCESS! Learning path generated in', duration, 'ms\n');
    console.log('📚 Generated Learning Path:');
    console.log('─'.repeat(60));
    console.log('\n📝 Explanation:', result.explanation);
    console.log('\n📖 Learning Steps:');
    
    result.learningPath.forEach((step, index) => {
      console.log(`\n${index + 1}. ${step.topic}`);
      console.log(`   Description: ${step.description}`);
      console.log(`   Estimated Time: ${step.estimatedTime} minutes`);
      console.log(`   Resources: ${step.resources.length} resources`);
      step.resources.forEach((resource, i) => {
        console.log(`   ${i + 1}) ${resource}`);
      });
    });

    console.log('\n' + '─'.repeat(60));
    console.log('\n✅ Test completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total steps: ${result.learningPath.length}`);
    console.log(`   - Total estimated time: ${result.learningPath.reduce((sum, step) => sum + step.estimatedTime, 0)} minutes`);
    console.log(`   - Total resources: ${result.learningPath.reduce((sum, step) => sum + step.resources.length, 0)}`);

    return true;
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('\nError Details:', error);
    
    if (error.message.includes('API')) {
      console.error('\n💡 Suggestion: Check your AI provider API keys:');
      console.error('   - DEEPSEEK_API_KEY');
      console.error('   - AZURE_OPENAI_API_KEY');
      console.error('   - OPENAI_API_KEY');
    }
    
    if (error.message.includes('response_format')) {
      console.error('\n💡 Suggestion: This error is related to the response format.');
      console.error('   The fix should already be applied in helpers.ts');
    }

    return false;
  }
}

// Run the test
testLearningPathAI()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });

