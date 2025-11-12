import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/notes - List all notes for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('cornell_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (subject) {
      query = query.eq('subject', subject);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    if (search) {
      query = query.or(`topic.ilike.%${search}%,note_body.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cornell notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, topic, cue_column, note_body, summary, tags } = body;

    // Validation
    if (!subject || !topic) {
      return NextResponse.json(
        { error: 'Subject and topic are required' },
        { status: 400 }
      );
    }

    // Insert note
    const { data, error } = await supabase
      .from('cornell_notes')
      .insert({
        user_id: user.id,
        subject,
        topic,
        cue_column: cue_column || [],
        note_body: note_body || '',
        summary: summary || '',
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cornell note:', error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

