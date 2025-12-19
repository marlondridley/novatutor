/**
 * StreakCard
 * Tracks simple streaks and milestones locally (no PII).
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'besttutorever_streak';

type StreakState = {
  current: number;
  best: number;
  lastDate: string | null;
};

export function StreakCard() {
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    best: 0,
    lastDate: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setStreak(JSON.parse(saved));
    }
  }, []);

  const markToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (streak.lastDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const isConsecutive = streak.lastDate === yesterday;

    const nextCurrent = isConsecutive ? streak.current + 1 : 1;
    const nextBest = Math.max(streak.best, nextCurrent);
    const nextState = { current: nextCurrent, best: nextBest, lastDate: today };
    setStreak(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  const reset = () => {
    const nextState = { current: 0, best: streak.best, lastDate: null };
    setStreak(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  return (
    <Card className="border-2 border-orange-200 bg-white/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Flame className="h-5 w-5" /> Streaks & Wins
        </CardTitle>
        <span className="text-sm font-bold text-orange-600">
          Best: {streak.best} days
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-orange-700">
              {streak.current} day{streak.current === 1 ? '' : 's'}
            </div>
            <p className="text-sm text-muted-foreground">
              Keep your streak by practicing today!
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-orange-400" />
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={markToday}>
            Mark Today
          </Button>
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

