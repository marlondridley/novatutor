// Ambient module declaration to avoid TypeScript errors when
// @sentry/nextjs is not installed in this environment.
// In production, install the official package:
//   npm install @sentry/nextjs
declare module '@sentry/nextjs' {
  // Minimal shape to satisfy dynamic usage in src/lib/sentry.ts
  export function init(options: any): void;
  export function captureException(error: any, context?: any): void;
  export function captureMessage(message: string, options?: any): void;
}


