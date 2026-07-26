import React, { useState, useEffect, useCallback } from "react";

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
    if (!confirm(`هل أنت متأكد من حذف نسخة الاحتياط (${filename}) نهائياً من السيرفر؟`)) return;
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

    if (
      !confirm(
        `⚠️ تنبيه هام جداً:\n\nسيتم مسح كافة بيانات الموقع واسترجاعها بالكامل من ملف النسخة الاحتياطية المختار (${file.name})!\n\nهل أنت متأكد تماماً من المتابعة؟`
      )
    ) {
      e.target.value = "";
      return;
    }

    setActionLoading("restore-upload");
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        if (!backupData.tables) {
          throw new Error("ملف النسخة الاحتياطية غير صالح (لا يحتوي على جداول).");
        }

        const response = await fetch(`${API_BASE_URL}/api/backups/restore/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ backupData }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "فشل استعادة البيانات.");

        setSuccessMsg("🎉 تم استرجاع النسخة الاحتياطية المرفوعة بنجاح تام!");
        alert("تمت استعادة النسخة الاحتياطية بنجاح! 🔄 سيتم إعادة تحميل الصفحة لتطبيق التغييرات.");
        window.location.reload();
      } catch (err) {
        setErrorMsg(err.message || "حدث خطأ أثناء فك وقراءة الملف أو استرجاعه.");
      } finally {
        setActionLoading(null);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
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

      {/* Backup Control Card */}
      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)", display: "flex", flexWrap: "wrap", gap: "25px", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: "1 1 500px" }}>
          <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "10px", color: "#60a5fa", display: "flex", alignItems: "center", gap: "8px" }}>
            💾 النسخ الاحتياطي التلقائي واليدوي
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: "1.6" }}>
            يقوم النظام بحفظ جميع جداول قاعدة البيانات (العملاء والطلبات والخدمات والأرصدة والمعاملات والبانرات) بالإضافة إلى جميع الصور والملفات المرفوعة على الموقع وتجميعها بالكامل في ملف واحد جاهز للتنزيل أو الاستعادة المباشرة.
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={actionLoading !== null}
          className="btn-add-premium"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            boxShadow: "0 6px 20px rgba(59, 130, 246, 0.25)",
            padding: "14px 28px",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "220px",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
        >
          {actionLoading === "create" ? "⏳ جاري إنشاء النسخة..." : "+ إنشاء نسخة احتياطية فورية"}
        </button>
      </div>

      {/* Restore from Uploaded File Card */}
      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)" }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "12px", color: "#f43f5e", display: "flex", alignItems: "center", gap: "8px" }}>
          📤 استعادة نسخة احتياطية من ملف محلي (جهاز الكمبيوتر)
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px", lineHeight: "1.5" }}>
          إذا كان لديك ملف نسخة احتياطية تم تنزيله سابقاً من هذا الموقع أو موقع آخر مطابق، يمكنك رفعه هنا لاستعادة كافة البيانات فورياً.
        </p>

        <div style={{ position: "relative", border: "2px dashed rgba(244, 63, 94, 0.25)", borderRadius: "14px", padding: "30px", textAlign: "center", background: "rgba(244, 63, 94, 0.02)", cursor: "pointer", transition: "all 0.3s" }} className="upload-zone-premium">
          <input
            type="file"
            accept=".json"
            onChange={handleLocalFileRestore}
            disabled={actionLoading !== null}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "2.5rem" }}>📄</span>
            <span style={{ color: "#f43f5e", fontWeight: "700", fontSize: "0.95rem" }}>
              {actionLoading === "restore-upload" ? "⏳ جاري قراءة واستعادة البيانات..." : "اختر ملف النسخة الاحتياطية الممتد بصيغة (.json) لبدء الاستعادة"}
            </span>
            <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
              (سيتم مسح الجداول الحالية وتعويضها بالكامل ببيانات الملف المرفوع)
            </span>
          </div>
        </div>
      </div>

      {/* Available Server Backups Card */}
      <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "20px", padding: "30px", backdropFilter: "blur(25px)" }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "20px", color: "#cbd5e1" }}>
          🗄️ النسخ الاحتياطية المتوفرة على السيرفر
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>جاري تحميل النسخ الاحتياطية...</div>
        ) : backups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: "0.88rem", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "14px" }}>
            لا توجد ملفات نسخ احتياطي محفوظة حالياً على السيرفر.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {backups.map((backup) => (
              <div
                key={backup.filename}
                style={{
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                  transition: "all 0.3s",
                }}
                className="backup-item-row"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <span style={{ fontFamily: "monospace", color: "#ffffff", fontWeight: "700", fontSize: "0.9rem", wordBreak: "break-all" }}>{backup.filename}</span>
                  <div style={{ display: "flex", gap: "15px", fontSize: "0.78rem", color: "#94a3b8" }}>
                    <span>📦 الحجم: <b style={{ color: "#cbd5e1" }}>{formatBytes(backup.size)}</b></span>
                    <span>📅 التاريخ: <b style={{ color: "#cbd5e1" }}>{formatDate(backup.createdAt)}</b></span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleDownloadBackup(backup.filename)}
                    disabled={actionLoading !== null}
                    className="action-btn btn-edit-premium"
                    style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    📥 تنزيل
                  </button>
                  <button
                    onClick={() => handleRestoreFromBackupFile(backup.filename)}
                    disabled={actionLoading !== null}
                    className="action-btn btn-success-premium"
                    style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {actionLoading === `restore-${backup.filename}` ? "⏳ جاري الاسترجاع..." : "🔄 استعادة"}
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.filename)}
                    disabled={actionLoading !== null}
                    className="action-btn btn-danger-premium"
                    style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    {actionLoading === `delete-${backup.filename}` ? "⏳ حذف..." : "🗑️ حذف"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Deletion OTP Modal */}
      {backupOtpModal.isOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "28px", borderRadius: "20px", border: "1px solid rgba(239, 68, 68, 0.4)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: "12px" }}>
                🔒
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#fff", margin: 0 }}>تأكيد حذف النسخة الاحتياطية</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "6px" }}>حماية كود الواتساب (OTP)</p>
            </div>

            <div style={{ padding: "12px 14px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px", color: "#4ade80", fontSize: "0.86rem", lineHeight: "1.6", textAlign: "center", marginBottom: "18px" }}>
              📲 {backupOtpModal.message}
            </div>

            <form onSubmit={handleConfirmBackupOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", textAlign: "center", fontWeight: "700", marginBottom: "8px", color: "#f87171" }}>
                  أدخل كود التحقق (6 أرقام):
                </label>
                <input
                  type="text"
                  placeholder="1 2 3 4 5 6"
                  maxLength={6}
                  value={backupOtpCode}
                  onChange={(e) => setBackupOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "1.6rem",
                    letterSpacing: "8px",
                    fontWeight: "800",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "2px solid #f87171",
                    color: "#fff"
                  }}
                  autoFocus
                  required
                />
              </div>

              {backupOtpError && (
                <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.15)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                  ❌ {backupOtpError}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="submit"
                  disabled={backupOtpLoading || backupOtpCode.length < 6}
                  className="glass-btn"
                  style={{ flex: 1, padding: "14px", background: "#ef4444", color: "#fff", fontWeight: "800", borderRadius: "12px", fontSize: "0.95rem" }}
                >
                  {backupOtpLoading ? "جاري التحقق والتنفيذ..." : "🚀 تأكيد وحذف الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => { setBackupOtpModal({ isOpen: false, filename: "", message: "" }); setBackupOtpCode(""); setBackupOtpError(""); }}
                  className="glass-btn"
                  style={{ padding: "14px 20px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", fontWeight: "700", borderRadius: "12px" }}
                >
                  إلغاء ✕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
