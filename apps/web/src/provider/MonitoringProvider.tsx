"use client";

import { useWebVital } from "@/hooks/useWebVitals";
import { logger } from "@/monitoring/logger";
import { performanceMonitor } from "@/monitoring/performance";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";

interface MonitoringContextType {
  isMonitoringEnabled: boolean;
  sessionId: string;
}

const MonitoringContext = createContext<MonitoringContextType>({
  isMonitoringEnabled: false,
  sessionId: "",
});

export const useMonitoring = () => useContext(MonitoringContext);

interface MonitoringProviderProps {
  children: ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const isProduction = process.env.NODE_ENV === "production";
  const { data: session } = useSession();
  const sessionId = performanceMonitor.getSessionId();

  // Initialize Web Vitals monitoring (only in production to reduce dev API calls)
  useWebVital(isProduction);

  // Early return for development - skip monitoring effects
  const shouldMonitor = isProduction;

  useEffect(() => {
    if (!shouldMonitor) return;

    // Initialize monitoring when component mounts
    logger.info("Monitoring system initialized", {
      sessionId,
      userId: session?.user?.email,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Mark application start
    performanceMonitor.markCustomEvent("app-start", {
      userId: session?.user?.email,
      sessionId,
    });

    // Set up global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error("Unhandled promise rejection", new Error(event.reason), {
        type: "unhandled-rejection",
        reason: event.reason,
      });
    };

    // Set up global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      logger.error("Uncaught error", new Error(event.message), {
        type: "uncaught-error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Monitor route changes (for SPA navigation)
    let currentUrl = window.location.href;
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        const previousUrl = currentUrl;
        currentUrl = window.location.href;

        logger.info("Route change detected", {
          from: previousUrl,
          to: currentUrl,
          type: "navigation",
        });

        performanceMonitor.markCustomEvent("route-change", {
          from: previousUrl,
          to: currentUrl,
        });
      }
    };

    // Check for URL changes every 100ms (for SPA navigation)
    const urlCheckInterval = setInterval(checkUrlChange, 100);

    // Monitor page visibility changes
    const handleVisibilityChange = () => {
      logger.info("Page visibility changed", {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });

      performanceMonitor.markCustomEvent("visibility-change", {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Monitor online/offline status
    const handleOnline = () => {
      logger.info("Application came online");
      performanceMonitor.markCustomEvent("connection-online");
    };

    const handleOffline = () => {
      logger.warn("Application went offline");
      performanceMonitor.markCustomEvent("connection-offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(urlCheckInterval);

      // Mark application end
      performanceMonitor.markCustomEvent("app-end", {
        sessionDuration: Date.now() - parseInt(sessionId.split("-")[0]),
      });

      logger.info("Monitoring system cleaned up");
    };
  }, [session, sessionId, shouldMonitor]);

  // Monitor user authentication state changes
  useEffect(() => {
    if (!shouldMonitor) return;

    if (session?.user) {
      logger.info("User authenticated", {
        userId: session.user.email,
        sessionId,
      });

      performanceMonitor.markCustomEvent("user-auth", {
        userId: session.user.email,
      });
    } else {
      logger.info("User logged out or session expired", {
        sessionId,
      });

      performanceMonitor.markCustomEvent("user-logout");
    }
  }, [session, sessionId, shouldMonitor]);

  const contextValue: MonitoringContextType = {
    isMonitoringEnabled: shouldMonitor,
    sessionId,
  };

  return (
    <MonitoringContext.Provider value={contextValue}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          logger.error("React Error Boundary triggered", error, {
            componentStack: errorInfo.componentStack,
            userId: session?.user?.email,
            sessionId,
          });
        }}
      >
        {children}
      </ErrorBoundary>
    </MonitoringContext.Provider>
  );
}

// Higher-order component for monitoring specific components
export function withMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
) {
  const WrappedComponent = (props: P) => {
    const { sessionId } = useMonitoring();

    useEffect(() => {
      const name =
        componentName || Component.displayName || Component.name || "Component";

      logger.debug(`Component mounted: ${name}`, {
        componentName: name,
        sessionId,
      });

      performanceMonitor.markCustomEvent(`component-mount-${name}`);

      return () => {
        logger.debug(`Component unmounted: ${name}`, {
          componentName: name,
          sessionId,
        });

        performanceMonitor.markCustomEvent(`component-unmount-${name}`);
      };
    }, [sessionId]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withMonitoring(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
