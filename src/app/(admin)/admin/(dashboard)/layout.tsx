"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "../login/actions";
import DashboardAccessRestricted from "@/components/admin/DashboardAccessRestricted";

const NAV_ITEMS = [
  { href: "/admin", label: "ملخص الإحصائيات", icon: "dashboard" },
  { href: "/admin/orders", label: "الطلبات", icon: "shopping_cart" },
  { href: "/admin/services", label: "الخدمات والأقسام", icon: "category" },
  { href: "/admin/users", label: "إدارة المستخدمين المسجلين", icon: "manage_accounts" },
  { href: "/admin/pages", label: "صفحات المتجر والقوائم", icon: "web" },
  { href: "/admin/memberships", label: "إدارة العضويات والخصومات VIP", icon: "card_membership" },
  { href: "/admin/coupons", label: "أكواد الخصم والكوبونات", icon: "confirmation_number" },
  { href: "/admin/wallet", label: "إدارة المحفظة وطلبات الشحن", icon: "account_balance_wallet" },
  { href: "/admin/providers", label: "ربط سيرفرات الـ API", icon: "dns" },
  { href: "/admin/currencies", label: "أسعار العملات", icon: "currency_exchange" },
  { href: "/admin/customer-logs", label: "سجل العملاء", icon: "manage_search" },
  { href: "/admin/homepage", label: "التحكم بالصفحة الرئيسية", icon: "space_dashboard" },
  { href: "/admin/analytics", label: "الإحصائيات", icon: "bar_chart" },
  { href: "/admin/backups", label: "النسخ الاحتياطي", icon: "backup" },
  { href: "/admin/settings", label: "إعدادات الحساب", icon: "settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isIpRestricted, setIsIpRestricted] = useState(false);
  const [blockedIp, setBlockedIp] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { setMobileNavOpen(false); }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const res = await fetch("/api/admin/ip-access/check");
        if (res.status === 401) {
          if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
          }
          return;
        }
        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (data.code === "IP_NOT_ALLOWED" || data.error?.includes("network")) {
            if (isMounted) {
              setIsIpRestricted(true);
              setBlockedIp(data.clientIp || "");
              setBlockedReason(data.error || "شبكتك الحالية غير مصرح لها بالوصول إلى لوحة التحكم.");
            }
          }
        }
      } catch {
        // Ignore network errors
      }
    };

    checkAccess();

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      } else if (response.status === 403) {
        try {
          const cloned = response.clone();
          const body = await cloned.json();
          if (body?.code === "IP_NOT_ALLOWED" || body?.error?.includes("network")) {
            if (isMounted) {
              setIsIpRestricted(true);
              setBlockedIp(body.clientIp || "");
              setBlockedReason(body.error || "شبكتك الحالية غير مصرح لها بالوصول إلى لوحة التحكم.");
            }
          }
        } catch {}
      }
      return response;
    };

    return () => {
      isMounted = false;
      window.fetch = originalFetch;
    };
  }, []);

  const handleLogout = async () => {
    if (confirm("هل أنت متأكد من تسجيل الخروج من لوحة الإدارة؟")) {
      setIsLoggingOut(true);
      try {
        await logoutAdmin();
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          sessionStorage.removeItem("admin_token");
          document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
        window.location.href = "/admin/login";
      } catch (err) {
        console.error("Logout error:", err);
        window.location.href = "/admin/login";
      }
    }
  };

  if (isIpRestricted) {
    return <DashboardAccessRestricted currentIp={blockedIp} reason={blockedReason} />;
  }

  return (
    <div className="admin-shell h-dvh overflow-hidden bg-background flex font-sans text-on-surface" dir="rtl">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="إغلاق قائمة الإدارة"
        />
      )}
      {/* Sidebar */}
      <aside id="admin-navigation" className={`admin-sidebar fixed inset-y-0 right-0 z-40 w-64 max-w-[85vw] md:static bg-surface-container border-l border-outline-variant/30 flex-shrink-0 flex flex-col min-h-0 transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-display font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <span>لوحة الإدارة</span>
          </Link>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
          </span>
        </div>
        
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto custom-scrollbar" aria-label="أقسام لوحة الإدارة">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className={`material-symbols-outlined text-lg w-5 text-center ${isActive ? "text-on-primary" : "text-primary"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-outline-variant/30 space-y-1.5">
          <Link
            href="/ar"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base w-5 text-center text-primary">arrow_forward</span>
            <span>العودة للموقع</span>
          </Link>

          {/* Dedicated Logout Button in Sidebar */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold border border-red-500/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base w-5 text-center">logout</span>
            <span>{isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="admin-main flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
        {/* Top Header Bar */}
        <header className="admin-header sticky top-0 z-20 bg-surface-container/95 backdrop-blur-md border-b border-outline-variant/30 px-3 sm:px-6 py-3.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="قائمة لوحة الإدارة" aria-expanded={mobileNavOpen} aria-controls="admin-navigation" className="md:hidden w-9 h-9 rounded-xl border border-outline-variant/50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              <span>BORAI STORE</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30"
              title="التبديل إلى حساب آخر"
            >
              <span className="material-symbols-outlined text-sm">switch_account</span>
              <span className="hidden sm:inline">تبديل الحساب</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">power_settings_new</span>
              <span>{isLoggingOut ? "خروج..." : "خروج"}</span>
            </button>
          </div>
        </header>

        <div className="admin-content p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
