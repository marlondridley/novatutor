# Responsive Design Guide for SuperTutor

## Overview

SuperTutor uses `react-responsive` for declarative, component-based responsive design inspired by Bank of America's professional UI.

## Installation

```bash
npm install react-responsive @types/react-responsive
```

## Breakpoints

We follow enterprise-grade breakpoints:

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| Mobile | < 640px | Phones |
| Tablet | 640px - 1023px | Tablets, small laptops |
| Desktop | 1024px - 1279px | Standard desktops |
| Widescreen | ≥ 1280px | Large monitors |

## Usage Examples

### 1. Using Hooks

```tsx
import { useIsMobile, useIsDesktop, useResponsive } from '@/hooks/use-responsive';

export function MyComponent() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  
  return (
    <div className={isMobile ? 'p-2' : 'p-6'}>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </div>
  );
}

// Or use the combined hook
export function Dashboard() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="grid gap-4">
      <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {/* Content */}
      </div>
    </div>
  );
}
```

### 2. Using Components

```tsx
import { ShowOn, HideOn, ResponsiveWrapper } from '@/components/responsive-wrapper';

export function Navigation() {
  return (
    <>
      {/* Show only on mobile */}
      <ShowOn mobile>
        <MobileNav />
      </ShowOn>
      
      {/* Show on tablet and desktop */}
      <ShowOn tablet desktop>
        <FullNav />
      </ShowOn>
      
      {/* Hide on mobile */}
      <HideOn mobile>
        <AdvancedFeatures />
      </HideOn>
    </>
  );
}

// Different content for different screens
export function Header() {
  return (
    <ResponsiveWrapper
      mobile={<CompactHeader />}
      tablet={<MediumHeader />}
      desktop={<FullHeader />}
    >
      <DefaultHeader />
    </ResponsiveWrapper>
  );
}
```

### 3. Accessibility Features

```tsx
import { 
  usePrefersReducedMotion, 
  usePrefersDarkMode,
  usePrefersHighContrast 
} from '@/hooks/use-responsive';

export function AnimatedComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
      {/* Respects user's motion preferences */}
    </div>
  );
}

export function ThemeProvider() {
  const prefersDarkMode = usePrefersDarkMode();
  
  // Automatically apply dark mode based on system preference
  return (
    <div className={prefersDarkMode ? 'dark' : 'light'}>
      {children}
    </div>
  );
}
```

### 4. Touch Device Detection

```tsx
import { useIsTouchDevice } from '@/hooks/use-responsive';

export function InteractiveMap() {
  const isTouchDevice = useIsTouchDevice();
  
  return (
    <div 
      className={isTouchDevice ? 'touch-friendly' : 'mouse-friendly'}
      onTouchStart={isTouchDevice ? handleTouch : undefined}
      onMouseMove={!isTouchDevice ? handleMouse : undefined}
    >
      {/* Optimized for input method */}
    </div>
  );
}
```

### 5. Orientation Detection

```tsx
import { useIsPortrait, useIsLandscape } from '@/hooks/use-responsive';

export function VideoPlayer() {
  const isLandscape = useIsLandscape();
  
  return (
    <div className={isLandscape ? 'h-screen' : 'h-auto'}>
      {/* Optimized for orientation */}
    </div>
  );
}
```

## Tailwind Integration

Combine with Tailwind's responsive utilities for maximum flexibility:

```tsx
export function Card() {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <div className={`
      p-4 md:p-6 lg:p-8
      ${isMobile ? 'rounded-lg' : 'rounded-xl'}
      ${isDesktop ? 'shadow-2xl' : 'shadow-lg'}
    `}>
      <h2 className="text-xl md:text-2xl lg:text-3xl">
        Responsive Heading
      </h2>
    </div>
  );
}
```

## Best Practices

### 1. Mobile-First Approach
Always design for mobile first, then enhance for larger screens:

```tsx
// Good
<div className="text-sm md:text-base lg:text-lg">

// Avoid
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Performance
Use hooks at the top level and pass down as props:

```tsx
// Good
function Parent() {
  const isMobile = useIsMobile();
  return <Child isMobile={isMobile} />;
}

// Avoid calling the same hook multiple times
```

### 3. SSR Compatibility
`react-responsive` handles SSR gracefully, but always provide fallbacks:

```tsx
function Component() {
  const isMobile = useIsMobile();
  
  // Provide default until hydration
  if (isMobile === undefined) {
    return <LoadingState />;
  }
  
  return isMobile ? <Mobile /> : <Desktop />;
}
```

### 4. Consistent Breakpoints
Always use the predefined breakpoints from `@/hooks/use-responsive`:

```tsx
// Good
import { useIsMobile, breakpoints } from '@/hooks/use-responsive';

// Avoid custom breakpoints scattered in code
```

## Common Patterns

### 1. Responsive Grid
```tsx
function Dashboard() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const cols = isMobile ? 1 : isTablet ? 2 : 3;
  
  return (
    <div className={`grid grid-cols-${cols} gap-4`}>
      {/* Grid items */}
    </div>
  );
}
```

### 2. Conditional Navigation
```tsx
function Layout() {
  return (
    <>
      <ShowOn mobile tablet>
        <MobileNav />
      </ShowOn>
      <ShowOn desktop widescreen>
        <Sidebar />
      </ShowOn>
    </>
  );
}
```

### 3. Adaptive Forms
```tsx
function ContactForm() {
  const isMobile = useIsMobile();
  
  return (
    <form className={isMobile ? 'space-y-3' : 'space-y-4'}>
      <input className={isMobile ? 'text-base' : 'text-sm'} />
    </form>
  );
}
```

## Testing

Test responsive behavior across different devices:

```tsx
// In your tests
import { MediaQueryProvider } from 'react-responsive';

test('renders mobile version', () => {
  render(
    <MediaQueryProvider value={{ width: 375 }}>
      <Component />
    </MediaQueryProvider>
  );
});
```

## Resources

- [react-responsive Documentation](https://github.com/yocontra/react-responsive)
- [Bank of America Design System](https://design.bofa.com)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

