import ServicesClient from "../../services/ServicesClient";
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
    title: "Server Service Reseller Pricing | أسعار خدمات السيرفر",
    description: "Wholesale reseller pricing for Box Tool Activations, Credits, and Digital Gift Cards.",
    alternates: {
      canonical: `${SITE_URL}/resellerpricing/server`
    }
  };
}

export default async function ServerPricingPage() {
  const { categories, services } = await getCategoriesAndServices();

  return (
    <ServicesClient
      initialCategories={categories}
      initialServices={services}
      isHome={false}
      defaultType="server"
    />
  );
}
