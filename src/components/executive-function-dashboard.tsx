/**
 * Executive Function Dashboard
 * Shows student progress in focus, task completion, confidence, and goals
 */

'use client';

import { useStudentAnalytics } from '@/hooks/use-student-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

function MetricCard({ title, value, subtitle, icon, trend, color = 'blue' }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(
          "p-2 rounded-full",
          color === 'blue' && "bg-blue-100 dark:bg-blue-900",
          color === 'green' && "bg-green-100 dark:bg-green-900",
          color === 'purple' && "bg-purple-100 dark:bg-purple-900",
          color === 'orange' && "bg-orange-100 dark:bg-orange-900",
          color === 'cyan' && "bg-cyan-100 dark:bg-cyan-900",
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {trend === 'down' && <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ExecutiveFunctionDashboard() {
  const { analytics, loading, error } = useStudentAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-muted-foreground">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  const confidenceTrendDirection = analytics.confidenceImprovement > 0 ? 'up' : 
                                   analytics.confidenceImprovement < 0 ? 'down' : 'neutral';

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600">
            📊 Your Executive Function Progress
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your focus, tasks, confidence, and goals
          </p>
        </div>
        {analytics.streakDays > 1 && (
          <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-orange-700 dark:text-orange-400">
              {analytics.streakDays} Day Streak! 🔥
            </span>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Focus Sessions"
          value={analytics.totalFocusSessions}
          subtitle={`Avg ${Math.round(analytics.averageFocusDuration)} min`}
          icon={<Brain className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        
        <MetricCard
          title="Task Completion"
          value={`${Math.round(analytics.taskCompletionRate)}%`}
          subtitle={`${analytics.totalTasksCompleted} of ${analytics.totalTasksAttempted} completed`}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          color="green"
          trend={analytics.taskCompletionRate > 70 ? 'up' : 'neutral'}
        />
        
        <MetricCard
          title="Confidence"
          value={`${analytics.averageConfidence.toFixed(1)}/10`}
          subtitle={
            analytics.confidenceImprovement !== 0
              ? `${Math.abs(Math.round(analytics.confidenceImprovement))}% ${confidenceTrendDirection === 'up' ? 'increase' : 'decrease'}`
              : 'Stable'
          }
          icon={<Sparkles className="w-5 h-5 text-purple-600" />}
          color="purple"
          trend={confidenceTrendDirection}
        />
        
        <MetricCard
          title="Active Goals"
          value={analytics.activeGoals}
          subtitle={`${analytics.completedGoals} completed`}
          icon={<Target className="w-5 h-5 text-orange-600" />}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Trend Chart */}
        {analytics.confidenceTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Confidence Over Time
              </CardTitle>
              <CardDescription>Your confidence levels during recent sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.confidenceTrend.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{point.date}</span>
                    <div className="flex-1">
                      <Progress value={point.level * 10} className="h-3" />
                    </div>
                    <span className="text-sm font-bold w-12">{point.level}/10</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Focus Quality Chart */}
        {analytics.focusQualityTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Focus Quality
              </CardTitle>
              <CardDescription>How well you focused during recent sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.focusQualityTrend.map((point, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{point.date}</span>
                    <div className="flex-1">
                      <Progress 
                        value={point.score * 10} 
                        className={cn(
                          "h-3",
                          point.score >= 8 && "bg-green-200 [&>div]:bg-green-600",
                          point.score >= 5 && point.score < 8 && "bg-yellow-200 [&>div]:bg-yellow-600",
                          point.score < 5 && "bg-red-200 [&>div]:bg-red-600",
                        )}
                      />
                    </div>
                    <span className="text-sm font-bold w-12">{point.score}/10</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        {analytics.strengths.length > 0 && (
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Trophy className="w-5 h-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Sessions</span>
                <Badge variant="secondary">{analytics.totalSessions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Most Studied</span>
                <Badge variant="secondary">{analytics.mostStudiedSubject}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Best Time</span>
                <Badge variant="secondary">{analytics.bestPerformanceTime}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Active</span>
                <Badge variant="secondary" className="text-xs">
                  {analytics.lastActiveDate}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Areas for Growth */}
        {analytics.needsSupport.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <AlertCircle className="w-5 h-5" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics.needsSupport.map((need, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-semibold text-blue-700 dark:text-blue-400">{need.area}</div>
                    <div className="text-muted-foreground text-xs">{need.reason}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emotional States */}
      {analytics.emotionalStates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              How You're Feeling
            </CardTitle>
            <CardDescription>Your most common emotional states during learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {analytics.emotionalStates.map((state, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-4 py-2 text-sm font-semibold"
                >
                  {state.emotion} ({state.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

