"use client";

import { useState, useDeferredValue, useEffect, useMemo, useRef, useCallback } from "react";
import { getServiceRequiredFields } from "../providers/ProvidersClient";
import { takeInitialGroups } from "../../../../../lib/service-list-window";
import AddBundleModal from "./AddBundleModal";
import CatalogImageControl from "@/components/admin/CatalogImageControl";
import { StorePagesAdminProvider, StorePagePlacementControl } from '@/components/admin/StorePageAssignments';

export default function ServicesPage() { return <StorePagesAdminProvider><ServicesManager /></StorePagesAdminProvider>; }
function ServicesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [visiblePackageCounts, setVisiblePackageCounts] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // State to manage expanded packages (groupNames)
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  // Edit Service Modal State
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editCredit, setEditCredit] = useState<number>(0);
  const [editMargin, setEditMargin] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
interface EditCustomField {
  id?: string;
  field_id?: string;
  fieldname: string;
  label: string;
  fieldtype: string;
  type?: string;
  required: boolean;
  options?: string[];
  optionsStr?: string;
}

  const [editFields, setEditFields] = useState<EditCustomField[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filter state (all, active, hidden, zeroPrice)
  const [filterType, setFilterType] = useState<"all" | "active" | "hidden" | "zeroPrice">("all");

  // Sync from Provider State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Delete All Services Modal State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Bulk Margin Modal State
  const [isBulkMarginModalOpen, setIsBulkMarginModalOpen] = useState(false);
  const [bulkMarginType, setBulkMarginType] = useState<"percentage" | "fixed" | "replace">("percentage");
  const [bulkMarginValue, setBulkMarginValue] = useState<string>("10");
  const [bulkMarginApplyTo, setBulkMarginApplyTo] = useState<"all" | "active">("all");
  const [isApplyingBulkMargin, setIsApplyingBulkMargin] = useState(false);

  // Add Bundle Modal State
  const [isAddBundleModalOpen, setIsAddBundleModalOpen] = useState(false);

  // Delete Single Service State
  const [deletingService, setDeletingService] = useState<any | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  const updateCatalogImage = (categoryId: string, groupName: string, serviceId: string | null, url: string | null) => {
    setCategories(previous => previous.map(category => category.id !== categoryId ? category : {
      ...category, services: category.services.map((service: any) => serviceId
        ? service.id === serviceId ? { ...service, imageUrl: url } : service
        : service.groupName === groupName ? { ...service, groupImageUrl: url } : service)
    }));
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dhru/services?all=true", {
        headers: { "Cache-Control": "no-cache" }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync from Dhru Provider
  const handleSyncDhruServices = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/dhru/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تمت المزامنة بنجاح! تم استيراد ${data.count || 0} خدمة.`);
        setIsSyncModalOpen(false);
        await fetchServices();
      } else {
        showToast(data.error || "فشلت عملية المزامنة مع المزود", "error");
      }
    } catch (err: any) {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر للمزامنة", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete All Services
  const handleDeleteAllServices = async () => {
    setIsDeletingAll(true);
    try {
      const res = await fetch("/api/dhru/services/delete-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories([]);
        setIsDeleteAllModalOpen(false);
        showToast(data.message || "تم حذف كافة الخدمات والأقسام بنجاح!");
      } else {
        showToast(data.error || "حدث خطأ أثناء حذف الخدمات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لحذف الخدمات", "error");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Delete Single Service
  const handleDeleteService = async () => {
    if (!deletingService) return;
    setIsDeletingService(true);
    try {
      const res = await fetch("/api/dhru/services/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: deletingService.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev
            .map((cat) => ({
              ...cat,
              services: cat.services.filter((s: any) => s.id !== deletingService.id)
            }))
            .filter((cat) => cat.services.length > 0)
        );
        showToast(data.message || `تم حذف الخدمة (${deletingService.name}) بنجاح`);
        setDeletingService(null);
      } else {
        showToast(data.error || "فشل حذف الخدمة", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لحذف الخدمة", "error");
    } finally {
      setIsDeletingService(false);
    }
  };

  // Bulk Apply Profit Margin to All Services
  const handleApplyBulkMargin = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bulkMarginValue);
    if (isNaN(val) || val < 0) {
      alert("يرجى إدخال قيمة صحيحة لهامش الربح");
      return;
    }

    setIsApplyingBulkMargin(true);
    try {
      const res = await fetch("/api/dhru/services/bulk-margin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: bulkMarginType,
          value: val,
          applyTo: bulkMarginApplyTo
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تم تطبيق هامش الربح على ${data.updatedCount || 0} خدمة بنجاح!`);
        setIsBulkMarginModalOpen(false);
        await fetchServices();
      } else {
        showToast(data.error || "فشل تطبيق هامش الربح", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لتحديث هوامش الربح", "error");
    } finally {
      setIsApplyingBulkMargin(false);
    }
  };

  // Toggle single service visibility
  const toggleVisibility = async (service: any) => {
    const nextState = !service.isActive;
    setActionLoadingKey(service.id);

    try {
      const res = await fetch("/api/dhru/services/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, isActive: nextState })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            services: cat.services.map((s: any) =>
              s.id === service.id ? { ...s, isActive: nextState } : s
            )
          }))
        );
        showToast(nextState ? `تم إظهار الخدمة (${service.name}) للعملاء` : `تم إخفاء الخدمة (${service.name}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تغيير حالة الخدمة", "error");
      }
    } catch (err) {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Toggle entire package (group) visibility
  const togglePackageVisibility = async (groupName: string, categoryId: string, currentAllActive: boolean) => {
    const nextState = !currentAllActive;
    const actionKey = `pkg-${categoryId}-${groupName}`;
    setActionLoadingKey(actionKey);

    try {
      const res = await fetch("/api/dhru/services/toggle-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, categoryId, isActive: nextState })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              services: cat.services.map((s: any) =>
                s.groupName === groupName ? { ...s, isActive: nextState } : s
              )
            };
          })
        );
        showToast(nextState ? `تم إظهار جميع خدمات باقة (${groupName}) للعملاء` : `تم إخفاء جميع خدمات باقة (${groupName}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تغيير حالة الباقة", "error");
      }
    } catch (err) {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setEditName(service.name || "");
    setEditCredit(Number(service.credit) || 0);
    setEditMargin(Number(service.margin) || 0);
    setEditIsActive(service.isActive !== false);
    // تحليل الحقول المخصصة الحالية للخدمة
    try {
      if (service.requiresCustom) {
        const parsed = typeof service.requiresCustom === 'string' ? JSON.parse(service.requiresCustom) : service.requiresCustom;
        const fields = Array.isArray(parsed)
          ? parsed.map((f: any, idx: number) => {
              const rawOpts = f?.options || f?.fieldoptions;
              const optsList = Array.isArray(rawOpts)
                ? rawOpts.map((o: any) => String(o?.value || o || '').trim()).filter(Boolean)
                : (typeof rawOpts === 'string' && rawOpts.trim() ? rawOpts.split(/[\r\n,|]+/).map((s: string) => s.trim()).filter(Boolean) : []);
              return {
                id: f?.id || f?.field_id || f?.fieldname || `field_${idx + 1}`,
                field_id: f?.field_id || f?.reqid || f?.id || f?.fieldname || `field_${idx + 1}`,
                fieldname: f?.fieldname || f?.field_id || f?.name || f?.reqid || `field_${idx + 1}`,
                label: f?.label || f?.name || f?.fieldname || f?.field_id || `حقل ${idx + 1}`,
                fieldtype: f?.fieldtype || f?.type || (optsList.length > 0 ? 'select' : 'text'),
                type: f?.type || f?.fieldtype || (optsList.length > 0 ? 'select' : 'text'),
                required: f?.required === true || f?.required === 1 || f?.required === '1' || f?.required === 'on' || f?.required !== false,
                options: optsList,
                optionsStr: optsList.join(', ')
              };
            })
          : Object.entries(parsed).map(([k, v]: any) => {
              const rawOpts = v?.options || v?.fieldoptions;
              const optsList = Array.isArray(rawOpts)
                ? rawOpts.map((o: any) => String(o?.value || o || '').trim()).filter(Boolean)
                : (typeof rawOpts === 'string' && rawOpts.trim() ? rawOpts.split(/[\r\n,|]+/).map((s: string) => s.trim()).filter(Boolean) : []);
              return {
                id: v?.id || v?.field_id || k,
                field_id: v?.field_id || v?.reqid || v?.id || k,
                fieldname: v?.fieldname || k,
                label: v?.label || v?.name || k,
                fieldtype: v?.fieldtype || v?.type || (optsList.length > 0 ? 'select' : 'text'),
                type: v?.type || v?.fieldtype || (optsList.length > 0 ? 'select' : 'text'),
                required: v?.required === true || v?.required === 1 || v?.required === '1' || v?.required === 'on' || v?.required !== false,
                options: optsList,
                optionsStr: optsList.join(', ')
              };
            });
        setEditFields(fields);
      } else {
        setEditFields([]);
      }
    } catch {
      setEditFields([]);
    }
  };

  // Save Service Edits
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSavingEdit(true);
    try {
      // بناء requiresCustom JSON من الحقول المعدّلة
      let requiresCustom: string | null = null;
      if (editFields.length > 0) {
        const fieldsList = editFields.map((f, idx) => {
          const rawKey = String(f.fieldname || f.field_id || `field_${idx + 1}`).trim().replace(/\s+/g, '_');
          const opts = f.optionsStr
            ? f.optionsStr.split(/[\r\n,|]+/).map((o: string) => o.trim()).filter(Boolean)
            : (Array.isArray(f.options) ? f.options : []);

          return {
            id: f.id || `custom_${rawKey}`,
            field_id: f.field_id || rawKey,
            fieldname: rawKey,
            name: (f.label && String(f.label).trim()) || rawKey,
            label: (f.label && String(f.label).trim()) || rawKey,
            type: f.fieldtype || 'text',
            fieldtype: f.fieldtype || 'text',
            required: Boolean(f.required),
            ...(opts.length > 0 ? { options: opts, fieldoptions: opts } : {})
          };
        });
        requiresCustom = fieldsList.length > 0 ? JSON.stringify(fieldsList) : null;
      }

      const res = await fetch("/api/dhru/services/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: editingService.id,
          name: editName,
          credit: editCredit,
          margin: editMargin,
          isActive: editIsActive,
          requiresCustom
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const finalCalculated = Number((Number(editCredit) + Number(editMargin)).toFixed(2));
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            services: cat.services.map((s: any) =>
              s.id === editingService.id ? { 
                ...s, 
                name: editName, 
                credit: Number(editCredit), 
                margin: Number(editMargin),
                price: finalCalculated,
                finalPrice: finalCalculated,
                isActive: editIsActive,
                requiresCustom
              } : s
            )
          }))
        );
        showToast("تم حفظ تعديلات الخدمة والأسعار بنجاح!");
        setEditingService(null);
      } else {
        showToast(data.error || "فشل حفظ التعديلات", "error");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const togglePackage = (packageKey: string) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageKey]: !prev[packageKey]
    }));
  };

  // Filtered categories & services based on search query and filterType
  const filteredCategories = useMemo(() => {
    let result = categories;

    if (filterType === "active") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => s.isActive)
      }));
    } else if (filterType === "hidden") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => !s.isActive)
      }));
    } else if (filterType === "zeroPrice") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => (Number(s.credit) || 0) + (Number(s.margin) || 0) === 0)
      }));
    }

    if (!deferredSearchQuery.trim()) {
      return result.filter((cat) => (cat.services || []).length > 0);
    }

    const query = deferredSearchQuery.trim().toLowerCase();
    return result
      .map((cat) => {
        const matchingServices = (cat.services || []).filter(
          (s: any) =>
            s.name.toLowerCase().includes(query) ||
            s.groupName.toLowerCase().includes(query) ||
            (s.originalName && s.originalName.toLowerCase().includes(query))
        );
        return { ...cat, services: matchingServices };
      })
      .filter((cat) => cat.services.length > 0);
  }, [categories, deferredSearchQuery, filterType]);

  const totalServicesCount = useMemo(() => {
    return categories.reduce((total, cat) => total + (cat.services || []).length, 0);
  }, [categories]);

  const zeroPriceCount = useMemo(() => {
    return categories.reduce((total, cat) => {
      return total + (cat.services || []).filter((s: any) => (Number(s.credit) || 0) + (Number(s.margin) || 0) === 0).length;
    }, 0);
  }, [categories]);

  // Group services by groupName
  const getGroupedServices = (services: any[]) => {
    const groups: Record<string, any[]> = {};
    (services || []).forEach((service) => {
      if (!groups[service.groupName]) {
        groups[service.groupName] = [];
      }
      groups[service.groupName].push(service);
    });
    return groups;
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 px-5 py-4 text-sm leading-7"><strong className="text-violet-300">ظهور الباقات والخدمات في صفحات المتجر</strong><p className="text-on-surface-variant mt-1">زر «صفحات الظهور» بجانب كل باقة أو خدمة يحدد صفحاتها. الخدمة تتبع الباقة تلقائيًا، وممكن تخصص لها صفحات أو تختار الكل. أنشئ الصفحات من <a href="/admin/pages" className="text-primary underline">صفحات المتجر والقوائم</a>.</p></div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-surface font-bold ${
            toastMessage.type === "success" ? "bg-primary" : "bg-error"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Enhanced Edit Single Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                <span>تعديل بيانات وسعر الخدمة</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">اسم الخدمة المعروض للعميل</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">
                    سعر التكلفة / الأساسي ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCredit}
                    onChange={(e) => setEditCredit(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono transition-all"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">سعر المزود أو التكلفة المخصصة</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">
                    هامش الربح الإضافي ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMargin}
                    onChange={(e) => setEditMargin(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono transition-all"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">الربح المضاف فوق التكلفة</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">حالة الظهور للعملاء</label>
                <select
                  value={editIsActive ? "true" : "false"}
                  onChange={(e) => setEditIsActive(e.target.value === "true")}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="true">ظاهرة ومتاحة للعملاء في المتجر</option>
                  <option value="false">مخفية عن العملاء</option>
                </select>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>سعر التكلفة:</span>
                  <span className="font-mono font-bold">${(Number(editCredit) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>هامش الربح:</span>
                  <span className="font-mono font-bold text-secondary">+${(Number(editMargin) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary font-bold pt-2 border-t border-outline-variant/20">
                  <span>السعر الإجمالي النهائي للعميل:</span>
                  <span className="font-mono text-lg font-bold">${((Number(editCredit) || 0) + (Number(editMargin) || 0)).toFixed(2)} USD</span>
                </div>
              </div>

              {/* ── قسم إدارة الحقول المخصصة للخدمة ── */}
              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden">
                <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-secondary">input</span>
                    <span className="text-xs font-bold text-on-surface">حقول الإدخال للعميل عند الشراء</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = editFields.length + 1;
                      const newKey = `field_${Date.now()}`;
                      setEditFields(prev => [
                        ...prev,
                        {
                          id: newKey,
                          field_id: newKey,
                          fieldname: newKey,
                          label: `حقل مخصص ${newIdx}`,
                          fieldtype: 'text',
                          type: 'text',
                          required: true,
                          options: [],
                          optionsStr: ''
                        }
                      ]);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    إضافة حقل
                  </button>
                </div>

                {editFields.length === 0 ? (
                  <div className="px-4 py-5 text-center text-xs text-on-surface-variant">
                    لا توجد حقول مخصصة — العميل يُدخل IMEI تلقائياً من حقل الهدف
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/20">
                    {editFields.map((field, idx) => (
                      <div key={idx} className="p-3 space-y-2 bg-surface">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-1">اسم الحقل (يظهر للعميل)</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => setEditFields(prev => prev.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                              placeholder="مثال: رقم IMEI"
                              className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-1">المفتاح التقني (fieldname)</label>
                            <input
                              type="text"
                              value={field.fieldname}
                              onChange={e => setEditFields(prev => prev.map((f, i) => i === idx ? { ...f, fieldname: e.target.value.replace(/\s+/g, '_') } : f))}
                              placeholder="مثال: imei"
                              className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-lg text-xs font-mono outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-1">نوع الحقل</label>
                            <select
                              value={field.fieldtype}
                              onChange={e => setEditFields(prev => prev.map((f, i) => i === idx ? { ...f, fieldtype: e.target.value } : f))}
                              className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                            >
                              <option value="text">نص (text)</option>
                              <option value="number">رقم (number)</option>
                              <option value="textarea">نص طويل (textarea)</option>
                              <option value="select">اختيار (select)</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={e => setEditFields(prev => prev.map((f, i) => i === idx ? { ...f, required: e.target.checked } : f))}
                              className="w-4 h-4 accent-primary"
                              id={`req_${idx}`}
                            />
                            <label htmlFor={`req_${idx}`} className="text-xs text-on-surface-variant cursor-pointer">إجباري</label>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditFields(prev => prev.filter((_, i) => i !== idx))}
                            className="mt-4 p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        {field.fieldtype === 'select' && (
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-1">
                              خيارات القائمة المنسدلة (مفصولة بفاصلة)
                            </label>
                            <input
                              type="text"
                              value={field.optionsStr || ""}
                              onChange={e => {
                                const val = e.target.value;
                                const opts = val.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);
                                setEditFields(prev => prev.map((f, i) => i === idx ? { ...f, optionsStr: val, options: opts } : f));
                              }}
                              placeholder="مثال: خيار 1, خيار 2, خيار 3"
                              className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSavingEdit ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  <span>حفظ وتطبيق التعديلات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK PROFIT MARGIN MODAL */}
      {isBulkMarginModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-primary/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">إضافة هامش ربح لكل الخدمات دفعة واحدة</h3>
                  <p className="text-xs text-on-surface-variant">تطبيق هامش ربح مالي أو نسبة مئوية لجميع الخدمات المسجلة</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBulkMarginModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleApplyBulkMargin} className="space-y-4">
              {/* Margin Type Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">طريقة حساب هامش الربح</label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkMarginType("percentage");
                      setBulkMarginValue("15");
                    }}
                    className={`py-2.5 rounded-lg transition-all ${
                      bulkMarginType === "percentage" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    نسبة مئوية (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkMarginType("fixed");
                      setBulkMarginValue("1.50");
                    }}
                    className={`py-2.5 rounded-lg transition-all ${
                      bulkMarginType === "fixed" ? "bg-violet-500 text-white shadow" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    إضافة مبلغ (+ $)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkMarginType("replace");
                      setBulkMarginValue("2.00");
                    }}
                    className={`py-2.5 rounded-lg transition-all ${
                      bulkMarginType === "replace" ? "bg-secondary text-white shadow" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    تعيين مبلغ موحد ($)
                  </button>
                </div>
              </div>

              {/* Margin Value Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant">
                  {bulkMarginType === "percentage"
                    ? "النسبة المئوية المضافة على سعر التكلفة (%):"
                    : bulkMarginType === "fixed"
                    ? "المبلغ المالي المراد إضافته فوق الربح الحالي ($ USD):"
                    : "قيمة هامش الربح الموحد لجميع الخدمات ($ USD):"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary">
                    {bulkMarginType === "percentage" ? "%" : "$"}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={bulkMarginValue}
                    onChange={(e) => setBulkMarginValue(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-8 pr-4 text-on-surface font-mono font-bold text-base focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Target Scope Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">نطاق التطبيق</label>
                <div className="flex gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkScope"
                      checked={bulkMarginApplyTo === "all"}
                      onChange={() => setBulkMarginApplyTo("all")}
                      className="accent-primary"
                    />
                    <span>جميع الخدمات ({totalServicesCount} خدمة)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkScope"
                      checked={bulkMarginApplyTo === "active"}
                      onChange={() => setBulkMarginApplyTo("active")}
                      className="accent-primary"
                    />
                    <span>الخدمات النشطة للعملاء فقط</span>
                  </label>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs space-y-1.5 leading-relaxed">
                <p className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-sm">info</span>
                  <span>مثال توضيحي على كيفية الحساب:</span>
                </p>
                <p className="text-on-surface-variant">
                  {bulkMarginType === "percentage"
                    ? `خدمة تكلفتها 10.00$ بنسبة ربح ${bulkMarginValue || 0}% سيصبح هامش ربحها $${(((10 * (parseFloat(bulkMarginValue) || 0)) / 100)).toFixed(2)} وسعرها للعميل $${(10 + ((10 * (parseFloat(bulkMarginValue) || 0)) / 100)).toFixed(2)}.`
                    : bulkMarginType === "fixed"
                    ? `خدمة هامش ربحها الحالي 1.00$ ستتم زيادة $${parseFloat(bulkMarginValue) || 0} عليه ليصبح $${(1 + (parseFloat(bulkMarginValue) || 0)).toFixed(2)}.`
                    : `سيتم تعيين هامش ربح $${parseFloat(bulkMarginValue) || 0} لجميع الخدمات المحددة مباشرة فوق سعر التكلفة.`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isApplyingBulkMargin}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isApplyingBulkMargin ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                  <span>تطبيق الهامش على كافة الخدمات</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMarginModalOpen(false)}
                  className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3.5 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ALL CONFIRMATION MODAL */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">حذف جميع الخدمات</h3>
                <p className="text-xs text-red-400 font-semibold">تحذير: إجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-2 leading-relaxed">
              <p className="font-bold">هل أنت متأكد تماماً من رغبتك في حذف كافة الخدمات ({totalServicesCount} خدمة) وجميع الأقسام من قاعدة البيانات؟</p>
              <p className="text-on-surface-variant text-[11px]">
                يمكنك إعادة جلبها ومزامنتها في أي وقت من المزود عبر الضغط على زر "مزامنة كاملة مع المزود".
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteAllServices}
                disabled={isDeletingAll}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isDeletingAll ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                <span>تأكيد حذف كل الخدمات</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                disabled={isDeletingAll}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Confirmation Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <span className="material-symbols-outlined text-2xl">sync_problem</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">مزامنة وتحديث شامل من المزود</h3>
                <p className="text-xs text-on-surface-variant">تحديث شامل لكافة الأقسام والخدمات والأسعار من Dhru API</p>
              </div>
            </div>

            <div className="space-y-3 my-6 text-sm leading-relaxed text-on-surface-variant">
              <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>تنبيه مهم قبل البدء:</span>
                </p>
                <p>
                  سيقوم هذا الإجراء بمسح جميع الخدمات والأقسام الحالية في قاعدة البيانات، وإعادة جلب كافة الأقسام والخدمات والأسعار المحدثة مباشرة من المزود.
                </p>
              </div>

              <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-xs space-y-2">
                <p className="text-on-surface font-semibold">ما الذي سيتم تحديثه؟</p>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                  <li>جلب وتحديث كافة أسعار الخدمات (الخدمات المجانية $0.00 والمدفوعة).</li>
                  <li>إضافة أي خدمات أو باقات جديدة أضافها المزود.</li>
                  <li>تحديث شروط وحقول الطلب المخصصة (Requires Custom).</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSyncDhruServices}
                disabled={isSyncing}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    <span>جاري مسح القديم وجلب الخدمات...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">cloud_sync</span>
                    <span>بدء المزامنة والتحديث الآن</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                disabled={isSyncing}
                className="bg-surface-variant text-on-surface-variant hover:text-on-surface px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Service Confirmation Modal */}
      {deletingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-error/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-error">
              <div className="w-12 h-12 rounded-2xl bg-error/20 border border-error/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">delete</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">حذف الخدمة</h3>
                <p className="text-xs text-error font-semibold">تأكيد حذف هذه الخدمة نهائياً</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-xs text-on-surface space-y-2 leading-relaxed">
              <p className="font-bold">
                هل أنت متأكد من رغبتك في حذف الخدمة التالية؟
              </p>
              <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 text-xs font-bold text-primary">
                {deletingService.name}
              </div>
              <p className="text-on-surface-variant text-[11px]">
                سيتم حذف هذه الخدمة نهائياً من قاعدة البيانات ولن يتمكن العملاء من طلبها.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteService}
                disabled={isDeletingService}
                className="flex-1 bg-error hover:bg-error/90 text-surface py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isDeletingService ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                <span>تأكيد الحذف</span>
              </button>
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                disabled={isDeletingService}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bundle Modal */}
      <AddBundleModal
        isOpen={isAddBundleModalOpen}
        onClose={() => setIsAddBundleModalOpen(false)}
        categories={categories}
        onSuccess={() => {
          showToast("تمت إضافة الباقة والخدمات بنجاح في قاعدة البيانات!");
          fetchServices();
        }}
      />

      <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 text-sm leading-7"><strong className="text-on-surface">صور الخدمات والباقات</strong><p className="text-on-surface-variant text-xs leading-6">زر «رفع صورة الباقة» يغيّر الصورة الرئيسية للباقة. وزر «رفع صورة الخدمة» يخصص صورة لخدمة بعينها. الصور تُضغط تلقائياً بصيغة WebP وتُحفظ في قاعدة البيانات، وتظهر للعميل في الكتالوج وصفحة المنتج.</p></div>
      {/* Header & Controls */}
      <div className="flex flex-col gap-5 border-b border-outline-variant/20 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">category</span>
              <span>إدارة الخدمات والأسعار</span>
            </h1>
            <p className="text-on-surface-variant text-xs md:text-sm">
              التحكم في أسعار الخدمات، تعيين هوامش الربح للكل، وإظهار أو إخفاء الباقات والخدمات للعملاء ({totalServicesCount} خدمة مسجلة)
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* ADD BUNDLE BUTTON */}
            <button
              onClick={() => setIsAddBundleModalOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-on-primary px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              title="إضافة باقة جديدة وخدمات مخصصة بحقول إدخال"
            >
              <span className="material-symbols-outlined text-sm">add_box</span>
              <span>إضافة باقة جديدة</span>
            </button>

            {/* BULK MARGIN BUTTON */}
            <button
              onClick={() => setIsBulkMarginModalOpen(true)}
              disabled={loading || totalServicesCount === 0}
              className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              title="إضافة أو تعديل هامش الربح لجميع الخدمات دفعة واحدة"
            >
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>إضافة هامش ربح للكل</span>
            </button>

            {/* SYNC FROM PROVIDER BUTTON */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              disabled={isSyncing || loading}
              className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="مسح وتحديث الخدمات والأسعار من مزود Dhru"
            >
              <span className={`material-symbols-outlined text-sm ${isSyncing ? "animate-spin" : ""}`}>
                {isSyncing ? "refresh" : "cloud_sync"}
              </span>
              <span>{isSyncing ? "جاري المزامنة..." : "مزامنة من المزود"}</span>
            </button>

            {/* DELETE ALL BUTTON */}
            <button
              onClick={() => setIsDeleteAllModalOpen(true)}
              disabled={loading || totalServicesCount === 0}
              className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              title="حذف جميع الخدمات والأقسام من قاعدة البيانات"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              <span>حذف كل الخدمات</span>
            </button>

            {/* Live Search Box */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                search
              </span>
              <input
                type="text"
                placeholder="بحث بالاسم أو الباقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant hover:text-on-surface"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "all"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            <span>جميع الخدمات ({totalServicesCount})</span>
          </button>

          <button
            onClick={() => setFilterType("active")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "active"
                ? "bg-violet-500 text-white shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>النشطة للعملاء فقط</span>
          </button>

          <button
            onClick={() => setFilterType("hidden")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "hidden"
                ? "bg-amber-500 text-black shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            <span>المخفية عن العملاء</span>
          </button>

          <button
            onClick={() => setFilterType("zeroPrice")}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "zeroPrice"
                ? "bg-error text-surface shadow-md"
                : "bg-surface-container border border-error/30 text-error hover:bg-error/10"
            }`}
          >
            <span className="material-symbols-outlined text-sm">price_change</span>
            <span>خدمات بسعر $0.00</span>
            {zeroPriceCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${filterType === "zeroPrice" ? "bg-black/30 text-white" : "bg-error/20 text-error"}`}>
                {zeroPriceCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 text-primary bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
            <span className="text-sm font-medium text-on-surface-variant">جاري تحميل قائمة الخدمات...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="p-16 text-center bg-surface-container rounded-3xl border border-outline-variant/30 text-on-surface-variant space-y-3">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">category</span>
            <p className="font-bold text-base text-on-surface">لا توجد خدمات مسجلة حالياً</p>
            <p className="text-xs max-w-md mx-auto">
              يمكنك جلب كافة الخدمات والأسعار مباشرة بالضغط على زر "مزامنة من المزود" أو استيرادها من ملف النسخة الاحتياطية.
            </p>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md"
            >
              مزامنة الخدمات الآن
            </button>
          </div>
        )}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="space-y-8">
            {filteredCategories.map((category: any, idx: number) => {
              const groupedServices = getGroupedServices(category.services);
              const groupEntries = Object.entries(groupedServices) as [string, any[]][];
              const categoryKey = String(category.id || idx);
              const visiblePackageCount = visiblePackageCounts[categoryKey] || 16;
              const visibleGroupEntries: [string, any[]][] = takeInitialGroups(groupEntries, visiblePackageCount);

              return (
                <div key={category.id || idx} className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-outline-variant/30">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        {category.name.toLowerCase().includes("imei")
                          ? "phone_iphone"
                          : category.name.toLowerCase().includes("server")
                          ? "dns"
                          : "cast"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-on-surface">{category.name}</h3>
                      <p className="text-on-surface-variant text-sm mt-1">{category.services.length} خدمة في هذا القسم</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {visibleGroupEntries.map(([groupName, packageServices], groupIdx) => {
                      const packageKey = `${category.id}-${groupName}`;
                      const actionKey = `pkg-${category.id}-${groupName}`;
                      const isExpanded = expandedPackages[packageKey] || false;
                      const visibleServices = isExpanded ? packageServices : packageServices.slice(0, 4);
                      const hiddenCount = packageServices.length - visibleServices.length;

                      const activeServicesCount = packageServices.filter((s: any) => s.isActive).length;
                      const isAllHidden = activeServicesCount === 0;

                      return (
                        <div
                          key={groupIdx}
                          className={`border rounded-2xl p-5 transition-all ${
                            isAllHidden
                              ? "bg-surface-container-lowest/50 border-error/20 opacity-70"
                              : "bg-surface/50 border-outline-variant/20"
                          }`}
                        >
                          {/* Package / Group Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/10">
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined ${isAllHidden ? "text-error" : "text-secondary"}`}>
                                {isAllHidden ? "folder_off" : "folder"}
                              </span>
                              <div>
                                <h4 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                                  <span>{groupName}</span>
                                  {isAllHidden && (
                                    <span className="text-[10px] bg-error/15 text-error px-2 py-0.5 rounded-md font-bold">
                                      الباقة بالكامل مخفية
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                                  <span>{packageServices.length} خدمات</span>
                                  <span>•</span>
                                  <span className="text-primary font-medium">{activeServicesCount} نشطة</span>
                                  {packageServices.length - activeServicesCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-error font-medium">
                                        {packageServices.length - activeServicesCount} مخفية
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <CatalogImageControl label="الباقة" imageUrl={packageServices.find((service: any) => service.groupImageUrl)?.groupImageUrl}
                              target={{ categoryId: category.id, groupName }} onSaved={url => updateCatalogImage(category.id, groupName, null, url)} />
                            <StorePagePlacementControl target={{ categoryId: category.id, groupName }} label={groupName} />
                            {/* Package Action Button (Hide / Show Entire Group) */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePackageVisibility(groupName, category.id, !isAllHidden)}
                                disabled={actionLoadingKey === actionKey}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                                  !isAllHidden
                                    ? "bg-error/10 text-error hover:bg-error/20 border border-error/30"
                                    : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/40"
                                }`}
                                title={!isAllHidden ? "إخفاء كل خدمات هذه الباقة عن العملاء" : "إظهار كل خدمات هذه الباقة للعملاء"}
                              >
                                {actionLoadingKey === actionKey ? (
                                  <span className="material-symbols-outlined animate-spin text-xs">refresh</span>
                                ) : (
                                  <span className="material-symbols-outlined text-xs">
                                    {!isAllHidden ? "visibility_off" : "visibility"}
                                  </span>
                                )}
                                <span>{!isAllHidden ? "إخفاء الباقة بالكامل" : "إظهار الباقة بالكامل"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Services List */}
                          <div className="grid grid-cols-1 gap-3">
                            {visibleServices.map((service: any) => {
                              const srvCost = Number(service.credit) || 0;
                              const srvMargin = Number(service.margin) || 0;
                              const srvTotal = Number((srvCost + srvMargin).toFixed(2));
                              const isZeroPrice = srvTotal === 0;

                              return (
                                <div
                                  key={service.id}
                                  className={`bg-surface p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    !service.isActive
                                      ? "border-error/30 bg-error/5 opacity-60"
                                      : isZeroPrice
                                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                                      : "border-outline-variant/30 hover:border-primary/50"
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="font-bold text-on-surface flex items-center gap-2 text-sm flex-wrap">
                                      <span>{service.name}</span>
                                      {!service.isActive && (
                                        <span className="text-[11px] bg-error/15 text-error px-2 py-0.5 rounded-md font-bold">
                                          مخفي عن العميل
                                        </span>
                                      )}
                                      {isZeroPrice && (
                                        <span className="text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">warning</span>
                                          <span>السعر $0.00 (يحتاج ضبط)</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-secondary">schedule</span>
                                        <span>{service.time || "1-24 Hours"}</span>
                                      </span>
                                      <span className="text-[11px] text-on-surface-variant font-mono">
                                        سعر التكلفة: ${srvCost.toFixed(2)}
                                      </span>
                                      {srvMargin > 0 && (
                                        <span className="text-[11px] text-secondary font-bold font-mono">
                                          + ربح: ${srvMargin.toFixed(2)}
                                        </span>
                                      )}
                                    </div>

                                    {/* REQUIRED INPUT FIELDS FROM CUSTOMER FOR PROVIDER */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-secondary">input</span>
                                        <span>الحقول المطلوبة من العميل:</span>
                                      </span>

                                      {getServiceRequiredFields(service).map((rf, rfIdx) => (
                                        <span
                                          key={rfIdx}
                                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 font-mono ${
                                            rf.type === 'quantity'
                                              ? 'bg-secondary/15 border-secondary/40 text-secondary'
                                              : 'bg-surface-container-high border-primary/30 text-primary'
                                          }`}
                                        >
                                          {rf.type === 'quantity' ? (
                                            <span className="material-symbols-outlined text-[12px]">tag</span>
                                          ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                          )}
                                          <span>{rf.label}</span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 md:min-w-fit justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant/10">
                                    <div className="flex flex-col items-start md:items-end mr-2">
                                      <span className="text-[10px] text-on-surface-variant">السعر للعميل</span>
                                      <div
                                        className={`font-bold text-base font-price-display ${
                                          isZeroPrice ? "text-amber-400" : srvMargin > 0 ? "text-secondary" : "text-primary"
                                        }`}
                                      >
                                        ${srvTotal.toFixed(2)} USD
                                      </div>
                                    </div>

                                    {/* Toggle Single Service Button */}
                                    <button
                                      onClick={() => toggleVisibility(service)}
                                      disabled={actionLoadingKey === service.id}
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                        service.isActive
                                          ? "bg-error/10 text-error hover:bg-error/20 border border-error/20"
                                          : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
                                      }`}
                                      title={service.isActive ? "إخفاء عن العملاء" : "إظهار للعملاء"}
                                    >
                                      {actionLoadingKey === service.id ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-sm">
                                          {service.isActive ? "visibility_off" : "visibility"}
                                        </span>
                                      )}
                                    </button>

                                    <CatalogImageControl label="الخدمة" imageUrl={service.imageUrl} target={{ serviceId: service.id }} onSaved={url => updateCatalogImage(category.id, groupName, service.id, url)} />
                                    <StorePagePlacementControl target={{ serviceId: service.id }} label={service.name} />
                                    {/* Edit Single Service Button */}
                                    <button
                                      onClick={() => handleOpenEdit(service)}
                                      className="bg-surface-variant hover:bg-outline-variant/30 text-on-surface px-3 py-2 rounded-xl font-medium text-xs transition-colors flex items-center gap-1 border border-outline-variant/20"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit</span>
                                      <span>تعديل</span>
                                    </button>

                                    {/* Delete Single Service Button */}
                                    <button
                                      onClick={() => setDeletingService(service)}
                                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-error/10 text-error hover:bg-error/20 border border-error/20"
                                      title="حذف هذه الخدمة"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {hiddenCount > 0 && !isExpanded && (
                              <button
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2.5 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2"
                              >
                                <span>عرض جميع الخدمات في هذه الباقة ({hiddenCount} إضافية)...</span>
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </button>
                            )}

                            {isExpanded && hiddenCount === 0 && packageServices.length > 4 && (
                              <button
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-on-surface-variant font-bold text-xs transition-colors flex items-center justify-center gap-2"
                              >
                                <span>إخفاء الخدمات الإضافية</span>
                                <span className="material-symbols-outlined text-sm">expand_less</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {groupEntries.length > visiblePackageCount && (
                      <button
                        type="button"
                        onClick={() => setVisiblePackageCounts((prev) => ({ ...prev, [categoryKey]: visiblePackageCount + 16 }))}
                        className="w-full py-3 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-bold hover:bg-primary/10 transition-colors"
                      >
                        عرض 16 باقة إضافية ({groupEntries.length - visiblePackageCount} متبقية)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
