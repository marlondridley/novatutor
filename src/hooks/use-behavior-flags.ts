/**
 * 🎯 Behavior Flags Hook
 * 
 * Provides persistent behavior flags across the app.
 * Parents set these in Parent Settings, kids use them in the Game Controller.
 */

import { useState, useEffect } from 'react';
import { BehaviorFlags, DEFAULT_BEHAVIOR } from '@/ai/behavior-control';

const STORAGE_KEY = 'parentBehaviorFlags';

export function useBehaviorFlags() {
  const [behaviorFlags, setBehaviorFlagsState] = useState<BehaviorFlags>(DEFAULT_BEHAVIOR);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load flags from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedFlags = localStorage.getItem(STORAGE_KEY);
    if (savedFlags) {
      try {
        const parsed = JSON.parse(savedFlags);
        setBehaviorFlagsState(parsed);
      } catch (error) {
        console.error('[Behavior Flags] Failed to parse saved flags:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save flags to localStorage whenever they change
  const setBehaviorFlags = (flags: BehaviorFlags | ((prev: BehaviorFlags) => BehaviorFlags)) => {
    setBehaviorFlagsState(prev => {
      const newFlags = typeof flags === 'function' ? flags(prev) : flags;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
      }
      
      return newFlags;
    });
  };

  return {
    behaviorFlags,
    setBehaviorFlags,
    isLoaded,
  };
}

