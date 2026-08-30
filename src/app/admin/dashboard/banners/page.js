"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import BannersTab from "@/components/admin/tabs/BannersTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <BannersTab {...context} />;
}
