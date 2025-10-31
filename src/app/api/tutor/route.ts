import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { connectWithSubjectSpecializedTutor } from '@/ai/flows/subject-specialized-tutor';
import { rateLimit, rateLimiters } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const TutorRequestSchema = z.object({
  subject: z.enum(['Math', 'Science', 'Writing']),
  studentQuestion: z.string().min(1).max(5000),
  homeworkImage: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
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
      logger.warn('Tutor API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = TutorRequestSchema.parse(body);

    logger.apiRequest('POST', '/api/tutor', {
      userId: user.id,
      subject: validatedData.subject,
    });

    // ✅ Start AI session tracking
    const { data: session } = await supabase
      .from('ai_sessions')
      .insert({
        user_id: user.id,
        session_type: 'tutor',
        subject: validatedData.subject,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Call AI tutor
    const response = await connectWithSubjectSpecializedTutor({
      subject: validatedData.subject,
      studentQuestion: validatedData.studentQuestion,
      homeworkImage: validatedData.homeworkImage,
    });

    const duration = Date.now() - startTime;
    
    // ✅ Build conversation history
    const conversationHistory = validatedData.conversationHistory || [];
    conversationHistory.push(
      { role: 'user', content: validatedData.studentQuestion },
      { role: 'assistant', content: response.tutorResponse }
    );

    // ✅ Save conversation to database
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        subject: validatedData.subject,
        title: validatedData.studentQuestion.substring(0, 100),
        messages: conversationHistory,
        message_count: conversationHistory.length,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    // ✅ Update session with analytics
    // Estimate tokens based on response length (rough approximation)
    const tokensUsed = Math.ceil(response.tutorResponse.length / 4);
    const costUsd = (tokensUsed / 1000) * 0.002; // Approximate cost

    if (session) {
      await supabase
        .from('ai_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: Math.floor(duration / 1000),
          message_count: conversationHistory.length,
          tokens_used: tokensUsed,
          cost_usd: costUsd,
          metadata: { conversation_id: conversation?.id },
        })
        .eq('id', session.id);
    }

    logger.apiResponse('POST', '/api/tutor', 200, duration, {
      userId: user.id,
      subject: validatedData.subject,
      tokensUsed,
      costUsd,
    });

    return NextResponse.json({
      success: true,
      data: response,
      conversation_id: conversation?.id,
      session_id: session?.id,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.apiResponse('POST', '/api/tutor', 400, duration);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Tutor API error', error, {
      path: '/api/tutor',
      duration,
    });

    return NextResponse.json(
      { error: error.message || 'Failed to get tutor response' },
      { status: 500 }
    );
  }
}
