"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Wallet, Sparkles, CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cleanHtmlToText } from "@/utils/cleanHtml";

const CURRENCIES: Record<string, { code: string; symbolAr: string; symbolEn: string; rate: number }> = {
  USD: { code: "USD", symbolAr: "$", symbolEn: "$", rate: 1.0 },
  SDG: { code: "SDG", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0 },
  SAR: { code: "SAR", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75 },
  EGP: { code: "EGP", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0 },
  AED: { code: "AED", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67 },
};

export default function CartDrawer({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const pathname = usePathname();
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    isLoggedIn,
    cartError,
    walletBalance,
  } = useCart();

  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [userSession, setUserSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string; orderIds?: string[] } | null>(null);

  // Close drawer on pathname change
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  // Load currency and session
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

  if (!isCartOpen) return null;

  const BackIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" dir={isAr ? "rtl" : "ltr"}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-s border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? "سلة المشتريات" : "Shopping Cart"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {isAr ? "سلة المشتريات" : "Shopping Cart"}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {cartCount} {isAr ? "منتج في السلة" : "items in cart"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                title={isAr ? "إفراغ السلة" : "Clear cart"}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">{isAr ? "إفراغ" : "Clear"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isAr ? "إغلاق السلة" : "Close cart"}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {cartError && !feedback && <p role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{cartError}</p>}
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`m-4 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p>{feedback.text}</p>
              {feedback.type === "success" && (
                <Link
                  href={`/${lang}/orders`}
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline"
                >
                  {isAr ? "عرض ومتابعة الطلبات" : "View my orders"}
                  <BackIcon size={13} />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Guest Storage Note */}
        {!isLoggedIn && cartItems.length > 0 && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Sparkles size={16} className="shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              {isAr
                ? "يتم حفظ سلتك محلياً على جهازك. عند تسجيل الدخول ستُحفظ في حسابك تلقائياً."
                : "Your cart is stored locally. Sign in to save it permanently to your account."}
            </span>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag size={40} strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
                {isAr ? "سلة المشتريات فارغة" : "Your cart is empty"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {isAr
                  ? "تصفح ألعابنا وخدماتنا الرقمية وأضف باقتك المفضلة لبدء عملية الشحن الفوري."
                  : "Explore our game catalog and digital packages to add items to your cart."}
              </p>
              <Link
                href={`/${lang}/services`}
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>{isAr ? "ابدأ التسوق الآن" : "Start Shopping Now"}</span>
                <BackIcon size={14} />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                        {cleanHtmlToText(item.serviceName)}
                      </span>
                    </div>

                    {item.groupName && (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                        {cleanHtmlToText(item.groupName)}
                      </span>
                    )}

                    {item.targetInput && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        <span className="text-slate-500 dark:text-slate-400">{isAr ? "الآيدي:" : "ID:"}</span>
                        <strong className="select-all">{item.targetInput}</strong>
                      </div>
                    )}

                    {item.customFields && typeof item.customFields === "object" && Object.keys(item.customFields).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.customFields).map(([k, v]) => {
                          if (k === "QNT" || k === "custom_QNT" || !v) return null;
                          return (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {k}: {String(v)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    title={isAr ? "حذف" : "Remove"}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                  {/* Quantity control */}
                  <div className="inline-flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label={isAr ? "تقليل الكمية" : "Decrease quantity"}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label={isAr ? "زيادة الكمية" : "Increase quantity"}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-end">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {formatPrice(item.price)} / {isAr ? "قطعة" : "unit"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-1 border-t border-slate-200 dark:border-slate-700/80">
                <span>{isAr ? "الإجمالي الكلي" : "Total Amount"}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* User status & Action Button */}
            {isLoggedIn ? (
              <div className="space-y-2">
                {userSession && (
                  <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Wallet size={12} />
                      {isAr ? "رصيد محفظتك المتاح:" : "Available balance:"}
                    </span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {walletBalance === null ? (isAr ? 'جاري التحقق…' : 'Checking…') : '$' + walletBalance.toFixed(2) + ' USD'}
                    </strong>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      <span>{isAr ? "جاري تأكيد الطلب..." : "Processing order..."}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      <span>{isAr ? "تأكيد وإتمام الشراء الآن" : "Complete Purchase Now"}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href={`/${lang}/login?redirect=cart`}
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 text-center"
                >
                  <span>{isAr ? "سجل الدخول لإتمام الطلب" : "Sign in to Complete Order"}</span>
                  <BackIcon size={16} />
                </Link>

                <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "ليس لديك حساب؟ يمكنك إنشاء حساب جديد في ثوانٍ وحفظ سلتك."
                    : "No account yet? Sign up in seconds to complete your order."}
                </p>
              </div>
            )}

            <div className="text-center pt-1">
              <Link
                href={`/${lang}/cart`}
                onClick={() => setIsCartOpen(false)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline"
              >
                {isAr ? "عرض صفحة السلة الكاملة" : "View full cart page"}
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
