import { SITE_URL } from "@/config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin/login",
        "/api/",
        "/orders/",
        "/wallet/"
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
