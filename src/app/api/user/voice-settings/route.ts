import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;

    // Get voice settings from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('voice_settings')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logger.error('Error loading voice settings:', profileError);
      return NextResponse.json(
        { error: 'Failed to load voice settings' },
        { status: 500 }
      );
    }

    const settings = profile?.voice_settings || null;

    return NextResponse.json({ settings });
  } catch (error: any) {
    logger.error('Voice settings GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load voice settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, settings } = body;

    if (!userId || !settings) {
      return NextResponse.json(
        { error: 'userId and settings are required' },
        { status: 400 }
      );
    }

    // Verify user can only update their own settings
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update voice settings in profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        voice_settings: settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Error saving voice settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to save voice settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Voice settings POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save voice settings' },
      { status: 500 }
    );
  }
}

