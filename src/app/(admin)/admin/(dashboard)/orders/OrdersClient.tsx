"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getOrderFieldRows, getOrderServiceTypeLabel } from "../../../../../lib/order-details";
import { cleanHtmlToText } from "@/utils/cleanHtml";

interface OrderItem {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  targetInput: string;
  quantity: number;
  price: number;
  cost?: number;
  profit?: number;
  status: "completed" | "processing" | "pending" | "rejected" | "cancelled" | string;
  reply?: string;
  apiOrderId?: string | null;
  refundedAt?: string | null;
  refundRefNo?: string | null;
  createdAt: string;
  updatedAt?: string;
  serviceDhruId?: string | null;
  providerServiceId?: string | null;
  serviceCategory?: string | null;
  serviceType?: "imei" | "server" | "remote" | "unknown";
  groupName?: string | null;
  source?: string;
  provider?: {
    id: string;
    name: string;
    apiUrl?: string;
    type?: string;
  } | null;
  customFields?: Record<string, string> | null;
  fieldDetails?: {
    id: string;
    providerFieldId: string;
    label: string;
    type: string;
    required: boolean;
    value: string;
    missing: boolean;
  }[];
  events?: {
    time: string;
    action: string;
    title: string;
    desc: string;
  }[];
  rawNotes?: string | null;
  apiDetails?: {
    username?: string;
    email?: string;
    fullName?: string;
    siteName?: string | null;
    siteUrl?: string | null;
    apiKey?: string | null;
    margin?: number;
  } | null;
  user?: {
    fullName: string;
    email: string;
    username: string;
    phone?: string;
    balance: number;
    apiEnabled?: boolean;
    apiSiteName?: string | null;
    apiSiteUrl?: string | null;
    apiKey?: string | null;
    apiMargin?: number;
  };
}

const BATCH_SIZE = 40;

