/**
 * Custom hook to fetch and calculate student analytics
 * Pulls data from Phase 2 database tables (focus_sessions, task_completions, emotional_states, student_goals)
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface StudentAnalytics {
  // Focus & Productivity
  totalFocusSessions: number;
  averageFocusDuration: number;
  averageDistractions: number;
  focusQualityTrend: Array<{ date: string; score: number }>;
  
  // Task Completion
  taskCompletionRate: number;
  totalTasksCompleted: number;
  totalTasksAttempted: number;
  timeEstimationAccuracy: number;
  completionTrend: Array<{ date: string; rate: number }>;
  
  // Emotional States & Confidence
  averageConfidence: number;
  confidenceTrend: Array<{ date: string; level: number }>;
  emotionalStates: Array<{ emotion: string; count: number }>;
  confidenceImprovement: number; // % change over time
  
  // Goals
  activeGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
  goalsThisWeek: number;
  
  // Activity Summary
  totalSessions: number;
  mostStudiedSubject: string;
  streakDays: number;
  lastActiveDate: string;
  
  // Insights
  bestPerformanceTime: string;
  needsSupport: Array<{ area: string; reason: string }>;
  strengths: Array<string>;
}

export function useStudentAnalytics(userId?: string) {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const supabase = createClient();
        
        // Get current user if userId not provided
        let targetUserId = userId;
        if (!targetUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setError('Not authenticated');
            setLoading(false);
            return;
          }
          targetUserId = user.id;
        }

        // Parallel queries for all data
        const [
          focusSessionsResult,
          taskCompletionsResult,
          emotionalStatesResult,
          goalsResult,
        ] = await Promise.all([
          supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(50),
          
          supabase
            .from('task_completions')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(50),
          
          supabase
            .from('emotional_states')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(50),
          
          supabase
            .from('student_goals')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false }),
        ]);

        const focusSessions = focusSessionsResult.data || [];
        const taskCompletions = taskCompletionsResult.data || [];
        const emotionalStates = emotionalStatesResult.data || [];
        const goals = goalsResult.data || [];

        // Calculate analytics
        const analytics: StudentAnalytics = {
          // Focus & Productivity
          totalFocusSessions: focusSessions.length,
          averageFocusDuration: focusSessions.length > 0
            ? focusSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / focusSessions.length
            : 0,
          averageDistractions: focusSessions.length > 0
            ? focusSessions.reduce((sum, s) => sum + (s.distractions || 0), 0) / focusSessions.length
            : 0,
          focusQualityTrend: calculateFocusQualityTrend(focusSessions),
          
          // Task Completion
          taskCompletionRate: taskCompletions.length > 0
            ? (taskCompletions.filter(t => t.completed).length / taskCompletions.length) * 100
            : 0,
          totalTasksCompleted: taskCompletions.filter(t => t.completed).length,
          totalTasksAttempted: taskCompletions.length,
          timeEstimationAccuracy: calculateTimeAccuracy(taskCompletions),
          completionTrend: calculateCompletionTrend(taskCompletions),
          
          // Emotional States & Confidence
          averageConfidence: calculateAverageConfidence(emotionalStates),
          confidenceTrend: calculateConfidenceTrend(emotionalStates),
          emotionalStates: summarizeEmotionalStates(emotionalStates),
          confidenceImprovement: calculateConfidenceImprovement(emotionalStates),
          
          // Goals
          activeGoals: goals.filter(g => !g.completed).length,
          completedGoals: goals.filter(g => g.completed).length,
          goalCompletionRate: goals.length > 0
            ? (goals.filter(g => g.completed).length / goals.length) * 100
            : 0,
          goalsThisWeek: countGoalsThisWeek(goals),
          
          // Activity Summary
          totalSessions: focusSessions.length + taskCompletions.length,
          mostStudiedSubject: findMostStudiedSubject(focusSessions, taskCompletions),
          streakDays: calculateStreakDays(focusSessions, taskCompletions, emotionalStates),
          lastActiveDate: findLastActiveDate(focusSessions, taskCompletions, emotionalStates),
          
          // Insights
          bestPerformanceTime: findBestPerformanceTime(focusSessions, taskCompletions),
          needsSupport: identifyNeedsSupport(focusSessions, taskCompletions, emotionalStates),
          strengths: identifyStrengths(focusSessions, taskCompletions, emotionalStates, goals),
        };

        setAnalytics(analytics);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to fetch analytics');
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [userId]);

  return { analytics, loading, error };
}

// Helper functions

function calculateFocusQualityTrend(sessions: any[]): Array<{ date: string; score: number }> {
  const last7Days = sessions.slice(0, 7).reverse();
  return last7Days.map(s => ({
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.quality_score || 0,
  }));
}

function calculateTimeAccuracy(tasks: any[]): number {
  const completedWithTimes = tasks.filter(t => 
    t.completed && t.planned_time_minutes > 0 && t.actual_time_minutes > 0
  );
  
  if (completedWithTimes.length === 0) return 0;
  
  const totalAccuracy = completedWithTimes.reduce((sum, t) => 
    sum + (t.time_accuracy || 0), 0
  );
  
  return totalAccuracy / completedWithTimes.length;
}

function calculateCompletionTrend(tasks: any[]): Array<{ date: string; rate: number }> {
  const last7Days = tasks.slice(0, 14).reverse();
  const grouped: { [key: string]: { completed: number; total: number } } = {};
  
  last7Days.forEach(t => {
    const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!grouped[date]) {
      grouped[date] = { completed: 0, total: 0 };
    }
    grouped[date].total++;
    if (t.completed) grouped[date].completed++;
  });
  
  return Object.entries(grouped).map(([date, data]) => ({
    date,
    rate: (data.completed / data.total) * 100,
  }));
}

function calculateAverageConfidence(states: any[]): number {
  const confidenceStates = states.filter(s => 
    s.emotion === 'confident' && s.intensity
  );
  
  if (confidenceStates.length === 0) return 0;
  
  return confidenceStates.reduce((sum, s) => sum + s.intensity, 0) / confidenceStates.length;
}

function calculateConfidenceTrend(states: any[]): Array<{ date: string; level: number }> {
  const confidenceStates = states
    .filter(s => s.emotion === 'confident' && s.intensity)
    .slice(0, 10)
    .reverse();
  
  return confidenceStates.map(s => ({
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    level: s.intensity,
  }));
}

function summarizeEmotionalStates(states: any[]): Array<{ emotion: string; count: number }> {
  const counts: { [key: string]: number } = {};
  
  states.forEach(s => {
    counts[s.emotion] = (counts[s.emotion] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateConfidenceImprovement(states: any[]): number {
  const confidenceStates = states.filter(s => s.emotion === 'confident' && s.intensity);
  
  if (confidenceStates.length < 2) return 0;
  
  const recent = confidenceStates.slice(0, 5);
  const older = confidenceStates.slice(-5);
  
  const recentAvg = recent.reduce((sum, s) => sum + s.intensity, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s.intensity, 0) / older.length;
  
  return ((recentAvg - olderAvg) / olderAvg) * 100;
}

function countGoalsThisWeek(goals: any[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return goals.filter(g => new Date(g.created_at) >= weekAgo).length;
}

function findMostStudiedSubject(focusSessions: any[], taskCompletions: any[]): string {
  const subjectCounts: { [key: string]: number } = {};
  
  focusSessions.forEach(s => {
    if (s.subject) {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    }
  });
  
  taskCompletions.forEach(t => {
    if (t.subject) {
      subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
    }
  });
  
  const entries = Object.entries(subjectCounts);
  if (entries.length === 0) return 'Not enough data';
  
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function calculateStreakDays(focusSessions: any[], taskCompletions: any[], emotionalStates: any[]): number {
  const allActivities = [
    ...focusSessions.map(s => s.created_at),
    ...taskCompletions.map(t => t.created_at),
    ...emotionalStates.map(e => e.created_at),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (allActivities.length === 0) return 0;
  
  let streak = 1;
  let currentDate = new Date(allActivities[0]);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < allActivities.length; i++) {
    const activityDate = new Date(allActivities[i]);
    activityDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = activityDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
}

function findLastActiveDate(focusSessions: any[], taskCompletions: any[], emotionalStates: any[]): string {
  const allDates = [
    ...focusSessions.map(s => s.created_at),
    ...taskCompletions.map(t => t.created_at),
    ...emotionalStates.map(e => e.created_at),
  ];
  
  if (allDates.length === 0) return 'No activity yet';
  
  const latest = new Date(Math.max(...allDates.map(d => new Date(d).getTime())));
  return latest.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function findBestPerformanceTime(focusSessions: any[], taskCompletions: any[]): string {
  const hourCounts: { [key: number]: { sessions: number; quality: number } } = {};
  
  focusSessions.forEach(s => {
    const hour = new Date(s.created_at).getHours();
    if (!hourCounts[hour]) hourCounts[hour] = { sessions: 0, quality: 0 };
    hourCounts[hour].sessions++;
    hourCounts[hour].quality += s.quality_score || 0;
  });
  
  const entries = Object.entries(hourCounts);
  if (entries.length === 0) return 'Not enough data';
  
  const best = entries
    .map(([hour, data]) => ({ hour: parseInt(hour), avgQuality: data.quality / data.sessions }))
    .sort((a, b) => b.avgQuality - a.avgQuality)[0];
  
  if (best.hour < 12) return `Morning (${best.hour}AM)`;
  if (best.hour < 17) return `Afternoon (${best.hour - 12}PM)`;
  return `Evening (${best.hour - 12}PM)`;
}

function identifyNeedsSupport(focusSessions: any[], taskCompletions: any[], emotionalStates: any[]): Array<{ area: string; reason: string }> {
  const needs: Array<{ area: string; reason: string }> = [];
  
  // Check task completion rate
  const completionRate = taskCompletions.length > 0
    ? (taskCompletions.filter(t => t.completed).length / taskCompletions.length) * 100
    : 100;
  
  if (completionRate < 50) {
    needs.push({ area: 'Task Completion', reason: 'Completing less than 50% of tasks' });
  }
  
  // Check distraction levels
  const avgDistractions = focusSessions.length > 0
    ? focusSessions.reduce((sum, s) => sum + (s.distractions || 0), 0) / focusSessions.length
    : 0;
  
  if (avgDistractions > 5) {
    needs.push({ area: 'Focus', reason: 'High distraction levels during study' });
  }
  
  // Check emotional states
  const anxietyCount = emotionalStates.filter(e => e.emotion === 'anxious').length;
  if (anxietyCount > emotionalStates.length * 0.3) {
    needs.push({ area: 'Emotional Wellbeing', reason: 'Frequently reports feeling anxious' });
  }
  
  return needs;
}

function identifyStrengths(focusSessions: any[], taskCompletions: any[], emotionalStates: any[], goals: any[]): string[] {
  const strengths: string[] = [];
  
  // Check completion rate
  const completionRate = taskCompletions.length > 0
    ? (taskCompletions.filter(t => t.completed).length / taskCompletions.length) * 100
    : 0;
  
  if (completionRate > 80) {
    strengths.push('High task completion rate');
  }
  
  // Check focus quality
  const avgQuality = focusSessions.length > 0
    ? focusSessions.reduce((sum, s) => sum + (s.quality_score || 0), 0) / focusSessions.length
    : 0;
  
  if (avgQuality > 7) {
    strengths.push('Strong focus and concentration');
  }
  
  // Check goal setting
  if (goals.length > 3) {
    strengths.push('Proactive goal setter');
  }
  
  // Check consistency
  if (focusSessions.length + taskCompletions.length > 20) {
    strengths.push('Consistent daily practice');
  }
  
  return strengths;
}

