import { createClient } from '@/utils/supabase/server';

export interface RecentTopic {
  subject: string;
  topic: string;
  noteBody: string;
  cueColumn: string[];
  summary: string;
  updated_at: string;
}

export interface TestGenerationContext {
  suggestedTopic?: string;
  suggestedSubject?: string;
  recentNotes: RecentTopic[];
  studentStrengths: string[];
  studentWeaknesses: string[];
}

/**
 * Get recent topics from student's Cornell Notes
 * This provides context for adaptive test generation
 */
export async function getRecentTopics(limit = 5): Promise<TestGenerationContext> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      recentNotes: [],
      studentStrengths: [],
      studentWeaknesses: [],
    };
  }

  // Fetch recent Cornell Notes
  const { data: notes, error } = await supabase
    .from('cornell_notes')
    .select('subject, topic, note_body, cue_column, summary, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !notes || notes.length === 0) {
    return {
      recentNotes: [],
      studentStrengths: [],
      studentWeaknesses: [],
    };
  }

  // Map to our interface
  const recentNotes: RecentTopic[] = notes.map(note => ({
    subject: note.subject,
    topic: note.topic,
    noteBody: note.note_body || '',
    cueColumn: note.cue_column || [],
    summary: note.summary || '',
    updated_at: note.updated_at,
  }));

  // Analyze for suggested topic (most recent or most frequent)
  const topicFrequency = new Map<string, number>();
  const subjectFrequency = new Map<string, number>();

  notes.forEach(note => {
    topicFrequency.set(note.topic, (topicFrequency.get(note.topic) || 0) + 1);
    subjectFrequency.set(note.subject, (subjectFrequency.get(note.subject) || 0) + 1);
  });

  // Get most frequent topic and subject
  let suggestedTopic = notes[0].topic;
  let suggestedSubject = notes[0].subject;
  let maxTopicCount = 0;
  let maxSubjectCount = 0;

  topicFrequency.forEach((count, topic) => {
    if (count > maxTopicCount) {
      maxTopicCount = count;
      suggestedTopic = topic;
    }
  });

  subjectFrequency.forEach((count, subject) => {
    if (count > maxSubjectCount) {
      maxSubjectCount = count;
      suggestedSubject = subject;
    }
  });

  // Simple analysis: topics with summaries are strengths, topics with many cues are areas of focus
  const studentStrengths: string[] = [];
  const studentWeaknesses: string[] = [];

  notes.forEach(note => {
    if (note.summary && note.summary.length > 50) {
      studentStrengths.push(note.topic);
    }
    if (note.cue_column && note.cue_column.length > 5) {
      studentWeaknesses.push(note.topic);
    }
  });

  return {
    suggestedTopic,
    suggestedSubject,
    recentNotes,
    studentStrengths: [...new Set(studentStrengths)],
    studentWeaknesses: [...new Set(studentWeaknesses)],
  };
}

/**
 * Determine difficulty mode based on student performance
 */
export function determineAdaptiveDifficulty(context: TestGenerationContext): 'practice' | 'challenge' | 'mastery' {
  const { studentStrengths, studentWeaknesses, recentNotes } = context;

  // If more weaknesses than strengths, start with practice
  if (studentWeaknesses.length > studentStrengths.length) {
    return 'practice';
  }

  // If strong in recent topics, go for mastery
  if (studentStrengths.length > 3) {
    return 'mastery';
  }

  // Default to challenge
  return 'challenge';
}

