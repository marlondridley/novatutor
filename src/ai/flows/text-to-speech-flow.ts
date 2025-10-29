'use server';
/**
 * @fileOverview Converts text to speech using OpenAI TTS API with streaming support.
 *
 * - textToSpeech - Converts text to speech and returns audio data
 * - textToSpeechStream - Streams audio data for immediate playback
 * - TextToSpeechInput - The input type for text-to-speech conversion
 * - TextToSpeechOutput - The output type containing audio data
 */

import OpenAI from 'openai';
import { z } from 'zod';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional().default('alloy').describe('The voice to use for speech generation.'),
  speed: z.number().min(0.25).max(4.0).optional().default(1.0).describe('The speed of speech (0.25 to 4.0).'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().describe("The data URI of the generated audio. Expected format: 'data:audio/mp3;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// Initialize OpenAI client for TTS
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env.local file.');
  }
  return new OpenAI({ apiKey });
};

/**
 * Convert text to speech using OpenAI TTS API (non-streaming)
 * Returns complete audio as base64 data URI
 */
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  const openai = getOpenAIClient();

  try {
    // Generate speech using OpenAI TTS
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1-hd for higher quality
      voice: input.voice || 'alloy',
      input: input.text,
      speed: input.speed || 1.0,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    
    // Convert to base64 data URI
    const base64Audio = buffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return { audioUrl };
  } catch (error: any) {
    console.error('OpenAI TTS Error:', error);
    throw new Error(`Failed to generate speech: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Stream text to speech for immediate playback
 * Returns an async iterator of audio chunks
 */
export async function* textToSpeechStream(
  input: TextToSpeechInput
): AsyncGenerator<Uint8Array, void, unknown> {
  const openai = getOpenAIClient();

  try {
    // Generate speech with streaming enabled
    const stream = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1-hd for higher quality
      voice: input.voice || 'alloy',
      input: input.text,
      speed: input.speed || 1.0,
      response_format: 'mp3',
    });

    // Stream the audio chunks
    const reader = stream.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get stream reader');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        yield value;
      }
    }
  } catch (error: any) {
    console.error('OpenAI TTS Streaming Error:', error);
    throw new Error(`Failed to stream speech: ${error.message || 'Unknown error'}`);
  }
}
