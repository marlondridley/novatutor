import { textToSpeechStream } from '@/ai/flows/text-to-speech-flow';
import { NextRequest } from 'next/server';

/**
 * API Route for streaming Text-to-Speech
 * 
 * Usage:
 * POST /api/tts
 * Body: { text: string, voice?: string, speed?: number }
 * 
 * Returns: Streaming MP3 audio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy', speed = 1.0 } = body;

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream audio chunks from OpenAI
          for await (const chunk of textToSpeechStream({ text, voice, speed })) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          console.error('TTS Streaming error:', error);
          controller.error(error);
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate speech' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

