import { useEffect } from "react";
import {
  generateMetaTags,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  injectMetaTags,
  injectSchema,
  type SEOConfig,
} from "../lib/seo";

interface SEOHeadProps {
  config: SEOConfig;
  includeLocalBusiness?: boolean;
  includeOrganization?: boolean;
}

/**
 * SEO Head Component
 * Injects meta tags and structured data into document head
 */
export function SEOHead({
  config,
  includeLocalBusiness = true,
  includeOrganization = true,
}: SEOHeadProps) {
  useEffect(() => {
    // Inject meta tags
    const metaTags = generateMetaTags(config);
    injectMetaTags(metaTags);

    // Inject Organization schema
    if (includeOrganization) {
      const orgSchema = generateOrganizationSchema();
      injectSchema(orgSchema);
    }

    // Inject LocalBusiness schema
    if (includeLocalBusiness) {
      const localBusinessSchema = generateLocalBusinessSchema({
        name: "Pooja Jewellers",
        address: {
          streetAddress: "Gittikhadan",
          addressLocality: "Nagpur",
          addressRegion: "Maharashtra",
          postalCode: "440001",
          addressCountry: "IN",
        },
        telephone: "+91-XXXXXXXXXX",
        url: "https://pooja-jewellers-nagpur.web.app",
        priceRange: "₹₹₹",
        geo: {
          latitude: 21.1458,
          longitude: 79.0882,
        },
        sameAs: [
          "https://www.instagram.com/pooja_jewellers_nagpur",
          "https://www.facebook.com/pooja-jewellers-nagpur",
        ],
      });
      injectSchema(localBusinessSchema);
    }
  }, [config, includeLocalBusiness, includeOrganization]);

  return null;
}
