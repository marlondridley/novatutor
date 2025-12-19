'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/auth-context';

interface DayActivity {
  day: string;
  minutes: number;
  intensity: 'none' | 'low' | 'medium' | 'high';
}

export function LearningRhythmChart() {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<DayActivity[]>([]);
  const [isBeating, setIsBeating] = useState(false);

  useEffect(() => {
    // TODO: Fetch real data from Supabase based on user's activity
    // For now, generate data based on last 7 days
    const last7Days: DayActivity[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));

      // Mock data - replace with real Supabase query
      const minutes = Math.random() > 0.3 ? Math.floor(Math.random() * 60) + 10 : 0;

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes,
        intensity: minutes === 0 ? 'none' :
                  minutes < 20 ? 'low' :
                  minutes < 40 ? 'medium' : 'high'
      };
    });
    
    setWeekData(last7Days);
  }, [user]);

  // Calculate streak
  const currentStreak = weekData.reduce((streak, day) => {
    if (day.minutes > 0) return streak + 1;
    return 0;
  }, 0);

  // Animate the metronome beat
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBeating(true);
      setTimeout(() => setIsBeating(false), 300);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const getBarHeight = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'h-24';
      case 'medium': return 'h-16';
      case 'low': return 'h-8';
      default: return 'h-2';
    }
  };

  const getBarColor = (intensity: string, index: number, isToday: boolean) => {
    const baseClasses = 'transition-all duration-300 rounded-t-xl';
    
    if (isToday && isBeating) {
      return `${baseClasses} bg-primary scale-105 shadow-lg`;
    }
    
    switch (intensity) {
      case 'high': return `${baseClasses} bg-primary`;
      case 'medium': return `${baseClasses} bg-primary/70`;
      case 'low': return `${baseClasses} bg-primary/40`;
      default: return `${baseClasses} bg-muted`;
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-5 w-5 transition-all ${isBeating ? 'scale-125 text-primary' : 'text-muted-foreground'}`} />
              <CardTitle>Learning Rhythm</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The goal isn't every day — it's steady effort. You're building great habits!
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            {currentStreak > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Streak:</span>
                <span className="font-bold text-primary">{currentStreak} days 🔥</span>
              </div>
            )}
          </div>
          <CardDescription>
            Your study consistency over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Metronome-style bars */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {weekData.map((day, index) => {
              const isToday = index === weekData.length - 1;
              return (
                <Tooltip key={day.day}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center flex-1 gap-2 group cursor-pointer">
                      <div className="flex-1 w-full flex items-end justify-center">
                        <div 
                          className={`w-full ${getBarHeight(day.intensity)} ${getBarColor(day.intensity, index, isToday)} group-hover:scale-105 group-hover:shadow-md`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                        {day.day}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{day.day}</p>
                    <p className="text-sm">
                      {day.minutes > 0 
                        ? `${day.minutes} minutes of focused study`
                        : 'Rest day — that\'s okay!'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold text-primary">
                {weekData.filter(d => d.minutes > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Active days</p>
            </div>
            <div className="text-center flex-1 border-l">
              <p className="text-2xl font-bold text-primary">
                {Math.round(weekData.reduce((sum, d) => sum + d.minutes, 0) / 60)}h
              </p>
              <p className="text-xs text-muted-foreground">Total time</p>
            </div>
            <div className="text-center flex-1 border-l">
              <p className="text-2xl font-bold text-primary">
                {Math.round(weekData.reduce((sum, d) => sum + d.minutes, 0) / 7)}
              </p>
              <p className="text-xs text-muted-foreground">Avg min/day</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

