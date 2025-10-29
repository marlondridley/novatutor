import type { ChartConfig } from "@/components/ui/chart";

export const masteryScoresData = [
  { concept: "Algebra", score: 75, fill: "var(--color-algebra)" },
  { concept: "Geometry", score: 45, fill: "var(--color-geometry)" },
  { concept: "Trigonometry", score: 82, fill: "var(--color-trigonometry)" },
  { concept: "Calculus", score: 60, fill: "var(--color-calculus)" },
  { concept: "Statistics", score: 91, fill: "var(--color-statistics)" },
];

export const masteryChartConfig = {
  score: {
    label: "Mastery Score",
  },
  algebra: {
    label: "Algebra",
    color: "hsl(var(--chart-1))",
  },
  geometry: {
    label: "Geometry",
    color: "hsl(var(--chart-2))",
  },
  trigonometry: {
    label: "Trigonometry",
    color: "hsl(var(--chart-3))",
  },
  calculus: {
    label: "Calculus",
    color: "hsl(var(--chart-4))",
  },
  statistics: {
    label: "Statistics",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


export const interventionEffectivenessData = [
    { name: 'Visual Aids', effectiveness: 85, fill: 'hsl(var(--chart-1))' },
    { name: 'Practice Problems', effectiveness: 92, fill: 'hsl(var(--chart-2))' },
    { name: 'Peer Tutoring', effectiveness: 78, fill: 'hsl(var(--chart-3))' },
    { name: 'Concept Videos', effectiveness: 88, fill: 'hsl(var(--chart-4))' },
    { name: 'Gamified Quizzes', effectiveness: 95, fill: 'hsl(var(--chart-5))' },
];

export const interventionChartConfig = {
  effectiveness: {
    label: "Effectiveness",
  },
} satisfies ChartConfig;


export const learningPatternsData = [
    { date: '2024-07-01', timeSpent: 120, topicsCovered: 3 },
    { date: '2024-07-02', timeSpent: 90, topicsCovered: 2 },
    { date: '2024-07-03', timeSpent: 150, topicsCovered: 4 },
    { date: '2024-07-04', timeSpent: 60, topicsCovered: 1 },
    { date: '2024-07-05', timeSpent: 180, topicsCovered: 5 },
    { date: '2024-07-06', timeSpent: 110, topicsCovered: 3 },
    { date: '2024-07-07', timeSpent: 130, topicsCovered: 2 },
];

export const learningPatternsChartConfig = {
    timeSpent: {
        label: 'Time Spent (mins)',
        color: 'hsl(var(--chart-1))',
    },
    topicsCovered: {
        label: 'Topics Covered',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig

export const executiveCoachingInput = {
    studentId: 'student-123',
    subject: 'Mathematics',
    performanceData: [
        { timestamp: '2024-07-07T10:00:00Z', metric: 'time_on_task', value: 15 },
        { timestamp: '2024-07-07T10:15:00Z', metric: 'time_on_task', value: 12 },
        { timestamp: '2024-07-07T10:30:00Z', metric: 'correct_answers', value: 4 },
        { timestamp: '2024-07-07T10:45:00Z', metric: 'correct_answers', value: 2 },
    ],
    rules: [
        { condition: "time_on_task < 15 for two consecutive data points", intervention: "You seem to be losing focus. Try the 5-minute breathing exercise in the Focus section to reset your concentration." },
        { condition: "correct_answers drops by 50% or more", intervention: "It looks like this topic is a bit tricky. Let's try breaking it down into smaller steps. Would you like to review the prerequisite concepts?" },
    ],
};

export const learningPathInput = {
    studentId: "student-123",
    subject: "Math",
    masteryScores: {
      "Algebra": 0.75,
      "Geometry": 0.45,
      "Trigonometry": 0.82,
      "Calculus": 0.60,
      "Statistics": 0.91,
    },
    interventionEffectiveness: {
      "Visual Aids": 0.85,
      "Practice Problems": 0.92,
      "Concept Videos": 0.88,
    },
    learningStyle: "visual",
};
