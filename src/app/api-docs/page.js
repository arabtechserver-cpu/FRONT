"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { API_BASE_URL } from "@/config";

export default function ApiDocsPage() {
  const [customer, setCustomer] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      fetch(`${API_BASE_URL}/api/customer/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setCustomer(data);
          // Wait, the /me endpoint doesn't return api_key by default for security?
          // Let's check, if it does, use it. If not, we will just show "تواصل مع الإدارة".
          // We did not add api_key to /me in customerRoutes, so we will fetch it from a specific route if needed,
          // or just tell the user to request it. But the user asked: "علشان اشغل API للعميل اضيف ID دارس للسيرفر او لاجيهاز".
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <MainLayout>
      <div className="container" style={{ padding: "40px 20px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", marginBottom: "20px", color: "var(--primary-color)" }}>
          شرح ربط الـ API (للموزعين)
        </h1>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", background: "rgba(30, 41, 59, 0.7)", padding: "30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          
          <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "15px", borderRadius: "8px", borderRight: "4px solid #3b82f6", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 10px", color: "#60a5fa" }}>مرحباً بك في نظام الـ API</h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: "#cbd5e1" }}>
              نظامنا متوافق بالكامل مع نظام (Dhru Fusion). يمكنك ربط سيرفرك الشخصي بنا بسهولة لجلب الخدمات وتقديم الطلبات تلقائياً.
            </p>
          </div>

          <h2 style={{ color: "#fff", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
            بيانات الربط الأساسية (API Credentials)
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
                {customer ? customer.username : "اسم المستخدم الخاص بك لدينا"}
              </span>
            </div>

            <div>
              <strong>مفتاح الـ API (API Key):</strong>
              <span style={{ margin: "0 10px", color: "#f87171", fontWeight: "bold" }}>
                للحصول على مفتاح الـ API وتفعيل الحساب، يرجى التواصل مع الإدارة وتزويدهم بالـ (IP) الخاص بسيرفرك ليتم إضافته للقائمة البيضاء.
              </span>
            </div>
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
              <li>لن تعمل الطلبات إذا لم يكن الـ IP الخاص بسيرفرك مضافاً لدينا في اللوحة حمايةً لحسابك.</li>
              <li>جميع الطلبات القادمة من الـ API سيتم تسعيرها بناءً على نسبة المكسب (Markup) المحددة لحسابك.</li>
              <li>تأكد من وجود رصيد كافٍ في محفظتك لدينا، وإلا فسيتم رفض طلباتك تلقائياً.</li>
              <li>بعض الطلبات الخاصة عبر الـ API قد تتطلب موافقة يدوية من قبل الإدارة قبل البدء في التنفيذ.</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
