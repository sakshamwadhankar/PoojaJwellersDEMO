# SEO Quick Start Guide - Pooja Jewellers

## Quick Setup (5 minutes)

### 1. Update Business Information

Edit `src/components/SEOHead.tsx` and `index.html`:

```typescript
// Replace with actual phone number
telephone: "+91-XXXXXXXXXX"

// Replace with actual email
email: "contact@pooja-jewellers.com"
```

### 2. Configure Google Analytics

```typescript
// In your main app component
import { initializeGA4, trackPageView } from "@/lib/analytics";

// Initialize with your measurement ID
initializeGA4("G-XXXXXXXXXX"); // Replace with your GA4 ID

// Track page views
useEffect(() => {
  trackPageView(window.location.pathname, document.title);
}, []);
```

### 3. Verify Google Business Profile

1. Go to [Google Business Profile](https://business.google.com)
2. Claim your business
3. Verify ownership
4. Complete all business information
5. Add photos and posts regularly

### 4. Submit Sitemap to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://poojajewellers.vercel.app`
3. Verify ownership (use HTML meta tag from index.html)
4. Go to Sitemaps section
5. Submit: `https://poojajewellers.vercel.app/sitemap.xml`

## Using SEO Utilities

### Meta Tags & Structured Data

```typescript
import { SEOHead } from "@/components/SEOHead";

export function HomePage() {
  return (
    <>
      <SEOHead
        config={{
          title: "Pooja Jewellers Gittikhadan | Premium Gold & Silver Jewelry in Nagpur",
          description: "Premium Gold and Silver jewelry store in Gittikhadan, Nagpur. Discover timeless elegance, handcrafted designs, and traditional jewelry at Pooja Jewellers.",
          keywords: ["Pooja Jewellers", "jewelry store Nagpur", "gold jewelry"],
          image: "/images/hero.jpg",
          url: "https://poojajewellers.vercel.app",
          type: "website"
        }}
      />
      {/* Page content */}
    </>
  );
}
```

### Product Schema

```typescript
import { generateProductSchema, injectSchema } from "@/lib/seo";

const productSchema = generateProductSchema({
  name: "Gold Necklace",
  description: "Beautiful 22k gold necklace with traditional design",
  image: "/images/necklace.jpg",
  material: "Gold",
  price: "₹25,000",
  rating: 4.8,
  reviewCount: 45
});

injectSchema(productSchema);
```

### Image Optimization

```typescript
import { generateImageAttributes, getProductAltText } from "@/lib/imageOptimization";

const imgAttrs = generateImageAttributes({
  src: "/images/product.jpg",
  alt: getProductAltText({
    name: "Gold Necklace",
    material: "Gold",
    category: "Necklaces"
  }),
  loading: "lazy"
});

<img {...imgAttrs} />
```

### Analytics Tracking

```typescript
import {
  trackProductView,
  trackCollectionView,
  trackContactSubmission,
  trackSocialClick
} from "@/lib/analytics";

// Track product view
trackProductView({
  id: "product-123",
  name: "Gold Necklace",
  category: "Necklaces",
  material: "Gold"
});

// Track collection view
trackCollectionView("Necklaces");

// Track contact form
trackContactSubmission({
  name: "John Doe",
  email: "john@example.com",
  message: "Interested in custom jewelry"
});

// Track social click
trackSocialClick("instagram");
```

### Performance Monitoring

```typescript
import {
  initializePerformanceMonitoring,
  getCoreWebVitals,
  measurePageLoadTime
} from "@/lib/performance";

// Initialize monitoring
useEffect(() => {
  initializePerformanceMonitoring();
}, []);

// Get metrics
const vitals = getCoreWebVitals();
const loadTime = measurePageLoadTime();
```

## SEO Checklist

### On-Page SEO
- [ ] Unique title tag (50-60 chars) with primary keyword
- [ ] Unique meta description (150-160 chars) with CTA
- [ ] Single H1 tag with primary keyword
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Descriptive alt text for all images
- [ ] Internal links with descriptive anchor text
- [ ] Mobile-responsive design
- [ ] Fast page load time (< 3 seconds)

### Technical SEO
- [ ] HTTPS enabled
- [ ] XML sitemap created and submitted
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Meta robots tag: "index, follow"
- [ ] Structured data markup (JSON-LD)
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Mobile-friendly design

### Local SEO
- [ ] Business name, address, phone consistent
- [ ] LocalBusiness schema markup
- [ ] Geo meta tags
- [ ] Google Business Profile claimed
- [ ] Location-specific keywords in content
- [ ] Local citations and directories
- [ ] Customer reviews and ratings

### Content SEO
- [ ] Keyword research completed
- [ ] Target keywords in title, description, H1
- [ ] 300+ words per page
- [ ] Natural keyword usage (no stuffing)
- [ ] Related internal links
- [ ] Fresh, updated content
- [ ] FAQ sections
- [ ] User-focused content

### Analytics & Monitoring
- [ ] Google Analytics 4 configured
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Event tracking implemented
- [ ] Conversion tracking set up
- [ ] Core Web Vitals monitored
- [ ] Search rankings tracked

## Common Tasks

### Add New Product Page

```typescript
import { SEOHead } from "@/components/SEOHead";
import { generateProductSchema, injectSchema } from "@/lib/seo";
import { generateImageAttributes, getProductAltText } from "@/lib/imageOptimization";

export function ProductPage({ product }) {
  useEffect(() => {
    const schema = generateProductSchema({
      name: product.name,
      description: product.description,
      image: product.image,
      material: product.material,
      price: product.price,
      rating: product.rating,
      reviewCount: product.reviewCount
    });
    injectSchema(schema);
  }, [product]);

  return (
    <>
      <SEOHead
        config={{
          title: `${product.name} | Pooja Jewellers Gittikhadan`,
          description: `Buy ${product.name} at Pooja Jewellers. Premium ${product.material} jewelry in Gittikhadan, Nagpur.`,
          keywords: [product.name, product.material, "jewelry Nagpur"],
          image: product.image,
          url: `https://poojajewellers.vercel.app/product/${product.id}`
        }}
      />
      <img {...generateImageAttributes({
        src: product.image,
        alt: getProductAltText(product)
      })} />
    </>
  );
}
```

### Add New Category Page

```typescript
import { getCategoryKeywords } from "@/lib/seo";

