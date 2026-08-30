"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import FeaturedSectionsTab from "@/components/admin/tabs/FeaturedSectionsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return (
    <FeaturedSectionsTab
      featuredSections={context.featuredSections}
      setFeaturedSections={context.setFeaturedSections}
      token={context.token}
      categories={context.categories}
      services={context.services}
    />
  );
}
