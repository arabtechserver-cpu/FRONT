"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, verifyAdminOtpAction, resendAdminOtpAction } from "./actions";
import { isServerActionMismatchError } from "@/lib/server-action-utils";
import { getOrCreateDeviceToken, getDeviceFingerprint, getLocalIpViaWebRTC } from "@/utils/deviceUtils";

export default function AdminLogin() {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);

  const [challengeToken, setChallengeToken] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [blockedIp, setBlockedIp] = useState("");
  const [copiedIp, setCopiedIp] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const deviceTokenRef = useRef<string>("");
  const fingerprintRef = useRef<string>("");
  const localIpRef = useRef<string>("");

  const router = useRouter();

  useEffect(() => {
    setClientReady(true);
    try {
      deviceTokenRef.current = getOrCreateDeviceToken();
      getDeviceFingerprint().then((fp) => {
        fingerprintRef.current = fp;
      });
      getLocalIpViaWebRTC(1500).then((res) => {
        if (res.localIp) {
          localIpRef.current = res.localIp;
        }
      });
    } catch (_) {}
  }, []);

  const handleCopyIp = async () => {
    if (!blockedIp) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(blockedIp);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = blockedIp;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2500);
    } catch {
      // Clipboard copy failed
    }
  };

  useEffect(() => {
    if (step !== "otp") return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(cooldownTimer);
    };
  }, [step]);

  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReady || loading) return;
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const devToken = deviceTokenRef.current || getOrCreateDeviceToken();
      const devFp = fingerprintRef.current || await getDeviceFingerprint();
      const clientLocal = localIpRef.current || (await getLocalIpViaWebRTC(800)).localIp || "";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (devToken) headers["x-device-token"] = devToken;
      if (clientLocal) headers["x-client-local-ip"] = clientLocal;
      if (devFp) headers["x-device-fingerprint"] = devFp;

      const apiRes = await fetch("/api/admin/login", {
        method: "POST",
        headers,
        body: JSON.stringify({
          username,
          password,
          deviceToken: devToken,
          localIp: clientLocal,
          deviceFingerprint: devFp
        })
      });

      const apiData = await apiRes.json().catch(() => ({}));

      if (apiRes.ok && apiData.success) {
        if (apiData.requireOtp) {
          setChallengeToken(apiData.challengeToken);
          setStep("otp");
          setCountdown(300);
          setResendCooldown(60);
          setInfoMessage(apiData.message || "تم إرسال رمز التحقق إلى حساب تيليجرام الخاص بالإدارة");
          setLoading(false);
          return;
        }

        if (apiData.token) {
          try {
            document.cookie = `admin_token=${apiData.token}; path=/; max-age=43200; SameSite=Lax`;
            localStorage.setItem("admin_token", apiData.token);
            sessionStorage.setItem("admin_token", apiData.token);
          } catch {}
        }
        window.location.href = "/admin";
        return;
      }

      if (apiRes.status === 403 && apiData?.code === "IP_NOT_ALLOWED") {
        const clientIp = apiData.clientIp || "";
        setBlockedIp(clientIp);
        setError(
          clientIp
            ? `الوصول إلى لوحة التحكم غير مصرح به من عنوان الـ IP العام لهذه الشبكة (IP: ${clientIp}).`
            : "الوصول إلى لوحة التحكم غير مصرح به من هذه الشبكة."
        );
        setLoading(false);
        return;
      }

      if (apiData?.message || apiData?.error) {
        setError(apiData.message || apiData.error);
        setLoading(false);
        return;
      }

      const result = await loginAdmin(username, password);
      if (result.success) {
        if (result.requireOtp) {
          setChallengeToken(result.challengeToken || "");
          setStep("otp");
          setCountdown(300);
          setResendCooldown(60);
          setInfoMessage(result.message || "تم إرسال رمز التحقق إلى حساب تيليجرام الخاص بالإدارة");
          setLoading(false);
          return;
        }
        if (result.token) {
          try {
            document.cookie = `admin_token=${result.token}; path=/; max-age=43200; SameSite=Lax`;
            localStorage.setItem("admin_token", result.token);
            sessionStorage.setItem("admin_token", result.token);
          } catch {}
        }
        window.location.href = "/admin";
        return;
      } else {
        setError(result.message || "بيانات الدخول غير صحيحة");
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setError("حدث خطأ أثناء تسجيل الدخول، يرجى تحديث الصفحة والمحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReady || loading) return;
    if (!otp.trim()) {
      setError("يرجى إدخال رمز التحقق");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const devToken = deviceTokenRef.current || getOrCreateDeviceToken();
      const devFp = fingerprintRef.current || await getDeviceFingerprint();
      const clientLocal = localIpRef.current || (await getLocalIpViaWebRTC(800)).localIp || "";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (devToken) headers["x-device-token"] = devToken;
      if (clientLocal) headers["x-client-local-ip"] = clientLocal;
      if (devFp) headers["x-device-fingerprint"] = devFp;

      const apiRes = await fetch("/api/admin/login/verify-otp", {
        method: "POST",
        headers,
        body: JSON.stringify({
          challengeToken,
          otp: otp.trim(),
          deviceToken: devToken,
          localIp: clientLocal,
          deviceFingerprint: devFp
        })
      });

      const apiData = await apiRes.json().catch(() => ({}));

      if (apiRes.ok && apiData.success) {
        if (apiData.token) {
          try {
            document.cookie = `admin_token=${apiData.token}; path=/; max-age=43200; SameSite=Lax`;
            localStorage.setItem("admin_token", apiData.token);
            sessionStorage.setItem("admin_token", apiData.token);
          } catch {}
        }
        window.location.href = "/admin";
        return;
      }

      if (apiRes.status === 403 && apiData?.code === "IP_NOT_ALLOWED") {
        const clientIp = apiData.clientIp || "";
        setBlockedIp(clientIp);
        setError(
          clientIp
            ? `الوصول إلى لوحة التحكم غير مصرح به من عنوان الـ IP العام لهذه الشبكة (IP: ${clientIp}).`
            : "الوصول إلى لوحة التحكم غير مصرح به من هذه الشبكة."
        );
        setLoading(false);
        return;
      }

      if (apiData?.message || apiData?.error) {
        setError(apiData.message || apiData.error);
        setLoading(false);
        return;
      }

      const result = await verifyAdminOtpAction(challengeToken, otp.trim());
      if (result.success) {
        if (result.token) {
          try {
            document.cookie = `admin_token=${result.token}; path=/; max-age=43200; SameSite=Lax`;
            localStorage.setItem("admin_token", result.token);
            sessionStorage.setItem("admin_token", result.token);
          } catch {}
        }
        window.location.href = "/admin";
        return;
      } else {
        setError(result.message || "رمز التحقق غير صحيح");
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setError("حدث خطأ أثناء التحقق من الرمز، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError("");
    setInfoMessage("");
    setResending(true);

    try {
      const apiRes = await fetch("/api/admin/login/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken })
      });

      const apiData = await apiRes.json().catch(() => ({}));

      if (apiRes.ok && apiData.success) {
        setResendCooldown(60);
        setCountdown(300);
        setInfoMessage(apiData.message || "تم إرسال كود تحقق جديد إلى تيليجرام بنجاح");
        setResending(false);
        return;
      }

      const result = await resendAdminOtpAction(challengeToken);
      if (result.success) {
        setResendCooldown(60);
        setCountdown(300);
        setInfoMessage(result.message || "تم إرسال كود تحقق جديد إلى تيليجرام بنجاح");
      } else {
        setError(result.message || "تعذر إعادة إرسال الرمز");
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setError("حدث خطأ أثناء إعادة إرسال الكود");
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp("");
    setError("");
    setInfoMessage("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full blur-2xl"></div>

        {step === "login" ? (
          <>
            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <span className="material-symbols-outlined text-3xl text-primary glow-cyan">shield_person</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-on-surface mb-2">لوحة الإدارة</h1>
              <p className="text-on-surface-variant">قم بتسجيل الدخول للوصول إلى التحكم</p>
            </div>

            {error && (
              <div role="alert" className="bg-error/10 border border-error/20 text-error px-4 py-3.5 rounded-xl mb-6 text-sm relative z-10 text-center font-medium">
                <div>{error}</div>
                {blockedIp && (
                  <div className="mt-3 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleCopyIp}
                      className="px-3.5 py-1.5 rounded-lg bg-error/20 hover:bg-error/30 text-error text-xs font-bold transition-all border border-error/30 flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">
                        {copiedIp ? "check" : "content_copy"}
                      </span>
                      <span>{copiedIp ? "تم نسخ عنوان الـ IP للحافظة" : "نسخ عنوان الـ IP"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!clientReady && <div role="status" className="relative z-10 mb-5 text-sm leading-7 text-on-surface-variant text-center">جاري تجهيز نموذج الدخول… إذا استمر الانتظار، <a className="text-primary underline" href="/admin/login" target="_blank" rel="noopener noreferrer">افتح صفحة دخول جديدة</a>.</div>}
            <noscript><p className="relative z-10 mb-5 text-sm text-error">فعّل JavaScript في المتصفح لاستخدام تسجيل الدخول الآمن.</p></noscript>
            <form onSubmit={handleLogin} method="post" aria-busy={loading} className="space-y-5 relative z-10" dir="rtl">
              <div>
                <label htmlFor="admin-username" className="block text-sm font-medium text-on-surface-variant mb-2">اسم المستخدم</label>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all text-right"
                  required
                  placeholder="أدخل اسم المستخدم أو البريد"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-on-surface-variant mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all text-right"
                    required
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2"
                    title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!clientReady || loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-8 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
              >
                {!clientReady ? "جاري تجهيز الدخول…" : loading ? (
                  <span className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    تسجيل الدخول <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                <span className="material-symbols-outlined text-3xl text-sky-400">send_to_mobile</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-on-surface mb-2">التحقق بخطوتين (OTP)</h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                تم إرسال رمز الأمان المكون من 6 أرقام إلى حساب التيليجرام الخاص بالإدارة
              </p>
            </div>

            {infoMessage && (
              <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-4 py-3 rounded-xl mb-5 text-sm relative z-10 text-center font-medium">
                {infoMessage}
              </div>
            )}

            {error && (
              <div role="alert" className="bg-error/10 border border-error/20 text-error px-4 py-3.5 rounded-xl mb-5 text-sm relative z-10 text-center font-medium">
                <div>{error}</div>
                {blockedIp && (
                  <div className="mt-3 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleCopyIp}
                      className="px-3.5 py-1.5 rounded-lg bg-error/20 hover:bg-error/30 text-error text-xs font-bold transition-all border border-error/30 flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">
                        {copiedIp ? "check" : "content_copy"}
                      </span>
                      <span>{copiedIp ? "تم نسخ عنوان الـ IP للحافظة" : "نسخ عنوان الـ IP"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} method="post" aria-busy={loading} className="space-y-6 relative z-10" dir="rtl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="admin-otp" className="text-sm font-medium text-on-surface-variant">رمز التحقق السري</label>
                  <span className={`text-xs font-mono font-medium ${countdown < 60 ? "text-error" : "text-on-surface-variant"}`}>
                    صلاحية الرمز: {formatTime(countdown)}
                  </span>
                </div>
                <input
                  id="admin-otp"
                  name="otp"
                  ref={otpInputRef}
                  type="text"
                  dir="ltr"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
                    let res = raw;
                    for (let i = 0; i < 10; i++) {
                      res = res.replaceAll(arabicDigits[i], String(i)).replaceAll(persianDigits[i], String(i));
                    }
                    const val = res.replace(/\D/g, "");
                    setOtp(val);
                  }}
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface text-center font-mono text-2xl tracking-[0.35em] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    تأكيد وتسجيل الدخول <span className="material-symbols-outlined">verified_user</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-sm text-on-surface-variant border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {resending
                    ? "جاري الإرسال..."
                    : resendCooldown > 0
                    ? `إعادة الإرسال بعد (${resendCooldown} ثانية)`
                    : "إعادة إرسال الرمز"}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-on-surface-variant hover:text-on-surface hover:underline transition-colors cursor-pointer"
                >
                  تغيير الحساب
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
