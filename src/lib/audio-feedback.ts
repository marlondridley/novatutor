/**
 * 🔊 Audio Feedback System
 * 
 * Soft, pleasant sounds to reinforce user actions.
 * Uses Web Audio API for instant, low-latency feedback.
 */

let audioContext: AudioContext | null = null;

// Initialize audio context (lazy load)
function getAudioContext(): AudioContext {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext!;
}

/**
 * Play a soft "click" sound
 * Used for: D-pad buttons, regular button clicks
 */
export function playClick() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Soft, friendly click (C note)
    oscillator.frequency.value = 523.25; // C5
    oscillator.type = 'sine';

    // Quick fade out
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  } catch (error) {
    // Silently fail if audio not supported
    console.debug('[Audio] Click sound failed:', error);
  }
}

/**
 * Play a "confirm" sound
 * Used for: Important actions, task completion, success
 */
export function playConfirm() {
  try {
    const ctx = getAudioContext();
    
    // Play a pleasant two-tone chord (C + E)
    [523.25, 659.25].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + (index * 0.05);
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  } catch (error) {
    console.debug('[Audio] Confirm sound failed:', error);
  }
}

/**
 * Play "listening start" sound
 * Used for: When microphone starts recording
 */
export function playListeningStart() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Rising tone (G to C)
    oscillator.frequency.setValueAtTime(392, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(523.25, ctx.currentTime + 0.15);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.debug('[Audio] Listening start sound failed:', error);
  }
}

/**
 * Play "listening stop" sound
 * Used for: When microphone stops recording
 */
export function playListeningStop() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Falling tone (C to G)
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(392, ctx.currentTime + 0.15);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.debug('[Audio] Listening stop sound failed:', error);
  }
}

/**
 * Play "error" sound
 * Used for: When something goes wrong
 */
export function playError() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Low buzzing sound
    oscillator.frequency.value = 196; // G3
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.debug('[Audio] Error sound failed:', error);
  }
}

/**
 * Play "success" sound (celebratory!)
 * Used for: Quest completion, level up, achievements
 */
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    
    // Play ascending arpeggio (C-E-G-C)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + (index * 0.08);
      gainNode.gain.setValueAtTime(0.12, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (error) {
    console.debug('[Audio] Success sound failed:', error);
  }
}

