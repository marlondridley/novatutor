/**
 * 🎨 Progressive Enhancement Hook
 * 
 * Detects user capabilities and preferences to provide the best experience
 * Gracefully degrades features when needed (old devices, accessibility needs)
 */

import { useState, useEffect } from 'react';

export interface EnhancementCapabilities {
  // User preferences
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
  
  // Device capabilities
  hasAudioSupport: boolean;
  hasVibrationSupport: boolean;
  hasTouchSupport: boolean;
  
  // Performance
  isLowPowerMode: boolean;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
}

export function useProgressiveEnhancement(): EnhancementCapabilities {
  const [capabilities, setCapabilities] = useState<EnhancementCapabilities>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    hasAudioSupport: true,
    hasVibrationSupport: false,
    hasTouchSupport: false,
    isLowPowerMode: false,
    connectionSpeed: 'unknown',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      setCapabilities(prev => ({
        ...prev,
        prefersReducedMotion: reducedMotionQuery.matches,
      }));
    };
    updateReducedMotion();
    reducedMotionQuery.addEventListener('change', updateReducedMotion);

    // Check high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const updateHighContrast = () => {
      setCapabilities(prev => ({
        ...prev,
        prefersHighContrast: highContrastQuery.matches,
      }));
    };
    updateHighContrast();
    highContrastQuery.addEventListener('change', updateHighContrast);

    // Check dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateDarkMode = () => {
      setCapabilities(prev => ({
        ...prev,
        prefersDarkMode: darkModeQuery.matches,
      }));
    };
    updateDarkMode();
    darkModeQuery.addEventListener('change', updateDarkMode);

    // Check audio support
    try {
      const audio = new Audio();
      const hasAudio = !!audio.canPlayType && audio.canPlayType('audio/mpeg') !== '';
      setCapabilities(prev => ({ ...prev, hasAudioSupport: hasAudio }));
    } catch (error) {
      setCapabilities(prev => ({ ...prev, hasAudioSupport: false }));
    }

    // Check vibration support
    const hasVibration = 'vibrate' in navigator;
    setCapabilities(prev => ({ ...prev, hasVibrationSupport: hasVibration }));

    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setCapabilities(prev => ({ ...prev, hasTouchSupport: hasTouch }));

    // Check connection speed
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const speed = connection.effectiveType === '4g' || connection.effectiveType === 'wifi' ? 'fast' : 'slow';
      setCapabilities(prev => ({ ...prev, connectionSpeed: speed }));
    }

    return () => {
      reducedMotionQuery.removeEventListener('change', updateReducedMotion);
      highContrastQuery.removeEventListener('change', updateHighContrast);
      darkModeQuery.removeEventListener('change', updateDarkMode);
    };
  }, []);

  return capabilities;
}

/**
 * Apply progressive enhancement styles based on capabilities
 */
export function getEnhancedStyles(capabilities: EnhancementCapabilities) {
  return {
    // Animation duration (0 if reduced motion)
    animationDuration: capabilities.prefersReducedMotion ? '0ms' : '200ms',
    
    // Transition (instant if reduced motion)
    transition: capabilities.prefersReducedMotion ? 'none' : 'all 0.2s ease',
    
    // Font size (larger if high contrast)
    fontSize: capabilities.prefersHighContrast ? '1.125rem' : '1rem',
    
    // Border width (thicker if high contrast)
    borderWidth: capabilities.prefersHighContrast ? '3px' : '2px',
  };
}

/**
 * Haptic feedback helper (works on mobile)
 */
export function triggerHaptic(capabilities: EnhancementCapabilities, pattern: number | number[] = 50) {
  if (capabilities.hasVibrationSupport && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.debug('[Haptic] Vibration failed:', error);
    }
  }
}

