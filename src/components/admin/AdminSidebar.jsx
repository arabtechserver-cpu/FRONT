"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
import {
  Inbox,
  CreditCard,
  Zap,
  Folder,
  Users,
  BarChart3,
  Smartphone,
  RefreshCw,
  Sliders,
  Key,
  Star,
  Image as ImageIcon,
  Award,
  Link as LinkIcon,
  Settings,
  Database,
  ShieldCheck,
  Home,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const context = useContext(AdminDashboardContext);
  const { 
    adminDrawerOpen, setAdminDrawerOpen, adminUser, handleLogout,
    siteName, siteLogo, API_BASE_URL
  } = context;
  
  const pathname = usePathname();

  const allTabs = [
    { tab: "orders", icon: Inbox, label: "طلبات الخدمات" },
    { tab: "wallets", icon: CreditCard, label: "طلبات شحن الرصيد" },
    { tab: "services", icon: Zap, label: "إدارة الخدمات" },
    { tab: "categories", icon: Folder, label: "إدارة الأقسام" },
    { tab: "customers", icon: Users, label: "إدارة المستخدمين" },
    { tab: "analytics", icon: BarChart3, label: "تحليلات المبيعات" },
    { tab: "menu-drawer", icon: Smartphone, label: "قائمة الموبايل الجانبية" },
    { tab: "exchange-rates", icon: RefreshCw, label: "سعر صرف الجنيه السوداني" },
    { tab: "api-providers", icon: Sliders, label: "مزودو الخدمات" },
    { tab: "api_resellers", icon: Key, label: "موزعو الخدمات" },
    { tab: "featured-sections", icon: Star, label: "الأقسام المميزة" },
    { tab: "banners", icon: ImageIcon, label: "إدارة البانر الإعلاني" },
    { tab: "reviews", icon: Star, label: "آراء العملاء" },
    { tab: "memberships", icon: Award, label: "نظام العضويات" },
    { tab: "amrr_unlocker", icon: LinkIcon, label: "عرب تك برو" },
    { tab: "settings", icon: Settings, label: "إعدادات الموقع" },
    { tab: "backups", icon: Database, label: "النسخ الاحتياطي" },
  ];

  const hiddenTabs = ["api-providers", "api_resellers"];
  const tabs = allTabs.filter(t => !hiddenTabs.includes(t.tab));

  return (
    <>
      {/* ---------------- MOBILE DRAWER ---------------- */}
      {adminDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setAdminDrawerOpen(false)} />
      )}
      <div className={`mobile-drawer admin-drawer-dark ${adminDrawerOpen ? "open" : "closed"}`}>
        <div className="mobile-drawer-header">
          <span className="mobile-drawer-title">
            <div className="logo-circle" style={{ width: "32px", height: "32px", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", border: "1px solid #0284c7", padding: "2px" }}>
              <img src="/logo.png" alt="SK-unlocker" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span>لوحة التحكم</span>
          </span>
          <button className="mobile-drawer-close" onClick={() => setAdminDrawerOpen(false)}>✕</button>
        </div>
        <div className="mobile-drawer-user-card">
          <ShieldCheck size={20} color="#38bdf8" />
          <div>
            <div style={{ fontWeight: 600 }}>{adminUser?.username || "admin"}</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>مسؤول النظام</div>
          </div>
        </div>
        <div className="mobile-drawer-divider" />
        
        {tabs.map(item => {
          const isActive = pathname.includes(`/admin/dashboard/${item.tab}`);
          const IconComponent = item.icon;
          return (
            <Link 
              href={`/admin/dashboard/${item.tab}`} 
              key={item.tab}
              className={`mobile-drawer-link ${isActive ? "active" : ""}`}
              onClick={() => setAdminDrawerOpen(false)}
            >
              <span style={{ marginInlineEnd: "10px", display: "inline-flex", alignItems: "center" }}>
                <IconComponent size={18} />
              </span>
              {item.label}
            </Link>
          );
        })}
        
        <div className="mobile-drawer-divider" />
        <Link href="/" className="mobile-drawer-link" onClick={() => setAdminDrawerOpen(false)}>
          <span style={{ marginInlineEnd: "10px", display: "inline-flex", alignItems: "center" }}>
            <Home size={18} />
          </span>
          الموقع الرئيسي
        </Link>
        <button className="mobile-drawer-link danger" onClick={handleLogout}>
          <span style={{ marginInlineEnd: "10px", display: "inline-flex", alignItems: "center" }}>
            <LogOut size={18} />
          </span>
          تسجيل الخروج
        </button>
      </div>

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="premium-sidebar">
        <div className="premium-logo">
          <div className="logo-circle" style={{ width: "36px", height: "36px", borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", border: "1px solid #0284c7", padding: "2px" }}>
            <img src="/logo.png" alt="SK-unlocker" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <span>{siteName || "SK-unlocker"} المسؤول</span>
        </div>

        <div className="user-menu-widget" style={{ marginBottom: "18px", justifyContent: "space-between" }}>
          <span className="user-username">المسجل: {adminUser?.username || "admin"}</span>
          <span className="logout-btn-text" onClick={handleLogout} style={{ cursor: "pointer", color: "#ef4444" }}>خروج</span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(item => {
            const isActive = pathname.includes(`/admin/dashboard/${item.tab}`);
            const IconComponent = item.icon;
            return (
              <Link 
                href={`/admin/dashboard/${item.tab}`} 
                key={item.tab}
                className={`nav-item-premium ${isActive ? "active" : ""}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="nav-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                  <IconComponent size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}


