"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function MembershipClient() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(currentToken) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        localStorage.setItem("customer_user", JSON.stringify(data));
      } else {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        setToken("");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setHydrated(true);
    const storedToken = localStorage.getItem("customer_token");
    setToken(storedToken || "");
    if (storedToken) {
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  if (!hydrated) return null;

  /* ── Not logged in ── */
  if (!token) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "20px" }} dir="rtl">
        <div className="glass-panel" style={{ textAlign: "center", padding: "50px 24px" }}>
          <span style={{ fontSize: "4rem" }}>⭐</span>
          <h2 style={{ fontWeight: 900, margin: "18px 0 10px" }}>صفحة العضوية والميزات</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7 }}>
            يرجى تسجيل الدخول لاستعراض مستوى العضوية وخصوماتك المخصصة.
          </p>
          <Link href="/login" className="up-btn-primary" style={{ textDecoration: "none" }}>
            🔑 تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }} dir="rtl">
        ⏳ جاري تحميل تفاصيل العضوية...
      </div>
    );
  }

  /* ── Error ── */
  if (!profile) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "20px", textAlign: "center" }} dir="rtl">
        <div className="glass-panel" style={{ padding: "40px" }}>
          <span style={{ fontSize: "3rem" }}>⚠️</span>
          <h3 style={{ margin: "14px 0" }}>خطأ في تحميل البيانات</h3>
          <p style={{ color: "var(--text-muted)" }}>تعذر تحميل بيانات العضوية. يرجى المحاولة مجدداً.</p>
          <button onClick={() => fetchProfile(token)} className="up-btn-primary" style={{ marginTop: "16px" }}>
            🔄 إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  const {
    customer_level = "bronze", is_vip = false,
    total_orders = 0, total_deposited = 0, balance = 0,
    discounts = [], all_tiers = [], active_tiers = [], manual_memberships = []
  } = profile;

  const activeTierIds = new Set([
    ...active_tiers.map(t => Number(t.id)),
    ...manual_memberships.map(m => Number(m.tier_id))
  ]);

  const levelConfig = {
    bronze: { name: "البرونزية", color: "#cd7f32", icon: "🥉" },
    silver: { name: "الفضية",   color: "#c0c0c0", icon: "🥈" },
    gold:   { name: "الذهبية",  color: "#ffd700", icon: "🥇" },
    diamond:{ name: "الماسية",  color: "#b9f2ff", icon: "💎" }
  };

  const currentLevelInfo = levelConfig[customer_level] || levelConfig.bronze;
  const highestActiveTier = active_tiers.length > 0 ? active_tiers[active_tiers.length - 1] : null;

  return (
    <div className="membership-page" dir="rtl" style={{ padding: "10px 0 80px" }}>

      {/* ── Page Title ── */}
      <div style={{ marginBottom: "22px" }}>
        <h1 className="section-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.6rem" }}>
          <span>⭐</span> نظام العضويات
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "6px" }}>
          ترقب عضويتك واستمتع بمزايا حصرية ومكافآت أكثر
        </p>
      </div>

      {/* ── Hero Card ── */}
      <div className="membership-hero" style={{ marginBottom: "24px" }}>
        <div className="membership-hero-left">
          {/* Tier Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            padding: "10px 18px 10px 14px", borderRadius: "16px", marginBottom: "16px",
            background: `${(highestActiveTier?.color || currentLevelInfo.color)}18`,
            border: `1px solid ${(highestActiveTier?.color || currentLevelInfo.color)}40`
          }}>
            <span style={{ fontSize: "2rem" }}>{highestActiveTier?.icon || currentLevelInfo.icon}</span>
            <div>
              <div className="membership-level-label">مستواك الحالي</div>
              <div className="membership-level-badge" style={{ color: highestActiveTier?.color || currentLevelInfo.color }}>
                {highestActiveTier?.name || currentLevelInfo.name}
              </div>
            </div>
            {is_vip && <span className="membership-vip-badge">👑 VIP</span>}
          </div>

          <h2 className="membership-user-name">
            <span>👤</span> {profile.username}
          </h2>
          <p className="membership-user-email">{profile.email}</p>

          <div className="membership-stats">
            <div className="membership-stat">
              <span className="membership-stat-label">إجمالي الطلبات</span>
              <span className="membership-stat-value">{total_orders}</span>
            </div>
            <div className="membership-stat">
              <span className="membership-stat-label">إجمالي الشحن</span>
              <span className="membership-stat-value">{Number(total_deposited).toFixed(2)} USD</span>
            </div>
            <div className="membership-stat">
              <span className="membership-stat-label">رصيد المحفظة</span>
              <span className="membership-stat-value accent">{Number(balance).toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        <div className="membership-hero-right">
          <Link href="/wallet" className="up-btn-primary" style={{ whiteSpace: "nowrap" }}>
            💳 شحن الرصيد
          </Link>
          <Link href="/orders" className="up-btn-ghost" style={{ whiteSpace: "nowrap", marginTop: "8px" }}>
            📋 طلباتي
          </Link>
        </div>
      </div>

      {/* ── Dynamic Tiers Grid ── */}
      {all_tiers.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div className="up-section-heading">
            <span className="up-section-heading-icon">🏆</span>
            <h2>مستويات العضوية المتاحة</h2>
          </div>
          <div className="membership-tiers-grid">
            {all_tiers.map(tier => {
              const isActive = activeTierIds.has(Number(tier.id));
              const isManual = manual_memberships.some(m => Number(m.tier_id) === Number(tier.id));
              return (
                <div
                  key={tier.id}
                  className={`membership-tier-card${isActive ? " active" : ""}`}
                  style={{ "--tier-color": tier.color }}
                >
                  <div className="membership-tier-header">
                    <span className="membership-tier-name" style={{ color: tier.color }}>
                      {tier.icon} {tier.name}
                    </span>
                    {isActive && (
                      <span className="membership-tier-active-tag" style={{ color: tier.color, border: `1px solid ${tier.color}40` }}>
                        {isManual ? "✓ يدوي" : "✓ نشط"}
                      </span>
                    )}
                  </div>
                  <ul className="membership-tier-body">
                    <li>
                      الشرط: <strong style={{ color: "var(--text-main)" }}>
                        {tier.condition_value} {tier.condition_type === "total_deposited" ? "USD شحن" : "طلب"}
                      </strong>
                    </li>
                    <li>دعم فني أسرع وأولوية معالجة</li>
                    {isActive && <li style={{ color: tier.color, fontWeight: 800 }}>🎉 أنت مفعّل الآن!</li>}
                  </ul>
                  {!isActive && (
                    <Link href="/wallet" className="membership-tier-cta">اشحن للترقية</Link>
                  )}
                </div>
              );
            })}

            {/* VIP Card */}
            <div className={`membership-tier-card${is_vip ? " active" : ""}`} style={{ "--tier-color": "#eab308" }}>
              <div className="membership-tier-header">
                <span className="membership-tier-name" style={{ color: "#eab308" }}>👑 VIP الماسي</span>
                {is_vip && (
                  <span className="membership-tier-active-tag" style={{ color: "#eab308", border: "1px solid rgba(234,179,8,0.4)" }}>✓ نشط</span>
                )}
              </div>
              <ul className="membership-tier-body">
                <li>أولوية قصوى في الدعم والمعالجة</li>
                <li>مكافآت عند كل شحن</li>
                <li>مميزات حصرية إضافية</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Fallback Static Grid ── */}
      {all_tiers.length === 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div className="up-section-heading">
            <span className="up-section-heading-icon">📋</span>
            <h2>جدول الميزات والمستويات</h2>
          </div>
          <div className="membership-tiers-grid">
            {Object.entries(levelConfig).map(([key, level]) => (
              <div
                key={key}
                className={`membership-tier-card${customer_level === key ? " active" : ""}`}
                style={{ "--tier-color": level.color }}
              >
                <div className="membership-tier-header">
                  <span className="membership-tier-name" style={{ color: level.color }}>
                    {level.icon} {level.name}
                  </span>
                  {customer_level === key && (
                    <span className="membership-tier-active-tag" style={{ color: level.color, border: `1px solid ${level.color}40` }}>✓ نشط</span>
                  )}
                </div>
                <ul className="membership-tier-body">
                  <li>خصومات وميزات خاصة تُطبّق تلقائياً</li>
                  <li>دعم فني محسّن</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upgrade CTA ── */}
      <div className="membership-upgrade-cta" style={{ marginBottom: "28px" }}>
        <div className="membership-upgrade-icon">💳</div>
        <div className="membership-upgrade-text">
          <h3 className="membership-upgrade-title">جاهز للترقية؟</h3>
          <p className="membership-upgrade-desc">اشحن رصيدك الآن وارتقِ بعضويتك للحصول على مزايا أكثر</p>
        </div>
        <Link href="/wallet" className="up-btn-primary">اشحن الرصيد للترقية</Link>
      </div>

      {/* ── Discounts ── */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <div className="up-section-heading">
          <span className="up-section-heading-icon">🏷️</span>
          <h2>الخصومات والأسعار المخصصة</h2>
        </div>
        {discounts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            لا توجد خصومات استثنائية مخصصة حالياً.
            <br />
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>خصومات مستواك تطبق تلقائياً عند الدفع.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {discounts.map(d => (
              <div key={d.id} className="membership-discount-row">
                <div>
                  <strong style={{ display: "block", color: "var(--text-main)", fontSize: "0.9rem" }}>
                    {d.description || "خصم مخصص على الخدمات"}
                  </strong>
                  {d.expires_at && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      ينتهي: {new Date(d.expires_at).toLocaleDateString("ar-EG")}
                    </span>
                  )}
                </div>
                <span className="membership-discount-tag">
                  {d.discount_type === "percentage" ? `خصم ${d.discount_value}%` : `خصم $${d.discount_value}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
