'use client';

import { ReactNode } from 'react';
import { useMediaQuery } from 'react-responsive';
import { breakpoints } from '@/hooks/use-responsive';

interface ResponsiveWrapperProps {
  children: ReactNode;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
}

/**
 * Responsive wrapper component that renders different content based on screen size
 * 
 * @example
 * <ResponsiveWrapper
 *   mobile={<MobileNav />}
 *   desktop={<DesktopNav />}
 * >
 *   <DefaultContent />
 * </ResponsiveWrapper>
 */
export function ResponsiveWrapper({ 
  children, 
  mobile, 
  tablet, 
  desktop 
}: ResponsiveWrapperProps) {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile - 1 });
  const isTablet = useMediaQuery({ 
    minWidth: breakpoints.mobile, 
    maxWidth: breakpoints.desktop - 1 
  });
  const isDesktop = useMediaQuery({ minWidth: breakpoints.desktop });

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  
  return <>{children}</>;
}

interface ShowOnProps {
  children: ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  widescreen?: boolean;
}

/**
 * Show content only on specific screen sizes
 * 
 * @example
 * <ShowOn mobile tablet>
 *   <p>Only visible on mobile and tablet</p>
 * </ShowOn>
 */
export function ShowOn({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  widescreen 
}: ShowOnProps) {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile - 1 });
  const isTablet = useMediaQuery({ 
    minWidth: breakpoints.mobile, 
    maxWidth: breakpoints.desktop - 1 
  });
  const isDesktop = useMediaQuery({ 
    minWidth: breakpoints.desktop,
    maxWidth: breakpoints.widescreen - 1
  });
  const isWidescreen = useMediaQuery({ minWidth: breakpoints.widescreen });

  const shouldShow = 
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktop) ||
    (widescreen && isWidescreen);

  if (!shouldShow) return null;
  
  return <>{children}</>;
}

interface HideOnProps {
  children: ReactNode;
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  widescreen?: boolean;
}

/**
 * Hide content on specific screen sizes
 * 
 * @example
 * <HideOn mobile>
 *   <p>Hidden on mobile devices</p>
 * </HideOn>
 */
export function HideOn({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  widescreen 
}: HideOnProps) {
  const isMobile = useMediaQuery({ maxWidth: breakpoints.mobile - 1 });
  const isTablet = useMediaQuery({ 
    minWidth: breakpoints.mobile, 
    maxWidth: breakpoints.desktop - 1 
  });
  const isDesktop = useMediaQuery({ 
    minWidth: breakpoints.desktop,
    maxWidth: breakpoints.widescreen - 1
  });
  const isWidescreen = useMediaQuery({ minWidth: breakpoints.widescreen });

  const shouldHide = 
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktop) ||
    (widescreen && isWidescreen);

  if (shouldHide) return null;
  
  return <>{children}</>;
}

