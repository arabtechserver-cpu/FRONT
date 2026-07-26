"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import ServicesTab from "@/components/admin/tabs/ServicesTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <ServicesTab {...context} />;
}
