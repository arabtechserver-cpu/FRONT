"use client";
import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import GmailTab from "@/components/admin/tabs/GmailTab";

export default function Page() {
  const context = useContext(AdminDashboardContext);
  return <GmailTab {...context} />;
}
