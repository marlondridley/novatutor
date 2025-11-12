'use server';

/**
 * @fileOverview Generates educational illustrations using OpenAI DALL-E 3.
 *
 * - generateIllustration - Generates an image based on a topic.
 * - GenerateIllustrationInput - The input type for the generateIllustration function.
 * - GenerateIllustrationOutput - The return type for the generateIllustration function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { retryWithBackoff } from '../error-handling';
import { validateSubject, sanitizeUserInput, checkPromptSafety, ValidationError } from '../validation';

const GenerateIllustrationInputSchema = z.object({
  topic: z.string().describe('The educational topic to illustrate.'),
  style: z.enum(['diagram', 'realistic', 'cartoon', 'sketch']).optional().describe('Visual style preference'),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional().describe('Image dimensions'),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image from DALL-E 3'),
  revisedPrompt: z.string().describe('The actual prompt used by DALL-E 3 (may be refined)'),
  explanation: z.string().describe('A brief explanation of the illustration.'),
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;

/**
 * Style presets for educational illustrations
 */
const STYLE_PRESETS = {
  diagram: 'Clean, simple diagram with clear labels and arrows, suitable for textbooks. Minimal colors, high contrast.',
  realistic: 'Photorealistic educational illustration with accurate details and natural lighting.',
  cartoon: 'Friendly cartoon style with vibrant colors, perfect for younger students. Approachable and fun.',
  sketch: 'Hand-drawn sketch style with pencil-like texture, ideal for concept illustrations.',
};

/**
 * Generate educational illustration using OpenAI DALL-E 3
 */
export async function generateIllustration(
  input: GenerateIllustrationInput
): Promise<GenerateIllustrationOutput> {
  const { topic, style = 'diagram', size = '1024x1024' } = input;

  // Validate and sanitize topic
  const sanitizedTopic = sanitizeUserInput(topic);
  
  if (sanitizedTopic.length < 3) {
    throw new ValidationError('Topic must be at least 3 characters', 'topic');
  }
  
  if (sanitizedTopic.length > 500) {
    throw new ValidationError('Topic must be 500 characters or less', 'topic');
  }

  // Check for inappropriate content
  const safetyCheck = checkPromptSafety(sanitizedTopic, 'topic');
  if (!safetyCheck.safe) {
    throw new ValidationError(
      `Content safety check failed: ${safetyCheck.reason}`,
      'topic'
    );
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OpenAI API key not configured. ' +
      'Please set OPENAI_API_KEY in your .env.local file to use illustration generation.'
    );
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return retryWithBackoff(async () => {
    // Build educational prompt
    const styleInstruction = STYLE_PRESETS[style];
    const educationalPrompt = 
      `Educational illustration: ${sanitizedTopic}. ` +
      `Style: ${styleInstruction} ` +
      `Requirements: Clear, accurate, suitable for students, no text in image, ` +
      `safe for all ages, focused on learning.`;

    console.log(`🎨 Generating illustration for: "${sanitizedTopic}" (${style} style)...`);

    // First, check content moderation
    try {
      const moderation = await openai.moderations.create({
        input: educationalPrompt,
      });

      if (moderation.results[0].flagged) {
        const categories = Object.entries(moderation.results[0].categories)
          .filter(([_, flagged]) => flagged)
          .map(([category]) => category);
        
        throw new ValidationError(
          `Content policy violation detected: ${categories.join(', ')}`,
          'topic'
        );
      }
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      // If moderation check fails, log but continue
      console.warn('Content moderation check failed:', error.message);
    }

    // Generate image with DALL-E 3
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt: educationalPrompt,
      n: 1,
      size: size,
      quality: 'standard', // 'standard' or 'hd'
      style: 'natural', // 'natural' or 'vivid'
    });

    const imageUrl = image.data?.[0]?.url;
    const revisedPrompt = image.data?.[0]?.revised_prompt || educationalPrompt;

    if (!imageUrl) {
      throw new Error('Failed to generate image - no URL returned');
    }

    console.log(`✅ Illustration generated successfully`);

    // Generate explanation
    const explanation = 
      `This educational illustration depicts ${sanitizedTopic} in a ${style} style. ` +
      `The image is designed to help students understand the concept visually.`;

    return {
      imageUrl,
      revisedPrompt,
      explanation,
    };
  });
}

/**
 * Batch generate multiple illustrations
 */
export async function batchGenerateIllustrations(
  topics: string[],
  style?: 'diagram' | 'realistic' | 'cartoon' | 'sketch'
): Promise<GenerateIllustrationOutput[]> {
  // Process sequentially to avoid rate limits (DALL-E is expensive)
  const results: GenerateIllustrationOutput[] = [];
  
  for (const topic of topics) {
    try {
      const result = await generateIllustration({ topic, style });
      results.push(result);
      
      // Add delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate illustration for "${topic}":`, error);
      // Continue with next topic
    }
  }
  
  return results;
}
