'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck, TrendingUp, Clock, Mic, DollarSign, Activity } from 'lucide-react';
import type { ParentLearningMetrics } from '@/lib/parent-learning-metrics';

function formatUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export function ParentLearningMetricsPanel() {
  const [metrics, setMetrics] = useState<ParentLearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/parent-dashboard/learning-metrics?range=7d');
        if (!res.ok) throw new Error('Failed to load learning metrics');
        const data = await res.json();
        if (cancelled) return;
        setMetrics(data.metrics || null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load learning metrics');
        setMetrics(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const topConcepts = useMemo(() => {
    if (!metrics) return [];
    return metrics.learningValue.concepts.slice(0, 6);
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading learning metrics…
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'No learning metrics available yet.'}</AlertDescription>
      </Alert>
    );
  }

  const voicePct = metrics.engagement.voiceLearningRatio !== null
    ? Math.round(metrics.engagement.voiceLearningRatio * 100)
    : null;

  const errorFreePct = metrics.systemQuality.errorFreeSessionsRate !== null
    ? Math.round(metrics.systemQuality.errorFreeSessionsRate * 100)
    : null;

  const ef = metrics.executiveFunction;

  return (
    <div className="space-y-6">
      {/* Top Row (Emotional Trust) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Learning Progress
            </CardTitle>
            <CardDescription>Is your child actually learning?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.learningValue.productiveStruggleScore !== null
                ? `${metrics.learningValue.productiveStruggleScore}/100`
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Productive Struggle Score
            </p>
            {ef && (
              <p className="text-xs text-muted-foreground mt-2">
                Executive function: {Math.round(ef.taskCompletionRate)}% task completion • {ef.streakDays} day streak
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Safety Status
            </CardTitle>
            <CardDescription>Trust & guardrails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OK</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unsafe flags: {metrics.safetyAndQuality.unsafeContentFlags}
            </p>
            <p className="text-xs text-muted-foreground">
              Answer suppression: {metrics.safetyAndQuality.answerSuppressionEvents}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Cost This Week
            </CardTitle>
            <CardDescription>Transparent, parent-friendly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(metrics.cost.costThisWeekUsd)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg per session: {metrics.cost.averageCostPerSessionUsd !== null ? formatUsd(metrics.cost.averageCostPerSessionUsd) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle (Insight) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time to Unstuck
            </CardTitle>
            <CardDescription>How fast NovaTutor helps your child move forward</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{metrics.learningValue.timeToUnstuckCopy}</p>
            <div className="text-xs text-muted-foreground">
              Avg response latency: {metrics.systemQuality.avgResponseLatencyMs !== null ? `${metrics.systemQuality.avgResponseLatencyMs}ms` : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              Error-free sessions: {errorFreePct !== null ? `${errorFreePct}%` : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Weak vs Strong Topics
            </CardTitle>
            <CardDescription>Concept-level progress from quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topConcepts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No concept data yet. Completing a quiz unlocks concept insights.</p>
            ) : (
              <div className="space-y-2">
                {topConcepts.map((c) => (
                  <div key={`${c.subject}:${c.concept}`} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{c.concept}</div>
                      <div className="text-xs text-muted-foreground">{c.subject} • {c.detail}</div>
                    </div>
                    <Badge
                      variant={c.status === 'improved' ? 'secondary' : c.status === 'needs_reinforcement' ? 'destructive' : 'outline'}
                      className="shrink-0"
                    >
                      {c.status === 'improved' ? 'Improved' : c.status === 'needs_reinforcement' ? 'Needs reinforcement' : 'Stable'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Executive Function Summary (Phase 2) */}
      {ef && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Function Summary</CardTitle>
            <CardDescription>Focus, confidence, planning habits (Phase 2)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold">{Math.round(ef.averageFocusDurationMinutes)}m</div>
              <div className="text-xs text-muted-foreground">Avg focus session</div>
              <div className="text-xs text-muted-foreground">{Math.round(ef.averageDistractions)} distractions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(ef.taskCompletionRate)}%</div>
              <div className="text-xs text-muted-foreground">Task completion</div>
              <Progress value={Math.max(0, Math.min(100, ef.taskCompletionRate))} className="h-2 mt-2" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ef.averageConfidence.toFixed(1)}/10</div>
              <div className="text-xs text-muted-foreground">Confidence level</div>
              <div className="text-xs text-muted-foreground">
                {ef.confidenceImprovementPercent > 0 ? '+' : ''}
                {Math.round(ef.confidenceImprovementPercent)}% vs earlier
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ef.streakDays}</div>
              <div className="text-xs text-muted-foreground">Day streak</div>
              <div className="text-xs text-muted-foreground">{ef.bestPerformanceTime}</div>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="text-sm font-semibold">Parent Coaching</div>
              <div className="text-sm mt-1">{ef.parentCoach.headline}</div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">What we’re seeing</div>
                  {ef.parentCoach.observations.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Building a baseline.</div>
                  ) : (
                    ef.parentCoach.observations.map((o, i) => (
                      <div key={i} className="text-sm text-muted-foreground">• {o}</div>
                    ))
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Try this next</div>
                  {ef.parentCoach.tips.map((t, i) => (
                    <div key={i} className="text-sm text-muted-foreground">• {t}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          {(ef.needsSupport.length > 0 || ef.strengths.length > 0) && (
            <CardContent className="pt-0 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Strengths</div>
                {ef.strengths.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Building a baseline.</div>
                ) : (
                  <div className="space-y-1">
                    {ef.strengths.slice(0, 4).map((s, i) => (
                      <div key={i} className="text-sm text-muted-foreground">• {s}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">May need support</div>
                {ef.needsSupport.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No flags this period.</div>
                ) : (
                  <div className="space-y-1">
                    {ef.needsSupport.slice(0, 3).map((n, i) => (
                      <div key={i} className="text-sm text-muted-foreground">• {n.area}: {n.reason}</div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Engagement + Controls row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Usage & Engagement
            </CardTitle>
            <CardDescription>Is your child actually using this product?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-2xl font-bold">{metrics.engagement.activeLearningDays}</div>
                <div className="text-xs text-muted-foreground">Active learning days</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.engagement.totalSessions}</div>
                <div className="text-xs text-muted-foreground">Total sessions (incl. voice)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{voicePct !== null ? `${voicePct}%` : '—'}</div>
                <div className="text-xs text-muted-foreground">Voice learning ratio</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Subjects touched</div>
              {metrics.engagement.subjectsTouched.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subject data yet.</p>
              ) : (
                metrics.engagement.subjectsTouched.map((s) => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.subject}</span>
                      <span className="text-muted-foreground">{s.percent}%</span>
                    </div>
                    <Progress value={s.percent} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Parent Summary</CardTitle>
            <CardDescription>Automatic learning report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm font-medium">{metrics.weeklySummary.headline}</div>
            <div className="space-y-1">
              {metrics.weeklySummary.highlights.map((h, i) => (
                <div key={i} className="text-xs text-muted-foreground">• {h}</div>
              ))}
            </div>
            <div className="pt-2">
              <div className="text-xs font-semibold">Suggested next steps</div>
              <div className="space-y-1 mt-1">
                {metrics.weeklySummary.nextSteps.map((n, i) => (
                  <div key={i} className="text-xs text-muted-foreground">• {n}</div>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground pt-2">
              {metrics.cost.costVsLearningValueCopy}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


