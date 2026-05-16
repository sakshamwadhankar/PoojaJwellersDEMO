/**
 * Image Optimization Utilities for Pooja Jewellers
 * Handles responsive images, lazy loading, and alt text
 */

export interface ResponsiveImageConfig {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  className?: string;
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseSrc: string,
  sizes: number[] = [320, 640, 1024, 1920]
): string {
  return sizes
    .map((size) => {
      // For Firebase Storage URLs, append size parameter
      const separator = baseSrc.includes("?") ? "&" : "?";
      return `${baseSrc}${separator}w=${size} ${size}w`;
    })
    .join(", ");
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: Array<{ maxWidth: number; size: string }> = [
    { maxWidth: 640, size: "100vw" },
    { maxWidth: 1024, size: "50vw" },
    { maxWidth: 1920, size: "33vw" },
  ]
): string {
  return breakpoints
    .map((bp) => `(max-width: ${bp.maxWidth}px) ${bp.size}`)
    .concat(["100vw"])
    .join(", ");
}

/**
 * Generate optimized image attributes
 */
export function generateImageAttributes(
  config: ResponsiveImageConfig
): Record<string, string | number | undefined> {
  return {
    src: config.src,
    alt: config.alt,
    title: config.title,
    width: config.width,
    height: config.height,
    sizes: config.sizes || generateSizes(),
    srcSet: config.srcSet || generateSrcSet(config.src),
    loading: config.loading || "lazy",
    decoding: config.decoding || "async",
    className: config.className,
  };
}

/**
 * Get alt text for jewelry products
 */
export function getProductAltText(product: {
  name: string;
  material?: string;
  category?: string;
}): string {
  const parts = [product.name];
  if (product.material) parts.push(`${product.material} jewelry`);
  if (product.category) parts.push(`from ${product.category} collection`);
  return parts.join(" - ");
}

/**
 * Get alt text for category images
 */
export function getCategoryAltText(category: string): string {
  return `${category} jewelry collection from Pooja Jewellers Nagpur`;
}

/**
 * Get alt text for hero images
 */
export function getHeroAltText(): string {
  return "Pooja Jewellers - Premium Gold and Silver Jewelry Store in Gittikhadan, Nagpur";
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Prefetch images
 */
export function prefetchImage(src: string): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Generate WebP image with fallback
 */
export function generateImageWithFallback(
  webpSrc: string,
  fallbackSrc: string,
  alt: string,
  className?: string
): string {
  return `
    <picture>
      <source srcset="${webpSrc}" type="image/webp">
      <img src="${fallbackSrc}" alt="${alt}" class="${className || ''}" loading="lazy" decoding="async">
    </picture>
  `;
}

/**
 * Calculate image dimensions maintaining aspect ratio
 */
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } {
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
}

/**
 * Get image optimization recommendations
 */
export function getImageOptimizationTips(): string[] {
  return [
    "Use WebP format with JPEG fallback for better compression",
    "Implement lazy loading for images below the fold",
    "Generate responsive srcset for different screen sizes",
    "Compress images to reduce file size by at least 60%",
    "Include descriptive alt text for all images",
    "Set explicit width and height to prevent layout shift",
    "Preload critical above-the-fold images",
    "Use CDN for serving images with low latency",
    "Implement progressive image loading for better UX",
    "Monitor image performance using Core Web Vitals",
  ];
}
