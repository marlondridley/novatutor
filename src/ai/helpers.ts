import { openai, DEFAULT_MODEL } from './genkit';
import { zodToJsonSchema } from 'openai/helpers/zod';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

interface GenerateOptions<T extends z.ZodType> {
  messages: ChatCompletionMessageParam[];
  schema: T;
  model?: string;
  temperature?: number;
}

/**
 * Generate a structured response using OpenAI's structured output feature
 */
export async function generateStructured<T extends z.ZodType>(
  options: GenerateOptions<T>
): Promise<z.infer<T>> {
  const { messages, schema, model = DEFAULT_MODEL, temperature = 0.7 } = options;

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

  const responseText = completion.choices[0]?.message?.content || '{}';
  const parsedResponse = JSON.parse(responseText);
  
  // Validate against schema
  return schema.parse(parsedResponse);
}

/**
 * Generate a simple text response
 */
export async function generateText(
  messages: ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<string> {
  const { model = DEFAULT_MODEL, temperature = 0.7 } = options || {};

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature,
  });

  return completion.choices[0]?.message?.content || '';
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

