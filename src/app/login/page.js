"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config";
import { Turnstile } from '@marsidev/react-turnstile';

export default function CustomerLogin() {
  const [activeTab, setActiveTab] = useState("login"); // login, register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState({ site_name: "عرب تك سيرفر", site_logo: "/logo.jpg" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [otpKey, setOtpKey] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpInfo, setOtpInfo] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef();

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState(0); // 0=none, 1=request, 2=verify, 3=reset
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotToken, setForgotToken] = useState("");

  // Change Password State
  const [changePassStep, setChangePassStep] = useState(0); // 0=none, 1=otp sent, enter new pass
  const [changePassNew, setChangePassNew] = useState("");

  // Live Gmail Validation State
  const [emailValidState, setEmailValidState] = useState({ checking: false, valid: null, message: "" });

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Live anti-fake Gmail check on registration email change
  useEffect(() => {
    if (activeTab !== "register" || !email.trim()) {
      setEmailValidState({ checking: false, valid: null, message: "" });
      return;
    }

    const clean = email.trim().toLowerCase();
    if (!clean.endsWith("@gmail.com") && !clean.endsWith("@googlemail.com")) {
      setEmailValidState({ checking: false, valid: false, message: "يجب إدخال بريد إلكتروني ينتهي بـ @gmail.com" });
      return;
    }

    setEmailValidState({ checking: true, valid: null, message: "جاري الفحص الحي للبريد الإلكتروني..." });

    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/customer/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean })
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setEmailValidState({ checking: false, valid: true, message: data.message });
          } else {
            setEmailValidState({ checking: false, valid: false, message: data.message });
          }
        })
        .catch(() => {
          setEmailValidState({ checking: false, valid: null, message: "" });
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [email, activeTab]);

  // Google OAuth 2.0 Direct Sign-In Handler
  useEffect(() => {
    if (otpStep || forgotStep > 0) return;

    let retryCount = 0;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "540676912586-68bp39ompaobro5p8g1o4t2f6nd8htr8.apps.googleusercontent.com";

    const initGoogleSignIn = () => {
      if (typeof window === "undefined") return;

      if (!window.google?.accounts?.id) {
        if (retryCount < 20) {
          retryCount++;
          setTimeout(initGoogleSignIn, 250);
        }
        return;
      }

      window.handleGoogleCallback = async (response) => {
        if (!response || !response.credential) return;
        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
          const res = await fetch(`${API_BASE_URL}/api/customer/google-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "فشل تسجيل الدخول عبر Google.");

          localStorage.setItem("customer_token", data.token);
          localStorage.setItem("customer_user", JSON.stringify(data.customer));

          setSuccess(data.message || "تم تسجيل الدخول المباشر عبر Google بنجاح 🚀");
          setTimeout(() => {
            if (typeof window !== "undefined") {
              const urlParams = new URLSearchParams(window.location.search);
              const redirectTo = urlParams.get("redirectTo");
              if (redirectTo) {
                router.push(redirectTo);
                router.refresh();
                return;
              }
            }
            router.push("/");
            router.refresh();
          }, 1000);
        } catch (err) {
          setError(err.message || "حدث خطأ أثناء الاتصال بخدمة Google.");
        } finally {
          setSubmitting(false);
        }
      };

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const btnContainer = document.getElementById("googleSignInContainer");
        if (btnContainer) {
          btnContainer.innerHTML = "";
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            width: 260,
            text: "continue_with",
            shape: "pill",
            locale: "ar"
          });
        }
      } catch (err) {
        console.warn("Google Sign-In initialization failed:", err);
      }
    };

    const scriptId = "google-gsi-client";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleSignIn();
      };
      document.head.appendChild(script);
    } else {
      initGoogleSignIn();
    }
  }, [activeTab, otpStep, forgotStep, router]);

  // Fetch settings on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      setIsLoggedIn(false);
      setLoadingProfile(false);
      return;
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirectTo");
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
    }

    setIsLoggedIn(true);
    fetch(`${API_BASE_URL}/api/customer/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          localStorage.removeItem("customer_token");
          localStorage.removeItem("customer_user");
          setIsLoggedIn(false);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data) {
          setCustomer(data);
          localStorage.setItem("customer_user", JSON.stringify(data));
        } else {
          const localUser = localStorage.getItem("customer_user");
          if (localUser) setCustomer(JSON.parse(localUser));
        }
      })
      .catch(err => {
        console.error("Failed to fetch profile:", err);
        const localUser = localStorage.getItem("customer_user");
        if (localUser) setCustomer(JSON.parse(localUser));
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (activeTab === "register") {
      if (!username.trim() || !email.trim() || !password || !phone.trim()) {
        setError("جميع الحقول المطلوبة (اسم المستخدم، البريد الإلكتروني، كلمة المرور، ورقم الواتساب) يجب ملؤها.");
        return;
      }

      if (username.trim().length < 3) {
        setError("يجب أن يكون اسم المستخدم 3 أحرف على الأقل.");
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(email.trim().toLowerCase())) {
        setError("يجب إدخال بريد إلكتروني Gmail صحيح (ينتهي بـ @gmail.com).");
        return;
      }

      if (password !== confirmPassword) {
        setError("كلمتا المرور غير متطابقتين.");
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setError("البريد الإلكتروني/اسم المستخدم وكلمة المرور مطلوبان.");
        return;
      }
    }

    if (!turnstileToken) {
      setError("يرجى التحقق من الكابتشا الأمني.");
      return;
    }

    setSubmitting(true);

    const endpoint = activeTab === "login" ? "login" : "register";
    const bodyObj = activeTab === "login" 
      ? { username, password, 'cf-turnstile-response': turnstileToken } 
      : { username, email, password, phone, 'cf-turnstile-response': turnstileToken, referred_by_code: localStorage.getItem('ref_code') };

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyObj)
      });

      const data = await response.json();

      if (!response.ok) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        throw new Error(data.message || "حدث خطأ أثناء معالجة الطلب.");
      }

      // If backend asks for OTP confirmation via WhatsApp/Gmail
      if (data.requireOtp) {
        setOtpKey(data.otpKey);
        setOtpInfo(data.targetInfo || "");
        setSuccess(data.message || "تم إرسال كود التحقق بنجاح.");
        setOtpStep(true);
        setSubmitting(false);
        return;
      }

      // Fallback direct login if OTP not required
      localStorage.setItem("customer_token", data.token);
      localStorage.setItem("customer_user", JSON.stringify(data.customer));

      setSuccess(activeTab === "login" ? "تم تسجيل دخولك بنجاح!" : "تم إنشاء حسابك وتسجيل الدخول بنجاح!");
      
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get("redirectTo");
          if (redirectTo) {
            router.push(redirectTo);
            router.refresh();
            return;
          }
        }
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError("يرجى إدخال كود التحقق المكون من 6 أرقام.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/verify-auth-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpKey, code: otpCode.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "كود التحقق غير صحيح.");
      }
      localStorage.setItem("customer_token", data.token);
      localStorage.setItem("customer_user", JSON.stringify(data.customer));
      setSuccess("تم تأكيد هويتك وتفعيل الحساب بنجاح! 🚀");
      setOtpStep(false);
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get("redirectTo");
          if (redirectTo) {
            router.push(redirectTo);
            router.refresh();
            return;
          }
        }
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "تعذر التحقق من الكود.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("يرجى التحقق من الكابتشا الأمني.");
      return;
    }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier, 'cf-turnstile-response': turnstileToken })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "حدث خطأ.");
      setSuccess(data.message);
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordVerify = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError("يرجى إدخال الكود بشكل صحيح.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/verify-forgot-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier, code: otpCode.trim() })
      });
      const data = await response.json();
      if (!response.ok) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        throw new Error(data.message || "الكود غير صحيح.");
      }
      setForgotToken(data.token);
      setSuccess(data.message);
      setOtpCode(""); // clear for next time
      setForgotStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!password || password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: forgotToken, newPassword: password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "حدث خطأ.");
      setSuccess(data.message);
      setTimeout(() => {
        setForgotStep(0);
        setActiveTab("login");
        setPassword("");
        setConfirmPassword("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setIsLoggedIn(false);
    setCustomer(null);
    router.push("/");
    router.refresh();
  };

  const handleChangePasswordRequest = async (method) => {
    setError(""); setSuccess(""); setSubmitting(true);
    const token = localStorage.getItem("customer_token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "حدث خطأ.");
      setSuccess(data.message);
      setChangePassStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!changePassNew || changePassNew.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("customer_token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: otpCode.trim(), newPassword: changePassNew })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "حدث خطأ.");
      setSuccess(data.message);
      setChangePassStep(0);
      setOtpCode("");
      setChangePassNew("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "20px", position: "relative" }}>
        {/* Removed Background Video and Overlay */}

        <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "10px" }}>
              <img
                src="/icons/icon-128.png"
                alt="عرب تك سيرفر online"
                style={{ width: "64px", height: "64px", borderRadius: "16px", objectFit: "cover" }}
              />
            </div>
            <h2 style={{ fontWeight: 900 }}>الملف الشخصي</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>بيانات حسابك الشخصي والتحكم بالرصيد</p>
          </div>

          {loadingProfile ? (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>جاري تحميل بيانات الحساب...</div>
          ) : customer ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Profile Details List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "👤 اسم المستخدم", value: customer.username, color: "var(--text-main)" },
                  { label: "✉️ البريد الإلكتروني", value: customer.email || "غير متوفر", color: "var(--text-main)", isEmail: true, ltr: true },
                  { label: "📞 رقم الهاتف", value: customer.phone || "غير متوفر", color: "var(--text-main)", ltr: true },
                  { label: "💳 رصيد المحفظة", value: `${Number(customer.balance || 0).toFixed(2)} USD`, color: "var(--primary-color)", fontWeight: "bold" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", gap: "10px" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "bold", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ 
                      fontSize: "0.9rem", 
                      fontWeight: row.fontWeight || "800", 
                      color: row.color, 
                      direction: row.ltr ? "ltr" : "rtl",
                      wordBreak: row.isEmail ? "break-all" : "normal",
                      overflowWrap: "anywhere",
                      textAlign: row.ltr ? "left" : "right",
                      maxWidth: "65%"
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Actions */}
              {changePassStep === 0 ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    <Link href="/orders" className="glass-btn glass-btn-primary" style={{ padding: "12px", textAlign: "center", textDecoration: "none", width: "100%", borderRadius: "12px", fontWeight: "bold" }}>
                      📦 تتبع واستعراض طلباتي
                    </Link>
                    <Link href="/wallet" className="glass-btn" style={{ padding: "12px", textAlign: "center", textDecoration: "none", width: "100%", borderRadius: "12px", fontWeight: "bold", background: "rgba(255,255,255,0.05)" }}>
                      💳 شحن رصيد المحفظة
                    </Link>
                    <button
                      onClick={async () => {
                        if (!window.PublicKeyCredential) {
                          setError("متصفحك لا يدعم تقنية البصمة الرقمية (WebAuthn).");
                          return;
                        }
                        setSubmitting(true); setError(""); setSuccess("");
                        try {
                          const token = localStorage.getItem("customer_token");
                          const res1 = await fetch(`${API_BASE_URL}/api/customer/passkey/register-challenge`, {
                            method: "POST", headers: { Authorization: `Bearer ${token}` }
                          });
                          const data1 = await res1.json();
                          if (!res1.ok) throw new Error(data1.message);

                          const challengeBuf = Uint8Array.from(atob(data1.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
                          const userBuf = Uint8Array.from(atob(data1.options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

                          const credential = await navigator.credentials.create({
                            publicKey: {
                              challenge: challengeBuf,
                              rp: data1.options.rp,
                              user: { id: userBuf, name: data1.options.user.name, displayName: data1.options.user.displayName },
                              pubKeyCredParams: data1.options.pubKeyCredParams,
                              authenticatorSelection: data1.options.authenticatorSelection,
                              timeout: 60000
                            }
                          });

                          const res2 = await fetch(`${API_BASE_URL}/api/customer/passkey/register-verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ credential: { id: credential.id, rawId: credential.id } })
                          });
                          const data2 = await res2.json();
                          if (!res2.ok) throw new Error(data2.message);
                          setSuccess("تم تفعيل وحفظ البصمة الرقمية (Face ID / Touch ID) بنجاح 👆🎉");
                        } catch (err) {
                          setError(err.message || "فشلت قراءة البصمة أو تم إلغاء العملية.");
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="btn-show-more-gold"
                      style={{ padding: "12px", width: "100%", borderRadius: "12px", fontSize: "0.95rem" }}
                      disabled={submitting}
                    >
                      👆 تفعيل الدخول ببصمة الأصبع / الوجه (Face ID)
                    </button>

                    <button
                      onClick={() => handleChangePasswordRequest("email")}
                      className="glass-btn"
                      style={{ padding: "12px", width: "100%", borderRadius: "12px", fontWeight: "bold", background: "rgba(255,255,255,0.05)" }}
                      disabled={submitting}
                    >
                      {submitting ? "جاري الإرسال..." : "🔒 تعيين / تغيير كلمة مرور المعاملات والقفل"}
                    </button>
                  </div>

                  <hr style={{ opacity: 0.08, margin: "10px 0" }} />

                  {/* Logout Action */}
                  <button
                    onClick={handleLogout}
                    className="glass-btn"
                    style={{ padding: "12px", width: "100%", borderRadius: "12px", color: "var(--danger-color)", fontWeight: "bold", background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.15)" }}
                  >
                    🚪 تسجيل الخروج من الحساب
                  </button>
                </>
              ) : (
                <form onSubmit={handleChangePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px", padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: "var(--primary-color)", textAlign: "center" }}>تغيير كلمة المرور</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginBottom: "5px" }}>
                    تم إرسال كود التحقق. يرجى إدخاله هنا مع كلمة المرور الجديدة.
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>كود التحقق (OTP):</label>
                    <input
                      type="text"
                      placeholder="1 2 3 4 5 6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-main)", textAlign: "center", letterSpacing: "5px", fontWeight: "bold" }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>كلمة المرور الجديدة:</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور الجديدة"
                        value={changePassNew}
                        onChange={(e) => setChangePassNew(e.target.value)}
                        style={{ width: "100%", padding: "10px 40px 10px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-main)" }}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>
                        {showPassword ? "إخفاء" : "إظهار"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary" style={{ padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                    {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                  </button>
                  <button type="button" onClick={() => { setChangePassStep(0); setOtpCode(""); setChangePassNew(""); }} className="glass-btn" style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)" }}>
                    إلغاء
                  </button>
                </form>
              )}

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", marginTop: "10px" }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", borderRight: "4px solid var(--success-color)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", marginTop: "10px" }}>
                  ✓ {success}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--danger-color)" }}>فشل تحميل الملف الشخصي. يرجى تسجيل الدخول مجدداً.</div>
          )}

          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <Link href="/" style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "600" }}>
              ← العودة للموقع الرئيسي للتصفح
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "40px 20px", position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap-reverse", gap: "60px", maxWidth: "1100px", width: "100%", alignItems: "center", justifyContent: "center" }}>
        
        {/* RIGHT COLUMN: Feature Cards (First in RTL so it shows on the Right) */}
        <div className="login-features" style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "25px" }}>
          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)", transition: "transform 0.3s", cursor: "default" }} onMouseEnter={(e)=>e.currentTarget.style.transform="translateX(-10px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="translateX(0)"}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
              📂
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: 900 }}>طلباتك محفوظة</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>جميع طلباتك ومعاملاتك محفوظة بأمان في حسابك</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)", transition: "transform 0.3s", cursor: "default" }} onMouseEnter={(e)=>e.currentTarget.style.transform="translateX(-10px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="translateX(0)"}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
              👛
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: 900 }}>محفظتك آمنة</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>رصيدك متاح دائماً لاستخدامه في أي وقت</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "30px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-glass-deep)", border: "1px solid var(--border-glass)", transition: "transform 0.3s", cursor: "default" }} onMouseEnter={(e)=>e.currentTarget.style.transform="translateX(-10px)"} onMouseLeave={(e)=>e.currentTarget.style.transform="translateX(0)"}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "rgba(234, 179, 8, 0.1)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>
              🛡️
            </div>
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: 900 }}>تسجيل دخول آمن</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>نستخدم أحدث تقنيات التشفير لحماية بياناتك</p>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Login Form (Second in RTL so it shows on the Left) */}
        <div style={{ flex: "1 1 440px", display: "flex", justifyContent: "center", position: "relative", zIndex: 10 }}>
      {/* Removed Background Video and Overlay */}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes revealFromHeart {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(30px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        .animate-line {
          opacity: 0;
          animation: revealFromHeart 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .line-1 { animation-delay: 0.05s; }
        .line-2 { animation-delay: 0.1s; }
        .line-3 { animation-delay: 0.15s; }
        .line-4 { animation-delay: 0.2s; }
        .line-5 { animation-delay: 0.25s; }
        .line-6 { animation-delay: 0.3s; }
        .line-7 { animation-delay: 0.35s; }
        .line-8 { animation-delay: 0.4s; }
        .line-9 { animation-delay: 0.45s; }
        .line-10 { animation-delay: 0.5s; }
        .line-11 { animation-delay: 0.55s; }

        .custom-login-panel {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          background: var(--bg-glass) !important;
          border: var(--border-glass) !important;
          box-shadow: var(--shadow-card) !important;
          border-radius: 24px;
          padding: 30px !important;
        }

        .custom-login-panel .form-group label {
          color: var(--text-main) !important;
          font-weight: 700 !important;
          font-size: 0.9rem !important;
          margin-bottom: 6px !important;
        }

        .custom-login-panel .form-group input {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          color: var(--text-main) !important;
          border-radius: 14px !important;
          padding: 14px 18px !important;
          font-size: 0.95rem !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        [data-theme="light"] .custom-login-panel .form-group input {
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }
        
        .custom-login-panel .form-group input::placeholder {
          color: var(--text-faint) !important;
        }

        .custom-login-panel .form-group input:focus {
          border-color: var(--primary-color) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 0 15px rgba(0, 180, 216, 0.25) !important;
          transform: translateY(-2px);
        }

        [data-theme="light"] .custom-login-panel .form-group input:focus {
          background: rgba(0, 0, 0, 0.06) !important;
        }

        .custom-login-panel .glass-btn-primary {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%) !important;
          border: none !important;
          color: #ffffff !important;
          box-shadow: 0 8px 25px rgba(0, 180, 216, 0.35) !important;
          font-weight: 800 !important;
          font-size: 1rem !important;
          padding: 14px !important;
          border-radius: 14px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
        }

        .custom-login-panel .glass-btn-primary:hover {
          box-shadow: 0 12px 30px rgba(0, 180, 216, 0.55) !important;
          transform: translateY(-2px) scale(1.02);
        }

        .custom-login-panel .glass-btn {
          border-radius: 14px !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
        }

        .custom-login-panel .glass-btn:hover {
          transform: translateY(-2px) scale(1.02);
        }

        #googleSignInContainer iframe,
        #googleSignInContainer div,
        .L5Fo6c-bF1uUb {
          max-width: 250px !important;
          margin: 0 auto !important;
        }

        @media (max-width: 640px) {
          .register-password-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }
      ` }} />

      <div key={`${activeTab}-${forgotStep}-${otpStep}`} className="custom-login-panel">
        
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div className="animate-line line-1" style={{ display: "inline-flex", justifyContent: "center", marginBottom: "10px" }}>
            <img 
              src="/logo.jpg" 
              alt={settings.site_name || "عرب تك سيرفر online"} 
              style={{ width: "54px", height: "54px", borderRadius: "12px", objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 5px rgba(234,179,8,0.2))" }} 
            />
          </div>
          <h2 className="animate-line line-2" style={{ fontWeight: 900, margin: 0 }}>حساب {settings.site_name}</h2>
          <p className="animate-line line-3" style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>تابع مشترياتك واحصل على خدماتك بسرعة فائقة</p>
        </div>

        {otpStep ? (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="animate-line line-4" style={{ textAlign: "center", background: "rgba(56, 189, 248, 0.08)", border: "1px dashed rgba(56, 189, 248, 0.3)", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "6px" }}>📲</div>
              <h3 style={{ fontWeight: 800, color: "#38bdf8", margin: "0 0 6px 0" }}>تأكيد الهوية وتفعيل الحساب</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                تم إرسال كود تحقق (OTP) مكون من 6 أرقام إلى <strong>{otpInfo || "حسابك"}</strong>. يرجى إدخاله أدناه لإتمام العملية.
              </p>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.05)" }}>
                📢 <strong>لتلقي الأكواد عبر تيليجرام:</strong><br />
                افتح البوت واضغط Start ثم ارسل اسم مستخدم حسابك للربط.<br />
                <a 
                  href="https://t.me/ArabTechOTPBot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: "8px", background: "#0088cc", color: "var(--text-main)", padding: "6px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "0.75rem" }}
                >
                  ✈️ افتح بوت التيليجرام واضغط Start
                </a>
              </div>
            </div>

            <div className="form-group animate-line line-5" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: "8px", display: "block" }}>كود التحقق (OTP):</label>
              <input
                type="text"
                placeholder="1 2 3 4 5 6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                style={{ width: "100%", textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px", fontWeight: 900, padding: "14px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.15)" }}
                required
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", borderRight: "4px solid var(--success-color)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="glass-btn glass-btn-primary animate-line line-6"
              style={{ padding: "14px", width: "100%", borderRadius: "12px", fontWeight: 800, fontSize: "1.05rem" }}
            >
              {submitting ? "جاري التحقق..." : "🚀 تأكيد والدخول الآن"}
            </button>

            <button
              type="button"
              onClick={() => { setOtpStep(false); setOtpCode(""); setError(""); setSuccess(""); }}
              className="glass-btn animate-line line-7"
              style={{ padding: "10px", width: "100%", borderRadius: "12px", background: "rgba(255,255,255,0.04)" }}
            >
              ← العودة وتعديل البيانات
            </button>
          </form>
        ) : forgotStep > 0 ? (
          <>
            {forgotStep === 1 && (
              <form onSubmit={handleForgotPasswordRequest} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 className="animate-line line-4" style={{ margin: "0 0 10px 0", color: "var(--text-main)", textAlign: "center" }}>استعادة كلمة المرور</h3>
                <p className="animate-line line-5" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginBottom: "10px" }}>
                  يرجى إدخال البريد الإلكتروني، رقم الهاتف، أو اسم المستخدم لإرسال كود التحقق.
                </p>
                <div className="form-group animate-line line-6" style={{ marginBottom: 0 }}>
                  <label>المُعرّف الخاص بك:</label>
                  <input
                    type="text"
                    placeholder="example@gmail.com أو 01012345678"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginTop: "15px", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
                  <Turnstile 
                    key="turnstile-forgot"
                    ref={turnstileRef}
                    siteKey="0x4AAAAAAEGa8uvGDLwzrReL"
                    options={{ theme: 'auto', action: 'turnstile-spin-v2' }}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
                {error && <div style={{ padding: "10px", background: "rgba(244, 63, 94, 0.1)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem" }}>⚠️ {error}</div>}
                {success && <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem" }}>✓ {success}</div>}
                <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary animate-line line-7" style={{ padding: "12px", borderRadius: "12px" }}>
                  {submitting ? "جاري الإرسال..." : "إرسال كود التحقق"}
                </button>
                <button type="button" onClick={() => { setForgotStep(0); setError(""); setSuccess(""); }} className="glass-btn animate-line line-8" style={{ padding: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.04)" }}>
                  ← العودة لتسجيل الدخول
                </button>
              </form>
            )}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotPasswordVerify} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 className="animate-line line-4" style={{ margin: "0 0 10px 0", color: "var(--text-main)", textAlign: "center" }}>إدخال كود التحقق</h3>
                <p className="animate-line line-5" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginBottom: "10px" }}>
                  تم إرسال الكود إلى حسابك. يرجى إدخاله هنا.
                </p>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", padding: "10px", fontSize: "0.8rem", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", marginBottom: "10px" }}>
                  📢 <strong>لم تستلم الكود على تيليجرام؟</strong><br />
                  تأكد من فتح البوت والضغط على Start وإرسال اسم حسابك.<br />
                  <a 
                    href="https://t.me/ArabTechOTPBot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: "8px", background: "#0088cc", color: "var(--text-main)", padding: "6px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "0.75rem" }}
                  >
                    ✈️ افتح بوت التيليجرام
                  </a>
                </div>
                <div className="form-group animate-line line-6" style={{ marginBottom: 0 }}>
                  <label>كود التحقق (OTP):</label>
                  <input
                    type="text"
                    placeholder="1 2 3 4 5 6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px", fontWeight: 900 }}
                    required
                  />
                </div>
                {error && <div style={{ padding: "10px", background: "rgba(244, 63, 94, 0.1)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem" }}>⚠️ {error}</div>}
                {success && <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem" }}>✓ {success}</div>}
                <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary animate-line line-7" style={{ padding: "12px", borderRadius: "12px" }}>
                  {submitting ? "جاري التحقق..." : "تأكيد الكود"}
                </button>
                <button type="button" onClick={() => { setForgotStep(1); setOtpCode(""); setError(""); setSuccess(""); }} className="glass-btn animate-line line-8" style={{ padding: "10px", borderRadius: "12px", background: "rgba(255,255,255,0.04)" }}>
                  ← إعادة طلب الكود
                </button>
              </form>
            )}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotPasswordReset} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 className="animate-line line-4" style={{ margin: "0 0 10px 0", color: "var(--text-main)", textAlign: "center" }}>تعيين كلمة مرور جديدة</h3>
                <div className="form-group animate-line line-5" style={{ marginBottom: 0 }}>
                  <label>كلمة المرور الجديدة:</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور الجديدة"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", paddingLeft: "48px" }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>
                <div className="form-group animate-line line-6" style={{ marginBottom: 0 }}>
                  <label>تأكيد كلمة المرور:</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="أعد إدخال كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: "100%", paddingLeft: "48px" }}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "15px", display: "flex", justifyContent: "center" }}>
                  <Turnstile 
                    key="turnstile-reset"
                    ref={turnstileRef}
                    siteKey="0x4AAAAAAEGa8uvGDLwzrReL"
                    options={{ theme: 'auto', action: 'turnstile-spin-v2' }}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                {error && <div style={{ padding: "10px", background: "rgba(244, 63, 94, 0.1)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem" }}>⚠️ {error}</div>}
                {success && <div style={{ padding: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem" }}>✓ {success}</div>}
                <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary animate-line line-7" style={{ padding: "12px", borderRadius: "12px" }}>
                  {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </button>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* Google Direct 1-Click Sign-In Section */}
            <div className="animate-line line-4" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "8px" }}>
              <div id="googleSignInContainer" style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "260px", margin: "0 auto", minHeight: "44px" }}></div>
              <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "6px 0 2px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.12)" }}></div>
                <span style={{ padding: "0 10px", fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "700" }}>أو بالبيانات التقليدية</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.12)" }}></div>
              </div>
            </div>

            {activeTab === "login" ? (
              <>
                <div className="form-group animate-line line-4" style={{ marginBottom: 0 }}>
                  <label htmlFor="username">البريد الإلكتروني (الجميل) أو اسم المستخدم:</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="أدخل البريد الإلكتروني أو اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group animate-line line-5" style={{ marginBottom: 0 }}>
                  <label htmlFor="password">كلمة المرور:</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", paddingLeft: "48px" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      className="password-toggle-btn"
                    >
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group animate-line line-4" style={{ marginBottom: 0 }}>
                  <label htmlFor="username">اسم المستخدم:</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="مثال: zoom_player"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group animate-line line-5" style={{ marginBottom: 0 }}>
                  <label htmlFor="email">البريد الإلكتروني (الجميل - Gmail):</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {emailValidState.message && (
                    <div style={{
                      fontSize: "0.78rem",
                      marginTop: "6px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                      background: emailValidState.checking
                        ? "rgba(56, 189, 248, 0.1)"
                        : emailValidState.valid
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(244, 63, 94, 0.1)",
                      color: emailValidState.checking
                        ? "#38bdf8"
                        : emailValidState.valid
                        ? "#10b981"
                        : "#f43f5e"
                    }}>
                      {emailValidState.checking ? "⏳ " : emailValidState.valid ? "✓ " : "⚠️ "}
                      {emailValidState.message}
                    </div>
                  )}
                </div>
                <div className="register-password-grid animate-line line-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%", margin: "0 auto" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="password">كلمة المرور:</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", paddingLeft: "48px" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="password-toggle-btn"
                      >
                        {showPassword ? "إخفاء" : "إظهار"}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="confirmPassword">تأكيد كلمة المرور:</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: "100%", paddingLeft: "48px" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="password-toggle-btn"
                      >
                        {showPassword ? "إخفاء" : "إظهار"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-group animate-line line-7" style={{ marginBottom: 0 }}>
                  <label htmlFor="phone">رقم الهاتف (واتساب) - مطلوب:</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="مثال: 01023456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div style={{ marginTop: "15px", marginBottom: "15px", display: "flex", justifyContent: "center" }}>
              <Turnstile 
                key="turnstile-main"
                ref={turnstileRef}
                siteKey="0x4AAAAAAEGa8uvGDLwzrReL"
                options={{ theme: 'auto', action: 'turnstile-spin-v2' }}
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(244, 63, 94, 0.1)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{ padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", borderRight: "4px solid var(--success-color)", color: "var(--success-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                ✓ {success}
              </div>
            )}

            {activeTab === "login" ? (
              <div className="animate-line line-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "12px", borderRadius: "12px", width: "100%" }}
                >
                  {submitting ? "جاري..." : "تسجيل الدخول"}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("register"); setError(""); setSuccess(""); }}
                  className="glass-btn"
                  style={{ padding: "12px", borderRadius: "12px", width: "100%", background: "rgba(0, 180, 216, 0.1)", color: "var(--primary-color)", border: "1px solid rgba(0, 180, 216, 0.25)", fontWeight: "800", fontSize: "0.95rem" }}
                >
                  إنشاء حساب
                </button>
              </div>
            ) : (
              <div className="animate-line line-8" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glass-btn glass-btn-primary"
                  style={{ padding: "12px", borderRadius: "12px", width: "100%" }}
                >
                  {submitting ? "جاري..." : "إنشاء الحساب"}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
                  className="glass-btn"
                  style={{ padding: "12px", borderRadius: "12px", width: "100%", background: "rgba(0, 180, 216, 0.1)", color: "var(--primary-color)", border: "1px solid rgba(0, 180, 216, 0.25)", fontWeight: "800", fontSize: "0.95rem" }}
                >
                  تسجيل الدخول
                </button>
              </div>
            )}

            {activeTab === "login" && (
              <div className="animate-line line-7" style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => { setForgotStep(1); setError(""); setSuccess(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "underline", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = "var(--primary-color)"}
                  onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                >
                  هل نسيت كلمة المرور؟
                </button>
              </div>
            )}
          </form>
        )}

        <hr className={`animate-line ${activeTab === "login" ? "line-8" : "line-10"}`} style={{ opacity: 0.1 }} />

        <div className={`animate-line ${activeTab === "login" ? "line-9" : "line-11"}`} style={{ textAlign: "center" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--accent-color)", fontWeight: "600" }}>
            ← العودة للموقع الرئيسي للتصفح
          </Link>
        </div>

      </div>
        </div>
      </div>
    </div>
  );
}



