/**
 * Sitemap Generator for Pooja Jewellers
 * Generates XML sitemap for search engine crawlers
 */

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate sitemap XML content
 */
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const baseUrl = "https://poojajewellersngp.com";

  const urlEntries = entries
    .map((entry) => {
      const url = entry.url.startsWith("http") ? entry.url : `${baseUrl}${entry.url}`;
      return `  <url>
    <loc>${escapeXml(url)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ""}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ""}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate default sitemap entries for static pages
 */
export function getDefaultSitemapEntries(): SitemapEntry[] {
  const today = new Date().toISOString().split("T")[0];

  return [
    {
      url: "/",
      lastmod: today,
      changefreq: "daily",
      priority: 1.0,
    },
    {
      url: "/collections",
      lastmod: today,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      url: "/about",
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: "/contact",
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: "/privacy",
      lastmod: today,
      changefreq: "yearly",
      priority: 0.5,
    },
    {
      url: "/terms",
      lastmod: today,
      changefreq: "yearly",
      priority: 0.5,
    },
  ];
}

/**
 * Generate category page sitemap entries
 */
export function getCategorySitemapEntries(
  categories: string[]
): SitemapEntry[] {
  const today = new Date().toISOString().split("T")[0];

  return categories.map((category) => ({
    url: `/collections/${category.toLowerCase().replace(/\s+/g, "-")}`,
    lastmod: today,
    changefreq: "weekly",
    priority: 0.8,
  }));
}

/**
 * Generate product page sitemap entries
 */
export function getProductSitemapEntries(
  products: Array<{ id: string; name: string; category: string }>
): SitemapEntry[] {
  const today = new Date().toISOString().split("T")[0];

  return products.map((product) => ({
    url: `/product/${product.id}`,
    lastmod: today,
    changefreq: "monthly",
    priority: 0.6,
  }));
}

/**
 * Combine all sitemap entries
 */
export function combineSitemapEntries(
  ...entryArrays: SitemapEntry[][]
): SitemapEntry[] {
  const combined = entryArrays.flat();
  // Remove duplicates based on URL
  const seen = new Set<string>();
  return combined.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
