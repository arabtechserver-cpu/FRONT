"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrderFieldRows, getOrderServiceTypeLabel } from "@/lib/order-details";
import { cleanHtmlToText } from "@/utils/cleanHtml";

export default function AnalyticsClient() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Detail Modals State for KPI Cards
  const [activeModal, setActiveModal] = useState<"services" | "visitors" | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  // Provider Orders Report State
  const [providerOrders, setProviderOrders] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [datePeriod, setDatePeriod] = useState("30"); // "today", "yesterday", "7", "30", "90", "all", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editedTargetInput, setEditedTargetInput] = useState("");
  const [isSavingFields, setIsSavingFields] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  useEffect(() => {
    fetchProviderOrders();
  }, [statusFilter, selectedService, datePeriod, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;
      const res = await fetch(`/api/analytics/summary?days=${days}`, {
        headers: {
          "Cache-Control": "no-cache",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (selectedService !== "ALL") params.append("serviceName", selectedService);
      if (orderSearch.trim()) params.append("search", orderSearch.trim());

      const now = new Date();
      if (datePeriod === "today") {
        const todayStr = now.toISOString().slice(0, 10);
        params.append("startDate", todayStr);
        params.append("endDate", todayStr);
      } else if (datePeriod === "yesterday") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().slice(0, 10);
        params.append("startDate", yStr);
        params.append("endDate", yStr);
      } else if (datePeriod === "7") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "30") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "90") {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "custom") {
        if (customStartDate) params.append("startDate", customStartDate);
        if (customEndDate) params.append("endDate", customEndDate);
      }

      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;
      const res = await fetch(`/api/analytics/provider-orders?${params.toString()}`, {
        headers: {
          "Cache-Control": "no-cache",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setProviderOrders(result.data.orders || []);
        setServicesList(result.data.servicesList || []);
        setOrderSummary(result.data.summary || null);
      }
    } catch (err) {
      console.error("Failed to fetch provider orders report:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviderOrders();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extractCleanTarget = (targetInput: string) => {
    if (!targetInput) return "—";
    const imeiMatch = targetInput.match(/(?:custom_)?imei[:\s]+([0-9]{10,18})/i);
    if (imeiMatch) return imeiMatch[1];
    if (targetInput.includes("|")) {
      const parts = targetInput.split("|").map((p) => p.trim());
      const imeiPart = parts.find((p) => /imei/i.test(p));
      if (imeiPart) return imeiPart.replace(/^[^:]+:\s*/, "");
      return parts[0];
    }
    return targetInput;
  };

  const handleSaveEditedFields = async () => {
    if (!selectedOrderDetails) return;
    setIsSavingFields(true);
    try {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;

      const res = await fetch("/api/orders/update-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({
          orderId: selectedOrderDetails.id,
          targetInput: editedTargetInput
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedOrderDetails((prev: any) => prev ? { ...prev, targetInput: editedTargetInput } : null);
        setProviderOrders((prev) =>
          prev.map((ord) => ord.id === selectedOrderDetails.id ? { ...ord, targetInput: editedTargetInput } : ord)
        );
        setIsEditingFields(false);
        setModalFeedback("تم حفظ وتحديث بيانات الحقول بنجاح");
        setTimeout(() => setModalFeedback(null), 3000);
      } else {
        alert(json.error || "تعذر حفظ التعديلات");
      }
    } catch (err: any) {
      alert("خطأ أثناء حفظ التعديل: " + (err.message || "حدث خطأ غير متوقع"));
    } finally {
      setIsSavingFields(false);
    }
  };

  function formatDhruDate(dateStr?: string | null): string {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hh = String(hours).padStart(2, "0");
      return `${mm}/${dd}/${yyyy} ${hh}:${minutes}${ampm}`;
    } catch {
      return "-";
    }
  }

  function calculateDurationString(startStr?: string | null, endStr?: string | null): string {
    if (!startStr) return "-";
    try {
      const start = new Date(startStr).getTime();
      const end = endStr ? new Date(endStr).getTime() : Date.now();
      if (isNaN(start) || isNaN(end) || end < start) return "-";
      const diffMs = end - start;
      const diffSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      if (hours > 0) {
        return `${hours} Hr ${minutes} Min`;
      }
      if (minutes > 0) {
        return `${minutes} Min ${seconds} Sec`;
      }
      return `${seconds} Sec`;
    } catch {
      return "-";
    }
  }

  if (isLoading && !data) {
    return (
      <div className="p-12 flex justify-center items-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            إحصائيات النظام وتقارير العمليات
          </h1>
          <p className="text-on-surface-variant text-sm">
            متابعة شاملة لأداء الزوار والطلبات وتقارير المزودين التفصيلية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              fetchAnalytics();
              fetchProviderOrders();
            }}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>تحديث البيانات</span>
          </button>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="p-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوماً</option>
            <option value={90}>آخر 90 يوماً</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي الزوار الفريدين"
            value={data.uniqueSessions}
            icon="group"
            color="sky"
            actionText="عرض سجل الزوار والجلسات"
            onClick={() => {
              setModalSearch("");
              setActiveModal("visitors");
            }}
          />
          <StatCard
            title="العملاء المسجلين"
            value={data.totalUsers}
            icon="person_add"
            color="emerald"
            actionText="إدارة وعرض قائمة العملاء"
            onClick={() => router.push("/admin/users")}
          />
          <StatCard
            title="الطلبات المكتملة والمحتملة"
            value={data.totalOrders}
            icon="shopping_cart"
            color="amber"
            actionText="إدارة وعرض جميع الطلبات"
            onClick={() => router.push("/admin/orders")}
          />
          <StatCard
            title="زيارات الخدمات"
            value={data.counts.service_view || 0}
            icon="visibility"
            color="fuchsia"
            actionText="عرض من زار وماذا زار"
            onClick={() => {
              setModalSearch("");
              setActiveModal("services");
            }}
          />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW SECTION: Provider Orders Detailed Report (Matching User Image) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span>سجل طلبات المزودين المنفذة خلال المدة المحددة</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                تصفح ومتابعة كافة الطلبات المرسلة للمزود مع رقم المرجع (#ID) وحالة الإنجاز والـ IMEI
              </p>
            </div>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "today", label: "اليوم" },
              { id: "yesterday", label: "أمس" },
              { id: "7", label: "آخر 7 أيام" },
              { id: "30", label: "آخر 30 يوماً" },
              { id: "all", label: "كل الأوقات" },
              { id: "custom", label: "مخصص" }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  datePeriod === p.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Row (Visible if custom selected) */}
        {datePeriod === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 text-xs">
            <span className="font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
              <span>تحديد النطاق الزمني:</span>
            </span>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">من:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">إلى:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
              />
            </div>
            <button
              type="button"
              onClick={fetchProviderOrders}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold shadow-sm"
            >
              تطبيق التاريخ
            </button>
          </div>
        )}

        {/* Filter Controls Row (Exact design as shown in user's image) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* #ID Search Box */}
          <div className="sm:col-span-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="#ID / رقم المرجع / IMEI"
                className="w-full py-2.5 px-3.5 pr-9 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-base">search</span>
              </button>
            </form>
          </div>

          {/* Status Dropdown Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="ALL">ALL (جميع الحالات)</option>
              <option value="completed">Success (المكتملة بنجاح)</option>
              <option value="processing">In Process (قيد المعالجة)</option>
              <option value="failed">Rejected (المرفوضة)</option>
            </select>
          </div>

          {/* Service Dropdown Filter */}
          <div className="sm:col-span-6">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-bold truncate focus:outline-none focus:border-primary"
            >
              <option value="ALL">ALL Services (جميع خدمات المزودين)</option>
              {servicesList.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Indicators Strip */}
        {orderSummary && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-high/30 border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="material-symbols-outlined text-sm text-primary">data_thresholding</span>
                <span>العدد الإجمالي:</span>
                <span className="font-mono text-primary font-extrabold">{orderSummary.total}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                <span>المكتمل بنجاح:</span>
                <span className="font-mono font-extrabold">{orderSummary.completedCount}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>قيد المعالجة:</span>
                <span className="font-mono font-extrabold">{orderSummary.processingCount}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>المرفوض:</span>
                <span className="font-mono font-extrabold">{orderSummary.failedCount}</span>
              </span>
            </div>

            <div className="text-on-surface-variant font-bold">
              <span>إجمالي القيمة: </span>
              <span className="font-mono text-violet-400 font-extrabold">
                ${orderSummary.totalVolume.toFixed(2)} USD
              </span>
            </div>
          </div>
        )}

        {/* ── The Table Matching Exactly the Screenshot ── */}
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-surface-container-high/70 text-on-surface-variant text-xs border-b border-outline-variant/30 uppercase tracking-wider font-bold">
                <th className="p-3.5 text-start font-bold w-24">#ID</th>
                <th className="p-3.5 text-start font-bold w-28">الحالة (Status)</th>
                <th className="p-3.5 text-start font-bold">اسم الخدمة (Service Name)</th>
                <th className="p-3.5 text-start font-bold w-48">البيانات / IMEI</th>
                <th className="p-3.5 text-start font-bold w-36">التاريخ والوقت</th>
                <th className="p-3.5 text-start font-bold w-24">السعر</th>
                <th className="p-3.5 text-center font-bold w-24">تفاصيل</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/15 text-xs">
              {loadingOrders ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري جلب سجل طلبات المزود...</span>
                    </div>
                  </td>
                </tr>
              ) : providerOrders.length > 0 ? (
                providerOrders.map((order) => {
                  const displayId = order.apiOrderId || `#${order.id.slice(-6)}`;
                  const cleanTarget = extractCleanTarget(order.targetInput);
                  const isCompleted = order.status === "completed";
                  const isProcessing = order.status === "processing";
                  const isFailed = order.status === "failed" || order.status === "rejected";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-high/30 transition-colors"
                    >
                      {/* #ID Column */}
                      <td className="p-3.5 font-mono text-on-surface font-bold">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(displayId, order.id)}
                          className="hover:text-primary transition-colors flex items-center gap-1 group"
                          title="اضغط لنسخ الرقم المرجعي"
                        >
                          <span>{displayId}</span>
                          <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedId === order.id ? "check" : "content_copy"}
                          </span>
                        </button>
                      </td>

                      {/* Status Column (Green Success Badge like in image) */}
                      <td className="p-3.5">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#28a745] text-white shadow-sm">
                            <span>Success</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-500 text-white shadow-sm">
                            <span>In Process</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-600 text-white shadow-sm">
                            <span>Rejected</span>
                          </span>
                        )}
                        {!isCompleted && !isProcessing && !isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                            <span>{order.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Service Name with Verified Checkmark */}
                      <td className="p-3.5 font-bold text-on-surface max-w-md">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{order.serviceName}</span>
                          <span className="text-violet-400 text-xs inline-flex items-center" title="خدمة مزود معتمدة">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                          </span>
                        </div>
                      </td>

                      {/* Target / IMEI */}
                      <td className="p-3.5 font-mono text-xs text-on-surface-variant font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[160px]">{cleanTarget}</span>
                          {cleanTarget !== "—" && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(cleanTarget, `target-${order.id}`)}
                              className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
                              title="نسخ الـ IMEI"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedId === `target-${order.id}` ? "check" : "content_copy"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString("ar-EG", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-mono text-xs font-bold text-primary whitespace-nowrap">
                        ${order.price.toFixed(2)}
                      </td>

                      {/* View Details Action */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all mx-auto"
                          title="عرض تفاصيل الطلب الكاملة"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-on-surface-variant">
                    لا توجد طلبات مطابقة للفترة أو الفلاتر المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts & Trends Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="text-xl font-bold mb-4">الخدمات الأكثر زيارة (Top 5)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                    <th className="p-4 text-start font-bold">اسم الخدمة</th>
                    <th className="p-4 text-start font-bold">عدد الزيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {data.topServices &&
                    data.topServices.map((service: any) => (
                      <tr key={service.id} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-bold text-on-surface">{service.name}</td>
                        <td className="p-4 font-mono text-primary font-bold">{service.views}</td>
                      </tr>
                    ))}
                  {(!data.topServices || data.topServices.length === 0) && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-on-surface-variant">
                        لا توجد بيانات كافية لعرضها.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="text-xl font-bold mb-4">التقرير اليومي للزيارات</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                    <th className="p-4 text-start font-bold">التاريخ</th>
                    <th className="p-4 text-start font-bold">تصفح الصفحات</th>
                    <th className="p-4 text-start font-bold">مشاهدة الخدمات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {data.daily && data.daily.length > 0 ? (
                    data.daily.map((dayData: any) => (
                      <tr key={dayData.day} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-mono text-on-surface">
                          {new Date(dayData.day).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-4 font-mono text-sky-400 font-bold">
                          {dayData.page_view || 0}
                        </td>
                        <td className="p-4 font-mono text-fuchsia-400 font-bold">
                          {dayData.service_view || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-on-surface-variant">
                        لا توجد نشاطات مسجلة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal - Full Dhru Fusion Layout */}
      {selectedOrderDetails && (() => {
        const order = selectedOrderDetails;
        const dispatchEvent = order.events?.find(
          (ev: any) => ev.action?.includes("إرسال") || ev.title?.includes("إرسال") || ev.title?.includes("المزود")
        );
        const acceptedDuration = dispatchEvent
          ? calculateDurationString(order.createdAt, dispatchEvent.time)
          : order.apiOrderId
          ? calculateDurationString(order.createdAt, order.updatedAt || order.createdAt)
          : "-";

        const completedEvent = order.events?.find(
          (ev: any) => ev.action?.includes("مكتمل") || ev.title?.includes("مكتمل") || ev.title?.includes("إكمال")
        );
        const repliedTime = completedEvent?.time || (order.status === "completed" ? order.updatedAt : null);
        const replyDuration = repliedTime
          ? calculateDurationString(order.createdAt, repliedTime)
          : null;



        const fieldRows = getOrderFieldRows(order);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="bg-surface-container text-on-surface w-full max-w-2xl rounded-2xl sm:rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh]">
              {/* Top Navigation Bar - Exactly like screenshot */}
              <div className="flex items-center justify-between px-4 py-3 border-b hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold select-none cursor-default">
                    •••
                  </span>
                  <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
                </div>

                {/* Center / Right: Group Name + Circular Icon + Arrow */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base">
                    {order.groupName || "EFT Dongle"}
                  </span>
                  <div className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs">
                    <span className="material-symbols-outlined text-sm text-blue-600">dns</span>
                  </div>
                  <span className="text-slate-400 font-bold text-sm">›</span>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderDetails(null);
                    setIsEditingFields(false);
                    setModalFeedback(null);
                  }}
                  className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-colors"
                  title="إغلاق"
                >
                  ✕
                </button>
              </div>

              {/* Service Header Info Bar */}
              <div className="px-5 py-3 border-b bg-slate-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm leading-snug flex items-center gap-1.5 flex-wrap">
                      <span>{order.serviceName}</span>
                      <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">settings</span>
                        <span>تفاصيل ومحددات خدمة المزود</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Ref: #{order.id?.slice(-6) || "—"}</span>
                      {order.apiOrderId && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-bold font-mono">API #{order.apiOrderId}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{getOrderServiceTypeLabel(order.serviceType)}</span>
                    </div>
                  </div>

                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    order.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : order.status === "processing"
                      ? "bg-sky-50 text-sky-700 border-sky-300"
                      : order.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}>
                    {order.status === "completed"
                      ? "Success / Completed"
                      : order.status === "processing"
                      ? "In Process"
                      : order.status === "pending"
                      ? "Pending"
                      : "Rejected"}
                  </span>
                </div>
              </div>

              {/* Toast Feedback in Modal */}
              {modalFeedback && (
                <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-emerald-800 text-xs font-bold text-center animate-in fade-in">
                  {modalFeedback}
                </div>
              )}

              {/* Modal Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-xs hover:bg-slate-50">
                {/* Main Dhru Fusion Key-Value Table */}
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {/* Service Credit */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Service Credit</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      {order.quantity || 1} Credit
                    </span>
                  </div>

                  {/* Service API Price */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Service API Price</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      {order.cost ? `$${order.cost.toFixed(2)} USD` : "—"}
                    </span>
                  </div>

                  {/* User Cost */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">User Cost</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      ${(order.price || 0).toFixed(2)} USD
                    </span>
                  </div>

                  {/* Total Paid (Mint-Green Solid Badge matching screenshot) */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Total Paid</span>
                    <div className="flex-1 text-left">
                      <span className="inline-block bg-[#d4f8e8] text-[#0f766e] px-4 py-1 rounded font-mono font-bold text-xs sm:text-sm tracking-wide">
                        ${(order.price || 0).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Profit Margin */}
                  {order.cost !== undefined && order.cost !== null && order.cost > 0 && (
                    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors bg-purple-50/40">
                      <span className="text-purple-700 font-medium w-36 sm:w-44 text-left">صافي الربح التقديري</span>
                      <span className="font-mono font-bold text-purple-700 text-left flex-1">
                        +${Math.max(0, (order.price || 0) - order.cost).toFixed(2)} USD
                      </span>
                    </div>
                  )}

                  {/* API, API Order ID, Client */}
                  <div className="py-2.5 px-3 bg-slate-50/40">
                    <div className="w-full divide-y divide-slate-100">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">API</span>
                        <span className="font-bold text-left flex-1">
                          {order.provider?.name || "EA Unlocker"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">API Order ID</span>
                        <span className="font-mono font-bold text-left flex-1">
                          {order.apiOrderId ? `#${order.apiOrderId}` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Client</span>
                        <span className="font-semibold text-left flex-1">
                          {order.user?.fullName || order.user?.username || order.user?.email || "Client"}
                        </span>
                      </div>
                      {order.user?.email && (
                        <div className="flex items-center justify-between py-1.5">
                          <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Client Email</span>
                          <span className="text-slate-600 font-mono text-left flex-1 text-[11px]">
                            {order.user.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order On */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Order On</span>
                    <span className="font-mono font-medium text-left flex-1">
                      {formatDhruDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Accepted After */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Accepted After</span>
                    <span className="font-mono font-medium text-left flex-1">
                      {acceptedDuration} []
                    </span>
                  </div>

                  {/* Replied On (With Red Pill Badge After X Hr Y Min by) */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Replied On</span>
                    <div className="font-mono text-left flex-1 flex items-center flex-wrap gap-1.5">
                      {order.status === "completed" && repliedTime ? (
                        <>
                          <span>{formatDhruDate(repliedTime)}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-red-600 border-2 border-red-500 bg-red-50/60">
                            After {replyDuration || "0 Min"}
                          </span>
                          <span className="text-slate-500 font-sans text-xs">
                            by {order.provider?.name || "EA Unlocker"}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500">
                          {order.status === "processing" ? `In Process (${calculateDurationString(order.createdAt)})` : "—"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order From IP */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Order From IP</span>
                    <span className="text-slate-600 font-mono text-left flex-1">
                      {order.clientIp || "156.204.12.88 (Web)"}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Source</span>
                    <span className="font-semibold text-left flex-1">
                      {order.source === "api" ? "API" : "Web"}
                    </span>
                  </div>
                </div>

                {/* Fields Box (Matching Screenshot Exactly) */}
                <div className="border rounded-lg overflow-hidden mt-4 shadow-sm">
                  {/* Header */}
                  <div className="bg-[#f8f9fa] px-4 py-2.5 text-xs font-bold border-b ">
                    Fields
                  </div>

                  {/* Field Rows */}
                  <div className="divide-y divide-slate-100">
                    {fieldRows.length > 0 ? (
                      fieldRows.map((field: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                          <span className="font-bold uppercase text-xs w-36 sm:w-44">
                            {field.label || field.id}
                          </span>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-mono font-bold text-sm tracking-wider break-all text-left dir-ltr">
                              {field.value || "—"}
                            </span>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(field.value);
                                  setModalFeedback(`تم نسخ ${field.label || field.id} بنجاح`);
                                  setTimeout(() => setModalFeedback(null), 2000);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="نسخ"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                        <span className="font-bold uppercase text-xs w-36 sm:w-44">
                          IMEI
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-mono font-bold text-sm tracking-wider break-all text-left dir-ltr">
                            {order.targetInput || "—"}
                          </span>
                          {order.targetInput && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(order.targetInput);
                                setModalFeedback("تم نسخ القيمة بنجاح");
                                setTimeout(() => setModalFeedback(null), 2000);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="نسخ"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Fields Row */}
                  <div className="bg-[#f8f9fa] px-4 py-2 border-t ">
                    {isEditingFields ? (
                      <div className="space-y-2 py-2">
                        <label className="block text-xs font-bold ">تعديل بيانات الحقول:</label>
                        <input
                          type="text"
                          value={editedTargetInput}
                          onChange={(e) => setEditedTargetInput(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-500 rounded-lg font-mono text-xs outline-none shadow-sm"
                          placeholder="أدخل القيمة الجديدة"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            disabled={isSavingFields}
                            onClick={handleSaveEditedFields}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-blue-700 transition-colors"
                          >
                            {isSavingFields ? "جاري الحفظ..." : "حفظ التعديل"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingFields(false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditedTargetInput(order.targetInput || "");
                          setIsEditingFields(true);
                        }}
                        className="text-xs font-medium hover:text-blue-600 flex items-center gap-1.5 py-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Edit Fields</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Code / Received Reply Card */}
                {order.reply && (
                  <div className="rounded-xl border border-violet-200 overflow-hidden bg-violet-50/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">key</span>
                        <span>الكود أو النتيجة المستلمة (Reply / Code):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(order.reply || "");
                          setModalFeedback("تم نسخ الكود المستلم بنجاح!");
                          setTimeout(() => setModalFeedback(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-bold text-[10px] hover:bg-violet-700 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>نسخ الكود</span>
                      </button>
                    </div>
                    <p className="font-mono font-bold p-3 rounded-lg border border-violet-200 whitespace-pre-wrap dir-ltr text-start block text-xs select-all">
                      {cleanHtmlToText(order.reply)}
                    </p>
                  </div>
                )}

                {/* Collapsible Event Timeline Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowTimeline(!showTimeline)}
                    className="w-full py-2 px-3 rounded-lg border  hover:bg-slate-100 text-slate-600 flex items-center justify-between text-xs font-bold transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-blue-600">history</span>
                      <span>سجل تتبع دورة حياة الطلب (Audit Timeline)</span>
                    </span>
                    <span className="material-symbols-outlined text-sm transform transition-transform">
                      {showTimeline ? "expand_less" : "expand_more"}
                    </span>
                  </button>

                  {showTimeline && (
                    <div className="mt-2 p-4 rounded-lg border space-y-3 animate-in fade-in">
                      <div className="relative pl-3 space-y-3 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 pr-6 text-xs">
                        <div className="relative">
                          <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
                          <div className="font-bold ">إنشاء الطلب من العميل</div>
                          <div className="text-[11px] text-slate-600">خصم ${(order.price || 0).toFixed(2)} USD من رصيد المحفظة</div>
                          <div className="text-[10px] text-slate-400 font-mono">{formatDhruDate(order.createdAt)}</div>
                        </div>

                        {order.apiOrderId && (
                          <div className="relative">
                            <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-slate-500 ring-4 ring-slate-200"></span>
                            <div className="font-bold ">تم الإرسال للمزود ({order.provider?.name || "المزود"})</div>
                            <div className="text-[11px] text-slate-600">رقم المرجع لدى المزود: #{order.apiOrderId}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{formatDhruDate(order.createdAt)}</div>
                          </div>
                        )}

                        {order.events?.map((ev: any, i: number) => (
                          <div key={i} className="relative">
                            <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-slate-500 ring-4 ring-slate-200"></span>
                            <div className="font-bold ">{ev.title || ev.action}</div>
                            <div className="text-[11px] text-slate-600">{ev.desc}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{formatDhruDate(ev.time)}</div>
                          </div>
                        ))}

                        {order.status === "completed" && (
                          <div className="relative">
                            <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></span>
                            <div className="font-bold text-emerald-700">اكتمل الطلب بنجاح</div>
                            <div className="text-[11px] text-slate-600">تم استلام النتيجة وتسليم الكود للعميل.</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {repliedTime ? formatDhruDate(repliedTime) : "-"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-t hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/admin/orders?search=${encodeURIComponent(order.apiOrderId || order.id)}`);
                    }}
                    className="px-4 py-2 rounded-xl hover:bg-slate-100 border border-slate-300 text-blue-600 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>فتح في صفحة إدارة الطلبات</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderDetails(null);
                    setIsEditingFields(false);
                    setModalFeedback(null);
                  }}
                  className="px-6 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Services Visits Detail Modal */}
      {activeModal === "services" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card bg-surface-container/95 border border-outline-variant/30 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-4 shrink-0 bg-surface-container-high/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-on-surface">سجل زيارات وتصفح الخدمات</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 font-mono font-bold">
                      {data?.counts?.service_view || 0} زيارة
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    تتبع تفصيلي لمن زار كل خدمة (العميل أو معرف الجلسة)، المسار، ونوع الجهاز المستخدم
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalSearch("");
                }}
                className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Top Services Chips Section */}
            {data?.topServices && data.topServices.length > 0 && (
              <div className="px-6 py-3 bg-surface-container-lowest/70 border-b border-outline-variant/15 shrink-0">
                <p className="text-[11px] font-bold text-on-surface-variant mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-fuchsia-400">trending_up</span>
                  <span>الخدمات الأكثر طلباً وزيارة (انقر للفلترة):</span>
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {data.topServices.map((ts: any) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setModalSearch(ts.name)}
                      className="px-3 py-1 rounded-xl bg-surface-container-high/80 hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0"
                    >
                      <span className="font-medium truncate max-w-[200px]">{ts.name}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-300 font-mono font-bold text-[10px]">
                        {ts.views}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Toolbar */}
            <div className="p-4 px-6 border-b border-outline-variant/15 flex items-center gap-3 shrink-0">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="ابحث باسم الخدمة، هوية العميل، الإيميل، أو معرف الجلسة..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-fuchsia-500/50"
                />
              </div>
              {modalSearch && (
                <button
                  type="button"
                  onClick={() => setModalSearch("")}
                  className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface-variant font-medium"
                >
                  إلغاء الفلتر
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(() => {
                const logs = (data?.serviceViewLogs || []).filter((log: any) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase().trim();
                  return (
                    (log.serviceName && log.serviceName.toLowerCase().includes(q)) ||
                    (log.serviceId && log.serviceId.toLowerCase().includes(q)) ||
                    (log.sessionId && log.sessionId.toLowerCase().includes(q)) ||
                    (log.userName && log.userName.toLowerCase().includes(q)) ||
                    (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
                    (log.path && log.path.toLowerCase().includes(q))
                  );
                });

                if (logs.length === 0) {
                  return (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto">
                        <span className="material-symbols-outlined text-3xl">visibility_off</span>
                      </div>
                      <p className="text-sm font-bold text-on-surface">لا توجد زيارات خدمات مسجلة</p>
                      <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                        {modalSearch
                          ? "لم يتم العثور على أي نتائج تطابق معايير البحث الحالية."
                          : "يتم رصد زيارات الخدمات آلياً وتحديثها هنا فور فتح الزوار لأي خدمة في واجهة الشراء."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 text-[11px] font-bold">
                        <tr>
                          <th className="p-3">الخدمة المستهدفة</th>
                          <th className="p-3">هوية الزائر / العميل</th>
                          <th className="p-3">الجهاز والبيئة</th>
                          <th className="p-3">المسار</th>
                          <th className="p-3">وقت الزيارة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest/50">
                        {logs.map((log: any) => {
                          const dev = parseDevice(log.userAgent);
                          const isRegistered = Boolean(log.userName || log.userEmail);
                          return (
                            <tr key={log.id} className="hover:bg-surface-container-high/30 transition-colors">
                              <td className="p-3">
                                <div className="font-bold text-on-surface flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0"></span>
                                  <span className="truncate max-w-[240px]">{log.serviceName}</span>
                                </div>
                                {log.serviceId && (
                                  <span className="text-[10px] text-on-surface-variant font-mono block mt-0.5">
                                    #{log.serviceId}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                {isRegistered ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                      <span className="material-symbols-outlined text-xs">verified_user</span>
                                      <span>{log.userName || log.userEmail}</span>
                                    </span>
                                    {log.userName && log.userEmail && (
                                      <span className="text-[10px] text-on-surface-variant block font-mono">
                                        {log.userEmail}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-outline-variant/20">
                                      <span className="material-symbols-outlined text-xs">person_outline</span>
                                      <span>{log.sessionId.slice(0, 12)}...</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(log.sessionId, log.id)}
                                      className="text-[10px] text-primary hover:underline"
                                    >
                                      {copiedId === log.id ? "تم النسخ" : "نسخ"}
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                  <span className="material-symbols-outlined text-sm">{dev.icon}</span>
                                  <span>{dev.name}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="font-mono text-[11px] text-on-surface-variant dir-ltr text-left block truncate max-w-[180px]">
                                  {log.path}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap text-on-surface-variant font-mono text-[11px]">
                                {formatLogDate(log.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-outline-variant/20 bg-surface-container-high/20 flex items-center justify-between shrink-0">
              <span className="text-xs text-on-surface-variant">
                يتم عرض آخر 100 سجل زيارة مسجلة بالترتيب الزمني الأحدث
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalSearch("");
                }}
                className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visitors Detail Modal */}
      {activeModal === "visitors" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-card bg-surface-container/95 border border-outline-variant/30 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between gap-4 shrink-0 bg-surface-container-high/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-on-surface">سجل الزوار والجلسات الفريدة</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono font-bold">
                      {data?.uniqueSessions || 0} جلسة فريدة
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    تفاصيل الجلسات والزوار الفريدين مع الأجهزة المتصلة والصفحات التي تمت زيارتها
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalSearch("");
                }}
                className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="p-4 px-6 border-b border-outline-variant/15 flex items-center gap-3 shrink-0">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="ابحث برقم الجلسة، هوية العميل، أو المسار..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-sky-500/50"
                />
              </div>
              {modalSearch && (
                <button
                  type="button"
                  onClick={() => setModalSearch("")}
                  className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs text-on-surface-variant font-medium"
                >
                  إلغاء الفلتر
                </button>
              )}
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(() => {
                const logs = (data?.visitorLogs || []).filter((log: any) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase().trim();
                  return (
                    (log.sessionId && log.sessionId.toLowerCase().includes(q)) ||
                    (log.userName && log.userName.toLowerCase().includes(q)) ||
                    (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
                    (log.path && log.path.toLowerCase().includes(q))
                  );
                });

                if (logs.length === 0) {
                  return (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant mx-auto">
                        <span className="material-symbols-outlined text-3xl">person_off</span>
                      </div>
                      <p className="text-sm font-bold text-on-surface">لا توجد جلسات مسجلة</p>
                      <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                        لم يتم العثور على أي جلسات زوار مطابقة لمعايير البحث الحالية.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 text-[11px] font-bold">
                        <tr>
                          <th className="p-3">معرف الجلسة / الزائر</th>
                          <th className="p-3">الصفحة / المسار</th>
                          <th className="p-3">الجهاز والبيئة</th>
                          <th className="p-3">توقيت الجلسة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest/50">
                        {logs.map((log: any) => {
                          const dev = parseDevice(log.userAgent);
                          const isRegistered = Boolean(log.userName || log.userEmail);
                          return (
                            <tr key={log.id} className="hover:bg-surface-container-high/30 transition-colors">
                              <td className="p-3">
                                {isRegistered ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                      <span className="material-symbols-outlined text-xs">verified_user</span>
                                      <span>{log.userName || log.userEmail}</span>
                                    </span>
                                    {log.userName && log.userEmail && (
                                      <span className="text-[10px] text-on-surface-variant block font-mono">
                                        {log.userEmail}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-outline-variant/20">
                                      <span className="material-symbols-outlined text-xs">person_outline</span>
                                      <span>{log.sessionId}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(log.sessionId, log.id)}
                                      className="text-[10px] text-primary hover:underline"
                                    >
                                      {copiedId === log.id ? "تم النسخ" : "نسخ"}
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="font-mono text-[11px] text-on-surface-variant dir-ltr text-left block truncate max-w-[240px]">
                                  {log.path}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                  <span className="material-symbols-outlined text-sm">{dev.icon}</span>
                                  <span>{dev.name}</span>
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap text-on-surface-variant font-mono text-[11px]">
                                {formatLogDate(log.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-outline-variant/20 bg-surface-container-high/20 flex items-center justify-between shrink-0">
              <span className="text-xs text-on-surface-variant">
                يتم عرض أحدث 100 جلسة فريدة مسجلة
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalSearch("");
                }}
                className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseDevice(ua?: string | null) {
  if (!ua) return { name: "غير محدد", icon: "devices" };
  if (/iphone/i.test(ua)) return { name: "iPhone / iOS", icon: "phone_iphone" };
  if (/ipad/i.test(ua)) return { name: "iPad / iOS", icon: "tablet_mac" };
  if (/android/i.test(ua)) return { name: "هاتف Android", icon: "phone_android" };
  if (/windows/i.test(ua)) return { name: "كمبيوتر Windows", icon: "laptop_windows" };
  if (/macintosh|mac os/i.test(ua)) return { name: "كمبيوتر Mac", icon: "laptop_mac" };
  if (/linux/i.test(ua)) return { name: "نظام Linux", icon: "terminal" };
  return { name: "متصفح ويب", icon: "language" };
}

function formatLogDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

function StatCard({
  title,
  value,
  icon,
  color,
  actionText,
  onClick
}: {
  title: string;
  value: number;
  icon: string;
  color: "sky" | "emerald" | "amber" | "fuchsia";
  actionText: string;
  onClick: () => void;
}) {
  const colorMap = {
    sky: {
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      text1: "text-sky-300",
      text2: "text-sky-400",
      hover: "hover:border-sky-500/60 hover:bg-sky-500/15"
    },
    emerald: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text1: "text-violet-300",
      text2: "text-violet-400",
      hover: "hover:border-violet-500/60 hover:bg-violet-500/15"
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text1: "text-amber-300",
      text2: "text-amber-400",
      hover: "hover:border-amber-500/60 hover:bg-amber-500/15"
    },
    fuchsia: {
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/30",
      text1: "text-fuchsia-300",
      text2: "text-fuchsia-400",
      hover: "hover:border-fuchsia-500/60 hover:bg-fuchsia-500/15"
    }
  };
  const c = colorMap[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-start w-full p-6 rounded-3xl ${c.bg} border ${c.border} ${c.hover} flex items-center justify-between transition-all transform hover:-translate-y-1 active:scale-[0.99] cursor-pointer group shadow-lg focus:outline-none`}
    >
      <div className="space-y-1">
        <p className={`text-sm font-bold ${c.text1}`}>{title}</p>
        <p className={`text-3xl font-bold ${c.text2} font-mono mt-2`}>{value}</p>
        <p className="text-[11px] text-on-surface-variant group-hover:text-on-surface flex items-center gap-1 mt-1 transition-colors">
          <span>{actionText}</span>
          <span className="material-symbols-outlined text-xs transform group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
        </p>
      </div>
      <span className={`material-symbols-outlined ${c.text2} text-4xl group-hover:scale-110 transition-transform`}>
        {icon}
      </span>
    </button>
  );
}
