"use client";

import { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import AnalyticsTab from "@/components/admin/tabs/AnalyticsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <AnalyticsTab {...context} />;
}
