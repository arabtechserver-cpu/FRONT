"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const QUICK_PROMPTS = [
  { label: "🔄 طلب استرجاع رصيد لطلب معلق", text: "أريد طلب استرجاع رصيد لطلبي المعلق الذي لم يكتمل." },
  { label: "⏳ تأخر في تنفيذ طلبي", text: "طلبي تأخر عن المدة المحددة وأريد متابعة حالته أو تسريعه." },
  { label: "🔑 كود التفعيل المستلم لا يعمل", text: "استلمت كود التفعيل لكنه لم يعمل معي، أحتاج مساعدة فورية." },
  { label: "💳 استفسار حول شحن المحفظة", text: "قمت بتحويل مبلغ لشحن المحفظة ولم ينزل الرصيد بعد." },
  { label: "🛠️ استفسار فني عام", text: "لدي مشكلة فنية وأحتاج التحدث مع الدعم الفني." }
];

export default function NewTicketPage() {
  const { t, language } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'form'
  
  // Auth & User Profile State
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });

  // AI Chat State
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "مرحباً بك في مركز الدعم الفني الذكي لمنصة Arab Tech Server! 🤖\n\nأنا المساعد الذكي المباشر المربوط بإدارة السيرفر. أخبرني بمشكلتك أو رقم طلبك، وسأقوم بفحصها فوراً وإرسال الشكوى والتذكرة مباشرة إلى فريق الإدارة على تيليجرام لمتابعتها معك!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastCreatedTicket, setLastCreatedTicket] = useState(null);
  const messagesEndRef = useRef(null);

  // Form Mode State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    order_id: "",
    category: "استرجاع رصيد",
    urgency: "متوسطة",
    subject: "",
    details: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("customer_token") || "";
      setToken(savedToken);

      // Try reading user info from storage or token
      try {
        const storedUser = localStorage.getItem("customer_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserData({
            name: parsed.username || parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || ""
          });
          setFormData(prev => ({
            ...prev,
            name: parsed.username || parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || ""
          }));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiLoading, activeTab]);

  // Send message to AI Support Chat
  const handleSendChatMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isAiLoading) return;

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInputMessage("");
    setIsAiLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.arab-tech1.online";
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          guest_name: userData.name || formData.name,
          guest_email: userData.email || formData.email,
          guest_phone: userData.phone || formData.phone
        })
      });

      const data = await res.json().catch(() => ({}));

      if (data && data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

        // Extract ticket number if created
        const match = data.reply.match(/#(\d{3,8})/);
        if (match) {
          setLastCreatedTicket({
            id: match[1],
            text: `تم إرسال تذكرتك #${match[1]} بنجاح إلى تيليجرام الإدارة 🚀`
          });
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "تم استلام رسالتك. إذا كانت لديك مشكلة مستعجلة، يمكنك أيضاً مراسلتنا مباشرة على واتساب أو تيليجرام."
          }
        ]);
      }
    } catch (err) {
      console.error("AI Ticket Chat Error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "تعذر الاتصال بالمساعد الذكي مؤقتاً. تم حفظ رسالتك، ويمكنك التواصل مباشرة مع الدعم عبر تيليجرام: https://t.me/arabtechserveronline"
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit direct ticket form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(null);

    if (!formData.subject.trim() || !formData.details.trim()) {
      setFormError("يرجى كتابة عنوان التذكرة وتفاصيل المشكلة بالكامل.");
      return;
    }

    setFormSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.arab-tech1.online";
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}/api/ai/tickets`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.ticket_id)) {
        setFormSuccess({
          ticket_id: data.ticket_id || `#${data.complaint_id}`,
          message: data.message || "تم فتح التذكرة وإرسالها للإدارة على تيليجرام بنجاح!"
        });
        setLastCreatedTicket({
          id: data.complaint_id || data.ticket_id,
          text: `تم إرسال التذكرة ${data.ticket_id || `#${data.complaint_id}`} إلى تيليجرام الإدارة!`
        });
        setFormData(prev => ({ ...prev, subject: "", details: "", order_id: "" }));
      } else {
        setFormError(data.message || "حدث خطأ أثناء إرسال التذكرة، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("Ticket form error:", err);
      setFormError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً أو مراسلتنا على تيليجرام.");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--brand-cyan)", fontSize: "1.2rem", fontWeight: "bold" }}>
          جاري تحميل مركز الدعم الفني الذكي...
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-page-container" style={{ maxWidth: "1150px", margin: "0 auto", padding: "20px 15px 60px" }}>
      
      {/* ── Top Header ── */}
      <div style={{ textAlign: "center", marginBottom: "35px", marginTop: "10px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)",
          padding: "8px 18px", borderRadius: "999px", color: "#38bdf8", fontSize: "0.9rem",
          fontWeight: "bold", marginBottom: "15px"
        }}>
          <span>🤖</span>
          <span>Ared AI Smart Support & Telegram Alerts</span>
        </div>

        <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--text-main)", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          تذاكر الدعم الفني الذكي والشكاوى
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: "1.6" }}>
          تحدث مباشرة مع المساعد الذكي لمتابعة طلبك أو حل مشكلتك، وسيتم تسجيل الشكوى وإرسالها فوراً إلى إدارة السيرفر عبر تيليجرام للمتابعة السريعة.
        </p>
      </div>

      {/* ── Active Ticket Badge (If created) ── */}
      {lastCreatedTicket && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "18px",
          padding: "16px 22px",
          marginBottom: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
          animation: "fadeIn 0.4s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.8rem" }}>✅</span>
            <div>
              <div style={{ color: "#34d399", fontWeight: "900", fontSize: "1.1rem" }}>
                {lastCreatedTicket.text}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                تم استلام الإشعار عبر قناة تيليجرام الإدارة وجاري المراجعة.
              </div>
            </div>
          </div>
          <a
            href="https://t.me/arabtechserveronline"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#0284c7", color: "#fff", padding: "8px 16px", borderRadius: "10px",
              textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem", display: "inline-flex",
              alignItems: "center", gap: "6px"
            }}
          >
            <span>📱 قناة تيليجرام</span>
          </a>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "30px" }}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "12px 26px",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            border: activeTab === "chat" ? "2px solid #00b4d8" : "1px solid var(--border-glass, rgba(255,255,255,0.1))",
            background: activeTab === "chat" ? "linear-gradient(135deg, rgba(0, 180, 216, 0.25), rgba(37, 99, 235, 0.25))" : "var(--bg-glass, rgba(255,255,255,0.03))",
            color: activeTab === "chat" ? "#38bdf8" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <span>💬</span>
          <span>المحادثة الذكية الفورية (AI Support)</span>
        </button>

        <button
          onClick={() => setActiveTab("form")}
          style={{
            padding: "12px 26px",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            border: activeTab === "form" ? "2px solid #00b4d8" : "1px solid var(--border-glass, rgba(255,255,255,0.1))",
            background: activeTab === "form" ? "linear-gradient(135deg, rgba(0, 180, 216, 0.25), rgba(37, 99, 235, 0.25))" : "var(--bg-glass, rgba(255,255,255,0.03))",
            color: activeTab === "form" ? "#38bdf8" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <span>📝</span>
          <span>النموذج السريع للتذاكر (Direct Form)</span>
        </button>
      </div>

      {/* ── TAB 1: AI LIVE SUPPORT CHAT ── */}
      {activeTab === "chat" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "25px" }} className="ticket-chat-layout">
          
          {/* Main Chat Box */}
          <div className="glass-panel" style={{
            borderRadius: "24px",
            border: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
            background: "var(--bg-secondary, rgba(15, 23, 42, 0.7))",
            display: "flex",
            flexDirection: "column",
            height: "650px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)"
          }}>
            {/* Chat Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
              background: "rgba(0, 180, 216, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #00b4d8, #2563eb)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", color: "#fff"
                }}>
                  🤖
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                    مساعد الدعم الفني الذكي — Ared AI
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#10b981" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                    <span>متصل الآن ويرسل البلاغات لتيليجرام</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMessages([{
                  role: "assistant",
                  content: "مرحباً بك مجدداً! كيف يمكنني مساعدتك اليوم؟ اذكر لي المشكلة أو رقم الطلب لرفع تذكرة فورية للإدارة."
                }])}
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px",
                  fontSize: "0.8rem", cursor: "pointer"
                }}
              >
                🔄 محادثة جديدة
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div style={{
              padding: "10px 15px",
              background: "rgba(0,0,0,0.15)",
              borderBottom: "1px solid var(--border-glass, rgba(255,255,255,0.05))",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              whiteSpace: "nowrap"
            }}>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(p.text)}
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#38bdf8",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s ease"
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #0284c7, #2563eb)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: "#ffffff",
                    padding: "12px 18px",
                    borderRadius: "18px",
                    borderBottomLeftRadius: msg.role === "assistant" ? "4px" : "18px",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "18px",
                    border: msg.role === "assistant" ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                    fontSize: "0.98rem",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    direction: "rtl"
                  }}
                >
                  {msg.content}
                </div>
              ))}

              {isAiLoading && (
                <div style={{
                  alignSelf: "flex-start",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#38bdf8",
                  padding: "12px 18px",
                  borderRadius: "18px",
                  borderBottomLeftRadius: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem"
                }}>
                  <span>جاري التواصل ومعالجة طلبك وإرساله لتيليجرام</span>
                  <span style={{ animation: "blink 1.4s infinite both" }}>.</span>
                  <span style={{ animation: "blink 1.4s infinite both 0.2s" }}>.</span>
                  <span style={{ animation: "blink 1.4s infinite both 0.4s" }}>.</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
              style={{
                padding: "15px 20px",
                borderTop: "1px solid var(--border-glass, rgba(255, 255, 255, 0.1))",
                background: "rgba(0, 0, 0, 0.2)",
                display: "flex",
                gap: "12px"
              }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب مشكلتك، استفسارك، أو رقم الطلب هنا..."
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "14px",
                  padding: "12px 18px",
                  color: "#ffffff",
                  fontSize: "0.98rem",
                  outline: "none",
                  direction: "rtl"
                }}
              />
              <button
                type="submit"
                disabled={isAiLoading || !inputMessage.trim()}
                style={{
                  background: "linear-gradient(135deg, #0284c7, #2563eb)",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "14px",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: (isAiLoading || !inputMessage.trim()) ? "not-allowed" : "pointer",
                  opacity: (isAiLoading || !inputMessage.trim()) ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>إرسال</span>
                <span>➤</span>
              </button>
            </form>
          </div>

          {/* Right Side Info Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Telegram Notification Feature Box */}
            <div className="glass-panel" style={{
              padding: "24px", borderRadius: "20px",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              background: "rgba(56, 189, 248, 0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                  إشعار فوري عبر تيليجرام
                </h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
                كل محادثة أو شكوى يتم تلخيصها بواسطة الذكاء الاصطناعي وإرسالها فورياً إلى قناة وتطبيق تيليجرام الخاص بالإدارة لضمان سرعة الحل والرد.
              </p>
            </div>

            {/* Policy & Guarantee Box */}
            <div className="glass-panel" style={{
              padding: "24px", borderRadius: "20px",
              border: "1px solid rgba(250, 204, 21, 0.3)",
              background: "rgba(250, 204, 21, 0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                  ضمان الاسترجاع الكامل
                </h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "14px" }}>
                نضمن رد الرصيد 100% إلى محفظتك في حال تم رفض الخدمة من السيرفر المصدر أو تعذر تنفيذها لأي سبب تقني.
              </p>
              <Link
                href="/terms#refund-policy"
                style={{
                  color: "#facc15", textDecoration: "none", fontWeight: "bold", fontSize: "0.85rem",
                  display: "inline-flex", alignItems: "center", gap: "6px"
                }}
              >
                <span>قراءة سياسة الاسترجاع كاملة</span>
                <span>←</span>
              </Link>
            </div>

            {/* Direct Official Contacts */}
            <div className="glass-panel" style={{ padding: "24px", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                قنوات التواصل المباشرة
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="https://wa.me/16728972935"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn"
                  style={{
                    padding: "10px 14px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "bold",
                    display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none"
                  }}
                >
                  <span>واتساب الدعم الدولي</span>
                  <span>🟢</span>
                </a>
                <a
                  href="https://t.me/arabtechserveronline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn"
                  style={{
                    padding: "10px 14px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: "bold",
                    display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none"
                  }}
                >
                  <span>قناة تيليجرام الرسمية</span>
                  <span>📢</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: DIRECT TICKET FORM ── */}
      {activeTab === "form" && (
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          
          {formSuccess && (
            <div style={{
              background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "16px",
              padding: "20px", marginBottom: "25px", color: "#fff", textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
              <h3 style={{ margin: "0 0 8px", color: "#34d399", fontSize: "1.3rem" }}>
                تم فتح التذكرة بنجاح ({formSuccess.ticket_id})
              </h3>
              <p style={{ margin: 0, color: "#e2e8f0" }}>{formSuccess.message}</p>
            </div>
          )}

          {formError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "16px",
              padding: "15px 20px", marginBottom: "25px", color: "#fca5a5"
            }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="glass-panel" style={{
            padding: "35px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "20px"
          }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px", color: "var(--text-main)" }}>
              بيانات تذكرة الدعم الفني
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  الاسم / اسم المستخدم
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  رقم الواتساب / الهاتف
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="مثال: +249123456789"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  البريد الإلكتروني (Gmail)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  رقم الطلب (إن وجد)
                </label>
                <input
                  type="text"
                  value={formData.order_id}
                  onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                  placeholder="مثال: 1042"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  تصنيف المشكلة
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "var(--bg-secondary, #0f172a)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                >
                  <option value="استرجاع رصيد">استرجاع رصيد (Refund)</option>
                  <option value="تأخر تنفيذ طلب">تأخر في تنفيذ الطلب</option>
                  <option value="كود لا يعمل">مشكلة في كود التفعيل</option>
                  <option value="شحن محفظة">مشكلة في شحن المحفظة</option>
                  <option value="استفسار عام">استفسار أو دعم فني عام</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                  مستوى الأهمية
                </label>
                <select
                  value={formData.urgency}
                  onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    background: "var(--bg-secondary, #0f172a)", border: "1px solid var(--border-glass)",
                    color: "var(--text-main)", outline: "none"
                  }}
                >
                  <option value="عادية">🟢 عادية</option>
                  <option value="متوسطة">🟡 متوسطة</option>
                  <option value="عاجلة">🔴 عاجلة جداً</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                عنوان التذكرة / المشكلة *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="مثال: طلب إلغاء واسترجاع رصيد للطلب #1042"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                  color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "0.9rem", color: "var(--text-main)" }}>
                تفاصيل الشكوى بالكامل *
              </label>
              <textarea
                required
                rows={5}
                value={formData.details}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                placeholder="اشرح المشكلة بالتفصيل واذكر أي تفاصيل إضافية للمساعدة في حلها سريعاً..."
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)",
                  color: "var(--text-main)", outline: "none", resize: "vertical", fontFamily: "inherit"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px", border: "none",
                background: "linear-gradient(135deg, #00b4d8, #2563eb)", color: "#fff",
                fontWeight: 900, fontSize: "1.1rem", cursor: formSubmitting ? "not-allowed" : "pointer",
                opacity: formSubmitting ? 0.7 : 1, display: "flex", alignItems: "center",
                justifyContent: "center", gap: "10px", marginTop: "10px"
              }}
            >
              {formSubmitting ? "جاري إرسال التذكرة لتيليجرام..." : "إرسال التذكرة فورياً إلى تيليجرام الإدارة 🚀"}
            </button>
          </form>

        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .ticket-chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
