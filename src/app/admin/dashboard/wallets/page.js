"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import WalletsTab from "@/components/admin/tabs/WalletsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <WalletsTab {...context} />;
}
