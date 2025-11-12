import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/lib/logger';

// OpenAI Whisper API endpoint
const OPENAI_WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Check if user has premium voice enabled
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_voice_enabled, premium_voice_expires_at')
      .eq('id', user.id)
      .single();

    if (!profile?.premium_voice_enabled) {
      return NextResponse.json(
        { 
          error: 'Premium Voice not enabled',
          upgrade_url: '/pricing?upgrade=premium_voice',
          message: 'Upgrade to Premium Voice for 99% accurate transcription in any language!'
        },
        { status: 403 }
      );
    }

    // 3. Check if subscription is still active
    if (profile.premium_voice_expires_at) {
      const expiresAt = new Date(profile.premium_voice_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { 
            error: 'Premium Voice subscription expired',
            renew_url: '/account',
            message: 'Your Premium Voice subscription has expired. Renew to continue using advanced AI transcription.'
          },
          { status: 403 }
        );
      }
    }

    // 4. Get audio file from request
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 5. Validate file size (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 25MB)' },
        { status: 400 }
      );
    }

    // 6. Send to OpenAI Audio API (Best Practice: gpt-4o-mini-transcribe)
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'gpt-4o-mini-transcribe'); // ✨ New model!
    whisperFormData.append('language', language);
    whisperFormData.append('response_format', 'text'); // Simpler output
    
    // ✨ Add prompting for better accuracy (educational context)
    whisperFormData.append('prompt', 
      'The following is a student explaining their homework or study tasks. ' +
      'Common subjects include: Math, Algebra, Geometry, English, Science, ' +
      'Biology, Chemistry, Physics, History, and foreign languages. ' +
      'The transcript may include academic terms, textbook names, and assignments.'
    );

    const startTime = Date.now();

    const whisperResponse = await fetch(OPENAI_WHISPER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json();
      logger.error('Whisper API error:', errorData);
      throw new Error(`Whisper API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    // ✨ With 'text' format, we get plain text back
    const transcriptionText = await whisperResponse.text();
    const duration = Math.round((Date.now() - startTime) / 1000);

    // 7. Calculate cost (Whisper: $0.006 per minute)
    const estimatedMinutes = duration / 60;
    const estimatedCost = estimatedMinutes * 0.006;

    // 8. Log usage for monitoring
    await supabase
      .from('voice_usage_logs')
      .insert({
        user_id: user.id,
        voice_type: 'premium',
        duration_seconds: duration,
        estimated_cost: estimatedCost,
      });

    logger.info('Premium voice transcription completed', {
      userId: user.id,
      duration,
      cost: estimatedCost.toFixed(4),
    });

    // 9. Return transcription
    return NextResponse.json({
      text: transcriptionText,
      language: language, // Language we requested
      duration_seconds: duration,
      mode: 'premium',
      model: 'gpt-4o-mini-transcribe', // ✨ Best practice model
      message: '✨ Transcribed with Premium Voice (99% accurate)',
    });

  } catch (error: any) {
    logger.error('Premium voice transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        message: error.message || 'Please try again or switch to free mode.',
        fallback_to_free: true,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check premium voice status
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ enabled: false, reason: 'Not authenticated' });
    }

    // Get profile and usage stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_voice_enabled, premium_voice_expires_at')
      .eq('id', user.id)
      .single();

    // Get monthly usage
    const { data: usage } = await supabase.rpc('get_monthly_voice_usage', {
      p_user_id: user.id
    });

    const isExpired = profile?.premium_voice_expires_at 
      ? new Date(profile.premium_voice_expires_at) < new Date()
      : false;

    return NextResponse.json({
      enabled: profile?.premium_voice_enabled && !isExpired,
      expires_at: profile?.premium_voice_expires_at,
      monthly_usage: usage?.[0] || { total_minutes: 0, premium_minutes: 0, estimated_cost: 0 },
      upgrade_url: '/pricing?upgrade=premium_voice',
    });

  } catch (error: any) {
    logger.error('Error checking premium voice status:', error);
    return NextResponse.json({ enabled: false, error: error.message });
  }
}

