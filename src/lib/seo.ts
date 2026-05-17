/**
 * SEO Utilities for Pooja Jewellers
 * Handles meta tags, structured data, and SEO optimization
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export interface LocalBusinessSchema {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email?: string;
  url: string;
  image?: string;
  priceRange: string;
  openingHoursSpecification?: Array<{
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  sameAs?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Generate meta tags for SEO
 */
export function generateMetaTags(config: SEOConfig): Record<string, string> {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(", ") || "",
    "og:title": config.title,
    "og:description": config.description,
    "og:image": config.image || "https://poojajewellers.vercel.app/og-image.jpg",
    "og:url": config.url || "https://poojajewellers.vercel.app",
    "og:type": config.type || "website",
    "og:locale": "en_IN",
    "twitter:card": "summary_large_image",
    "twitter:title": config.title,
    "twitter:description": config.description,
    "twitter:image": config.image || "https://poojajewellers.vercel.app/og-image.jpg",
    "twitter:site": "@pooja_jewellers_nagpur",
    "canonical": config.url || "https://poojajewellers.vercel.app",
    "viewport": "width=device-width, initial-scale=1.0",
    "charset": "UTF-8",
    "language": "en",
    "robots": "index, follow",
    "author": config.author || "Pooja Jewellers",
  };
}

/**
 * Generate LocalBusiness JSON-LD schema
 */
export function generateLocalBusinessSchema(
  business: LocalBusinessSchema
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://poojajewellers.vercel.app",
    name: business.name,
    image: business.image || "https://poojajewellers.vercel.app/logo.png",
    description:
      "Premium Gold and Silver jewelry store in Gittikhadan, Nagpur. Discover timeless elegance at Pooja Jewellers.",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry,
    },
    telephone: business.telephone,
    email: business.email,
    url: business.url,
    priceRange: business.priceRange,
    geo: business.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: business.geo.latitude,
          longitude: business.geo.longitude,
        }
      : undefined,
    sameAs: business.sameAs || [
      "https://www.instagram.com/pooja_jewellers_nagpur",
      "https://www.facebook.com/pooja-jewellers-nagpur",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: business.telephone,
    },
    openingHoursSpecification: business.openingHoursSpecification,
  };
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pooja Jewellers",
    url: "https://poojajewellers.vercel.app",
    logo: "https://poojajewellers.vercel.app/logo.png",
    description:
      "Premium Gold and Silver jewelry store in Gittikhadan, Nagpur",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gittikhadan",
      addressLocality: "Nagpur",
      addressRegion: "Maharashtra",
      postalCode: "440001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: "+91-9960184674",
    },
    sameAs: [
      "https://www.instagram.com/pooja_jewellers_nagpur",
      "https://www.facebook.com/pooja-jewellers-nagpur",
    ],
  };
}

/**
 * Generate Product JSON-LD schema
 */
export function generateProductSchema(product: {
  name: string;
  description?: string;
  image: string;
  material?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    description:
      product.description ||
      `Beautiful ${product.material || "jewelry"} piece from Pooja Jewellers`,
    brand: {
      "@type": "Brand",
      name: "Pooja Jewellers",
    },
    offers: {
      "@type": "Offer",
      url: "https://poojajewellers.vercel.app",
      priceCurrency: "INR",
      price: product.price || "Contact for pricing",
      availability: "https://schema.org/InStock",
    },
  };

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Review JSON-LD schema
 */
export function generateReviewSchema(review: {
  author: string;
  rating: number;
  text: string;
  date?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: review.date || new Date().toISOString().split("T")[0],
  };
}

/**
 * Generate AggregateRating JSON-LD schema
 */
export function generateAggregateRatingSchema(
  reviews: Array<{ rating: number }>
): Record<string, unknown> {
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: Math.round(averageRating * 10) / 10,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Inject meta tags into document head
 */
export function injectMetaTags(tags: Record<string, string>): void {
  if (typeof document === "undefined") return;

  Object.entries(tags).forEach(([key, value]) => {
    if (!value) return;

    if (key === "title") {
      document.title = value;
    } else if (key === "canonical") {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = value;
    } else if (key.startsWith("og:") || key.startsWith("twitter:")) {
      let meta = document.querySelector(`meta[property="${key}"]`);
      if (!meta) {
        meta = document.querySelector(`meta[name="${key}"]`);
      }
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", key);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", value);
    } else {
      let meta = document.querySelector(`meta[name="${key}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = key;
        document.head.appendChild(meta);
      }
      meta.content = value;
    }
  });
}

/**
 * Inject JSON-LD schema into document head
 */
export function injectSchema(schema: Record<string, unknown>): void {
  if (typeof document === "undefined") return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(
  pages: Array<{
    url: string;
    lastmod?: string;
    changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
  }>
): string {
  const baseUrl = "https://poojajewellers.vercel.app";

  const urlEntries = pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ""}
    ${page.priority ? `<priority>${page.priority}</priority>` : ""}
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Get location-specific keywords
 */
export function getLocationKeywords(): string[] {
  return [
    "Pooja Jewellers",
    "Pooja Jewellers Nagpur",
    "Pooja Jewellers Gittikhadan",
    "jewelry store Nagpur",
    "gold jewelry Nagpur",
    "silver jewelry Nagpur",
    "jewelry store Gittikhadan",
    "best jeweller in Nagpur",
    "gold jeweller Nagpur",
    "traditional jewelry Nagpur",
  ];
}

/**
 * Get product category keywords
 */
export function getCategoryKeywords(category: string): string[] {
  const baseKeywords = [
    `${category} Nagpur`,
    `${category} Gittikhadan`,
    `buy ${category.toLowerCase()} online`,
    `${category.toLowerCase()} designs`,
    `traditional ${category.toLowerCase()}`,
  ];

  const categorySpecific: Record<string, string[]> = {
    Necklaces: [
      "gold necklace designs",
      "silver necklace",
      "wedding necklace",
      "traditional necklace",
    ],
    Earrings: [
      "gold earrings",
      "silver earrings",
      "stud earrings",
      "traditional earrings",
    ],
    Bangles: [
      "gold bangles",
      "silver bangles",
      "bangle designs",
      "traditional bangles",
    ],
    Rings: [
      "gold rings",
      "silver rings",
      "engagement rings",
      "traditional rings",
    ],
    Bracelets: [
      "gold bracelets",
      "silver bracelets",
      "bracelet designs",
      "traditional bracelets",
    ],
    Pendants: [
      "gold pendants",
      "silver pendants",
      "pendant designs",
      "traditional pendants",
    ],
    Diamond: [
      "diamond jewelry",
      "diamond necklace",
      "diamond earrings",
      "diamond rings",
    ],
  };

  return [...baseKeywords, ...(categorySpecific[category] || [])];
}
