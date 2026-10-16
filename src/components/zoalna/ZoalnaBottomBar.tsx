"use client";

import { SITE_CONTACTS } from "@/lib/site-contacts";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface ZoalnaBottomBarProps {
  lang: string;
  whatsappNum?: string;
  floatingWhatsapp?: {
    enabled?: boolean;
    phone?: string;
    label?: string;
  };
  onOpenAuth: (tab: "login" | "register") => void;
}

export default function ZoalnaBottomBar({
  lang,
  whatsappNum = SITE_CONTACTS.phone,
  floatingWhatsapp,
  onOpenAuth,
}: ZoalnaBottomBarProps) {
  const isAr = lang === "ar";
  const pathname = usePathname();
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/` || pathname === "/";
  const isOrders = pathname.includes("/orders");
  const isWallet = pathname.includes("/wallet");
  const isProfile = pathname.includes("/profile");
  const isCart = pathname.includes("/cart");

  const { cartCount, setIsCartOpen } = useCart();

  const activePhone = floatingWhatsapp?.phone || whatsappNum;
  const cleanWhatsapp = activePhone.replace(/[^0-9+]/g, "");

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="mob-bottom-nav" aria-label={isAr ? "القائمة السفلية" : "Bottom Navigation"}>
        <div className="mob-bottom-nav-inner">
          <Link
            href={`/${lang}`}
            className={`mob-bn-item ${isHome ? "active" : ""}`}
          >
            <div className="mob-bn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M3 9.5L12 3l9 6.5V21H16v-5h-4v5H3V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <span>{isAr ? "الرئيسية" : "Home"}</span>
          </Link>

          {/* Cart Item in Bottom Bar */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`mob-bn-item ${isCart ? "active" : ""} relative`}
            style={{ position: "relative" }}
            aria-label={isAr ? "السلة" : "Cart"}
          >
            <div className="mob-bn-ico relative" style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: isAr ? "auto" : "-6px",
                    left: isAr ? "-6px" : "auto",
                    background: "var(--user-link, #2563eb)",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 800,
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    lineHeight: 1
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </div>
            <span>{isAr ? "السلة" : "Cart"}</span>
          </button>

          <Link
            href={`/${lang}/orders`}
            className={`mob-bn-item ${isOrders ? "active" : ""}`}
          >
            <div className="mob-bn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span>{isAr ? "طلباتي" : "Orders"}</span>
          </Link>

          <Link
            href={`/${lang}/wallet`}
            className={`mob-bn-item ${isWallet ? "active" : ""}`}
          >
            <div className="mob-bn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <rect x="1" y="6" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M1 11h22" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <span>{isAr ? "محفظتي" : "Wallet"}</span>
          </Link>

          <Link
            href={`/${lang}/profile`}
            className={`mob-bn-item ${isProfile ? "active" : ""}`}
          >
            <div className="mob-bn-ico">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span>{isAr ? "حسابي" : "Account"}</span>
          </Link>
        </div>
      </nav>

      {/* Floating dock is now handled globally via FloatingContactDock */}
    </>
  );
}
