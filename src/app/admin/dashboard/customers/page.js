"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import CustomersTab from "@/components/admin/tabs/CustomersTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <CustomersTab {...context} />;
}
