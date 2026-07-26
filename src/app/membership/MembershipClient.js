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

  const fetchProfile = async (currentToken) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        localStorage.setItem("customer_user", JSON.stringify(data));
      } else {
        // Token might be invalid
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        setToken("");
      }
    } catch (err) {
      console.error("Error fetching profile on membership page:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  if (!token) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
        <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <span style={{ fontSize: "4rem" }}>⭐</span>
          <h2 style={{ fontWeight: 900, margin: "20px 0 10px 0" }}>صفحة العضوية والميزات</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "30px", lineHeight: "1.7" }}>
            يرجى تسجيل الدخول إلى حسابك لاستعراض مستوى العضوية الخاص بك، الميزات النشطة، والخصومات المخصصة لك.
          </p>
          <Link href="/login" className="glass-btn glass-btn-primary" style={{ padding: "12px 30px", borderRadius: "12px", display: "inline-block", textDecoration: "none" }}>
            تسجيل الدخول / إنشاء حساب جديد 🔑
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontWeight: "bold" }}>
        <div className="logo-circle" style={{ animation: "spin 1s linear infinite", width: "40px", height: "40px", margin: "0 auto 20px auto" }}>⏳</div>
        جاري تحميل تفاصيل العضوية...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "40px 20px" }}>
          <span style={{ fontSize: "3rem" }}>⚠️</span>
          <h3 style={{ margin: "15px 0" }}>خطأ في تحميل البيانات</h3>
          <p style={{ color: "var(--text-muted)" }}>تعذر تحميل بيانات العضوية. يرجى التحقق من اتصالك بالشبكة والمحاولة مجدداً.</p>
          <button onClick={() => fetchProfile(token)} className="glass-btn" style={{ marginTop: "15px", padding: "8px 20px" }}>إعادة المحاولة 🔄</button>
        </div>
      </div>
    );
  }

  const { customer_level = "bronze", is_vip = false, total_orders = 0, total_deposited = 0, balance = 0, discounts = [], all_tiers = [], active_tiers = [], manual_memberships = [] } = profile;

  // Build a set of active tier IDs (auto + manual combined)
  const activeTierIds = new Set([
    ...active_tiers.map(t => Number(t.id)),
    ...manual_memberships.map(m => Number(m.tier_id))
  ]);

  // Fallback level config for old bronze/silver/gold/diamond if no dynamic tiers exist
  const levelConfig = {
    bronze: { name: "البرونزية (Bronze)", label: "برونزي", color: "#cd7f32", icon: "🥉" },
    silver: { name: "الفضية (Silver)", label: "فضي", color: "#c0c0c0", icon: "🥈" },
    gold: { name: "الذهبية (Gold)", label: "ذهبي", color: "#ffd700", icon: "🥇" },
    diamond: { name: "الماسية (Diamond)", label: "ماسي", color: "#b9f2ff", icon: "💎" }
  };

  const currentLevelInfo = levelConfig[customer_level] || levelConfig.bronze;

  // Determine highest active tier for main display
  const highestActiveTier = active_tiers.length > 0 ? active_tiers[active_tiers.length - 1] : null;

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto 40px auto", padding: "10px", direction: "rtl" }}>
      
      {/* Header Info */}
      <div style={{ marginBottom: "25px" }}>
        <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          <span>⭐</span> عضوية الحساب والميزات الخاصة
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "6px" }}>
          استعرض تفاصيل مستواك، العروض الترويجية والخصومات المخصصة لك مباشرة.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        
        {/* User Card */}
        <div className="glass-panel" style={{ 
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
          padding: "25px",
          borderRadius: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "65px", 
              height: "65px", 
              borderRadius: "20px", 
              background: highestActiveTier ? `${highestActiveTier.color}10` : "rgba(99, 102, 241, 0.1)", 
              border: highestActiveTier ? `2px dashed ${highestActiveTier.color}40` : "2px dashed rgba(99, 102, 241, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem"
            }}>
              {highestActiveTier ? highestActiveTier.icon : currentLevelInfo.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.3rem" }}>👤 {profile.username}</h3>
                {is_vip && (
                  <span style={{ 
                    background: "linear-gradient(90deg, #eab308 0%, #ca8a04 100%)", 
                    color: "#000", 
                    fontSize: "0.72rem", 
                    fontWeight: "bold",
                    padding: "3px 10px", 
                    borderRadius: "100px",
                    boxShadow: "0 0 10px rgba(234, 179, 8, 0.3)"
                  }}>
                    👑 VIP
                  </span>
                )}
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0" }}>{profile.email}</p>
              <div style={{ display: "flex", gap: "15px", fontSize: "0.82rem", color: "#94a3b8", marginTop: "6px", flexWrap: "wrap" }}>
                <span>إجمالي الطلبات: <strong style={{ color: "#fff" }}>{total_orders}</strong></span>
                <span>•</span>
                <span>إجمالي الشحن: <strong style={{ color: "#fff" }}>{Number(total_deposited).toFixed(2)} USD</strong></span>
                <span>•</span>
                <span>المحفظة: <strong style={{ color: "var(--primary-color)" }}>{balance.toFixed(2)} USD</strong></span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "left" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block" }}>مستوى العضوية الحالي</span>
            <span style={{ 
              fontSize: "1.25rem", 
              fontWeight: "900", 
              color: highestActiveTier ? highestActiveTier.color : currentLevelInfo.color,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "4px",
              justifyContent: "flex-end"
            }}>
              {highestActiveTier ? `${highestActiveTier.icon} ${highestActiveTier.name}` : `${currentLevelInfo.icon} ${currentLevelInfo.name}`}
            </span>
          </div>
        </div>

        {/* Dynamic Tiers Grid from Backend */}
        {all_tiers.length > 0 && (
          <div>
            <h4 style={{ fontWeight: 800, margin: "10px 0 15px 0", fontSize: "1.1rem" }}>📋 مستويات العضوية المتاحة</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "15px" }}>
              {all_tiers.map(tier => {
                const isActive = activeTierIds.has(Number(tier.id));
                const isManual = manual_memberships.some(m => Number(m.tier_id) === Number(tier.id));
                
                return (
                  <div key={tier.id} className="glass-panel" style={{ 
                    padding: "20px", 
                    border: isActive ? `1px solid ${tier.color}` : "1px solid rgba(255,255,255,0.06)",
                    background: isActive ? `${tier.color}08` : "transparent",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontWeight: 800, color: tier.color, fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        {tier.icon} {tier.name}
                      </span>
                      {isActive && (
                        <span style={{ 
                          background: `${tier.color}20`, 
                          color: tier.color, 
                          padding: "2px 8px", 
                          borderRadius: "6px", 
                          fontSize: "0.72rem", 
                          fontWeight: "bold" 
                        }}>
                          {isManual ? "✓ مفعّل يدوياً" : "✓ نشط تلقائياً"}
                        </span>
                      )}
                    </div>
                    <ul style={{ paddingRight: "15px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.7" }}>
                      <li>
                        الشرط: {tier.condition_type === 'total_deposited' ? 'شحن رصيد بقيمة' : 'طلبات مكتملة بعدد'}{' '}
                        <strong style={{ color: "#fff" }}>
                          {tier.condition_value} {tier.condition_type === 'total_deposited' ? 'USD' : 'طلب'}
                        </strong>
                        {' '}أو إضافة يدوية بواسطة الإدارة.
                      </li>
                      <li>خصومات وميزات خاصة تُطبّق تلقائياً عند الدفع.</li>
                      {isActive && <li style={{ color: tier.color, fontWeight: "bold" }}>🎉 أنت مُفعّل على هذا المستوى!</li>}
                    </ul>
                  </div>
                );
              })}

              {/* VIP benefits card */}
              <div className="glass-panel" style={{ 
                padding: "20px", 
                border: is_vip ? "1px solid #ca8a04" : "1px solid rgba(255,255,255,0.06)",
                background: is_vip ? "rgba(202, 138, 4, 0.05)" : "transparent"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontWeight: 800, color: "#eab308", fontSize: "1rem" }}>👑 العضوية الممتازة VIP</span>
                  {is_vip && <span style={{ background: "rgba(234, 179, 8, 0.2)", color: "#eab308", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "bold" }}>نشط حالياً</span>}
                </div>
                <ul style={{ paddingRight: "15px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.7" }}>
                  <li>تُمنح يدوياً فقط للموزعين وأصحاب المتاجر الكبيرة.</li>
                  <li>الحصول على أسعار الجملة الخاصة والحصرية (خارج التصنيف).</li>
                  <li>خدمة عملاء مخصصة وإمكانية إيداع وحجز أرصدة خاصة.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Fallback: old static grid if no dynamic tiers */}
        {all_tiers.length === 0 && (
          <div>
            <h4 style={{ fontWeight: 800, margin: "10px 0 15px 0", fontSize: "1.1rem" }}>📋 جدول الميزات والمستويات</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "15px" }}>
              {Object.entries(levelConfig).map(([key, level]) => (
                <div key={key} className="glass-panel" style={{ 
                  padding: "20px", 
                  border: customer_level === key ? `1px solid ${level.color}` : "1px solid rgba(255,255,255,0.06)",
                  background: customer_level === key ? `${level.color}08` : "transparent"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: 800, color: level.color, fontSize: "1rem" }}>{level.icon} {level.name}</span>
                    {customer_level === key && <span style={{ background: `${level.color}20`, color: level.color, padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "bold" }}>نشط حالياً</span>}
                  </div>
                  <ul style={{ paddingRight: "15px", margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.7" }}>
                    <li>المستوى: <strong style={{ color: "#fff" }}>{level.label}</strong></li>
                    <li>خصومات وميزات خاصة تُطبّق تلقائياً.</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Discounts List */}
        <div className="glass-panel" style={{ padding: "25px" }}>
          <h4 style={{ fontWeight: 800, margin: "0 0 15px 0", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🏷️</span> الخصومات والأسعار المخصصة لحسابك
          </h4>
          
          {discounts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              لا توجد خصومات استثنائية مخصصة لحسابك حالياً. خصومات مستواك (العضوية) تطبق تلقائياً عند الدفع.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {discounts.map((d) => (
                <div key={d.id} style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.06)", 
                  padding: "12px 18px", 
                  borderRadius: "12px", 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px"
                }}>
                  <div>
                    <strong style={{ display: "block", color: "#ffffff", fontSize: "0.9rem" }}>{d.description || "خصم مخصص على الخدمات"}</strong>
                    {d.expires_at && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        ينتهي بتاريخ: {new Date(d.expires_at).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ 
                      background: "rgba(52, 211, 153, 0.15)", 
                      color: "#34d399", 
                      fontSize: "0.95rem", 
                      fontWeight: "bold",
                      padding: "4px 12px",
                      borderRadius: "8px"
                    }}>
                      {d.discount_type === "percentage" ? `خصم ${d.discount_value}%` : `خصم بقيمة $${d.discount_value}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
