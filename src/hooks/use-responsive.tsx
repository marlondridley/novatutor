'use client';

import { useMediaQuery } from 'react-responsive';

/**
 * Custom hooks for responsive design using react-responsive
 * Based on Bank of America's responsive breakpoints
 */

// Breakpoints matching typical financial/enterprise apps
export const breakpoints = {
  mobile: 640,      // Small phones
  tablet: 768,      // Tablets
  desktop: 1024,    // Desktop
  widescreen: 1280, // Large screens
};

export function useIsMobile() {
  return useMediaQuery({ maxWidth: breakpoints.mobile - 1 });
}

export function useIsTablet() {
  return useMediaQuery({ 
    minWidth: breakpoints.mobile, 
    maxWidth: breakpoints.desktop - 1 
  });
}

export function useIsDesktop() {
  return useMediaQuery({ minWidth: breakpoints.desktop });
}

export function useIsWidescreen() {
  return useMediaQuery({ minWidth: breakpoints.widescreen });
}

// Convenience hook for mobile OR tablet (small screens)
export function useIsSmallScreen() {
  return useMediaQuery({ maxWidth: breakpoints.desktop - 1 });
}

// Portrait/Landscape detection
export function useIsPortrait() {
  return useMediaQuery({ orientation: 'portrait' });
}

export function useIsLandscape() {
  return useMediaQuery({ orientation: 'landscape' });
}

// Touch device detection
export function useIsTouchDevice() {
  return useMediaQuery({ query: '(pointer: coarse)' });
}

// Reduced motion for accessibility
export function usePrefersReducedMotion() {
  return useMediaQuery({ query: '(prefers-reduced-motion: reduce)' });
}

// Dark mode preference
export function usePrefersDarkMode() {
  return useMediaQuery({ query: '(prefers-color-scheme: dark)' });
}

// High contrast mode
export function usePrefersHighContrast() {
  return useMediaQuery({ query: '(prefers-contrast: more)' });
}

/**
 * Combined responsive hook that returns all breakpoint states
 */
export function useResponsive() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isWidescreen = useIsWidescreen();
  const isSmallScreen = useIsSmallScreen();
  const isPortrait = useIsPortrait();
  const isLandscape = useIsLandscape();
  const isTouchDevice = useIsTouchDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkMode = usePrefersDarkMode();
  const prefersHighContrast = usePrefersHighContrast();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWidescreen,
    isSmallScreen,
    isPortrait,
    isLandscape,
    isTouchDevice,
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  };
}

