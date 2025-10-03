"use client";

import * as Sentry from "@sentry/nextjs";
import { Button, Result } from "antd";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/monitoring/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Log error details
    logger.error("Error Boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Capture with Sentry and get event ID for user feedback
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({
      error,
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      eventId: undefined,
    });
    logger.info("User triggered error boundary retry", {
      previousError: this.state.error?.message,
    });
  };

  private handleReportFeedback = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  private handleReload = () => {
    logger.info("User triggered page reload from error boundary");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false } = this.props;
      const { error, errorInfo } = this.state;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-milktea-50 via-rose-50 to-milktea-100 p-4">
          <div className="max-w-2xl w-full">
            <Result
              status="error"
              title="Oops! Something went wrong"
              subTitle={
                process.env.NODE_ENV === "development" && error
                  ? error.message
                  : "We encountered an unexpected error. Our team has been notified."
              }
              extra={[
                <Button type="primary" key="retry" onClick={this.handleRetry}>
                  Try Again
                </Button>,
                <Button key="reload" onClick={this.handleReload}>
                  Reload Page
                </Button>,
                process.env.NODE_ENV === "production" && (
                  <Button key="feedback" onClick={this.handleReportFeedback}>
                    Report Issue
                  </Button>
                ),
              ].filter(Boolean)}
            />

            {/* Development error details */}
            {process.env.NODE_ENV === "development" && showDetails && error && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Error Details (Development)
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 p-2 bg-red-50 border border-red-200 rounded overflow-x-auto">
                      {error.message}
                    </pre>
                  </div>

                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 p-2 bg-red-50 border border-red-200 rounded overflow-x-auto text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded overflow-x-auto text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorHandler() {
  return (error: Error, errorInfo?: { [key: string]: any }) => {
    logger.error("Manual error report", error, errorInfo);

    Sentry.withScope((scope) => {
      if (errorInfo) {
        Object.entries(errorInfo).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  };
}
