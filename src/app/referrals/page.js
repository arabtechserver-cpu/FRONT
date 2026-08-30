"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, Share2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function ReferralsPage() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/customer/referral-info?t=${Date.now()}`, { headers: { Authorization: `Bearer ${localStorage.getItem("customer_token")}` } })
      .then((res) => res.ok ? res.json() : null).then(setData).catch(() => setData(null));
  }, []);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = data?.referral_code && origin ? `${origin}/?ref=${encodeURIComponent(data.referral_code)}` : "";
  const count = Number(data?.referral_count || 0);
  const percent = Math.min(100, Math.round(count / 30 * 100));
  const copy = async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return <div className="referral-page-wrap">
    <div className="glass-panel referral-page-card">
      <Link href="/" className="referral-back">العودة للرئيسية</Link>
      <div className="referral-icon"><Share2 size={30} color="white" /></div>
      <h1>برنامج الإحالة</h1><p>ادعُ أصدقاءك واحصل على مكافأة عند تسجيل 30 مستخدمًا عبر رابطك.</p>
      <div className="referral-progress-box"><span>المستخدمون عبر رابطك</span><strong>{count} <small>/ 30</small></strong><div className="referral-progress-track"><div style={{ width: `${percent}%` }} /></div></div>
      <div className="referral-reward-card"><strong>🎁 الهدية</strong><span>5 USD تضاف إلى محفظتك عند كل 30 إحالة مكتملة.</span><small>{data?.earnedUsd ? `إجمالي الهدايا المضافة إلى المحفظة: ${Number(data.earnedUsd).toFixed(2)} USD` : `متبقي ${data?.referralsUntilReward || 30} إحالة للهدية القادمة`}</small></div>
      <label>رابط الإحالة</label><div className="referral-link-row"><input readOnly value={link || "جاري تحميل الرابط..."} /><button onClick={copy} disabled={!link}>{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
    </div>
  </div>;
}
