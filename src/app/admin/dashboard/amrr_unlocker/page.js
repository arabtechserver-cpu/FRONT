"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import AmrrUnlockerTab from "@/components/admin/tabs/AmrrUnlockerTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <AmrrUnlockerTab {...context} />;
}
