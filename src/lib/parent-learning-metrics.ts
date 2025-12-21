export type LearningMetricPeriod = {
  start: string; // ISO
  end: string;   // ISO
  label: '7d' | '30d';
};

export type ConceptInsight = {
  concept: string;
  subject: string;
  status: 'improved' | 'needs_reinforcement' | 'stable';
  detail: string;
};

export type SubjectSlice = {
  subject: string;
  percent: number; // 0-100
  count: number;
};

export type ParentLearningMetrics = {
  period: LearningMetricPeriod;

  executiveFunction?: {
    // Focus & Productivity
    totalFocusSessions: number;
    averageFocusDurationMinutes: number;
    averageDistractions: number;
    bestPerformanceTime: string;
    mostStudiedSubject: string;
    streakDays: number;

    // Task completion
    taskCompletionRate: number; // 0-100
    timeEstimationAccuracy: number; // 0-100

    // Confidence
    averageConfidence: number; // 0-10
    confidenceImprovementPercent: number; // +/- %

    // Insights
    needsSupport: Array<{ area: string; reason: string }>;
    strengths: string[];

    // Parent-friendly coaching copy (plain language)
    parentCoach: {
      headline: string;
      observations: string[];
      tips: string[];
    };
  };

  learningValue: {
    concepts: ConceptInsight[];
    timeToUnstuckSecondsAvg: number | null;
    timeToUnstuckCopy: string;
    productiveStruggleScore: number | null; // 0-100
  };

  engagement: {
    activeLearningDays: number;
    totalSessions: number;
    voiceLearningRatio: number | null; // 0-1
    subjectsTouched: SubjectSlice[];
  };

  safetyAndQuality: {
    tutorTypesUsed: Array<{ type: string; count: number }>;
    answerSuppressionEvents: number; // best-effort proxy
    unsafeContentFlags: number;       // best-effort proxy
  };

  cost: {
    costThisWeekUsd: number;
    averageCostPerSessionUsd: number | null;
    weeklyAverageUsd: number | null;
    costVsLearningValueCopy: string;
  };

  systemQuality: {
    avgResponseLatencyMs: number | null;
    errorFreeSessionsRate: number | null; // 0-1
  };

  weeklySummary: {
    headline: string;
    highlights: string[];
    nextSteps: string[];
  };
};

type AiSessionRow = {
  session_type?: string | null;
  subject?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  message_count?: number | null;
  cost_usd?: number | null;
  metadata?: any;
};

type QuizResultRow = {
  subject?: string | null;
  topic?: string | null;
  score?: number | null;
  time_spent_seconds?: number | null;
  completed?: boolean | null;
  completed_at?: string | null;
  created_at?: string | null;
};

type VoiceUsageRow = {
  voice_type?: string | null;
  duration_seconds?: number | null;
  estimated_cost?: number | null;
  created_at?: string | null;
};

type FocusSessionRow = {
  created_at?: string | null;
  duration_minutes?: number | null;
  distractions?: number | null;
  quality_score?: number | null;
  subject?: string | null;
};

type TaskCompletionRow = {
  created_at?: string | null;
  completed?: boolean | null;
  planned_time_minutes?: number | null;
  actual_time_minutes?: number | null;
  time_accuracy?: number | null;
  subject?: string | null;
};

type EmotionalStateRow = {
  created_at?: string | null;
  emotion?: string | null;
  intensity?: number | null;
};

type StudentGoalRow = {
  created_at?: string | null;
  completed?: boolean | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function safeNumber(n: any): number | null {
  const x = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(x) ? x : null;
}

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function startOfDayIso(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m <= 0) return `${rem}s`;
  return `${m}m ${rem.toString().padStart(2, '0')}s`;
}

function subjectLabel(subject?: string | null) {
  return (subject || 'General').toString();
}

