"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";

const GOAL = 30;
const PROMPT_INTERVAL = 4 * 60 * 60 * 1000;

export default function ReferralModal({ customerUser, API_BASE_URL, enabled = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const storageKey = useMemo(() => customerUser?.id ? `referral_prompt_last_seen:${customerUser.id}` : "", [customerUser]);

  useEffect(() => {
    if (!enabled || !customerUser || !storageKey) return;
    const lastSeen = Number(localStorage.getItem(storageKey) || 0);
    if (Date.now() - lastSeen >= PROMPT_INTERVAL) setIsOpen(true);
    fetch(`${API_BASE_URL}/api/customer/referral-info?t=${Date.now()}`, { headers: { Authorization: `Bearer ${localStorage.getItem("customer_token")}` } })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) { setReferralCode(data.referral_code || ""); setReferralCount(Number(data.referral_count) || 0); } })
      .catch(() => {});
  }, [API_BASE_URL, customerUser, enabled, storageKey]);

  if (!enabled || !isOpen || !customerUser) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = referralCode ? `${origin}/?ref=${encodeURIComponent(referralCode)}` : "";
  const percent = Math.min(100, Math.round((referralCount / GOAL) * 100));
  const close = () => { localStorage.setItem(storageKey, String(Date.now())); setIsOpen(false); };
  const handleCopy = async () => { if (!referralLink) return; await navigator.clipboard.writeText(referralLink); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  return <div className="referral-modal-overlay" role="dialog" aria-modal="true" aria-label="برنامج الإحالة">
    <div className="glass-panel referral-modal-card">
      <button className="referral-close" onClick={close} aria-label="إغلاق"><X size={20} /></button>
      <div className="referral-icon"><Share2 size={30} color="white" /></div>
      <h2>اربح 5 دولار مجانًا!</h2>
      <p>شارك رابطك مع أصدقائك. عند تسجيل 30 مستخدمًا تحصل على مكافأة 5 دولار.</p>
      <div className="referral-progress-box"><span>عدد المستخدمين الذين استخدموا رابطك</span><strong>{referralCount} <small>/ {GOAL}</small></strong><div className="referral-progress-track"><div style={{ width: `${percent}%` }} /></div></div>
      <label>رابط الإحالة الخاص بك</label>
      <div className="referral-link-row"><input readOnly value={referralLink || "جاري إنشاء الرابط..."} aria-label="رابط الإحالة" /><button onClick={handleCopy} disabled={!referralLink} aria-label="نسخ الرابط">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
    </div>
  </div>;
}