export function CategoryPage({ category }) {
  const keywords = getCategoryKeywords(category);

  return (
    <SEOHead
      config={{
        title: `${category} Jewelry in Nagpur | Pooja Jewellers Gittikhadan`,
        description: `Explore our collection of ${category.toLowerCase()} jewelry. Premium gold and silver designs at Pooja Jewellers, Gittikhadan, Nagpur.`,
        keywords: keywords,
        type: "website"
      }}
    />
  );
}
```

### Track Custom Event

```typescript
import { trackEvent } from "@/lib/analytics";

// Track custom event
trackEvent("jewelry_customization", {
  category: "Necklaces",
  customization_type: "engraving",
  value: 5000
});
```

## Performance Optimization Tips

### Image Optimization
```typescript
// Use responsive images
<img
  src="/images/product.jpg"
  srcSet="/images/product-320w.jpg 320w, /images/product-640w.jpg 640w"
  sizes="(max-width: 640px) 100vw, 50vw"
  alt="Product description"
  loading="lazy"
  decoding="async"
/>
```

### Lazy Loading
```typescript
// Implement lazy loading for images
<img src="/images/product.jpg" loading="lazy" alt="Product" />
```

### Code Splitting
```typescript
// Use dynamic imports for route-based code splitting
const ProductPage = lazy(() => import("./ProductPage"));
```

## Monitoring & Reporting

### Key Metrics to Track
- Organic traffic (sessions, users)
- Keyword rankings (top 10, top 20, top 50)
- Click-through rate (CTR)
- Average position in search results
- Conversion rate
- Page load time
- Core Web Vitals (LCP, FID, CLS)
- Bounce rate
- Time on page

### Monthly Reporting
1. Check Google Search Console for ranking changes
2. Review Google Analytics for traffic trends
3. Monitor Core Web Vitals
4. Check competitor rankings
5. Analyze top-performing pages
6. Identify content gaps
7. Plan content updates

## Troubleshooting

### Schema Markup Not Showing
1. Validate with [Rich Results Test](https://search.google.com/test/rich-results)
2. Check JSON-LD syntax
3. Ensure schema is in document head
4. Wait 24-48 hours for Google to reprocess

### Low Rankings
1. Check keyword difficulty
2. Analyze competitor content
3. Improve content quality and depth
4. Build high-quality backlinks
5. Optimize for user intent
6. Improve page load speed

### Low Organic Traffic
1. Check indexation in Search Console
2. Verify robots.txt allows crawling
3. Check for crawl errors
4. Improve content quality
5. Optimize for search intent
6. Build internal links

## Resources

- [SEO_IMPLEMENTATION.md](./SEO_IMPLEMENTATION.md) - Comprehensive implementation guide
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [Web.dev](https://web.dev)

## Support

For questions or issues:
1. Check the SEO_IMPLEMENTATION.md file
2. Review the utility functions in `src/lib/`
3. Check Google Search Central documentation
4. Consult with SEO specialist if needed

---

**Last Updated**: May 17, 2026
**Version**: 1.0
