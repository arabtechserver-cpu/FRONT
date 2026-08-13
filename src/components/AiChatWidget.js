'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token'); // Assuming JWT is stored here
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.arab-tech1.online'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
        <div style={{
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
          <div style={{
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
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>المساعد الذكي</h3>
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
              <div style={{ textAlign: 'center', color: 'var(--text-muted, #aaa)', marginTop: '20px', fontSize: '0.9rem' }}>
                مرحباً! أنا المساعد الذكي، يمكنني مساعدتك في البحث عن الخدمات ومعرفة رصيدك وطلباتك. تفضل بسؤالي!
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} style={{
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
          <form onSubmit={handleSend} style={{
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
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '10px 15px',
                color: '#fff',
                outline: 'none',
                direction: 'rtl',
                fontFamily: 'inherit'
              }}
            />
            <button 
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
      `}</style>
    </div>
  );
}
