import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateTestPrep } from '@/ai/flows/test-prep-flow';
import { rateLimit, rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const QuizRequestSchema = z.object({
  subject: z.string().min(1).max(100),
  topic: z.string().min(1).max(200),
  type: z.enum(['quiz', 'flashcards']),
  count: z.number().int().min(1).max(10),
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
      logger.warn('Quiz API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = QuizRequestSchema.parse(body);

    logger.apiRequest('POST', '/api/quiz', {
      userId: user.id,
      subject: validatedData.subject,
      type: validatedData.type,
      count: validatedData.count,
    });

    // ✅ Start AI session tracking
    const { data: session } = await supabase
      .from('ai_sessions')
      .insert({
        user_id: user.id,
        session_type: 'quiz',
        subject: validatedData.subject,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Generate test prep materials
    const response = await generateTestPrep({
      subject: validatedData.subject,
      topic: validatedData.topic,
      type: validatedData.type,
      count: validatedData.count,
    });

    const duration = Date.now() - startTime;

    // ✅ Save quiz to database (not yet completed)
    const { data: quizResult } = await supabase
      .from('quiz_results')
      .insert({
        user_id: user.id,
        subject: validatedData.subject,
        topic: validatedData.topic,
        quiz_type: validatedData.type,
        questions: response,
        total_questions: validatedData.count,
        completed: false,
      })
      .select()
      .single();

    // ✅ Update session with analytics
    const tokensUsed = Math.ceil(JSON.stringify(response).length / 4);
    const costUsd = (tokensUsed / 1000) * 0.002;

    if (session) {
      await supabase
        .from('ai_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: Math.floor(duration / 1000),
          tokens_used: tokensUsed,
          cost_usd: costUsd,
          metadata: { quiz_id: quizResult?.id },
        })
        .eq('id', session.id);
    }

    logger.apiResponse('POST', '/api/quiz', 200, duration, {
      userId: user.id,
      type: validatedData.type,
      itemCount: validatedData.count,
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      data: response,
      quiz_id: quizResult?.id,
      session_id: session?.id,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.apiResponse('POST', '/api/quiz', 400, duration);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Quiz API error', error, {
      path: '/api/quiz',
      duration,
    });

    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
