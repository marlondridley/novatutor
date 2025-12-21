/**
 * Natural Speech Synthesis
 *
 * Two TTS options:
 * 1. Edge TTS (neural voices) - FREE, natural-sounding, server-side
 * 2. Browser TTS (fallback) - FREE, built-in, less natural
 *
 * Usage:
 *   await speakNaturally("Hello, let me explain this concept.");
 *   await speakNaturally("Great job!", 'celebration');
 *   await speakNaturally("Here's how...", 'explanation', undefined, undefined, true); // Force Edge TTS
 */

// =============================================================================
// TYPES
// =============================================================================

/** Speech styles with pre-configured voice settings */
export type SpeechStyle = 
  | 'greeting'      // Warm and welcoming
  | 'question'      // Curious, inviting response
  | 'encouragement' // Supportive and confident
  | 'explanation'   // Clear and measured (default)
  | 'celebration'   // Excited and energetic
  | 'reflection';   // Thoughtful and calm

export interface SpeechConfig {
  rate: number;    // 0.5 to 2.0 (1.0 = normal)
  pitch: number;   // 0.0 to 2.0 (1.0 = normal)
  volume: number;  // 0.0 to 1.0
}

// =============================================================================
// STYLE PRESETS
// =============================================================================

/**
 * Pre-configured voice settings for different contexts.
 * These make the TTS sound more natural for educational content.
 */
const STYLE_CONFIGS: Record<SpeechStyle, SpeechConfig> = {
  greeting:      { rate: 0.95, pitch: 1.1, volume: 1.0 },
  question:      { rate: 0.9,  pitch: 1.15, volume: 1.0 },
  encouragement: { rate: 1.0,  pitch: 1.2, volume: 1.0 },
  explanation:   { rate: 0.85, pitch: 1.0, volume: 0.9 },  // Slower for clarity
  celebration:   { rate: 1.1,  pitch: 1.3, volume: 1.0 },
  reflection:    { rate: 0.8,  pitch: 0.95, volume: 0.9 }, // Slower, calmer
};

// =============================================================================
// MAIN FUNCTION
// =============================================================================

// Audio element for Edge TTS playback
let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using natural-sounding neural TTS (Edge TTS) with browser fallback.
 * 
 * @param text - The text to speak
 * @param style - The speaking style (affects rate, pitch, volume)
 * @param onStart - Called when speech starts
 * @param onEnd - Called when speech ends
 * @param useEdgeTTS - Force Edge TTS (default: true for natural voice)
 * @returns Promise that resolves when speech is complete
 * 
 * @example
 * // Simple usage - uses natural Edge TTS by default
 * await speakNaturally("Welcome! Let's start learning.");
 * 
 * // With style
 * await speakNaturally("You got it right!", 'celebration');
 * 
 * // With callbacks
 * await speakNaturally("Let me explain...", 'explanation', 
 *   () => setIsSpeaking(true),
 *   () => setIsSpeaking(false)
 * );
 */
export async function speakNaturally(
  text: string,
  style: SpeechStyle = 'explanation',
  onStart?: () => void,
  onEnd?: () => void,
  useEdgeTTS: boolean = true
): Promise<void> {
  // Stop any current speech
  stopSpeaking();
  
  // Try Edge TTS first (natural neural voices)
  if (useEdgeTTS && typeof window !== 'undefined') {
    try {
      console.log('[TTS] Using Edge TTS for natural voice...');
      
      const response = await fetch('/api/tts/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style, voice: 'default' }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return new Promise((resolve) => {
          currentAudio = new Audio(audioUrl);
          
          currentAudio.onplay = () => {
            console.log('[TTS] Edge TTS started playing');
            onStart?.();
          };
          
          currentAudio.onended = () => {
            console.log('[TTS] Edge TTS finished');
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            onEnd?.();
            resolve();
          };
          
          currentAudio.onerror = () => {
            console.warn('[TTS] Edge TTS playback error, falling back to browser TTS');
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            // Fall back to browser TTS
            speakWithBrowserTTS(text, style, onStart, onEnd).then(resolve);
          };
          
          currentAudio.play().catch(() => {
            // Autoplay blocked, fall back
            speakWithBrowserTTS(text, style, onStart, onEnd).then(resolve);
          });
        });
      }
    } catch (error) {
      console.warn('[TTS] Edge TTS failed, falling back to browser:', error);
    }
  }
  
  // Fallback to browser TTS
  return speakWithBrowserTTS(text, style, onStart, onEnd);
}

/**
 * Browser's built-in TTS (fallback when Edge TTS unavailable)
 */
async function speakWithBrowserTTS(
  text: string,
  style: SpeechStyle,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  return new Promise(async (resolve) => {
    // Check browser support
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[TTS] Browser does not support speech synthesis');
      onEnd?.();
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance with style settings
    const config = STYLE_CONFIGS[style];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    // Pick the best available voice
    const voice = await selectBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Event handlers
    utterance.onstart = () => onStart?.();
    
    utterance.onend = () => {
      onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      const error = (event as any)?.error || 'unknown';
      if (error !== 'interrupted' && error !== 'canceled' && error !== 'not-allowed') {
        console.warn('[TTS] Speech error:', error);
      }
      onEnd?.();
      resolve();
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Stop any currently playing speech (both Edge TTS and browser TTS).
 */
export function stopSpeaking(): void {
  // Stop Edge TTS audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  
  // Stop browser TTS
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if the browser supports speech synthesis.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get list of available voices.
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Selects the best available voice, preferring high-quality English voices.
 */
async function selectBestVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await waitForVoices();
  if (!voices.length) return null;

  // Prefer natural-sounding cloud voices; avoid legacy robotic voices
  const preferred = [
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny',
    'Microsoft Guy',
    'Microsoft Ana',
    'Microsoft Aria',
    'Google UK English Female',
    'Google US English',
    'Google English',
    'Google 英語',
    'en-US',
    'en-GB',
  ];

  const avoid = ['Desktop', 'Zira', 'David', 'Mark', 'Natural Reader'];

  const byPreference = voices.find((v) =>
    preferred.some((p) => v.name.toLowerCase().includes(p.toLowerCase())) &&
    !avoid.some((a) => v.name.toLowerCase().includes(a.toLowerCase()))
  );

  const english = voices.find((v) =>
    v.lang?.toLowerCase().startsWith('en') &&
    !avoid.some((a) => v.name.toLowerCase().includes(a.toLowerCase()))
  );

  const chosen = byPreference || english || voices[0] || null;
  return chosen;
}

/**
 * Waits for voices to be available (some browsers load them asynchronously).
 */
function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

// =============================================================================
// EXAMPLE PHRASES (for testing)
// =============================================================================

export const SPEECH_EXAMPLES = {
  greeting: "Hey there! I'm your learning coach. Let's get started!",
  question: "How are you feeling about your schoolwork today?",
  encouragement: "Great work! You're making real progress!",
  explanation: "Let me break this down. First, we focus on the main concepts.",
  celebration: "Amazing! You figured it out! That was a tough one!",
  reflection: "Take a moment to think about what you've learned today.",
};
