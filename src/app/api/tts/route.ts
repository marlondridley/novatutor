import { textToSpeechStream } from '@/ai/flows/text-to-speech-flow';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * API Route for streaming Text-to-Speech
 * 
 * Usage:
 * POST /api/tts
 * Body: { text: string, voice?: string, speed?: number }
 * Headers: { Authorization: Bearer <token> }
 * 
 * Returns: Streaming MP3 audio
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, rateLimiters.ai);
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate user with Supabase JWT
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('TTS API: Unauthorized access attempt');
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.apiRequest('POST', '/api/tts', { userId: user.id });

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

