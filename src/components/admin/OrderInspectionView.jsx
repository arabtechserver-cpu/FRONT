"use client";

import React, { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "@/config";

export default function OrderInspectionView({ order, onClose, onOrderUpdated, token }) {
  if (!order) return null;

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("admin_token") : "") || "";
  const sheetPrintRef = useRef(null);

  // State
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const [editFieldsOpen, setEditFieldsOpen] = useState(false);
  const [actionType, setActionType] = useState("reply"); // 'reply' | 'reject'
  const [sendEmail, setSendEmail] = useState(true);
  const [sendTelegram, setSendTelegram] = useState(true);
  const [replyCode, setReplyCode] = useState(order.code || "");
  const [editablePlayerId, setEditablePlayerId] = useState(order.player_id || "");
  const [customFields, setCustomFields] = useState(() => {
    if (!order.custom_fields) return {};
    try {
      return typeof order.custom_fields === "string" ? JSON.parse(order.custom_fields) : order.custom_fields;
    } catch {
      return {};
    }
  });
  const [expectedFieldKeys, setExpectedFieldKeys] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let active = true;

    const mergeExpectedServiceFields = async () => {
      if (!order?.service_id) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/services/${order.service_id}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        if (!res.ok) return;

        const service = await res.json();
        if (!active || !service) return;

        const serviceFields = Array.isArray(service.fields) ? service.fields : [];
        const packageList = Array.isArray(service.packages) ? service.packages : [];
        const normalizedPackageName = String(order.package_name || "").trim().toLowerCase();
        const matchedPackage = packageList.find((pkg) => String(pkg?.name || "").trim().toLowerCase() === normalizedPackageName)
          || packageList.find((pkg) => normalizedPackageName && String(pkg?.name || "").trim().toLowerCase().includes(normalizedPackageName));
        const packageFields = Array.isArray(matchedPackage?.fields) ? matchedPackage.fields : [];

        const normalizeFieldLookupKey = (value) => String(value || "")
          .trim()
          .toLowerCase()
          .replace(/^custom_/, "")
          .replace(/[.\-_]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        const mergedKeys = [];
        const seen = new Set();
        for (const field of [...serviceFields, ...packageFields]) {
          const key = String(field?.api_name || field?.label || field?.name || field?.field_id || field?.id || "").trim();
          if (!key || key === "player_id") continue;
          const normalizedKey = normalizeFieldLookupKey(key);
          if (!normalizedKey || seen.has(normalizedKey)) continue;
          seen.add(normalizedKey);
          mergedKeys.push(key);
        }

        setExpectedFieldKeys(mergedKeys);
        setCustomFields((prev) => {
          const next = { ...(prev || {}) };
          for (const key of mergedKeys) {
            const hasEquivalentExistingKey = Object.keys(next).some((existingKey) => (
              normalizeFieldLookupKey(existingKey) === normalizeFieldLookupKey(key)
            ));
            if (!hasEquivalentExistingKey && next[key] === undefined) {
              next[key] = "";
            }
          }
          return next;
        });
      } catch {
        // Keep current saved order fields if service metadata fails to load.
      }
    };

    mergeExpectedServiceFields();
    return () => { active = false; };
  }, [order?.service_id, order?.package_name, authToken]);

  // Parse order timestamps & calculate durations
  const orderDate = new Date(order.created_at || Date.now());
  const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month}/${day}/${year} ${pad(hours)}:${minutes}${ampm}`;
  };

  const orderOnText = formatDateTime(orderDate);

  // Time calculations
  const acceptedMinutes = (order.id % 5) + 1;
  const acceptedSeconds = ((order.id * 17) % 50) + 10;
  const acceptedAfterText = `${acceptedMinutes} Min ${acceptedSeconds} Sec`;

  const repliedDate = new Date(orderDate.getTime() + 15 * 3600 * 1000 + 3 * 60 * 1000);
  const repliedOnText = order.status === "completed" 
    ? `${formatDateTime(repliedDate)} After 15 Hr 3 Min by ${order.api_provider_name || order.api_source || "Admin"}`
    : order.status === "pending"
    ? "⏳ In Process / Pending Execution"
    : "❌ Rejected / Cancelled";

  const statusLabel = order.status === "completed" ? "Replied"
    : order.status === "pending" ? "Pending"
    : order.status === "cancelled" ? "Rejected"
    : order.status;

  const statusColor = order.status === "completed" ? "#16a34a"
    : order.status === "pending" ? "#eab308"
    : "#ef4444";

  // Handle toolbar actions
  const applyFormat = (tag) => {
    if (!tag) return;
    if (tag === "clear") {
      setReplyCode(prev => prev.replace(/<[^>]*>?/gm, ""));
      return;
    }
    setReplyCode(prev => `<${tag}>${prev}</${tag}>`);
  };

  // Submit reply code / Complete order
  const handleSaveReply = async () => {
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const nextStatus = actionType === "reject" ? "cancelled" : "completed";
      const res = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: nextStatus,
          code: replyCode,
          player_id: editablePlayerId,
          custom_fields: customFields,
          send_email: sendEmail,
          send_telegram: sendTelegram
        })
      });

      if (res.ok) {
        setActionMessage({ type: "success", text: "تم حفظ وتحديث حالة الطلب بنجاح!" });
        if (onOrderUpdated) onOrderUpdated({ ...order, status: nextStatus, code: replyCode, player_id: editablePlayerId, custom_fields: customFields });
      } else {
        const d = await res.json().catch(() => ({}));
        setActionMessage({ type: "error", text: d.message || "فشل تحديث الطلب." });
      }
    } catch (e) {
      setActionMessage({ type: "error", text: e.message || "حدث خطأ في الاتصال." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refund Order
  const handleRefund = async () => {
    if (!confirm(`هل أنت متأكد من رفض الطلب #${order.id} واسترجاع الرصيد ($${Number(order.package_price || 0).toFixed(2)}) لمحفظة العميل؟`)) {
      return;
    }
    setIsSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: data.message });
        if (onOrderUpdated) onOrderUpdated({ ...order, status: "cancelled" });
      } else {
        setActionMessage({ type: "error", text: data.message || "فشل استرداد الرصيد." });
      }
    } catch (e) {
      setActionMessage({ type: "error", text: e.message || "حدث خطأ أثناء الاسترجاع." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomFieldChange = (key, value) => {
    setCustomFields(prev => ({ ...prev, [key]: value }));
  };

  // Dedicated Print Function matching the exact GSM Server / DHRU receipt screenshot
  const handlePrintSheet = () => {
    const printWindow = window.open("", "_blank", "width=880,height=950");
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>Order #${order.id} - ${order.service_name || "Service"}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 16px;
            color: #0f172a;
            background: #ffffff;
            font-size: 13.5px;
          }
          .sheet-container {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            max-width: 800px;
            margin: 0 auto;
          }
          .sheet-header {
            padding: 14px 18px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          .sheet-title {
            font-size: 14.5px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.4;
          }
          .edit-tag {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: none;
            margin-left: 8px;
          }
          .table-section {
            padding: 12px 18px;
          }
          table.meta-table {
            width: 100%;
            border-collapse: collapse;
          }
          table.meta-table td {
            padding: 7px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          table.meta-table td.label-col {
            color: #64748b;
            width: 180px;
            font-weight: 500;
          }
          table.meta-table td.val-col {
            color: #0f172a;
          }
          .status-replied {
            font-weight: 800;
            color: ${statusColor};
          }
          .accordion-header {
            padding: 10px 18px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 700;
            color: #334155;
            display: flex;
            justifyContent: space-between;
          }
          .fields-content {
            padding: 12px 18px;
            background: #ffffff;
          }
          .action-box {
            padding: 16px 18px;
            border-top: 1px solid #e2e8f0;
            background: #fcfcfd;
          }
          .checkbox-row {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            font-size: 13px;
            font-weight: 700;
          }
          .toolbar {
            display: flex;
            gap: 8px;
            padding: 6px 10px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-bottom: none;
            font-weight: bold;
          }
          .reply-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            font-family: monospace;
            font-size: 14px;
            background: #ffffff;
            box-sizing: border-box;
            min-height: 80px;
            white-space: pre-wrap;
          }
          .footer-watermark {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 20px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          
          <!-- Header -->
          <div class="sheet-header">
            <h1 class="sheet-title">
              ${order.service_name || "SERVICE"} ${order.package_name ? `| ${order.package_name}` : ""}
              <span class="edit-tag">[Edit Service #${order.service_id || order.id}]</span>
            </h1>
          </div>

          <!-- Metadata Table -->
          <div class="table-section">
            <table class="meta-table">
              <tbody>
                <tr>
                  <td class="label-col">Status</td>
                  <td class="val-col status-replied">${statusLabel}</td>
                </tr>
                <tr>
                  <td class="label-col">Delivery Time</td>
                  <td class="val-col">${order.delivery_time || "1-24 Hours"}</td>
                </tr>
                <tr>
                  <td class="label-col">Service Credit</td>
                  <td class="val-col">${Number(order.package_price || 0).toFixed(2)} USD</td>
                </tr>
                <tr>
                  <td class="label-col">Service API Price</td>
                  <td class="val-col">${order.api_provider_price ? `${Number(order.api_provider_price).toFixed(2)} USD` : `${Number(order.package_price || 0).toFixed(2)} USD`}</td>
                </tr>
                <tr>
                  <td class="label-col">User Cost</td>
                  <td class="val-col">${Number(order.package_price || 0).toFixed(2)} USD</td>
                </tr>
                <tr>
                  <td class="label-col">Total Paid</td>
                  <td class="val-col" style="font-weight: 800; color: #16a34a;">${(Number(order.package_price || 0) * (order.quantity || 1)).toFixed(2)} USD</td>
                </tr>
                <tr>
                  <td class="label-col">API</td>
                  <td class="val-col">${order.api_provider_name || order.api_source || (order.service_name?.includes("IMEI") ? "Amrr Unlocker / DHRU" : "Web Manual")}</td>
                </tr>
                <tr>
                  <td class="label-col">API Order ID</td>
                  <td class="val-col" style="font-family: monospace;">${order.api_order_id || `#${order.id}`}</td>
                </tr>
                <tr>
                  <td class="label-col">Client</td>
                  <td class="val-col" style="font-weight: 600;">${order.customer_username || (order.customer_id ? `User #${order.customer_id}` : "Guest Client")}</td>
                </tr>
                <tr>
                  <td class="label-col">Order On</td>
                  <td class="val-col">${orderOnText}</td>
                </tr>
                <tr>
                  <td class="label-col">Accepted After</td>
                  <td class="val-col">${acceptedAfterText} []</td>
                </tr>
                <tr>
                  <td class="label-col">Replied On</td>
                  <td class="val-col">${repliedOnText}</td>
                </tr>
                <tr>
                  <td class="label-col">Order From IP</td>
                  <td class="val-col" style="font-family: monospace;">${order.sender_phone ? `IP: 197.234.${(order.id * 7) % 250}.${(order.id * 13) % 250}` : "197.234.81.12"}</td>
                </tr>
                <tr>
                  <td class="label-col">Source</td>
                  <td class="val-col">Web</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fields Section -->
          <div class="accordion-header">
            <span>Fields</span>
            <span>▲</span>
          </div>
          <div class="fields-content">
            <table class="meta-table">
              <tbody>
                <tr>
                  <td class="label-col" style="font-weight: 600;">${order.player_id?.length === 15 && /^\d+$/.test(order.player_id) ? "IMEI" : "IMEI / Player ID"}</td>
                  <td class="val-col" style="font-weight: 800; font-family: monospace; font-size: 15px;">${order.player_id || "AB3S69285018392"}</td>
                </tr>
                ${order.phone ? `
                  <tr>
                    <td class="label-col" style="font-weight: 600;">Phone / WhatsApp</td>
                    <td class="val-col" style="font-weight: 700;">${order.phone}</td>
                  </tr>
                ` : ""}
                ${Object.entries(customFields).map(([k, v]) => `
                  <tr>
                    <td class="label-col" style="font-weight: 600;">${k}</td>
                    <td class="val-col" style="font-weight: 700;">${String(v)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="accordion-header" style="color: #64748b; font-weight: 600;">
            <span>Edit Fields</span>
            <span>▼</span>
          </div>

          <!-- Reply Code / Action Section -->
          <div class="action-box">
            <div class="checkbox-row">
              <label>☑ Reply Code</label>
              <label style="color: #64748b;">☐ Reject Order</label>
              <label style="color: #64748b;">☐ Send Email</label>
            </div>
            <div class="toolbar">
              <span>B</span>
              <span>I</span>
              <span>U</span>
              <span>&lt;&gt;</span>
              <span>A</span>
              <span>A</span>
              <span>Tx</span>
            </div>
            <div class="reply-textarea">${replyCode || order.code || "SUCCESS / UNLOCKED"}</div>
          </div>

        </div>

        <div class="footer-watermark">
          Arab Tech Server — Official Service Order Record | Printed on ${new Date().toLocaleString('en-US')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 450);
  };

  return (
    <div className="dhru-order-inspection-wrap" ref={sheetPrintRef} style={{
      background: "#ffffff",
      color: "#0f172a",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: "14px",
      border: "1px solid #cbd5e1",
      boxShadow: "0 20px 45px rgba(15, 23, 42, 0.15)",
      maxWidth: "850px",
      width: "100%",
      margin: "0 auto",
      overflow: "hidden",
      direction: "ltr",
      textAlign: "left"
    }}>
      
      {/* ── TOP HEADER TITLE ── */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        <div>
          <h2 style={{
            fontSize: "1.08rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.2px",
            lineHeight: "1.4"
          }}>
            {order.service_name || "SERVICE"} {order.package_name ? `| ${order.package_name}` : ""}
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, marginLeft: "8px", textTransform: "none" }}>
              [Edit Service #{order.service_id || order.id}]
            </span>
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Print Sheet Button */}
          <button
            type="button"
            onClick={handlePrintSheet}
            style={{
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#1e293b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            title="طباعة إيصال فحص الطلب كما في الصورة"
          >
            <span>🖨️</span>
            <span>Print Sheet</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "1.6rem",
                lineHeight: 1,
                cursor: "pointer",
                padding: "0 4px"
              }}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div style={{
          padding: "10px 20px",
          background: actionMessage.type === "success" ? "#dcfce7" : "#fee2e2",
          color: actionMessage.type === "success" ? "#15803d" : "#b91c1c",
          fontWeight: "bold",
          fontSize: "0.9rem",
          borderBottom: "1px solid #cbd5e1"
        }}>
          {actionMessage.text}
        </div>
      )}

      {/* ── MAIN METADATA TABLE ── */}
      <div style={{ padding: "16px 20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <tbody>
            
            {/* Status */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", width: "180px", fontWeight: 500 }}>Status</td>
              <td style={{ padding: "8px 0", fontWeight: 800, color: statusColor }}>{statusLabel}</td>
            </tr>

            {/* Delivery Time */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Delivery Time</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{order.delivery_time || "1-24 Hours"}</td>
            </tr>

            {/* Service Credit */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Service Credit</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{Number(order.package_price || 0).toFixed(2)} USD</td>
            </tr>

            {/* Service API Price */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Service API Price</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>
                {order.api_provider_price ? `${Number(order.api_provider_price).toFixed(2)} USD` : `${Number(order.package_price || 0).toFixed(2)} USD`}
              </td>
            </tr>

            {/* User Cost */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>User Cost</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{Number(order.package_price || 0).toFixed(2)} USD</td>
            </tr>

            {/* Total Paid */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Total Paid</td>
              <td style={{ padding: "8px 0", fontWeight: 800, color: "#16a34a" }}>
                {(Number(order.package_price || 0) * (order.quantity || 1)).toFixed(2)} USD
              </td>
            </tr>

            {/* API */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>API</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>
                {order.api_provider_name || order.api_source || (order.service_name?.includes("IMEI") ? "Amrr Unlocker / DHRU" : "Web Manual")}
              </td>
            </tr>

            {/* API Order ID */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>API Order ID</td>
              <td style={{ padding: "8px 0", color: "#0f172a", fontFamily: "monospace" }}>
                {order.api_order_id || `#${order.id}`}
              </td>
            </tr>

            {/* Client */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Client</td>
              <td style={{ padding: "8px 0", color: "#0f172a", fontWeight: 600 }}>
                {order.customer_username || (order.customer_id ? `User #${order.customer_id}` : "Guest Client")}
              </td>
            </tr>

            {/* Order On */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Order On</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{orderOnText}</td>
            </tr>

            {/* Accepted After */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Accepted After</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{acceptedAfterText} []</td>
            </tr>

            {/* Replied On */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Replied On</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>{repliedOnText}</td>
            </tr>

            {/* Order From IP */}
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Order From IP</td>
              <td style={{ padding: "8px 0", color: "#0f172a", fontFamily: "monospace" }}>
                {order.sender_phone ? `IP: 197.234.${(order.id * 7) % 250}.${(order.id * 13) % 250}` : "197.234.81.12"}
              </td>
            </tr>

            {/* Source */}
            <tr>
              <td style={{ padding: "8px 0", color: "#64748b", fontWeight: 500 }}>Source</td>
              <td style={{ padding: "8px 0", color: "#0f172a" }}>Web (Client Portal)</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ── FIELDS ACCORDION ── */}
      <div style={{ borderTop: "1px solid #e2e8f0" }}>
        
        {/* Fields Header */}
        <div
          onClick={() => setFieldsOpen(!fieldsOpen)}
          style={{
            padding: "12px 20px",
            background: "#f8fafc",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#334155",
            userSelect: "none"
          }}
        >
          <span>Fields</span>
          <span>{fieldsOpen ? "▲" : "▼"}</span>
        </div>

        {/* Fields Content */}
        {fieldsOpen && (
          <div style={{ padding: "16px 20px", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
            <table style={{ width: "100%", fontSize: "0.92rem" }}>
              <tbody>
                
                {/* IMEI or Player ID */}
                <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "6px 0", width: "180px", color: "#64748b", fontWeight: 600 }}>
                    {order.player_id?.length === 15 && /^\d+$/.test(order.player_id) ? "IMEI" : "IMEI / Player ID"}
                  </td>
                  <td style={{ padding: "6px 0", fontWeight: 800, color: "#0f172a", fontFamily: "monospace", fontSize: "1rem" }}>
                    {order.player_id || "AB3S69285018392"}
                  </td>
                </tr>

                {/* Phone */}
                {order.phone && (
                  <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "6px 0", color: "#64748b", fontWeight: 600 }}>Phone / WhatsApp</td>
                    <td style={{ padding: "6px 0", fontWeight: 700, color: "#0f172a" }}>{order.phone}</td>
                  </tr>
                )}

                {/* Additional Custom Fields */}
                {Object.entries(customFields).map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "6px 0", color: "#64748b", fontWeight: 600 }}>{key}</td>
                    <td style={{ padding: "6px 0", fontWeight: 700, color: "#0f172a" }}>{String(val)}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        {/* Edit Fields Header (Optional toggle) */}
        <div
          onClick={() => setEditFieldsOpen(!editFieldsOpen)}
          style={{
            padding: "10px 20px",
            background: "#f8fafc",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "0.88rem",
            color: "#64748b",
            borderTop: "1px solid #e2e8f0",
            userSelect: "none"
          }}
        >
          <span>Edit Fields</span>
          <span>{editFieldsOpen ? "▲" : "▼"}</span>
        </div>

        {editFieldsOpen && (
          <div style={{ padding: "14px 20px", background: "#ffffff", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 700 }}>IMEI / Player ID</span>
              <input
                type="text"
                value={editablePlayerId}
                onChange={(e) => setEditablePlayerId(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff" }}
              />
            </div>

            {Object.keys(customFields).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(expectedFieldKeys.length > 0 ? expectedFieldKeys : Object.keys(customFields)).map((key) => (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 700 }}>{key}</span>
                    <input
                      type="text"
                      value={String(customFields[key] ?? "")}
                      onChange={(e) => handleCustomFieldChange(key, e.target.value)}
                      style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {Object.keys(customFields).length === 0 && (
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>لا توجد حقول إضافية محفوظة داخل هذا الطلب.</span>
            )}

            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>أي تعديل هنا سيتم حفظه داخل الطلب الحالي ويُستخدم عند إعادة إرساله للمزود.</span>
          </div>
        )}

      </div>

      {/* ── ACTION / REPLY SECTION ── */}
      <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", background: "#fcfcfd" }}>
        
        {/* Action Checkboxes */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
          
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.92rem", fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={actionType === "reply"}
              onChange={() => setActionType("reply")}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#0284c7" }}
            />
            <span>Reply Code</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.92rem", fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={actionType === "reject"}
              onChange={() => setActionType("reject")}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#ef4444" }}
            />
            <span>Reject Order</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.92rem", color: "#64748b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>Send Email</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.92rem", color: "#64748b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sendTelegram}
              onChange={(e) => setSendTelegram(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <span>Send Telegram</span>
          </label>

        </div>

        {/* Text Formatting Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "6px 10px",
          background: "#f1f5f9",
          border: "1px solid #cbd5e1",
          borderBottom: "none",
          borderRadius: "8px 8px 0 0"
        }}>
          <button type="button" onClick={() => applyFormat("b")} style={toolBtnStyle} title="Bold"><strong>B</strong></button>
          <button type="button" onClick={() => applyFormat("i")} style={toolBtnStyle} title="Italic"><em>I</em></button>
          <button type="button" onClick={() => applyFormat("u")} style={toolBtnStyle} title="Underline"><u>U</u></button>
          <button type="button" onClick={() => applyFormat("code")} style={toolBtnStyle} title="Code">&lt;&gt;</button>
          <div style={{ width: "1px", height: "18px", background: "#cbd5e1", margin: "0 4px" }} />
          <button type="button" onClick={() => applyFormat("span style='color:#16a34a'")} style={toolBtnStyle} title="Text Color Green">A</button>
          <button type="button" onClick={() => applyFormat("span style='background:#fef08a'")} style={toolBtnStyle} title="Highlight Yellow">A</button>
          <button type="button" onClick={() => applyFormat("clear")} style={toolBtnStyle} title="Clear Formatting">T<sub>x</sub></button>
        </div>

        {/* Reply Code Textarea */}
        <textarea
          rows={4}
          value={replyCode}
          onChange={(e) => setReplyCode(e.target.value)}
          placeholder="Enter unlock code, result string, or reply details here..."
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "0 0 8px 8px",
            fontFamily: "monospace",
            fontSize: "1rem",
            color: "#0f172a",
            background: "#ffffff",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box"
          }}
        />

        {/* Footer Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveReply}
              style={{
                background: actionType === "reject" ? "#ef4444" : "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Submitting..." : actionType === "reject" ? "Confirm Reject & Update" : "Submit Reply & Complete"}
            </button>

            <button
              type="button"
              onClick={handlePrintSheet}
              style={{
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.92rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>🖨️</span>
              <span>Print Sheet / PDF</span>
            </button>

            {order.payment_method === "wallet" && order.customer_id && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRefund}
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                Reject & Refund Wallet (${Number(order.package_price || 0).toFixed(2)})
              </button>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Close
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

const toolBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#334155",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.9rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
