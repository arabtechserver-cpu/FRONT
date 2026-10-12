import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function TermsPage(props: PageProps) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 border border-outline-variant/30 text-center space-y-3 bg-surface-container-high/30">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center mx-auto border border-primary/30 shadow-lg">
          <span className="material-symbols-outlined text-3xl">gavel</span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-on-surface">
          {lang === "ar" ? "شروط الخدمة وسياسة الاستخدام" : "Terms of Service"}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl mx-auto">
          {lang === "ar"
            ? "نحرص في منصة BORAI STORE على الشفافية التامة ووضوح العلاقة مع عملائنا. يرجى قراءة شروط الاستخدام وسياسة الاسترجاع والضمان بعناية قبل إتمام أي طلب."
            : "We are committed to full transparency. Please read our terms and policies carefully."}
        </p>
        <div className="pt-2">
          <Link
            href={`/${lang}/refund`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-all"
          >
            <span>{lang === "ar" ? "الانتقال لسياسة الاسترجاع والضمان التفصيلية" : "Go to Refund Policy"}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Terms Content */}
      <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="material-symbols-outlined text-xl">description</span>
            <h2>{lang === "ar" ? "1. قبول الشروط" : "1. Acceptance of Terms"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "باستخدامك لمنصة BORAI STORE، فإنك توافق التزاماً كاملاً بجميع الشروط والأحكام والسياسات المعلنة."
              : "By using our platform, you fully agree to comply with all published terms and policies."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="material-symbols-outlined text-xl">devices</span>
            <h2>{lang === "ar" ? "2. طبيعة الخدمات الرقمية" : "2. Nature of Digital Services"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "نقدم خدمات رقمية تشمل تفعيلات السيرفرات، أدوات السوفت وير، واشتراكات البرامج الموجهة للاستخدام القانوني والمهني فقط."
              : "We provide digital services including server activations, software tools, and subscriptions intended for legal and professional use."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="material-symbols-outlined text-xl">person</span>
            <h2>{lang === "ar" ? "3. صحة البيانات والمسؤولية" : "3. Data Accuracy & Responsibility"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "العميل مسؤول مسؤولية كاملة عن صحة البيانات المدخلة (مثل IMEI أو السيريال SN أو الحساب). المنصة غير مسؤولة عن بيانات أدخلها العميل بشكل خاطئ."
              : "The customer is fully responsible for the accuracy of all submitted details (e.g. IMEI, Serial Number, or Account Name)."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="material-symbols-outlined text-xl">security</span>
            <h2>{lang === "ar" ? "4. حماية الحساب والمحفظة" : "4. Account & Wallet Protection"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "أنت مسؤول عن سرية بيانات الدخول ورصيد المحفظة. توفر المنصة ميزات أمان متقدمة تشمل التحقق بالبصمة وكلمة مرور المعاملات."
              : "You are responsible for keeping your login credentials and wallet balance confidential."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-3 text-primary font-bold text-base">
            <span className="material-symbols-outlined text-xl">history_edu</span>
            <h2>{lang === "ar" ? "5. التحديثات والتعديلات" : "5. Updates and Amendments"}</h2>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {lang === "ar"
              ? "قد نقوم بتحديث الشروط والأسعار بصفة دورية، ويعد استمرارك في استخدام المنصة موافقة على أحدث نسخة من الشروط."
              : "We may update terms and prices periodically. Continued usage constitutes acceptance of the latest terms."}
          </p>
        </div>
      </div>
    </div>
  );
}
