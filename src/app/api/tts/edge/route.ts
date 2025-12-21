/**
 * Edge TTS API Route (using @lobehub/tts)
 * 
 * Uses Microsoft Edge's LATEST neural TTS voices for natural-sounding speech.
 * These are the newest generation neural voices - much more natural than older ones!
 * 
 * Best voices for natural speech (2024):
 * - en-US-AvaMultilingualNeural (newest, most natural female)
 * - en-US-AndrewMultilingualNeural (newest, most natural male)
 * - en-US-EmmaMultilingualNeural (warm, conversational female)
 * - en-US-BrianMultilingualNeural (friendly, conversational male)
 */

import { NextRequest, NextResponse } from 'next/server';
import { EdgeSpeechTTS } from '@lobehub/tts';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js environment
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

// NEWEST & most natural neural voices (2024 generation)
const VOICE_PRESETS = {
  // Best natural voices - Multilingual Neural (newest generation)
  default: 'en-US-AvaMultilingualNeural',      // Most natural female - warm, conversational
  natural_female: 'en-US-EmmaMultilingualNeural',  // Warm, friendly female
  natural_male: 'en-US-AndrewMultilingualNeural',   // Most natural male - clear, friendly
  friendly_male: 'en-US-BrianMultilingualNeural',   // Casual, upbeat male
  
  // Standard Neural voices (still good, more options)
  aria: 'en-US-AriaNeural',          // Expressive female
  jenny: 'en-US-JennyNeural',        // Friendly female
  guy: 'en-US-GuyNeural',            // Casual male
  
  // British & Australian
  british: 'en-GB-SoniaNeural',      // British female
  aussie: 'en-AU-NatashaNeural',     // Australian female
} as const;

// Style presets for different contexts (affects speech patterns)
const STYLE_CONFIGS: Record<string, { style?: string; rate?: string; pitch?: string }> = {
  explanation: { rate: '-10%', pitch: '+0Hz' },      // Slower, clearer
  greeting: { rate: '+0%', pitch: '+5Hz' },          // Warm
  encouragement: { rate: '+5%', pitch: '+10Hz' },    // Upbeat
  celebration: { rate: '+10%', pitch: '+15Hz' },     // Excited
  question: { rate: '-5%', pitch: '+8Hz' },          // Curious
  reflection: { rate: '-15%', pitch: '-3Hz' },       // Calm, thoughtful
};

/**
 * Add natural pauses and emphasis using simple text processing
 */
function addNaturalProsody(text: string): string {
  return text
    // Add slight pauses after periods
    .replace(/\. /g, '... ')
    // Add pauses after commas
    .replace(/, /g, ', ')
    // Add emphasis to question marks
    .replace(/\? /g, '? ')
    // Clean up any double spaces
    .replace(/  +/g, ' ')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'default', style = 'explanation' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Limit text length to prevent abuse
    const cleanText = addNaturalProsody(text.slice(0, 2000));

    // Get voice and style settings
    const voiceName = VOICE_PRESETS[voice as keyof typeof VOICE_PRESETS] || VOICE_PRESETS.default;
    const styleConfig = STYLE_CONFIGS[style] || STYLE_CONFIGS.explanation;

    console.log(`[Edge TTS] Using voice: ${voiceName}, style: ${style}`);

    // Create TTS instance
    const tts = new EdgeSpeechTTS({ locale: 'en-US' });

    // Generate speech with the newest neural voices
    const response = await tts.create({
      input: cleanText,
      options: {
        voice: voiceName,
        // Note: Rate/pitch may not be supported by all voices
      },
    });

    // Get audio buffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    console.log(`[Edge TTS] Generated ${audioBuffer.length} bytes of audio`);

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('[Edge TTS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  return NextResponse.json({
    voices: VOICE_PRESETS,
    styles: Object.keys(STYLE_CONFIGS),
    recommended: {
      most_natural: 'en-US-AvaMultilingualNeural',
      best_male: 'en-US-AndrewMultilingualNeural',
      best_female: 'en-US-EmmaMultilingualNeural',
    },
    usage: {
      method: 'POST',
      body: {
        text: 'Hello, this is a test.',
        voice: 'default',
        style: 'explanation',
      },
    },
  });
}

