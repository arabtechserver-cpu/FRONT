"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import AdminReviewsTab from "@/components/admin/tabs/AdminReviewsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <AdminReviewsTab {...context} />;
}
