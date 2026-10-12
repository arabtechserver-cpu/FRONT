"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { Locale } from "@/i18n/config";
import TermsModal from "@/components/TermsModal";
import CloudflareTurnstile, { resetTurnstile } from "@/components/CloudflareTurnstile";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "149631802250-7n94rcr7nd1041iq06ck2310uctituve.apps.googleusercontent.com";

interface Country {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  walletsAr: string[];
  walletsEn: string[];
}

const ALL_COUNTRIES: Country[] = [
  {
    code: "EG",
    nameAr: "مصر",
    nameEn: "Egypt",
    flag: "EG",
    dialCode: "+20",
    walletsAr: ["فودافون كاش (Vodafone Cash)", "إنستا باي (InstaPay)", "أورنج كاش (Orange Cash)", "اتصالات كاش (Etisalat Cash)", "وي باي (WE Pay)", "تحويل بنكي مصري"],
    walletsEn: ["Vodafone Cash", "InstaPay", "Orange Cash", "Etisalat Cash", "WE Pay", "Egyptian Bank Transfer"]
  },
  {
    code: "SA",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    flag: "SA",
    dialCode: "+966",
    walletsAr: ["STC Pay", "Urpay", "بطاقة مدى (Mada)", "Apple Pay", "تحويل بنكي محلي (راجحي/أهلي)"],
    walletsEn: ["STC Pay", "Urpay", "Mada Card", "Apple Pay", "Local Bank Transfer (Rajhi/SNB)"]
  },
  {
    code: "AE",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    flag: "AE",
    dialCode: "+971",
    walletsAr: ["Binance Pay", "Apple Pay", "بطاقات فيزا / ماستركارد", "تحويل بنكي إماراتي"],
    walletsEn: ["Binance Pay", "Apple Pay", "Visa / Mastercard", "UAE Bank Transfer"]
  },
  {
    code: "SD",
    nameAr: "السودان",
    nameEn: "Sudan",
    flag: "SD",
    dialCode: "+249",
    walletsAr: ["بنكك (بنك الخرطوم - Bankak)", "فوري (Fawry Sudan)", "USDT كريبتو"],
    walletsEn: ["Bankak (Bank of Khartoum)", "Fawry Sudan", "USDT Crypto"]
  },
  {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    flag: "KW",
    dialCode: "+965",
    walletsAr: ["K-Net (كي نت)", "Apple Pay", "تحويل بنكي كويتي"],
    walletsEn: ["K-Net", "Apple Pay", "Kuwaiti Bank Transfer"]
  },
  {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    flag: "QA",
    dialCode: "+974",
    walletsAr: ["iPay Qatar", "Apple Pay", "بطاقة فيزا/ماستر", "تحويل بنكي قطري"],
    walletsEn: ["iPay Qatar", "Apple Pay", "Visa / Mastercard", "Qatari Bank Transfer"]
  },
  {
    code: "JO",
    nameAr: "الأردن",
    nameEn: "Jordan",
    flag: "JO",
    dialCode: "+962",
    walletsAr: ["زين كاش الأردن (Zain Cash JO)", "اي فواتيركم (eFAWATEERcom)", "دينارك (Dinarak)", "محفظة أورانج كاش"],
    walletsEn: ["Zain Cash JO", "eFAWATEERcom", "Dinarak", "Orange Money JO"]
  },
  {
    code: "IQ",
    nameAr: "العراق",
    nameEn: "Iraq",
    flag: "IQ",
    dialCode: "+964",
    walletsAr: ["زين كاش العراق (Zain Cash IQ)", "آسيا حوالة (Asiahawala)", "ماستركارد النخيل / كي كارد", "محفظة FastPay"],
    walletsEn: ["Zain Cash IQ", "Asiahawala", "Qi Card / Qi Master", "FastPay Wallet"]
  },
  {
    code: "DZ",
    nameAr: "الجزائر",
    nameEn: "Algeria",
    flag: "DZ",
    dialCode: "+213",
    walletsAr: ["بريدي موب (BaridiMob)", "CCP الجزائر", "Wise / Paysera"],
    walletsEn: ["BaridiMob", "Algeria CCP", "Wise / Paysera"]
  },
  {
    code: "MA",
    nameAr: "المغرب",
    nameEn: "Morocco",
    flag: "MA",
    dialCode: "+212",
    walletsAr: ["Wafacash (وفاكاش)", "CIH Bank (بنك CIH)", "التجاري وفا بنك", "BMCE Direct"],
    walletsEn: ["Wafacash", "CIH Bank", "Attijariwafa Bank", "BMCE Direct"]
  },
  {
    code: "TN",
    nameAr: "تونس",
    nameEn: "Tunisia",
    flag: "TN",
    dialCode: "+216",
    walletsAr: ["D17 البريد التونسي", "Sobflous", "تحويل بنكي تونسي"],
    walletsEn: ["D17 La Poste Tunisienne", "Sobflous", "Tunisian Bank Transfer"]
  },
  {
    code: "LY",
    nameAr: "ليبيا",
    nameEn: "Libya",
    flag: "LY",
    dialCode: "+218",
    walletsAr: ["سداد (Sadad Libya)", "تداول (Tadawul)", "موبي كاش (MobiCash)", "كروت مدار / ليبيانا"],
    walletsEn: ["Sadad Libya", "Tadawul", "MobiCash", "Madar / Libyana Cards"]
  },
  {
    code: "OM",
    nameAr: "عُمان",
    nameEn: "Oman",
    flag: "OM",
    dialCode: "+968",
    walletsAr: ["Thawani Pay (محفظة ثواني)", "BenefitPay Oman", "تحويل بنكي عماني"],
    walletsEn: ["Thawani Pay", "BenefitPay Oman", "Omani Bank Transfer"]
  },
  {
    code: "BH",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    flag: "BH",
    dialCode: "+973",
    walletsAr: ["BenefitPay (بنفت باي)", "STC Pay Bahrain", "Apple Pay"],
    walletsEn: ["BenefitPay", "STC Pay Bahrain", "Apple Pay"]
  },
  {
    code: "PS",
    nameAr: "فلسطين",
    nameEn: "Palestine",
    flag: "PS",
    dialCode: "+970",
    walletsAr: ["محفظة جوال باي (Jawwal Pay)", "محفظة بال باي (PalPay)", "تحويل بنك فلسطين"],
    walletsEn: ["Jawwal Pay", "PalPay", "Bank of Palestine Transfer"]
  },
  {
    code: "YE",
    nameAr: "اليمن",
    nameEn: "Yemen",
    flag: "YE",
    dialCode: "+967",
    walletsAr: ["جوال سبأ (Kuraimi / الكريمي)", "محفظة كاش", "جيب (Jeeb)"],
    walletsEn: ["Kuraimi Express", "Cash Wallet Yemen", "Jeeb Wallet"]
  },
  {
    code: "SY",
    nameAr: "سوريا",
    nameEn: "Syria",
    flag: "SY",
    dialCode: "+963",
    walletsAr: ["سيريتل كاش (Syriatel Cash)", "كاش موبايل (MTN Cash)", "USDT الرقمي"],
    walletsEn: ["Syriatel Cash", "MTN Cash Syria", "USDT Crypto"]
  },
  {
    code: "LB",
    nameAr: "لبنان",
    nameEn: "Lebanon",
    flag: "LB",
    dialCode: "+961",
    walletsAr: ["Whish Money", "OMT Card / Cash", "USDT الرقمي"],
    walletsEn: ["Whish Money", "OMT Cash", "USDT Crypto"]
  },
  {
    code: "TR",
    nameAr: "تركيا",
    nameEn: "Turkey",
    flag: "TR",
    dialCode: "+90",
    walletsAr: ["Papara (بابارا)", "Ininal Card", "تحويل زراعات بنك (Ziraat Bank)"],
    walletsEn: ["Papara", "Ininal Card", "Ziraat Bank Transfer"]
  },
  {
    code: "US",
    nameAr: "الولايات المتحدة",
    nameEn: "United States",
    flag: "US",
    dialCode: "+1",
    walletsAr: ["Zelle", "Venmo", "CashApp", "Apple Pay", "Credit Card / Stripe"],
    walletsEn: ["Zelle", "Venmo", "CashApp", "Apple Pay", "Credit Card / Stripe"]
  },
  {
    code: "GB",
    nameAr: "المملكة المتحدة",
    nameEn: "United Kingdom",
    flag: "GB",
    dialCode: "+44",
    walletsAr: ["Revolut", "Monzo", "Faster Payments UK", "Apple Pay"],
    walletsEn: ["Revolut", "Monzo", "Faster Payments UK", "Apple Pay"]
  },
  {
    code: "DE",
    nameAr: "ألمانيا",
    nameEn: "Germany",
    flag: "DE",
    dialCode: "+49",
    walletsAr: ["SEPA Instant Transfer", "PayPal Europe", "Revolut / N26"],
    walletsEn: ["SEPA Instant Transfer", "PayPal Europe", "Revolut / N26"]
  },
  {
    code: "FR",
    nameAr: "فرنسا",
    nameEn: "France",
    flag: "FR",
    dialCode: "+33",
    walletsAr: ["Lydia Pay", "SEPA Instant Transfer", "Carte Bancaire"],
    walletsEn: ["Lydia Pay", "SEPA Instant Transfer", "Carte Bancaire"]
  },
  {
    code: "CA",
    nameAr: "كندا",
    nameEn: "Canada",
    flag: "CA",
    dialCode: "+1",
    walletsAr: ["Interac e-Transfer", "Apple Pay", "Credit Card"],
    walletsEn: ["Interac e-Transfer", "Apple Pay", "Credit Card"]
  },
  {
    code: "OTHER",
    nameAr: "باقي دول العالم",
    nameEn: "Other International Countries",
    flag: "INTL",
    dialCode: "+0",
    walletsAr: ["USDT TRC20 / BEP20 (Cryptocurrency)", "Binance Pay", "Perfect Money", "Payeer", "Credit / Debit Card"],
    walletsEn: ["USDT TRC20 / BEP20 (Cryptocurrency)", "Binance Pay", "Perfect Money", "Payeer", "Credit / Debit Card"]
  }
];

