'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Download,
  Mail,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface ActivitySummary {
  date: string;
  subject: string;
  questionsAsked: number;
  timeSpent: number; // in minutes
  topicsDiscussed: string[];
  aiNotes: string;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalTimeSpent: number;
  subjectsStudied: string[];
  strengthsObserved: string[];
  areasForGrowth: string[];
  notableAchievements: string[];
}

export function ParentDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Mock data - replace with real data from your database
  const [activityData] = useState<ActivitySummary[]>([
    {
      date: '2025-11-03',
      subject: 'Mathematics',
      questionsAsked: 8,
      timeSpent: 35,
      topicsDiscussed: ['Fractions', 'Division', 'Word Problems'],
      aiNotes: 'Strong understanding of fraction concepts. Showed excellent problem-solving approach with word problems. Recommend continuing practice with multi-step problems.',
    },
    {
      date: '2025-11-02',
      subject: 'Science',
      questionsAsked: 5,
      timeSpent: 20,
      topicsDiscussed: ['Photosynthesis', 'Plant Biology'],
      aiNotes: 'Good grasp of basic photosynthesis concepts. Asked thoughtful questions about chloroplasts. Could benefit from visual diagrams.',
    },
    {
      date: '2025-11-01',
      subject: 'English',
      questionsAsked: 6,
      timeSpent: 28,
      topicsDiscussed: ['Essay Writing', 'Paragraph Structure', 'Thesis Statements'],
      aiNotes: 'Working on organizing essay structure. Shows creativity but needs support with thesis clarity. Improved significantly from last session.',
    },
  ]);

  const [weeklyData] = useState<WeeklySummary>({
    weekStart: '2025-10-28',
    weekEnd: '2025-11-03',
    totalTimeSpent: 175, // minutes
    subjectsStudied: ['Mathematics', 'Science', 'English', 'History'],
    strengthsObserved: [
      'Consistent daily practice',
      'Asks clarifying questions',
      'Shows growth mindset when facing challenges',
      'Strong mathematical reasoning',
    ],
    areasForGrowth: [
      'Time management with multi-step problems',
      'Reading comprehension speed',
      'Organization of essay ideas',
    ],
    notableAchievements: [
      'Mastered fractions to decimals conversion',
      'Completed first full essay independently',
      'Maintained 7-day study streak',
    ],
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (profile) {
          setUserName(profile.name);
        }
      }
      setLoading(false);
    }
    getUser();
  }, []);

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/parent-dashboard/download-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          weeklyData,
          activityData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create HTML file and trigger download
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Oops! We couldn\'t create that report right now. Let\'s try again together.');
      }
    } catch (err: any) {
      console.error('Download report error:', err);
      setError('Oops! We couldn\'t create that report right now. Let\'s try again together.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWeeklyEmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Get user email
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) {
        setError('No email address found. Please check your account settings.');
        return;
      }

      const response = await fetch('/api/parent-dashboard/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          parentEmail: currentUser.email,
          weeklyData,
          activityData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || 'Hmm, that email didn\'t send. Want to give it another shot?');
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      setError('Hmm, that email didn\'t send. Want to give it another shot?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const totalQuestions = activityData.reduce((sum, day) => sum + day.questionsAsked, 0);
  const avgTimePerDay = Math.round(weeklyData.totalTimeSpent / 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            {userName ? `${userName}'s` : 'Your child\'s'} learning activity and progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSendWeeklyEmail}
            disabled={loading}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Weekly Email
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadReport}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            Action completed successfully!
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(weeklyData.totalTimeSpent / 60)}h {weeklyData.totalTimeSpent % 60}m</div>
            <p className="text-xs text-muted-foreground">~{avgTimePerDay} min/day this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Practiced</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyData.subjectsStudied.length}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyData.subjectsStudied.slice(0, 2).join(', ')}
              {weeklyData.subjectsStudied.length > 2 && ` +${weeklyData.subjectsStudied.length - 2}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Active learning sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Keep up the momentum! 🎉</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Notable Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Notable Achievements
                </CardTitle>
                <CardDescription>What {userName || 'your child'} mastered this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {weeklyData.notableAchievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">✓</Badge>
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Areas for Growth
                </CardTitle>
                <CardDescription>Opportunities to focus on next</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {weeklyData.areasForGrowth.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">→</Badge>
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Observed Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Strengths Observed
              </CardTitle>
              <CardDescription>Positive patterns in learning behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {weeklyData.strengthsObserved.map((strength, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Time Distribution</CardTitle>
              <CardDescription>Where study time was spent this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyData.subjectsStudied.map((subject, idx) => {
                const percentage = Math.floor(Math.random() * 30) + 15; // Mock data
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{subject}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Activity Tab */}
        <TabsContent value="daily" className="space-y-4">
          {activityData.map((activity, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{activity.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {activity.timeSpent} min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Topics Discussed:</div>
                  <div className="flex flex-wrap gap-2">
                    {activity.topicsDiscussed.map((topic, topicIdx) => (
                      <Badge key={topicIdx} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Activity:</div>
                  <p className="text-sm text-muted-foreground">
                    {activity.questionsAsked} questions asked over {activity.timeSpent} minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {activityData.map((activity, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{activity.subject} Session</CardTitle>
                    <CardDescription>
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-accent/30 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">Learning Coach Insights:</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {activity.aiNotes}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Summary Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {userName || 'Your child'} is showing excellent progress this week! Particularly strong 
                performance in mathematical reasoning and consistent daily practice habits. Our Learning Coach 
                has observed improved problem-solving approaches and growing independence. 
                Continue encouraging the current routine, and consider exploring more challenging 
                word problems to build on current strengths.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Email Preview */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Weekly Email Preview
          </CardTitle>
          <CardDescription>
            This is what you'll receive every Monday morning
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-accent/30 rounded-lg p-6">
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-semibold text-lg">
              📚 This week, {userName || 'Jamie'} mastered fractions and time management!
            </h3>
            <p className="text-sm text-muted-foreground">
              <strong>Study Time:</strong> {Math.floor(weeklyData.totalTimeSpent / 60)} hours {weeklyData.totalTimeSpent % 60} minutes across {weeklyData.subjectsStudied.length} subjects
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Notable Achievement:</strong> {weeklyData.notableAchievements[0]}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Learning Coach Recommendation:</strong> Continue the great momentum! Consider focusing on {weeklyData.areasForGrowth[0].toLowerCase()} for even more growth.
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              View Full Report →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

