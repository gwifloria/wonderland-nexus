import * as Sentry from "@sentry/nextjs";
import { logger } from "./logger";

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  url?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface CustomPerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: "navigation" | "resource" | "measure" | "custom";
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isClient = typeof window !== "undefined";
  private observer?: PerformanceObserver;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private init() {
    if (!this.isClient) return;

    // Initialize performance observer
    this.setupPerformanceObserver();

    // Monitor page visibility changes
    this.setupVisibilityMonitoring();

    // Monitor memory usage
    this.setupMemoryMonitoring();

    // Monitor network status
    this.setupNetworkMonitoring();
  }

  private setupPerformanceObserver() {
    try {
      if (!("PerformanceObserver" in window)) return;

      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = ["navigation", "resource", "measure", "paint"];
      entryTypes.forEach((type) => {
        try {
          this.observer?.observe({ type, buffered: true });
        } catch (e) {
          // Some entry types might not be supported
          logger.debug(`Performance observer type ${type} not supported`, {
            error: e,
          });
        }
      });
    } catch (error) {
      logger.error("Failed to setup performance observer", error as Error);
    }
  }

  private setupVisibilityMonitoring() {
    if (!("document" in window)) return;

    document.addEventListener("visibilitychange", () => {
      const metric: PerformanceMetric = {
        name: "page-visibility",
        value: document.hidden ? 0 : 1,
        rating: "good",
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        metadata: {
          visibilityState: document.visibilityState,
        },
      };

      this.recordMetric(metric);
    });
  }

  private setupMemoryMonitoring() {
    if (
      !("performance" in window) ||
      !("memory" in (window.performance as any))
    )
      return;

    // Monitor memory every 30 seconds
    setInterval(() => {
      const memory = (window.performance as any).memory;
      const metric: PerformanceMetric = {
        name: "memory-usage",
        value: memory.usedJSHeapSize / 1024 / 1024, // MB
        rating:
          memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8
            ? "poor"
            : "good",
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage:
            (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        },
      };

      this.recordMetric(metric);
    }, 30000);
  }

  private setupNetworkMonitoring() {
    if (!("navigator" in window) || !("connection" in navigator)) return;

    const connection = (navigator as any).connection;

    const recordNetworkInfo = () => {
      const metric: PerformanceMetric = {
        name: "network-info",
        value: connection.downlink || 0,
        rating:
          connection.effectiveType === "4g"
            ? "good"
            : connection.effectiveType === "3g"
              ? "needs-improvement"
              : "poor",
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        metadata: {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        },
      };

      this.recordMetric(metric);
    };

    // Record initial network info
    recordNetworkInfo();

    // Monitor network changes
    connection.addEventListener("change", recordNetworkInfo);
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    let metric: PerformanceMetric | null = null;

    switch (entry.entryType) {
      case "navigation":
        metric = this.processNavigationEntry(
          entry as PerformanceNavigationTiming,
        );
        break;
      case "resource":
        metric = this.processResourceEntry(entry as PerformanceResourceTiming);
        break;
      case "paint":
        metric = this.processPaintEntry(entry);
        break;
      case "measure":
        metric = this.processMeasureEntry(entry as PerformanceMeasure);
        break;
    }

    if (metric) {
      this.recordMetric(metric);
    }
  }

  private processNavigationEntry(
    entry: PerformanceNavigationTiming,
  ): PerformanceMetric | null {
    const loadTime = entry.loadEventEnd - entry.startTime;

    return {
      name: "page-load-time",
      value: loadTime,
      rating:
        loadTime < 2500
          ? "good"
          : loadTime < 4000
            ? "needs-improvement"
            : "poor",
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      metadata: {
        domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
        firstByte: entry.responseStart - entry.startTime,
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnect: entry.connectEnd - entry.connectStart,
        serverResponse: entry.responseEnd - entry.responseStart,
        domProcessing: entry.domComplete - entry.domInteractive,
      },
    };
  }

  private processResourceEntry(
    entry: PerformanceResourceTiming,
  ): PerformanceMetric | null {
    // Only track significant resources (images, scripts, etc.)
    if (
      entry.initiatorType === "img" ||
      entry.initiatorType === "script" ||
      entry.initiatorType === "css"
    ) {
      const loadTime = entry.responseEnd - entry.startTime;

      return {
        name: `resource-load-${entry.initiatorType}`,
        value: loadTime,
        rating:
          loadTime < 1000
            ? "good"
            : loadTime < 3000
              ? "needs-improvement"
              : "poor",
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: this.sessionId,
        metadata: {
          resourceUrl: entry.name,
          size: entry.transferSize,
          cached: entry.transferSize === 0,
        },
      };
    }

    return null;
  }

  private processPaintEntry(entry: PerformanceEntry): PerformanceMetric | null {
    return {
      name: entry.name as "first-paint" | "first-contentful-paint",
      value: entry.startTime,
      rating:
        entry.startTime < 1800
          ? "good"
          : entry.startTime < 3000
            ? "needs-improvement"
            : "poor",
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
    };
  }

  private processMeasureEntry(
    entry: PerformanceMeasure,
  ): PerformanceMetric | null {
    return {
      name: `custom-measure-${entry.name}`,
      value: entry.duration,
      rating:
        entry.duration < 100
          ? "good"
          : entry.duration < 300
            ? "needs-improvement"
            : "poor",
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      metadata: {
        measureName: entry.name,
      },
    };
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      logger.debug(`Performance metric: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        metadata: metric.metadata,
      });
    }

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${metric.name}: ${metric.value}ms (${metric.rating})`,
      level: metric.rating === "poor" ? "warning" : "info",
      data: metric.metadata,
    });

    // Send to API if poor performance
    if (metric.rating === "poor" || metric.name.includes("error")) {
      this.sendMetricToAPI(metric);
    }
  }

  private async sendMetricToAPI(metric: PerformanceMetric) {
    try {
      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      logger.debug("Failed to send performance metric to API", { error });
    }
  }

  // Public methods
  public measureUserTiming(
    name: string,
    fn: () => Promise<any> | any,
  ): Promise<any> {
    const start = performance.now();

    const finish = (result?: any) => {
      const duration = performance.now() - start;
      performance.measure(name, { start, duration });

      logger.performance(name, duration, {
        type: "user-timing",
        result: typeof result,
      });

      return result;
    };

    try {
      const result = fn();
      if (result && typeof result.then === "function") {
        return result.then(finish);
      }
      return Promise.resolve(finish(result));
    } catch (error) {
      finish();
      throw error;
    }
  }

  public markCustomEvent(name: string, metadata?: Record<string, any>) {
    if (this.isClient && "performance" in window) {
      performance.mark(name);
    }

    const metric: PerformanceMetric = {
      name: `custom-event-${name}`,
      value: Date.now(),
      rating: "good",
      timestamp: Date.now(),
      url: this.isClient ? window.location.href : undefined,
      sessionId: this.sessionId,
      metadata,
    };

    this.recordMetric(metric);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public clearMetrics() {
    this.metrics = [];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const measurePerformance =
  performanceMonitor.measureUserTiming.bind(performanceMonitor);
export const markCustomEvent =
  performanceMonitor.markCustomEvent.bind(performanceMonitor);
export const getPerformanceMetrics =
  performanceMonitor.getMetrics.bind(performanceMonitor);
export const getSessionId =
  performanceMonitor.getSessionId.bind(performanceMonitor);
