import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { computeParentLearningMetrics } from '@/lib/parent-learning-metrics';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const range = (url.searchParams.get('range') || '7d') as '7d' | '30d';
    const label: '7d' | '30d' = range === '30d' ? '30d' : '7d';

    // Resolve target student (supports parent accounts that have a linked student_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, student_id')
      .eq('id', user.id)
      .single();

    const targetUserId =
      profile?.role === 'parent' && profile?.student_id
        ? profile.student_id
        : user.id;

    const startIso = new Date(Date.now() - (label === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString();

    const [
      aiSessionsRes,
      quizResultsRes,
      voiceUsageRes,
      focusSessionsRes,
      taskCompletionsRes,
      emotionalStatesRes,
      studentGoalsRes,
    ] = await Promise.all([
      supabase
        .from('ai_sessions')
        .select('session_type, subject, started_at, ended_at, duration_seconds, message_count, cost_usd, metadata')
        .eq('user_id', targetUserId)
        .gte('started_at', startIso)
        .order('started_at', { ascending: false })
        .limit(200),

      supabase
        .from('quiz_results')
        .select('subject, topic, score, time_spent_seconds, completed, completed_at, created_at')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),

      supabase
        .from('voice_usage_logs')
        .select('voice_type, duration_seconds, estimated_cost, created_at')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),

      // Phase 2 Executive Function telemetry
      supabase
        .from('focus_sessions')
        .select('created_at, duration_minutes, distractions, quality_score, subject')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),

      supabase
        .from('task_completions')
        .select('created_at, completed, planned_time_minutes, actual_time_minutes, time_accuracy, subject')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),

      supabase
        .from('emotional_states')
        .select('created_at, emotion, intensity')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),

      supabase
        .from('student_goals')
        .select('created_at, completed')
        .eq('user_id', targetUserId)
        .gte('created_at', startIso)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    const metrics = computeParentLearningMetrics({
      label,
      aiSessions: aiSessionsRes.data || [],
      quizResults: quizResultsRes.data || [],
      voiceUsage: voiceUsageRes.data || [],
      focusSessions: focusSessionsRes.data || [],
      taskCompletions: taskCompletionsRes.data || [],
      emotionalStates: emotionalStatesRes.data || [],
      studentGoals: studentGoalsRes.data || [],
    });

    return NextResponse.json({ hasData: true, metrics });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to compute learning metrics' },
      { status: 500 }
    );
  }
}


