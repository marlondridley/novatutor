/**
 * @fileOverview Sentry Error Monitoring Integration
 * 
 * Provides structured error tracking and monitoring for production.
 * 
 * SETUP:
 * 1. Create Sentry project at https://sentry.io
 * 2. Get your DSN from project settings
 * 3. Set SENTRY_DSN environment variable
 * 4. Install: npm install @sentry/nextjs
 */

import { logger } from "@/lib/logger";

let sentryInitialized = false;

/**
 * Initialize Sentry if DSN is configured
 * Call this in your app initialization (e.g., layout.tsx or _app.tsx)
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  
  if (!dsn) {
    logger.debug('Sentry not configured - SENTRY_DSN not set');
    return;
  }

  if (sentryInitialized) {
    return;
  }

  try {
    // Dynamic import to avoid loading Sentry in development if not needed
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === 'development',
        beforeSend(event, hint) {
          // Filter out non-error events in production
          if (process.env.NODE_ENV === 'production' && event.level !== 'error') {
            return null;
          }
          return event;
        },
      });
      sentryInitialized = true;
      logger.info('Sentry initialized', { environment: process.env.NODE_ENV });
    }).catch((error) => {
      logger.error('Failed to initialize Sentry', error);
    });
  } catch (error) {
    logger.error('Sentry initialization error', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Capture an exception to Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    // Fallback to logger if Sentry not initialized
    logger.error('Exception (Sentry not initialized)', error, context);
    return;
  }

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error, {
        contexts: {
          additional: context || {},
        },
      });
    });
  } catch (err) {
    logger.error('Failed to capture exception to Sentry', err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  if (!sentryInitialized) {
    logger[level](message, context);
    return;
  }

  try {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureMessage(message, {
        level,
        contexts: {
          additional: context || {},
        },
      });
    });
  } catch (err) {
    logger.error('Failed to capture message to Sentry', err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);
}

