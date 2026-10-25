"use client";

import { useState, useEffect, useMemo } from "react";

interface FieldItem {
  label: string;
  fieldname: string;
  fieldtype: "text" | "number" | "textarea" | "select";
  required: boolean;
  optionsStr?: string;
}

interface ServiceItem {
  id: string;
  name: string;
  credit: number;
  margin: number;
  time: string;
  info: string;
  isActive: boolean;
  fields: FieldItem[];
}

interface AddBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  onSuccess: () => void;
  initialCategoryId?: string;
  initialGroupName?: string;
}

const FIELD_PRESETS = [
  { label: "معرف اللاعب (Player ID)", key: "player_id", type: "text" as const, required: true },
  { label: "معرف الحساب (User ID)", key: "user_id", type: "text" as const, required: true },
  { label: "البريد الإلكتروني", key: "email", type: "text" as const, required: true },
  { label: "رقم الهاتف / واتساب", key: "phone_number", type: "text" as const, required: true },
  { label: "سيرفر اللعبة / Zone ID", key: "server_id", type: "text" as const, required: true },
  { label: "اسم الحساب في اللعبة", key: "nickname", type: "text" as const, required: false },
  { label: "رقم IMEI للهاتف", key: "imei", type: "text" as const, required: true },
];

export default function AddBundleModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
  initialCategoryId,
  initialGroupName,
}: AddBundleModalProps) {
  const isDirectAdd = Boolean(initialGroupName);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isNewCategory, setIsNewCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [packageSelectionMode, setPackageSelectionMode] = useState<"existing" | "new">("new");
  const [bundleName, setBundleName] = useState<string>("");

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv_1",
      name: "",
      credit: 0,
      margin: 0,
      time: "1-24 Hours",
      info: "",
      isActive: true,
      fields: [],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultCatId = initialCategoryId || categories[0]?.id || "";
      setSelectedCategoryId(defaultCatId);
      setIsNewCategory(false);
      setNewCategoryName("");
      setErrorMessage(null);
      setIsSubmitting(false);

      if (initialGroupName) {
        setBundleName(initialGroupName);
        setPackageSelectionMode("existing");
      } else {
        setBundleName("");
        setPackageSelectionMode("new");
      }

      setServices([
        {
          id: `srv_${Date.now()}_1`,
          name: "",
          credit: 0,
          margin: 0,
          time: "1-24 Hours",
          info: "",
          isActive: true,
          fields: [],
        },
      ]);
    }
  }, [isOpen, initialCategoryId, initialGroupName, categories]);

  const existingPackagesInSelectedCategory = useMemo(() => {
    const selectedCat = categories.find((c: any) => c.id === selectedCategoryId);
    if (!selectedCat || !Array.isArray(selectedCat.services)) return [];
    const set = new Set<string>();
    selectedCat.services.forEach((s: any) => {
      if (s.groupName && typeof s.groupName === "string" && s.groupName.trim()) {
        set.add(s.groupName.trim());
      }
    });
    return Array.from(set);
  }, [categories, selectedCategoryId]);

  const resolvedCategoryName = useMemo(() => {
    const cat = categories.find((c: any) => c.id === selectedCategoryId);
    return cat ? cat.name : "باقات وخدمات مخصصة";
  }, [categories, selectedCategoryId]);

  if (!isOpen) return null;

  const handleAddService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: `srv_${Date.now()}_${prev.length + 1}`,
        name: "",
        credit: 0,
        margin: 0,
        time: "1-24 Hours",
        info: "",
        isActive: true,
        fields: [],
      },
    ]);
  };

  const handleRemoveService = (serviceId: string) => {
    if (services.length <= 1) return;
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleServiceChange = (serviceId: string, field: keyof ServiceItem, value: any) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, [field]: value } : s))
    );
  };

  const handleAddField = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const newFieldNum = s.fields.length + 1;
        return {
          ...s,
          fields: [
            ...s.fields,
            {
              label: "",
              fieldname: `field_${Date.now()}_${newFieldNum}`,
              fieldtype: "text",
              required: true,
              optionsStr: "",
            },
          ],
        };
      })
    );
  };

  const handleAddPresetField = (
    serviceId: string,
    preset: { label: string; key: string; type: "text"; required: boolean }
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const alreadyExists = s.fields.some(
          (f) => f.fieldname.toLowerCase() === preset.key.toLowerCase()
        );
        if (alreadyExists) return s;

        return {
          ...s,
          fields: [
            ...s.fields,
            {
              label: preset.label,
              fieldname: preset.key,
              fieldtype: preset.type,
              required: preset.required,
              optionsStr: "",
            },
          ],
        };
      })
    );
  };

  const handleRemoveField = (serviceId: string, fieldIdx: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          fields: s.fields.filter((_, idx) => idx !== fieldIdx),
        };
      })
    );
  };

  const handleFieldChange = (
    serviceId: string,
    fieldIdx: number,
    key: keyof FieldItem,
    value: any
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          fields: s.fields.map((f, idx) => {
            if (idx !== fieldIdx) return f;
            const updated = { ...f, [key]: value };
            if (key === "label" && (!f.fieldname || f.fieldname.startsWith("field_"))) {
              const slug = String(value)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_]+/gi, "_")
                .replace(/^_+|_+$/g, "");
              if (slug) {
                updated.fieldname = slug;
              }
            }
            return updated;
          }),
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanBundle = bundleName.trim();
    if (!cleanBundle) {
      setErrorMessage("يرجى إدخال اسم الباقة أو اختيار باقة موجودة");
      return;
    }

    if (isNewCategory && !newCategoryName.trim()) {
      setErrorMessage("يرجى إدخال اسم القسم الجديد");
      return;
    }

    for (let i = 0; i < services.length; i++) {
      if (!services[i].name.trim()) {
        setErrorMessage(`يرجى كتابة اسم الخدمة رقم (${i + 1})`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payloadServices = services.map((s) => ({
        name: s.name.trim(),
        credit: parseFloat(String(s.credit)) || 0,
        margin: parseFloat(String(s.margin)) || 0,
        time: s.time.trim() || "1-24 Hours",
        info: s.info.trim() || undefined,
        isActive: s.isActive,
        fields: s.fields.map((f) => ({
          label: f.label.trim() || f.fieldname,
          fieldname: (f.fieldname.trim() || "custom_field").replace(/\s+/g, "_"),
          fieldtype: f.fieldtype,
          required: f.required,
          options:
            f.fieldtype === "select" && f.optionsStr
              ? f.optionsStr
                  .split(/[\r\n,|]+/)
                  .map((o) => o.trim())
                  .filter(Boolean)
              : [],
        })),
      }));

      const res = await fetch("/api/dhru/services/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: isNewCategory ? undefined : selectedCategoryId,
          categoryName: isNewCategory ? newCategoryName.trim() : undefined,
          bundleName: cleanBundle,
          services: payloadServices,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل حفظ الباقة والخدمات في قاعدة البيانات");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ الباقة والخدمات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-4 sm:p-6 md:p-8 max-w-3xl w-full shadow-2xl max-h-[94vh] overflow-y-auto space-y-5 sm:space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">
                {isDirectAdd ? "add_circle" : "add_box"}
              </span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-on-surface">
                {isDirectAdd
                  ? `إضافة خدمة جديدة إلى باقة «${initialGroupName}»`
                  : "إضافة باقة وخدمات جديدة"}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isDirectAdd
                  ? "إضافة خدمات جديدة تابعة لهذه الباقة مباشرة مع تخصيص حقول الإدخال والأسعار"
                  : "إنشاء باقة جديدة أو الإضافة لباقة قائمة مع تخصيص حقول إدخال العملاء"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            title="إغلاق"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-error/10 border border-error/25 rounded-2xl text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Section 1: Category & Package Configuration */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">folder</span>
              <span>1. تصنيف الباقة والقسم</span>
            </h4>

            {isDirectAdd ? (
              <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-medium">القسم التابع له:</span>
                  <span className="font-bold text-on-surface bg-surface-variant px-2.5 py-1 rounded-lg">
                    {resolvedCategoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-medium">اسم الباقة المستهدفة:</span>
                  <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    {initialGroupName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                      القسم الرئيسي
                    </label>
                    <select
                      value={isNewCategory ? "__new__" : selectedCategoryId}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setIsNewCategory(true);
                        } else {
                          setIsNewCategory(false);
                          setSelectedCategoryId(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-semibold"
                    >
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__new__">+ إنشاء قسم جديد...</option>
                    </select>
                  </div>

                  {isNewCategory ? (
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                        اسم القسم الجديد
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: خدمات فري فاير وببجي"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs"
                      />
                    </div>
                  ) : existingPackagesInSelectedCategory.length > 0 ? (
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                        نوع إجراء الباقة
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface border border-outline-variant/30 rounded-xl text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setPackageSelectionMode("existing");
                            if (existingPackagesInSelectedCategory[0]) {
                              setBundleName(existingPackagesInSelectedCategory[0]);
                            }
                          }}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            packageSelectionMode === "existing"
                              ? "bg-primary text-on-primary shadow-sm"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          إضافة لباقة قائمة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPackageSelectionMode("new");
                            setBundleName("");
                          }}
                          className={`py-1.5 rounded-lg transition-all text-center ${
                            packageSelectionMode === "new"
                              ? "bg-primary text-on-primary shadow-sm"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          إنشاء باقة جديدة
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Bundle Name Field */}
                {!isNewCategory && packageSelectionMode === "existing" && existingPackagesInSelectedCategory.length > 0 ? (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                      اختر الباقة الموجودة لإضافة الخدمات إليها
                    </label>
                    <select
                      value={bundleName}
                      onChange={(e) => setBundleName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-semibold"
                    >
                      <option value="">-- اختر الباقة من هذا القسم --</option>
                      {existingPackagesInSelectedCategory.map((pkgName) => (
                        <option key={pkgName} value={pkgName}>
                          {pkgName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                      اسم الباقة / المجموعة
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: Free Fire أو باقة شحن الجواهر والشدات"
                      value={bundleName}
                      onChange={(e) => setBundleName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Services inside Bundle */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">view_list</span>
                <span>2. الخدمات التابعة لهذه الباقة ({services.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddService}
                className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-xl font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>إضافة خدمة أخرى للباقة</span>
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service, srvIdx) => {
                const totalCalculated = (
                  (parseFloat(String(service.credit)) || 0) +
                  (parseFloat(String(service.margin)) || 0)
                ).toFixed(2);

                return (
                  <div
                    key={service.id}
                    className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4"
                  >
                    {/* Service Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {srvIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-on-surface">
                          {service.name || `خدمة رقم ${srvIdx + 1}`}
                        </span>
                      </div>

                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-error hover:bg-error/10 p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                          title="حذف هذه الخدمة"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          <span>حذف الخدمة</span>
                        </button>
                      )}
                    </div>

                    {/* Service Info Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                          اسم الخدمة للعميل *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: 100 جوهره أو شحن 210 جوهرة"
                          value={service.name}
                          onChange={(e) =>
                            handleServiceChange(service.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                          مدة التنفيذ
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: فوري (1-5 دقائق) أو 1-24 Hours"
                          value={service.time}
                          onChange={(e) =>
                            handleServiceChange(service.id, "time", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                          سعر التكلفة ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={service.credit}
                          onChange={(e) =>
                            handleServiceChange(
                              service.id,
                              "credit",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs font-mono outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                          هامش الربح ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={service.margin}
                          onChange={(e) =>
                            handleServiceChange(
                              service.id,
                              "margin",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs font-mono outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                          السعر النهائي للعميل
                        </label>
                        <div className="px-3 py-2 bg-surface-container rounded-xl text-xs font-mono font-bold text-primary flex items-center justify-between border border-outline-variant/30">
                          <span>الإجمالي:</span>
                          <span>${totalCalculated} USD</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        وصف أو تعليمات الخدمة (اختياري)
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: يرجى كتابة الـ ID والتأكد من فتح الحساب"
                        value={service.info}
                        onChange={(e) =>
                          handleServiceChange(service.id, "info", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs outline-none focus:border-primary"
                      />
                    </div>

                    {/* Custom Fields Sub-section for this Service */}
                    <div className="border border-outline-variant/25 rounded-xl overflow-hidden mt-3">
                      <div className="bg-surface-container px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-secondary">
                            input
                          </span>
                          <span className="text-[11px] font-bold text-on-surface">
                            حقول الإدخال المطلوبة من العميل ({service.fields.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddField(service.id)}
                          className="flex items-center gap-1 text-[10px] bg-secondary/15 text-secondary hover:bg-secondary/25 px-2.5 py-1 rounded-lg font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                          <span>إضافة حقل يدوي</span>
                        </button>
                      </div>

                      {/* Quick Field Presets */}
                      <div className="p-2.5 bg-surface-container-lowest border-b border-outline-variant/15 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-on-surface-variant font-bold ml-1">
                          إضافة سريعة:
                        </span>
                        {FIELD_PRESETS.map((preset) => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => handleAddPresetField(service.id, preset)}
                            className="text-[10px] bg-surface hover:bg-primary/10 hover:text-primary text-on-surface-variant border border-outline-variant/30 hover:border-primary/40 px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1"
                            title={`إضافة حقل ${preset.label}`}
                          >
                            <span className="material-symbols-outlined text-[11px]">add</span>
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>

                      {service.fields.length === 0 ? (
                        <div className="p-3 text-center text-[11px] text-on-surface-variant">
                          لا توجد حقول مخصصة — اضغط على أحد أزرار الإضافة السريعة بالأعلى مثل «معرف اللاعب (Player ID)» أو «إضافة حقل يدوي»
                        </div>
                      ) : (
                        <div className="divide-y divide-outline-variant/20">
                          {service.fields.map((field, fIdx) => (
                            <div key={fIdx} className="p-3 bg-surface space-y-2.5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-on-surface-variant font-bold block mb-1">
                                    اسم الحقل (يظهر للعميل)
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="مثال: معرف اللاعب (Player ID)"
                                    value={field.label}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        service.id,
                                        fIdx,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-on-surface-variant font-bold block mb-1">
                                    المفتاح التقني (Key)
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="مثال: player_id أو user_id"
                                    value={field.fieldname}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        service.id,
                                        fIdx,
                                        "fieldname",
                                        e.target.value.replace(/\s+/g, "_")
                                      )
                                    }
                                    className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant/40 rounded-lg text-xs font-mono outline-none focus:border-primary"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex-1 min-w-[130px]">
                                  <label className="text-[10px] text-on-surface-variant font-bold block mb-1">
                                    نوع الإدخال
                                  </label>
                                  <select
                                    value={field.fieldtype}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        service.id,
                                        fIdx,
                                        "fieldtype",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                                  >
                                    <option value="text">نص (text)</option>
                                    <option value="number">رقم (number)</option>
                                    <option value="textarea">نص طويل (textarea)</option>
                                    <option value="select">قائمة منسدلة (select)</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-1.5 mt-3">
                                  <input
                                    type="checkbox"
                                    id={`req_${service.id}_${fIdx}`}
                                    checked={field.required}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        service.id,
                                        fIdx,
                                        "required",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                  />
                                  <label
                                    htmlFor={`req_${service.id}_${fIdx}`}
                                    className="text-xs text-on-surface-variant cursor-pointer"
                                  >
                                    إجباري
                                  </label>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveField(service.id, fIdx)}
                                  className="mt-3 p-1 text-error hover:bg-error/10 rounded-lg transition-colors"
                                  title="حذف الحقل"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>

                              {field.fieldtype === "select" && (
                                <div>
                                  <label className="text-[10px] text-on-surface-variant font-bold block mb-1">
                                    خيارات القائمة المنسدلة (مفصولة بفاصلة أو سطر جديد)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="مثال: سيرفر الشرق الأوسط, سيرفر أوروبا, سيرفر أمريكا"
                                    value={field.optionsStr || ""}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        service.id,
                                        fIdx,
                                        "optionsStr",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2.5 py-1.5 bg-surface-container border border-outline-variant/40 rounded-lg text-xs outline-none focus:border-primary"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all text-xs sm:text-sm text-center disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                  <span>جاري الحفظ الآمن في قاعدة البيانات...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>
                    {isDirectAdd
                      ? `حفظ وتثبيت الخدمة في باقة «${initialGroupName}»`
                      : "حفظ وتثبيت الخدمات في قاعدة البيانات"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
