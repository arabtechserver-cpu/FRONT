"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import SettingsTab from "@/components/admin/tabs/SettingsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <SettingsTab {...context} />;
}
