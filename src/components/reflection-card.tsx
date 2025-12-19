/**
 * ReflectionCard
 * Quick reflection with emoji + optional note. Stored locally (no PII).
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'besttutorever_reflection';

const moods = [
  { id: 'happy', label: '😊', text: 'Happy' },
  { id: 'proud', label: '🤩', text: 'Proud' },
  { id: 'confused', label: '🤔', text: 'Confused' },
  { id: 'tired', label: '😴', text: 'Tired' },
];

type ReflectionState = {
  mood: string | null;
  note: string;
};

export function ReflectionCard() {
  const [state, setState] = useState<ReflectionState>({ mood: null, note: '' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setState(JSON.parse(saved));
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  return (
    <Card className="border-2 border-purple-200 bg-white/80">
      <CardHeader className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <CardTitle className="text-purple-700">How did that feel?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {moods.map((mood) => (
            <Button
              key={mood.id}
              type="button"
              variant={state.mood === mood.id ? 'default' : 'outline'}
              onClick={() => setState((prev) => ({ ...prev, mood: mood.id }))}
              className="text-lg"
              aria-pressed={state.mood === mood.id}
            >
              {mood.label} {mood.text}
            </Button>
          ))}
        </div>

        <Textarea
          placeholder="Add a quick note for your tutor or parent..."
          value={state.note}
          onChange={(e) => setState((prev) => ({ ...prev, note: e.target.value }))}
          className="min-h-[80px]"
        />

        <Button onClick={save} className="w-full">
          Save Reflection
        </Button>
      </CardContent>
    </Card>
  );
}

