/**
 * AI Helper Functions
 * 
 * Simple utilities for calling OpenAI-compatible APIs (OpenAI, DeepSeek, Azure).
 * These are the core building blocks for all AI features.
 * 
 * Usage:
 *   const response = await generateStructured({ messages, schema });
 *   const text = await generateText(messages);
 */

import { openai, DEFAULT_MODEL } from './genkit';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { retryWithBackoff } from './error-handling';

// =============================================================================
// GENERATE STRUCTURED RESPONSE
// =============================================================================

/**
 * Generate a JSON response that matches a Zod schema.
 * 
 * This is the main function for getting structured data from AI.
 * It automatically adds schema instructions to the prompt and validates the response.
 * 
 * @example
 * const result = await generateStructured({
 *   messages: [
 *     { role: 'system', content: 'You are a helpful tutor.' },
 *     { role: 'user', content: 'Explain photosynthesis' }
 *   ],
 *   schema: z.object({
 *     explanation: z.string(),
 *     keyPoints: z.array(z.string())
 *   })
 * });
 */
export async function generateStructured<T extends z.ZodType>(options: {
  messages: ChatCompletionMessageParam[];
  schema: T;
  model?: string;
  temperature?: number;
}): Promise<z.infer<T>> {
  const { messages, schema, model = DEFAULT_MODEL, temperature = 0.7 } = options;

  return retryWithBackoff(async () => {
    // Add schema instructions to help the AI understand the expected format
    const jsonSchema = JSON.stringify(zodToJsonSchema(schema), null, 2);
    const enhancedMessages = [...messages];
    
    // Append schema to the last user message
    const lastMessage = enhancedMessages[enhancedMessages.length - 1];
    if (lastMessage?.role === 'user' && typeof lastMessage.content === 'string') {
      lastMessage.content += `\n\nRespond with valid JSON matching this schema:\n${jsonSchema}`;
    }

    // Call the AI
    const completion = await openai.chat.completions.create({
      model,
      messages: enhancedMessages,
      temperature,
      response_format: { type: 'json_object' },
    });

    // Parse and validate the response
    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);
    
    return schema.parse(parsed);
  });
}

// =============================================================================
// GENERATE TEXT RESPONSE
// =============================================================================

/**
 * Generate a simple text response from AI.
 * 
 * Use this when you just need a string response, not structured data.
 * 
 * @example
 * const joke = await generateText([
 *   { role: 'system', content: 'You tell educational jokes.' },
 *   { role: 'user', content: 'Tell me a math joke' }
 * ]);
 */
export async function generateText(
  messages: ChatCompletionMessageParam[],
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const { model = DEFAULT_MODEL, temperature = 0.7 } = options || {};

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
    });

    return completion.choices[0]?.message?.content || '';
  });
}

// =============================================================================
// IMAGE HANDLING
// =============================================================================

/**
 * Format an image for OpenAI's vision API.
 * 
 * @param dataUri - Base64 encoded image (e.g., from a file upload)
 * @returns Object formatted for OpenAI's content array
 */
export function formatImageContent(dataUri: string) {
  return {
    type: 'image_url' as const,
    image_url: { url: dataUri },
  };
}

/**
 * Build a user message with optional image attachment.
 * 
 * @example
 * // Text only
 * const msg = buildUserMessage("What is 2+2?");
 * 
 * // With image
 * const msg = buildUserMessage("Solve this problem", imageDataUri);
 */
export function buildUserMessage(
  text: string,
  imageDataUri?: string
): ChatCompletionMessageParam {
  if (imageDataUri) {
    return {
      role: 'user',
      content: [
        { type: 'text', text },
        formatImageContent(imageDataUri),
      ],
    };
  }
  
  return { role: 'user', content: text };
}
