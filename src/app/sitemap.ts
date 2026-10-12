import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";
  const locales = ["ar", "en"];
  const staticRoutes = [
    "",
    "/pricing",
    "/services",
    "/gaming",
    "/orders",
    "/purchase",
    "/terms",
    "/refund",
    "/login",
    "/register",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Root base entry
  sitemapEntries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  // 2. Localized static routes
  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" || route === "/pricing" || route === "/purchase" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route === "/pricing" || route === "/purchase" ? 0.9 : 0.7,
      });
    }
  }

  // 3. Dynamic Services from API for Google Indexing
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/dhru/services?view=pricing`, { cache: "no-store" });
    if (res.ok) {
      const categories = await res.json();
      if (Array.isArray(categories)) {
        for (const cat of categories) {
          if (Array.isArray(cat.services)) {
            for (const srv of cat.services) {
              if (srv.id && srv.isActive !== false) {
                for (const locale of locales) {
                  sitemapEntries.push({
                    url: `${baseUrl}/${locale}/purchase?serviceId=${encodeURIComponent(srv.id)}`,
                    lastModified: new Date(),
                    changeFrequency: "weekly",
                    priority: 0.8,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    // If backend is unreachable during build, fallback gracefully to static routes
  }

  return sitemapEntries;
}
