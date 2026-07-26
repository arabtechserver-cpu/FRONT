"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import OrdersTab from "@/components/admin/tabs/OrdersTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <OrdersTab {...context} />;
}
