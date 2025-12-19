'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, BookOpen, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Email Onboarding Component
 * 
 * This component shows what new users will receive via email.
 * In production, these emails would be sent via your email service (SendGrid, Postmark, etc.)
 */

export function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Badge className="w-fit mb-2">Welcome Email</Badge>
        <CardTitle>Welcome to BestTutorEver, {userName}! 🎓</CardTitle>
        <CardDescription>
          Your personal AI study companion is ready to help you succeed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Hi {userName}!
        </p>
        <p className="text-sm">
          Welcome to BestTutorEver! We're excited to be part of your learning journey. 
          You now have access to your personal AI study companion that's available 24/7 
          to help with homework, test prep, and study skills.
        </p>

        <div className="bg-accent/30 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Quick Start Guide
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Ask Questions:</strong> Go to "BestTutorEver" and ask anything about your homework or subjects</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Plan Your Week:</strong> Use the Homework Planner on your Dashboard to organize assignments</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Test Prep:</strong> Generate practice quizzes to prepare for upcoming tests</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Learning Path:</strong> Get personalized study recommendations based on your goals</span>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground">
            BestTutorEver uses the Socratic method—it won't just give you answers, 
            but will guide you to discover solutions yourself. This helps you truly 
            understand concepts, not just memorize them!
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-sm">
            Need help getting started? Reply to this email or check out our help center.
          </p>
          <p className="text-sm">
            Happy studying!<br />
            The BestTutorEver Team
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyProgressEmail({ 
  userName, 
  weekData 
}: { 
  userName: string;
  weekData: {
    totalTime: number;
    subjectsStudied: string[];
    achievement: string;
    recommendation: string;
  }
}) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Badge className="w-fit mb-2">Weekly Email</Badge>
        <CardTitle>📚 This week, {userName} mastered key concepts!</CardTitle>
        <CardDescription>
          Your weekly progress summary from BestTutorEver
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Hi {userName}'s parent!
        </p>
        <p className="text-sm">
          Here's what {userName} accomplished this week with BestTutorEver:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-accent/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.floor(weekData.totalTime / 60)}h {weekData.totalTime % 60}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">Study Time</p>
          </div>
          <div className="bg-accent/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {weekData.subjectsStudied.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Subjects Practiced</p>
          </div>
          <div className="bg-accent/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">7</div>
            <p className="text-xs text-muted-foreground mt-1">Day Streak 🔥</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            Notable Achievement
          </h3>
          <p className="text-sm text-green-800">{weekData.achievement}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-900">
            <Target className="h-4 w-4" />
            BestTutorEver Recommendation
          </h3>
          <p className="text-sm text-blue-800">{weekData.recommendation}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Want more details?
          </p>
          <Button variant="outline" size="sm">
            View Full Report →
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          You're receiving this because you're a BestTutorEver subscriber. 
          Manage email preferences in your account settings.
        </p>
      </CardContent>
    </Card>
  );
}

export function OnboardingTipsEmail({ userName, day }: { userName: string; day: number }) {
  const tips = [
    {
      day: 1,
      title: "Start with Your Toughest Subject",
      content: "Don't avoid the hard stuff! Ask BestTutorEver about the topic you find most challenging. Breaking it down into smaller pieces makes it much easier.",
      icon: BookOpen,
    },
    {
      day: 3,
      title: "Use the Homework Planner",
      content: "The Homework Planner helps you break large assignments into manageable chunks. Try adding your upcoming assignments and see how it suggests a study schedule!",
      icon: Calendar,
    },
    {
      day: 5,
      title: "Practice Active Learning",
      content: "Instead of re-reading notes, ask BestTutorEver to quiz you! Generate practice questions on topics you've studied to test your understanding.",
      icon: Target,
    },
  ];

  const tip = tips.find(t => t.day === day);
  if (!tip) return null;

  const Icon = tip.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Badge className="w-fit mb-2">Day {day} Tip</Badge>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {tip.title}
        </CardTitle>
        <CardDescription>
          Quick tip to get the most out of BestTutorEver
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Hi {userName}!
        </p>
        <p className="text-sm">
          {tip.content}
        </p>
        <div className="bg-accent/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Try it now:</p>
          <Button variant="outline" size="sm" className="w-full">
            Go to BestTutorEver →
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We'll send you a few tips during your first week to help you get started. 
          After that, you'll just get weekly progress summaries!
        </p>
      </CardContent>
    </Card>
  );
}

// Preview component to show all email templates
export function EmailOnboardingPreview({ userName }: { userName: string }) {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Onboarding Preview</h2>
        <p className="text-muted-foreground mb-6">
          These are the emails new users will receive to help them get started
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">1. Welcome Email (Day 0)</h3>
          <WelcomeEmail userName={userName || "Jamie"} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">2. Quick Start Tips (Days 1, 3, 5)</h3>
          <div className="space-y-4">
            <OnboardingTipsEmail userName={userName || "Jamie"} day={1} />
            <OnboardingTipsEmail userName={userName || "Jamie"} day={3} />
            <OnboardingTipsEmail userName={userName || "Jamie"} day={5} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">3. Weekly Progress Email (Every Monday)</h3>
          <WeeklyProgressEmail 
            userName={userName || "Jamie"}
            weekData={{
              totalTime: 175,
              subjectsStudied: ['Math', 'Science', 'English'],
              achievement: 'Mastered fractions to decimals conversion and completed first full essay independently!',
              recommendation: 'Continue the great momentum! Consider focusing on reading comprehension speed for even more growth.',
            }}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Implementation Notes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Use a service like SendGrid, Postmark, or Resend to send these emails</li>
          <li>• Trigger welcome email on signup completion</li>
          <li>• Schedule tips emails for days 1, 3, and 5 after signup</li>
          <li>• Send weekly progress emails every Monday morning at 9 AM</li>
          <li>• Include unsubscribe link in all emails</li>
          <li>• Track email opens and clicks to measure engagement</li>
        </ul>
      </div>
    </div>
  );
}

