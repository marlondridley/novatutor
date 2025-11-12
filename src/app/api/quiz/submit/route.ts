import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const QuizSubmitSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.array(z.any()),
  time_spent_seconds: z.number().int().min(0),
});

/**
 * Submit Quiz Results
 * POST /api/quiz/submit
 * 
 * Updates quiz_results with user's answers and score
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Quiz Submit API: Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = QuizSubmitSchema.parse(body);

    logger.apiRequest('POST', '/api/quiz/submit', {
      userId: user.id,
      quizId: validatedData.quiz_id,
    });

    // Get the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', validatedData.quiz_id)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Calculate score (simple correct/total)
    const totalQuestions = quiz.total_questions;
    const correctAnswers = validatedData.answers.filter((answer: any, index: number) => {
      const question = quiz.questions[index];
      return answer === question?.correctAnswer;
    }).length;

    const score = (correctAnswers / totalQuestions) * 100;

    // Update quiz result
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({
        answers: validatedData.answers,
        score: score,
        correct_answers: correctAnswers,
        time_spent_seconds: validatedData.time_spent_seconds,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', validatedData.quiz_id);

    if (updateError) {
      throw updateError;
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('POST', '/api/quiz/submit', 200, duration, {
      userId: user.id,
      score,
      correctAnswers,
      totalQuestions,
    });

    return NextResponse.json({
      success: true,
      score,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      percentage: score,
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      logger.apiResponse('POST', '/api/quiz/submit', 400, duration);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Quiz Submit API error', error, {
      path: '/api/quiz/submit',
      duration,
    });

    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
