"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";
import { useI18n } from "@/lib/i18n";
import { formatWalletTransaction } from "@/lib/walletTransactions.mjs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const WalletPayPalButtons = dynamic(() => import("@/components/WalletPayPalButtons"), {
  ssr: false,
  loading: () => <div style={{ height: "42px", opacity: 0.7 }}>Loading PayPal...</div>
});

// Global cache for Wallet Settings to provide instant navigation (Prefetch & Cache)
let globalSettingsCache = null;
let fetchSettingsPromise = null;

function stripInlinePaymentLogos(paymentMethods = []) {
  if (!Array.isArray(paymentMethods)) return [];

  return paymentMethods.map((pm) => {
    if (!pm || typeof pm !== "object") return pm;
    return typeof pm.logo === "string" && pm.logo.startsWith("data:image")
      ? { ...pm, logo: "" }
      : pm;
  });
}

function normalizeWalletSettings(settings) {
  if (!settings) return settings;
  return {
    ...settings,
    payment_methods: stripInlinePaymentLogos(settings.payment_methods),
  };
}

export default function WalletPage() {
  const router = useRouter();
  const { t, meta } = useI18n();
  const [token, setToken] = useState("");
  const [customer, setCustomer] = useState(null);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [globalCurrencies, setGlobalCurrencies] = useState(["USD"]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState({ "EGP": 50, "SDG": 600 });
  const [sdgRate, setSdgRate] = useState(null);
  const [sdgRateInfo, setSdgRateInfo] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [receiptImageFile, setReceiptImageFile] = useState(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState("");
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [pendingWhatsapp, setPendingWhatsapp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [hydrated, setHydrated] = useState(false);
  // ── PayPal states ──
  const [paypalAmount, setPaypalAmount] = useState("");
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalSuccess, setPaypalSuccess] = useState(null);
  const [paypalError, setPaypalError] = useState("");
  const [capturingPaypal, setCapturingPaypal] = useState(false);
  const paymentDetailsRef = useRef(null);

  useEffect(() => {
    if (selectedMethodId && paymentDetailsRef.current) {
      setTimeout(() => {
        paymentDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedMethodId]);

  useEffect(() => {
    setToken(localStorage.getItem("customer_token") || "");
    setTheme(document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark");
    setHydrated(true);
    let cachedSettings = globalSettingsCache;
    if (!cachedSettings) {
      try {
        cachedSettings = JSON.parse(localStorage.getItem("arabtech_cached_settings") || "null");
      } catch {
        cachedSettings = null;
      }
    }

    // Reuse the home-page settings cache so payment methods render immediately.
    if (cachedSettings) {
      cachedSettings = normalizeWalletSettings(cachedSettings);
      globalSettingsCache = cachedSettings;
      setPaymentMethods(cachedSettings.payment_methods || []);
      setWhatsappNumbers(cachedSettings.whatsapp_numbers || []);
      setGlobalCurrencies(cachedSettings.supported_currencies || ["USD"]);
      if (cachedSettings.supported_currencies?.length > 0) setSelectedCurrency(cachedSettings.supported_currencies[0]);
      if (cachedSettings.exchange_rates) setExchangeRates(prev => ({ ...prev, ...cachedSettings.exchange_rates }));
      if (cachedSettings.base_currency) setBaseCurrency(cachedSettings.base_currency);
      setLoadingSettings(false);
    }

    // Start background revalidation or initial fetch
    if (!fetchSettingsPromise) {
      fetchSettingsPromise = fetch(`${API_BASE_URL}/api/settings`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            data = normalizeWalletSettings(data);
            globalSettingsCache = data;
            try { localStorage.setItem("arabtech_cached_settings", JSON.stringify(data)); } catch {}
            if (data.payment_methods) {
              setPaymentMethods(data.payment_methods);
            }
            if (data.whatsapp_numbers && Array.isArray(data.whatsapp_numbers)) {
              setWhatsappNumbers(data.whatsapp_numbers);
            }
            if (data.supported_currencies && Array.isArray(data.supported_currencies)) {
              setGlobalCurrencies(data.supported_currencies);
              if (data.supported_currencies.length > 0 && !cachedSettings) {
                setSelectedCurrency(data.supported_currencies[0]);
              }
            }
            if (data.exchange_rates) {
              setExchangeRates(prev => ({ ...prev, ...data.exchange_rates }));
            }
            if (data.base_currency) {
              setBaseCurrency(data.base_currency);
            }
          }
        })
        .catch(err => console.error("Error loading settings in wallet page:", err))
        .finally(() => {
          setLoadingSettings(false);
          fetchSettingsPromise = null; // Reset promise to allow future refetches if needed
        });
    } else {
       // If a fetch is already in progress, wait for it
       fetchSettingsPromise.finally(() => setLoadingSettings(false));
    }

  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/exchange-rates/sdg`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled || !data?.rate) return;
        setSdgRate(Number(data.rate));
        setSdgRateInfo(data);
        setExchangeRates((previous) => ({ ...previous, SDG: Number(data.rate) }));
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, []);

  // ── Handle PayPal return redirect (capture after PayPal approval) ──────────
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paypalStatus = urlParams.get("paypal");
    const paypalToken = urlParams.get("token"); // PayPal Order ID

    if (paypalStatus === "success" && paypalToken) {
      // Clean URL immediately so refresh won't re-trigger
      window.history.replaceState({}, document.title, "/wallet");

      const savedToken = localStorage.getItem("customer_token");
      if (!savedToken) return;

      setCapturingPaypal(true);

      fetch(`${API_BASE_URL}/api/wallet/paypal/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedToken}`,
        },
        body: JSON.stringify({ orderId: paypalToken }),
      })
        .then((r) => r.json())
        .then((data) => {
          setCapturingPaypal(false);
          if (data.balance !== undefined) {
            setPaypalSuccess(data);
            // Refresh customer balance
            fetch(`${API_BASE_URL}/api/customer/me`, {
              headers: { Authorization: `Bearer ${savedToken}` },
            })
              .then((r) => r.ok ? r.json() : null)
              .then((me) => { if (me) setCustomer(me); });
            // Refresh requests list
            fetch(`${API_BASE_URL}/api/customer/wallet-requests`, {
              headers: { Authorization: `Bearer ${savedToken}` },
            })
              .then((r) => r.ok ? r.json() : null)
              .then((reqs) => { if (reqs) setRequests(reqs); });
          } else {
            setPaypalError(data.message || "فشل تأكيد الدفع من PayPal.");
          }
        })
        .catch(() => {
          setCapturingPaypal(false);
          setPaypalError("تعذر الاتصال بالخادم لتأكيد الدفع.");
        });
    } else if (paypalStatus === "cancel") {
      window.history.replaceState({}, document.title, "/wallet");
      setPaypalError("تم إلغاء عملية الدفع من PayPal.");
    }
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [router, token, hydrated]);

  useEffect(() => {
    if (!token) return;

    const fetchWalletData = async () => {
      setLoading(true);
      setError("");

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [meRes, requestsRes, transactionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customer/me`, { headers }),
          fetch(`${API_BASE_URL}/api/customer/wallet-requests`, { headers }),
          fetch(`${API_BASE_URL}/api/customer/wallet-transactions?limit=100`, { headers })
        ]);
        if (!meRes.ok) throw new Error("فشل تحميل بيانات المحفظة.");
        if (!requestsRes.ok) throw new Error("فشل تحميل الطلبات.");
        const [meData, requestsData, transactionsData] = await Promise.all([meRes.json(), requestsRes.json(), transactionsRes.ok ? transactionsRes.json() : Promise.resolve([])]);
        setCustomer(meData);
        setRequests(requestsData);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      } catch (err) {
        setError(err.message || "تعذر تحميل بيانات المحفظة.");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("يرجى إدخال مبلغ صحيح.");
      return;
    }
    if (!senderPhone.trim()) {
      setError("يرجى إدخال رقم التحويل.");
      return;
    }
    if (!receiptImageFile) {
      setError("يرجى إرفاق صورة وصل التحويل.");
      return;
    }

    setSubmitting(true);

    try {
      // Convert receipt image to base64
      let receiptBase64 = null;
      if (receiptImageFile) {
        receiptBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(receiptImageFile);
        });
      }

      const formattedNotes = notes;

      const response = await fetch(`${API_BASE_URL}/api/customer/wallet-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parsedAmount,
          currency: selectedCurrency,
          sender_phone: senderPhone,
          notes: formattedNotes,
          receipt_image: receiptBase64  // sent to backend for auto WhatsApp delivery
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل إرسال الطلب.");
      }

      const requestId = data.id || data.request_id || "";
      const customerName = customer?.username || "";
      const waText = [
        `💳 طلب شحن رصيد #${requestId}`,
        `👤 الاسم: ${customerName}`,
        `💰 القيمة المطلوبة: $${parsedAmount} USD`,
        `💵 عملة التحويل: ${selectedCurrency}`,
        `📞 رقم التحويل: ${senderPhone}`,
        notes ? `📝 ملاحظات: ${notes}` : "",
        `\nالرجاء مراجعة وصل التحويل المرفق والتأكد من اعتماده.`
      ].filter(Boolean).join("\n");

      setPendingWhatsapp({ text: waText, requestId, autoSent: data.wa_sent === true });
      setWhatsappSent(false);
      setMessage("");
      setAmount("");
      setSenderPhone("");
      setNotes("");
      setReceiptImageFile(null);
      setReceiptImagePreview("");

      const [meRes, reqRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customer/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customer/wallet-requests`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (meRes.ok) setCustomer(await meRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (err) {
      setError(err.message || "تعذر إرسال طلب الشحن.");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsapp = (number) => {
    const encoded = encodeURIComponent(pendingWhatsapp?.text || "");
    const clean = number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${clean}?text=${encoded}`, "_blank");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    router.push("/login");
  };

  // ── PayPal JS SDK Handlers ──
  const createPaypalOrder = async () => {
    setPaypalError("");
    return fetch(`${API_BASE_URL}/api/wallet/paypal/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: paypalAmount }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orderId) {
          return data.orderId;
        } else {
          setPaypalError(data.message || "لم يتم إنشاء الطلب.");
          return null;
        }
      })
      .catch((err) => {
        setPaypalError("تعذر الاتصال بالخادم لإنشاء الطلب.");
        return null;
      });
  };

  const onPaypalApprove = async (data, actions) => {
    setCapturingPaypal(true);
    return fetch(`${API_BASE_URL}/api/wallet/paypal/capture-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId: data.orderID }),
    })
      .then((r) => r.json())
      .then((resData) => {
        setCapturingPaypal(false);
        if (resData.balance !== undefined) {
          setPaypalSuccess(resData);
          setPaypalAmount("");
          
          fetch(`${API_BASE_URL}/api/customer/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((me) => { if (me) setCustomer(me); });
            
          fetch(`${API_BASE_URL}/api/customer/wallet-requests`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((reqs) => { if (reqs) setRequests(reqs); });
        } else {
          setPaypalError(resData.message || "فشل تأكيد الدفع من PayPal.");
        }
      })
      .catch(() => {
        setCapturingPaypal(false);
        setPaypalError("تعذر الاتصال بالخادم لتأكيد الدفع.");
      });
  };

  if (!hydrated) {
    return <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>جاري تحميل المحفظة...</div>;
  }

  return (
    <div className="wallet-layout-wrapper" dir={meta.dir} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* PayPal Modals stay the same */}

      {/* ── PayPal Capturing Overlay ── */}
      {capturingPaypal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
          <div style={{ fontSize: "4.5rem", animation: "pulse 1.5s ease-in-out infinite" }}>⏳</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-main)" }}>جاري تأكيد دفعك وشحن الرصيد...</div>
          <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>يرجى الانتظار، هذا يستغرق ثوان فقط...</div>
        </div>
      )}

      {/* ── PayPal Success Modal ── */}
      {paypalSuccess && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--bg-card)", border: "1.5px solid rgba(34,197,94,0.4)", borderRadius: "28px", padding: "36px", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: "5rem", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#22c55e", marginBottom: "16px" }}>تم الدفع بنجاح!</h3>
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "16px", padding: "22px", marginBottom: "20px" }}>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#22c55e" }}>$ {Number(paypalSuccess.amount).toFixed(2)}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "8px" }}>تم إضافتها لمحفظتك تلقائياً ✅</div>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "24px" }}>
              رصيدك الحالي: <strong style={{ color: "#22c55e", fontSize: "1.1rem" }}>$ {Number(paypalSuccess.balance).toFixed(2)} USD</strong>
            </div>
            <button
              onClick={() => setPaypalSuccess(null)}
              style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "14px", color: "var(--text-main)", fontSize: "1.05rem", fontWeight: 900, cursor: "pointer", transition: "transform 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              رائع! إغلاق ✨
            </button>
          </div>
        </div>
      )}

      {/* ── PayPal Error Toast ── */}
      {paypalError && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.45)", borderRadius: "14px", padding: "14px 24px", color: "#ef4444", fontWeight: 700, zIndex: 9998, display: "flex", alignItems: "center", gap: "10px", backdropFilter: "blur(10px)", boxShadow: "0 10px 30px var(--bg-secondary)" }}>
          <span>⚠️</span>
          <span>{paypalError}</span>
          <button onClick={() => setPaypalError("")} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.3rem", marginRight: "8px", lineHeight: 1 }}>✕</button>
        </div>
      )}

      
      {/* ── Wallet Balance Top Card ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>محفظتي</span>
          <span style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>👛</span>
        </h2>
        {sdgRate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-glass-deep)', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', boxShadow: 'var(--shadow-glass)' }}>
            <span style={{ color: 'var(--primary-color)' }}>💱 سعر الصرف:</span>
            <span>1 دولار = {sdgRate} جنيه سوداني</span>
          </div>
        )}
      </div>

      <section className="glass-panel" style={{ 
        padding: '30px 40px', 
        borderRadius: '24px', 
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-glass-deep)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 10px 40px var(--bg-secondary)',
        minHeight: '260px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '70%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(22, 119, 238, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        {/* Right side (Text & Button in RTL) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '15px', position: 'relative', zIndex: 2, flex: 1, minWidth: '300px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1.15rem', fontWeight: 'bold' }}>رصيد المحفظة</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px', lineHeight: 1 }}>
              {Number(customer?.balance || 0).toFixed(2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '4px' }}>
                {baseCurrency || 'SAR'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', border: '2px solid var(--border-color)', marginLeft: '10px' }}>
              <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', opacity: 0.5 }}>✓</span>
            </div>
          </div>

          <button 
            onClick={() => {
              const rechargeSection = document.getElementById('recharge-section');
              if (rechargeSection) rechargeSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="glass-btn glass-btn-primary" 
            style={{ marginTop: '10px', padding: '16px 40px', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', width: 'clamp(200px, 100%, 280px)', justifyContent: 'center', boxShadow: '0 8px 25px rgba(22,119,238,0.3)' }}
          >
            <span>شحن الرصيد</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '300' }}>+</span>
          </button>
        </div>

        {/* Left side (3D Graphic in RTL) */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', paddingRight: '20px' }}>
          <div style={{ width: 'clamp(150px, 30vw, 280px)', height: 'clamp(150px, 30vw, 280px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(6rem, 15vw, 10rem)', filter: 'drop-shadow(0 20px 30px rgba(22,119,238,0.25))' }}>
             💳
          </div>
        </div>
      </section>

      
      <div id="recharge-section" style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        
        {/* RIGHT COLUMN (Arabic Right): Security Features (Now First in RTL) */}
        <section className="glass-panel" style={{ flex: "1 1 300px", padding: "40px 30px", borderRadius: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", height: "fit-content" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "30px" }}>أمان محفظتك</h3>
          
          <div style={{ width: "160px", height: "160px", background: "linear-gradient(145deg, rgba(14,165,233,.18), rgba(99,102,241,.12))", borderRadius: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", marginBottom: "30px", border: "1px solid rgba(56, 189, 248, 0.25)", filter: "drop-shadow(0 15px 25px rgba(56,189,248,0.2))" }}>
            {/* Fallback if no image */}
            <span style={{opacity: 0.8}}>🛡️</span>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "25px", width: "100%", textAlign: "right" }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
              <div style={{ color: "var(--brand-blue)", fontSize: "1.8rem" }}>🛡️</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>تشفير وحماية متقدمة</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>تحافظ على أمان بياناتك ورصيدك</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
              <div style={{ color: "var(--brand-blue)", fontSize: "1.8rem" }}>🔒</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>معاملات آمنة</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>جميع العمليات محمية ومشفرة</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
              <div style={{ color: "var(--brand-blue)", fontSize: "1.8rem" }}>👥</div>
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", fontWeight: 800 }}>خصوصية تامة</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>نحن لا نشارك بياناتك مع أي جهة</p>
              </div>
            </div>
          </div>
        </section>

        {/* LEFT COLUMN (Arabic Left): Recharge Wallet (Now Second in RTL) */}
        <section className="glass-panel" style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "25px", padding: "40px", borderRadius: "24px" }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontWeight: 900, fontSize: "1.5rem", margin: 0 }}>شحن الرصيد (يدوي)</h2>
            <span style={{ fontSize: "1.8rem", color: "var(--primary-color)" }}>💳</span>
          </div>

          {/* Wizard UI */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 30px", position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", right: "10%", left: "10%", height: "2px", background: "var(--border-color)", zIndex: 0 }}></div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1rem", boxShadow: "0 4px 10px rgba(22,119,238,0.4)" }}>1</div>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>إنشاء طلب</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>تم إنشاء الطلب</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-glass)", border: "1px solid var(--text-muted)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1rem" }}>2</div>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "var(--text-muted)" }}>قيد المراجعة</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>جار التحقق من الإيصال</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-glass)", border: "1px solid var(--text-muted)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1rem" }}>3</div>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem", color: "var(--text-muted)" }}>تم الشحن</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>تمت إضافة الرصيد</div>
            </div>
          </div>

          <div style={{ background: "var(--bg-secondary)", borderRadius: "20px", padding: "30px", border: "1px solid var(--border-glass)", display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", margin: "0 0 5px 0" }}>رفع الإيصال</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>قم برفع صورة الإيصال بعد التحويل البنكي</p>
            </div>

            {loadingSettings ? (
              <div style={{ textAlign: "center", padding: "20px" }}>جاري تحميل طرق الدفع...</div>
            ) : (() => {
              const allMethods = paymentMethods;
              if (allMethods.length === 0) {
                return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px" }}>لا توجد خدمات شحن متاحة حالياً.</div>;
              }
              return (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {allMethods.map(pm => (
                      <div key={pm.id} onClick={() => setSelectedMethodId(pm.id)} style={{ padding: "10px 15px", borderRadius: "10px", border: selectedMethodId === pm.id ? "1px solid var(--primary-color)" : "1px solid var(--border-color)", background: selectedMethodId === pm.id ? "rgba(22,119,238,0.1)" : "var(--bg-glass)", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", color: selectedMethodId === pm.id ? "var(--primary-color)" : "var(--text-muted)" }}>
                        {pm.name}
                      </div>
                    ))}
                  </div>

                  {selectedMethodId && (() => {
                    const pm = allMethods.find(m => m.id === selectedMethodId);
                    if (!pm) return null;
                    const isPaypal = pm.isDirectPaypal || pm.name.toLowerCase().includes("paypal") || pm.name.includes("باي بال");

                    if (isPaypal) {
                      return (
                        <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--primary-color)", marginTop: "20px", marginBottom: "20px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                              <div style={{ background: "linear-gradient(135deg, #003087, #009cde)", borderRadius: "12px", padding: "10px 18px", fontWeight: 900, color: "white", fontSize: "1rem", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "1.3rem" }}>🅿️</span> PayPal
                              </div>
                              <div>
                                <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--text-main)" }}>الدفع المباشر بـ PayPal</div>
                                <div style={{ color: "#60a5fa", fontSize: "0.83rem", marginTop: "2px" }}>دفع في نفس الصفحة (In-Context) • فوري</div>
                              </div>
                            </div>
                            <div>
                              <input
                                id="paypal-amount-input"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="أدخل المبلغ بالدولار USD (مثال: 10)"
                                value={paypalAmount}
                                onChange={(e) => setPaypalAmount(e.target.value)}
                                style={{
                                  width: "100%", padding: "15px 18px", fontSize: "1.1rem", borderRadius: "14px",
                                  background: "var(--bg-color)", border: "2px solid rgba(255,255,255,0.15)",
                                  color: "var(--text-main)", outline: "none", boxSizing: "border-box",
                                  transition: "border-color 0.2s", marginBottom: "16px"
                                }}
                              />
                            </div>
                            {paypalAmount && Number(paypalAmount) >= 1 ? (
                              <div style={{ background: "#fff", borderRadius: "8px", padding: "10px 10px 0 10px" }}>
                                <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "BAA8Rt-IgLlxgkq8MZ8oiOOqDhFqy92HBS9sxJzeYASwt8YU9Lz7GXrMAiACDFotqS5LlCxBsRISofo6n8", currency: "USD" }}>
                                  <PayPalButtons 
                                    forceReRender={[paypalAmount]}
                                    style={{ layout: "vertical", shape: "rect", color: "gold", label: "paypal" }}
                                    createOrder={createPaypalOrder}
                                    onApprove={onPaypalApprove}
                                    onError={(err) => setPaypalError("تعذر إكمال عملية الدفع عبر PayPal.")}
                                  />
                                </PayPalScriptProvider>
                              </div>
                            ) : (
                              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>يرجى إدخال مبلغ 1 دولار أو أكثر لإظهار أزرار الدفع.</div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div style={{ marginTop: "20px", marginBottom: "20px", padding: "24px", background: "var(--bg-glass)", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                        <div style={{ marginBottom: "24px" }}>
                          <p style={{ color: "var(--text-main)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "16px", background: "rgba(139, 92, 246, 0.1)", padding: "16px", borderRadius: "10px", borderRight: "4px solid var(--primary-color)" }}>
                            {pm.description}
                          </p>
                          
                          {pm.image && (
                            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                              <div style={{ fontWeight: 800, marginBottom: "10px", color: "var(--text-muted)" }}>باركود (QR Code) الدفع:</div>
                              <img src={pm.image.startsWith("data:image") ? pm.image : `${API_BASE_URL}${pm.image}`} alt="QR Code / Barcode" style={{ maxWidth: "200px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "white", padding: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} />
                            </div>
                          )}
                          
                          <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, marginBottom: "6px", color: "var(--text-muted)" }}>رقم أو عنوان التحويل:</div>
                              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-main)", direction: "ltr", userSelect: "all", wordBreak: "break-all" }}>{pm.value}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(pm.value);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              style={{ background: copied ? "#10b981" : "#3b82f6", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "1rem", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              {copied ? "تم النسخ ✓" : "نسخ العنوان 📋"}
                            </button>
                          </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px", marginTop: "24px" }}>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "16px", color: "var(--text-main)" }}>تأكيد عملية الدفع وإرسال الوصل</h3>

                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    <div className="form-group" style={{ flex: "1 1 200px", marginBottom: 0 }}>
                      <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)} style={{ width: "100%", padding: "14px", background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "var(--text-main)", outline: "none" }}>
                        {globalCurrencies.map((curr) => <option key={curr} value={curr}>{curr}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: "2 1 300px", marginBottom: 0 }}>
                      <input type="number" min="0.01" step="0.01" placeholder="المبلغ المطلوب شحنه (USD)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: "100%", padding: "14px", background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "var(--text-main)", outline: "none" }} />
                      
                      
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input type="text" placeholder="رقم الهاتف / اسم المحساب المحول منه" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} required style={{ width: "100%", padding: "14px", background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "var(--text-main)", outline: "none" }} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ border: "2px dashed var(--primary-color)", borderRadius: "20px", padding: "40px 20px", textAlign: "center", background: "rgba(22,119,238,0.03)", cursor: "pointer", transition: "background 0.2s" }} onClick={() => document.getElementById("receipt-upload-input").click()}>
                      <input id="receipt-upload-input" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) { setReceiptImageFile(file); const reader = new FileReader(); reader.onload = (ev) => setReceiptImagePreview(ev.target.result); reader.readAsDataURL(file); } }} />
                      {receiptImagePreview ? (
                        <div>
                          <img src={receiptImagePreview} alt="وصل التحويل" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "10px", objectFit: "contain", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} />
                          <div style={{ fontSize: "1rem", color: "#10b981", marginTop: "12px", fontWeight: "bold" }}>✓ تم الإرفاق</div>
                        </div>
                      ) : (
                        <div style={{ color: "var(--primary-color)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "2rem" }}>📤</span>
                          <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>اضغط هنا لرفع الإيصال</span>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>أو اسحب وأفلت الصورة هنا</span>
                          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                             <span style={{ fontSize: "0.75rem", background: "var(--bg-color)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>JPG, PNG</span>
                             <span style={{ fontSize: "0.75rem", background: "var(--bg-color)", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>الحد الأقصى 5MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px" }}>
                    <span style={{ fontSize: "1.1rem" }}>ℹ️</span>
                    <span>سيتم إشعارك عند مراجعة الإيصال وإضافة الرصيد إلى محفظتك.</span>
                  </div>

                  {error && <div style={{ color: "var(--danger-color)", fontSize: "0.9rem", fontWeight: "bold", textAlign: "center" }}>⚠️ {error}</div>}

                  <button type="submit" disabled={submitting} className="glass-btn glass-btn-primary" style={{ padding: "16px", borderRadius: "14px", fontSize: "1.1rem", fontWeight: "bold", marginTop: "10px", width: "100%" }}>
                    {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
                  </button>
                        </div>
                      </div>
                    );
                  })()}
                </form>
              );
            })()}
          </div>
        </section>
      </div> {/* END OF recharge-section */}

      {/* ── Transaction History (سجل المعاملات) ── */}
      <div style={{ marginTop: "30px", marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>سجل المعاملات</span>
        </h2>
        
        <div className="glass-panel" style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid var(--border-glass)", background: "var(--bg-glass-deep)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--bg-hover)", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>التاريخ</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>النوع</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>الوصف</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>المبلغ</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", fontSize: "0.9rem" }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)" }}>لا توجد معاملات مسجلة حتى الآن.</td></tr>
                ) : transactions.map((transaction) => {
                  const row = formatWalletTransaction(transaction);
                  const typeLabel = row.isCredit ? "شحن رصيد" : "استخدام";
                  return <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--bg-hover)"} onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "16px 20px", fontSize: "0.95rem" }}>{row.created_at ? new Date(row.created_at).toLocaleString("ar-EG") : "-"}</td>
                    <td style={{ padding: "16px 20px", fontSize: "0.95rem" }}>{typeLabel}</td>
                    <td style={{ padding: "16px 20px", fontSize: "0.95rem", color: "var(--text-muted)" }}>{row.description || "-"}</td>
                    <td style={{ padding: "16px 20px", fontSize: "0.95rem", fontWeight: "bold", color: row.isCredit ? "#10b981" : "var(--text-main)", direction: "ltr", textAlign: "right" }}>{row.signedAmount} {baseCurrency}</td>
                    <td style={{ padding: "16px 20px" }}><span style={{ background: row.isCredit ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)", color: row.isCredit ? "#10b981" : "var(--primary-color)", padding: "4px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "bold" }}>{row.statusLabel}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          {transactions.length >= 100 && <div style={{ textAlign: "center", padding: "15px", borderTop: "1px solid var(--border-color)", background: "var(--bg-color)", color: "var(--text-muted)", fontSize: "0.85rem" }}>يتم عرض أحدث 100 معاملة.</div>}
        </div>
      </div>


      {/* WhatsApp Modal */}
      {pendingWhatsapp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "24px", padding: "24px", maxWidth: "420px", width: "100%", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 50px var(--bg-secondary)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem" }}>{pendingWhatsapp.autoSent ? "🤖" : "✅"}</div>
              <h3 style={{ fontWeight: 900, marginTop: "10px", fontSize: "1.3rem" }}>تم تسجيل طلبك بنجاح!</h3>
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>رقم الطلب: <strong style={{ color: "var(--primary-color)" }}>#{pendingWhatsapp.requestId}</strong></div>
            </div>

            {pendingWhatsapp.autoSent ? (
              <div style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", borderRadius: "16px", padding: "18px", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>💬✓</div>
                <div style={{ color: "#34d399", fontWeight: "bold", fontSize: "1rem" }}>تم إرسال الطلب وصورة الوصل تلقائياً للأدمن عبر واتساب!</div>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "8px" }}>لا تحتاج لفعل أي شيء — انتظر تأكيد الأدمن</div>
              </div>
            ) : (
              <>
                <div style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: "12px", padding: "12px", fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "var(--text-main)", direction: "rtl", maxHeight: "150px", overflowY: "auto" }}>
                  {pendingWhatsapp.text}
                </div>
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "12px", fontSize: "0.85rem", color: "#fbbf24", textAlign: "center" }}>
                  📎 <strong>يرجى إرسال الوصل يدوياً عبر الواتساب لاكتمال الطلب</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {whatsappNumbers.length > 0 ? whatsappNumbers.map((num, i) => (
                    <button key={i} onClick={() => { openWhatsapp(num); setWhatsappSent(true); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px", background: "linear-gradient(135deg, #25d366, #128c7e)", border: "none", borderRadius: "14px", color: "var(--text-main)", fontWeight: 900, fontSize: "1rem", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e)=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}>
                      <span style={{ fontSize: "1.3rem" }}>💬</span> إرسال الوصل عبر واتساب {whatsappNumbers.length > 1 ? `(${i + 1})` : ""}
                    </button>
                  )) : (
                    <div style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.9rem" }}>⚠️ رقم الواتساب غير متوفر</div>
                  )}
                </div>
                {whatsappSent && <div style={{ color: "#10b981", fontWeight: "bold", textAlign: "center", fontSize: "0.85rem" }}>✓ تم فتح واتساب — لا تنسَ إرفاق صورة الوصل</div>}
              </>
            )}
            <button onClick={() => setPendingWhatsapp(null)} style={{ padding: "12px", background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "14px", color: "var(--text-main)", cursor: "pointer", fontWeight: "bold", fontSize: "1rem", marginTop: "4px" }} onMouseEnter={(e)=>e.currentTarget.style.background="var(--border-color)"} onMouseLeave={(e)=>e.currentTarget.style.background="var(--bg-glass)"}>
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Order History */}
      <section className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", borderRadius: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "16px" }}>
          <div>
            <h3 style={{ fontWeight: 900, marginBottom: "4px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.4rem" }}>📜</span> سجل طلبات الشحن
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>تابع حالة طلبات شحن رصيدك هنا.</p>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "8px 16px", borderRadius: "12px", color: "#10b981", fontWeight: 800 }}>
            {requests.length} طلب
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "var(--bg-glass)", borderRadius: "16px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🏜️</div>
            لا توجد طلبات شحن رصيد بعد.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {requests.map((request) => (
              <div key={request.id} style={{ padding: "18px", borderRadius: "16px", background: "var(--bg-glass)", border: "1px solid var(--bg-glass)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.1rem" }}>
                    طلب #{request.id}
                    {request.notes && request.notes.includes("paypal_order") && (
                      <span style={{ marginRight: "8px", background: "rgba(0,112,186,0.15)", border: "1px solid rgba(0,112,186,0.3)", borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", color: "#60a5fa", fontWeight: 700 }}>PayPal</span>
                    )}
                  </strong>
                  <span className={`badge badge-${request.status}`} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem" }}>
                    {request.status === "pending" && "قيد الانتظار ⏳"}
                    {request.status === "approved" && "تم الاعتماد ✅"}
                    {request.status === "rejected" && "مرفوض ❌"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  <div>المبلغ: <strong style={{ color: "var(--text-main)" }}>$ {Number(request.amount).toFixed(2)} USD</strong></div>
                  <div>العملة: <strong style={{ color: "var(--text-main)" }}>{request.currency || "USD"}</strong></div>
                  <div>من رقم: <strong style={{ color: "var(--text-main)" }}>{request.sender_phone || "-"}</strong></div>
                  <div>بتاريخ: <strong style={{ color: "var(--text-main)" }}>{new Date(request.created_at).toLocaleString("ar-EG")}</strong></div>
                  {request.notes && !request.notes.includes("paypal_order") && (
                    <div style={{ gridColumn: "span 2", background: "var(--bg-secondary)", padding: "10px", borderRadius: "8px", marginTop: "4px" }}>
                      الملاحظات: <strong style={{ color: "var(--text-main)" }}>{request.notes.replace(/^\[تم تحويل:[^\]]+\]\s*/, "")}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <div style={{ textAlign: "center", marginBottom: "40px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        🔒 شحنك للمحفظة يخضع لـ <Link href="/terms#refund-policy" style={{ color: "var(--primary-color)", fontWeight: "bold", textDecoration: "underline" }}>شروط الاستخدام وسياسة الاسترجاع</Link>
      </div>
    </div>
  );
}



