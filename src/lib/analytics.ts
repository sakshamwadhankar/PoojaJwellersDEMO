/**
 * Analytics Integration for Pooja Jewellers
 * Integrates Google Analytics 4 and tracks user events
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Initialize Google Analytics 4
 */
export function initializeGA4(measurementId: string): void {
  if (typeof window === "undefined") return;

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", measurementId, {
    page_path: window.location.pathname,
    page_title: document.title,
  });

  window.gtag = gtag;
}

/**
 * Track page view
 */
export function trackPageView(
  pagePath: string,
  pageTitle: string
): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", eventName, eventData || {});
}

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string;
  name: string;
  category: string;
  material?: string;
}): void {
  trackEvent("view_item", {
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: product.material,
      },
    ],
  });
}

/**
 * Track collection view
 */
export function trackCollectionView(category: string): void {
  trackEvent("view_item_list", {
    items: [
      {
        item_category: category,
      },
    ],
  });
}

/**
 * Track contact form submission
 */
export function trackContactSubmission(data: {
  name: string;
  email: string;
  message: string;
}): void {
  trackEvent("contact_form_submit", {
    form_name: "contact",
    user_name: data.name,
    user_email: data.email,
  });
}

/**
 * Track social media click
 */
export function trackSocialClick(platform: string): void {
  trackEvent("social_click", {
    platform: platform,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string): void {
  trackEvent("search", {
    search_term: searchTerm,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(): void {
  if (typeof window === "undefined") return;

  let maxScroll = 0;

  window.addEventListener("scroll", () => {
    const scrollPercentage =
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;

      // Track at 25%, 50%, 75%, 100%
      if (maxScroll >= 25 && maxScroll < 50) {
        trackEvent("scroll_depth", { depth: "25%" });
      } else if (maxScroll >= 50 && maxScroll < 75) {
        trackEvent("scroll_depth", { depth: "50%" });
      } else if (maxScroll >= 75 && maxScroll < 100) {
        trackEvent("scroll_depth", { depth: "75%" });
      } else if (maxScroll >= 100) {
        trackEvent("scroll_depth", { depth: "100%" });
      }
    }
  });
}

/**
 * Track time on page
 */
export function trackTimeOnPage(pageName: string): void {
  if (typeof window === "undefined") return;

  const startTime = Date.now();

  window.addEventListener("beforeunload", () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    trackEvent("time_on_page", {
      page_name: pageName,
      time_seconds: timeOnPage,
    });
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("set", properties);
}

/**
 * Track conversion
 */
export function trackConversion(conversionId: string, value?: number): void {
  trackEvent("conversion", {
    conversion_id: conversionId,
    value: value,
  });
}
