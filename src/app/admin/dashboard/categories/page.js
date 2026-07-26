"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import CategoriesTab from "@/components/admin/tabs/CategoriesTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <CategoriesTab {...context} />;
}
