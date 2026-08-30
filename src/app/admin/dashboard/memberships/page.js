"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import MembershipsTab from "@/components/admin/tabs/MembershipsTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <MembershipsTab {...context} />;
}
