import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Calculate study strategy effectiveness from real user data
 * 
 * Strategies tracked:
 * - Practice Problems: Based on quiz results performance
 * - Gamified Quizzes: Based on quiz completion and engagement
 * - Concept Videos: Based on tutor/conversation sessions
 * - Visual Aids: Based on homework/planning sessions
 * - Peer Tutoring: Based on conversation sessions (if we add peer features)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user ID
    const userId = user.id;

    // Define strategy mapping
    const strategies = {
      'Practice Problems': {
        name: 'Practice Problems',
        calculation: async () => {
          // Calculate effectiveness based on quiz results
          const { data: quizResults, error } = await supabase
            .from('quiz_results')
            .select('score, completed, time_spent_seconds, created_at')
            .eq('user_id', userId)
            .eq('completed', true)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
            .order('created_at', { ascending: false });

          if (error || !quizResults || quizResults.length === 0) {
            return 0;
          }

          // Calculate average score
          const totalScore = quizResults.reduce((sum, result) => sum + (result.score || 0), 0);
          const averageScore = totalScore / quizResults.length;
          
          // Effectiveness is based on average score (0-100 scale)
          return Math.round(averageScore);
        }
      },
      'Gamified Quizzes': {
        name: 'Gamified Quizzes',
        calculation: async () => {
          // Similar to Practice Problems but weighted by engagement (completion rate, frequency)
          const { data: quizResults, error } = await supabase
            .from('quiz_results')
            .select('score, completed, created_at')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });

          if (error || !quizResults || quizResults.length === 0) {
            return 0;
          }

          const completedQuizzes = quizResults.filter(q => q.completed);
          const completionRate = (completedQuizzes.length / quizResults.length) * 100;
          
          // Weight by completion rate and frequency
          const frequencyScore = Math.min(quizResults.length * 5, 50); // Max 50 points for frequency
          const completionScore = completionRate * 0.5; // Max 50 points for completion
          
          return Math.round(frequencyScore + completionScore);
        }
      },
      'Concept Videos': {
        name: 'Concept Videos',
        calculation: async () => {
          // Based on tutor/conversation sessions
          const { data: sessions, error } = await supabase
            .from('ai_sessions')
            .select('session_type, duration_seconds, message_count, metadata')
            .eq('user_id', userId)
            .in('session_type', ['tutor', 'coaching'])
            .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('started_at', { ascending: false });

          if (error || !sessions || sessions.length === 0) {
            return 0;
          }

          // Calculate effectiveness based on session engagement
          const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
          const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0);
          
          // Effectiveness = engagement score (duration + messages)
          const durationScore = Math.min(totalDuration / 60, 50); // Max 50 points (1 hour = 50 points)
          const messageScore = Math.min(totalMessages * 2, 50); // Max 50 points
          
          return Math.round(durationScore + messageScore);
        }
      },
      'Visual Aids': {
        name: 'Visual Aids',
        calculation: async () => {
          // Based on homework/planning sessions (which might use visual aids)
          const { data: sessions, error } = await supabase
            .from('ai_sessions')
            .select('session_type, duration_seconds, metadata')
            .eq('user_id', userId)
            .in('session_type', ['homework', 'learning_path'])
            .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('started_at', { ascending: false });

          if (error || !sessions || sessions.length === 0) {
            return 0;
          }

          // Check if metadata indicates visual aids usage
          const visualAidsSessions = sessions.filter(s => 
            s.metadata && (
              (s.metadata as any).hasVisualAids === true ||
              (s.metadata as any).usesImages === true ||
              (s.metadata as any).interventionType === 'visual'
            )
          );

          // Effectiveness based on visual aids usage
          const usageRate = visualAidsSessions.length / sessions.length;
          const engagementScore = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;
          
          return Math.round((usageRate * 50) + Math.min(engagementScore, 50));
        }
      },
      'Peer Tutoring': {
        name: 'Peer Tutoring',
        calculation: async () => {
          // For now, base on conversation sessions (we can add peer features later)
          const { data: sessions, error } = await supabase
            .from('ai_sessions')
            .select('session_type, duration_seconds, message_count, metadata')
            .eq('user_id', userId)
            .eq('session_type', 'tutor')
            .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('started_at', { ascending: false });

          if (error || !sessions || sessions.length === 0) {
            return 0;
          }

          // Check if metadata indicates peer tutoring
          const peerSessions = sessions.filter(s => 
            s.metadata && (s.metadata as any).isPeerTutoring === true
          );

          // If no peer sessions, use conversation engagement as proxy
          if (peerSessions.length === 0) {
            const avgDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length;
            const avgMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0) / sessions.length;
            
            return Math.round(Math.min((avgDuration / 60) * 10 + (avgMessages * 2), 100));
          }

          // Calculate effectiveness based on peer sessions
          const peerEngagement = peerSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60;
          return Math.round(Math.min(peerEngagement * 20, 100));
        }
      }
    };

    // Strategy color mapping (matches chart config)
    const strategyColors: Record<string, string> = {
      'Practice Problems': 'hsl(var(--chart-2))',
      'Gamified Quizzes': 'hsl(var(--chart-5))',
      'Concept Videos': 'hsl(var(--chart-4))',
      'Visual Aids': 'hsl(var(--chart-1))',
      'Peer Tutoring': 'hsl(var(--chart-3))',
    };

    // Calculate effectiveness for each strategy
    const strategyData = await Promise.all(
      Object.values(strategies).map(async (strategy) => {
        const effectiveness = await strategy.calculation();
        return {
          name: strategy.name,
          effectiveness: Math.min(Math.max(effectiveness, 0), 100), // Clamp between 0-100
          fill: strategyColors[strategy.name] || 'hsl(var(--chart-1))'
        };
      })
    );

    // Filter out strategies with 0 effectiveness (no data)
    const activeStrategies = strategyData.filter(s => s.effectiveness > 0);

    // If no data, return empty array
    if (activeStrategies.length === 0) {
      return NextResponse.json({
        strategies: [],
        hasData: false,
        message: 'No study strategy data available yet. Start using the app to see your progress!'
      });
    }

    // Sort by effectiveness (descending)
    activeStrategies.sort((a, b) => b.effectiveness - a.effectiveness);

    return NextResponse.json({
      strategies: activeStrategies,
      hasData: true,
      totalStrategies: activeStrategies.length
    });

  } catch (error) {
    console.error('Error fetching strategy effectiveness:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy effectiveness' },
      { status: 500 }
    );
  }
}
