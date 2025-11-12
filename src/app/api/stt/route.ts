import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { speechToText } from '@/ai/flows/speech-to-text-flow';
import { rateLimit, rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const STTRequestSchema = z.object({
  audioDataUri: z.string().startsWith('data:audio/'),
  language: z.string().optional().default('en'),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(req, rateLimiters.ai);
    if (rateLimitResponse) return rateLimitResponse;

    // Authenticate user with Supabase JWT
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('STT API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = STTRequestSchema.parse(body);

    logger.apiRequest('POST', '/api/stt', {
      userId: user.id,
      language: validatedData.language,
    });

    // Call speech-to-text
    const response = await speechToText({
      audioDataUri: validatedData.audioDataUri,
      language: validatedData.language,
    });

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/stt', 200, duration, {
      userId: user.id,
      transcriptLength: response.transcript.length,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.apiResponse('POST', '/api/stt', 400, duration);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('STT API error', error, {
      path: '/api/stt',
      duration,
    });

    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
