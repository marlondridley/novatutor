/**
 * Structured Logging Utility
 * Provides consistent logging across the application
 * 
 * In production, integrate with Azure Application Insights or Sentry
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Pretty print in development
      return JSON.stringify(entry, null, 2);
    }
    // Single line JSON in production
    return JSON.stringify(entry);
  }

  /**
   * Send log to external service (Application Insights, Sentry, etc.)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // Send to Sentry if configured
      if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
        const { captureException, captureMessage } = await import('@/lib/sentry');
        if (entry.error) {
          captureException(new Error(entry.error.message), {
            ...entry.context,
            stack: entry.error.stack,
          });
        } else if (entry.level === 'error' || entry.level === 'warn') {
          captureMessage(entry.message, entry.level, entry.context);
        }
      }

      // TODO: Integrate with Azure Application Insights
      // Example:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      // Silently fail to avoid logging loops - use console as last resort
      if (this.isDevelopment) {
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    const formattedLog = this.formatLog(entry);

    // Console output
    switch (level) {
      case 'debug':
        console.debug(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
    }

    // Send to external service in production
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, {
      ...context,
      type: 'api_request',
      method,
      path,
    });
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this.log(level, `API Response: ${method} ${path} ${status}`, {
      ...context,
      type: 'api_response',
      method,
      path,
      status,
      duration,
    });
  }

  /**
   * Log Stripe event
   */
  stripeEvent(eventType: string, eventId: string, context?: LogContext): void {
    this.info(`Stripe Event: ${eventType}`, {
      ...context,
      type: 'stripe_event',
      eventType,
      eventId,
    });
  }

  /**
   * Log database query
   */
  dbQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`DB Query: ${query}`, {
      ...context,
      type: 'db_query',
      query,
      duration,
    });
  }

  /**
   * Log AI request
   */
  aiRequest(model: string, tokens: number, cost: number, context?: LogContext): void {
    this.info(`AI Request: ${model}`, {
      ...context,
      type: 'ai_request',
      model,
      tokens,
      cost,
    });
  }

  /**
   * Log authentication event
   */
  authEvent(event: 'login' | 'logout' | 'signup' | 'failed', userId?: string, context?: LogContext): void {
    this.info(`Auth Event: ${event}`, {
      ...context,
      type: 'auth_event',
      event,
      userId,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogContext, LogLevel };
