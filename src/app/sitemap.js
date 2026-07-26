import { API_BASE_URL, SITE_URL } from "@/config";

async function fetchJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error(`Failed to fetch sitemap data from ${url}:`, error);
  }
  return null;
}

export default async function sitemap() {
  const baseUrl = SITE_URL;
  const apiBaseUrl = API_BASE_URL;
  const [categories, services] = await Promise.all([
    fetchJson(`${apiBaseUrl}/api/categories`),
    fetchJson(`${apiBaseUrl}/api/services`)
  ]);

  // Static URLs
  const staticUrls = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryUrlsSource = Array.isArray(categories) && categories.length > 0
    ? categories
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((id) => ({ id }));

  const categoryUrls = categoryUrlsSource.map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const serviceUrlsSource = Array.isArray(services) && services.length > 0
    ? services
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((id) => ({ id }));

  const serviceUrls = serviceUrlsSource.map((service) => ({
    url: `${baseUrl}/service/${service.id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticUrls, ...categoryUrls, ...serviceUrls];
}
