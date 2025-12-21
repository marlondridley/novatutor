'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mic } from 'lucide-react';
import { VoiceToTextPremium } from '@/components/voice-to-text-premium';
import { getEducationalAssistantResponse } from '@/lib/actions';

type Subject = 'Math' | 'Science' | 'Writing';

type ChatMsg = { role: 'user' | 'assistant'; content: string };

export function VoiceTutorApp() {
  const [subject, setSubject] = useState<Subject>('Math');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content;
    }
    return null;
  }, [messages]);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (q.length < 2) return;

      setError(null);
      setLoading(true);
      setMessages((prev) => [...prev, { role: 'user', content: q }]);

      try {
        const res = await getEducationalAssistantResponse({
          subject,
          studentQuestion: q,
        });

        if (res.success && res.data) {
          setMessages((prev) => [...prev, { role: 'assistant', content: res.data.tutorResponse }]);
        } else {
          setError(res.success ? 'Failed to get tutor response' : res.error);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to get tutor response');
      } finally {
        setLoading(false);
      }
    },
    [subject]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-red-500" />
            Voice Tutor
          </CardTitle>
          <CardDescription>Speak a question and get an answer right away.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Subject</span>
              <Select value={subject} onValueChange={(v) => setSubject(v as Subject)} disabled={loading}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <Badge variant="secondary" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking…
              </Badge>
            ) : (
              <Badge variant="outline">Ready</Badge>
            )}

            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VoiceToTextPremium
            autoStart={true}
            title="🎙️ Hold, speak, and let go"
            description="When your speech finishes, NovaTutor will answer."
            placeholder="Your question will appear here as you speak..."
            onTranscript={(t) => {
              // Debounced/streamed transcripts can fire a lot; only submit when fairly complete.
              // The underlying component already tends to deliver a stable transcript at stop.
              if (!loading && t.trim().length > 12 && t.trim() !== lastUserMessage) {
                void ask(t);
              }
            }}
          />
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversation</CardTitle>
            <CardDescription>Voice → tutor response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.slice(-8).map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-xl bg-blue-600 text-white p-3 text-sm'
                    : 'mr-auto max-w-[85%] rounded-xl bg-muted p-3 text-sm'
                }
              >
                {m.content}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


