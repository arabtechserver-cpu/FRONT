"use client";

import { useId } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function LanguageSwitcher({ compact = false }) {
  const id = useId();
  const pathname = usePathname();
  const { language, languages, setLanguage, t } = useI18n();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className={`language-switcher ${compact ? "language-switcher-compact" : ""}`} data-i18n-skip>
      <label className="language-switcher-label" htmlFor={`site-language-${id}`}>
        {t("language")}
      </label>
      <select
        id={`site-language-${id}`}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t("language")}
        className="language-switcher-select"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
