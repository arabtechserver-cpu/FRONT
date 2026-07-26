"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 10px", direction: "rtl" }}>
      <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", backdropFilter: "blur(20px)" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "35px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "25px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>⚖️</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", marginBottom: "10px" }}>
            شروط الاستخدام وسياسة الاسترجاع
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            سياسة العمل الرسمية لمنصة "عرب تك" الخاصة بالخدمات الرقمية، تفعيلات السيرفرات، وأدوات السوفت وير.
          </p>
        </div>

        {/* Section 1: Terms of Use */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.5rem" }}>📌</span>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary-color)", margin: 0 }}>
              أولاً: شروط الاستخدام (Terms of Use)
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                1. قبول الشروط
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                باستخدامك لمنصة "عرب تك" والخدمات المقدمة فيها، فإنك توافق التزاماً كاملاً بجميع الشروط والأحكام المذكورة هنا. إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام المنصة.
              </p>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                2. طبيعة الخدمات
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                نقدم خدمات رقمية تشمل تفعيلات السيرفرات، أدوات السوفت وير، تجديد الاشتراكات، وبرامج الصيانة المتقدمة. جميع هذه الأدوات موجهة للاستخدام المهني والقانوني فقط في صيانة الهواتف والأنظمة.
              </p>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                3. الحسابات والمحفظة الرقمية
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                أنت مسؤول بشكل كامل عن حماية بيانات تسجيل الدخول الخاصة بك وعدم مشاركتها مع أطراف غير مصرح لها. الأرصدة المودعة في المحفظة الرقمية (سواء عبر USDT أو المحافظ المحلية) تُستخدم لشراء الخدمات داخل المنصة، وتخضع لسياسات الشحن والتعامل المالي المعتمدة لدينا.
              </p>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                4. صحة البيانات
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                يتحمل العميل المسؤولية الكاملة عن صحة البيانات المدخلة عند طلب أي خدمة (مثل أرقام IMEI، أو الرقم التسلسلي SN، أو أسماء الحسابات). المنصة غير مسؤولة عن أي خسارة أو فشل في التنفيذ ناتج عن إدخال العميل لبيانات خاطئة.
              </p>
            </div>

          </div>
        </div>

        {/* Section 2: Refund Policy */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.5rem" }}>🔄</span>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#22c55e", margin: 0 }}>
              ثانياً: سياسة الاسترجاع (Refund Policy)
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                1. طبيعة المنتجات الرقمية
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                بما أن المنتجات التي نقدمها هي خدمات رقمية وأكواد تفعيل تُرسل فورياً أو تُنفذ مباشرة عبر السيرفرات، فإن المبالغ المدفوعة غير قابلة للاسترجاع بمجرد تسليم الكود أو بدء تنفيذ الطلب على السيرفر، إلا في الحالات الاستثنائية المذكورة أدناه.
              </p>
            </div>

            <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#22c55e", marginBottom: "8px" }}>
                2. حالات استرجاع الرصيد
              </h3>
              <ul style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.8", margin: 0, paddingRight: "20px" }}>
                <li><strong>فشل الخدمة:</strong> إذا تم رفض الطلب من قبل السيرفر المصدر أو لم نتمكن من توفير كود التفعيل لأي سبب تقني، يتم إرجاع مبلغ الخدمة كاملاً وبشكل تلقائي إلى محفظة العميل داخل المنصة.</li>
                <li><strong>تأخير السيرفرات:</strong> في حال وجود تأخير تقني خارج عن إرادتنا يتجاوز المدة القصوى الموضحة في وصف الخدمة، يحق للعميل طلب إلغاء العملية واسترداد الرصيد (بشرط أن يتيح السيرفر المصدر ميزة الإلغاء للطلب المعلق).</li>
              </ul>
            </div>

            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ef4444", marginBottom: "8px" }}>
                3. حالات لا يشملها الاسترجاع
              </h3>
              <ul style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.8", margin: 0, paddingRight: "20px" }}>
                <li>إدخال العميل لرقم IMEI أو SN أو توجيه حساب خاطئ.</li>
                <li>طلب خدمة غير متوافقة مع حالة الجهاز الفنية أو سياسة الحماية الخاصة به (مثل طلب خدمة لجهاز مقيد بشروط لم تُذكر في وصف الخدمة الأصلية).</li>
                <li>تغيير العميل لرأيه أو إلغاء الطلب بعد بدء التنفيذ ورفعه للسيرفر بنجاح.</li>
                <li>الأكواد التي تم تسليمها وتعمل بشكل صحيح وتم استهلاكها بنجاح من قبل العميل.</li>
              </ul>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "16px", padding: "18px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                4. سحب الأرصدة من المحفظة
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.7", margin: 0 }}>
                في حالات خاصة ومبررة، إذا رغب العميل في سحب الرصيد المتبقي في محفظته إلى حساب خارجي بدلاً من استخدامه، قد يتم تطبيق رسوم تحويل أو اقتطاع عمولات بوابات الدفع والتحويل، ويخضع ذلك للمراجعة والموافقة من قبل الإدارة.
              </p>
            </div>

          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link href="/" className="glass-btn glass-btn-primary" style={{ padding: "12px 28px", borderRadius: "12px", textDecoration: "none", display: "inline-block" }}>
            الرجوع للرئيسية 🏠
          </Link>
        </div>

      </div>
    </div>
  );
}
