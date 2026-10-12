"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminProfile, updateAdminCredentials } from "./actions";
import { isServerActionMismatchError } from "@/lib/server-action-utils";

interface PaymentMethodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  accountName?: string;
  badge: string;
  instructionsAr: string;
  instructionsEn: string;
  detailLabelAr?: string;
  detailLabelEn?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  isAutomaticPayPal?: boolean;
  isBankak?: boolean;
  isFawry?: boolean;
  isCustom?: boolean;
}

const DEFAULT_METHODS: PaymentMethodItem[] = [
  {
    id: "bankak",
    nameAr: "بنك الخرطوم (بنكك)",
    nameEn: "Bank of Khartoum (Bankak)",
    badge: "SD",
    icon: "banknote",
    color: "bg-blue-600",
    accountNumber: "6302273",
    accountName: "حسن",
    instructionsAr: "حول المبلغ بالجنيه السوداني عبر تطبيق بنكك إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد.",
    instructionsEn: "Transfer via Bankak app in Sudanese Pounds then upload receipt image for confirmation.",
    detailLabelAr: "رقم حساب بنكك:",
    detailLabelEn: "Bankak Account #:",
    isBankak: true,
    isActive: true
  },
  {
    id: "fawry",
    nameAr: "فوري - بنك فيصل الإسلامي",
    nameEn: "Fawri - Faisal Bank",
    badge: "FAWRI",
    icon: "banknote",
    color: "bg-indigo-600",
    accountNumber: "51589889",
    accountName: "الرقم البنكي الموحد",
    instructionsAr: "حول المبلغ بالجنيه السوداني عبر تطبيق فوري إلى الرقم البنكي الموحد (51589889) ثم ارفع صورة إشعار التحويل للتأكيد.",
    instructionsEn: "Transfer in Sudanese Pounds via Fawri app to Unified Banking ID # 51589889 then upload receipt image for confirmation.",
    detailLabelAr: "الرقم البنكي الموحد (تطبيق فوري):",
    detailLabelEn: "Unified Banking ID (Fawri App):",
    isFawry: true,
    isActive: true
  },
  {
    id: "vodafone",
    nameAr: "فودافون كاش (Vodafone Cash)",
    nameEn: "Vodafone Cash",
    badge: "VF",
    icon: "smartphone",
    color: "bg-rose-600",
    accountNumber: "01097160605",
    instructionsAr: "حول المبلغ إلى رقم المحفظة واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التحويل.",
    instructionsEn: "Transfer funds to wallet number then attach receipt screenshot.",
    detailLabelAr: "رقم محفظة فودافون كاش:",
    detailLabelEn: "Vodafone Cash Wallet Number:",
    isActive: true
  },
  {
    id: "binance",
    nameAr: "Binance Pay (باينانس)",
    nameEn: "Binance Pay",
    badge: "PAY",
    icon: "bitcoin",
    color: "bg-amber-500",
    accountNumber: "894642115",
    instructionsAr: "افتح تطبيق باينانس واكتب معرف Binance Pay ID ثم ارفع لقطة الشاشة للتأكيد.",
    instructionsEn: "Open Binance App and send funds via Pay ID then attach payment screenshot.",
    detailLabelAr: "معرف باينانس باي (Binance Pay ID):",
    detailLabelEn: "Binance Pay ID:",
    isActive: true
  },
  {
    id: "bnb",
    nameAr: "تحويل BNB (للألعاب والبطاقات والاشتراكات)",
    nameEn: "BNB Transfer (Top-ups, Cards & Subscriptions)",
    badge: "BNB",
    icon: "wallet",
    color: "bg-amber-600",
    accountNumber: "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
    instructionsAr: "طريقة تحويل عبر BNB معتمدة لكافة الأقسام (شحن الألعاب المباشر، متاجر التطبيقات، أكواد الألعاب، الاشتراكات، و Rewarble): قم بالتحويل إلى رابط المحفظة (0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f) ثم ارفع صورة إشعار التحويل للتأكيد.",
    instructionsEn: "Approved BNB transfer method for all sections. Transfer to wallet address then upload receipt.",
    detailLabelAr: "عنوان المحفظة (BEP20 / BSC Link):",
    detailLabelEn: "Wallet Address (BEP20 Link):",
    isActive: true
  },
  {
    id: "paypal",
    nameAr: "باي بال PayPal (تلقائي فوري)",
    nameEn: "PayPal (Instant Auto)",
    badge: "PP",
    icon: "credit-card",
    color: "bg-blue-600",
    accountNumber: "paypal@gsmteam.com",
    instructionsAr: "ادخل المبلغ واضغط زر الدفع عبر PayPal لإتمام العملية تلقائياً.",
    instructionsEn: "Enter amount and click PayPal button to pay instantly.",
    detailLabelAr: "الدفع التلقائي المباشر عبر PayPal:",
    detailLabelEn: "Direct PayPal Instant Payment:",
    isAutomaticPayPal: true,
    isActive: true
  }
];

