"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import ApiResellersTab from "@/components/admin/tabs/ApiResellersTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <ApiResellersTab {...context} />;
}
