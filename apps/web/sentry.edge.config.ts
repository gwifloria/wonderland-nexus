import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring for edge runtime
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Debug mode
  debug: process.env.NODE_ENV === "development",

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_COMMIT_ID || "unknown",

  // Edge runtime specific configurations
  beforeSend(event) {
    // Filter edge-specific errors
    if (event.exception) {
      const error = event.exception.values?.[0];

      // Filter out edge runtime limitations
      if (error?.value?.includes("not supported in Edge Runtime")) {
        return null;
      }
    }

    return event;
  },

  // Add edge context
  beforeSendTransaction(event) {
    event.tags = {
      ...event.tags,
      runtime: "edge",
    };

    return event;
  },
});
