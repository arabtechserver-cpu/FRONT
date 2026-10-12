"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getUserAuthToken } from "../lib/client-auth-token";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "ما هي أسعار تفعيل Borneo Schematics؟",
    "كيف أقوم بشحن رصيد محفظتي؟",
    "أريد أسعار باقات التجار والموزعين VIP",
    "أريد فتح تذكرة دعم فني أو شكوى للإدارة",
    "ما هي شروط وسياسة استرجاع الرصيد؟"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-ai-chat", handleToggle);
    window.addEventListener("open-ai-chat", handleOpen);
    window.addEventListener("close-ai-chat", handleClose);

    return () => {
      window.removeEventListener("toggle-ai-chat", handleToggle);
      window.removeEventListener("open-ai-chat", handleOpen);
      window.removeEventListener("close-ai-chat", handleClose);
    };
  }, []);

  const scrollToBottom = () => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem('borai_store_ai_history') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved.slice(-50));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (messages.length) {
      localStorage.setItem('borai_store_ai_history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = typeof window !== 'undefined' ? getUserAuthToken(localStorage) : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'عذراً، حدث خطأ أثناء معالجة الرد.' }]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'تعذر الاتصال بالمساعد الذكي حالياً. يمكنك مراسلة الدعم الفني مباشرة عبر واتساب.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arabtech_ai_history');
    }
  };

  // Render AI output as text only. The model response is untrusted content.
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    const lines = content.split('\n');
    return lines.map((rawLine, idx) => {
      let line = rawLine.trim();

      // Empty line
      if (!line) return <div key={idx} className="h-1" />;

      // Markdown separator line (--- or ***)
      if (/^[-*_]{3,}$/.test(line)) {
        return <hr key={idx} className="border-t border-slate-200 dark:border-white/10 my-2" />;
      }

      const text = line.replace(/^#{1,3}\s/, '').replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '');

      // Bullet / List Item
      if (/^[-•*]\s/.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pr-1">
            <span className="text-cyan-600 dark:text-primary mt-1.5 text-[8px]">●</span>
            <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">{text}</div>
          </div>
        );
      }

      // Numbered List
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\.\s/)?.[1];
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 pr-1">
            <span className="text-cyan-700 dark:text-primary font-bold text-xs bg-cyan-500/10 dark:bg-primary/10 px-1.5 py-0.5 rounded-full">{num}</span>
            <div className="flex-1 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">{text}</div>
          </div>
        );
      }

      // Headings
      if (line.startsWith('### ')) {
        return <h5 key={idx} className="font-bold text-sm text-cyan-700 dark:text-primary mt-3 mb-1">{text}</h5>;
      }
      if (line.startsWith('## ')) {
        return <h4 key={idx} className="font-bold text-base text-cyan-600 dark:text-cyan-400 mt-3 mb-1.5">{text}</h4>;
      }
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="font-extrabold text-lg text-slate-900 dark:text-white mt-4 mb-2">{text}</h3>;
      }

      return (
        <p key={idx} className="my-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{text}</p>
      );
    });
  };

  return (
    <>
      {/* Chat Box Modal (Fully Mobile & Desktop Responsive with Light & Dark Mode) */}
      {isOpen && (
        <div className="fixed inset-x-2.5 bottom-2.5 sm:bottom-6 sm:left-6 sm:inset-x-auto w-auto sm:w-[420px] max-w-full h-[85vh] sm:h-[580px] bg-white/95 dark:bg-background/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(15,17,26,0.7)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 z-[9999]">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-slate-50 dark:from-primary/20 dark:via-blue-900/30 dark:to-[#44403c] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-400 to-blue-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-surface-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-primary text-lg sm:text-xl">smart_toy</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0b0f19] rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>BORAI STORE AI</span>
                  <span className="text-[9px] sm:text-[10px] bg-blue-500/15 text-blue-600 px-1.5 py-0.5 rounded-full font-mono border border-blue-500/30">PRO</span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>متصل الآن لخدمتك</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={startNewChat}
                title="محادثة جديدة"
                aria-label="بدء محادثة جديدة"
                className="p-1.5 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">refresh</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="إغلاق"
                aria-label="إغلاق نافذة المحادثة"
                className="p-1.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 sm:space-y-4 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-outline-variant/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-3 sm:p-4 text-slate-600 dark:text-slate-400">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3 shadow-xs">
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">auto_awesome</span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">مرحباً بك في المساعد الذكي</h4>
                <p className="text-[11px] sm:text-xs max-w-[280px] mb-3 text-slate-500 dark:text-slate-400">
                  اسألني عن أسعار الخدمات، فحص وتتبع الطلبات، باقات الجملة، أو رفع شكوى مباشرة للإدارة.
                </p>

                {/* Suggestions Pills */}
                <div className="w-full space-y-1.5 text-right">
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1 mb-1">
                    أسئلة مقترحة شائعة:
                  </p>
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="w-full text-right p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50/80 dark:bg-white/5 dark:hover:bg-primary/20 border border-slate-200/80 hover:border-cyan-400/50 dark:border-white/10 dark:hover:border-primary/40 text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group shadow-xs active:scale-[0.98]"
                    >
                      <span className="line-clamp-1">{sug}</span>
                      <span className="material-symbols-outlined text-cyan-600 dark:text-primary text-xs sm:text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs ${
                      m.role === 'user'
                        ? 'bg-cyan-600 dark:bg-primary text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/10 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-slate-900 dark:text-white flex items-center gap-2 shadow-xs">
                  <span className="material-symbols-outlined animate-spin text-cyan-600 dark:text-primary text-base">progress_activity</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">جاري التفكير وصياغة الرد...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 bg-slate-50/90 dark:bg-background border-t border-slate-200 dark:border-white/10 flex items-center gap-2"
          >
            <input
              id="ai-chat-input"
              name="aiQuery"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="اكتب استفسارك أو طلبك هنا"
              placeholder="اكتب استفسارك أو طلبك هنا..."
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-surface-container border border-slate-200 dark:border-white/15 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-600 hover:bg-cyan-500 dark:bg-primary dark:hover:bg-primary-container dark:text-white disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl rotate-180">send</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
}
