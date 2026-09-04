"use client";

import React from "react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "30px 15px 60px" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(250, 204, 21, 0.1)", border: "1px solid rgba(250, 204, 21, 0.3)",
          padding: "8px 18px", borderRadius: "999px", color: "#facc15", fontSize: "0.9rem",
          fontWeight: "bold", marginBottom: "15px"
        }}>
          <span>🔄</span>
          <span>Official Refund & Guarantee Policy</span>
        </div>

        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "12px" }}>
          سياسة الاسترجاع والضمان — Al-Wefaq Server
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "650px", margin: "0 auto", lineHeight: "1.6" }}>
          نحن نضمن حقوقك كاملة ونسعى لتقديم أعلى معايير الجودة والسرعة في تفعيل الخدمات الرقمية وأكواد السيرفرات.
        </p>
      </div>

      {/* Main Content */}
      <div className="glass-panel" style={{
        padding: "40px", borderRadius: "24px",
        border: "1px solid rgba(250, 204, 21, 0.3)", background: "rgba(250, 204, 21, 0.02)",
        marginBottom: "35px"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
          
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "24px", borderRadius: "18px", border: "1px solid var(--border-glass)" }}>
            <h3 style={{ color: "#facc15", fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>1️⃣</span> طبيعة المنتجات الرقمية
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              نظراً لأن منتجاتنا هي خدمات رقمية وأكواد تفعيل تُرسل فورياً أو تُنفذ مباشرة على السيرفرات، فإن المبالغ المدفوعة غير قابلة للاسترجاع بمجرد تسليم الكود أو بدء تنفيذ الطلب على السيرفر، إلا في الحالات الاستثنائية المذكورة.
            </p>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <h3 style={{ color: "#34d399", fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>2️⃣</span> حالات استرجاع الرصيد المؤكدة (100%)
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              <li><strong>• فشل الخدمة:</strong> إذا تم رفض الطلب من قبل السيرفر المصدر أو لم نتمكن من توفير الكود، يُعاد المبلغ كاملاً وتلقائياً لمحفظتك.</li>
              <li><strong>• تأخر السيرفرات:</strong> في حال وجود تأخير تقني يتجاوز المدة القصوى الموضحة في وصف الخدمة وسماح السيرفر بالإلغاء.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <h3 style={{ color: "#f87171", fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>3️⃣</span> حالات لا يشملها الاسترجاع
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
              <li>• إدخال العميل لرقم IMEI أو SN أو اسم حساب خاطئ.</li>
              <li>• طلب خدمة غير متوافقة مع حالة الجهاز الفنية أو حمايته.</li>
              <li>• تغيير رأي العميل أو الإلغاء بعد بدء التنفيذ ورفعه للسيرفر.</li>
              <li>• الأكواد المستلمة التي تم تفعيلها واستخدامها بنجاح.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(56, 189, 248, 0.05)", padding: "24px", borderRadius: "18px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            <h3 style={{ color: "#38bdf8", fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>4️⃣</span> سحب الأرصدة من المحفظة
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              يُحفظ الرصيد المسترجع في محفظتك الرقمية للاستخدام في أي طلبات لاحقة. في حال الرغبة في السحب الخارجي، قد تخضع العملية لرسوم التحويل وبوابات الدفع ومراجعة الإدارة.
            </p>
          </div>

        </div>
      </div>

      {/* CTA Help */}
      <div className="glass-panel" style={{
        padding: "35px", borderRadius: "24px", display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px"
      }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "6px" }}>
            هل تواجه مشكلة بطلبك أو ترغب بطلب استرجاع؟
          </h2>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>
            تحدث فوراً مع المساعد الذكي وسيقوم برفع التذكرة إلى إدارة السيرفر عبر تيليجرام.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/tickets/new"
            style={{
              background: "linear-gradient(135deg, #00b4d8, #2563eb)", color: "#fff",
              padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none"
            }}
          >
            فتح تذكرة استرجاع ذكية 🤖
          </Link>
          <Link
            href="/terms"
            className="glass-btn"
            style={{ padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none" }}
          >
            الشروط العامة
          </Link>
        </div>
      </div>

    </div>
  );
}
