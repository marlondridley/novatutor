/**
 * Generate Educational Illustrations
 * 
 * Uses OpenAI DALL-E 3 to create educational images.
 * This is an EXPENSIVE operation (~$0.04-0.08 per image).
 */

'use server';

import { z } from 'zod';
import OpenAI from 'openai';
import { retryWithBackoff } from '../error-handling';
import { sanitize, detectPromptInjection, ValidationError } from '../validation';

// =============================================================================
// TYPES
// =============================================================================

const GenerateIllustrationInputSchema = z.object({
  topic: z.string().describe('The educational topic to illustrate.'),
  style: z.enum(['diagram', 'realistic', 'cartoon', 'sketch']).optional(),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
});
export type GenerateIllustrationInput = z.infer<typeof GenerateIllustrationInputSchema>;

const GenerateIllustrationOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image'),
  revisedPrompt: z.string().describe('The prompt DALL-E actually used'),
  explanation: z.string().describe('Brief explanation of the illustration'),
});
export type GenerateIllustrationOutput = z.infer<typeof GenerateIllustrationOutputSchema>;

// =============================================================================
// STYLE PRESETS
// =============================================================================

const STYLE_PRESETS = {
  diagram: 'Clean, simple diagram with clear labels. Minimal colors, high contrast.',
  realistic: 'Photorealistic educational illustration with accurate details.',
  cartoon: 'Friendly cartoon style with vibrant colors, for younger students.',
  sketch: 'Hand-drawn sketch style with pencil texture.',
};

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Generate an educational illustration using DALL-E 3.
 * 
 * @example
 * const result = await generateIllustration({
 *   topic: "Photosynthesis process in plants",
 *   style: "diagram"
 * });
 * console.log(result.imageUrl);
 */
export async function generateIllustration(
  input: GenerateIllustrationInput
): Promise<GenerateIllustrationOutput> {
  const { topic, style = 'diagram', size = '1024x1024' } = input;

  // Validate topic
  const cleanTopic = sanitize(topic, 500);
  
  if (cleanTopic.length < 3) {
    throw new ValidationError('Topic must be at least 3 characters', 'topic');
  }

  // Check for prompt injection
  if (detectPromptInjection(cleanTopic)) {
    throw new ValidationError('Invalid content detected', 'topic');
  }

  // Basic safety filter for violent/explicit content
  const unsafePatterns = /(weapon|kill|blood|violent|gore|explicit|nsfw)/i;
  if (unsafePatterns.test(cleanTopic)) {
    throw new ValidationError('Please choose a school-safe topic', 'topic');
  }

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured in .env.local');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return retryWithBackoff(async () => {
    // Build prompt
    const styleInstruction = STYLE_PRESETS[style];
    const prompt = 
      `Educational illustration: ${cleanTopic}. ` +
      `Style: ${styleInstruction} ` +
      `Requirements: Clear, accurate, suitable for students, no text in image, safe for all ages.`;

    // Generate image
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      style: 'natural',
    });

    const imageUrl = image.data?.[0]?.url;
    const revisedPrompt = image.data?.[0]?.revised_prompt || prompt;

    if (!imageUrl) {
      throw new Error('Failed to generate image - no URL returned');
    }

    return {
      imageUrl,
      revisedPrompt,
      explanation: `Educational illustration of ${cleanTopic} in ${style} style.`,
    };
  });
}
