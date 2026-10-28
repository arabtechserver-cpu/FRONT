"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Wallet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Home
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cleanHtmlToText } from "@/utils/cleanHtml";

const CURRENCIES: Record<string, { code: string; symbolAr: string; symbolEn: string; rate: number }> = {
  USD: { code: "USD", symbolAr: "$", symbolEn: "$", rate: 1.0 },
  SDG: { code: "SDG", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0 },
  SAR: { code: "SAR", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75 },
  EGP: { code: "EGP", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0 },
  AED: { code: "AED", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67 },
};

export default function CartClient({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    isLoggedIn,
    cartError,
    isLoading
  } = useCart();

  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [userSession, setUserSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string; orderIds?: string[] } | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user_session");
      if (savedUser) setUserSession(JSON.parse(savedUser));
      const savedCur = localStorage.getItem("app_currency");
      if (savedCur && CURRENCIES[savedCur]) setCurrencyCode(savedCur);
    } catch {}

    const handleCurChange = () => {
      const saved = localStorage.getItem("app_currency");
      if (saved && CURRENCIES[saved]) setCurrencyCode(saved);
    };

    const handleUserChange = () => {
      try {
        const saved = localStorage.getItem("user_session");
        setUserSession(saved ? JSON.parse(saved) : null);
      } catch {}
    };

    window.addEventListener("currency_change", handleCurChange);
    window.addEventListener("user_session_change", handleUserChange);

    return () => {
      window.removeEventListener("currency_change", handleCurChange);
      window.removeEventListener("user_session_change", handleUserChange);
    };
  }, []);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const formatPrice = (usd: number = 0) => {
    const converted = usd * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isAr ? `${formatted} ${currency.symbolAr}` : `${currency.symbolEn} ${formatted}`;
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await checkout();
      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || (isAr ? "تم إتمام عملية الشراء بنجاح وخصم الرصيد!" : "Purchase completed successfully!"),
          orderIds: res.orderIds,
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || (isAr ? "حدث خطأ أثناء إتمام الشراء" : "Error completing purchase"),
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: isAr ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً" : "Network error, please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8 space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href={`/${lang}`} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
          <Home size={14} />
          <span>{isAr ? "الرئيسية" : "Home"}</span>
        </Link>
        <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
        <Link href={`/${lang}/services`} className="hover:text-blue-600 dark:hover:text-blue-400">
          {isAr ? "الخدمات والألعاب" : "Services & Games"}
        </Link>
        <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
        <span className="font-semibold text-slate-900 dark:text-white">
          {isAr ? "سلة المشتريات" : "Shopping Cart"}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="text-blue-600 dark:text-blue-400" size={30} />
            <span>{isAr ? "سلة المشتريات" : "Shopping Cart"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? "راجع باقاتك المختارة، بيانات الحساب والكمية قبل تأكيد الطلب والتسليم الفوري."
              : "Review your selected packages, player account data and quantities before instant delivery."}
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={15} />
            <span>{isAr ? "إفراغ السلة بالكامل" : "Clear all items"}</span>
          </button>
        )}
      </div>

      {cartError && !feedback && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{cartError}</p>}
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{feedback.text}</p>
            {feedback.type === "success" && (
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/${lang}/orders`}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <span>{isAr ? "متابعة الطلبات الآن" : "Track Orders"}</span>
                  <BackIcon size={14} />
                </Link>
                <Link
                  href={`/${lang}/services`}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
                >
                  {isAr ? "متابعة التسوق" : "Continue Shopping"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {cartItems.length === 0 && !isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-14 text-center bg-slate-50/50 dark:bg-slate-900/40">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isAr ? "سلة المشتريات فارغة حالياً" : "Your shopping cart is currently empty"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {isAr
              ? "لم تقم بإضافة أي باقات بعد. اختر لعبتك المفضلة أو بطاقتك الرقمية وأضفها للسلة للاستفادة من أسرع شحن فوري."
              : "You haven't added any packages yet. Choose your favorite game or gift card and add it to your cart."}
          </p>
          <Link
            href={`/${lang}/services`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span>{isAr ? "تصفح الألعاب والخدمات" : "Browse Games & Services"}</span>
            <BackIcon size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main items column */}
          <div className="lg:col-span-2 space-y-4">
            {!isLoggedIn && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-3">
                <Sparkles size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <strong>{isAr ? "تنبيه الحفظ المحلي:" : "Local Storage Note:"}</strong>{" "}
                  {isAr
                    ? "أنت تتسوق كزائر. المنتجات محفوظة محلياً على جهازك، وسيتم ربطها بحسابك فور تسجيل الدخول."
                    : "You are shopping as guest. Items are saved locally and will sync to your account when you log in."}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {cleanHtmlToText(item.serviceName)}
                      </h3>
                    </div>

                    {item.groupName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cleanHtmlToText(item.groupName)}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {item.targetInput && (
                        <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                          <span className="text-slate-500 dark:text-slate-400 me-1">
                            {isAr ? "معرّف الحساب (ID):" : "Player ID:"}
                          </span>
                          <strong>{item.targetInput}</strong>
                        </div>
                      )}

                      {item.customFields && typeof item.customFields === "object" && (
                        Object.entries(item.customFields).map(([k, v]) => {
                          if (k === "QNT" || k === "custom_QNT" || !v) return null;
                          return (
                            <div
                              key={k}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            >
                              <span>{k}: </span>
                              <strong>{String(v)}</strong>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Quantity Selector */}
                    <div className="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-end min-w-[90px]">
                      <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono block">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      title={isAr ? "حذف" : "Remove"}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout summary sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
              <h2 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                {isAr ? "ملخص الطلب" : "Order Summary"}
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{isAr ? "عدد المنتجات" : "Items Count"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cartCount}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{isAr ? "رسوم التنفيذ" : "Processing Fee"}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{isAr ? "مجاناً 0.00" : "Free 0.00"}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-slate-900 dark:text-white">
                  <span className="font-bold text-sm sm:text-base">{isAr ? "الإجمالي الكلي" : "Total"}</span>
                  <span className="font-mono text-xl font-black text-blue-600 dark:text-blue-400">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Balance status */}
              {isLoggedIn ? (
                <div className="space-y-3">
                  {userSession && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Wallet size={15} />
                        {isAr ? "رصيدك المتاح:" : "Available balance:"}
                      </span>
                      <strong className="font-mono font-bold text-slate-900 dark:text-white">
                        ${(userSession.balance || 0).toFixed(2)} USD
                      </strong>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        <span>{isAr ? "جاري تنفيذ وتأكيد الطلب..." : "Processing order..."}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{isAr ? "تأكيد الطلب والشراء الآن" : "Confirm & Pay Now"}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href={`/${lang}/wallet`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {isAr ? "شحن رصيد المحفظة" : "Top up wallet balance"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href={`/${lang}/login?redirect=cart`}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-center"
                  >
                    <span>{isAr ? "سجل الدخول لإتمام الشراء" : "Sign in to Checkout"}</span>
                    <BackIcon size={16} />
                  </Link>

                  <Link
                    href={`/${lang}/register?redirect=cart`}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center text-center"
                  >
                    {isAr ? "إنشاء حساب جديد وحفظ السلة" : "Create new account & save cart"}
                  </Link>
                </div>
              )}

              {/* Trust pills */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "شحن آلي فوري 24/7 دون انتظار" : "24/7 Instant automated top-up"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-blue-500 shrink-0" />
                  <span>{isAr ? "تسليم خلال ثوانٍ معدودة لحسابك" : "Delivery to account in seconds"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
