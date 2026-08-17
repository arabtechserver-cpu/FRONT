'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

function renderAssistantContent(content) {
  const lines = String(content || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const tableLines = lines.filter(line => line.startsWith('|') && line.endsWith('|') && !/^\|\s*:?-+/.test(line));
  const renderInline = (value) => {
    const parts = String(value).split(/(\[[^\]]+\]\([^\)]+\)|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
      if (match) return <a key={index} href={match[2]} target="_blank" rel="noreferrer" className="ai-chat-link">{match[1]}</a>;
      if (/^https?:\/\//.test(part)) {
        const isServiceLink = /\/service\/\d+\/?(?:[?#].*)?$/.test(part);
        return <a key={index} href={part} target="_blank" rel="noreferrer" className="ai-chat-link">{isServiceLink ? 'عرض وشراء الخدمة' : 'فتح الرابط'}</a>;
      }
      return <React.Fragment key={index}>{part.replace(/\*\*/g, '')}</React.Fragment>;
    });
  };
  if (tableLines.length >= 2) {
    const rows = tableLines.slice(1, 6).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
    return <div className="ai-result-cards">{rows.map((row, index) => (
      <div className="ai-result-card" key={index}>
        <div className="ai-result-title">{renderInline(row[1] || row[0])}</div>
        <div className="ai-result-meta">{row.slice(2, -1).filter(Boolean).join(' · ').replace(/[₱₽€£]/g, 'USD').replace(/\b(USD)\s*(USD)+\b/g, '$1')}</div>
        {row[row.length - 1] && <div className="ai-result-action">{renderInline(row[row.length - 1])}</div>}
      </div>
    ))}</div>;
  }
  return <div className="ai-chat-rich-text">{lines.map((line, index) => <div key={index} className={/^[-•]/.test(line) ? 'ai-chat-line' : 'ai-chat-paragraph'}>{renderInline(line.replace(/^[-•]\s*/, ''))}</div>)}</div>;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('customer_token')));
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('arab_tech_server_ai_history') || '[]');
      if (Array.isArray(saved)) setMessages(saved.slice(-50));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length) localStorage.setItem('arab_tech_server_ai_history', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arab_tech_server_ai_history');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.arab-tech1.online'}/api/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.message || `تعذر الرد من الخادم (HTTP ${res.status}).` }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً أو مراسلتنا على تليجرام: https://t.me/arabtechserveronline' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="ai-chat-widget-container">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window" style={{
          width: 'min(560px, calc(100vw - 48px))',
          height: 'min(720px, calc(100vh - 110px))',
          maxHeight: 'calc(100vh - 110px)',
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))',
          borderRadius: '24px',
          marginBottom: '15px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Header */}
          <div className="ai-chat-header" style={{
            padding: '15px 20px',
            borderBottom: '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 180, 216, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem' }}>🤖</div>
              <div>
                <h3 className="ai-chat-title" style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Ared AI — الدعم الذكي</h3>
                <span style={{ fontSize: '0.8rem', color: '#00b4d8' }}>متصل • يرسل الشكاوى لتيليجرام</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/tickets/new" style={{ fontSize: '0.75rem', color: '#38bdf8', textDecoration: 'none', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 8px', borderRadius: '6px' }}>
                فتح تذكرة 🎫
              </Link>
              <button className="ai-chat-new" onClick={startNewChat} title="محادثة جديدة" type="button">＋ جديد</button>
              <button 
                className="ai-chat-close"
                onClick={() => setIsOpen(false)}
                type="button"
                aria-label="إغلاق المحادثة / Close chat"
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}
              >
                &times;
              </button>
            </div>
          </div>

          {!isLoggedIn && (
            <div style={{ margin: '10px 15px 0', padding: '10px', borderRadius: '12px', background: 'rgba(0,180,216,0.12)', color: '#fff', textAlign: 'center', direction: 'rtl', fontSize: '0.85rem' }}>
              أنت تتحدث كزائر. يمكنك تسجيل الدخول للوصول السريع إلى رصيدك وطلباتك.
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
                <a href="/login" style={{ background: '#00b4d8', color: '#fff', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem' }}>تسجيل الدخول</a>
                <a href="/login?mode=register" style={{ background: '#334155', color: '#fff', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem' }}>إنشاء حساب</a>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 && (
              <div className="ai-chat-empty" style={{ textAlign: 'center', color: 'var(--text-muted, #aaa)', marginTop: '20px', fontSize: '0.9rem' }}>
                مرحباً! أنا المساعد الذكي، يمكنني مساعدتك في البحث عن الخدمات ومعرفة رصيدك وطلباتك أو رفع شكوى فورية للإدارة على تيليجرام. تفضل بسؤالي!
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-chat-message ${msg.role}`} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #00b4d8, #0077b6)' : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                padding: '10px 15px',
                borderRadius: '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                direction: 'rtl'
              }}>
                 {msg.role === 'assistant' ? renderAssistantContent(msg.content) : msg.content}
              </div>
            ))}
            
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#aaa',
                padding: '10px 15px',
                borderRadius: '16px',
                borderBottomLeftRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '5px',
                alignItems: 'center'
              }}>
                <span style={{ animation: 'blink 1.4s infinite both', fontSize: '1.2rem' }}>.</span>
                <span style={{ animation: 'blink 1.4s infinite both 0.2s', fontSize: '1.2rem' }}>.</span>
                <span style={{ animation: 'blink 1.4s infinite both 0.4s', fontSize: '1.2rem' }}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="ai-chat-form" onSubmit={handleSend} style={{
            padding: '15px',
            borderTop: '1px solid var(--border-glass, rgba(255, 255, 255, 0.1))',
            display: 'flex',
            gap: '10px'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="اكتب رسالتك أو استفسارك هنا..."
              className="ai-chat-input"
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '10px 15px',
                outline: 'none',
                direction: 'rtl',
                fontFamily: 'inherit'
              }}
            />
            <button className="ai-chat-send" 
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.6 : 1,
                color: '#fff',
                fontSize: '1.2rem'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && <button
        className="ai-chat-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="فتح Ared AI / Open Ared AI"
        title="Ared AI"
        style={{
           width: '68px',
           height: '68px',
           borderRadius: '22px',
           background: 'linear-gradient(145deg, #06b6d4, #2563eb 60%, #7c3aed)',
          border: 'none',
          color: '#fff',
           fontSize: '1.65rem',
           fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 180, 216, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: 'scale(1)'
        }}
      >
        <span className="arab-ai-logo">Ared AI</span>
      </button>}
      
      <style>{`
        .arab-ai-logo { font-family: var(--font-tajawal, sans-serif); font-size: .82rem; line-height: 1; letter-spacing: -.35px; text-shadow: 0 2px 8px rgba(0,0,0,.35); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .ai-chat-widget-container {
          position: fixed;
          bottom: 48px;
          left: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          pointer-events: none;
        }
        .ai-chat-widget-container > * { pointer-events: auto; }
        @media (max-width: 768px) {
          .ai-chat-window { width: min(430px, calc(100vw - 24px)) !important; height: min(650px, calc(100vh - 150px)) !important; }
          .ai-chat-widget-container {
             bottom: calc(90px + env(safe-area-inset-bottom, 0px));
             left: 16px;
          }
        }
        .ai-chat-input {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        .ai-chat-input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.6) !important;
        }
        .ai-chat-window { color: var(--text-main, #f8fafc); background: var(--bg-secondary, #0f172a) !important; border-color: var(--border-glass, rgba(148,163,184,.25)) !important; }
        .ai-chat-header, .ai-chat-form { border-color: var(--border-glass, rgba(148,163,184,.25)) !important; }
        .ai-chat-message.assistant { background: var(--bg-glass, rgba(255,255,255,.07)) !important; color: var(--text-main, #f8fafc) !important; border-color: var(--border-glass, rgba(148,163,184,.25)) !important; }
        .ai-chat-message.user { color: #fff !important; }
        .ai-chat-rich-text { display: flex; flex-direction: column; gap: 7px; }
        .ai-chat-line { padding: 7px 9px; border-radius: 9px; background: rgba(14,165,233,.08); }
        .ai-result-cards { display: grid; gap: 9px; width: min(100%, 330px); }
        .ai-result-card { padding: 11px; border: 1px solid rgba(56,189,248,.24); border-radius: 12px; background: rgba(15,23,42,.45); }
        .ai-result-title { font-weight: 800; color: #38bdf8; line-height: 1.4; }
        .ai-result-meta { margin-top: 5px; color: var(--text-muted,#94a3b8); font-size: .82rem; }
        .ai-result-action { margin-top: 8px; }
        .ai-chat-link { display: inline-flex; color: #22d3ee; font-weight: 800; text-decoration: none; border: 1px solid rgba(34,211,238,.3); padding: 4px 9px; border-radius: 7px; }
        [data-theme="light"] .ai-chat-message.assistant { background: #f1f5f9 !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; font-weight: 500 !important; }
        [data-theme="light"] .ai-result-card { background: #f8fafc !important; border-color: #bae6fd !important; color: #0f172a !important; }
        [data-theme="light"] .ai-result-meta { color: #475569 !important; }
        [data-theme="light"] .ai-chat-new { color: #0f172a; border-color: rgba(23,105,232,.3); }
        [data-theme="light"] .ai-chat-window { background: #ffffff !important; color: #0f172a; box-shadow: 0 18px 55px rgba(15,23,42,.18); }
        [data-theme="light"] .ai-chat-header { background: #ecfeff !important; }
        [data-theme="light"] .ai-chat-title { color: #0f172a !important; }
        [data-theme="light"] .ai-chat-close { color: #0f172a !important; }
        [data-theme="light"] .ai-chat-form { background: #f8fafc; }
        [data-theme="light"] .ai-chat-input { background: #fff !important; color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; border-color: #cbd5e1 !important; }
        [data-theme="light"] .ai-chat-input::placeholder { color: #64748b !important; -webkit-text-fill-color: #64748b !important; }
        @media (max-width: 560px) {
          .ai-chat-window { width: min(390px, calc(100vw - 24px)) !important; height: min(620px, calc(100vh - 150px)) !important; border-radius: 18px !important; }
          .ai-chat-widget-container { left: 14px; right: auto; bottom: calc(90px + env(safe-area-inset-bottom, 0px)); align-items: flex-start; }
          .ai-chat-toggle { width: 52px !important; height: 52px !important; border-radius: 16px !important; }
          .arab-ai-logo { font-size: .69rem; }
          .ai-chat-form { padding: 10px !important; gap: 7px !important; }
          .ai-chat-message { max-width: 92% !important; font-size: .9rem !important; }
        }
      `}</style>
    </div>
  );
}
