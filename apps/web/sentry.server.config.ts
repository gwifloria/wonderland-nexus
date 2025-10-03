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

  // Custom error filtering for server
  beforeSend(event) {
    // Filter out known non-critical server errors
    if (event.exception) {
      const error = event.exception.values?.[0];

      // Filter out MongoDB connection timeouts in development
      if (
        process.env.NODE_ENV === "development" &&
        error?.value?.includes("MongooseServerSelectionError")
      ) {
        return null;
      }

      // Filter out GitHub API rate limiting (handled gracefully)
      if (error?.value?.includes("API rate limit exceeded")) {
        return null;
      }
    }

    return event;
  },

  // Add server context
  beforeSendTransaction(event) {
    // Add server-specific context
    event.tags = {
      ...event.tags,
      serverSide: true,
    };

    return event;
  },

  // Integration configuration for server
  integrations: [
    Sentry.browserProfilingIntegration(),
    Sentry.httpIntegration({
      ignoreIncomingRequests: (url: string) => {
        // Ignore health checks and static assets
        return (
          url.includes("/health") ||
          url.includes("/_next/") ||
          url.includes("/favicon")
        );
      },
    }),
  ],
});
