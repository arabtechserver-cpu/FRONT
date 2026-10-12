"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cleanHtmlToText } from "@/utils/cleanHtml";

interface OrderItem {
  id: string;
  serviceName: string;
  targetInput?: string;
  notes?: string;
  reply?: string;
  price?: number | string;
  quantity?: number;
  status: "completed" | "processing" | "pending" | "failed" | "rejected" | string;
  createdAt: string;
  updatedAt?: string;
  providerOrderId?: string;
  providerStatus?: string;
}

export default function OrdersClient({ lang, dict }: { lang: string; dict: any }) {
  const isAr = lang === "ar";

  const [userSession, setUserSession] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_price">("newest");
  const [authExpired, setAuthExpired] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(isAr ? `تم نسخ ${label} بنجاح` : `${label} copied successfully`);
  };

  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setUserBalance(parseFloat(parsed.balance || 0));

        if (parsed.email || parsed.id) {
          const token = localStorage.getItem("user_token");
          const queryParam = parsed.id
            ? `userId=${encodeURIComponent(parsed.id)}`
            : `email=${encodeURIComponent(parsed.email)}`;
          const headers: Record<string, string> = {};
          if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
          }
          fetch(`/api/users/profile?${queryParam}`, {
            headers,
            credentials: "include"
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.user) {
                setUserBalance(data.user.balance);
                const updatedSession = { ...parsed, balance: data.user.balance };
                localStorage.setItem("user_session", JSON.stringify(updatedSession));
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        setUserSession(null);
      }
    } else {
      setLoadingOrders(false);
    }
  }, []);

  const fetchCustomerOrders = async () => {
    if (!userSession?.email && !userSession?.id) {
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("user_token");
      const param = userSession?.id
        ? `userId=${encodeURIComponent(userSession.id)}`
        : `email=${encodeURIComponent(userSession.email)}`;
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/orders?${param}`, {
        headers,
        credentials: "include"
      });
      if (res.ok) {
        setAuthExpired(false);
        const data = await res.json().catch(() => ({ orders: [] }));
        if (data.orders && Array.isArray(data.orders)) {
          setOrdersList(data.orders);
        }
      } else if (res.status === 401) {
        setAuthExpired(true);
      }
    } catch (e) {
      console.error("Error fetching orders list:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userSession) {
      fetchCustomerOrders();
    }
  }, [userSession]);

  const metrics = useMemo(() => {
    const total = ordersList.length;
    const completed = ordersList.filter((o) => o.status === "completed").length;
    const pending = ordersList.filter(
      (o) => o.status === "pending" || o.status === "processing" || o.status === "dispatching"
    ).length;
    const failed = ordersList.filter(
      (o) => o.status === "failed" || o.status === "rejected"
    ).length;
    const totalSpent = ordersList
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (parseFloat(String(o.price || 0)) || 0), 0);
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    return { total, completed, pending, failed, totalSpent, successRate };
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return ordersList
      .filter((o) => {
        if (filterStatus === "completed" && o.status !== "completed") return false;
        if (
          filterStatus === "processing" &&
          !(o.status === "processing" || o.status === "pending" || o.status === "dispatching")
        )
          return false;
        if (
          filterStatus === "failed" &&
          !(o.status === "failed" || o.status === "rejected")
        )
          return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const orderId = (o.id || "").toLowerCase();
          const serviceName = (o.serviceName || "").toLowerCase();
          const targetInput = (o.targetInput || "").toLowerCase();
          const notes = (o.notes || "").toLowerCase();
          const reply = cleanHtmlToText(o.reply || "").toLowerCase();

          return (
            orderId.includes(q) ||
            serviceName.includes(q) ||
            targetInput.includes(q) ||
            notes.includes(q) ||
            reply.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "highest_price") {
          return (parseFloat(String(b.price || 0)) || 0) - (parseFloat(String(a.price || 0)) || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [ordersList, filterStatus, searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-6 pb-20 w-full" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2.5 transition-all">
          <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-5 sm:p-7 border dark:border-white/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>{isAr ? "مركز تتبع العمليات" : "Orders Command Center"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">receipt_long</span>
            <span>{isAr ? "سجل طلباتي والخدمات" : "My Orders History"}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            {isAr
              ? "متابعة لحظية لحالة طلباتك، استخراج أكواد التفعيل، وتفاصيل العمليات السابقة."
              : "Track your orders status live, retrieve unlock codes, and inspect execution results."}
          </p>
        </div>

        {/* Actions & Balance */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <Link
            href={`/${lang}/pricing`}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>{isAr ? "طلب خدمة جديدة" : "Order New Service"}</span>
          </Link>

          {userSession && (
            <div className="flex-1 md:flex-initial p-2.5 px-4 rounded-xl dark:bg-background border dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{isAr ? "رصيدك" : "Balance"}</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">${userBalance.toFixed(2)} USD</p>
              </div>
              <Link
                href={`/${lang}/wallet`}
                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
                <span>{isAr ? "شحن" : "Top Up"}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* NOT LOGGED IN WARNING */}
      {!userSession && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">lock</span>
            <div>
              <p className="font-bold text-sm dark:text-white">
                {isAr ? "يرجى تسجيل الدخول لمشاهدة طلباتك" : "Please Sign In to View Your Orders"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isAr
                  ? "قم بتسجيل الدخول بحسابك لعرض سجل العمليات وحالة خدماتك وأكوادك."
                  : "Sign in to access your order history and unlock codes."}
              </p>
            </div>
          </div>
          <Link
            href={`/${lang}/login`}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shrink-0 shadow-sm cursor-pointer"
          >
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </Link>
        </div>
      )}

      {/* SESSION EXPIRED WARNING */}
      {userSession && authExpired && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">warning</span>
            <div>
              <p className="font-bold text-sm dark:text-white">
                {isAr ? "انتهت صلاحية جلسة تسجيل الدخول" : "Session Expired"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isAr
                  ? "يرجى تسجيل الدخول مجدداً لتحديث ومشاهدة سجل طلباتك."
                  : "Please sign in again to view and update your orders."}
              </p>
            </div>
          </div>
          <Link
            href={`/${lang}/login`}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shrink-0 shadow-sm cursor-pointer"
          >
            {isAr ? "تسجيل الدخول" : "Sign In"}
          </Link>
        </div>
      )}

      {/* METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total */}
        <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-4 sm:p-5 border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{isAr ? "إجمالي الطلبات" : "Total Orders"}</span>
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">inventory_2</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold dark:text-white font-mono">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{isAr ? "طلب" : "orders"}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{isAr ? "كافة الطلبات المسجلة" : "All records"}</p>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold">{isAr ? "طلبات مكتملة" : "Completed"}</span>
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {metrics.completed}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
              {metrics.successRate}%
            </span>
          </div>
          <div className="w-full dark:bg-background rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.successRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-bold">{isAr ? "قيد المعالجة" : "Pending"}</span>
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl animate-spin">
              sync
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
              {metrics.pending}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{isAr ? "طلب نشط" : "active"}</span>
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">{isAr ? "بانتظار رد المزود" : "Processing"}</p>
        </div>

        {/* Card 4: Total Spent */}
        <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-4 sm:p-5 border dark:border-white/10 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{isAr ? "إجمالي المنصرف" : "Total Spent"}</span>
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">payments</span>
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              ${metrics.totalSpent.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">USD</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{isAr ? "للخدمات المنفذة فعلياً" : "Completed total"}</p>
        </div>
      </div>

      {/* CONTROLS CARD: SEARCH & FILTERS */}
      <div className="bg-surface-container dark:bg-surface-container rounded-2xl p-4 sm:p-6 border dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث برقم الطلب، اسم الخدمة، رقم IMEI، أو كود التفعيل..."
                  : "Search by Order ID, service name, IMEI, or code..."
              }
              className="w-full dark:bg-background border dark:border-white/10 rounded-xl py-2.5 ps-10 pe-4 text-xs dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-surface-container focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-start">
            {/* Status Tabs with smooth scroll */}
            <div className="flex items-center overflow-x-auto no-scrollbar max-w-full dark:bg-background p-1 rounded-xl border dark:border-white/10 text-xs font-bold gap-0.5">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isAr ? "الكل" : "All"} ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("processing")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  filterStatus === "processing"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isAr ? "قيد الانتظار" : "Pending"} ({metrics.pending})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  filterStatus === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isAr ? "مكتمل" : "Done"} ({metrics.completed})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("failed")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                  filterStatus === "failed"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isAr ? "مرفوض" : "Failed"} ({metrics.failed})
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label={isAr ? "ترتيب الطلبات" : "Sort orders"}
              className="dark:bg-background border dark:border-white/10 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
            >
              <option value="newest">{isAr ? "الأحدث أولاً" : "Newest first"}</option>
              <option value="oldest">{isAr ? "الأقدم أولاً" : "Oldest first"}</option>
              <option value="highest_price">{isAr ? "الأعلى سعراً" : "Highest price"}</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchCustomerOrders}
              disabled={loadingOrders}
              aria-label={isAr ? "تحديث قائمة الطلبات" : "Refresh orders"}
              className="px-3 py-2 rounded-xl dark:bg-background border dark:border-white/10  dark:hover:bg-surface-container-high dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-sm text-blue-600 dark:text-blue-400 ${
                  loadingOrders ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              <span>{isAr ? "تحديث" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ORDERS DISPLAY */}
        {loadingOrders ? (
          <div className="p-16 text-center text-blue-600 dark:text-blue-400 space-y-2">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            <p className="text-xs font-bold dark:text-slate-300">
              {isAr ? "جاري جلب سجل الطلبات..." : "Loading order history..."}
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">shopping_bag</span>
            <p className="font-bold text-sm dark:text-white">
              {isAr ? "لا توجد طلبات مطابقة" : "No orders found"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || filterStatus !== "all"
                ? isAr
                  ? "لم يتم العثور على أي طلب يطابق معايير البحث والفلترة."
                  : "No orders match your query."
                : isAr
                ? "عند إرسال أي خدمة جديدة، ستظهر وتُحدث حالتها هنا تلقائياً."
                : "Your submitted orders will appear here automatically."}
            </p>
            <Link
              href={`/${lang}/pricing`}
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{isAr ? "طلب خدمة جديدة الآن" : "Order a Service Now"}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border dark:border-white/10 dark:bg-surface-container">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b dark:border-white/10 dark:bg-background text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <th className="p-3.5 text-start">{isAr ? "رقم الطلب" : "Order ID"}</th>
                    <th className="p-3.5 text-start">{isAr ? "اسم الخدمة" : "Service Name"}</th>
                    <th className="p-3.5 text-start">{isAr ? "رقم الجهاز / البيانات" : "Target / IMEI"}</th>
                    <th className="p-3.5 text-start">{isAr ? "النتيجة وكود الفك" : "Result / Code"}</th>
                    <th className="p-3.5 text-start">{isAr ? "الكمية والسعر" : "Qty & Cost"}</th>
                    <th className="p-3.5 text-center">{isAr ? "الحالة" : "Status"}</th>
                    <th className="p-3.5 text-end">{isAr ? "التاريخ" : "Date"}</th>
                    <th className="p-3.5 text-center">{isAr ? "عرض" : "View"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                  {filteredOrders.map((ord) => {
                    const isCompleted = ord.status === "completed";
                    const isProcessing = ord.status === "processing" || ord.status === "pending" || ord.status === "dispatching";
                    const isFailed = ord.status === "failed" || ord.status === "rejected";
                    const rawReply = cleanHtmlToText(ord.reply || "");

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-surface-container-high/80 dark:hover:bg-surface-container-high/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        {/* ID */}
                        <td className="p-3.5 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(ord.id, isAr ? "رقم الطلب" : "Order ID");
                            }}
                            className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                            title={isAr ? "نسخ معرف الطلب" : "Copy ID"}
                          >
                            <span>#{ord.id.slice(-6).toUpperCase()}</span>
                            <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-blue-600">
                              content_copy
                            </span>
                          </button>
                        </td>

                        {/* Service Name */}
                        <td className="p-3.5 font-bold dark:text-white text-start max-w-xs">
                          <div className="flex flex-col">
                            <span className="truncate">{ord.serviceName}</span>
                            {ord.notes && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">
                                {ord.notes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Target Input */}
                        <td className="p-3.5 text-start font-mono dark:text-white">
                          {ord.targetInput ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(ord.targetInput!, isAr ? "رقم الجهاز" : "Target Input");
                              }}
                              className="dark:bg-background px-2.5 py-1 rounded-lg border dark:border-white/10 font-bold text-[11px] dark:text-slate-200 inline-flex items-center gap-1 max-w-[180px] truncate cursor-pointer hover:bg-slate-200 dark:hover:bg-surface-container-high transition-colors"
                              title={isAr ? "اضغط للنسخ" : "Click to copy"}
                            >
                              <span className="truncate">{ord.targetInput}</span>
                              <span className="material-symbols-outlined text-xs text-slate-400">
                                content_copy
                              </span>
                            </button>
                          ) : (
                            <span className="text-slate-400 font-sans">N/A</span>
                          )}
                        </td>

                        {/* Result Reply */}
                        <td className="p-3.5 text-start font-mono text-xs">
                          {rawReply ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg text-xs truncate max-w-[200px] select-all">
                                {rawReply}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(rawReply, isAr ? "كود التفعيل" : "Unlock Code");
                                }}
                                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                title={isAr ? "نسخ النتيجة" : "Copy result"}
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                            </div>
                          ) : isCompleted ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                              {isAr ? "تم التفعيل بنجاح" : "Done / Unlocked"}
                            </span>
                          ) : isProcessing ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] animate-pulse">
                              {isAr ? "جاري انتظار الكود..." : "Processing..."}
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                              {isAr ? "تعذر التنفيذ / مرفوض" : "Rejected"}
                            </span>
                          )}
                        </td>

                        {/* Price & Qty */}
                        <td className="p-3.5 text-start">
                          <div className="flex flex-col">
                            <span className="font-bold dark:text-white font-mono">
                              ${parseFloat(String(ord.price || 0)).toFixed(2)} USD
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                              {isAr ? `الكمية: ${ord.quantity || 1}` : `Qty: ${ord.quantity || 1}`}
                            </span>
                          </div>
                        </td>

                        {/* Status Chip */}
                        <td className="p-3.5 text-center">
                          {isCompleted && (
                            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>{isAr ? "مكتمل" : "Completed"}</span>
                            </span>
                          )}
                          {isProcessing && (
                            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 font-bold text-[11px] inline-flex items-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              <span>{isAr ? "قيد الانتظار" : "Pending"}</span>
                            </span>
                          )}
                          {isFailed && (
                            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>{isAr ? "مرفوض" : "Failed"}</span>
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-end text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        {/* Action */}
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(ord);
                            }}
                            className="p-1.5 rounded-lg dark:bg-background hover:bg-slate-200 dark:hover:bg-surface-container-high dark:text-slate-200 transition-colors cursor-pointer"
                            title={isAr ? "عرض التفاصيل" : "View details"}
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE & TABLET CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3.5">
              {filteredOrders.map((ord) => {
                const isCompleted = ord.status === "completed";
                const isProcessing = ord.status === "processing" || ord.status === "pending" || ord.status === "dispatching";
                const isFailed = ord.status === "failed" || ord.status === "rejected";
                const rawReply = cleanHtmlToText(ord.reply || "");

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="p-4 rounded-xl border dark:border-white/10 dark:bg-surface-container hover:bg-slate-50/70 dark:hover:bg-surface-container-high/70 dark:hover:bg-surface-container-high/40 transition-all space-y-3 shadow-xs cursor-pointer"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(ord.id, isAr ? "رقم الطلب" : "Order ID");
                        }}
                        className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"
                      >
                        <span>#{ord.id.slice(-6).toUpperCase()}</span>
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                      </button>

                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{isAr ? "مكتمل" : "Completed"}</span>
                        </span>
                      )}
                      {isProcessing && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold inline-flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          <span>{isAr ? "قيد الانتظار" : "Pending"}</span>
                        </span>
                      )}
                      {isFailed && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-[10px] font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>{isAr ? "مرفوض" : "Failed"}</span>
                        </span>
                      )}
                    </div>

                    {/* Service Name */}
                    <div>
                      <h4 className="text-sm font-bold dark:text-white leading-snug">{ord.serviceName}</h4>
                      {ord.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{ord.notes}</p>
                      )}
                    </div>

                    {/* Target Input */}
                    {ord.targetInput && (
                      <div className="p-2 rounded-lg dark:bg-background border dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                          {isAr ? "البيانات / IMEI:" : "Target:"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(ord.targetInput!, isAr ? "رقم الجهاز" : "Target Input");
                          }}
                          className="font-mono dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="truncate max-w-[170px]">{ord.targetInput}</span>
                          <span className="material-symbols-outlined text-xs text-slate-400">
                            content_copy
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Code Result */}
                    {rawReply && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                            {isAr ? "كود التفعيل / النتيجة:" : "Result Code:"}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate block">
                            {rawReply}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(rawReply, isAr ? "كود التفعيل" : "Unlock Code");
                          }}
                          className="p-1 rounded dark:bg-background text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-surface-container-high transition-colors shrink-0 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    )}

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-2 border-t dark:border-white/10 text-xs">
                      <span className="font-mono font-bold dark:text-white">
                        ${parseFloat(String(ord.price || 0)).toFixed(2)} USD
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FULL DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="w-full max-w-xl rounded-2xl border dark:border-white/10 dark:bg-surface-container p-6 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3.5 border-b dark:border-white/10">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  {isAr ? "تفاصيل الطلب الكاملة" : "Order Details"}
                </span>
                <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 font-mono">
                  <span>#{selectedOrder.id}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl dark:bg-background hover:bg-slate-200 dark:hover:bg-surface-container-high text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl dark:bg-background border dark:border-white/10 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{isAr ? "اسم الخدمة" : "Service"}</span>
                <p className="font-bold dark:text-white text-sm">{selectedOrder.serviceName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl dark:bg-background border dark:border-white/10 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{isAr ? "الحالة" : "Status"}</span>
                  <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400 uppercase">
                    {selectedOrder.status}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl dark:bg-background border dark:border-white/10 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{isAr ? "التكلفة" : "Cost"}</span>
                  <p className="font-bold text-sm dark:text-white font-mono">
                    ${parseFloat(String(selectedOrder.price || 0)).toFixed(2)} USD
                  </p>
                </div>
              </div>

              {selectedOrder.targetInput && (
                <div className="p-3.5 rounded-xl dark:bg-background border dark:border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isAr ? "البيانات المدخلة / IMEI" : "Target / IMEI"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(selectedOrder.targetInput!, isAr ? "البيانات" : "Target")
                      }
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      <span>{isAr ? "نسخ" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="font-mono font-bold dark:text-white text-sm select-all">
                    {selectedOrder.targetInput}
                  </p>
                </div>
              )}

              {selectedOrder.reply && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold text-[11px] uppercase">
                      {isAr ? "النتيجة وكود الفك المستخرج:" : "Unlock Result / Code:"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          cleanHtmlToText(selectedOrder.reply!),
                          isAr ? "كود التفعيل" : "Unlock Code"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      <span>{isAr ? "نسخ الكود" : "Copy Code"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-lg dark:bg-background border border-emerald-200 dark:border-emerald-800/40 font-mono text-emerald-900 dark:text-emerald-200 text-xs whitespace-pre-wrap select-all font-bold">
                    {cleanHtmlToText(selectedOrder.reply)}
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="p-3.5 rounded-xl dark:bg-background border dark:border-white/10 space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">{isAr ? "ملاحظات" : "Notes"}</span>
                  <p className="dark:text-slate-300">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="p-3 rounded-xl dark:bg-background border dark:border-white/10 flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                <span>{isAr ? "تاريخ الطلب:" : "Created At:"}</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString(isAr ? "ar-EG" : "en-US")}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl dark:bg-background hover:bg-slate-200 dark:hover:bg-surface-container-high dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
