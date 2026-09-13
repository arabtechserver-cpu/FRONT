import ServicesClient from "../services/ServicesClient";
import { API_BASE_URL, SITE_URL } from "@/config";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getCategoriesAndServices = cache(async function getCategoriesAndServices() {
  try {
    const [catRes, serviceRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/api/services`, { cache: "no-store" })
    ]);
    if (catRes.ok && serviceRes.ok) {
      return {
        categories: await catRes.json(),
        services: await serviceRes.json()
      };
    }
  } catch (e) {
    console.error("Error fetching categories and services:", e);
  }
  return { categories: [], services: [] };
});

export async function generateMetadata() {
  return {
    title: "Reseller Pricing | أسعار الموزعين",
    description: "Check our wholesale reseller pricing for IMEI, Server, and Remote unlocking services.",
    alternates: {
      canonical: `${SITE_URL}/resellerpricing`
    }
  };
}

export default async function ResellerPricingPage() {
  const { categories, services } = await getCategoriesAndServices();

  return (
    <ServicesClient
      initialCategories={categories}
      initialServices={services}
      isHome={false}
    />
  );
}
