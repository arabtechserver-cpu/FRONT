"use client";

import React, { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import ExchangeRatesTab from "@/components/admin/tabs/ExchangeRatesTab";

export default function Page() {
  const { token } = useContext(AdminDashboardContext);
  return <ExchangeRatesTab token={token} />;
}
