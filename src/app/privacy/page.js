"use client";

import Link from "next/link";
import React from "react";

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", direction: "rtl" }}>
      <div className="glass-panel" style={{ padding: "40px", borderRadius: "24px", backdropFilter: "blur(20px)", background: "rgba(10, 15, 30, 0.7)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "30px" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "15px", filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))" }}>🔒</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 15px 0", background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            سياسة الخصوصية
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            نحن في منصة "عرب تك" نأخذ خصوصيتك بجدية تامة. توضح هذه السياسة كيف نقوم بجمع معلوماتك، استخدامها، وحمايتها.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "24px", transition: "transform 0.3s ease, background 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem", color: "var(--primary-color)" }}>1️⃣</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                المعلومات التي نجمعها
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
              نقوم بجمع المعلومات التي تقدمها لنا بشكل مباشر عند إنشاء حساب، تقديم طلب خدمة، أو التواصل مع الدعم الفني. تشمل هذه المعلومات: اسم المستخدم، عنوان البريد الإلكتروني، رقم الهاتف، ومعلومات الفواتير.
            </p>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "24px", transition: "transform 0.3s ease, background 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem", color: "var(--primary-color)" }}>2️⃣</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                كيف نستخدم معلوماتك
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
              نستخدم معلوماتك الشخصية لتقديم خدماتنا وتحسينها، معالجة مدفوعاتك (عبر PayPal أو البوابات الأخرى)، التواصل معك بشأن طلباتك، وإرسال تنبيهات الأمان أو التحديثات المهمة المتعلقة بالمنصة.
            </p>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "24px", transition: "transform 0.3s ease, background 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem", color: "var(--primary-color)" }}>3️⃣</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                حماية البيانات وأمنها
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
              تُحفظ بياناتك على خوادم آمنة ومشفرة. نحن نستخدم تقنيات متقدمة مثل تشفير SSL لحماية بياناتك أثناء نقلها. كما لا نشارك أو نبيع بياناتك الشخصية لأي جهات خارجية لأغراض تسويقية دون موافقتك الصريحة.
            </p>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "24px", transition: "transform 0.3s ease, background 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem", color: "var(--primary-color)" }}>4️⃣</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                مشاركة البيانات مع أطراف ثالثة
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
              قد نشارك بعض البيانات الضرورية فقط مع مزودي خدمات الدفع (مثل PayPal) أو مزودي خدمات الـ API لمعالجة طلباتك بنجاح. هؤلاء الأطراف ملزمون بالحفاظ على سرية معلوماتك.
            </p>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "24px", transition: "transform 0.3s ease, background 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.4rem", color: "var(--primary-color)" }}>5️⃣</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                تحديثات سياسة الخصوصية
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.8", margin: 0 }}>
              نحتفظ بالحق في تحديث أو تعديل سياسة الخصوصية في أي وقت. سيتم إشعارك بالتغييرات الجوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا. استمرارك في استخدام الموقع يعني موافقتك على السياسة المعدلة.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ marginTop: "40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "30px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
            إذا كانت لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة الدعم.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            padding: "12px 30px",
            background: "linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, #2563eb 100%)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "12px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)"
          }}>
            العودة للرئيسية
          </Link>
        </div>

      </div>
    </div>
  );
}
