"use client";

import dashboardStyles from "./AdminDashboardClient.styles";
import DashboardProvider from "@/components/admin/DashboardProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboardModals from "@/components/admin/modals/AdminDashboardModals";
import { useContext } from "react";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";

function MainContent({ children }) {
  const { setAdminDrawerOpen, adminUser, handleLogout } = useContext(AdminDashboardContext);
  return (
    <div className="admin-main-content">
      <div className="admin-scrollable-area">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <div className="admin-dashboard-root" dir="rtl">
        <style jsx global>{dashboardStyles}</style>
        <AdminSidebar />
        <MainContent>{children}</MainContent>
        <AdminDashboardModals />
      </div>
    </DashboardProvider>
  );
}
