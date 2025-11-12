import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@/ai/providers';

export const dynamic = 'force-dynamic';

// POST /api/notes/suggest-cues - Generate Cornell-style cue questions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { topic, noteBody } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate Socratic cue questions using AI
    const prompt = `You are helping a student create Cornell Notes for the topic: "${topic}".

${noteBody ? `Their notes so far:\n${noteBody}\n\n` : ''}

Generate 3-4 thoughtful cue questions that follow the Socratic method and executive function principles:
- Questions should encourage active recall
- They should help the student think deeper about the concept
- Use "What", "How", "Why", "When would you use..."
- Be age-appropriate and supportive in tone

Examples:
- "What problem does this solve?"
- "How would you explain this to a friend?"
- "When might you use this in real life?"
- "What patterns do you notice?"

Return ONLY a JSON array of strings, no other text.`;

    const completion = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive learning coach helping students create better study notes. Always respond in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let cues: string[] = [];

    try {
      const parsed = JSON.parse(responseText);
      // Handle different response formats
      if (Array.isArray(parsed)) {
        cues = parsed;
      } else if (parsed.cues && Array.isArray(parsed.cues)) {
        cues = parsed.cues;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        cues = parsed.questions;
      } else {
        // Fallback: extract any array from the object
        const arrays = Object.values(parsed).filter(v => Array.isArray(v));
        if (arrays.length > 0) {
          cues = arrays[0] as string[];
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to generic cues
      cues = [
        "What is the main concept here?",
        "How would I explain this in my own words?",
        "When would I use this?",
      ];
    }

    return NextResponse.json({ cues });
  } catch (error) {
    console.error('Error generating cue suggestions:', error);
    
    // Fallback to generic cues on error
    return NextResponse.json({
      cues: [
        "What question does this answer?",
        "How can I apply this?",
        "What do I still need to understand?",
      ]
    });
  }
}

