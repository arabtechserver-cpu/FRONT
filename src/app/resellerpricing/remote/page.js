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
    title: "Remote Unlock Reseller Pricing | SK-unlocker - أسعار خدمات الريموت",
    description: "Wholesale reseller pricing for Remote FRP Unlock and Technician Services on SK-unlocker. Professional remote unlocking at best rates.",
    keywords: ["SK-unlocker remote reseller", "FRP unlock wholesale", "remote unlock reseller", "technician services wholesale", "remote FRP price"],
    alternates: {
      canonical: `${SITE_URL}/resellerpricing/remote`
    }
  };
}

export default async function RemotePricingPage() {
  const { categories, services } = await getCategoriesAndServices();

  return (
    <ServicesClient
      initialCategories={categories}
      initialServices={services}
      isHome={false}
      defaultType="remote"
    />
  );
}
