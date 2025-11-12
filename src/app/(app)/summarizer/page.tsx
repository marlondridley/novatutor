import { LocalSummarizer } from '@/components/local-summarizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Lock, Zap } from 'lucide-react';

export const metadata = {
  title: 'Smart Summarizer | Study Coach',
  description: 'Summarize your notes privately with AI running on your device',
};

export default function SummarizerPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Smart Summarizer
        </h1>
        <p className="text-muted-foreground">
          Turn long notes into clear summaries — privately and instantly, right in your browser.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <Lock className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">100% Private</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your text never leaves your device. Everything runs locally in your browser.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Summaries in seconds after the AI model loads once (then it's cached).
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Brain className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">AI-Powered</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Uses advanced machine learning to extract key ideas and create concise summaries.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Summarizer Component */}
      <LocalSummarizer />

      {/* Use Cases */}
      <Card className="bg-accent/5">
        <CardHeader>
          <CardTitle>💡 Ways to Use This</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">📝</span>
              <span>Summarize your <strong>Cornell Notes</strong> notes area into the summary section</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">📚</span>
              <span>Condense long <strong>textbook chapters</strong> for quick review</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">🎯</span>
              <span>Turn homework instructions into <strong>action items</strong> for your Focus Plan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">🔍</span>
              <span>Extract key points from <strong>articles and research</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✅</span>
              <span>Create quick <strong>study guides</strong> from your learning journal</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

