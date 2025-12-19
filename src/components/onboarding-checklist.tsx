/**
 * OnboardingChecklist
 * Kid-friendly, parent-friendly checklist to guide first-time use.
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const defaultItems = [
  { id: 'profile', label: "Create your child's profile" },
  { id: 'goal', label: 'Pick a weekly goal (e.g., 3 sessions)' },
  { id: 'mic', label: 'Try the microphone once' },
  { id: 'ask', label: 'Ask your first question' },
  { id: 'plan', label: 'Add one homework task' },
];

export function OnboardingChecklist() {
  const [items, setItems] = useState(() =>
    defaultItems.map((item) => ({ ...item, done: false }))
  );

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const reset = () => setItems(defaultItems.map((i) => ({ ...i, done: false })));

  const progress = Math.round(
    (items.filter((i) => i.done).length / items.length) * 100
  );

  return (
    <Card className="border-2 border-purple-200 bg-white/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-extrabold text-purple-700">
            First-Time Checklist
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick wins to get started. Kids + parents friendly.
          </p>
        </div>
        <div className="text-sm font-bold text-purple-700">{progress}%</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:border-purple-300 hover:bg-purple-50"
          >
            {item.done ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-purple-300" />
            )}
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}

        <Button variant="ghost" className="text-sm" onClick={reset}>
          Reset checklist
        </Button>
      </CardContent>
    </Card>
  );
}

