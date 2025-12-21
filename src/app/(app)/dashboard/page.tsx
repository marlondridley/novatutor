"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GameController } from "@/components/game-controller";
import { Sparkles, BookOpen, GraduationCap, Trophy, Zap } from "lucide-react";

/**
 * Dashboard - Controller Mode
 * 
 * A full-screen Nintendo Switch-style interface for students.
 * Clean, immersive, and fun - just the controller!
 */
export default function DashboardPage() {
  const router = useRouter();
  const [lastTranscript, setLastTranscript] = useState<string>("");

  // Handle voice input from the big red button
  const handleVoiceTranscript = useCallback((text: string) => {
    setLastTranscript(text);
  }, []);

  return (
    <GameController onVoiceTranscript={handleVoiceTranscript}>
      {/* Welcome Screen Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg">BEST TUTOR EVER</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90">Your Learning Adventure Awaits!</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => router.push('/tutor')}
              className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-sm">My Coach</span>
              <p className="text-xs opacity-80 mt-1">Get homework help</p>
            </button>

            <button
              onClick={() => router.push('/learning-path')}
              className="bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <GraduationCap className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-sm">My Journey</span>
              <p className="text-xs opacity-80 mt-1">Track your progress</p>
            </button>

            <button
              onClick={() => router.push('/summarizer')}
              className="bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-300 hover:to-purple-500 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-sm">Smart Tools</span>
              <p className="text-xs opacity-80 mt-1">Notes & summaries</p>
            </button>

            <button
              onClick={() => router.push('/test-generator')}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white rounded-xl p-4 shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <span className="font-bold text-sm">Practice Test</span>
              <p className="text-xs opacity-80 mt-1">Quiz yourself</p>
            </button>
          </div>

          {/* Voice Prompt */}
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 text-center shadow-inner border-2 border-dashed border-purple-300 dark:border-purple-700">
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 mb-2">
              Ready to Talk?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Hold the <span className="text-red-500 font-bold">big red button</span> on the right Joy-Con and ask me anything!
            </p>
            
            {lastTranscript && (
              <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">You said:</p>
                <p className="font-medium text-purple-700 dark:text-purple-300">&ldquo;{lastTranscript}&rdquo;</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                &ldquo;Help me with math&rdquo;
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                &ldquo;What&apos;s for homework?&rdquo;
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                &ldquo;Quiz me on science&rdquo;
              </span>
            </div>
          </div>
        </div>
      </div>
    </GameController>
  );
}
