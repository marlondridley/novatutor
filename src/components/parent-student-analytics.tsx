/**
 * Parent-facing Student Analytics
 * Shows aggregated insights for parents to understand their child's progress
 */

'use client';

import { useStudentAnalytics } from '@/hooks/use-student-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Heart,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParentStudentAnalyticsProps {
  studentUserId: string;
  studentName: string;
}

export function ParentStudentAnalytics({ studentUserId, studentName }: ParentStudentAnalyticsProps) {
  const { analytics, loading, error } = useStudentAnalytics(studentUserId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading {studentName}'s progress...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Failed to load student analytics'}
        </AlertDescription>
      </Alert>
    );
  }

  // Determine overall performance level
  const overallScore = (
    (analytics.taskCompletionRate * 0.3) +
    (analytics.averageConfidence * 10 * 0.3) +
    ((10 - analytics.averageDistractions) * 10 * 0.2) +
    (analytics.goalCompletionRate * 0.2)
  );

  const performanceLevel = 
    overallScore >= 80 ? { label: 'Excellent', color: 'green', emoji: '🌟' } :
    overallScore >= 60 ? { label: 'Good', color: 'blue', emoji: '👍' } :
    overallScore >= 40 ? { label: 'Fair', color: 'yellow', emoji: '📈' } :
    { label: 'Needs Support', color: 'red', emoji: '💙' };

  return (
    <div className="space-y-6">
      {/* Header with Performance Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950/30 dark:to-cyan-950/30 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-black text-purple-900 dark:text-purple-100 mb-2">
              {studentName}'s Executive Function Progress
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Last active: {analytics.lastActiveDate}
            </p>
            
            <div className="flex items-center gap-3">
              <Badge 
                className={cn(
                  "text-lg px-4 py-2",
                  performanceLevel.color === 'green' && "bg-green-500",
                  performanceLevel.color === 'blue' && "bg-blue-500",
                  performanceLevel.color === 'yellow' && "bg-yellow-500",
                  performanceLevel.color === 'red' && "bg-red-500",
                )}
              >
                {performanceLevel.emoji} {performanceLevel.label}
              </Badge>
              
              {analytics.streakDays > 1 && (
                <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/50 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                    {analytics.streakDays} day streak
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
              {Math.round(overallScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {analytics.needsSupport.length > 0 && (
        <Alert className="border-orange-200 dark:border-orange-800">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            Areas That May Need Your Support
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-2">
              {analytics.needsSupport.map((need, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-semibold text-orange-700 dark:text-orange-400">{need.area}:</span>
                  <span className="text-orange-900 dark:text-orange-200">{need.reason}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics for Parents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              Focus & Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFocusSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {Math.round(analytics.averageFocusDuration)} min sessions
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.averageDistractions)} avg distractions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.taskCompletionRate)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalTasksCompleted} of {analytics.totalTasksAttempted} completed
            </p>
            <Progress value={analytics.taskCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-600" />
              Confidence Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageConfidence.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {analytics.confidenceImprovement > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">+{Math.round(analytics.confidenceImprovement)}%</span>
                </>
              ) : analytics.confidenceImprovement < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-red-600">{Math.round(analytics.confidenceImprovement)}%</span>
                </>
              ) : (
                <span>Stable</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              Goals & Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.completedGoals} goals completed
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(analytics.goalCompletionRate)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights for Parents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Working Well */}
        {analytics.strengths.length > 0 && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Award className="w-5 h-5" />
                What's Working Well
              </CardTitle>
              <CardDescription>Celebrate these achievements with {studentName}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analytics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">{strength}</div>
                      <div className="text-xs text-muted-foreground">
                        {getStrengthRecommendation(strength)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Study Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Study Patterns & Insights
            </CardTitle>
            <CardDescription>Understanding {studentName}'s learning habits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Most Studied Subject</span>
                  <Badge variant="secondary">{analytics.mostStudiedSubject}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consider providing extra resources in this subject.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Best Performance Time</span>
                  <Badge variant="secondary">{analytics.bestPerformanceTime}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Schedule challenging tasks during this time for best results.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Time Estimation Accuracy</span>
                  <Badge variant="secondary">{Math.round(analytics.timeEstimationAccuracy)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.timeEstimationAccuracy > 80 
                    ? "Excellent at planning time for tasks!" 
                    : "May benefit from practice estimating how long tasks take."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Wellbeing */}
      {analytics.emotionalStates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Emotional Wellbeing During Learning
            </CardTitle>
            <CardDescription>
              How {studentName} is feeling during study sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {analytics.emotionalStates.map((state, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={cn(
                    "px-4 py-2 text-sm font-semibold",
                    state.emotion === 'confident' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                    state.emotion === 'anxious' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                    state.emotion === 'motivated' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
                    state.emotion === 'overwhelmed' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                  )}
                >
                  {state.emotion} ({state.count})
                </Badge>
              ))}
            </div>
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertTitle>Parent Tip</AlertTitle>
              <AlertDescription>
                {getEmotionalWellbeingTip(analytics.emotionalStates)}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>Overview of {studentName}'s recent engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalSessions}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.totalTasksCompleted}</div>
              <div className="text-xs text-muted-foreground mt-1">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.goalsThisWeek}</div>
              <div className="text-xs text-muted-foreground mt-1">Goals This Week</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.streakDays}</div>
              <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for recommendations

function getStrengthRecommendation(strength: string): string {
  const recommendations: { [key: string]: string } = {
    'High task completion rate': 'Keep encouraging this strong work ethic!',
    'Strong focus and concentration': 'Their ability to focus is a great foundation for learning.',
    'Proactive goal setter': 'Support their goal-setting with regular check-ins.',
    'Consistent daily practice': 'Their consistency is building strong learning habits.',
  };
  
  return recommendations[strength] || 'This is a valuable strength to nurture!';
}

function getEmotionalWellbeingTip(emotionalStates: Array<{ emotion: string; count: number }>): string {
  const topEmotion = emotionalStates[0]?.emotion;
  
  const tips: { [key: string]: string } = {
    'confident': `${emotionalStates[0].emotion} is frequently reported! Continue celebrating successes and building on this positive momentum.`,
    'anxious': `${emotionalStates[0].emotion} appears often. Consider discussing stress management techniques and ensuring workload is manageable.`,
    'motivated': `${emotionalStates[0].emotion} is great to see! Harness this motivation by setting exciting learning goals together.`,
    'overwhelmed': `${emotionalStates[0].emotion} is being reported. Break tasks into smaller chunks and ensure adequate breaks.`,
    'frustrated': `${emotionalStates[0].emotion} is common. Work together to identify specific challenges and develop coping strategies.`,
  };
  
  return tips[topEmotion] || 'Regular check-ins about how they\'re feeling during study time can help you provide better support.';
}

