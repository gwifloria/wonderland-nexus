import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Profiling (optional)
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

  // Debug mode
  debug: process.env.NODE_ENV === "development",

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_COMMIT_ID || "unknown",

  // Replay for error investigation
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Custom error filtering
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === "development") {
      // Log to console in development
      console.group("🚨 Sentry Error");
      console.error(event);
      console.groupEnd();
    }

    // Filter out known non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (
        error?.type === "ChunkLoadError" ||
        error?.value?.includes("Loading chunk")
      ) {
        return null; // Don't send chunk loading errors
      }
    }

    return event;
  },

  // Performance filtering
  beforeSendTransaction(event) {
    // Filter out transactions we don't care about
    if (event.transaction?.includes("/_next/")) {
      return null;
    }
    return event;
  },

  // Integration configuration
  integrations: [
    Sentry.replayIntegration({
      // Capture replay for errors and 10% of sessions
      maskAllText: process.env.NODE_ENV === "production",
      blockAllMedia: process.env.NODE_ENV === "production",
    }),
  ],
});
