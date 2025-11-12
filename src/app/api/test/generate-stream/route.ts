import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@/ai/providers';
import { getRecentTopics, determineAdaptiveDifficulty } from '@/lib/test-generator-helpers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for streaming

// In-memory cache for recent topics (15 minute TTL)
const topicsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Difficulty mode prompts
const MODE_PROMPTS = {
  practice: {
    instructions: "Generate easy, recall-level questions to reinforce understanding.",
    tone: "supportive and encouraging",
    complexity: "simple, single-step problems"
  },
  challenge: {
    instructions: "Generate medium difficulty questions that require application and analysis.",
    tone: "encouraging but challenging",
    complexity: "multi-step problems requiring connections"
  },
  mastery: {
    instructions: "Generate advanced questions testing deep understanding and synthesis.",
    tone: "respectful and thought-provoking",
    complexity: "complex, multi-step problems with real-world application"
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    let { subject, topic, mode, count = 5 } = body;

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Step 1: Fetch context (with caching)
          send({ type: 'progress', message: '🔍 Checking your recent notes...' });
          
          const cacheKey = `topics_${user.id}`;
          let context;
          
          const cached = topicsCache.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            context = cached.data;
            send({ type: 'progress', message: '⚡ Found your learning history!' });
          } else {
            context = await getRecentTopics();
            topicsCache.set(cacheKey, { data: context, timestamp: Date.now() });
            send({ type: 'progress', message: '📚 Analyzed your recent topics!' });
          }

          // Step 2: Determine subject/topic from context if not provided
          if (!subject && context.suggestedSubject) {
            subject = context.suggestedSubject;
            send({ type: 'info', message: `Using your recent subject: ${subject}` });
          }

          if (!topic && context.suggestedTopic) {
            topic = context.suggestedTopic;
            send({ type: 'info', message: `Using your recent topic: ${topic}` });
          }

          if (!subject || !topic) {
            send({ type: 'error', message: 'Please provide a subject and topic, or take some notes first!' });
            controller.close();
            return;
          }

          // Step 3: Determine difficulty mode
          if (mode === 'adaptive') {
            mode = determineAdaptiveDifficulty(context);
            send({ type: 'info', message: `📊 Adaptive mode selected: ${mode}` });
          }

          const modeConfig = MODE_PROMPTS[mode as keyof typeof MODE_PROMPTS] || MODE_PROMPTS.challenge;
          
          send({ type: 'progress', message: `🧩 Creating your ${mode} quiz...` });

          // Step 4: Build context-aware prompt
          const contextNotes = context.recentNotes
            .filter(note => note.subject === subject || note.topic === topic)
            .slice(0, 2);

          let contextSection = '';
          if (contextNotes.length > 0) {
            contextSection = `\n\nSTUDENT'S RECENT NOTES:\n${contextNotes.map(note => 
              `- ${note.topic}: ${note.summary || note.noteBody.substring(0, 200)}`
            ).join('\n')}`;
          }

          const prompt = `You are a supportive learning coach creating a ${mode} quiz for a student.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${mode.toUpperCase()}

${modeConfig.instructions}
Tone: ${modeConfig.tone}
Question complexity: ${modeConfig.complexity}

${contextSection}

Generate exactly ${count} multiple-choice questions following the Socratic method:
- Questions should encourage thinking, not just memorization
- Use age-appropriate language (grades 6-12)
- Each question has 4 options (A, B, C, D)
- Only one correct answer
- Include brief explanations for why the answer is correct

Return ONLY valid JSON in this exact format:
{
  "quiz": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Why this answer is correct"
    }
  ]
}`;

          // Step 5: Generate quiz with streaming
          const completion = await openai.chat.completions.create({
            model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a supportive learning coach. Always respond in valid JSON format.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
            stream: false, // We'll simulate streaming with progress updates
          });

          send({ type: 'progress', message: '✨ Finalizing your quiz...' });

          const responseText = completion.choices[0]?.message?.content || '{}';
          let quizData;

          try {
            quizData = JSON.parse(responseText);
          } catch (parseError) {
            send({ type: 'error', message: 'Failed to parse quiz response' });
            controller.close();
            return;
          }

          // Step 6: Send final result
          send({
            type: 'complete',
            data: {
              topic,
              subject,
              mode,
              quiz: quizData.quiz || [],
              metadata: {
                generatedAt: new Date().toISOString(),
                source: contextNotes.length > 0 ? 'learning_journal' : 'user_input',
                difficulty: mode,
                contextUsed: contextNotes.length > 0,
              }
            }
          });

          // Step 7: Log to learning journal (async, don't wait)
          logTestGeneration(user.id, subject, topic, mode, quizData.quiz?.length || 0).catch(console.error);

          controller.close();
        } catch (error: any) {
          console.error('Error generating quiz:', error);
          send({ type: 'error', message: error.message || 'Failed to generate quiz' });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error in generate-stream:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper to log test generation
async function logTestGeneration(
  userId: string,
  subject: string,
  topic: string,
  mode: string,
  questionCount: number
) {
  try {
    const supabase = await createClient();
    
    // Log as a special type of cornell note or create a test_history table
    await supabase.from('cornell_notes').insert({
      user_id: userId,
      subject,
      topic: `Test: ${topic}`,
      note_body: `Generated ${questionCount} ${mode} questions`,
      summary: `Test generated on ${new Date().toLocaleDateString()}`,
      tags: ['test-prep', mode],
    });
  } catch (error) {
    console.error('Error logging test generation:', error);
  }
}