export default function RegisterClient({ lang, dict }: { lang: Locale; dict: any }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState("EG");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<"terms" | "refund">("terms");

  // Visibility & Loading states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

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
        setTimeout(() => {
          window.location.href = `/${lang}`;
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
        const btnContainer = document.getElementById("googleSignUpBtnCustom");
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 360,
            text: "signup_with",
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

  const selectedCountry = useMemo(() => {
    return ALL_COUNTRIES.find((c) => c.code === selectedCountryCode) || ALL_COUNTRIES[0];
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery]);

  // Generate Strong Password Generator (e.g. 3r43t54#X9!)
  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setErrorMessage("");
  };

  // Password Strength Rating
  const passwordStrength = useMemo(() => {
    if (!password) return { percent: 0, textAr: "", textEn: "", color: "bg-gray-600" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { percent: 25, textAr: "ضعيفة", textEn: "Weak", color: "bg-red-500" };
    if (score === 2) return { percent: 50, textAr: "متوسطة", textEn: "Medium", color: "bg-yellow-500" };
    if (score === 3) return { percent: 75, textAr: "قوية", textEn: "Strong", color: "bg-violet-500" };
    return { percent: 100, textAr: "قوية جداً", textEn: "Very Strong", color: "bg-primary glow-cyan" };
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Fast Instant Registration Handler
  const handleFastRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال الاسم الكامل!" : "Please enter your full name!");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال بريد إلكتروني صحيح!" : "Please enter a valid email address!");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال رقم الهاتف / الواتساب!" : "Please enter your phone/WhatsApp number!");
      return;
    }
    if (!username.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال اسم المستخدم!" : "Please enter a username!");
      return;
    }
    if (!password) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال كلمة المرور!" : "Please enter a password!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(lang === "ar" ? "كلمات المرور غير متطابقة!" : "Passwords do not match!");
      return;
    }
    if (!termsAgreed) {
      setErrorMessage(lang === "ar" ? "الرجاء الموافقة على شروط الخدمة وسياسة الخصوصية!" : "Please agree to Terms of Service and Privacy Policy!");
      return;
    }

    setIsLoading(true);

    try {
      const rawPhone = phone.trim();
      const formattedPhone = rawPhone.startsWith("+") 
        ? rawPhone 
        : `${selectedCountry.dialCode} ${rawPhone.replace(/^0+/, "")}`;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          username,
          password,
          phone: formattedPhone,
          country: selectedCountry.code,
          "cf-turnstile-response": turnstileToken || "cf-turnstile-client-fallback"
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
        setSuccessMessage(lang === "ar" ? "تم إنشاء الحساب وتسجيل الدخول بنجاح! جاري التوجيه..." : "Account created & logged in successfully!");
        setTimeout(() => {
          window.location.href = `/${lang}`;
        }, 1000);
      } else {
        const errorMsg = data.error || data.message || (lang === "ar" ? "حدث خطأ أثناء عملية التسجيل!" : "Registration failed!");
        setErrorMessage(errorMsg);
        setTurnstileToken("");
        resetTurnstile();
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
      setTurnstileToken("");
      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16">
      <div className="bg-surface-container w-full max-w-2xl rounded-2xl p-6 sm:p-8 border shadow-sm relative">
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href={`/${lang}`} className="mb-4 flex items-center justify-center" aria-label="Home">
            <img 
              src="/images/borai-logo.png?v=2" 
              alt="BORAI SERVER" 
              className="h-12 sm:h-14 w-auto max-w-[240px] object-contain" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold ">{dict.register.title}</h1>
          <p className="text-slate-500 text-sm mt-1.5 text-center max-w-sm">{dict.register.subtitle}</p>
        </div>

        {/* Quick Google Sign-Up Button */}
        <div className="mb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
          <Script 
            src="https://accounts.google.com/gsi/client" 
            strategy="afterInteractive" 
            onLoad={initGoogleAuth}
          />
          <div id="googleSignUpBtnCustom" className="w-full flex justify-center min-h-[44px]"></div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t "></div>
            <span className="absolute px-3 text-xs text-slate-400 font-medium rounded-full border ">{dict.login.or}</span>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* FAST INSTANT REGISTRATION FORM */}
        <form onSubmit={handleFastRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" autoComplete="off">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-fullname" className="text-xs font-semibold uppercase tracking-wider">{dict.register.fullName}</label>
              <input 
                id="reg-fullname"
                name="fullName"
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={dict.register.fullName}
                className="w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wider">{dict.register.email}</label>
              <input 
                id="reg-email"
                name="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={dict.register.email}
                className="w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-mono"
              />
            </div>

            {/* PHONE NUMBER FIELD WITH COUNTRY CODE PREVIEW */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="reg-phone" className="text-xs font-semibold uppercase tracking-wider">
                  {dict.register.phone || (lang === "ar" ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp Number")}
                </label>
                <span className="text-[11px] text-blue-600 font-mono font-bold flex items-center gap-1.5 dir-ltr bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <span className="px-1 rounded bg-blue-100 text-[10px]">{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </span>
              </div>
              <div className="relative flex items-center">
                <span className={`material-symbols-outlined text-base absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} text-slate-400 pointer-events-none`}>
                  call
                </span>
                <input 
                  id="reg-phone"
                  name="phone"
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={dict.register.phonePlaceholder || "01012345678"}
                  autoComplete="tel"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label={dict.register.phone || (lang === "ar" ? "رقم الهاتف أو الواتساب" : "Phone or WhatsApp Number")}
                  className={`w-full border rounded-xl py-3 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} font-mono text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 placeholder:font-sans`}
                />
              </div>
            </div>

            {/* PASSWORD FIELD WITH EYE TOGGLE & GENERATOR */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-wider">{dict.register.password}</label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                  {lang === "ar" ? "توليد كلمة مرور قوية" : "Generate Strong Password"}
                </button>
              </div>

              <div className="relative">
                <input 
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********" 
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label={dict.register.password}
                  className={`w-full border rounded-xl py-3 ${lang === 'ar' ? 'pr-4 pl-11' : 'pl-4 pr-11'} text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[11px] font-semibold">
                    <span className="text-slate-500">
                      {lang === "ar" ? "قوة كلمة المرور:" : "Password Strength:"}
                    </span>
                    <span className="text-blue-600">{lang === "ar" ? passwordStrength.textAr : passwordStrength.textEn}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${passwordStrength.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-username" className="text-xs font-semibold uppercase tracking-wider">{dict.register.username}</label>
              <input 
                id="reg-username"
                name="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe99" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label={dict.register.username}
                className="w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Searchable Country Selector */}
            <div className="flex flex-col gap-1.5 relative">
              <label htmlFor="reg-country-btn" className="text-xs font-semibold uppercase tracking-wider">
                {lang === "ar" ? "الدولة (جميع دول العالم)" : "Country"}
              </label>

              <button
                id="reg-country-btn"
                type="button"
                aria-label={lang === "ar" ? "اختر الدولة" : "Select country"}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full border rounded-xl py-3 px-4 flex items-center justify-between  focus:outline-none transition-all text-sm"
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 font-mono text-xs font-bold">{selectedCountry.flag}</span>
                  <span>{lang === "ar" ? selectedCountry.nameAr : selectedCountry.nameEn}</span>
                  <span className="text-xs text-slate-400">({selectedCountry.dialCode})</span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
              </button>

              {/* Searchable Dropdown Popover */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 border rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative mb-2.5">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">search</span>
                    <input
                      id="reg-country-search"
                      name="country-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "ar" ? "ابحث باسم الدولة..." : "Search country..."}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-label={lang === "ar" ? "ابحث باسم الدولة" : "Search country"}
                      className="w-full border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:bg-white focus:border-blue-600"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 pr-1 custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(country.code);
                            setDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium text-start transition-all ${
                            selectedCountryCode === country.code
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : " hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded border  font-mono text-[11px]">{country.flag}</span>
                            <span>{lang === "ar" ? country.nameAr : country.nameEn}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{country.dialCode}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        {lang === "ar" ? "لم يتم العثور على نتائج" : "No countries found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD WITH EYE TOGGLE */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-confirm-password" className="text-xs font-semibold uppercase tracking-wider">
                {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>

              <div className="relative">
                <input 
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********" 
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label={lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                  className={`w-full border rounded-xl py-3 ${lang === 'ar' ? 'pr-4 pl-11' : 'pl-4 pr-11'} text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? (lang === 'ar' ? "إخفاء تأكيد كلمة المرور" : "Hide confirm password") : (lang === 'ar' ? "إظهار تأكيد كلمة المرور" : "Show confirm password")}
                  className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors`}
                  title={showConfirmPassword ? "إخفاء" : "إظهار"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {passwordsMatch !== null && (
                <div className="text-[11px] font-semibold mt-0.5">
                  {passwordsMatch ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {lang === "ar" ? "كلمات المرور متطابقة" : "Passwords match"}
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      {lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="col-span-1 md:col-span-2 pt-2 border-t ">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-slate-600 cursor-pointer select-none">
                {dict.register.agree}{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("terms"); setTermsModalOpen(true); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {dict.register.tos}
                </button>{" "}
                {dict.register.and}{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("terms"); setTermsModalOpen(true); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {dict.register.privacy}
                </button>{" "}
                و{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("refund"); setTermsModalOpen(true); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {lang === "ar" ? "سياسة الاسترجاع والضمان" : "Refund Policy"}
                </button>.
              </label>
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA Protection */}
          <div className="col-span-1 md:col-span-2">
            <CloudflareTurnstile 
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("cf-turnstile-client-fallback")}
            />
          </div>

          {/* FAST DIRECT SUBMIT BUTTON */}
          <div className="col-span-1 md:col-span-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-base transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{lang === "ar" ? "جاري إنشاء الحساب فورا..." : "Creating Account..."}</span>
                </>
              ) : (
                <span>{dict.register.createAccount}</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {dict.register.hasAccount} <Link href={`/${lang}/login`} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">{dict.register.signIn}</Link>
        </div>
      </div>

      {/* Terms & Refund Policy Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        lang={lang}
        defaultTab={termsModalTab}
      />
    </div>
  );
}
