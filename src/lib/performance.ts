/**
 * Performance Optimization Utilities for Pooja Jewellers
 * Monitors and optimizes Core Web Vitals and page load performance
 */

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // Monitor LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver(() => {});
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch {
    /* PerformanceObserver entry type is not supported in this browser. */
  }

  // Monitor FID (First Input Delay)
  try {
    const fidObserver = new PerformanceObserver(() => {});
    fidObserver.observe({ entryTypes: ["first-input"] });
  } catch {
    /* PerformanceObserver entry type is not supported in this browser. */
  }

  // Monitor CLS (Cumulative Layout Shift)
  try {
    const clsObserver = new PerformanceObserver(() => {});
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  } catch {
    /* PerformanceObserver entry type is not supported in this browser. */
  }
}

/**
 * Get Core Web Vitals metrics
 */
export function getCoreWebVitals(): CoreWebVitals {
  if (typeof window === "undefined") {
    return {};
  }

  const vitals: CoreWebVitals = {};

  // Get Navigation Timing
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (navigation) {
    vitals.ttfb = navigation.responseStart - navigation.fetchStart;
  }

  return vitals;
}

/**
 * Optimize resource loading
 */
export function optimizeResourceLoading(): void {
  if (typeof document === "undefined") return;

  // Defer non-critical JavaScript
  const scripts = document.querySelectorAll("script[data-defer]");
  scripts.forEach((script) => {
    script.setAttribute("defer", "");
  });

  // Async load analytics and tracking scripts
  const analyticsScripts = document.querySelectorAll("script[data-async]");
  analyticsScripts.forEach((script) => {
    script.setAttribute("async", "");
  });
}

/**
 * Implement resource hints
 */
export function implementResourceHints(): void {
  if (typeof document === "undefined") return;

  // Preconnect to critical third-party origins
  const criticalOrigins = [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];

  criticalOrigins.forEach((origin) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    if (origin.includes("gstatic")) {
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
  });
}

/**
 * Measure page load time
 */
export function measurePageLoadTime(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (navigation) {
    return navigation.loadEventEnd - navigation.fetchStart;
  }

  return 0;
}

/**
 * Get resource timing information
 */
export function getResourceTiming(): Array<{
  name: string;
  duration: number;
  size: number;
}> {
  if (typeof window === "undefined") {
    return [];
  }

  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  return resources.map((resource) => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.transferSize || 0,
  }));
}

/**
 * Optimize CSS delivery
 */
export function optimizeCSSDelivery(): void {
  if (typeof document === "undefined") return;

  // Inline critical CSS
  const criticalCSS = document.querySelector("style[data-critical]");
  if (criticalCSS) {
    // Move to head
    document.head.appendChild(criticalCSS);
  }

  // Defer non-critical CSS
  const stylesheets = document.querySelectorAll("link[rel='stylesheet'][data-defer]");
  stylesheets.forEach((link) => {
    const media = link.getAttribute("data-media") || "print";
    link.setAttribute("media", media);
    link.onload = function () {
      this.media = "all";
    };
  });
}

/**
 * Implement lazy loading for images
 */
export function implementLazyLoading(): void {
  if (typeof document === "undefined") return;

  const images = document.querySelectorAll("img[loading='lazy']");
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || img.src;
          img.srcset = img.dataset.srcset || img.srcset;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

/**
 * Monitor performance metrics
 */
export function monitorPerformanceMetrics(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    const pageLoadTime = measurePageLoadTime();

    // Send to analytics if available
    if (window.gtag) {
      window.gtag("event", "page_load_time", {
        value: Math.round(pageLoadTime),
      });
    }
  });
}

/**
 * Get performance recommendations
 */
export function getPerformanceRecommendations(): string[] {
  return [
    "Reduce JavaScript bundle size below 200KB",
    "Implement code splitting for route-based chunks",
    "Enable Gzip or Brotli compression for text resources",
    "Use CDN for serving static assets",
    "Implement browser caching with appropriate cache-control headers",
    "Optimize images with WebP format and responsive srcset",
    "Defer non-critical JavaScript loading",
    "Inline critical CSS for above-the-fold content",
    "Preload critical resources using link rel='preload'",
    "Implement service worker for offline caching",
    "Monitor Core Web Vitals using Real User Monitoring",
    "Minimize HTTP requests by combining resources",
    "Use async or defer attributes on script tags",
    "Implement lazy loading for images and components",
    "Optimize third-party scripts loading",
  ];
}
