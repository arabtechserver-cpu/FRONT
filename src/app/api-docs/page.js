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
        fetch(`${API_BASE_URL}/api/customer/me`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch(`${API_BASE_URL}/api/customer/dev-settings`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
      ])
      .then(async ([resMe, resApi]) => {
        if (resMe && resMe.ok) setCustomer(await resMe.json());
        if (resApi && resApi.ok) {
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
      const res = await fetch(`${API_BASE_URL}/api/customer/dev-settings/allowed-ips`, {
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
      const res = await fetch(`${API_BASE_URL}/api/customer/dev-settings/regenerate`, {
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
      <div className="container" style={{ padding: "40px 20px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", marginBottom: "20px", color: "var(--primary-color)" }}>
          إعدادات وشرح ربط الـ API
        </h1>
        
        <div className="glass-panel" style={{ maxWidth: "800px", margin: "0 auto", padding: "30px", display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "8px", borderRight: "4px solid var(--primary-color)" }}>
            <h3 style={{ margin: "0 0 10px", color: "var(--primary-color)" }}>مرحباً بك في نظام الـ API</h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "var(--text-muted)" }}>
              نظامنا متوافق بالكامل مع نظام (Dhru Fusion). يمكنك ربط سيرفرك الشخصي بنا بسهولة لجلب الخدمات وتقديم الطلبات تلقائياً، أو استخدام الربط البرمجي المباشر.
            </p>
          </div>

          <h2 style={{ color: "var(--text-main)", margin: 0, borderBottom: "1px solid rgba(128,128,128,0.1)", paddingBottom: "10px" }}>
            بيانات الربط الخاصة بك (API Credentials)
          </h2>
          
          <div style={{ background: "var(--bg-secondary, rgba(0,0,0,0.05))", padding: "20px", borderRadius: "8px", fontSize: "1.1rem" }}>
            <div style={{ marginBottom: "15px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
              <strong>رابط الـ API (URL):</strong> 
              <code style={{ background: "rgba(128,128,128,0.1)", padding: "6px 10px", borderRadius: "6px", color: "var(--success-color)", direction: "ltr", wordBreak: "break-all" }}>
                https://arab-tech1.online/api/v1
              </code>
            </div>
            
            <div style={{ marginBottom: "15px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
              <strong>اسم المستخدم (Username):</strong>
              <span style={{ color: "var(--text-muted)", wordBreak: "break-all" }}>
                {customer ? customer.username : "قم بتسجيل الدخول لمعرفة بياناتك"}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-color)" }}>
                <span style={{
                  display: "inline-block",
                  width: "30px", height: "30px",
                  border: "3px solid rgba(0, 180, 216, 0.2)",
                  borderTopColor: "var(--primary-color)",
                  borderRadius: "50%",
                  animation: "spin-spinner 1s linear infinite"
                }}></span>
                <div style={{ marginTop: "10px" }}>جاري التحميل...</div>
                <style>{`@keyframes spin-spinner { 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : apiData ? (
              apiData.api_enabled ? (
                <>
                  <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <strong>مفتاح الـ API (Key):</strong>
                    <code style={{ background: "rgba(128,128,128,0.1)", padding: "6px 10px", borderRadius: "6px", color: "var(--accent-color)", direction: "ltr", wordBreak: "break-all" }}>
                      {apiData.api_key || "لا يوجد مفتاح (قم بالتوليد الآن)"}
                    </code>
                    <button 
                      onClick={handleRegenerateKey}
                      className="glass-btn"
                      style={{ background: "var(--danger-color)", color: "white", padding: "8px 12px", borderRadius: "6px" }}
                    >
                      توليد مفتاح جديد
                    </button>
                  </div>
                  
                  <div style={{ marginTop: "20px", background: "var(--bg-secondary, rgba(0,0,0,0.02))", padding: "15px", borderRadius: "8px", border: "1px solid rgba(128,128,128,0.1)" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "var(--text-main)" }}>
                      عناوين الـ IP المسموحة (للحماية):
                    </label>
                    <input 
                      type="text" 
                      value={allowedIpsText}
                      onChange={(e) => setAllowedIpsText(e.target.value)}
                      placeholder="أدخل IP سيرفرك هنا. للعديد افصل بينها بفاصلة (,)"
                      className="form-input-premium"
                      style={{ marginBottom: "10px", background: "var(--bg-color)" }}
                    />
                    <button 
                      onClick={handleSaveIps}
                      disabled={savingIps}
                      className="glass-btn glass-btn-primary"
                      style={{ padding: "10px 20px" }}
                    >
                      {savingIps ? "جاري الحفظ..." : "حفظ الـ IPs"}
                    </button>
                  </div>
                </>
              ) : apiData.api_requested ? (
                <div style={{ color: "var(--accent-color)", fontWeight: "bold", background: "rgba(245, 158, 11, 0.1)", padding: "15px", borderRadius: "8px" }}>
                  طلب تفعيل الـ API الخاص بك قيد المراجعة حالياً من قبل الإدارة.
                </div>
              ) : (
                <div style={{ color: "var(--danger-color)", fontWeight: "bold", background: "rgba(248, 113, 113, 0.1)", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <span>حساب الـ API الخاص بك غير مفعل حالياً.</span>
                  <button onClick={handleRequestApi} className="glass-btn" style={{ background: "var(--danger-color)", color: "white", padding: "10px 20px" }}>
                    طلب تفعيل حساب الـ API
                  </button>
                </div>
              )
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "12px", border: "1px dashed rgba(59, 130, 246, 0.3)" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}>🔒</span>
                <h3 style={{ color: "var(--primary-color)", marginBottom: "10px", fontSize: "1.5rem" }}>يجب تسجيل الدخول أولاً</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "25px", fontSize: "1.1rem" }}>
                  يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد للتمكن من طلب تفعيل الـ API وعرض بيانات الربط الخاصة بك.
                </p>
                <a href="/login" className="glass-btn glass-btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                  تسجيل الدخول / حساب جديد
                </a>
              </div>
            )}
          </div>

          <h2 style={{ color: "var(--text-main)", margin: 0, borderBottom: "1px solid rgba(128,128,128,0.1)", paddingBottom: "10px" }}>
            طريقة 1: الربط عبر لوحة تحكم (Dhru Fusion)
          </h2>
          <ul style={{ lineHeight: 1.8, color: "var(--text-muted)", fontSize: "1.05rem", paddingRight: "20px", margin: 0 }}>
            <li>توجه إلى لوحة تحكم سيرفرك (Settings -&gt; API Providers).</li>
            <li>اضغط على <strong>Add Provider</strong>.</li>
            <li>اختر <strong>Dhru Fusion API</strong>.</li>
            <li>أدخل بيانات الربط المذكورة في الأعلى (الرابط، اسم المستخدم، مفتاح الـ API).</li>
            <li>اضغط <strong>Save</strong> للحفظ ثم قم بعمل <strong>Sync</strong> لجلب الخدمات.</li>
          </ul>

          <h2 style={{ color: "var(--text-main)", margin: 0, borderBottom: "1px solid rgba(128,128,128,0.1)", paddingBottom: "10px", marginTop: "10px" }}>
            طريقة 2: الربط البرمجي المباشر (Custom Scripts)
          </h2>
          <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.8 }}>
            <p>للمبرمجين الذين يرغبون بالاتصال بالـ API باستخدام كود برمجي (PHP, Python, JS..)، نستخدم معيار (Dhru Fusion). يجب إرسال طلب <strong>POST</strong> إلى <code>https://arab-tech1.online/api/v1</code>.</p>
            <p><strong>يجب إرسال الـ Parameters التالية إما كـ JSON Body أو كـ Form URL Encoded:</strong></p>
            <ul style={{ paddingRight: "20px" }}>
              <li><code>username</code>: اسم المستخدم الخاص بك المذكور أعلاه.</li>
              <li><code>api_key</code>: مفتاح الـ API الخاص بك المذكور أعلاه.</li>
              <li><code>action</code>: نوع العملية المراد تنفيذها.</li>
            </ul>
            <div style={{ background: "var(--bg-secondary, rgba(128,128,128,0.1))", padding: "15px", borderRadius: "8px", direction: "ltr", textAlign: "left", marginBottom: "15px" }}>
              <h4 style={{ color: "var(--primary-color)", margin: "0 0 10px 0" }}>الأوامر المتاحة (Actions):</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.9rem" }}>
                <li style={{ marginBottom: "10px" }}>
                  <code style={{ color: "var(--accent-color)" }}>accountinfo</code>: لعرض تفاصيل الحساب والرصيد.
                </li>
                <li style={{ marginBottom: "10px" }}>
                  <code style={{ color: "var(--accent-color)" }}>imeiservicelist</code>: لجلب قائمة الأقسام والخدمات مع الأسعار (شاملة نسبة الـ Markup).
                </li>
                <li style={{ marginBottom: "10px" }}>
                  <code style={{ color: "var(--accent-color)" }}>placeimeiorder</code>: لطلب خدمة. يجب إرفاق برامتر إضافي <code>PARAMETERS</code> يحتوي على <code>SERVICEID</code> ورقم الـ <code>IMEI</code> (أو الرابط).
                </li>
                <li>
                  <code style={{ color: "var(--accent-color)" }}>getimeiorder</code>: للاستعلام عن حالة الطلب. يجب إرفاق برامتر <code>ID</code> الذي يحتوي على رقم الطلب.
                </li>
              </ul>
            </div>
          </div>

          <div style={{ padding: "20px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <h3 style={{ margin: "0 0 10px", color: "var(--accent-color)" }}>⚠️ ملاحظات هامة</h3>
            <ul style={{ margin: 0, paddingRight: "20px", color: "var(--text-main)", lineHeight: 1.6 }}>
              <li>لن تعمل الطلبات إذا لم تقم بإضافة الـ IP الخاص بسيرفرك في القائمة البيضاء (IP Whitelist) بالأعلى.</li>
              <li>جميع الطلبات القادمة من الـ API سيتم تسعيرها بناءً على نسبة المكسب (Markup) المحددة لحسابك بواسطة الإدارة.</li>
              <li>تأكد من وجود رصيد كافٍ في محفظتك لدينا، وإلا فسيتم رفض طلباتك تلقائياً.</li>
              <li>بعض الطلبات الخاصة عبر الـ API قد تتطلب موافقة يدوية من قبل الإدارة قبل البدء في التنفيذ.</li>
            </ul>
          </div>
        </div>
      </div>
  );
}
