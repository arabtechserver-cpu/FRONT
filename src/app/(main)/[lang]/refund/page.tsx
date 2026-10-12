import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function RefundPolicyPage(props: PageProps) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-outline-variant/30 text-center space-y-3 bg-surface-container-high/30">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg">
          <span className="material-symbols-outlined text-3xl">restart_alt</span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-on-surface">
          {lang === "ar" ? "سياسة الاسترجاع والضمان التفصيلية (Refund Policy)" : "Detailed Refund & Warranty Policy"}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl mx-auto">
          {lang === "ar"
            ? "الشروط والأحكام الكاملة لاسترجاع الرصيد وإلغاء الطلبات الرقمية في منصة BORAI STORE."
            : "Complete terms and conditions for refunds and order cancellations on BORAI STORE."}
        </p>
      </div>

      {/* Quick Summary Alert */}
      <div className="glass-card rounded-3xl p-6 border border-violet-500/30 bg-violet-500/10 space-y-3">
        <h2 className="text-base font-bold text-violet-400 flex items-center gap-2">
          <span className="material-symbols-outlined">verified</span>
          <span>{lang === "ar" ? "ملخص سياسة الاسترجاع السريعة" : "Quick Refund Summary"}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3 rounded-2xl bg-surface-container-high/80 flex items-center gap-2 text-violet-300 font-semibold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>رد تلقائي كامل للرصيد إلى المحفظة في حال رفض السيرفر المصدر للطلب.</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-high/80 flex items-center gap-2 text-violet-300 font-semibold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>إمكانية طلب إلغاء واسترجاع في حال تأخر السيرفر عن الوقت الأقصى.</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-high/80 flex items-center gap-2 text-violet-300 font-semibold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>معالجة سريعة لطلبات الاسترجاع والتذاكر عبر الدعم الفني.</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-container-high/80 flex items-center gap-2 text-red-300 font-semibold">
            <span className="material-symbols-outlined text-sm">cancel</span>
            <span>لا يشمل الاسترجاع الأكواد المستهلكة بنجاح أو بيانات IMEI الخاطئة من العميل.</span>
          </div>
        </div>
      </div>

      {/* Detailed Points */}
      <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-mono">1</span>
            <h2>{lang === "ar" ? "طبيعة المنتجات الرقمية" : "1. Nature of Digital Products"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "نظراً لأن المنتجات المقدمة هي خدمات رقمية وأكواد تفعيل تُنفذ مباشرة على السيرفرات والمصادر الدولية، فإن المبالغ المدفوعة غير قابلة للاسترجاع بعد بدء التنفيذ أو تسليم الكود بنجاح، باستثناء الحالات الموضحة أدناه."
              : "Due to the nature of digital goods and remote server executions, completed orders and delivered codes are non-refundable, except under the specified circumstances below."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-violet-500/20 bg-violet-500/5 space-y-3">
          <div className="flex items-center gap-3 text-violet-400 font-bold text-base">
            <span className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-mono">2</span>
            <h2>{lang === "ar" ? "حالات استرجاع الرصيد المؤكدة (100%)" : "2. Guaranteed 100% Refund Cases"}</h2>
          </div>
          <ul className="space-y-2 text-sm text-on-surface list-disc list-inside">
            <li>
              <strong>فشل السيرفر:</strong> إذا تم رفض الطلب (Rejected) من المصدر، يتم إرجاع المبلغ كاملاً وبشكل تلقائي إلى محفظتك.
            </li>
            <li>
              <strong>تأخر غير مبرر:</strong> في حال تجاوزت مدة التنفيذ الحد الأقصى المعلن في وصف الخدمة ووافق السيرفر المصدر على الإلغاء.
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-red-500/20 bg-red-500/5 space-y-3">
          <div className="flex items-center gap-3 text-red-400 font-bold text-base">
            <span className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center text-xs font-mono">3</span>
            <h2>{lang === "ar" ? "حالات لا يشملها الاسترجاع" : "3. Non-Refundable Situations"}</h2>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant list-disc list-inside">
            <li>إدخال رقم IMEI أو SN أو اسم حساب خاطئ من قبل العميل.</li>
            <li>طلب خدمة غير متوافقة مع حالة الجهاز الفنية أو حمايته.</li>
            <li>محاولة الإلغاء بعد أن بدأ السيرفر المصدر في المعالجة وأقفل إمكانية الإلغاء.</li>
            <li>الأكواد الصحيحة التي تم تسليمها وتفعيلها بنجاح.</li>
          </ul>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-mono">4</span>
            <h2>{lang === "ar" ? "آلية استرداد الرصيد والمحفظة" : "4. Refund Disbursement"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "يتم رد المبالغ المستحقة مباشرة إلى رصيد محفظة العميل الرقمية داخل الموقع لاستخدامها في أي وقت دون أي اقتطاع. وفي حالات سحب الرصيد خارج الموقع قد تخضع العملية لرسوم بوابات الدفع وموافقة الإدارة."
              : "Refunds are automatically deposited back to your internal site wallet for immediate use."}
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </Link>
      </div>
    </div>
  );
}
