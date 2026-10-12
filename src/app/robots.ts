import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const commonDisallowed = [
    "/admin",
    "/admin/*",
    "/api/*",
    "/wallet",
    "/ar/wallet",
    "/en/wallet",
    "/ar/admin",
    "/en/admin",
    "/ar/admin/*",
    "/en/admin/*",
  ];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://borai.store";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: commonDisallowed,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/wallet",
        ],
      },
      // Explicit rules for AI Search Engines (GEO / AI SEO)
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
          "CCBot",
          "Bytespider",
          "OAI-SearchBot",
          "Diffbot",
        ],
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/wallet",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

