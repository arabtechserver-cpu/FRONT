"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import MenuDrawerTab from "@/components/admin/tabs/MenuDrawerTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <MenuDrawerTab {...context} />;
}
