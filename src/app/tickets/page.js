"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TicketsIndexPage() {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("customer_token");
      if (savedToken) {
        setToken(savedToken);
        fetchMyTickets(savedToken);
      }
    }
  }, []);

  const fetchMyTickets = async (authToken) => {
    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.arab-tech1.online";
      const res = await fetch(`${apiBase}/api/ai/tickets`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to load tickets:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "30px 15px 60px" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)",
          padding: "8px 18px", borderRadius: "999px", color: "#38bdf8", fontSize: "0.9rem",
          fontWeight: "bold", marginBottom: "15px"
        }}>
          <span>🎧</span>
          <span>مركز الدعم الفني وتذاكر الشكاوى</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "12px" }}>
          مركز خدمة العملاء والدعم الذكي
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          نحن هنا لمساعدتك في أي وقت. يمكنك التحدث مع المساعد الذكي ورفع تذكرة فورية للإدارة على تيليجرام.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "25px", flexWrap: "wrap" }}>
          <Link
            href="/tickets/new"
            style={{
              background: "linear-gradient(135deg, #00b4d8, #2563eb)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: "14px",
              fontWeight: 900,
              fontSize: "1.05rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(0, 180, 216, 0.3)"
            }}
          >
            <span>🤖</span>
            <span>فتح تذكرة دعم ذكية جديدة</span>
          </Link>

          <Link
            href="/terms#refund-policy"
            className="glass-btn"
            style={{
              padding: "14px 24px",
              borderRadius: "14px",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>🔄</span>
            <span>سياسة الاسترجاع والشروط</span>
          </Link>
        </div>
      </div>

      {/* Grid of Support Channels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        
        <div className="glass-panel" style={{ padding: "28px", borderRadius: "20px" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>🤖</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
            المساعد الذكي الفوري (AI)
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "18px" }}>
            تحدث مع الذكاء الاصطناعي لحل المشكلات ورفع الشكاوى إلى تيليجرام الإدارة فورياً.
          </p>
          <Link href="/tickets/new" style={{ color: "#38bdf8", fontWeight: "bold", textDecoration: "none" }}>
            ابدأ المحادثة الآن ←
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: "28px", borderRadius: "20px" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>📢</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
            تيليجرام الدعم الفني
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "18px" }}>
            انضم لقناتنا الرسمية لمتابعة التحديثات وحالة السيرفرات والتواصل مع المشرفين.
          </p>
          <a href="https://t.me/Elmuizabbas" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontWeight: "bold", textDecoration: "none" }}>
            فتح قناة تيليجرام ←
          </a>
        </div>

        <div className="glass-panel" style={{ padding: "28px", borderRadius: "20px" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "12px" }}>💬</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
            واتساب الإدارة المباشر
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "18px" }}>
            تواصل مع خدمة العملاء والإدارة عبر واتساب للطلبات العاجلة والشحن اليدوي.
          </p>
          <a href="https://wa.me/249118100809" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", fontWeight: "bold", textDecoration: "none" }}>
            مراسلة واتساب ←
          </a>
        </div>

      </div>

      {/* Customer Previous Tickets (If Logged In) */}
      {token && (
        <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "20px" }}>
            تذاكرك السابقة المسجلة
          </h2>

          {isLoading ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>
              جاري جلب التذاكر...
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "30px" }}>
              لا توجد لديك تذاكر دعم سابقة. يمكنك فتح تذكرة جديدة في أي وقت.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tickets.map((tItem) => (
                <div
                  key={tItem.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--text-main)", fontSize: "1rem" }}>
                      #{tItem.id} — {tItem.subject}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                      {tItem.details?.slice(0, 100)}...
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "bold",
                      background: tItem.status === "open" ? "rgba(234, 179, 8, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: tItem.status === "open" ? "#facc15" : "#34d399",
                      border: tItem.status === "open" ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)"
                    }}>
                      {tItem.status === "open" ? "قيد المراجعة" : "تم الحل"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
