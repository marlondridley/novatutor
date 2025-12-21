/**
 * AI Helper Functions
 * 
 * Simple utilities for calling AI APIs (Anthropic Claude, OpenAI, DeepSeek, Azure).
 * These are the core building blocks for all AI features.
 * 
 * Usage:
 *   const response = await generateStructured({ messages, schema });
 *   const text = await generateText(messages);
 */

import { openai, anthropic, DEFAULT_MODEL, IS_ANTHROPIC } from './genkit';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { retryWithBackoff } from './error-handling';

// =============================================================================
// ANTHROPIC HELPERS
// =============================================================================

/**
 * Convert OpenAI-style messages to Anthropic format
 */
function convertToAnthropicMessages(messages: ChatCompletionMessageParam[]): {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string | any[] }>;
} {
  let systemPrompt = '';
  const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string | any[] }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Anthropic uses a separate system parameter
      systemPrompt += (typeof msg.content === 'string' ? msg.content : '') + '\n';
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      // Handle content that might be string or array (for images)
      if (typeof msg.content === 'string') {
        anthropicMessages.push({ role: msg.role, content: msg.content });
      } else if (Array.isArray(msg.content)) {
        // Convert OpenAI image format to Anthropic format
        const anthropicContent: any[] = [];
        for (const part of msg.content) {
          if (part.type === 'text') {
            anthropicContent.push({ type: 'text', text: part.text });
          } else if (part.type === 'image_url') {
            // Extract base64 data from data URI
            const url = part.image_url?.url || '';
            if (url.startsWith('data:')) {
              const [mediaTypePart, base64Data] = url.split(',');
              const mediaType = mediaTypePart.replace('data:', '').replace(';base64', '');
              anthropicContent.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              });
            }
          }
        }
        anthropicMessages.push({ role: msg.role, content: anthropicContent });
      }
    }
  }

  return { system: systemPrompt.trim(), messages: anthropicMessages };
}

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

    let responseText: string;

    // Use Anthropic if configured
    if (IS_ANTHROPIC && anthropic) {
      const { system, messages: anthropicMsgs } = convertToAnthropicMessages(enhancedMessages);
      
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: system + '\n\nYou must respond with valid JSON only. No markdown, no explanations.',
        messages: anthropicMsgs,
      });

      // Extract text from Anthropic response
      const textBlock = response.content.find(block => block.type === 'text');
      responseText = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    } else if (openai) {
      // Use OpenAI-compatible API
      const completion = await openai.chat.completions.create({
        model,
        messages: enhancedMessages,
        temperature,
        response_format: { type: 'json_object' },
      });
      responseText = completion.choices[0]?.message?.content || '{}';
    } else {
      throw new Error('No AI client configured');
    }

    // Parse and validate the response
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
    // Use Anthropic if configured
    if (IS_ANTHROPIC && anthropic) {
      const { system, messages: anthropicMsgs } = convertToAnthropicMessages(messages);
      
      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: system || undefined,
        messages: anthropicMsgs,
      });

      // Extract text from Anthropic response
      const textBlock = response.content.find(block => block.type === 'text');
      return textBlock && 'text' in textBlock ? textBlock.text : '';
    } else if (openai) {
      // Use OpenAI-compatible API
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature,
      });
      return completion.choices[0]?.message?.content || '';
    } else {
      throw new Error('No AI client configured');
    }
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