export function computeParentLearningMetrics(input: {
  label: '7d' | '30d';
  aiSessions: AiSessionRow[];
  quizResults: QuizResultRow[];
  voiceUsage: VoiceUsageRow[];
  focusSessions?: FocusSessionRow[];
  taskCompletions?: TaskCompletionRow[];
  emotionalStates?: EmotionalStateRow[];
  studentGoals?: StudentGoalRow[];
}): ParentLearningMetrics {
  const end = new Date();
  const startIso = input.label === '7d' ? isoDaysAgo(7) : isoDaysAgo(30);
  const period: LearningMetricPeriod = { start: startIso, end: end.toISOString(), label: input.label };

  const sessions = (input.aiSessions || []).filter(s => (s.started_at || '') >= startIso);
  const completedQuizzes = (input.quizResults || []).filter(q => q.completed && ((q.completed_at || q.created_at || '') >= startIso));
  const voiceLogs = (input.voiceUsage || []).filter(v => ((v.created_at || '') >= startIso));

  const focusSessions = (input.focusSessions || []).filter(s => (s.created_at || '') >= startIso);
  const taskCompletions = (input.taskCompletions || []).filter(s => (s.created_at || '') >= startIso);
  const emotionalStates = (input.emotionalStates || []).filter(s => (s.created_at || '') >= startIso);
  const studentGoals = (input.studentGoals || []).filter(s => (s.created_at || '') >= startIso);

  // ---------------------------
  // Engagement
  // ---------------------------
  const daysSet = new Set<string>();
  for (const s of sessions) {
    if (!s.started_at) continue;
    daysSet.add(startOfDayIso(new Date(s.started_at)));
  }
  for (const v of voiceLogs) {
    if (!v.created_at) continue;
    daysSet.add(startOfDayIso(new Date(v.created_at)));
  }
  const activeLearningDays = daysSet.size;

  const tutorTypesMap = new Map<string, number>();
  for (const s of sessions) {
    const type = (s.session_type || 'unknown').toString();
    tutorTypesMap.set(type, (tutorTypesMap.get(type) || 0) + 1);
  }

  const subjectCounts = new Map<string, number>();
  for (const s of sessions) {
    const subj = subjectLabel(s.subject);
    subjectCounts.set(subj, (subjectCounts.get(subj) || 0) + 1);
  }
  for (const q of completedQuizzes) {
    const subj = subjectLabel(q.subject);
    subjectCounts.set(subj, (subjectCounts.get(subj) || 0) + 1);
  }
  const totalSubjectEvents = Array.from(subjectCounts.values()).reduce((a, b) => a + b, 0);
  const subjectsTouched: SubjectSlice[] = Array.from(subjectCounts.entries())
    .map(([subject, count]) => ({
      subject,
      count,
      percent: totalSubjectEvents > 0 ? Math.round((count / totalSubjectEvents) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const totalSessions = sessions.length + voiceLogs.length;
  const voiceLearningRatio = totalSessions > 0 ? voiceLogs.length / totalSessions : null;

  // ---------------------------
  // Learning Value
  // ---------------------------
  const avgUnstuckSeconds = (() => {
    const tutorish = sessions.filter(s => (s.session_type || '').toString() === 'tutor');
    const durations = tutorish
      .map(s => safeNumber(s.duration_seconds))
      .filter((n): n is number => n !== null && n > 0);
    if (durations.length === 0) return null;
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg);
  })();

  const baselineSeconds = 15 * 60;
  const timeToUnstuckCopy = avgUnstuckSeconds
    ? `NovaTutor helped your child get unstuck in ${formatDuration(avgUnstuckSeconds)}, compared to ~${formatDuration(baselineSeconds)} without help.`
    : `NovaTutor is building a learning baseline. More sessions will unlock “time-to-unstuck” trends.`;

  const productiveStruggleScore = (() => {
    // Proxy: more back-and-forth turns + more time-on-task (not just instant answers)
    const msgCounts = sessions
      .map(s => safeNumber(s.message_count))
      .filter((n): n is number => n !== null && n > 0);
    const avgMsgs = msgCounts.length ? msgCounts.reduce((a, b) => a + b, 0) / msgCounts.length : null;

    const durations = sessions
      .map(s => safeNumber(s.duration_seconds))
      .filter((n): n is number => n !== null && n > 0);
    const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

    if (avgMsgs === null && avgDur === null) return null;

    // avgMsgs ~ 2 means Q/A only; ~10 means strong coaching
    const msgComponent = avgMsgs === null ? 50 : clamp(((avgMsgs - 2) / 8) * 100, 0, 100);
    // avgDur ~ 30s (too short) ... 4m+ (solid)
    const durComponent = avgDur === null ? 50 : clamp(((avgDur - 30) / (240 - 30)) * 100, 0, 100);
    return Math.round((msgComponent * 0.6) + (durComponent * 0.4));
  })();

  const concepts = computeConceptInsights(completedQuizzes).slice(0, 6);

  // ---------------------------
  // Executive Function (Phase 2) summary (optional)
  // ---------------------------
  const executiveFunction = (() => {
    if (
      focusSessions.length === 0 &&
      taskCompletions.length === 0 &&
      emotionalStates.length === 0 &&
      studentGoals.length === 0
    ) {
      return undefined;
    }

    const averageFocusDurationMinutes = focusSessions.length
      ? focusSessions.reduce((sum, s) => sum + (safeNumber(s.duration_minutes) || 0), 0) / focusSessions.length
      : 0;

    const averageDistractions = focusSessions.length
      ? focusSessions.reduce((sum, s) => sum + (safeNumber(s.distractions) || 0), 0) / focusSessions.length
      : 0;

    const taskCompletionRate = taskCompletions.length
      ? (taskCompletions.filter(t => !!t.completed).length / taskCompletions.length) * 100
      : 0;

    const timeEstimationAccuracy = (() => {
      const completedWithTimes = taskCompletions.filter(t =>
        !!t.completed &&
        (safeNumber(t.planned_time_minutes) || 0) > 0 &&
        (safeNumber(t.actual_time_minutes) || 0) > 0
      );
      if (!completedWithTimes.length) return 0;
      const total = completedWithTimes.reduce((sum, t) => sum + (safeNumber(t.time_accuracy) || 0), 0);
      return total / completedWithTimes.length;
    })();

    const averageConfidence = (() => {
      const confident = emotionalStates.filter(s => (s.emotion || '').toLowerCase() === 'confident' && (safeNumber(s.intensity) || 0) > 0);
      if (!confident.length) return 0;
      return confident.reduce((sum, s) => sum + (safeNumber(s.intensity) || 0), 0) / confident.length;
    })();

    const confidenceImprovementPercent = (() => {
      const confident = emotionalStates
        .filter(s => (s.emotion || '').toLowerCase() === 'confident' && (safeNumber(s.intensity) || 0) > 0)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      if (confident.length < 2) return 0;
      const recent = confident.slice(0, 5);
      const older = confident.slice(-5);
      const recentAvg = recent.reduce((sum, s) => sum + (safeNumber(s.intensity) || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, s) => sum + (safeNumber(s.intensity) || 0), 0) / older.length;
      if (!olderAvg) return 0;
      return ((recentAvg - olderAvg) / olderAvg) * 100;
    })();

    const mostStudiedSubject = (() => {
      const counts: Record<string, number> = {};
      for (const s of focusSessions) {
        if (!s.subject) continue;
        counts[s.subject] = (counts[s.subject] || 0) + 1;
      }
      for (const t of taskCompletions) {
        if (!t.subject) continue;
        counts[t.subject] = (counts[t.subject] || 0) + 1;
      }
      const entries = Object.entries(counts);
      if (!entries.length) return 'Not enough data';
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    })();

    const bestPerformanceTime = (() => {
      const hourCounts: Record<number, { sessions: number; quality: number }> = {};
      for (const s of focusSessions) {
        if (!s.created_at) continue;
        const hour = new Date(s.created_at).getHours();
        if (!hourCounts[hour]) hourCounts[hour] = { sessions: 0, quality: 0 };
        hourCounts[hour].sessions++;
        hourCounts[hour].quality += safeNumber(s.quality_score) || 0;
      }
      const entries = Object.entries(hourCounts);
      if (!entries.length) return 'Not enough data';
      const best = entries
        .map(([hour, data]) => ({ hour: Number(hour), avgQuality: data.quality / data.sessions }))
        .sort((a, b) => b.avgQuality - a.avgQuality)[0];
      if (best.hour < 12) return `Morning (${best.hour}AM)`;
      if (best.hour < 17) return `Afternoon (${best.hour - 12}PM)`;
      return `Evening (${best.hour - 12}PM)`;
    })();

    const streakDays = (() => {
      const allDates = [
        ...focusSessions.map(s => s.created_at).filter(Boolean),
        ...taskCompletions.map(s => s.created_at).filter(Boolean),
        ...emotionalStates.map(s => s.created_at).filter(Boolean),
      ] as string[];
      allDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (!allDates.length) return 0;
      let streak = 1;
      let currentDate = new Date(allDates[0]);
      currentDate.setHours(0, 0, 0, 0);
      for (let i = 1; i < allDates.length; i++) {
        const d = new Date(allDates[i]);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
          currentDate = d;
        } else if (diffDays > 1) {
          break;
        }
      }
      return streak;
    })();

    const needsSupport: Array<{ area: string; reason: string }> = [];
    if (taskCompletionRate < 50 && taskCompletions.length > 0) {
      needsSupport.push({ area: 'Task Completion', reason: 'Completing less than 50% of tasks' });
    }
    if (averageDistractions > 5 && focusSessions.length > 0) {
      needsSupport.push({ area: 'Focus', reason: 'High distraction levels during study' });
    }
    const anxietyCount = emotionalStates.filter(e => (e.emotion || '').toLowerCase() === 'anxious').length;
    if (emotionalStates.length > 0 && anxietyCount > emotionalStates.length * 0.3) {
      needsSupport.push({ area: 'Emotional Wellbeing', reason: 'Frequently reports feeling anxious' });
    }

    const strengths: string[] = [];
    const avgQuality = focusSessions.length
      ? focusSessions.reduce((sum, s) => sum + (safeNumber(s.quality_score) || 0), 0) / focusSessions.length
      : 0;
    if (taskCompletionRate > 80 && taskCompletions.length > 0) strengths.push('High task completion rate');
    if (avgQuality > 7 && focusSessions.length > 0) strengths.push('Strong focus and concentration');
    if (studentGoals.length > 3) strengths.push('Proactive goal setter');
    if (focusSessions.length + taskCompletions.length > 20) strengths.push('Consistent daily practice');

    // ---------------------------
    // Parent-friendly coaching copy
    // ---------------------------
    const parentCoach = (() => {
      const observations: string[] = [];
      const tips: string[] = [];

      // Focus trend: compare last 3 vs previous 3 sessions
      const focusDurations = focusSessions
        .filter(s => safeNumber(s.duration_minutes) !== null)
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .map(s => safeNumber(s.duration_minutes) as number);
      const recentFocusAvg = average(focusDurations.slice(0, 3));
      const priorFocusAvg = average(focusDurations.slice(3, 6));
      const focusTrend = trendStatement('Focus time', recentFocusAvg, priorFocusAvg, 'm', true);
      if (focusTrend) observations.push(focusTrend);

      // Distraction pattern: is evening notably worse?
      const distractionByBucket = { morning: [] as number[], afternoon: [] as number[], evening: [] as number[] };
      for (const s of focusSessions) {
        const d = safeNumber(s.distractions);
        if (d === null || !s.created_at) continue;
        const hour = new Date(s.created_at).getHours();
        if (hour < 12) distractionByBucket.morning.push(d);
        else if (hour < 17) distractionByBucket.afternoon.push(d);
        else distractionByBucket.evening.push(d);
      }
      const overallDistractions = focusSessions.map(s => safeNumber(s.distractions)).filter((n): n is number => n !== null);
      const overallAvgDistractions = average(overallDistractions);
      const eveningAvg = average(distractionByBucket.evening);
      if (
        overallAvgDistractions !== null &&
        eveningAvg !== null &&
        distractionByBucket.evening.length >= 3 &&
        eveningAvg >= overallAvgDistractions + 2
      ) {
        observations.push('Focus is harder in the evenings (more distractions than usual).');
        tips.push('Try scheduling the hardest work earlier, and keep evenings for review or short practice.');
      }

      // Task completion
      if (taskCompletions.length >= 5) {
        if (taskCompletionRate >= 80) observations.push('Finishes most tasks once started.');
        else if (taskCompletionRate >= 60) observations.push('Usually finishes tasks, but some get left incomplete.');
        else observations.push('Often starts tasks but doesn’t finish them yet.');
      }

      // Time estimation
      if (taskCompletions.length >= 5) {
        if (timeEstimationAccuracy >= 80) observations.push('Good at predicting how long work will take.');
        else if (timeEstimationAccuracy >= 50) observations.push('Time estimates are getting closer, but still inconsistent.');
        else observations.push('Needs help estimating time (often under/overestimates).');
      }

      // Confidence
      if (averageConfidence > 0) {
        observations.push(`Confidence is around ${averageConfidence.toFixed(1)}/10 during learning.`);
        if (confidenceImprovementPercent >= 10) observations.push('Confidence is trending up.');
        else if (confidenceImprovementPercent <= -10) observations.push('Confidence has dipped recently.');
      }

      // Tips (if not already added)
      if (averageDistractions > 5 && tips.length < 2) {
        tips.push('Use a 10–15 minute timer + a quick break to reduce distractions.');
      }
      if (taskCompletionRate < 60 && tips.length < 2) {
        tips.push('Break work into 2–3 tiny steps and check off each one (this boosts completion).');
      }
      if (confidenceImprovementPercent < 0 && tips.length < 2) {
        tips.push('Start sessions with an “easy win” problem to rebuild confidence, then ramp difficulty.');
      }

      if (tips.length === 0) {
        tips.push('Keep the routine—consistency is building strong learning habits.');
      }

      const headline =
        streakDays >= 5
          ? `Great consistency: a ${streakDays}-day streak.`
          : streakDays >= 2
            ? `Building consistency: a ${streakDays}-day streak.`
            : 'Building the baseline for habits and focus.';

      return {
        headline,
        observations: observations.slice(0, 4),
        tips: tips.slice(0, 2),
      };
    })();

    return {
      totalFocusSessions: focusSessions.length,
      averageFocusDurationMinutes,
      averageDistractions,
      bestPerformanceTime,
      mostStudiedSubject,
      streakDays,
      taskCompletionRate,
      timeEstimationAccuracy,
      averageConfidence,
      confidenceImprovementPercent,
      needsSupport,
      strengths,
      parentCoach,
    };
  })();

  // ---------------------------
  // Cost (displayed w/ 3x margin)
  // ---------------------------
  const rawAiCost = sessions.reduce((sum, s) => sum + (safeNumber(s.cost_usd) || 0), 0);
  const rawVoiceCost = voiceLogs.reduce((sum, v) => sum + (safeNumber(v.estimated_cost) || 0), 0);
  const rawCost = rawAiCost + rawVoiceCost;
  const displayedCost = roundCurrency(rawCost * 3);
  const avgCostPerSession = totalSessions > 0 ? roundCurrency(displayedCost / totalSessions) : null;

  const masteredCount = concepts.filter(c => c.status === 'improved').length;
  const costVsLearningValueCopy = masteredCount > 0 && totalSessions > 0
    ? `${totalSessions} sessions → ${masteredCount} concepts improving → $${displayedCost.toFixed(2)}`
    : `${totalSessions} sessions → progress building → $${displayedCost.toFixed(2)}`;

  // ---------------------------
  // System Quality
  // ---------------------------
  const latencies = sessions
    .map(s => safeNumber(s.metadata?.latency_ms) ?? (safeNumber(s.duration_seconds) !== null ? (safeNumber(s.duration_seconds)! * 1000) : null))
    .filter((n): n is number => n !== null && n > 0);
  const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

  const errorFreeRate = (() => {
    if (sessions.length === 0) return null;
    const failed = sessions.filter(s => !!s.metadata?.failed || (!s.ended_at && (s.started_at || '') < isoDaysAgo(0))).length;
    return clamp((sessions.length - failed) / sessions.length, 0, 1);
  })();

  // ---------------------------
  // Weekly summary
  // ---------------------------
  const topSubject = subjectsTouched[0]?.subject;
  const headline = topSubject
    ? `This ${input.label === '7d' ? 'week' : 'month'}, learning was strongest in ${topSubject}.`
    : `This ${input.label === '7d' ? 'week' : 'month'}, your child kept learning momentum.`;

  const highlights: string[] = [];
  if (activeLearningDays > 0) highlights.push(`${activeLearningDays} active learning days`);
  if (voiceLearningRatio !== null) {
    highlights.push(`${Math.round(voiceLearningRatio * 100)}% voice learning ratio`);
  }
  if (avgUnstuckSeconds) highlights.push(`Average “time-to-unstuck”: ${formatDuration(avgUnstuckSeconds)}`);
  if (executiveFunction) {
    highlights.push(`${Math.round(executiveFunction.taskCompletionRate)}% task completion`);
    if (executiveFunction.confidenceImprovementPercent !== 0) {
      const sign = executiveFunction.confidenceImprovementPercent > 0 ? '+' : '';
      highlights.push(`Confidence: ${sign}${Math.round(executiveFunction.confidenceImprovementPercent)}%`);
    }
    if (executiveFunction.streakDays > 1) highlights.push(`${executiveFunction.streakDays} day streak`);
  }

  const nextSteps: string[] = [];
  const needs = concepts.filter(c => c.status === 'needs_reinforcement').slice(0, 2);
  for (const n of needs) nextSteps.push(`Review: ${n.concept} (${n.subject})`);
  if (executiveFunction?.needsSupport?.length) {
    for (const ns of executiveFunction.needsSupport.slice(0, 2)) {
      nextSteps.push(`${ns.area}: ${ns.reason}`);
    }
  }
  if (executiveFunction?.parentCoach?.tips?.length) {
    // Include just ONE coaching tip in the weekly summary to keep it parent-scannable.
    nextSteps.push(executiveFunction.parentCoach.tips[0]);
  }
  if (needs.length === 0) nextSteps.push('Keep the streak going with 2 short sessions this weekend.');

  return {
    period,
    executiveFunction,
    learningValue: {
      concepts,
      timeToUnstuckSecondsAvg: avgUnstuckSeconds,
      timeToUnstuckCopy,
      productiveStruggleScore,
    },
    engagement: {
      activeLearningDays,
      totalSessions,
      voiceLearningRatio,
      subjectsTouched,
    },
    safetyAndQuality: {
      tutorTypesUsed: Array.from(tutorTypesMap.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
      answerSuppressionEvents: 0,
      unsafeContentFlags: 0,
    },
    cost: {
      costThisWeekUsd: displayedCost,
      averageCostPerSessionUsd: avgCostPerSession,
      weeklyAverageUsd: avgCostPerSession, // same framing for now (week = period label)
      costVsLearningValueCopy,
    },
    systemQuality: {
      avgResponseLatencyMs: avgLatencyMs,
      errorFreeSessionsRate: errorFreeRate,
    },
    weeklySummary: {
      headline,
      highlights,
      nextSteps,
    },
  };
}

function roundCurrency(n: number) {
  return Math.round(n * 100) / 100;
}

function computeConceptInsights(quizzes: QuizResultRow[]): ConceptInsight[] {
  // Group by subject+topic and compare last 7d vs previous 7d
  const end = new Date();
  const last7Start = new Date(end);
  last7Start.setDate(end.getDate() - 7);
  const prev7Start = new Date(end);
  prev7Start.setDate(end.getDate() - 14);

  type Bucket = {
    subject: string;
    concept: string;
    lastScores: number[];
    prevScores: number[];
  };

  const buckets = new Map<string, Bucket>();
  for (const q of quizzes) {
    const subject = subjectLabel(q.subject);
    const concept = (q.topic || 'General Practice').toString();
    const whenStr = q.completed_at || q.created_at;
    if (!whenStr) continue;
    const when = new Date(whenStr);
    const score = safeNumber(q.score);
    if (score === null) continue;

    const key = `${subject}::${concept}`;
    if (!buckets.has(key)) buckets.set(key, { subject, concept, lastScores: [], prevScores: [] });
    const b = buckets.get(key)!;

    if (when >= last7Start) b.lastScores.push(score);
    else if (when >= prev7Start && when < last7Start) b.prevScores.push(score);
  }

  const insights: ConceptInsight[] = [];
  for (const b of buckets.values()) {
    const lastAvg = b.lastScores.length ? b.lastScores.reduce((a, c) => a + c, 0) / b.lastScores.length : null;
    const prevAvg = b.prevScores.length ? b.prevScores.reduce((a, c) => a + c, 0) / b.prevScores.length : null;

    let status: ConceptInsight['status'] = 'stable';
    if (lastAvg !== null && lastAvg < 60) status = 'needs_reinforcement';
    if (lastAvg !== null && prevAvg !== null && (lastAvg - prevAvg) >= 10 && lastAvg >= 70) status = 'improved';

    const detail =
      lastAvg === null
        ? 'Building a baseline'
        : prevAvg === null
          ? `Average score: ${Math.round(lastAvg)}%`
          : `Average score: ${Math.round(prevAvg)}% → ${Math.round(lastAvg)}%`;

    insights.push({
      concept: b.concept,
      subject: b.subject,
      status,
      detail,
    });
  }

  // Sort: improved first, then needs reinforcement, then stable; within status by last average if possible
  const rank = { improved: 0, needs_reinforcement: 1, stable: 2 } as const;
  return insights.sort((a, b) => rank[a.status] - rank[b.status]);
}

function average(nums: number[]) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function trendStatement(label: string, recent: number | null, prior: number | null, unit: string, higherIsBetter: boolean) {
  if (recent === null) return null;
  if (prior === null) return `${label}: ${Math.round(recent)}${unit}`;
  const delta = recent - prior;
  const abs = Math.abs(delta);
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  if (abs < (unit === '%' ? 3 : 1)) return `${label} is steady (${Math.round(recent)}${unit})`;
  return improved
    ? `${label} is improving (${Math.round(prior)}${unit} → ${Math.round(recent)}${unit})`
    : `${label} dipped a bit (${Math.round(prior)}${unit} → ${Math.round(recent)}${unit})`;
}


