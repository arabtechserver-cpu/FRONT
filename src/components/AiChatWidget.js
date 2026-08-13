'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('customer_token')));
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('arab_tech_server_ai_history') || '[]');
      if (Array.isArray(saved)) setMessages(saved.slice(-50));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length) localStorage.setItem('arab_tech_server_ai_history', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('customer_token');

      if (!token) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'يرجى تسجيل الدخول أولاً لاستخدام المساعد الذكي.'
        }]);
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.arab-tech1.online'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'حدث خطأ أثناء الاتصال بالخادم.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'حدث خطأ في الشبكة، يرجى المحاولة لاحقاً.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-widget-container">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window" style={{
          width: '350px',
          height: '500px',
          maxHeight: '80vh',
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
                <h3 className="ai-chat-title" style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>المساعد الذكي</h3>
                <span style={{ fontSize: '0.8rem', color: '#00b4d8' }}>متصل</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}
            >
              &times;
            </button>
          </div>

          {!isLoggedIn && (
            <div style={{ margin: '12px 15px 0', padding: '12px', borderRadius: '12px', background: 'rgba(0,180,216,0.12)', color: '#fff', textAlign: 'center', direction: 'rtl' }}>
              سجّل حساباً مجانياً للوصول إلى الرصيد والطلبات وطلب الخدمات.
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '9px' }}>
                <a href="/login" style={{ background: '#00b4d8', color: '#fff', padding: '7px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>تسجيل الدخول</a>
                <a href="/login?mode=register" style={{ background: '#334155', color: '#fff', padding: '7px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>إنشاء حساب</a>
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
                مرحباً! أنا المساعد الذكي، يمكنني مساعدتك في البحث عن الخدمات ومعرفة رصيدك وطلباتك. تفضل بسؤالي!
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
                {msg.content}
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
              placeholder="اكتب رسالتك هنا..."
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
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
          border: 'none',
          color: '#fff',
          fontSize: '2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 180, 216, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? '×' : '🤖'}
      </button>
      
      <style>{`
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
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .ai-chat-widget-container {
            bottom: 90px;
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
        [data-theme="light"] .ai-chat-window { background: #ffffff !important; color: #0f172a; box-shadow: 0 18px 55px rgba(15,23,42,.18); }
        [data-theme="light"] .ai-chat-header { background: #ecfeff !important; }
        [data-theme="light"] .ai-chat-title { color: #0f172a !important; }
        [data-theme="light"] .ai-chat-form { background: #f8fafc; }
        [data-theme="light"] .ai-chat-input { background: #fff !important; color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; border-color: #cbd5e1 !important; }
        [data-theme="light"] .ai-chat-input::placeholder { color: #64748b !important; -webkit-text-fill-color: #64748b !important; }
        @media (max-width: 560px) {
          .ai-chat-window { width: min(390px, calc(100vw - 24px)) !important; height: min(620px, calc(100vh - 150px)) !important; border-radius: 18px !important; }
          .ai-chat-widget-container { left: 12px; right: 12px; bottom: 14px; align-items: flex-start; }
          .ai-chat-form { padding: 10px !important; gap: 7px !important; }
          .ai-chat-message { max-width: 92% !important; font-size: .9rem !important; }
        }
      `}</style>
    </div>
  );
}
