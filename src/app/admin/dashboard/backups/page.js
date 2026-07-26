"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import BackupsTab from "@/components/admin/tabs/BackupsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <BackupsTab {...context} />;
}
