"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  source: string;
  subscribedAt: string;
  lastNotifiedAt?: string;
}

interface Broadcast {
  id: string;
  subject: string;
  title: string;
  message: string;
  category: string;
  actionUrl?: string;
  actionText?: string;
  sentCount: number;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, broadcastsCount: 0 });
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Broadcast Form State
  const [category, setCategory] = useState("Tool Offer");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [actionUrl, setActionUrl] = useState("/ar/pricing");
  const [actionText, setActionText] = useState("تصفح العرض واطلب الآن");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Tab: Broadcast / Subscribers List / Sent History
  const [activeTab, setActiveTab] = useState<"broadcast" | "subscribers" | "history">("broadcast");

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const url = `/api/newsletter/subscribers?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch("/api/newsletter/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data || []);
      }
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchBroadcasts();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/newsletter/toggle/${id}`, { method: "POST" });
      if (res.ok) {
        setToastMessage("تم تحديث حالة اشتراك العميل بنجاح");
        fetchSubscribers();
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      alert("فشل تحديث الحالة");
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`هل أنت متأكد من حذف المشترك (${email}) نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToastMessage("تم حذف المشترك بنجاح");
        fetchSubscribers();
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      alert("فشل حذف المشترك");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert("يرجى ملء عنوان النشرة ومحتوى الرسالة");
      return;
    }

    if (!confirm(`هل أنت متأكد من إرسال هذا البريد إلى جميع المشتركين النشطين (${stats.active} عميل)؟`)) {
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await fetch("/api/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          subject: subject || `[BORAI STORE] ${title}`,
          message,
          actionUrl,
          actionText
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage(data.message || "تم إرسال النشرة البريدية بنجاح!");
        setTitle("");
        setSubject("");
        setMessage("");
        fetchSubscribers();
        fetchBroadcasts();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || "فشل إرسال النشرة البريدية");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Quick preset templates
  const applyTemplate = (type: "tool" | "discount" | "server" | "blog") => {
    if (type === "tool") {
      setCategory("Tool Offer");
      setTitle("توفر تفعيل رسمي فوري لأداة جديدة!");
      setSubject("خدمة جديدة وتفعيل فوري على BORAI STORE");
      setMessage("يسرنا إعلامكم بتوفر خدمات وباقات شحن وتفعيلات جديدة بأسعار حصرية وتسليم فوري تلقائي عبر المتجر. تفضل بالطلب الآن واستمتع بأعلى سرعة وأفضل دعم فني.");
      setActionUrl("/ar/pricing");
      setActionText("طلب وتفعيل الخدمة فوراً");
    } else if (type === "discount") {
      setCategory("Hot Offer");
      setTitle("تخفيضات خاصة وعروض جملة لفترة محدودة!");
      setSubject("خصم خاص على باقات وتفعيلات السيرفر للوكلاء");
      setMessage("عرض خاص لجميع عملائنا ووكلائنا الكرام! تخفيضات حصرية على أرصدة السيرفرات وفك الشفرات وتخطي الحسابات لفترة محدودة. اشحن محفظتك الآن واستفد من العرض قبل انتهائه.");
      setActionUrl("/ar/pricing");
      setActionText("استعراض العروض المخفضة");
    } else if (type === "server") {
      setCategory("Service Update");
      setTitle("تحديث جديد: دعم فك شفرات موديلات إضافية");
      setSubject("تحديث جديد لسيرفر فك الشفرات وتخطي الحسابات");
      setMessage("تم تحديث خدمات الـ IMEI والسيرفر لدعم أحدث الحمايات والموديلات العالمية لفك الشبكات وتخطي FRP و iCloud بكفاءة عالية وبأسرع وقت تسليم.");
      setActionUrl("/ar/pricing?cat=imei");
      setActionText("عرض قائمة الخدمات المحدثة");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-8 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">forward_to_inbox</span>
            <span>إدارة النشرة البريدية وإرسال الإشعارات للعملاء</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            إدارة المشتركين وإرسال النشرات البريدية والعروض وتنبيهات الخدمات الجديدة لجميع العملاء المسجلين.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-primary/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold">إجمالي المشتركين</p>
            <p className="text-2xl font-bold text-on-surface">{stats.total}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-violet-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 text-2xl">
            <span className="material-symbols-outlined">mark_email_read</span>
          </div>
          <div>
            <p className="text-xs text-violet-400 font-bold">مشتركون نشطون</p>
            <p className="text-2xl font-bold text-violet-300">{stats.active}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant text-2xl">
            <span className="material-symbols-outlined">unsubscribe</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold">معطل / غير نشط</p>
            <p className="text-2xl font-bold text-on-surface-variant">{stats.inactive}</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-secondary/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary text-2xl">
            <span className="material-symbols-outlined">campaign</span>
          </div>
          <div>
            <p className="text-xs text-secondary font-bold">نشرات بريدية مرسلة</p>
            <p className="text-2xl font-bold text-secondary">{stats.broadcastsCount || broadcasts.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-2">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "broadcast"
              ? "bg-primary text-surface font-bold shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">send</span>
          إرسال نشرة / إشعار جديد للعملاء
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "subscribers"
              ? "bg-primary text-surface font-bold shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
          قائمة المشتركين ({stats.total})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-primary text-surface font-bold shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">history</span>
          سجل النشرات المرسلة ({broadcasts.length})
        </button>
      </div>

      {/* TAB 1: SEND BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                إرسال نشرة بريدية وإشعار لجميع المشتركين ({stats.active} نشط)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                سيتم إرسال هذا البريد تلقائياً إلى كافة عناوين البريد الإلكتروني للمشتركين النشطين.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2">
              <span className="text-xs font-bold text-on-surface-variant block">قوالب جاهزة بضغطة زر:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate("tool")}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary/20 text-xs font-medium border border-outline-variant/30 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-primary">bolt</span>
                  <span>تفعيل أداة جديدة</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("discount")}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-secondary/20 text-xs font-medium border border-outline-variant/30 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-secondary">local_offer</span>
                  <span>خصم وعرض خاص</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("server")}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-violet-500/20 text-xs font-medium border border-outline-variant/30 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-violet-400">lock_open</span>
                  <span>تحديث خدمات فك شفرات</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-on-surface-variant">تصنيف النشرة</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface"
                >
                  <option value="Tool Offer">عرض تفعيل أداة (Tool Offer)</option>
                  <option value="Hot Offer">تخفيض وعرض خاص (Hot Discount)</option>
                  <option value="Service Update">تحديث خدمة وسيرفر (Service Update)</option>
                  <option value="General Announcement">إعلان عام (Announcement)</option>
                  <option value="Blog">شرح ومقال جديد (Blog & Tutorial)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-on-surface-variant">
                  عنوان الإشعار / البنر <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خصم 20% على تفعيل UnlockTool لمدة 24 ساعة فقط"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-on-surface-variant">
                  عنوان البريد الإلكتروني (Subject)
                </label>
                <input
                  type="text"
                  placeholder="إذا تُرك فارغاً سيتم استخدام عنوان الإشعار تلقائياً"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-on-surface-variant">
                  نص ومحتوى الرسالة <span className="text-error">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب نص الإشعار بالتفصيل للعميل..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">نص زر التوجيه (Button Text)</label>
                  <input
                    type="text"
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-primary">رابط التوجيه (Action URL)</label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-primary/40 rounded-xl p-3 text-sm font-mono text-primary"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={sendingBroadcast || stats.active === 0}
                  className="btn-primary w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{sendingBroadcast ? "sync" : "send"}</span>
                  <span>
                    {sendingBroadcast
                      ? "جاري إرسال النشرة للعملاء..."
                      : `إرسال النشرة الآن إلى ${stats.active} مشترك`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Email Preview */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-card rounded-3xl p-6 border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                  معاينة البريد كما سيصل للعميل
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {category}
                </span>
              </div>

              {/* Mockup Email Container */}
              <div className="bg-[#0b1329] border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-inner">
                {/* Header Logo */}
                <div className="flex items-center justify-between pb-3 border-b border-violet-400/15">
                  <span className="font-bold text-xs text-primary font-mono tracking-wider">BORAI STORE</span>
                  <span className="text-[10px] text-white/50">إشعار رسمي</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-base font-bold text-white leading-snug">
                    {title || "عنوان الإشعار يظهر هنا..."}
                  </h4>

                  <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line bg-surface-container/30 p-3 rounded-xl border border-violet-400/8">
                    {message || "محتوى ونصوص النشرة البريدية التوضيحية ستظهر هنا للعميل بشكل منسق وجذاب..."}
                  </p>

                  <div className="pt-2 text-center">
                    <a
                      href={actionUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-surface font-bold text-xs px-6 py-2.5 rounded-xl shadow-md pointer-events-none"
                    >
                      {actionText || "تصفح العرض الآن"}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-violet-400/15 text-[10px] text-white/40 text-center space-y-1">
                  <p>تصلك هذه الرسالة لاشتراكك في نشرة BORAI STORE.</p>
                  <p>BORAI STORE | All Rights Reserved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS LIST */}
      {activeTab === "subscribers" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
              قائمة العملاء المشتركين ({subscribers.length})
            </h2>

            {/* Search and filter */}
            <div className="flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearch} className="relative min-w-[240px]">
                <input
                  type="text"
                  placeholder="ابحث بالبريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2 text-xs text-on-surface pl-8"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">
                  search
                </span>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">النشطون فقط</option>
                <option value="inactive">المعطلون فقط</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              لا يوجد مشتركون مطابقون لبحثك حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
              <table className="w-full text-right text-xs">
                <thead className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/20">
                  <tr>
                    <th className="p-3.5 font-bold">#</th>
                    <th className="p-3.5 font-bold">البريد الإلكتروني</th>
                    <th className="p-3.5 font-bold">الاسم / المصدر</th>
                    <th className="p-3.5 font-bold">تاريخ الاشتراك</th>
                    <th className="p-3.5 font-bold">آخر إشعار</th>
                    <th className="p-3.5 font-bold">الحالة</th>
                    <th className="p-3.5 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {subscribers.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-3.5 font-mono text-on-surface-variant">{idx + 1}</td>
                      <td className="p-3.5 font-bold font-mono text-on-surface">{sub.email}</td>
                      <td className="p-3.5 text-on-surface-variant">{sub.name || sub.source || "الموقع"}</td>
                      <td className="p-3.5 text-on-surface-variant">
                        {new Date(sub.subscribedAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-3.5 text-on-surface-variant">
                        {sub.lastNotifiedAt ? new Date(sub.lastNotifiedAt).toLocaleDateString("ar-EG") : "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.isActive
                              ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                              : "bg-error/15 text-error border border-error/30"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? "bg-violet-400" : "bg-error"}`}></span>
                          {sub.isActive ? "نشط" : "معطل"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(sub.id)}
                            title={sub.isActive ? "تعطيل الاشتراك" : "تفعيل الاشتراك"}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {sub.isActive ? "toggle_on" : "toggle_off"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            title="حذف المشترك"
                            className="p-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SENT BROADCASTS HISTORY */}
      {activeTab === "history" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">history</span>
            سجل النشرات والإشعارات المرسلة سابقاً ({broadcasts.length})
          </h2>

          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              لم يتم إرسال أي نشرات سابقة حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold">
                        {b.category}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {new Date(b.createdAt).toLocaleString("ar-EG")}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-on-surface">{b.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">{b.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs">
                    <span className="text-violet-400 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">send</span>
                      تم الإرسال لـ {b.sentCount} مشترك
                    </span>

                    {b.actionUrl && (
                      <a
                        href={b.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-[11px] font-bold"
                      >
                        رابط التوجيه ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
