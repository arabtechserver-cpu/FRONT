"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  const [showRefundModal, setShowRefundModal] = useState(false);

  const scrollToRefund = () => {
    const el = document.getElementById("refund-policy");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="terms-page-redesign" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 15px 60px" }}>
      
      {/* ── HUGE Header ── */}
      <div style={{ textAlign: "center", marginBottom: "50px", marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Big 3D Shield / Document Icon */}
        <div style={{ position: "relative", marginBottom: "30px", width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
           <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }}></div>
           <div style={{ 
             width: "160px", height: "160px", background: "var(--bg-glass-deep)", borderRadius: "30px", 
             border: "2px solid var(--border-glass)", boxShadow: "0 20px 40px var(--bg-secondary)",
             display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", position: "relative", zIndex: 1
           }}>
             🛡️
           </div>
        </div>

        <h1 style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: "16px", color: "var(--text-main)", letterSpacing: "-1px" }}>
          الشروط وسياسة الاسترجاع والضمان
        </h1>
        
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "650px", margin: "0 auto", lineHeight: "1.6" }}>
          نحرص في منصة <strong>سيرفر الوفاق</strong> على الشفافية التامة ووضوح العلاقة مع عملائنا. يرجى قراءة شروط الاستخدام وسياسة الاسترجاع والضمان بعناية قبل إتمام أي طلب.
        </p>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={scrollToRefund}
            style={{
              background: "rgba(250, 204, 21, 0.15)", border: "1px solid #facc15", color: "#facc15",
              padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer"
            }}
          >
            🔄 الانتقال لسياسة الاسترجاع مباشرة
          </button>
          <Link
            href="/tickets/new"
            style={{
              background: "linear-gradient(135deg, #00b4d8, #2563eb)", color: "#fff",
              padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", fontSize: "0.95rem",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>🤖</span>
            <span>فتح تذكرة دعم بالذكاء الاصطناعي</span>
          </Link>
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "50px" }}>
        
        {/* RIGHT COLUMN: Accordion Terms */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "16px" }}>
           
           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>1. قبول الشروط</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>باستخدامك لمنصة الوفاق، فإنك توافق التزاماً كاملاً بجميع الشروط والأحكام والسياسات المعلنة.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>📝</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>2. طبيعة الخدمات الرقمية</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>نقدم خدمات رقمية تشمل تفعيلات السيرفرات، أدوات السوفت وير، واشتراكات البرامج الموجهة للاستخدام القانوني والمهني فقط.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>🖥️</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>3. صحة البيانات والمسؤولية</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>العميل مسؤول مسؤولية كاملة عن صحة البيانات المدخلة (مثل IMEI أو السيريال SN أو الحساب). المنصة غير مسؤولة عن بيانات أدخلها العميل بشكل خاطئ.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>👤</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>4. حماية الحساب والمحفظة</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>أنت مسؤول عن سرية بيانات الدخول ورصيد المحفظة. توفر المنصة ميزات أمان متقدمة تشمل التحقق بالبصمة وكلمة مرور المعاملات.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>🔒</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>5. التحديثات والتعديلات</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>قد نقوم بتحديث الشروط والأسعار بصفة دورية، ويعد استمرارك في استخدام المنصة موافقة على أحدث نسخة من الشروط.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>✍️</div>
           </div>

        </div>

        {/* LEFT COLUMN: Summary Cards */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Refund Policy Card */}
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", border: "1px solid rgba(250, 204, 21, 0.3)", background: "rgba(250, 204, 21, 0.03)" }}>
             <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
               <span style={{ color: "#facc15" }}>🔄</span> سياسة الاسترجاع
             </h2>
             <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
               نحن نسعى لرضاك التام، وفي حال وجود أي خلل تقني يتم تطبيق شروط الاسترجاع الآتية:
             </p>
             <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> رد تلقائي كامل للرصيد إلى المحفظة في حال رفض السيرفر المصدر للطلب.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> إمكانية طلب إلغاء واسترجاع في حال تأخر السيرفر عن الوقت الأقصى.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> معالجة سريعة لطلبات الاسترجاع والتذاكر عبر الذكاء الاصطناعي وتيليجرام.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>❌</span> لا يشمل الاسترجاع الأكواد المستهلكة بنجاح أو بيانات IMEI الخاطئة من العميل.</li>
             </ul>
             <button
               onClick={() => setShowRefundModal(true)}
               className="glass-btn"
               style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #facc15", color: "#facc15", background: "transparent", fontWeight: "bold", cursor: "pointer" }}
             >
               عرض سياسة الاسترجاع الكاملة
             </button>
          </div>

          {/* Official Document Card */}
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", border: "1px solid rgba(56, 189, 248, 0.3)", background: "rgba(56, 189, 248, 0.03)", display: "flex", alignItems: "center", gap: "20px" }}>
             <div style={{ flex: 1 }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", color: "var(--text-main)" }}>وثيقة رسمية ومعتمدة</h3>
               <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                 تخضع هذه السياسات لأنظمة حماية المستهلك والمعاملات الرقمية المعتمدة لدى منصة سيرفر الوفاق.
               </p>
             </div>
             <div style={{ fontSize: "3rem", color: "#38bdf8" }}>🛡️</div>
          </div>

        </div>

      </div>

      {/* ── DETAILED FULL REFUND POLICY SECTION (Target for #refund-policy) ── */}
      <div id="refund-policy" className="glass-panel" style={{
        padding: "40px", borderRadius: "28px", marginBottom: "50px",
        border: "1px solid rgba(250, 204, 21, 0.35)", background: "rgba(250, 204, 21, 0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>
          <span style={{ fontSize: "2.5rem" }}>🔄</span>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
              سياسة الاسترجاع والضمان التفصيلية (Refund Policy)
            </h2>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: "0.95rem" }}>
              الشروط والأحكام الكاملة لاسترجاع الرصيد وإلغاء الطلبات الرقمية
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
          
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-glass)" }}>
            <h3 style={{ color: "#facc15", fontSize: "1.15rem", fontWeight: 800, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>1️⃣</span> طبيعة المنتجات الرقمية
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
              نظراً لأن المنتجات المقدمة هي خدمات رقمية وأكواد تفعيل تُنفذ مباشرة على السيرفرات والمصادر الدولية، فإن المبالغ المدفوعة غير قابلة للاسترجاع بعد بدء التنفيذ أو تسليم الكود بنجاح، باستثناء الحالات الموضحة أدناه.
            </p>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <h3 style={{ color: "#34d399", fontSize: "1.15rem", fontWeight: 800, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>2️⃣</span> حالات استرجاع الرصيد المؤكدة (100%)
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <li><strong>• فشل السيرفر:</strong> إذا تم رفض الطلب (Rejected) من المصدر، يتم إرجاع المبلغ كاملاً وبشكل تلقائي إلى محفظتك.</li>
              <li><strong>• تأخر غير مبرر:</strong> في حال تجاوزت مدة التنفيذ الحد الأقصى المعلن في وصف الخدمة ووافق السيرفر المصدر على الإلغاء.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <h3 style={{ color: "#f87171", fontSize: "1.15rem", fontWeight: 800, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>3️⃣</span> حالات لا يشملها الاسترجاع
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              <li>• إدخال رقم IMEI أو SN أو اسم حساب خاطئ من قبل العميل.</li>
              <li>• طلب خدمة غير متوافقة مع حالة الجهاز الفنية أو حمايته.</li>
              <li>• محاولة الإلغاء بعد أن بدأ السيرفر المصدر في المعالجة وأقفل إمكانية الإلغاء.</li>
              <li>• الأكواد الصحيحة التي تم تسليمها وتفعيلها بنجاح.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(56, 189, 248, 0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
            <h3 style={{ color: "#38bdf8", fontSize: "1.15rem", fontWeight: 800, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>4️⃣</span> آلية استرداد الرصيد والمحفظة
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
              يتم رد المبالغ المستحقة مباشرة إلى رصيد محفظة العميل الرقمية داخل الموقع لاستخدامها في أي وقت دون أي اقتطاع. وفي حالات سحب الرصيد خارج الموقع قد تخضع العملية لرسوم بوابات الدفع وموافقة الإدارة.
            </p>
          </div>

        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Link
            href="/tickets/new"
            style={{
              background: "linear-gradient(135deg, #00b4d8, #2563eb)", color: "#fff",
              padding: "14px 28px", borderRadius: "14px", fontWeight: 900, fontSize: "1.05rem",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 15px rgba(0, 180, 216, 0.3)"
            }}
          >
            <span>🤖</span>
            <span>تقديم طلب استرجاع عبر المساعد الذكي وتيليجرام</span>
          </Link>
        </div>
      </div>

      {/* ── Help Banner ── */}
      <div className="glass-panel" style={{ padding: "40px", borderRadius: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <div style={{ fontSize: "3rem" }}>🎧</div>
           <div>
             <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "8px", color: "var(--text-main)" }}>لديك سؤال أو تحتاج إلى مساعدة؟</h2>
             <p style={{ margin: 0, color: "var(--text-muted)" }}>فريق الدعم لدينا والذكاء الاصطناعي جاهزان لمساعدتك فورياً.</p>
           </div>
         </div>
         <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
           <Link href="/tickets/new" className="glass-btn" style={{ padding: "14px 24px", borderRadius: "14px", fontWeight: "bold", background: "var(--bg-glass)" }}>
             فتح تذكرة دعم ذكية
           </Link>
           <a href="https://wa.me/249118100809" target="_blank" rel="noopener noreferrer" className="glass-btn glass-btn-primary" style={{ padding: "14px 24px", borderRadius: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
             تواصل مع الدعم الفني
             <span>🎧</span>
           </a>
         </div>
      </div>

      {/* ── MODAL: Full Refund Policy ── */}
      {showRefundModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999, padding: "20px"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "750px", width: "100%", maxHeight: "90vh", overflowY: "auto",
            borderRadius: "24px", padding: "30px", background: "var(--bg-secondary)",
            border: "1px solid rgba(250, 204, 21, 0.4)", position: "relative"
          }}>
            <button
              onClick={() => setShowRefundModal(false)}
              style={{
                position: "absolute", top: "20px", left: "20px", background: "transparent",
                border: "none", color: "var(--text-main)", fontSize: "1.8rem", cursor: "pointer"
              }}
            >
              &times;
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "2rem" }}>🔄</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#facc15", margin: 0 }}>
                سياسة الاسترجاع الكاملة — Al-Wefaq Server
              </h2>
            </div>

            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "16px" }}>
              <p>
                <strong>1. طبيعة الخدمات الرقمية:</strong><br />
                جميع المنتجات والتفعيلات الرقمية التي يتم تسليمها فورياً أو تنفيذها على السيرفرات تخضع لسياسة الاسترجاع الاستثنائية المعتمدة هنا.
              </p>

              <p>
                <strong>2. حالات استرداد الرصيد المؤكدة:</strong><br />
                - يتم إرجاع المبلغ كاملاً وبشكل تلقائي لمحفظة العميل عند رفض السيرفر المصدر للطلب لأي سبب تقني.<br />
                - يحق للعميل طلب إلغاء واسترجاع في حال وجود تأخير تقني خارج عن المألوف يتجاوز الحد الأقصى المعلن في وصف الخدمة بشرط سماح السيرفر المصدر بالإلغاء.
              </p>

              <p>
                <strong>3. حالات لا يسري عليها الاسترجاع:</strong><br />
                - الأكواد التي تم تسليمها وتعمل بنجاح وتم استهلاكها من قبل العميل.<br />
                - إدخال بيانات أو سيريال أو IMEI غير صحيح من قبل العميل.<br />
                - طلب خدمة لجهاز مقيد بحماية أو حالة غير مطابقة لشروط الخدمة.<br />
                - تغيير الرأي بعد بدء التنفيذ الفعلي من قبل السيرفر.
              </p>

              <p>
                <strong>4. الدعم الفني وفتح تذكرة:</strong><br />
                إذا كانت لديك مشكلة بطلبك أو ترغب في الاستفسار عن استرجاع، يمكنك التحدث مباشرة مع المساعد الذكي لرفع التذكرة فوراً لتيليجرام الإدارة.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "25px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowRefundModal(false)}
                className="glass-btn"
                style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: "bold" }}
              >
                إغلاق النافذة
              </button>
              <Link
                href="/tickets/new"
                onClick={() => setShowRefundModal(false)}
                style={{
                  background: "linear-gradient(135deg, #00b4d8, #2563eb)", color: "#fff",
                  padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", textDecoration: "none"
                }}
              >
                فتح تذكرة دعم الآن 🤖
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
