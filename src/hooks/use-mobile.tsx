'use client';

import { useMediaQuery } from 'react-responsive';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect mobile devices
 * Now powered by react-responsive for better performance and SSR support
 */
export function useIsMobile() {
  return useMediaQuery({ maxWidth: MOBILE_BREAKPOINT - 1 });
}
