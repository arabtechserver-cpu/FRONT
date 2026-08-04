"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import Link from "next/link";
import LoopsNewsletterForm from "./LoopsNewsletterForm";

import { FEATURES } from "@/features";

export default function Footer() {
  const [settings, setSettings] = useState({ site_name: "عرب تك سيرفر", site_logo: "/logo.jpg" });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* About column */}
        <div className="footer-column">
          <div className="logo-container" style={{ cursor: "default", display: "flex", alignItems: "center", gap: "8px" }}>
            {settings.site_logo && settings.site_logo !== "default" ? (
              <img 
                src={settings.site_logo.startsWith("http") || settings.site_logo.startsWith("/") || settings.site_logo.startsWith("data:") ? settings.site_logo : `${API_BASE_URL}${settings.site_logo}`} 
                alt={settings.site_name} 
                style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} 
              />
            ) : (
              <div className="logo-circle" style={{ width: "36px", height: "36px", fontSize: "1.2rem" }}>
                {settings.site_name ? settings.site_name.charAt(0) : "S"}
              </div>
            )}
            <span style={{ fontSize: "1.2rem" }}>{settings.site_name}</span>
          </div>
          <p className="footer-desc" style={{ marginTop: "10px" }}>
            المنصة العربية الأسرع والأكثر أماناً لتفعيل برامج السوفت وير وتفعيلات الأدوات والاشتراكات الخدمية بأفضل الأسعار على مدار الساعة.
          </p>
          <LoopsNewsletterForm />
        </div>

        {/* Links column */}
        <div className="footer-column">
          <h4 className="footer-title">روابط سريعة</h4>
          <div className="footer-links">
            <Link href="/">🏠 الصفحة الرئيسية</Link>
            <Link href="/orders">📦 تتبع طلباتي ومشترياتي</Link>
            <Link href="/wallet">💳 محفظتي وشحن الرصيد</Link>
            <Link href="/login">👤 تسجيل الدخول / حساب جديد</Link>
            <Link href="/terms">⚖️ سياسة الاستخدام</Link>
            {FEATURES.showApiDocs && <Link href="/api-docs">🔌 شرح ربط الـ API</Link>}
          </div>
        </div>

        {/* Support column */}
        <div className="footer-column">
          <h4 className="footer-title">الدعم الفني والمساعدة</h4>
          <p className="footer-desc">
            فريق الدعم الفني متواجد لمساعدتكم 24 ساعة طوال أيام الأسبوع لحل أي مشكلة تتعلق بالخدمات أو الدفع.
          </p>
          <div className="footer-links" style={{ marginTop: "5px" }}>
            <a href="https://wa.me/249123667227" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>💬 واتساب الإدارة 1</span>
              <bdi dir="ltr" style={{ display: "inline-block" }}>(+249&nbsp;12&nbsp;366&nbsp;7227)</bdi>
            </a>
            <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>💬 واتساب الإدارة 2</span>
              <bdi dir="ltr" style={{ display: "inline-block" }}>(+1&nbsp;672-897-2935)</bdi>
            </a>
            <a href="https://chat.whatsapp.com/DINRDwU2lVjFcGRowxT3m5" target="_blank" rel="noopener noreferrer">💬 مجتمع واتساب عرب تك</a>
            <a href="https://www.facebook.com/ARABTECHSERVEROnline" target="_blank" rel="noopener noreferrer">📘 صفحة فيسبوك عرب تك</a>
            <a href="https://tiktok.com/@arabtechsuppurt" target="_blank" rel="noopener noreferrer">🎵 تيك توك عرب تك</a>
            <a href="mailto:arab.tech.services2@gmail.com">📧 البريد الإلكتروني (arab.tech.services2@gmail.com)</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        جميع الحقوق محفوظة © {new Date().getFullYear()} لصالح {settings.site_name}. تصميم فخم ومطور بالكامل.
      </div>
    </footer>
  );
}
