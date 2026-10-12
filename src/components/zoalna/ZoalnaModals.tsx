"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ZoalnaModalsProps {
  lang: string;
  appModal?: {
    enabled?: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    downloadUrl?: string;
  };
  appModalOpen: boolean;
  onCloseAppModal: () => void;
  authModalOpen: boolean;
  onCloseAuthModal: () => void;
  authTab: "login" | "register";
  onChangeAuthTab: (tab: "login" | "register") => void;
}

export default function ZoalnaModals({
  lang,
  appModal,
  appModalOpen,
  onCloseAppModal,
  authModalOpen,
  onCloseAuthModal,
  authTab,
  onChangeAuthTab,
}: ZoalnaModalsProps) {
  const isAr = lang === "ar";
  const router = useRouter();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${lang}/login`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${lang}/register`);
  };

  return (
    <>
      {/* App Promotion Modal */}
      {appModal?.enabled !== false && (
        <div className={`zoalna-modal-overlay ${appModalOpen ? "active" : ""}`}>
          <div className="zoalna-modal-card">
            <button className="zoalna-close-x" onClick={onCloseAppModal} aria-label={isAr ? "إغلاق" : "Close"}>
              ×
            </button>

            <div className="zoalna-modal-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>

            <h3>{isAr ? (appModal?.title || "جرّب تطبيق BORAI STORE الجديد!") : "Try the New BORAI STORE App!"}</h3>
            <p>
              {isAr
                ? (appModal?.description || "تم إطلاق التحديث الجديد لتجربة شحن أسرع، متابعة لحظية لطلباتك، وإشعارات مباشرة بمحفظتك.")
                : "Experience faster top-ups, instant order tracking, and real-time wallet notifications with our official mobile app."}
            </p>

            <a
              href={appModal?.downloadUrl || "#"}
              className="zoalna-modal-btn-download"
              onClick={onCloseAppModal}
              target={appModal?.downloadUrl && appModal.downloadUrl.startsWith("http") ? "_blank" : undefined}
              rel={appModal?.downloadUrl && appModal.downloadUrl.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {isAr ? (appModal?.buttonText || "تنزيل التطبيق الآن") : "Download App Now"}
            </a>

            <button className="zoalna-modal-btn-skip" onClick={onCloseAppModal}>
              {isAr ? "المتابعة عبر المتصفح" : "Continue in Browser"}
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <div className={`zoalna-auth-overlay ${authModalOpen ? "active" : ""}`}>
        <div className="zoalna-auth-card">
          <button className="zoalna-close-x" onClick={onCloseAuthModal} aria-label={isAr ? "إغلاق" : "Close"}>
            ×
          </button>

          <div className="zoalna-auth-tabs">
            <button
              className={`zoalna-auth-tab ${authTab === "login" ? "active" : ""}`}
              onClick={() => onChangeAuthTab("login")}
            >
              {isAr ? "دخول" : "Sign In"}
            </button>
            <button
              className={`zoalna-auth-tab ${authTab === "register" ? "active" : ""}`}
              onClick={() => onChangeAuthTab("register")}
            >
              {isAr ? "تسجيل جديد" : "Register"}
            </button>
          </div>

          <a
            href={`/${lang}/login`}
            className="google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isAr ? "تسجيل الدخول بواسطة Google" : "Sign in with Google"}</span>
          </a>

          <div className="or-divider">
            <span>{isAr ? "أو" : "or"}</span>
          </div>

          {authTab === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "اسم المستخدم / البريد الإلكتروني" : "Email or Username"}</label>
                <input
                  type="text"
                  required
                  className="zoalna-input"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "كلمة السر" : "Password"}</label>
                <input
                  type="password"
                  required
                  className="zoalna-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "12.5px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--z-g500)" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{isAr ? "تذكرني" : "Remember me"}</span>
                </label>
                <Link href={`/${lang}/login`} style={{ color: "var(--user-link, #2563eb)", textDecoration: "none" }}>
                  {isAr ? "هل نسيت كلمة السر؟" : "Forgot Password?"}
                </Link>
              </div>

              <button type="submit" className="zoalna-submit-btn">
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "البريد الإلكتروني" : "Email Address"}</label>
                <input
                  type="email"
                  required
                  className="zoalna-input"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "الاسم بالكامل" : "Full Name"}</label>
                <input
                  type="text"
                  required
                  className="zoalna-input"
                  placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "كلمة المرور" : "Password"}</label>
                <input
                  type="password"
                  required
                  className="zoalna-input"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="zoalna-input-group">
                <label className="zoalna-input-label">{isAr ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                <input
                  type="password"
                  required
                  className="zoalna-input"
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "12px", color: "var(--z-g700)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <span>{isAr ? "أوافق على الشروط والأحكام الخاصة بالموقع" : "I accept the Terms and Privacy Policy"}</span>
              </label>

              <button type="submit" className="zoalna-submit-btn">
                {isAr ? "إنشاء حساب جديد" : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
