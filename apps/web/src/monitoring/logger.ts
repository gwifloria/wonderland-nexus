import * as Sentry from "@sentry/nextjs";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isClient = typeof window !== "undefined";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = this.isClient ? "[Client]" : "[Server]";
    return `${prefix} [${level.toUpperCase()}] ${timestamp}: ${message}${
      context ? ` | Context: ${JSON.stringify(context)}` : ""
    }`;
  }

  private sendToSentry(level: LogLevel, message: string, context?: LogContext) {
    // Add context to Sentry scope
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      scope.setTag("logLevel", level);
      scope.setTag("environment", process.env.NODE_ENV);

      switch (level) {
        case LogLevel.ERROR:
          Sentry.captureException(new Error(message));
          break;
        case LogLevel.WARN:
          Sentry.captureMessage(message, "warning");
          break;
        case LogLevel.INFO:
          Sentry.captureMessage(message, "info");
          break;
        case LogLevel.DEBUG:
          if (this.isDevelopment) {
            Sentry.captureMessage(message, "debug");
          }
          break;
      }
    });
  }

  private async sendToAPI(logEntry: LogEntry) {
    if (!this.isClient) return; // Only send from client side

    // In development, only send ERROR level logs to API to reduce noise
    if (this.isDevelopment && logEntry.level !== LogLevel.ERROR) {
      return;
    }

    try {
      await fetch("/api/monitoring/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.error("Failed to send log to API:", error);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      userId: context?.userId,
      sessionId: context?.sessionId,
      url: this.isClient ? window.location.href : undefined,
      userAgent: this.isClient ? navigator.userAgent : undefined,
    };

    // Console logging
    const formattedMessage = this.formatMessage(level, message, context);
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }

    // Send to Sentry
    this.sendToSentry(level, message, context);

    // Send to API (async, non-blocking)
    this.sendToAPI(logEntry);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    };

    this.log(LogLevel.ERROR, message, errorContext);

    // Also send the actual error to Sentry
    if (error) {
      Sentry.captureException(error);
    }
  }

  // Performance logging
  performance(operation: string, duration: number, context?: LogContext) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: "performance",
    });
  }

  // User action logging
  userAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, {
      ...context,
      action,
      type: "userAction",
    });
  }

  // API call logging
  apiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    context?: LogContext,
  ) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API ${method} ${endpoint} - ${status} (${duration}ms)`, {
      ...context,
      endpoint,
      method,
      status,
      duration,
      type: "apiCall",
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
export const logApiCall = logger.apiCall.bind(logger);
