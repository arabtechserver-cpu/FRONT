"use client";

import { useState } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Locale;
  defaultTab?: "terms" | "refund";
}

export default function TermsModal({
  isOpen,
  onClose,
  lang = "ar",
  defaultTab = "terms"
}: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "refund">(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <span className="material-symbols-outlined text-xl">gavel</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {lang === "ar" ? "الشروط والأحكام وسياسة الاسترجاع والضمان" : "Terms of Service & Refund Policy"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "وثيقة رسمية ومعتمدة لدى منصة BORAI STORE" : "Official Certified Document"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "terms"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">description</span>
            <span>{lang === "ar" ? "شروط الخدمة والخصوصية" : "Terms of Service"}</span>
          </button>

          <button
            onClick={() => setActiveTab("refund")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "refund"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>{lang === "ar" ? "سياسة الاسترجاع والضمان التفصيلية" : "Refund Policy"}</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {activeTab === "terms" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5">shield</span>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">
                    {lang === "ar" 
                      ? "نحرص في منصة BORAI STORE على الشفافية التامة ووضوح العلاقة مع عملائنا. يرجى قراءة شروط الاستخدام وسياسة الاسترجاع والضمان بعناية قبل إتمام أي طلب."
                      : "We are committed to full transparency. Please read our terms and refund policies carefully before completing any order."}
                  </p>
                  <button 
                    onClick={() => setActiveTab("refund")}
                    className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1 mt-2"
                  >
                    <span>{lang === "ar" ? "الانتقال لسياسة الاسترجاع مباشرة" : "Go to Refund Policy directly"}</span>
                  </button>
                </div>
              </div>

              {/* Point 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">description</span>
                  <h3>{lang === "ar" ? "1. قبول الشروط" : "1. Acceptance of Terms"}</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === "ar" 
                    ? "باستخدامك لمنصة BORAI STORE، فإنك توافق التزاماً كاملاً بجميع الشروط والأحكام والسياسات المعلنة."
                    : "By using our platform, you fully agree to comply with all stated terms and conditions."}
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">devices</span>
                  <h3>{lang === "ar" ? "2. طبيعة الخدمات الرقمية" : "2. Nature of Digital Services"}</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === "ar"
                    ? "نقدم خدمات رقمية تشمل تفعيلات السيرفرات، أدوات السوفت وير، واشتراكات البرامج الموجهة للاستخدام القانوني والمهني فقط."
                    : "We provide digital services including server activations, software tools, and subscriptions intended for legal and professional use only."}
                </p>
              </div>

              {/* Point 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">person</span>
                  <h3>{lang === "ar" ? "3. صحة البيانات والمسؤولية" : "3. Data Accuracy & Responsibility"}</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === "ar"
                    ? "العميل مسؤول مسؤولية كاملة عن صحة البيانات المدخلة (مثل IMEI أو السيريال SN أو الحساب). المنصة غير مسؤولة عن بيانات أدخلها العميل بشكل خاطئ."
                    : "The customer is fully responsible for the accuracy of entered data (such as IMEI, SN, or account details)."}
                </p>
              </div>

              {/* Point 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">security</span>
                  <h3>{lang === "ar" ? "4. حماية الحساب والمحفظة" : "4. Account & Wallet Protection"}</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === "ar"
                    ? "أنت مسؤول عن سرية بيانات الدخول ورصيد المحفظة. توفر المنصة ميزات أمان متقدمة تشمل التحقق بالبصمة وكلمة مرور المعاملات."
                    : "You are responsible for keeping your login and wallet information confidential."}
                </p>
              </div>

              {/* Point 5 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">history_edu</span>
                  <h3>{lang === "ar" ? "5. التحديثات والتعديلات" : "5. Updates and Amendments"}</h3>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {lang === "ar"
                    ? "قد نقوم بتحديث الشروط والأسعار بصفة دورية، ويعد استمرارك في استخدام المنصة موافقة على أحدث نسخة من الشروط."
                    : "Terms and prices may be periodically updated, and continued usage implies acceptance."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "refund" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Refund Header Alert */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <span className="material-symbols-outlined text-base">verified</span>
                  <h3>{lang === "ar" ? "وثيقة سياسة الاسترجاع والضمان (Refund Policy)" : "Refund & Warranty Policy"}</h3>
                </div>
                <p className="text-xs text-slate-600">
                  {lang === "ar"
                    ? "نحن نسعى لرضاك التام، وفي حال وجود أي خلل تقني يتم تطبيق شروط الاسترجاع الآتية:"
                    : "We strive for complete satisfaction. In case of any technical issue, the following terms apply:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>رد تلقائي كامل للرصيد إلى المحفظة في حال رفض السيرفر للطلب.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>إمكانية طلب إلغاء واسترجاع في حال تأخر السيرفر عن الوقت الأقصى.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>معالجة سريعة لطلبات الاسترجاع والتذاكر عبر الدعم الفني.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-rose-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>لا يشمل الاسترجاع الأكواد المستهلكة بنجاح أو بيانات IMEI الخاطئة.</span>
                  </div>
                </div>
              </div>

              {/* Point 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                  <h4>{lang === "ar" ? "طبيعة المنتجات الرقمية" : "1. Nature of Digital Products"}</h4>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "نظراً لأن المنتجات المقدمة هي خدمات رقمية وأكواد تفعيل تُنفذ مباشرة على السيرفرات والمصادر الدولية، فإن المبالغ المدفوعة غير قابلة للاسترجاع بعد بدء التنفيذ أو تسليم الكود بنجاح، باستثناء الحالات الموضحة أدناه."
                    : "Digital products and activations executed on remote servers are non-refundable once started or delivered, except as outlined below."}
                </p>
              </div>

              {/* Point 2 */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
                  <h4>{lang === "ar" ? "حالات استرجاع الرصيد المؤكدة (100%)" : "2. Guaranteed 100% Refund Cases"}</h4>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  <li>
                    <strong>فشل السيرفر:</strong> إذا تم رفض الطلب (Rejected) من المصدر، يتم إرجاع المبلغ كاملاً وبشكل تلقائي إلى محفظتك.
                  </li>
                  <li>
                    <strong>تأخر غير مبرر:</strong> في حال تجاوزت مدة التنفيذ الحد الأقصى المعلن في وصف الخدمة ووافق السيرفر المصدر على الإلغاء.
                  </li>
                </ul>
              </div>

              {/* Point 3 */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 text-xs flex items-center justify-center font-bold">3</span>
                  <h4>{lang === "ar" ? "حالات لا يشملها الاسترجاع" : "3. Non-Refundable Cases"}</h4>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  <li>إدخال رقم IMEI أو SN أو اسم حساب خاطئ من قبل العميل.</li>
                  <li>طلب خدمة غير متوافقة مع حالة الجهاز الفنية أو حمايته.</li>
                  <li>محاولة الإلغاء بعد أن بدأ السيرفر المصدر في المعالجة وأقفل إمكانية الإلغاء.</li>
                  <li>الأكواد الصحيحة التي تم تسليمها وتفعيلها بنجاح.</li>
                </ul>
              </div>

              {/* Point 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                  <h4>{lang === "ar" ? "آلية استرداد الرصيد والمحفظة" : "4. Refund Processing & Wallet"}</h4>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "يتم رد المبالغ المستحقة مباشرة إلى رصيد محفظة العميل الرقمية داخل الموقع لاستخدامها في أي وقت دون أي اقتطاع. وفي حالات سحب الرصيد خارج الموقع قد تخضع العملية لرسوم بوابات الدفع وموافقة الإدارة."
                    : "Refunds are credited directly to your website wallet balance with zero deductions."}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-blue-600 text-base">verified_user</span>
            <span>{lang === "ar" ? "منصة BORAI STORE — جميع الحقوق محفوظة" : "BORAI STORE"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
          >
            {lang === "ar" ? "فهمت وموافق" : "I Understand & Agree"}
          </button>
        </div>

      </div>
    </div>
  );
}
