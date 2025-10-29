# Text-to-Speech Implementation Guide

## Overview

This implementation uses OpenAI's TTS API to convert text to natural-sounding speech with streaming support for immediate playback.

## Features

✅ **6 Voice Options**: Alloy, Echo, Fable, Onyx, Nova, Shimmer  
✅ **Adjustable Speed**: 0.25x to 4.0x  
✅ **Streaming Audio**: Start playback immediately as data arrives  
✅ **Next.js Compatible**: Works with App Router and Server Actions  
✅ **Radix UI Integration**: Uses Radix components for UI  

## Architecture

```
┌─────────────────────────────────┐
│  React Component                │
│  (TextToSpeechPlayer)           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  API Route                      │
│  /api/tts (POST)                │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Server Flow                    │
│  textToSpeechStream()           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  OpenAI TTS API                 │
│  Model: tts-1 / tts-1-hd        │
└─────────────────────────────────┘
```

## Setup

### 1. Add OpenAI API Key

In your `.env.local` file:

```env
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
```

### 2. Files Created

- **Flow**: `src/ai/flows/text-to-speech-flow.ts` - Core TTS logic
- **API Route**: `src/app/api/tts/route.ts` - Streaming endpoint
- **Component**: `src/components/text-to-speech-player.tsx` - UI component
- **Demo**: `src/app/(app)/tts-demo/page.tsx` - Example usage

## Usage

### Basic Usage (React Component)

```tsx
import { TextToSpeechPlayer } from '@/components/text-to-speech-player';

export default function MyPage() {
  return (
    <TextToSpeechPlayer 
      text="Hello, this is a test of the text-to-speech system!"
      autoPlay={false}
    />
  );
}
```

### Server Action Usage

```tsx
'use server';

import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

export async function generateSpeech() {
  const result = await textToSpeech({
    text: "Welcome to SuperTutor!",
    voice: 'nova',
    speed: 1.2,
  });
  
  return result.audioUrl; // Returns data URI
}
```

### API Route Usage

```typescript
// POST /api/tts
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Your text here',
    voice: 'alloy', // optional
    speed: 1.0,     // optional
  }),
});

// Get streaming audio
const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

## Voice Options

| Voice | Description | Best For |
|-------|-------------|----------|
| **alloy** | Neutral and balanced | General purpose, tutorials |
| **echo** | Clear and articulate | Instructions, explanations |
| **fable** | Warm and expressive | Storytelling, engaging content |
| **onyx** | Deep and authoritative | Formal content, presentations |
| **nova** | Bright and energetic | Exciting content, younger audiences |
| **shimmer** | Soft and friendly | Calm explanations, bedtime stories |

## Speed Control

- **Min**: 0.25x (very slow, for detailed learning)
- **Default**: 1.0x (natural speed)
- **Max**: 4.0x (very fast, for quick review)

## Models

### TTS-1 (Current)
- **Speed**: Fast response time
- **Quality**: Good quality
- **Cost**: ~$15 per 1M characters
- **Best for**: Real-time applications, demos

### TTS-1-HD (Optional)
- **Speed**: Slower response time
- **Quality**: Higher quality audio
- **Cost**: ~$30 per 1M characters
- **Best for**: Production, polished content

To switch to HD model, change in `text-to-speech-flow.ts`:

```typescript
model: 'tts-1-hd', // Changed from 'tts-1'
```

## Integration with Educational Features

### Math Tutoring with Audio

```tsx
import { TextToSpeechPlayer } from '@/components/text-to-speech-player';

export function MathExplanation() {
  const explanation = `
    Hey there, math adventurer! Let's learn about the Pythagorean Theorem.
    The formula is a squared plus b squared equals c squared.
    This works for any right triangle!
  `;
  
  return (
    <div>
      <div className="math-content">
        {/* Your math content with LaTeX */}
      </div>
      <TextToSpeechPlayer text={explanation} />
    </div>
  );
}
```

### Homework Feedback with Audio

```tsx
async function provideAudioFeedback(feedback: string) {
  // Generate audio version of feedback
  const audio = await textToSpeech({
    text: feedback,
    voice: 'fable', // Warm and encouraging
    speed: 0.9,     // Slightly slower for comprehension
  });
  
  return audio.audioUrl;
}
```

## Performance Tips

### 1. Chunking Long Text

For text longer than 4096 characters, split into chunks:

```typescript
function chunkText(text: string, maxLength: number = 4000): string[] {
  const sentences = text.split('. ');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length < maxLength) {
      currentChunk += sentence + '. ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '. ';
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}
```

### 2. Caching Audio

Cache generated audio to avoid re-generating:

```typescript
const audioCache = new Map<string, string>();

async function getCachedAudio(text: string, voice: string) {
  const key = `${text}-${voice}`;
  if (audioCache.has(key)) {
    return audioCache.get(key)!;
  }
  
  const audio = await textToSpeech({ text, voice });
  audioCache.set(key, audio.audioUrl);
  return audio.audioUrl;
}
```

### 3. Preload Common Phrases

Preload audio for frequently used phrases:

```typescript
const commonPhrases = [
  "Great job!",
  "Let's try again.",
  "That's correct!",
  "Almost there!",
];

async function preloadAudio() {
  for (const phrase of commonPhrases) {
    await textToSpeech({ text: phrase, voice: 'nova' });
  }
}
```

## Error Handling

```typescript
try {
  const audio = await textToSpeech({ text: "Hello!" });
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle missing API key
    console.error('OpenAI API key not configured');
  } else if (error.message.includes('rate limit')) {
    // Handle rate limiting
    console.error('Too many requests, please try again later');
  } else {
    // Handle other errors
    console.error('TTS failed:', error);
  }
}
```

## Cost Optimization

**Pricing**: $15 per 1M characters (TTS-1)

### Tips to Reduce Costs:

1. **Cache results**: Don't regenerate the same audio
2. **Use shorter prompts**: Summarize before converting
3. **Batch processing**: Generate audio during off-peak times
4. **Use TTS-1**: Only use TTS-1-HD when quality is critical

### Cost Estimation:

```typescript
function estimateCost(characterCount: number, model: 'tts-1' | 'tts-1-hd'): number {
  const costPerMillion = model === 'tts-1' ? 15 : 30;
  return (characterCount / 1_000_000) * costPerMillion;
}

// Example
const text = "Your educational content here";
const cost = estimateCost(text.length, 'tts-1');
console.log(`Estimated cost: $${cost.toFixed(4)}`);
```

## Testing

Test the TTS feature:

1. Start dev server: `npm run dev`
2. Visit: http://localhost:9002/tts-demo
3. Try different voices and speeds
4. Test with various text lengths

## Troubleshooting

### Issue: "OPENAI_API_KEY is not configured"
**Solution**: Add your OpenAI API key to `.env.local`

### Issue: Audio not playing
**Solution**: Check browser console for errors, ensure HTTPS in production

### Issue: Slow generation
**Solution**: Switch to `tts-1` model or check network connection

### Issue: Rate limit errors
**Solution**: Implement request throttling or upgrade OpenAI plan

## Next Steps

1. ✅ TTS is working with streaming
2. 🔜 Add audio caching layer
3. 🔜 Implement speech-to-text (Whisper API)
4. 🔜 Create audio library for common phrases
5. 🔜 Add audio waveform visualization

## Additional Resources

- **OpenAI TTS Docs**: https://platform.openai.com/docs/guides/text-to-speech
- **Audio Formats**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

**Pro Tip**: Use different voices for different types of content to create variety and keep students engaged!

