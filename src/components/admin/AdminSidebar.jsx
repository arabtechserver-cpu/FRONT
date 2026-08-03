"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import { FEATURES } from "@/features";
import { API_BASE_URL } from "@/config";

export default function AdminSidebar() {
  const context = useContext(AdminDashboardContext);
  const { 
    adminDrawerOpen, setAdminDrawerOpen, adminUser, handleLogout,
    siteName, siteLogo, API_BASE_URL
  } = context;
  
  const pathname = usePathname();

  const allTabs = [
    { tab: "orders", icon: "📥", label: "طلبات الخدمات" },
    { tab: "menu-drawer", icon: "📱", label: "قائمة الموبايل الجانبية" },
    { tab: "categories", icon: "📁", label: "إدارة الأقسام" },
    { tab: "services", icon: "⚡", label: "إدارة الخدمات" },
    { tab: "api-providers", icon: "🔌", label: "مزودي الـ API" },
    { tab: "amrr_unlocker", icon: "🔗", label: "بوابة Amrr Unlocker" },
    { tab: "banners", icon: "🖼️", label: "إدارة البانر الإعلاني" },
    { tab: "featured-sections", icon: "⭐", label: "الأقسام المميزة" },
    { tab: "reviews", icon: "⭐", label: "آراء العملاء" },
    { tab: "memberships", icon: "⭐", label: "نظام العضويات" },
    { tab: "wallets", icon: "💳", label: "طلبات شحن الرصيد" },
    { tab: "customers", icon: "👥", label: "إدارة المستخدمين" },
    { tab: "api_resellers", icon: "🔑", label: "موزعي الـ API" },
    { tab: "settings", icon: "⚙️", label: "إعدادات الموقع" },
    { tab: "gmail", icon: "📧", label: "بوابة ربط الجميل" },
    { tab: "backups", icon: "💾", label: "النسخ الاحتياطي" },
  ];

  const tabs = allTabs.filter(t => FEATURES.showApiDocs || t.tab !== "api_resellers");

  return (
    <>
      {/* ---------------- MOBILE DRAWER ---------------- */}
      {adminDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setAdminDrawerOpen(false)} />
      )}
      <div className={`mobile-drawer admin-drawer-dark ${adminDrawerOpen ? "open" : "closed"}`}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">
            <div className="logo-circle" style={{ width: "32px", height: "32px", fontSize: "1rem" }}>Z</div>
            <span>لوحة التحكم</span>
          </span>
          <button className="mobile-drawer-close" onClick={() => setAdminDrawerOpen(false)}>✕</button>
        </div>
        <div className="mobile-drawer-user-card">
          <span>🔐</span>
          <div>
            <div style={{ fontWeight: 600 }}>{adminUser?.username || "admin"}</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>مسؤول النظام</div>
          </div>
        </div>
        <div className="mobile-drawer-divider" />
        
        {tabs.map(item => {
          const isActive = pathname.includes(`/admin/dashboard/${item.tab}`);
          return (
            <Link 
              href={`/admin/dashboard/${item.tab}`} 
              key={item.tab}
              className={`mobile-drawer-link ${isActive ? "active" : ""}`}
              onClick={() => setAdminDrawerOpen(false)}
            >
              <span style={{ marginInlineEnd: "10px" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        
        <div className="mobile-drawer-divider" />
        <Link href="/" className="mobile-drawer-link" onClick={() => setAdminDrawerOpen(false)}>
          <span style={{ marginInlineEnd: "10px" }}>🏠</span>
          الموقع الرئيسي
        </Link>
        <button className="mobile-drawer-link danger" onClick={handleLogout}>
          <span style={{ marginInlineEnd: "10px" }}>🚪</span>
          تسجيل الخروج
        </button>
      </div>

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="premium-sidebar">
        <div className="premium-logo">
          <div className="logo-circle" style={{ borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {siteLogo && siteLogo !== "default" ? (
              <img src={siteLogo.startsWith("/uploads") && API_BASE_URL ? `${API_BASE_URL}${siteLogo}` : siteLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              (siteName ? siteName[0] : "S")
            )}
          </div>
          <span>{siteName || "عرب تك سيرفر"} المسؤول</span>
        </div>

        <div className="user-menu-widget" style={{ marginBottom: "18px", justifyContent: "space-between" }}>
          <span className="user-username">المسجل: {adminUser?.username || "admin"}</span>
          <span className="logout-btn-text" onClick={handleLogout} style={{ cursor: "pointer", color: "#ef4444" }}>خروج</span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(item => {
            const isActive = pathname.includes(`/admin/dashboard/${item.tab}`);
            return (
              <Link 
                href={`/admin/dashboard/${item.tab}`} 
                key={item.tab}
                className={`nav-item-premium ${isActive ? "active" : ""}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
