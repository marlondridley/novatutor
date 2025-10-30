import { openai, DEFAULT_MODEL } from './genkit';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { retryWithBackoff, DEFAULT_RETRY_CONFIG, RetryConfig } from './error-handling';
import { trackTokenUsage, extractTokenUsage } from './monitoring';

interface GenerateOptions<T extends z.ZodType> {
  messages: ChatCompletionMessageParam[];
  schema: T;
  model?: string;
  temperature?: number;
  retryConfig?: RetryConfig;
  userId?: string; // For usage tracking
  flowName?: string; // For usage tracking
}

/**
 * Generate a structured response using OpenAI's structured output feature
 * Includes automatic retry with exponential backoff and usage tracking
 */
export async function generateStructured<T extends z.ZodType>(
  options: GenerateOptions<T>
): Promise<z.infer<T>> {
  const { 
    messages, 
    schema, 
    model = DEFAULT_MODEL, 
    temperature = 0.7,
    retryConfig = DEFAULT_RETRY_CONFIG,
    userId = 'anonymous',
    flowName = 'structured-generation'
  } = options;

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          strict: true,
          schema: zodToJsonSchema(schema) as any,
        },
      },
    });

    // Track token usage
    const usage = extractTokenUsage(completion);
    await trackTokenUsage(userId, flowName, model, usage, true);

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsedResponse = JSON.parse(responseText);
    
    // Validate against schema
    return schema.parse(parsedResponse);
  }, retryConfig);
}

/**
 * Generate a simple text response
 * Includes automatic retry with exponential backoff and usage tracking
 */
export async function generateText(
  messages: ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    retryConfig?: RetryConfig;
    userId?: string;
    flowName?: string;
  }
): Promise<string> {
  const { 
    model = DEFAULT_MODEL, 
    temperature = 0.7,
    retryConfig = DEFAULT_RETRY_CONFIG,
    userId = 'anonymous',
    flowName = 'text-generation'
  } = options || {};

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
    });

    // Track token usage
    const usage = extractTokenUsage(completion);
    await trackTokenUsage(userId, flowName, model, usage, true);

    return completion.choices[0]?.message?.content || '';
  }, retryConfig);
}

/**
 * Convert a data URI image to OpenAI format
 */
export function formatImageContent(dataUri: string) {
  return {
    type: 'image_url' as const,
    image_url: {
      url: dataUri,
    },
  };
}

/**
 * Build a user message with optional image
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
  
  return {
    role: 'user',
    content: text,
  };
}

