"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { Locale } from "@/i18n/config";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "149631802250-7n94rcr7nd1041iq06ck2310uctituve.apps.googleusercontent.com";

export default function LoginClient({ lang, dict }: { lang: Locale; dict: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // FORGOT PASSWORD MODAL STATE
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp_verify">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(true);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response.credential) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم تسجيل الدخول بحساب Google بنجاح! جاري التوجيه..." : "Google login successful! Redirecting...");
        const redirectParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
        const dest = redirectParam ? `/${lang}/${redirectParam.replace(/^\//, '')}` : `/${lang}`;
        setTimeout(() => {
          window.location.href = dest;
        }, 1000);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "فشل تسجيل الدخول بحساب Google" : "Google Sign-In failed"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const initGoogleAuth = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        // Render native button or prompt
        const btnContainer = document.getElementById("googleSignInBtnCustom");
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 360,
            text: "continue_with",
            shape: "pill",
            locale: lang === "ar" ? "ar" : "en",
          });
        }
      } catch (err) {
        console.warn("[Google Auth] Init skipped or error:", err);
      }
    }
  }, [handleGoogleCallback, lang]);

  useEffect(() => {
    initGoogleAuth();
  }, [initGoogleAuth]);

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال اسم المستخدم أو البريد الإلكتروني!" : "Please enter your email or username!");
      return;
    }
    if (!password) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال كلمة المرور!" : "Please enter your password!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم تسجيل الدخول بنجاح! جاري التوجيه..." : "Login successful! Redirecting...");
        const redirectParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
        const dest = redirectParam ? `/${lang}/${redirectParam.replace(/^\//, '')}` : `/${lang}`;
        setTimeout(() => {
          window.location.href = dest;
        }, 1000);
      } else {
        const errorMsg = data.error || data.message || (lang === "ar" ? "بيانات الدخول غير صحيحة!" : "Invalid login credentials!");
        setErrorMessage(errorMsg);
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 1: Send OTP Email via Loops
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError(lang === "ar" ? "الرجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, type: "forgot_password" })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setForgotStep("otp_verify");
        setForgotSuccess(lang === "ar" ? `تم إرسال كود تفعيل كلمة المرور إلى: ${forgotEmail}` : `OTP sent to: ${forgotEmail}`);
      } else {
        setForgotError(data.error || data.message || "فشل إرسال كود التفعيل");
      }
    } catch {
      setForgotError("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP & Save New Password
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotOtp.trim() || forgotOtp.trim().length < 4) {
      setForgotError(lang === "ar" ? "الرجاء إدخال كود OTP المكون من 6 أرقام" : "Please enter 6-digit OTP");
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.trim().length < 4) {
      setForgotError(lang === "ar" ? "الرجاء إدخال كلمة المرور الجديدة" : "Please enter new password");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword.trim(),
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setForgotSuccess(lang === "ar" ? "تم إعادة تعيين كلمة المرور بنجاح! جاري العودة لصفحة الدخول..." : "Password reset successfully!");
        setTimeout(() => {
          setForgotModalOpen(false);
          setForgotStep("email");
          setEmail(forgotEmail);
        }, 1500);
      } else {
        setForgotError(data.error || data.message || "فشل إعادة تعيين كلمة المرور");
      }
    } catch {
      setForgotError("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-10 sm:py-16">
      <div className="bg-surface-container w-full max-w-md rounded-2xl p-6 sm:p-8 border shadow-sm relative">
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href={`/${lang}`} className="mb-4 flex items-center justify-center" aria-label="Home">
            <img 
              src="/images/borai-logo.png?v=2" 
              alt="BORAI SERVER" 
              className="h-12 sm:h-14 w-auto max-w-[240px] object-contain" 
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold ">{dict.login.title}</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">{dict.login.subtitle}</p>
        </div>

        {/* Quick Google Sign-In Button */}
        <div className="mb-5 flex flex-col gap-4">
          <Script 
            src="https://accounts.google.com/gsi/client" 
            strategy="afterInteractive" 
            onLoad={initGoogleAuth}
          />
          <div id="googleSignInBtnCustom" className="w-full flex justify-center min-h-[44px]"></div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t "></div>
            <span className="absolute px-3 text-xs text-slate-400 font-medium rounded-full border ">{dict.login.or}</span>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 sm:gap-5" autoComplete="off">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold ">{dict.login.emailLabel}</label>
            <div className="relative">
              <span className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg`}>person</span>
              <input 
                id="login-email"
                name="email"
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.login.emailPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={dict.login.emailLabel}
                className={`w-full border rounded-xl py-3 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
               <label htmlFor="login-password" className="text-xs font-semibold ">{dict.login.passwordLabel}</label>
               <button 
                type="button" 
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotStep("email");
                  setForgotError("");
                  setForgotSuccess("");
                }}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors flex items-center gap-1"
               >
                 <span className="material-symbols-outlined text-xs">key</span>
                 <span>{dict.login.forgot || (lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?")}</span>
               </button>
            </div>
            <div className="relative">
              <span className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg`}>lock</span>
              <input 
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.login.passwordPlaceholder}
                autoComplete="current-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={dict.login.passwordLabel}
                className={`w-full border rounded-xl py-3 ${lang === 'ar' ? 'pr-11 pl-11' : 'pl-11 pr-11'} text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? (lang === 'ar' ? "إخفاء كلمة المرور" : "Hide password") : (lang === 'ar' ? "إظهار كلمة المرور" : "Show password")}
                className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors`}
                title={showPassword ? "إخفاء" : "إظهار"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">{dict.login.remember}</label>
            </div>

            <button 
              type="button" 
              onClick={() => {
                setForgotModalOpen(true);
                setForgotStep("email");
                setForgotError("");
                setForgotSuccess("");
              }}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">lock_reset</span>
              <span>{lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}</span>
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{lang === "ar" ? "جاري الدخول..." : "Logging in..."}</span>
              </>
            ) : (
              <span>{dict.login.signIn}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {dict.login.noAccount} <Link href={`/${lang}/register`} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">{dict.login.registerNow}</Link>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl p-6 border shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b ">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">lock_reset</span>
                </div>
                <div>
                  <h2 className="font-bold text-sm">استعادة كلمة المرور</h2>
                  <p className="text-xs text-slate-500">إرسال كود التحقق OTP إلى بريدك الإلكتروني</p>
                </div>
              </div>
              <button 
                onClick={() => setForgotModalOpen(false)}
                aria-label="إغلاق نافذة استعادة كلمة المرور"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {forgotError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === "email" ? (
              <form onSubmit={handleForgotSendOtp} className="py-4 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-email" className="text-xs font-semibold ">البريد الإلكتروني المسجل</label>
                  <input
                    id="forgot-email"
                    name="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    autoComplete="off"
                    aria-label="البريد الإلكتروني المسجل"
                    className="w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    autoFocus
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري إرسال كود OTP...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">mark_email_unread</span>
                        <span>إرسال كود التحقق إلى الإيميل</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl hover:bg-slate-200 font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="py-4 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-otp" className="text-xs font-semibold text-center">أدخل كود OTP (6 أرقام) من الإيميل</label>
                  <input
                    id="forgot-otp"
                    name="forgot-otp"
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    maxLength={6}
                    placeholder="1 2 3 4 5 6"
                    aria-label="كود التحقق OTP"
                    className="w-full border-2 border-blue-200 rounded-xl py-2.5 px-4 text-center text-lg font-bold tracking-[0.3em] text-blue-600 focus:outline-none focus:border-blue-600 font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="forgot-new-password" className="text-xs font-semibold ">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      id="forgot-new-password"
                      name="forgot-new-password"
                      type={forgotShowPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="********"
                      aria-label="كلمة المرور الجديدة"
                      className="w-full border rounded-xl py-2.5 pr-4 pl-10 text-xs focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowPassword(!forgotShowPassword)}
                      aria-label={forgotShowPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {forgotShowPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotOtp.trim() || !forgotNewPassword.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">verified</span>
                        <span>تأكيد وتغيير كلمة المرور</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep("email")}
                    className="px-4 py-2.5 rounded-xl hover:bg-slate-200 font-bold text-xs"
                  >
                    رجوع
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
