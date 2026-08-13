"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="terms-page-redesign" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      
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
          الشروط وسياسة الاسترجاع
        </h1>
        
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          نحرص في عرب تك سيرفر على الشفافية ووضوح العلاقة مع عملائنا. يرجى قراءة الشروط التالية وسياسة الاسترجاع بعناية قبل إتمام الطلب.
        </p>
      </div>

      {/* ── Two Column Layout ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "50px" }}>
        
        {/* RIGHT COLUMN (Arabic Right): Accordion Terms */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "16px" }}>
           
           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>1. قبول الشروط</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط وأي سياسات أخرى ذات صلة.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>📝</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>2. استخدام الخدمات</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>يجب استخدام الخدمات لأغراض قانونية فقط وبما لا يضر بالبنية التحتية أو المستخدمين الآخرين.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>🖥️</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>3. الحساب والمسؤولية</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>أنت مسؤول عن سرية بيانات الدخول وكافة الأنشطة التي تتم من خلال حسابك.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>👤</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>4. إيقاف الخدمة</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>نحتفظ بالحق في إيقاف الخدمة مؤقتاً أو دائماً في حال مخالفة الشروط أو إساءة الاستخدام.</p>
             </div>
             <div style={{ color: "var(--brand-cyan)", fontSize: "1.5rem" }}>🔒</div>
           </div>

           <div className="glass-panel" style={{ padding: "20px 24px", borderRadius: "20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: 0, color: "var(--text-main)" }}>5. التعديلات</h3>
               <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>قد نقوم بتحديث الشروط من وقت لآخر، ويعد استمرارك في استخدام الخدمات موافقة على التعديلات.</p>
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
               نحن نسعى لرضاك، وفي حال لم تكن الخدمة مناسبة يمكنك طلب استرجاع وفق الشروط التالية:
             </p>
             <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> يمكن طلب الاسترجاع خلال 7 أيام من تاريخ الشراء.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> يشترط ألا يتم استخدام الخدمة أو تفعيلها.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> لا ينطبق الاسترجاع على النطاقات المدفوعة أو الخدمات المجانية.</li>
               <li style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#facc15" }}>✅</span> يتم معالجة طلب الاسترجاع خلال مدة تتراوح بين 3 إلى 7 أيام عمل.</li>
             </ul>
             <button className="glass-btn" style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #facc15", color: "#facc15", background: "transparent", fontWeight: "bold" }}>
               عرض سياسة الاسترجاع الكاملة
             </button>
          </div>

          {/* Official Document Card */}
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", border: "1px solid rgba(56, 189, 248, 0.3)", background: "rgba(56, 189, 248, 0.03)", display: "flex", alignItems: "center", gap: "20px" }}>
             <div style={{ flex: 1 }}>
               <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "8px", color: "var(--text-main)" }}>وثيقة رسمية ومعتمدة</h3>
               <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                 تخضع هذه الشروط لسياساتنا الداخلية والأنظمة المعمول بها.
               </p>
             </div>
             <div style={{ fontSize: "3rem", color: "#38bdf8" }}>🛡️</div>
          </div>

        </div>

      </div>

      {/* ── Help Banner ── */}
      <div className="glass-panel" style={{ padding: "40px", borderRadius: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <div style={{ fontSize: "3rem" }}>🎧</div>
           <div>
             <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "8px", color: "var(--text-main)" }}>لديك سؤال أو تحتاج إلى مساعدة؟</h2>
             <p style={{ margin: 0, color: "var(--text-muted)" }}>فريق الدعم لدينا جاهز لمساعدتك في أي وقت.</p>
           </div>
         </div>
         <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
           <Link href="/tickets/new" className="glass-btn" style={{ padding: "14px 24px", borderRadius: "14px", fontWeight: "bold", background: "var(--bg-glass)" }}>
             فتح تذكرة دعم
           </Link>
           <a href="https://wa.me/16728972935" target="_blank" rel="noopener noreferrer" className="glass-btn glass-btn-primary" style={{ padding: "14px 24px", borderRadius: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
             تواصل مع الدعم الفني
             <span>🎧</span>
           </a>
         </div>
      </div>

    </div>
  );
}