export default function AdminSettingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"payment_methods" | "account">("payment_methods");

  // Payment Methods State
  const [methods, setMethods] = useState<PaymentMethodItem[]>(DEFAULT_METHODS);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [savingMethods, setSavingMethods] = useState(false);
  const [methodMessage, setMethodMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit / Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<PaymentMethodItem>({
    id: "",
    nameAr: "",
    nameEn: "",
    accountNumber: "",
    accountName: "",
    badge: "BANK",
    instructionsAr: "",
    instructionsEn: "",
    detailLabelAr: "رقم الحساب / المحفظة:",
    detailLabelEn: "Account / Wallet #:",
    color: "bg-blue-600",
    icon: "banknote",
    isActive: true,
    isCustom: true
  });

  // Account Settings State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Telegram Admin IDs
  const [telegramIds, setTelegramIds] = useState<string[]>([]);
  const [newTelegramId, setNewTelegramId] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState("");
  const [telegramError, setTelegramError] = useState("");

  const showMethodToast = (text: string, type: "success" | "error" = "success") => {
    setMethodMessage({ type, text });
    setTimeout(() => setMethodMessage(null), 4000);
  };

  const getAdminToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token")
    );
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const token = getAdminToken();
      const headers: Record<string, string> = { "Cache-Control": "no-cache" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/currencies", { headers, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.config) {
        if (Array.isArray(data.config.paymentMethods) && data.config.paymentMethods.length > 0) {
          setMethods(data.config.paymentMethods);
        } else {
          setMethods(DEFAULT_METHODS);
        }
      }
    } catch {
      showMethodToast("تعذر تحميل طرق الدفع من الخادم", "error");
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();

    async function fetchUser() {
      try {
        const user = await getAdminProfile();
        if (user) {
          setUsername(user.username || "");
          setEmail(user.email || "");
          setIsPageLoading(false);
          return;
        }
        const clientRes = await fetch("/api/users/profile");
        if (clientRes.ok) {
          const data = await clientRes.json();
          if (data.success && data.user) {
            setUsername(data.user.username || "");
            setEmail(data.user.email || "");
            setIsPageLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading admin settings profile:", err);
      }
      setUsername("admin");
      setEmail("admin@admin.com");
      setIsPageLoading(false);
    }

    async function fetchTelegramIds() {
      try {
        const res = await fetch("/api/settings/telegram-admins", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTelegramIds(data.chatIds || []);
        }
      } catch {}
    }

    fetchUser();
    fetchTelegramIds();
  }, [router]);

  const handleSaveMethods = async (methodsToSave = methods) => {
    try {
      setSavingMethods(true);
      const token = getAdminToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/currencies", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ paymentMethods: methodsToSave })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMethods(data.config?.paymentMethods || methodsToSave);
        showMethodToast("تم حفظ وتحديث جميع طرق الدفع والحسابات في قاعدة البيانات بنجاح!");
      } else {
        showMethodToast(data.error || "فشل حفظ طرق الدفع", "error");
      }
    } catch {
      showMethodToast("خطأ أثناء الاتصال بالخادم لحفظ طرق الدفع", "error");
    } finally {
      setSavingMethods(false);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = methods.map((m) =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    setMethods(updated);
    handleSaveMethods(updated);
  };

  const handleOpenAddModal = () => {
    const newId = `bank_${Date.now()}`;
    setEditingItem({
      id: newId,
      nameAr: "",
      nameEn: "",
      accountNumber: "",
      accountName: "",
      badge: "BANK",
      instructionsAr: "حول المبلغ إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد.",
      instructionsEn: "Transfer to account number then upload receipt screenshot.",
      detailLabelAr: "رقم الحساب البنكي:",
      detailLabelEn: "Bank Account #:",
      color: "bg-blue-600",
      icon: "banknote",
      isActive: true,
      isCustom: true
    });
    setModalMode("add");
    setModalOpen(true);
  };

  const handleOpenEditModal = (method: PaymentMethodItem) => {
    setEditingItem({ ...method });
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!editingItem.nameAr.trim()) {
      alert("الرجاء إدخال اسم البنك أو طريقة الدفع بالعربية");
      return;
    }
    if (!editingItem.accountNumber.trim()) {
      alert("الرجاء إدخال رقم الحساب أو المحفظة أو رابط التحويل");
      return;
    }

    let updated: PaymentMethodItem[];
    if (modalMode === "add") {
      updated = [...methods, editingItem];
    } else {
      updated = methods.map((m) => (m.id === editingItem.id ? editingItem : m));
    }

    setMethods(updated);
    setModalOpen(false);
    handleSaveMethods(updated);
  };

  const handleDeleteMethod = (id: string, nameAr: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف "${nameAr}"؟`)) {
      const updated = methods.filter((m) => m.id !== id);
      setMethods(updated);
      handleSaveMethods(updated);
    }
  };

  // Telegram Handlers
  const handleAddTelegramId = () => {
    const id = newTelegramId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setTelegramError("الرجاء إدخال Chat ID رقمي صحيح");
      return;
    }
    if (telegramIds.includes(id)) {
      setTelegramError("هذا الـ Chat ID مضاف بالفعل");
      return;
    }
    setTelegramIds((prev) => [...prev, id]);
    setNewTelegramId("");
    setTelegramError("");
  };

  const handleRemoveTelegramId = (id: string) => {
    setTelegramIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSaveTelegramIds = async () => {
    setTelegramLoading(true);
    setTelegramSuccess("");
    setTelegramError("");
    try {
      const res = await fetch("/api/settings/telegram-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chatIds: telegramIds })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramIds(data.chatIds);
        setTelegramSuccess("تم حفظ معرفات تليجرام بنجاح!");
        setTimeout(() => setTelegramSuccess(""), 3000);
      } else {
        setTelegramError(data.error || "حدث خطأ");
      }
    } catch {
      setTelegramError("تعذر الاتصال بالسيرفر");
    } finally {
      setTelegramLoading(false);
    }
  };

  // Account Submit
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");

    if (!currentPassword) {
      setAccountError("الرجاء إدخال كلمة المرور الحالية لتأكيد التعديلات");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setAccountError("كلمة المرور الجديدة يجب أن لا تقل عن 4 أحرف");
      return;
    }

    setIsLoading(true);

    try {
      const data = await updateAdminCredentials({
        username: username.trim(),
        email: email.trim(),
        newPassword: newPassword ? newPassword : undefined,
        currentPassword
      });

      if (!data.success) {
        setAccountError(data.error || "حدث خطأ غير متوقع");
      } else {
        setAccountSuccess("تم تحديث بيانات حسابك بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setAccountError("تعذر الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-2xl">settings</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-on-surface">إعدادات النظام والداش بورد</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              التحكم في طرق الدفع والحسابات البنكية للمحفظة، بيانات الدخول، وبوت تليجرام
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("payment_methods")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "payment_methods"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            طرق الدفع وحسابات المحفظة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "account"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            بيانات الحساب وتليجرام
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: WALLET PAYMENT METHODS MANAGEMENT                       */}
      {/* ============================================================== */}
      {activeTab === "payment_methods" && (
        <div className="space-y-6">
          {/* Status Toast */}
          {methodMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                methodMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {methodMessage.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{methodMessage.text}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-on-surface">قائمة طرق الدفع والحسابات البنكية</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                تظهر هذه البنوك مباشرة للعميل في صفحة المحفظة (Wallet). يمكنك تعديل أرقام الحسابات، التعليمات، أو إضافة بنوك جديدة.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                إضافة بنك جديد
              </button>
              <button
                type="button"
                onClick={() => handleSaveMethods()}
                disabled={savingMethods}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {savingMethods ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>

          {/* Methods Grid / Cards */}
          {loadingMethods ? (
            <div className="p-12 text-center text-sm font-bold text-on-surface-variant">
              جاري تحميل طرق الدفع...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methods.map((method, index) => (
                <div
                  key={method.id || index}
                  className={`bg-surface-container rounded-2xl border p-5 space-y-4 transition-all shadow-sm ${
                    method.isActive
                      ? "border-outline-variant/40 hover:border-blue-500/50"
                      : "border-outline-variant/20 opacity-60 bg-surface-container/50"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${method.color || "bg-blue-600"}`}>
                        <span className="material-symbols-outlined text-xl">
                          {method.icon === "smartphone"
                            ? "smartphone"
                            : method.icon === "bitcoin"
                            ? "currency_bitcoin"
                            : method.icon === "credit-card"
                            ? "credit_card"
                            : method.icon === "wallet"
                            ? "account_balance_wallet"
                            : "account_balance"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm sm:text-base text-on-surface">{method.nameAr}</h3>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-outline-variant/40 text-on-surface-variant">
                            {method.badge}
                          </span>
                        </div>
                        {method.nameEn && (
                          <p className="text-[11px] text-on-surface-variant font-mono" dir="ltr">
                            {method.nameEn}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(method.id)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                        method.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${method.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {method.isActive ? "مفعل للعميل" : "معطل"}
                    </button>
                  </div>

                  {/* Account Details Box */}
                  <div className="bg-surface rounded-xl p-3 border border-outline-variant/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>{method.detailLabelAr || "رقم الحساب / المحفظة:"}</span>
                      {method.accountName && (
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          باسم: {method.accountName}
                        </span>
                      )}
                    </div>
                    <div className="font-mono font-black text-sm text-on-surface bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/20 select-all" dir="ltr">
                      {method.accountNumber || "—"}
                    </div>
                  </div>

                  {/* Instructions Preview */}
                  <div className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed bg-surface-variant/20 p-2.5 rounded-xl">
                    <strong className="text-on-surface block text-[11px] mb-0.5">تعليمات التحويل للعميل:</strong>
                    {method.instructionsAr || "—"}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/20">
                    {method.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMethod(method.id, method.nameAr)}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        حذف
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(method)}
                      className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      تعديل البيانات
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT / ADD MODAL                                              */}
      {/* ============================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container border border-outline-variant/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">
                    {modalMode === "add" ? "إضافة بنك / وسيلة تحويل جديدة" : `تعديل بيانات: ${editingItem.nameAr}`}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    ستظهر هذه البيانات للعميل في شاشة الشحن فور الحفظ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface hover:bg-surface-variant/40 flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">اسم البنك / الوسيلة (بالعربي) *</label>
                  <input
                    type="text"
                    value={editingItem.nameAr}
                    onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
                    placeholder="مثال: بنك أم درمان الوطني"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">الاسم بالإنجليزي (اختياري)</label>
                  <input
                    type="text"
                    value={editingItem.nameEn}
                    onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                    placeholder="e.g. Omdurman National Bank"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Account Number & Holder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">رقم الحساب / المحفظة / المعرف *</label>
                  <input
                    type="text"
                    value={editingItem.accountNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, accountNumber: e.target.value })}
                    placeholder="مثال: 1234567 أو 01012345678"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">اسم صاحب الحساب (اختياري)</label>
                  <input
                    type="text"
                    value={editingItem.accountName || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, accountName: e.target.value })}
                    placeholder="مثال: محمد أحمد"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Badge & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">رمز الشارة (Badge)</label>
                  <input
                    type="text"
                    value={editingItem.badge}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="مثال: SD أو ONB أو IP"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">عنوان الحقل للعميل</label>
                  <input
                    type="text"
                    value={editingItem.detailLabelAr || "رقم الحساب:"}
                    onChange={(e) => setEditingItem({ ...editingItem, detailLabelAr: e.target.value })}
                    placeholder="مثال: رقم الحساب البنكي:"
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface"
                  />
                </div>
              </div>

              {/* Instructions Ar */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">تعليمات التحويل للعميل (بالعربي)</label>
                <textarea
                  rows={3}
                  value={editingItem.instructionsAr}
                  onChange={(e) => setEditingItem({ ...editingItem, instructionsAr: e.target.value })}
                  placeholder="اكتب تعليمات التحويل الواضحة للعميل (مثال: حول المبلغ لحساب رقم ... ثم ارفع إشعار التحويل للتأكيد)..."
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>

              {/* Instructions En */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">تعليمات التحويل (بالإنجليزية)</label>
                <textarea
                  rows={2}
                  value={editingItem.instructionsEn}
                  onChange={(e) => setEditingItem({ ...editingItem, instructionsEn: e.target.value })}
                  placeholder="Transfer instructions in English..."
                  className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface leading-relaxed font-mono"
                  dir="ltr"
                />
              </div>

              {/* Options: Icon & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">شكل الأيقونة</label>
                  <select
                    value={editingItem.icon || "banknote"}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface"
                  >
                    <option value="banknote">بنك / حساب مصرفي (Bank)</option>
                    <option value="smartphone">محفظة هاتف / كاش (Smartphone)</option>
                    <option value="bitcoin">عملات رقمية / باينانس (Crypto/Binance)</option>
                    <option value="wallet">محفظة إلكترونية (Wallet)</option>
                    <option value="credit-card">بطاقة / دفع إلكتروني (Credit Card)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">لون الأيقونة</label>
                  <select
                    value={editingItem.color || "bg-blue-600"}
                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                    className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-blue-500 outline-none text-xs text-on-surface"
                  >
                    <option value="bg-blue-600">أزرق ملكي (Blue)</option>
                    <option value="bg-indigo-600">نيلي (Indigo)</option>
                    <option value="bg-emerald-600">أخضر زمردي (Emerald)</option>
                    <option value="bg-rose-600">وردي / فودافون (Rose)</option>
                    <option value="bg-amber-500">ذهبي / باينانس (Amber)</option>
                    <option value="bg-amber-600">برتقالي غامق (Orange)</option>
                    <option value="bg-purple-600">بنفسجي (Purple)</option>
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-outline-variant/30">
                <div>
                  <span className="text-xs font-bold text-on-surface block">تفعيل وسيلة الدفع للعملاء</span>
                  <span className="text-[11px] text-on-surface-variant">هل تظهر في شاشة المحفظة لجميع الزوار؟</span>
                </div>
                <input
                  type="checkbox"
                  checked={editingItem.isActive}
                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant/30 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-variant/40 text-on-surface-variant transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                تأكيد وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADMIN CREDENTIALS & TELEGRAM                           */}
      {/* ============================================================== */}
      {activeTab === "account" && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            {accountError && (
              <div className="bg-rose-500/10 text-rose-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold">
                <span className="material-symbols-outlined">error</span>
                {accountError}
              </div>
            )}

            {accountSuccess && (
              <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold">
                <span className="material-symbols-outlined">check_circle</span>
                {accountSuccess}
              </div>
            )}

            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    dir="ltr"
                  />
                  <p className="text-xs text-on-surface-variant mt-2">يستخدم لتسجيل الدخول في الموقع وبوت تليجرام</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <hr className="border-outline-variant/30 my-8" />

              <div>
                <h2 className="text-xl font-bold text-on-surface mb-4">تغيير كلمة المرور</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="اتركها فارغة إذا لم ترد التغيير"
                      className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور الجديدة"
                      className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-variant/30 p-6 rounded-2xl mt-8">
                <label className="block text-sm font-bold text-rose-600 mb-2">تأكيد التعديلات بكلمة المرور الحالية *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="اكتب كلمة مرورك الحالية هنا"
                  className="w-full bg-surface px-4 py-3 rounded-2xl border border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-sm"
                  dir="ltr"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm shadow-sm"
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>

          {/* Telegram Admin IDs Section */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-xl">send</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">معرفات مشرفي تليجرام</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">الحسابات التي تستقبل إشعارات الإيداعات والطلبات عبر البوت</p>
              </div>
            </div>

            {telegramError && (
              <div className="bg-rose-500/10 text-rose-600 p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-base">error</span>
                {telegramError}
              </div>
            )}
            {telegramSuccess && (
              <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-base">check_circle</span>
                {telegramSuccess}
              </div>
            )}

            <div className="space-y-2 mb-6">
              {telegramIds.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4">لا يوجد معرفات محفوظة. أضف Chat ID من تليجرام.</p>
              ) : (
                telegramIds.map((id) => (
                  <div key={id} className="flex items-center justify-between bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-blue-500 text-xl">person</span>
                      <code className="font-mono text-on-surface font-bold">{id}</code>
                    </div>
                    <button
                      onClick={() => handleRemoveTelegramId(id)}
                      className="text-rose-600 hover:bg-rose-500/10 p-2 rounded-xl transition-colors"
                      title="حذف"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newTelegramId}
                onChange={(e) => setNewTelegramId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTelegramId()}
                placeholder="أدخل Telegram Chat ID (مثال: 7053196033)"
                className="flex-1 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddTelegramId}
                className="px-5 py-3 bg-blue-500/10 text-blue-600 font-bold rounded-2xl hover:bg-blue-500/20 transition-colors flex items-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined">add</span>
                إضافة
              </button>
            </div>

            <div className="bg-surface-variant/30 p-4 rounded-2xl mt-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">info</span>
              <p className="text-xs text-on-surface-variant">
                للحصول على Chat ID الخاص بك، أرسل رسالة لـ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-500 underline">@userinfobot</a> على تليجرام وسيعطيك رقمك.
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleSaveTelegramIds}
                disabled={telegramLoading}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                {telegramLoading ? "جاري الحفظ..." : "حفظ معرفات تليجرام"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
