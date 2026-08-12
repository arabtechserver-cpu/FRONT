"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const LANGUAGES = [
  { code: "ar", label: "Arabic" },
  { code: "en", label: "English" },
  { code: "ru", label: "Russian" },
  { code: "zh-CN", label: "Chinese" },
  { code: "hi", label: "Hindi" }
];

const STORAGE_KEY = "arabtech_user_language";
const GOOGLE_COOKIE = "googtrans";
const GOOGLE_ELEMENT_ID = "google_translate_element";

function getSavedLanguage() {
  if (typeof window === "undefined") return "ar";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  const cookieValue = cookieMatch ? decodeURIComponent(cookieMatch[1]) : "";
  const parts = cookieValue.split("/");
  return parts[2] || "ar";
}

function setTranslateCookie(languageCode) {
  const maxAge = 60 * 60 * 24 * 365;
  const value = languageCode === "ar" ? "" : `/ar/${languageCode}`;
  const host = window.location.hostname;
  const cookieValue = value ? `${GOOGLE_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax` : `${GOOGLE_COOKIE}=; path=/; max-age=0`;

  document.cookie = cookieValue;

  if (host && host.includes(".")) {
    const rootDomain = host.split(".").slice(-2).join(".");
    document.cookie = value
      ? `${GOOGLE_COOKIE}=${value}; path=/; domain=.${rootDomain}; max-age=${maxAge}; SameSite=Lax`
      : `${GOOGLE_COOKIE}=; path=/; domain=.${rootDomain}; max-age=0`;
  }
}

function ensureTranslateContainer() {
  let container = document.getElementById(GOOGLE_ELEMENT_ID);
  if (container) return container;

  container = document.createElement("div");
  container.id = GOOGLE_ELEMENT_ID;
  container.setAttribute("aria-hidden", "true");
  document.body.appendChild(container);
  return container;
}

function waitForTranslateCombo(languageCode) {
  return new Promise((resolve) => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      const combo = document.querySelector(".goog-te-combo");
      attempts += 1;

      if (combo || attempts > 40) {
        window.clearInterval(timer);
        resolve(combo);
      }
    }, 250);
  }).then((combo) => {
    if (!combo || languageCode === "ar") return false;

    combo.value = languageCode;
    combo.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  });
}

function loadGoogleTranslate(languageCode) {
  if (typeof window === "undefined") return Promise.resolve(false);
  ensureTranslateContainer();

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "ar",
        includedLanguages: LANGUAGES.map((lang) => lang.code).join(","),
        autoDisplay: false
      },
      GOOGLE_ELEMENT_ID
    );
  };

  if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit();
    return waitForTranslateCombo(languageCode);
  }

  if (document.querySelector("script[data-google-translate]")) {
    return waitForTranslateCombo(languageCode);
  }

  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.defer = true;
  script.dataset.googleTranslate = "true";
  document.body.appendChild(script);

  return waitForTranslateCombo(languageCode);
}

export default function LanguageSwitcher({ compact = false }) {
  const id = useId();
  const pathname = usePathname();
  const [language, setLanguage] = useState("ar");

  const isAdmin = pathname?.startsWith("/admin");
  const currentLabel = useMemo(
    () => LANGUAGES.find((lang) => lang.code === language)?.label || "Arabic",
    [language]
  );

  useEffect(() => {
    if (isAdmin) return;

    const savedLanguage = getSavedLanguage();
    setLanguage(savedLanguage);
    document.documentElement.lang = savedLanguage === "zh-CN" ? "zh" : savedLanguage;
    document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";

    if (savedLanguage !== "ar") {
      setTranslateCookie(savedLanguage);
      loadGoogleTranslate(savedLanguage);
    }
  }, [isAdmin]);

  if (isAdmin) return null;

  const handleChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setTranslateCookie(nextLanguage);
    document.documentElement.lang = nextLanguage === "zh-CN" ? "zh" : nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";

    if (nextLanguage === "ar") {
      window.location.reload();
      return;
    }

    loadGoogleTranslate(nextLanguage).then((applied) => {
      if (!applied) {
        window.location.reload();
      }
    });
  };

  return (
    <div className={`language-switcher ${compact ? "language-switcher-compact" : ""}`} translate="no">
      <label className="language-switcher-label" htmlFor={`site-language-${id}`}>
        Language
      </label>
      <select
        id={`site-language-${id}`}
        value={language}
        onChange={handleChange}
        aria-label={`Current language: ${currentLabel}`}
        className="language-switcher-select"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
