import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/config";

export default function BackupsTab({ token, API_BASE_URL }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // 'create', 'restore-file', 'restore-upload', 'delete-file'
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP Deletion Gate for Backups
  const [backupOtpModal, setBackupOtpModal] = useState({ isOpen: false, filename: "", message: "" });
  const [backupOtpCode, setBackupOtpCode] = useState("");
  const [backupOtpLoading, setBackupOtpLoading] = useState(false);
  const [backupOtpError, setBackupOtpError] = useState("");
  const [previewBackup, setPreviewBackup] = useState(null);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("فشل جلب النسخ الاحتياطية.");
      const data = await response.json();
      setBackups(data);
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء تحميل البيانات من الخادم.");
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (token) {
      fetchBackups();
    }
  }, [token, fetchBackups]);

  const handleCreateBackup = async () => {
    setActionLoading("create");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إنشاء النسخة الاحتياطية.");
      setSuccessMsg("✓ تم إنشاء النسخة الاحتياطية بنجاح على السيرفر!");
      fetchBackups();
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء إنشاء النسخة الاحتياطية.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadFullBackup = async () => {
    setActionLoading("download-full");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const downloadUrl = `${API_BASE_URL}/api/backups/export-full-download?token=${encodeURIComponent(token)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "فشل تصدير وتحميل النسخة الاحتياطية الشاملة.");
      }
      const blob = await response.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `full-database-${timestamp}.json`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMsg("✓ تم تصدير وتحميل النسخة الاحتياطية الكاملة (JSON) بنجاح!");
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء تصدير النسخة الاحتياطية الكاملة.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateFullBackup = async () => {
    setActionLoading("create-full");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/create-full`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إنشاء النسخة الشاملة.");
      setSuccessMsg("✓ تم إنشاء وتخزين النسخة الاحتياطية الشاملة (بما فيها الخدمات والباقات والحقول) بنجاح!");
      fetchBackups();
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء إنشاء النسخة الاحتياطية الشاملة.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendLatestToTelegram = async () => {
    setActionLoading("send-telegram");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/send-latest-telegram`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إرسال أحدث نسخة إلى تيليجرام.");
      setSuccessMsg(`✓ ${data.message}${data.filename ? ` (${data.filename})` : ""}`);
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء إرسال أحدث نسخة إلى تيليجرام.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadBackup = (filename) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const downloadUrl = `${API_BASE_URL}/api/backups/download/${filename}?token=${encodeURIComponent(token)}`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء تحميل الملف.");
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!confirm(`هل أنت متأكد من حذف نسخة الاحتيا (${filename}) نهائياً من السيرفر؟`)) return;
    setActionLoading(`delete-${filename}`);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/${filename}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.status === 403 && data && data.requireOtp) {
        setBackupOtpModal({
          isOpen: true,
          filename,
          message: data.message || "يرجى إدخال كود التحقق (OTP) المرسل على الواتساب لإتمام حذف ملف النسخة الاحتياطية."
        });
        return;
      }
      if (!response.ok) throw new Error(data.message || "فشل حذف الملف.");
      setSuccessMsg("✓ تم حذف ملف النسخة الاحتياطية بنجاح.");
      fetchBackups();
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء حذف النسخة الاحتياطية.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmBackupOtp = async (e) => {
    e.preventDefault();
    if (!backupOtpModal.filename || !backupOtpCode) return;
    setBackupOtpLoading(true);
    setBackupOtpError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/${backupOtpModal.filename}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-OTP-Code": backupOtpCode
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "كود التحقق غير صحيح أو منتهي الصلاحية.");
      setSuccessMsg("✓ تم حذف ملف النسخة الاحتياطية بنجاح عبر كود الواتساب.");
      setBackupOtpModal({ isOpen: false, filename: "", message: "" });
      setBackupOtpCode("");
      fetchBackups();
    } catch (err) {
      setBackupOtpError(err.message || "فشل حذف الملف باستخدام الكود.");
    } finally {
      setBackupOtpLoading(false);
    }
  };

  const handleRestoreFromBackupFile = async (filename) => {
    if (
      !confirm(
        `⚠️ تنبيه هام جداً:\n\nسيتم مسح كافة البيانات الحالية في قاعدة بيانات الموقع واستعادة البيانات من نسخة (${filename}) بالكامل!\n\nهل أنت متأكد تماماً من المتابعة؟ لا يمكن التراجع عن هذا الإجراء.`
      )
    )
      return;

    setActionLoading(`restore-${filename}`);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/restore/file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل استعادة البيانات.");
      setSuccessMsg("🎉 تم استرجاع النسخة الاحتياطية بنجاح تام! يرجى تحديث بيانات الموقع.");
      alert("تمت استعادة النسخة الاحتياطية بنجاح! 🔄 سيتم إعادة تحميل الصفحة لتطبيق التغييرات.");
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء استرجاع البيانات.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLocalFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        if (!backupData.tables) {
          throw new Error("ملف النسخة الاحتياطية غير صالح (لا يحتوي على جداول).");
        }

        const summary = Object.keys(backupData.tables).map(t => ({
          name: t,
          count: backupData.tables[t].length
        }));

        setPreviewBackup({ data: backupData, summary, filename: file.name });
      } catch (err) {
        setErrorMsg(err.message || "حدث خطأ أثناء فك وقراءة الملف.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const executeRestoreUpload = async () => {
    if (!previewBackup || !previewBackup.data) return;

    setActionLoading("restore-upload");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/backups/restore/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ backupData: previewBackup.data }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل استعادة البيانات.");

      setSuccessMsg("🎉 تم استرجاع النسخة الاحتياطية المرفوعة بنجاح تام!");
      alert("تمت استعادة النسخة الاحتياطية بنجاح! 🔄 سيتم إعادة تحميل الصفحة لتطبيق التغييرات.");
    } catch (err) {
      setErrorMsg(err.message || "حدث خطأ أثناء استرجاع الملف.");
    } finally {
      setActionLoading(null);
      setPreviewBackup(null);
    }
  };


  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      {/* Alert Messages */}
      {errorMsg && (
        <div style={{ padding: "14px 20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px", color: "#f87171", fontWeight: "600", fontSize: "0.9rem" }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "14px 20px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "14px", color: "#34d399", fontWeight: "600", fontSize: "0.9rem" }}>
          {successMsg}
        </div>
      )}

      {/* Full Database Backup Card */}
      <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)", display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.1)" }}>
        <div style={{ flex: "1 1 500px" }}>
          <div style={{ display: "inline-block", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: "800", color: "#34d399", marginBottom: "10px" }}>
            ✨ تصدير شامل 100% (FULL JSON EXPORT)
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
            تصدير وتنزيل قاعدة البيانات بالكامل مع الخدمات والباقات
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
            تتيح لك هذه الميزة تنزيل ملف <strong style={{ color: "#34d399" }}>JSON</strong> شامل ومكتمل يحتوي على كافة بيانات المتجر الحالية بما فيها (الأقسام، الخدمات بجميع تفاصيلها وباقاتها وحقولها، الطلبات، العملاء، الرصيد، الإعدادات، والبنرات).
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadFullBackup}
            disabled={actionLoading === "download-full"}
            className="glass-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: "14px",
              fontWeight: "800",
              cursor: actionLoading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
              fontSize: "0.95rem"
            }}
          >
            {actionLoading === "download-full" ? "جاري التصدير والتحميل..." : "📥 تنزيل نسخة شاملة (JSON)"}
          </button>
          <button
            onClick={handleCreateFullBackup}
            disabled={actionLoading === "create-full"}
            className="glass-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34d399",
              padding: "12px 20px",
              borderRadius: "14px",
              fontWeight: "700",
              cursor: actionLoading ? "not-allowed" : "pointer",
              fontSize: "0.95rem"
            }}
          >
            {actionLoading === "create-full" ? "جاري التخزين..." : "💾 تخزين بالسيرفر"}
          </button>
        </div>
      </div>

      {/* Manual Actions Card */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "20px", padding: "25px", backdropFilter: "blur(20px)", display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>النسخ الاحتياطي اليدوي والتلقائي</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>يتم أخذ نسخة تلقائياً كل 5 ساعات. يمكنك أيضاً إنشاء نسخة أو إرسالها إلى تيليجرام فوراً.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleSendLatestToTelegram}
            disabled={actionLoading === "send-telegram"}
            className="glass-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: actionLoading ? "not-allowed" : "pointer" }}
          >
            {actionLoading === "send-telegram" ? "جاري الإرسال..." : "✈️ إرسال النسخة لتيليجرام"}
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={actionLoading === "create"}
            className="glass-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--primary-color)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: actionLoading ? "not-allowed" : "pointer", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)" }}
          >
            {actionLoading === "create" ? "جاري الإنشاء..." : "⚡ إنشاء نسخة احتياطية الآن"}
          </button>
        </div>
      </div>

      {/* Upload & Restore Card */}
      <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px dashed rgba(99, 102, 241, 0.3)", borderRadius: "20px", padding: "25px", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>📤 استعادة نسخة احتياطية من ملف محلي</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>قم باختيار ملف نسخة احتياطية (JSON) من جهازك لاستعراض بياناتها ثم استرجاعها مباشرة إلى قاعدة البيانات.</p>
        <label style={{ display: "inline-block", background: "var(--primary-color)", color: "#fff", padding: "10px 24px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)" }}>
          <span>📂 اختيار ملف النسخة الاحتياطية</span>
          <input type="file" accept=".json" onChange={handleLocalFileRestore} style={{ display: "none" }} />
        </label>
      </div>

      {/* Backups List */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "20px", padding: "25px", backdropFilter: "blur(20px)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🗄️ النسخ الاحتياطية المحفوظة على السيرفر</span>
          <span style={{ fontSize: "0.8rem", padding: "2px 8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "10px", color: "var(--text-muted)" }}>{backups.length} نسخة</span>
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>جاري تحميل النسخ الاحتياطية...</div>
        ) : backups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>لا توجد نسخ احتياطية مسجلة حتى الآن.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {backups.map((b) => (
              <div
                key={b.filename}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "14px",
                  gap: "15px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "var(--primary-color)" }}>
                    📦
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem", marginBottom: "4px", direction: "ltr", textAlign: "right" }}>
                      {b.filename}
                    </div>
                    <div style={{ display: "flex", gap: "15px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      <span>📅 {formatDate(b.createdAt)}</span>
                      <span>⚖️ {formatBytes(b.size)}</span>
                      {b.isFull && (
                        <span style={{ color: "#34d399", fontWeight: "700" }}>🌟 شامل</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleDownloadBackup(b.filename)}
                    className="glass-btn"
                    title="تحميل الملف للجهاز"
                    style={{ padding: "8px 14px", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-main)", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    ⬇️ تحميل
                  </button>
                  <button
                    onClick={() => handleRestoreFromBackupFile(b.filename)}
                    disabled={actionLoading === `restore-${b.filename}`}
                    className="glass-btn"
                    title="استعادة هذه النسخة"
                    style={{ padding: "8px 14px", background: "rgba(16, 185, 129, 0.1)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "700" }}
                  >
                    {actionLoading === `restore-${b.filename}` ? "جاري الاسترجاع..." : "🔄 استعادة"}
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(b.filename)}
                    disabled={actionLoading === `delete-${b.filename}`}
                    className="glass-btn"
                    title="حذف النسخة من السيرفر"
                    style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", fontSize: "0.85rem" }}
                  >
                    {actionLoading === `delete-${b.filename}` ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP DELETION MODAL */}
      {backupOtpModal.isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "16px", padding: "28px", width: "90%", maxWidth: "460px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <h3 style={{ color: "#f87171", marginBottom: "12px", textAlign: "center", fontSize: "1.2rem", fontWeight: "800" }}>
              🔒 تأكيد الأمان والحذف
            </h3>

            <div style={{ padding: "12px 14px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px", color: "#4ade80", fontSize: "0.86rem", lineHeight: "1.6", textAlign: "center", marginBottom: "18px" }}>
              📲 {backupOtpModal.message}
            </div>

            <form onSubmit={handleConfirmBackupOtp}>
              <input
                type="text"
                placeholder="أدخل كود 6 أرقام"
                value={backupOtpCode}
                onChange={(e) => setBackupOtpCode(e.target.value)}
                maxLength={6}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #444", background: "#000", color: "#fff", textAlign: "center", fontSize: "1.2rem", marginBottom: "15px" }}
              />
              {backupOtpError && <div style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "10px" }}>{backupOtpError}</div>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={backupOtpLoading} style={{ flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700" }}>
                  {backupOtpLoading ? "جاري..." : "تأكيد الحذف"}
                </button>
                <button type="button" onClick={() => setBackupOtpModal({ isOpen: false, filename: "", message: "" })} style={{ padding: "12px 20px", background: "transparent", color: "#888", border: "1px solid #444", borderRadius: "10px" }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewBackup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "30px", width: "90%", maxWidth: "600px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflowY: "auto", maxHeight: "85vh" }}>
            <h2 style={{ color: "var(--primary-color)", marginBottom: "15px", textAlign: "center" }}>📊 تحليل ملف النسخة الاحتياطية</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-muted)" }}>الملف المختار: <strong dir="ltr">{previewBackup.filename}</strong></p>

            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "15px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
              {previewBackup.summary.map(item => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <span style={{ fontWeight: "700", color: "var(--text-muted)", fontSize: "0.85rem" }}>{item.name}</span>
                  <span style={{ fontWeight: "900", color: "var(--accent-green)", fontSize: "0.95rem" }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "15px", borderRadius: "12px", border: "1px solid var(--danger-color)", marginBottom: "20px", textAlign: "center" }}>
              <strong style={{ color: "var(--danger-color)", display: "block", marginBottom: "5px" }}>⚠️ تنبيه استرجاع شامل</strong>
              سيتم استبدال وحذف أي بيانات حالية في قاعدة البيانات الخاصة بهذه الجداول وكتابة البيانات المرفوعة.
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button onClick={executeRestoreUpload} disabled={actionLoading === "restore-upload"} className="glass-btn" style={{ flex: 1, padding: "15px", background: "#10b981", color: "#fff", fontWeight: "800", borderRadius: "12px", fontSize: "1rem" }}>
                {actionLoading === "restore-upload" ? "جاري الاسترجاع..." : "🚀 تأكيد الاسترجاع الآن"}
              </button>
              <button onClick={() => setPreviewBackup(null)} disabled={actionLoading === "restore-upload"} className="glass-btn" style={{ padding: "15px 25px", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: "700", borderRadius: "12px" }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
