"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { API_BASE_URL } from "@/config";

export default function ApiDocsPage() {
  const [customer, setCustomer] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [allowedIpsText, setAllowedIpsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingIps, setSavingIps] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      Promise.all([
        fetch(`${API_BASE_URL}/api/customer/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customer/api-key`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      .then(async ([resMe, resApi]) => {
        if (resMe.ok) setCustomer(await resMe.json());
        if (resApi.ok) {
          const apiJson = await resApi.json();
          setApiData(apiJson);
          try {
            const ips = JSON.parse(apiJson.api_allowed_ips || "[]");
            setAllowedIpsText(ips.join(", "));
          } catch(e) {}
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSaveIps = async () => {
    const token = localStorage.getItem("customer_token");
    if (!token) return;
    
    setSavingIps(true);
    const ipsArray = allowedIpsText.split(",").map(i => i.trim()).filter(i => i);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/api-key/allowed-ips`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ips: ipsArray })
      });
      const data = await res.json();
      if (res.ok) {
        alert("تم تحديث عناوين الـ IP بنجاح.");
      } else {
        alert("خطأ: " + data.message);
      }
    } catch(e) {
      alert("حدث خطأ أثناء الحفظ.");
    } finally {
      setSavingIps(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm("هل أنت متأكد من تغيير المفتاح؟ المفتاح القديم سيتوقف عن العمل فوراً.")) return;
    
    const token = localStorage.getItem("customer_token");
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/api-key/regenerate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApiData(prev => ({ ...prev, api_key: data.api_key }));
        alert("تم توليد مفتاح جديد بنجاح.");
      } else {
        alert("خطأ: " + data.message);
      }
    } catch(e) {
      alert("حدث خطأ أثناء توليد المفتاح.");
    }
  };

  const handleRequestApi = async () => {
    const token = localStorage.getItem("customer_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/request-api`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setApiData(prev => ({ ...prev, api_requested: true }));
        alert("تم إرسال طلب تفعيل الـ API للإدارة بنجاح.");
      } else {
        const data = await res.json();
        alert("خطأ: " + data.message);
      }
    } catch (e) {
      alert("حدث خطأ أثناء إرسال الطلب.");
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: "40px 20px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", marginBottom: "20px", color: "var(--primary-color)" }}>
          إعدادات وشرح ربط الـ API
        </h1>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "rgba(30, 41, 59, 0.7)", padding: "30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          
          <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "8px", borderRight: "4px solid #3b82f6", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 10px", color: "#60a5fa" }}>مرحباً بك في نظام الـ API</h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#cbd5e1" }}>
              نظامنا متوافق بالكامل مع نظام (Dhru Fusion). يمكنك ربط سيرفرك الشخصي بنا بسهولة لجلب الخدمات وتقديم الطلبات تلقائياً.
            </p>
          </div>

          <h2 style={{ color: "#fff", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
            بيانات الربط الخاصة بك (API Credentials)
          </h2>
          
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "8px", marginBottom: "30px", fontSize: "1.1rem" }}>
            <div style={{ marginBottom: "15px" }}>
              <strong>رابط الـ API (URL):</strong> 
              <code style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "4px", margin: "0 10px", color: "#34d399", display: "inline-block", direction: "ltr" }}>
                https://arab-tech1.online/api/v1
              </code>
            </div>
            
            <div style={{ marginBottom: "15px" }}>
              <strong>اسم المستخدم (Username):</strong>
              <span style={{ margin: "0 10px", color: "#94a3b8" }}>
                {customer ? customer.username : "قم بتسجيل الدخول لمعرفة بياناتك"}
              </span>
            </div>

            {apiData ? (
              apiData.api_enabled ? (
                <>
                  <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <strong>مفتاح الـ API (Key):</strong>
                    <code style={{ background: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "4px", color: "#fcd34d", direction: "ltr" }}>
                      {apiData.api_key || "لا يوجد مفتاح (قم بالتوليد الآن)"}
                    </code>
                    <button 
                      onClick={handleRegenerateKey}
                      style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
                    >
                      توليد مفتاح جديد
                    </button>
                  </div>
                  
                  <div style={{ marginTop: "20px", background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#e2e8f0" }}>
                      عناوين الـ IP المسموحة (للحماية):
                    </label>
                    <input 
                      type="text" 
                      value={allowedIpsText}
                      onChange={(e) => setAllowedIpsText(e.target.value)}
                      placeholder="أدخل IP سيرفرك هنا. للعديد افصل بينها بفاصلة (,)"
                      style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #334155", background: "#0f172a", color: "white", marginBottom: "10px" }}
                    />
                    <button 
                      onClick={handleSaveIps}
                      disabled={savingIps}
                      style={{ background: "#10b981", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontSize: "0.95rem" }}
                    >
                      {savingIps ? "جاري الحفظ..." : "حفظ الـ IPs"}
                    </button>
                  </div>
                </>
              ) : apiData.api_requested ? (
                <div style={{ color: "#fbbf24", fontWeight: "bold", background: "rgba(245, 158, 11, 0.1)", padding: "15px", borderRadius: "8px" }}>
                  طلب تفعيل الـ API الخاص بك قيد المراجعة حالياً من قبل الإدارة.
                </div>
              ) : (
                <div style={{ color: "#f87171", fontWeight: "bold", background: "rgba(248, 113, 113, 0.1)", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <span>حساب الـ API الخاص بك غير مفعل حالياً.</span>
                  <button onClick={handleRequestApi} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                    طلب تفعيل حساب الـ API
                  </button>
                </div>
              )
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "12px", border: "1px dashed rgba(59, 130, 246, 0.3)" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}>🔒</span>
                <h3 style={{ color: "#60a5fa", marginBottom: "10px", fontSize: "1.5rem" }}>يجب تسجيل الدخول أولاً</h3>
                <p style={{ color: "#94a3b8", marginBottom: "25px", fontSize: "1.1rem" }}>
                  يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد للتمكن من طلب تفعيل الـ API وعرض بيانات الربط الخاصة بك.
                </p>
                <a href="/login" style={{ display: "inline-block", background: "linear-gradient(135deg, var(--primary-color) 0%, #8b5cf6 100%)", color: "white", padding: "12px 30px", borderRadius: "30px", fontWeight: "bold", textDecoration: "none", fontSize: "1.1rem", boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)", transition: "transform 0.2s" }}>
                  تسجيل الدخول / حساب جديد
                </a>
              </div>
            )}
          </div>

          <h2 style={{ color: "#fff", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
            إعدادات لوحة التحكم لديك (Dhru Fusion)
          </h2>
          <ul style={{ lineHeight: 1.8, color: "#cbd5e1", fontSize: "1.05rem", paddingRight: "20px" }}>
            <li>توجه إلى لوحة تحكم سيرفرك (Settings -&gt; API Providers).</li>
            <li>اضغط على <strong>Add Provider</strong>.</li>
            <li>اختر <strong>Dhru Fusion API</strong>.</li>
            <li>أدخل بيانات الربط المذكورة في الأعلى (الرابط، اسم المستخدم، مفتاح الـ API).</li>
            <li>اضغط <strong>Save</strong> للحفظ ثم قم بعمل <strong>Sync</strong> لجلب الخدمات.</li>
          </ul>

          <div style={{ marginTop: "40px", padding: "20px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <h3 style={{ margin: "0 0 10px", color: "#fbbf24" }}>⚠️ ملاحظات هامة</h3>
            <ul style={{ margin: 0, paddingRight: "20px", color: "#fef3c7", lineHeight: 1.6 }}>
              <li>لن تعمل الطلبات إذا لم تقم بإضافة الـ IP الخاص بسيرفرك في القائمة البيضاء (IP Whitelist) بالأعلى.</li>
              <li>جميع الطلبات القادمة من الـ API سيتم تسعيرها بناءً على نسبة المكسب (Markup) المحددة لحسابك بواسطة الإدارة.</li>
              <li>تأكد من وجود رصيد كافٍ في محفظتك لدينا، وإلا فسيتم رفض طلباتك تلقائياً.</li>
              <li>بعض الطلبات الخاصة عبر الـ API قد تتطلب موافقة يدوية من قبل الإدارة قبل البدء في التنفيذ.</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
