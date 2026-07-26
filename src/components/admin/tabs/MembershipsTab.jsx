"use client";

import React, { useState, useEffect } from "react";
import dashboardStyles from "@/app/admin/dashboard/AdminDashboardClient.styles";
import { API_BASE_URL } from "@/config";

export default function MembershipsTab({ token }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [newTier, setNewTier] = useState({ name: "", condition_type: "total_deposited", condition_value: 0, icon: "⭐", color: "#fbbf24" });
  
  // Selected tier for viewing discounts
  const [selectedTier, setSelectedTier] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({ target_type: "global", target_id: "", discount_type: "percentage", discount_value: 0 });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  // Members management
  const [allCustomers, setAllCustomers] = useState([]);
  const [tierMembers, setTierMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [addMemberNote, setAddMemberNote] = useState("");



  const fetchTiers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTiers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndServices = async () => {
    try {
      const catRes = await fetch(`${API_BASE_URL}/api/categories`);
      if (catRes.ok) {
        setCategories(await catRes.json());
      }
      const srvRes = await fetch(`${API_BASE_URL}/api/services`);
      if (srvRes.ok) {
        setServices(await srvRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTier)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل إضافة العضوية.");
      setSuccessMsg("تم إضافة العضوية بنجاح.");
      setNewTier({ name: "", condition_type: "total_deposited", condition_value: 0, icon: "⭐", color: "#fbbf24" });
      fetchTiers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleDeleteTier = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه العضوية؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("تم حذف العضوية بنجاح.");
        if (selectedTier?.id === id) setSelectedTier(null);
        fetchTiers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDiscounts = async (tierId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers/${tierId}/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDiscounts(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAllCustomers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTierMembers = async (tierId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers/${tierId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTierMembers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchTiers();
    fetchCategoriesAndServices();
    fetchAllCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    fetchDiscounts(tier.id);
    fetchTierMembers(tier.id);
    setMemberSearch("");
    setAddMemberNote("");
  };

  const handleAddMember = async (customerId) => {
    if (!selectedTier) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers/${selectedTier.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ customer_id: customerId, notes: addMemberNote })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل إضافة المستخدم.");
      setSuccessMsg(data.message || "تم إضافة المستخدم بنجاح.");
      setMemberSearch("");
      setAddMemberNote("");
      fetchTierMembers(selectedTier.id);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleRemoveMember = async (membershipId) => {
    if (!confirm("هل أنت متأكد من إزالة هذا المستخدم من العضوية؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/members/${membershipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("تم إزالة المستخدم من العضوية بنجاح.");
        if (selectedTier) fetchTierMembers(selectedTier.id);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!selectedTier) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/tiers/${selectedTier.id}/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newDiscount)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل إضافة الخصم.");
      setSuccessMsg("تم إضافة الخصم بنجاح.");
      setNewDiscount({ target_type: "global", target_id: "", discount_type: "percentage", discount_value: 0 });
      fetchDiscounts(selectedTier.id);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!confirm("هل أنت متأكد من حذف الخصم؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/memberships/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg("تم حذف الخصم بنجاح.");
        if (selectedTier) fetchDiscounts(selectedTier.id);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#ffffff",
    fontSize: "0.88rem",
    outline: "none",
    transition: "all 0.3s ease",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left 14px center",
    backgroundSize: "14px",
    paddingLeft: "36px",
    paddingRight: "14px",
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    padding: "24px",
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const subCardStyle = {
    background: "rgba(255, 255, 255, 0.01)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: "var(--text-muted)", fontWeight: "bold" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "2rem", animation: "spin 2s linear infinite" }}>🔄</span>
          <span>جاري تحميل بيانات العضويات...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Page Title & Desc */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff", margin: 0 }}>العضويات والخصومات الديناميكية</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          أنشئ مستويات عضويات مخصصة بناءً على سلوك شحن العملاء وعدد طلباتهم، وحدد خصومات تلقائية خاصة بكل مستوى لتمييز كبار العملاء والموزعين.
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: "12px 18px", backgroundColor: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "600" }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "12px 18px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRight: "4px solid var(--success-color)", color: "var(--success-color)", borderRadius: "10px", fontSize: "0.88rem", fontWeight: "600" }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Left Card: Membership Levels */}
        <div style={cardStyle}>
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#38bdf8", display: "flex", alignItems: "center", gap: "8px" }}>
              🏆 مستويات العضوية المتوفرة
            </h3>
          </div>
          
          {/* Add Level Form */}
          <form onSubmit={handleAddTier} style={subCardStyle}>
            <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>✨ إضافة مستوى عضوية جديد</h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>اسم مستوى العضوية:</span>
                <input 
                  type="text" 
                  placeholder="مثال: العضوية الذهبية" 
                  required 
                  value={newTier.name} 
                  onChange={e => setNewTier({...newTier, name: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>الأيقونة:</span>
                <input 
                  type="text" 
                  placeholder="⭐" 
                  value={newTier.icon} 
                  onChange={e => setNewTier({...newTier, icon: e.target.value})} 
                  style={{...inputStyle, textAlign: "center"}} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>نوع الشرط للتفعيل تلقائياً:</span>
                <select 
                  value={newTier.condition_type} 
                  onChange={e => setNewTier({...newTier, condition_type: e.target.value})} 
                  style={selectStyle}
                >
                  <option value="total_deposited">إجمالي المبالغ المشحونة (USD)</option>
                  <option value="total_orders">إجمالي عدد الطلبات الناجحة</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>القيمة المستهدفة:</span>
                <input 
                  type="number" 
                  placeholder="القيمة" 
                  required 
                  min="0" 
                  step="any" 
                  value={newTier.condition_value} 
                  onChange={e => setNewTier({...newTier, condition_value: e.target.value})} 
                  style={inputStyle} 
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>اللون المميز للمستوى (شكل جمالي):</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="color" 
                  value={newTier.color} 
                  onChange={e => setNewTier({...newTier, color: e.target.value})} 
                  style={{ width: "60px", height: "38px", border: "none", borderRadius: "8px", cursor: "pointer", background: "transparent" }} 
                />
                <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontFamily: "monospace" }}>{newTier.color}</span>
              </div>
            </div>

            <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "12px", justifyContent: "center", borderRadius: "10px", fontSize: "0.88rem" }}>
              🚀 إضافة مستوى العضوية
            </button>
          </form>

          {/* Levels List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tiers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                لا توجد مستويات عضويات مضافة حالياً.
              </div>
            ) : (
              tiers.map(tier => (
                <div 
                  key={tier.id} 
                  onClick={() => handleSelectTier(tier)}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "16px", 
                    backgroundColor: "rgba(255,255,255,0.01)", 
                    borderRadius: "14px",
                    cursor: "pointer", 
                    border: selectedTier?.id === tier.id ? `2px solid ${tier.color}` : "2px solid rgba(255, 255, 255, 0.04)",
                    boxShadow: selectedTier?.id === tier.id ? `0 0 15px ${tier.color}22` : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTier?.id !== tier.id) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTier?.id !== tier.id) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.8rem", background: "rgba(255,255,255,0.03)", width: "45px", height: "45px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{tier.icon}</span>
                    <div>
                      <div style={{ fontWeight: "800", color: tier.color, fontSize: "0.95rem" }}>{tier.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        الشرط: {tier.condition_type === 'total_deposited' ? 'شحن رصيد بقيمة' : 'طلبات مكتملة بعدد'} ≥ <strong style={{ color: "#fff" }}>{tier.condition_value}</strong> {tier.condition_type === 'total_deposited' ? 'USD' : 'طلب'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteTier(tier.id); }}
                    className="action-btn btn-danger-premium"
                    style={{ padding: "6px 12px" }}
                  >
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Card: Discounts for selected tier */}
        <div style={cardStyle}>
          {selectedTier ? (
            <>
              <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: selectedTier.color, display: "flex", alignItems: "center", gap: "8px" }}>
                  🎯 خصومات مستوى ({selectedTier.name} {selectedTier.icon})
                </h3>
                <span style={{ background: `${selectedTier.color}15`, color: selectedTier.color, border: `1px solid ${selectedTier.color}30`, padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "bold" }}>
                  نشط ومحدد
                </span>
              </div>

              {/* Add Discount Form */}
              <form onSubmit={handleAddDiscount} style={subCardStyle}>
                <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>💸 إضافة خصم / تقليل هامش الربح</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>تطبيق الخصم على:</span>
                  <select 
                    value={newDiscount.target_type} 
                    onChange={e => setNewDiscount({...newDiscount, target_type: e.target.value, target_id: ""})} 
                    style={selectStyle}
                  >
                    <option value="global">عام (على جميع الخدمات والبرامج)</option>
                    <option value="category">على قسم محدد فقط</option>
                    <option value="service">على خدمة / أداة معينة فقط</option>
                  </select>
                </div>

                {newDiscount.target_type === 'category' && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>اختر القسم المطلوب:</span>
                    <select 
                      required 
                      value={newDiscount.target_id} 
                      onChange={e => setNewDiscount({...newDiscount, target_id: e.target.value})} 
                      style={selectStyle}
                    >
                      <option value="">اختر القسم...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {newDiscount.target_type === 'service' && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>اختر الخدمة المطلوبة:</span>
                    <select 
                      required 
                      value={newDiscount.target_id} 
                      onChange={e => setNewDiscount({...newDiscount, target_id: e.target.value})} 
                      style={selectStyle}
                    >
                      <option value="">اختر الخدمة...</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>نوع القيمة:</span>
                    <select 
                      value={newDiscount.discount_type} 
                      onChange={e => setNewDiscount({...newDiscount, discount_type: e.target.value})} 
                      style={selectStyle}
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت ($)</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>قيمة الخصم:</span>
                    <input 
                      type="number" 
                      placeholder="خصم" 
                      required 
                      min="0" 
                      step="any" 
                      value={newDiscount.discount_value} 
                      onChange={e => setNewDiscount({...newDiscount, discount_value: e.target.value})} 
                      style={inputStyle} 
                    />
                  </div>
                </div>
                
                <button type="submit" className="btn-add-premium" style={{ width: "100%", padding: "12px", justifyContent: "center", borderRadius: "10px", fontSize: "0.88rem", backgroundColor: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  ✓ حفظ الخصم وتفعيله
                </button>
              </form>

              {/* Discounts List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {discounts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    لا توجد خصومات مضافة حالياً لهذا المستوى.
                  </div>
                ) : (
                  discounts.map(d => {
                    let targetName = "عام (كل الخدمات)";
                    if (d.target_type === 'category') targetName = `قسم: ${categories.find(c => c.id == d.target_id)?.name || "قسم محذوف"}`;
                    if (d.target_type === 'service') targetName = `خدمة: ${services.find(s => s.id == d.target_id)?.name || "خدمة محذوفة"}`;

                    return (
                      <div 
                        key={d.id} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "12px 16px", 
                          backgroundColor: "rgba(255,255,255,0.01)", 
                          border: "1px solid rgba(255,255,255,0.04)", 
                          borderRadius: "12px" 
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "800", color: "#34d399", fontSize: "0.9rem" }}>
                            خصم {d.discount_value}{d.discount_type === 'percentage' ? '%' : ' USD'}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>المستهدف: <strong style={{ color: "#e2e8f0" }}>{targetName}</strong></div>
                        </div>
                        <button 
                          onClick={() => handleDeleteDiscount(d.id)}
                          className="action-btn btn-danger-premium"
                          style={{ padding: "6px 12px" }}
                        >
                          إزالة
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ──── Members Management Section ──── */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "20px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#a78bfa", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  👥 أعضاء العضوية (إضافة يدوية)
                </h4>

                {/* Search and Add */}
                <div style={subCardStyle}>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>ابحث باسم المستخدم لإضافته يدوياً:</span>
                  <input 
                    type="text"
                    placeholder="اكتب اسم المستخدم للبحث..."
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    style={inputStyle}
                  />

                  {/* Search Results / Users List */}
                  {(() => {
                    const existingMemberIds = new Set(tierMembers.map(m => Number(m.customer_id)));
                    const filtered = allCustomers.filter(c => {
                      const matchesSearch = memberSearch.trim() === "" || 
                        c.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
                        (c.email && c.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
                        (c.phone && c.phone.includes(memberSearch));
                      return matchesSearch && !existingMemberIds.has(Number(c.id));
                    }).slice(0, 10);
                    
                    return filtered.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "250px", overflowY: "auto", marginTop: "10px" }}>
                        <span style={{ fontSize: "0.72rem", color: "#a78bfa", fontWeight: "bold" }}>المستخدمين المتاحين للإضافة:</span>
                        {filtered.map(c => (
                          <div 
                            key={c.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.3)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>👤 {c.username}</div>
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                {c.email || "—"} • الرصيد: {Number(c.balance || 0).toFixed(2)} USD
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddMember(c.id)}
                              style={{
                                background: "rgba(167, 139, 250, 0.15)",
                                border: "1px solid rgba(167, 139, 250, 0.3)",
                                color: "#a78bfa",
                                padding: "5px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                fontWeight: "bold"
                              }}
                            >
                              + إضافة
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "10px", color: "#94a3b8", fontSize: "0.82rem" }}>
                        {memberSearch.trim() !== "" ? "لا يوجد مستخدم بهذا الاسم أو مضاف بالفعل." : "لا يوجد مستخدمين آخرين متاحين للإضافة."}
                      </div>
                    );
                  })()}
                </div>

                {/* Current Members List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                  {tierMembers.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "18px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      لا يوجد أعضاء مضافين يدوياً لهذا المستوى.
                    </div>
                  ) : (
                    tierMembers.map(m => (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          backgroundColor: "rgba(167, 139, 250, 0.03)",
                          border: "1px solid rgba(167, 139, 250, 0.08)",
                          borderRadius: "12px"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "800", color: "#fff", fontSize: "0.88rem" }}>
                            👤 {m.username || `مستخدم #${m.customer_id}`}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                            {m.email || "—"} {m.notes ? ` • ${m.notes}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="action-btn btn-danger-premium"
                          style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                        >
                          إزالة
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px", color: "var(--text-muted)", textAlign: "center", gap: "12px" }}>
              <span style={{ fontSize: "3rem" }}>👑</span>
              <div style={{ fontSize: "0.9rem", fontWeight: "bold", maxWidth: "280px", lineHeight: 1.6 }}>
                يرجى اختيار مستوى عضوية من القائمة الجانبية لعرض وتعديل خصوماته وأعضائه.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
