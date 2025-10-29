'use client';

import { useState } from 'react';
import { TextToSpeechPlayer } from '@/components/text-to-speech-player';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TTSDemoPage() {
  const [text, setText] = useState(
    "Hey there, math adventurer! Let's learn about the Pythagorean Theorem. It's super cool!"
  );

  const examples = [
    {
      title: 'Math Explanation',
      text: "Hey there, math adventurer! You wanna know how to work the Pythagorean Theorem? It's like a secret superpower for right triangles! The formula is a squared plus b squared equals c squared. Super cool, right?",
    },
    {
      title: 'Science Lesson',
      text: "Did you know that photosynthesis is how plants make their own food? They use sunlight, water, and carbon dioxide to create glucose and oxygen. It's like a tiny factory in every leaf!",
    },
    {
      title: 'Story Time',
      text: "Once upon a time, in a land far away, there lived a curious student who loved learning new things every day. Their favorite subject was exploring the wonders of mathematics and science.",
    },
  ];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Text-to-Speech Demo 🔊</CardTitle>
          <CardDescription>
            Convert any text to natural-sounding speech using OpenAI's TTS API.
            Choose from 6 different voices and adjust the playback speed!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter text to convert:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text here..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} characters
            </p>
          </div>

          {/* TTS Player */}
          <TextToSpeechPlayer text={text} />

          {/* Example Texts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Try these examples:</label>
            <div className="grid gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setText(example.text)}
                  className="text-left p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-sm">{example.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {example.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features List */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ 6 different voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)</li>
              <li>✅ Adjustable speed (0.25x to 4.0x)</li>
              <li>✅ Streaming audio for immediate playback</li>
              <li>✅ Mute/unmute control</li>
              <li>✅ Compatible with Next.js App Router</li>
            </ul>
          </div>

          {/* API Info */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <strong>API Info:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Model: OpenAI TTS-1 (fast, lower latency)</li>
              <li>• For higher quality: Change to TTS-1-HD in the code</li>
              <li>• Cost: ~$15 per 1M characters</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