export default function OrdersClient() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected Order for Details / Timeline Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Modal Actions States
  const [manualCompleteOrder, setManualCompleteOrder] = useState<OrderItem | null>(null);
  const [manualReplyCode, setManualReplyCode] = useState("");
  const [isCompletingManual, setIsCompletingManual] = useState(false);

  const [refundModalOrder, setRefundModalOrder] = useState<{ order: OrderItem; isProviderCancel: boolean } | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const [isVerifyingProviderInModal, setIsVerifyingProviderInModal] = useState(false);
  const [providerModalStatus, setProviderModalStatus] = useState<{
    isRejected?: boolean;
    isCompleted?: boolean;
    message: string;
  } | null>(null);

  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const inFlightDispatchRef = useRef<Set<string>>(new Set());
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editedTargetInput, setEditedTargetInput] = useState("");
  const [isSavingFields, setIsSavingFields] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Progressive scroll loading state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAdminHeaders = useCallback(() => {
    const adminToken = typeof window !== "undefined"
      ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
      : null;
    return {
      "Content-Type": "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;
      const res = await fetch("/api/orders?all=true", {
        headers: {
          "Cache-Control": "no-cache",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include"
      });

      if (!res.ok) {
        setOrders([]);
        return;
      }

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        setOrders([]);
        return;
      }

      if (data && data.success) {
        setOrders(data.orders || []);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const processing = orders.filter((o) => o.status === "processing").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const rejected = orders.filter((o) => o.status === "rejected" || o.status === "cancelled" || o.status === "failed").length;
    const apiOrders = orders.filter((o) => o.source === "api" || Boolean(o.apiDetails) || Boolean(o.user?.apiSiteName)).length;
    return { total, completed, processing, pending, rejected, apiOrders };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all") {
        if (statusFilter === "api") {
          if (order.source !== "api" && !order.apiDetails && !order.user?.apiSiteName) return false;
        } else if (statusFilter === "pending" && order.status !== "pending") return false;
        else if (statusFilter === "processing" && order.status !== "processing") return false;
        else if (statusFilter === "completed" && order.status !== "completed") return false;
        else if (statusFilter === "rejected" && order.status !== "rejected" && order.status !== "cancelled" && order.status !== "failed") return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.serviceName && order.serviceName.toLowerCase().includes(q)) ||
        (order.targetInput && order.targetInput.toLowerCase().includes(q)) ||
        (order.provider?.name && order.provider.name.toLowerCase().includes(q)) ||
        (order.apiOrderId && order.apiOrderId.toLowerCase().includes(q)) ||
        (order.user?.fullName && order.user.fullName.toLowerCase().includes(q)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(q)) ||
        (order.user?.username && order.user.username.toLowerCase().includes(q)) ||
        (order.user?.apiSiteName && order.user.apiSiteName.toLowerCase().includes(q)) ||
        (order.user?.apiSiteUrl && order.user.apiSiteUrl.toLowerCase().includes(q)) ||
        (order.apiDetails?.siteName && order.apiDetails.siteName.toLowerCase().includes(q)) ||
        (order.apiDetails?.username && order.apiDetails.username.toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const displayedOrders = useMemo(() => {
    return filteredOrders.slice(0, visibleCount);
  }, [filteredOrders, visibleCount]);

  const hasMore = visibleCount < filteredOrders.length;

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + BATCH_SIZE);
        setIsLoadingMore(false);
      }, 80);
    }
  }, [hasMore]);

  useEffect(() => {
    const option = { root: null, rootMargin: "300px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const selectedOrderFields = selectedOrder ? getOrderFieldRows(selectedOrder) : [];

  // Dispatch to Provider API
  const handleDispatchProvider = async (order: OrderItem) => {
    if (!order?.id || inFlightDispatchRef.current.has(order.id) || dispatchingOrderId) {
      return;
    }
    inFlightDispatchRef.current.add(order.id);
    setDispatchingOrderId(order.id);
    try {
      const res = await fetch("/api/orders/dispatch-provider", {
        method: "POST",
        headers: getAdminHeaders(),
        credentials: "include",
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || "تم إرسال الطلب للمزود بنجاح!");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order || { ...selectedOrder, status: "processing", apiOrderId: data.apiOrderId });
        }
      } else {
        showToast(data.error || "فشل إرسال الطلب للمزود", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بسيرفر المزود", "error");
    } finally {
      inFlightDispatchRef.current.delete(order.id);
      setDispatchingOrderId(null);
    }
  };

  // Submit Manual Completion with Code
  const handleManualCompleteSubmit = async () => {
    if (!manualCompleteOrder) return;
    setIsCompletingManual(true);
    try {
      const res = await fetch("/api/orders/complete-manual", {
        method: "POST",
        headers: getAdminHeaders(),
        credentials: "include",
        body: JSON.stringify({
          orderId: manualCompleteOrder.id,
          reply: manualReplyCode
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || "تم إكمال الطلب وحفظ الكود بنجاح!");
        setManualCompleteOrder(null);
        setManualReplyCode("");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === manualCompleteOrder.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل إكمال الطلب", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsCompletingManual(false);
    }
  };

  // Submit Refund / Cancel Order
  const handleRefundSubmit = async () => {
    if (!refundModalOrder) return;
    const { order, isProviderCancel } = refundModalOrder;
    setIsRefunding(true);
    const endpoint = isProviderCancel ? "/api/orders/cancel-provider" : "/api/orders/refund";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: getAdminHeaders(),
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          reason: refundReason
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || "تم استرجاع الرصيد للعميل بنجاح!");
        setRefundModalOrder(null);
        setRefundReason("");
        setProviderModalStatus(null);
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل استرجاع الرصيد", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لإتمام الاسترجاع", "error");
    } finally {
      setIsRefunding(false);
    }
  };

  // Check live status from Dhru/Provider
  const handleCheckStatus = async (order: OrderItem) => {
    setCheckingOrderId(order.id);
    try {
      const res = await fetch("/api/orders/check-status", {
        method: "POST",
        headers: getAdminHeaders(),
        credentials: "include",
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || "تم التحقق من حالة الطلب من المزود!");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل الاستعلام من المزود", "error");
      }
    } catch {
      showToast("تعذر الاتصال بسيرفر المزود", "error");
    } finally {
      setCheckingOrderId(null);
    }
  };

  // Verify provider status specifically within refund modal
  const handleVerifyProviderInModal = async () => {
    if (!refundModalOrder?.order.id) return;
    setIsVerifyingProviderInModal(true);
    setProviderModalStatus(null);
    try {
      const res = await fetch("/api/orders/check-status", {
        method: "POST",
        headers: getAdminHeaders(),
        credentials: "include",
        body: JSON.stringify({ orderId: refundModalOrder.order.id })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const rawStatus = String(data.statusData?.STATUS ?? data.statusData?.status ?? "").trim();
        const isRejected = rawStatus === "3" || String(data.message).includes("مرفوض") || String(data.message).includes("ملغي");
        const isCompleted = rawStatus === "4" || String(data.message).includes("مكتمل") || String(data.message).includes("نجاح");

        setProviderModalStatus({
          isRejected,
          isCompleted,
          message: data.message || `تم التحقق: حالة المزود الحالية (${rawStatus})`
        });
        showToast(data.message || "تم الاستعلام من المزود بنجاح");
        if (data.order) {
          setRefundModalOrder(prev => prev ? { ...prev, order: data.order } : null);
          setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
          if (selectedOrder && selectedOrder.id === data.order.id) {
            setSelectedOrder(data.order);
          }
        }
      } else {
        setProviderModalStatus({
          isRejected: false,
          message: data.error || "تعذر الاستعلام من سيرفر المزود"
        });
        showToast(data.error || "فشل الاستعلام من المزود", "error");
      }
    } catch {
      setProviderModalStatus({
        isRejected: false,
        message: "تعذر الاتصال بسيرفر المزود"
      });
      showToast("تعذر الاتصال بسيرفر المزود", "error");
    } finally {
      setIsVerifyingProviderInModal(false);
    }
  };

  const handleSaveEditedFields = async () => {
    if (!selectedOrder) return;
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
          orderId: selectedOrder.id,
          targetInput: editedTargetInput
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("تم تحديث بيانات وحقول الطلب بنجاح!");
        setSelectedOrder({
          ...selectedOrder,
          targetInput: editedTargetInput
        });
        setIsEditingFields(false);
        fetchOrders();
      } else {
        showToast(data.error || "فشل حفظ التعديل", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsSavingFields(false);
    }
  };

  const formatDhruDate = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      let hours = d.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const hh = String(hours).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${mm}/${dd}/${yyyy} ${hh}:${min}${ampm}`;
    } catch {
      return String(dateStr);
    }
  };

  const calculateDurationString = (startStr?: string | null, endStr?: string | null): string => {
    if (!startStr) return "-";
    const start = new Date(startStr).getTime();
    const end = endStr ? new Date(endStr).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (days > 0) return `${days}d ${hours} Hr ${mins} Min`;
    if (hours > 0) return `${hours} Hr ${mins} Min`;
    if (mins > 0) return `${mins} Min ${secs} Sec`;
    return `${secs} Sec`;
  };

  return (

    <div className="space-y-6 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-white font-bold ${
            toastMessage.type === "success" ? "bg-violet-600 border border-violet-400/40" : "bg-red-600 border border-red-400/40"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            <span>طلبات العملاء وتنفيذ الخدمات</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm">
            مراجعة الطلبات، الإرسال اليدوي للمزودين، إرسال أكواد التفعيل، وإلغاء واسترجاع الرصيد للعميل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className={`material-symbols-outlined text-sm text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.total}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl opacity-80">receipt_long</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-300">في انتظار الموافقة</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{stats.pending}</p>
          </div>
          <span className="material-symbols-outlined text-amber-400 text-3xl">hourglass_top</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-300">قيد التنفيذ بالمزود</p>
            <p className="text-2xl font-bold text-blue-400 font-mono mt-1">{stats.processing}</p>
          </div>
          <span className="material-symbols-outlined text-blue-400 text-3xl">rocket_launch</span>
        </div>

        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-violet-300">الطلبات المكتملة</p>
            <p className="text-2xl font-bold text-violet-400 font-mono mt-1">{stats.completed}</p>
          </div>
          <span className="material-symbols-outlined text-violet-400 text-3xl">task_alt</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-red-300">ملغية ومسترجعة</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{stats.rejected}</p>
          </div>
          <span className="material-symbols-outlined text-red-400 text-3xl">cancel</span>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعميل، اسم الخدمة، المزود، أو IMEI..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 pr-10 pl-4 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2 flex-wrap text-xs font-bold">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all" ? "bg-primary text-on-primary shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            الكل ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "pending" ? "bg-amber-500 text-black shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            في انتظار الموافقة ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "processing" ? "bg-blue-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            قيد التنفيذ ({stats.processing})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "completed" ? "bg-violet-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            المكتملة ({stats.completed})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "rejected" ? "bg-red-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            الملغاة ({stats.rejected})
          </button>
          <button
            onClick={() => setStatusFilter("api")}
            className={`px-3 py-1.5 rounded-lg transition-all border border-purple-500/40 flex items-center gap-1 ${
              statusFilter === "api" ? "bg-purple-600 text-white shadow" : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">api</span>
            <span>طلبات الـ API ({stats.apiOrders})</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant text-xs flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل سجل الطلبات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant text-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">shopping_bag</span>
            <span>لا توجد طلبات مطابقة للبحث المحدد</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">الخدمة والمزود</th>
                  <th className="p-4">البيانات / IMEI</th>
                  <th className="p-4">السعر / التكلفة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedOrders.map((order) => {
                  const isDispatching = dispatchingOrderId === order.id;
                  const isChecking = checkingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-high/40 transition-colors">
                      {/* Order ID & Source */}
                      <td className="p-4 font-mono font-bold text-on-surface text-xs">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary font-bold">#{order.id ? order.id.slice(-6) : "N/A"}</span>
                            {order.apiOrderId && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono" title="رقم الطلب الخارجي لدى المزود">
                                API #{order.apiOrderId}
                              </span>
                            )}
                          </div>
                          {order.source === "api" ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">api</span>
                              طلب API
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">public</span>
                              الموقع
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & API Consumer Details */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-on-surface text-xs">{order.user?.fullName || "عميل مسجل"}</span>
                            {order.user?.username && (
                              <span className="text-[11px] font-mono text-primary font-bold dir-ltr">
                                @{order.user.username}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono">{order.user?.email || order.userId}</div>

                          {/* If API Order, display API Site and consumer details */}
                          {(order.source === "api" || order.apiDetails || order.user?.apiSiteName) && (
                            <div className="mt-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col gap-1 text-[11px]">
                              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                                <span className="material-symbols-outlined text-[13px] text-purple-400">webhook</span>
                                <span>مستهلك API:</span>
                                <span className="text-white font-medium">
                                  {order.apiDetails?.siteName || order.user?.apiSiteName || "موقع بدون اسم"}
                                </span>
                              </div>
                              {(order.apiDetails?.siteUrl || order.user?.apiSiteUrl) && (
                                <a
                                  href={order.apiDetails?.siteUrl || order.user?.apiSiteUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-purple-400 hover:text-purple-300 underline dir-ltr text-right truncate max-w-[200px]"
                                  title={order.apiDetails?.siteUrl || order.user?.apiSiteUrl || ""}
                                >
                                  {order.apiDetails?.siteUrl || order.user?.apiSiteUrl}
                                </a>
                              )}
                              <div className="flex items-center justify-between text-[10px] text-purple-300/80 pt-0.5 border-t border-purple-500/20">
                                <span>الربح المطبق: <b>%{order.apiDetails?.margin || order.user?.apiMargin || 8}</b></span>
                                {order.user?.apiKey && (
                                  <span className="font-mono text-[9px] text-purple-400/70" title="مفتاح العميل">
                                    {order.user.apiKey.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Service & Provider */}
                      <td className="p-4 max-w-[240px]">
                        <div className="font-bold text-on-surface text-xs truncate" title={order.serviceName}>
                          {order.serviceName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {order.provider ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-secondary font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">dns</span>
                              <span>{order.provider.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant font-bold">
                              تنفيذ يدوي / محلي
                            </span>
                          )}

                          {order.serviceDhruId && (
                            <span className="text-[10px] font-mono text-on-surface-variant/80">
                              ID #{order.serviceDhruId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Input / IMEI */}
                      <td className="p-4 font-mono text-primary font-bold dir-ltr text-right max-w-[160px] truncate" title={order.targetInput}>
                        {order.targetInput || "—"}
                      </td>

                      {/* Price & Cost */}
                      <td className="p-4 font-mono">
                        <div className="font-bold text-primary text-sm">${(order.price || 0).toFixed(2)}</div>
                        {order.cost !== undefined && order.cost > 0 && (
                          <div className="text-[10px] text-on-surface-variant">
                            تكلفة: ${order.cost.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {order.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                            مكتمل
                          </span>
                        )}
                        {order.status === "processing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            قيد التنفيذ بالمزود
                          </span>
                        )}
                        {order.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            في انتظار الموافقة
                          </span>
                        )}
                        {order.status !== "completed" && order.status !== "processing" && order.status !== "pending" && (
                          order.refundedAt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]" title={`تم الاسترجاع برقم مرجع: ${order.refundRefNo || ''}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              ملغي ومسترجع
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[11px]" title="الطلب مرفوض ولكن الرصيد لم يُسترجع للمحفظة بعد">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              مرفوض (غير مسترجع)
                            </span>
                          )
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-on-surface-variant text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Send to Provider (Dhru) */}
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleDispatchProvider(order)}
                              disabled={isDispatching}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-[11px] font-bold transition-all shadow hover:shadow-primary/30 flex items-center gap-1 disabled:opacity-50"
                              title="إرسال الطلب آلياً إلى سيرفر المزود"
                            >
                              <span className={`material-symbols-outlined text-xs ${isDispatching ? "animate-spin" : ""}`}>
                                {isDispatching ? "refresh" : "send"}
                              </span>
                              <span>إرسال للمزود</span>
                            </button>
                          )}

                          {/* Manual Complete with Code */}
                          {order.status !== "completed" && order.status !== "rejected" && order.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setManualCompleteOrder(order);
                                setManualReplyCode(order.reply || "");
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-400 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="إكمال الطلب يدوياً وإرسال كود التفعيل للعميل"
                            >
                              <span className="material-symbols-outlined text-xs">key</span>
                              <span>إكمال بكود</span>
                            </button>
                          )}

                          {/* Check Status from Provider if apiOrderId exists */}
                          {order.apiOrderId && (
                            <button
                              onClick={() => handleCheckStatus(order)}
                              disabled={isChecking}
                              className="p-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/30 transition-all disabled:opacity-50"
                              title="فحص تحديث الحالة مباشرة من المزود"
                            >
                              <span className={`material-symbols-outlined text-xs ${isChecking ? "animate-spin" : ""}`}>
                                refresh
                              </span>
                            </button>
                          )}

                          {/* Manual Refund - Present across all cases as requested */}
                          {!order.refundedAt ? (
                            <button
                              onClick={() => {
                                setRefundModalOrder({
                                  order,
                                  isProviderCancel: Boolean(order.apiOrderId && order.status === "processing")
                                });
                                setRefundReason("");
                                setProviderModalStatus(null);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1 text-[11px] font-bold"
                              title="استرجاع يدوي للمبلغ إلى محفظة العميل"
                            >
                              <span className="material-symbols-outlined text-xs">undo</span>
                              <span>استرجاع يدوي</span>
                            </button>
                          ) : (
                            <span
                              className="px-2 py-1 rounded-xl bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1"
                              title={`تم استرجاع الرصيد سابقاً (${order.refundRefNo || ''})`}
                            >
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              <span>مسترجع</span>
                            </span>
                          )}

                          {/* View Full Details & Timeline */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 transition-all flex items-center gap-1 text-[11px] font-bold"
                            title="عرض تفاصيل وسجل أحداث الطلب"
                          >
                            <span className="material-symbols-outlined text-xs">visibility</span>
                            <span>تفاصيل</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Scroll Sentinel for Progressive Loading */}
        <div ref={sentinelRef} className="py-4 text-center border-t border-outline-variant/10">
          {hasMore ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                <span>جاري عرض ({displayedOrders.length} من {filteredOrders.length}) طلب... التمرير للأسفل يعرض المزيد</span>
              </div>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
                className="mt-1 px-4 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary border border-primary/20 text-xs font-bold transition-all"
              >
                عرض {BATCH_SIZE} طلب إضافي الآن ↓
              </button>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="text-[11px] text-on-surface-variant/70">
              تم عرض كافة الطلبات المسجلة في النظام بالكامل ({filteredOrders.length} طلب)
            </div>
          ) : null}
        </div>
      </div>

      {/* MANUAL COMPLETE & SEND CODE MODAL */}
      {manualCompleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-violet-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 text-violet-400">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">key</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">إكمال الطلب وإرسال كود التفعيل</h3>
                  <p className="text-xs text-on-surface-variant">طلب #{manualCompleteOrder.id.slice(-6)} • {manualCompleteOrder.serviceName}</p>
                </div>
              </div>

              <button
                onClick={() => setManualCompleteOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-on-surface-variant">العميل:</span>
                  <span className="text-on-surface">{manualCompleteOrder.user?.fullName} ({manualCompleteOrder.user?.email})</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-on-surface-variant">البيانات / IMEI:</span>
                  <span className="text-primary font-bold dir-ltr">{manualCompleteOrder.targetInput}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  كود التفعيل / الرد / بيانات الحساب المُسلّمة للعميل:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب كود فك القفل، كود الشحن، أو بيانات الحساب وكلمة المرور..."
                  value={manualReplyCode}
                  onChange={(e) => setManualReplyCode(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-violet-500/40 rounded-xl focus:border-violet-500 outline-none font-mono text-xs text-on-surface transition-all dir-ltr"
                />
                <p className="text-[11px] text-on-surface-variant/80 mt-1">
                  سيظهر هذا الكود في حساب العميل مباشرة مع زر للنسخ الفوري.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualCompleteSubmit}
                disabled={isCompletingManual || !manualReplyCode.trim()}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-black py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isCompletingManual ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
                <span>اعتماد وإرسال الكود للعميل</span>
              </button>
              <button
                type="button"
                onClick={() => setManualCompleteOrder(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL & REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-red-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">undo</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    استرجاع يدوي للمبلغ إلى محفظة العميل
                  </h3>
                  <p className="text-xs text-red-400">طلب #{refundModalOrder.order.id.slice(-6)} • {refundModalOrder.order.serviceName}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRefundModalOrder(null);
                  setProviderModalStatus(null);
                }}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer & Order Summary Card */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">العميل:</span>
                  <span className="text-on-surface font-bold">{refundModalOrder.order.user?.fullName || refundModalOrder.order.user?.username || "عميل"} ({refundModalOrder.order.user?.email})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">رصيد العميل الحالي:</span>
                  <span className="font-mono text-emerald-400 font-bold dir-ltr">${(refundModalOrder.order.user?.balance ?? 0).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">المبلغ المراد استرجاعه:</span>
                  <span className="font-mono text-rose-400 font-bold text-sm dir-ltr">+${(refundModalOrder.order.price || 0).toFixed(2)} USD</span>
                </div>
                {refundModalOrder.order.targetInput && (
                  <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                    <span className="text-on-surface-variant font-medium">البيانات / IMEI:</span>
                    <span className="font-mono text-primary font-bold dir-ltr">{refundModalOrder.order.targetInput}</span>
                  </div>
                )}
              </div>

              {/* Provider Live Verification Section */}
              {refundModalOrder.order.apiOrderId && (
                <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary">verified</span>
                      <span>التحقق من المزود (مرجع: #{refundModalOrder.order.apiOrderId})</span>
                    </div>
                    <button
                      type="button"
                      disabled={isVerifyingProviderInModal}
                      onClick={handleVerifyProviderInModal}
                      className="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-xs ${isVerifyingProviderInModal ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                      <span>فحص الحالة الآن</span>
                    </button>
                  </div>
                  {providerModalStatus && (
                    <div className={`p-2.5 rounded-xl text-[11px] font-mono leading-relaxed border ${
                      providerModalStatus.isRejected
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold"
                        : providerModalStatus.isCompleted
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-300 font-bold"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    }`}>
                      {providerModalStatus.message}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  سبب الاسترجاع (يظهر في تقرير العميل وسجل العمليات):
                </label>
                <input
                  type="text"
                  placeholder="مثال: رفض الطلب من المزود، تعويض العميل، أو إلغاء بناء على طلب الإدارة"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-red-500 outline-none text-xs text-on-surface transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRefundSubmit}
                disabled={isRefunding}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isRefunding ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                )}
                <span>تأكيد استرجاع ${(refundModalOrder.order.price || 0).toFixed(2)} USD للمحفظة</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefundModalOrder(null);
                  setProviderModalStatus(null);
                }}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ORDER DETAILS & EVENT TIMELINE MODAL - DHRU FUSION STYLE */}
      {selectedOrder && (() => {
        const dispatchEvent = selectedOrder.events?.find(
          (ev) => ev.action?.includes("إرسال") || ev.title?.includes("إرسال") || ev.title?.includes("المزود")
        );
        const acceptedDuration = dispatchEvent
          ? calculateDurationString(selectedOrder.createdAt, dispatchEvent.time)
          : selectedOrder.apiOrderId
          ? calculateDurationString(selectedOrder.createdAt, selectedOrder.updatedAt || selectedOrder.createdAt)
          : "-";

        const completedEvent = selectedOrder.events?.find(
          (ev) => ev.action?.includes("مكتمل") || ev.title?.includes("مكتمل") || ev.title?.includes("إكمال")
        );
        const repliedTime = completedEvent?.time || (selectedOrder.status === "completed" ? selectedOrder.updatedAt : null);
        const replyDuration = repliedTime
          ? calculateDurationString(selectedOrder.createdAt, repliedTime)
          : null;



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
                    {selectedOrder.groupName || "EFT Dongle"}
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
                    setSelectedOrder(null);
                    setIsEditingFields(false);
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
                      <span>{selectedOrder.serviceName}</span>
                      <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">settings</span>
                        <span>تفاصيل ومحددات الخدمة</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Ref: #{selectedOrder.id.slice(-6)}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{getOrderServiceTypeLabel(selectedOrder.serviceType)}</span>
                    </div>
                  </div>

                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedOrder.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : selectedOrder.status === "processing"
                      ? "bg-sky-50 text-sky-700 border-sky-300"
                      : selectedOrder.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-red-50 text-red-700 border-red-300"
                  }`}>
                    {selectedOrder.status === "completed"
                      ? "Success / Completed"
                      : selectedOrder.status === "processing"
                      ? "In Process"
                      : selectedOrder.status === "pending"
                      ? "Pending"
                      : "Rejected"}
                  </span>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-xs hover:bg-slate-50">
                {/* Main Dhru Fusion Key-Value Table */}
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {/* Service Credit */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Service Credit</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      {selectedOrder.quantity || 1} Credit
                    </span>
                  </div>

                  {/* Service API Price */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Service API Price</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      {selectedOrder.cost ? `$${selectedOrder.cost.toFixed(2)} USD` : "—"}
                    </span>
                  </div>

                  {/* User Cost */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">User Cost</span>
                    <span className="font-mono font-semibold text-left flex-1">
                      ${(selectedOrder.price || 0).toFixed(2)} USD
                    </span>
                  </div>

                  {/* Total Paid (Mint-Green Solid Badge matching screenshot) */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Total Paid</span>
                    <div className="flex-1 text-left">
                      <span className="inline-block bg-[#d4f8e8] text-[#0f766e] px-4 py-1 rounded font-mono font-bold text-xs sm:text-sm tracking-wide">
                        ${(selectedOrder.price || 0).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* API, API Order ID, Client */}
                  <div className="py-2.5 px-3 bg-slate-50/40">
                    <div className="w-full divide-y divide-slate-100">
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">API</span>
                        <span className="font-bold text-left flex-1">
                          {selectedOrder.provider?.name || "EA Unlocker"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">API Order ID</span>
                        <span className="font-mono font-bold text-left flex-1">
                          {selectedOrder.apiOrderId ? `#${selectedOrder.apiOrderId}` : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Client</span>
                        <span className="font-semibold text-left flex-1">
                          {selectedOrder.user?.fullName || selectedOrder.user?.username || "Client"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order On */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Order On</span>
                    <span className="font-mono font-medium text-left flex-1">
                      {formatDhruDate(selectedOrder.createdAt)}
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
                      {selectedOrder.status === "completed" && repliedTime ? (
                        <>
                          <span>{formatDhruDate(repliedTime)}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-red-600 border-2 border-red-500 bg-red-50/60">
                            After {replyDuration || "0 Min"}
                          </span>
                          <span className="text-slate-500 font-sans text-xs">
                            by {selectedOrder.provider?.name || "EA Unlocker"}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500">
                          {selectedOrder.status === "processing" ? `In Process (${calculateDurationString(selectedOrder.createdAt)})` : "—"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order From IP */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Order From IP</span>
                    <span className="text-slate-600 font-mono text-left flex-1">
                      {(selectedOrder as any).clientIp || "156.204.12.88 (Web)"}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50/60 dark:hover:bg-surface-container-high/60 transition-colors">
                    <span className="text-slate-500 font-medium w-36 sm:w-44 text-left">Source</span>
                    <span className="font-semibold text-left flex-1">
                      {selectedOrder.source === "api" ? "API" : "Web"}
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
                    {selectedOrderFields.length > 0 ? (
                      selectedOrderFields.map((field: any, idx: number) => (
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
                                  showToast("تم نسخ القيمة بنجاح");
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
                            {selectedOrder.targetInput || "—"}
                          </span>
                          {selectedOrder.targetInput && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedOrder.targetInput);
                                showToast("تم نسخ القيمة بنجاح");
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
                          setEditedTargetInput(selectedOrder.targetInput || "");
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
                {selectedOrder.reply && (
                  <div className="rounded-xl border border-violet-200 overflow-hidden bg-violet-50/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">key</span>
                        <span>الكود أو النتيجة المستلمة (Reply / Code):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrder.reply || "");
                          showToast("تم نسخ الكود بنجاح!");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-bold text-[10px] hover:bg-violet-700 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>نسخ الكود</span>
                      </button>
                    </div>
                    <p className="font-mono font-bold p-3 rounded-lg border border-violet-200 whitespace-pre-wrap dir-ltr text-start block text-xs select-all">
                      {cleanHtmlToText(selectedOrder.reply)}
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
                          <div className="text-[11px] text-slate-600">خصم ${(selectedOrder.price || 0).toFixed(2)} USD من رصيد المحفظة</div>
                          <div className="text-[10px] text-slate-400 font-mono">{formatDhruDate(selectedOrder.createdAt)}</div>
                        </div>

                        {selectedOrder.events?.map((ev, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-slate-500 ring-4 ring-slate-200"></span>
                            <div className="font-bold ">{ev.title || ev.action}</div>
                            <div className="text-[11px] text-slate-600">{ev.desc}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{formatDhruDate(ev.time)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-t hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  {selectedOrder.status === "pending" && (
                    <button
                      type="button"
                      disabled={dispatchingOrderId === selectedOrder.id}
                      onClick={() => handleDispatchProvider(selectedOrder)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {dispatchingOrderId === selectedOrder.id ? (
                        <>
                          <span className="material-symbols-outlined text-xs animate-spin">refresh</span>
                          <span>جاري الإرسال للمزود...</span>
                        </>
                      ) : (
                        <span>إرسال للمزود الآن</span>
                      )}
                    </button>
                  )}
                  {selectedOrder.status !== "completed" && selectedOrder.status !== "rejected" && selectedOrder.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualCompleteOrder(selectedOrder);
                        setManualReplyCode(selectedOrder.reply || "");
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-300 font-bold text-xs hover:bg-purple-100 transition-all"
                    >
                      إكمال يدوياً وإرسال كود
                    </button>
                  )}
                  {!selectedOrder.refundedAt ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRefundModalOrder({ order: selectedOrder, isProviderCancel: Boolean(selectedOrder.apiOrderId && selectedOrder.status === "processing") });
                        setRefundReason("");
                        setProviderModalStatus(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-300 font-bold text-xs hover:bg-rose-100 transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-xs">undo</span>
                      <span>استرجاع يدوي للمحفظة</span>
                    </button>
                  ) : (
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>مسترجع مسبقاً ({selectedOrder.refundRefNo || 'مكتمل'})</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setIsEditingFields(false);
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

    </div>
  );
}
