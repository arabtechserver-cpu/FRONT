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
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button 
            className="admin-burger-btn" 
            onClick={() => setAdminDrawerOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
          <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "white" }}>لوحة التحكم</span>
        </div>
      </div>

      <div className="admin-scrollable-area">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <div className="admin-dashboard-root" dir="rtl" data-theme="dark">
        <style jsx global>{dashboardStyles}</style>
        <AdminSidebar />
        <MainContent>{children}</MainContent>
        <AdminDashboardModals />
      </div>
    </DashboardProvider>
  );
}
