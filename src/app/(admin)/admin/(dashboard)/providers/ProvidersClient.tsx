"use client";

import { useState, useEffect, useRef, useCallback, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import {
  filterProviderServicesByType,
  getProviderServiceType,
  getProviderServiceTypeCounts,
  getProviderServiceTypeLabel,
  refinePackageGroupName
} from "../../../../../lib/provider-service-types";
import { getProviderCustomFields } from "../../../../../lib/purchase-service-fields";
import { loadProviderServicesForBrowse } from "../../../../../lib/provider-service-browse";

type ProviderServiceType =
  | "imei"
  | "server"
  | "remote"
  | "topups"
  | "appstores"
  | "gamecodes"
  | "subscriptions"
  | "esim";
type ProviderServiceTypeFilter = "all" | ProviderServiceType;

interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  username?: string | null;
  apiKey: string;
  type: string;
  isActive: boolean;
  balance: number;
  currency: string;
  lastSyncAt?: string | null;
  servicesCount: number;
  mappingRules?: string | null;
  createdAt: string;
}

export function getServiceRequiredFields(service: any): { label: string; type?: string; required?: boolean; options?: string[] }[] {
  const fields: { label: string; type?: string; required?: boolean; options?: string[] }[] = [];

  const raw = getProviderCustomFields(service);
  if (raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        parsed.forEach((f: any) => {
          if ([true, 1, "1", "true"].includes(f.adminonly)) return;
          const name = f.label || f.fieldname || f.name || f.field_id || f.reqid || "حقل مخصص";
          const rawOpts = f.options || f.fieldoptions || f.FIELDOPTIONS;
          let opts: string[] = [];
          if (Array.isArray(rawOpts)) opts = rawOpts.map((o: any) => String(o?.value || o || "").trim()).filter(Boolean);
          else if (typeof rawOpts === "string" && rawOpts.trim()) opts = rawOpts.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);

          const cleanName = String(name).replace(/^custom_/, "").trim();
          const isQty = f.is_quantity === true || f.type === "quantity" || f.fieldtype === "quantity" || /^(qnt|quantity|الكمية)$/i.test(cleanName);

          if (isQty) {
            const min = f.min_quantity ?? f.minQty ?? 1;
            const max = f.max_quantity ?? f.maxQty ?? 0;
            const limitText = max > 0 ? `(من ${min} إلى ${max})` : `(الحد الأدنى: ${min})`;
            fields.push({
              label: `الكمية ${limitText}`,
              type: "quantity",
              required: true
            });
            return;
          }

          fields.push({
            label: cleanName,
            type: opts.length > 0 ? "select" : (f.fieldtype || f.type || "text"),
            required: f.required === "1" || f.required === true || f.required === "on",
            options: opts
          });
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([key, val]: [string, any]) => {
          if ([true, 1, "1", "true"].includes(val.adminonly)) return;
          const name = val.label || val.name || val.fieldname || val.field_id || val.reqid || key;
          const rawOpts = val.options || val.fieldoptions || val.FIELDOPTIONS;
          let opts: string[] = [];
          if (Array.isArray(rawOpts)) opts = rawOpts.map((o: any) => String(o?.value || o || "").trim()).filter(Boolean);
          else if (typeof rawOpts === "string" && rawOpts.trim()) opts = rawOpts.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);

          const cleanName = String(name).replace(/^custom_/, "").trim();
          const isQty = val.is_quantity === true || val.type === "quantity" || val.fieldtype === "quantity" || /^(qnt|quantity|الكمية)$/i.test(cleanName);

          if (isQty) {
            const min = val.min_quantity ?? val.minQty ?? 1;
            const max = val.max_quantity ?? val.maxQty ?? 0;
            const limitText = max > 0 ? `(من ${min} إلى ${max})` : `(الحد الأدنى: ${min})`;
            fields.push({
              label: `الكمية ${limitText}`,
              type: "quantity",
              required: true
            });
            return;
          }

          fields.push({
            label: cleanName,
            type: opts.length > 0 ? "select" : (val.fieldtype || val.type || "text"),
            required: val.required === "1" || val.required === true || val.required === "on",
            options: opts
          });
        });
      }
    } catch (e) {}
  }

  // دعم الحقول المباشرة في حالة عدم وجود requiresCustom
  if (fields.length === 0 && Array.isArray(service?.customFields) && service.customFields.length > 0) {
    service.customFields.forEach((f: any) => {
      if ([true, 1, "1", "true"].includes(f.adminonly)) return;
      const name = f.label || f.fieldname || f.name || f.field_id || f.reqid || "حقل مخصص";
      const cleanName = String(name).replace(/^custom_/, "").trim();
      const rawOpts = f.options || f.fieldoptions || f.FIELDOPTIONS;
      let opts: string[] = [];
      if (Array.isArray(rawOpts)) opts = rawOpts.map((o: any) => String(o?.value || o || "").trim()).filter(Boolean);
      else if (typeof rawOpts === "string" && rawOpts.trim()) opts = rawOpts.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);

      const isQty = f.is_quantity === true || f.type === "quantity" || f.fieldtype === "quantity" || /^(qnt|quantity|الكمية)$/i.test(cleanName);
      if (isQty) {
        const min = f.min_quantity ?? f.minQty ?? 1;
        const max = f.max_quantity ?? f.maxQty ?? 0;
        const limitText = max > 0 ? `(من ${min} إلى ${max})` : `(الحد الأدنى: ${min})`;
        fields.push({
          label: `الكمية ${limitText}`,
          type: "quantity",
          required: true
        });
        return;
      }

      fields.push({
        label: cleanName,
        type: opts.length > 0 ? "select" : (f.fieldtype || f.type || "text"),
        required: f.required === "1" || f.required === true || f.required === "on",
        options: opts
      });
    });
  }

  // إضافة حقل IMEI الافتراضي لخدمات الـ IMEI في حال عدم وجود حقل صريح
  const isImei = String(service?.service_type || service?.apiServiceType || service?.category_name || service?.categoryName || service?.group_name || service?.groupName || service?.dhruCategory?.name || "").toLowerCase().includes("imei");
  const hasImei = fields.some(f => /imei|serial|sn/i.test(f.label));
  if (isImei && !hasImei) {
    fields.unshift({
      label: "رقم IMEI / السيريال",
      type: "text",
      required: true
    });
  }

  // إذا كانت الخدمة تدعم الكمية صراحة ولم يُضف حقل كمية بعد
  const hasQty = fields.some(f => f.type === "quantity" || f.label.includes("الكمية"));
  const min = service?.minQty ?? service?.min_quantity ?? service?.QNT_MIN ?? 1;
  const max = service?.maxQty ?? service?.max_quantity ?? service?.QNT_MAX ?? 0;

  if (!hasQty && service?.requires_quantity !== false && (service?.requires_quantity === true || service?.supportsQty === true || service?.supports_quantity === true)) {
    const limitText = Number(max) > 0 ? `(من ${min} إلى ${max})` : `(الحد الأدنى: ${min})`;
    fields.push({
      label: `الكمية ${limitText}`,
      type: "quantity",
      required: false
    });
  }

  return fields;
}

export default function ProvidersClient() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    username: "",
    apiKey: "",
    type: "dhru",
    isActive: true,
    mappingRules: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Connection in Modal
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; balance?: number; currency?: string } | null>(null);

  // Action Loading States
  const [refreshingBalanceId, setRefreshingBalanceId] = useState<string | null>(null);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
  const [exportingProviderId, setExportingProviderId] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [rawExportModalProvider, setRawExportModalProvider] = useState<Provider | null>(null);
  const [isDownloadingRaw, setIsDownloadingRaw] = useState(false);
  const [deleteModalProvider, setDeleteModalProvider] = useState<Provider | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync Options Modal
  const [syncModalProvider, setSyncModalProvider] = useState<Provider | null>(null);
  const [syncMode, setSyncMode] = useState<"all"|"selected">("all");
  const [syncConfig, setSyncConfig] = useState({
    markup_percent: 0,
    exchange_rate: 1
  });

  // Browse Services Modal State
  const [browseProvider, setBrowseProvider] = useState<Provider | null>(null);
  const [providerServices, setProviderServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceLoadError, setServiceLoadError] = useState<string | null>(null);
  const [loadingServiceSource, setLoadingServiceSource] = useState<"stored" | "remote">("stored");
  const browseRequestRef = useRef<AbortController | null>(null);
  const [serviceLoadSource, setServiceLoadSource] = useState<"stored" | "remote" | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const [packageFilter, setPackageFilter] = useState<"all" | "active" | "hidden">("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ProviderServiceTypeFilter>("all");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [visibleGroupsLimit, setVisibleGroupsLimit] = useState(25);

  const groupsObserverRef = useRef<IntersectionObserver | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/providers", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      showToast("فشل جلب قائمة سيرفرات الـ API", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    return () => browseRequestRef.current?.abort();
  }, []);

  const openAddModal = () => {
    setEditingProvider(null);
    setFormData({
      name: "",
      apiUrl: "",
      username: "",
      apiKey: "",
      type: "dhru",
      isActive: true,
      mappingRules: ""
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      apiUrl: provider.apiUrl,
      username: provider.username || "",
      apiKey: provider.apiKey,
      type: provider.type || "dhru",
      isActive: provider.isActive !== false,
      mappingRules: provider.mappingRules || ""
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleTestConnection = async () => {
    if (!formData.apiUrl || !formData.apiKey) {
      showToast("يرجى إدخال رابط ومفتاح الـ API لاختبار الاتصال", "error");
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/providers/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiUrl: formData.apiUrl,
          username: formData.username,
          apiKey: formData.apiKey,
          providerId: editingProvider?.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `الاتصال ناجح! الرصيد: ${data.balance} ${data.currency}`,
          balance: data.balance,
          currency: data.currency
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "فشل الاتصال بالمزود"
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "تعذر الاتصال بالسيرفر لإجراء الاختبار"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.apiUrl || !formData.apiKey) {
      showToast("يرجى ملء جميع الحقول الإلزامية", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingProvider ? `/api/providers/${editingProvider.id}` : "/api/providers";
      const method = editingProvider ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (editingProvider ? "تم حفظ التعديلات بنجاح!" : "تمت إضافة السيرفر بنجاح!"));
        setIsModalOpen(false);
        await fetchProviders();
      } else {
        showToast(data.error || "حدث خطأ أثناء حفظ البيانات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalProvider) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/providers/${deleteModalProvider.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم حذف السيرفر بنجاح.");
        setDeleteModalProvider(null);
        await fetchProviders();
      } else {
        showToast(data.error || "فشل حذف السيرفر", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لحذف المزود", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshBalance = async (provider: Provider) => {
    setRefreshingBalanceId(provider.id);
    try {
      const res = await fetch(`/api/providers/${provider.id}/balance`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تم تحديث الرصيد: ${data.balance.toFixed(2)} USD`);
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, balance: data.balance, currency: data.currency } : p))
        );
      } else {
        showToast(data.error || "فشل استرداد رصيد المزود", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بواجهة السيرفر المزود", "error");
    } finally {
      setRefreshingBalanceId(null);
    }
  };

  const openSyncModal = (provider: Provider, mode: "all"|"selected" = "all") => {
    setSyncModalProvider(provider);
    setSyncMode(mode);
    setSyncConfig({
      markup_percent: 0,
      exchange_rate: 1
    });
  };

  const executeSync = async () => {
    if (!syncModalProvider) return;
    const p = syncModalProvider;
    setSyncingProviderId(p.id);
    setSyncModalProvider(null);

    try {
            let endpoint = `/api/providers/${p.id}/sync`;
      let bodyData: any = syncConfig;

      if (syncMode === "selected") {
        endpoint = `/api/providers/${p.id}/import-services`;
        bodyData = {
          ...syncConfig,
          services: providerServices.filter(s => selectedGroupNames.includes(s.groupName || s.group_name || "باقة عامة"))
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تمت المزامنة بنجاح! تم جلب وتحديث ${data.count} خدمة.`);
        await fetchProviders();
        if (browseProvider && browseProvider.id === p.id) {
          if (syncMode === "selected" && serviceLoadSource === "remote") {
            // Keep remote catalog so user can select and import MORE packages without losing anything!
            const importedGroupNames = new Set(selectedGroupNames);
            setProviderServices((prev) =>
              prev.map((s) => {
                const g = s.groupName || s.group_name || "باقة عامة";
                if (importedGroupNames.has(g)) {
                  return { ...s, isImported: true, isActive: true };
                }
                return s;
              })
            );
            setSelectedGroupNames([]);
          } else {
            await handleBrowseServices(p, serviceLoadSource || "auto");
          }
        }
      } else {
        showToast(data.error || "فشلت المزامنة من المزود", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لمزامنة الخدمات", "error");
    } finally {
      setSyncingProviderId(null);
    }
  };

  const closeBrowseServices = () => {
    browseRequestRef.current?.abort();
    browseRequestRef.current = null;
    setLoadingServices(false);
    setBrowseProvider(null);
  };

  const handleBrowseServices = async (provider: Provider, forceSource?: "stored" | "remote" | "auto") => {
    browseRequestRef.current?.abort();
    const controller = new AbortController();
    browseRequestRef.current = controller;
    setBrowseProvider(provider);
    setLoadingServices(true);
    setServiceLoadError(null);
    setProviderServices([]);
    setServiceLoadSource(null);
    setLoadingServiceSource(forceSource === "remote" ? "remote" : "stored");
    setServiceSearch("");
    setPackageFilter("all");
    setSelectedGroupNames([]);
    setExpandedGroups({});
    setServiceTypeFilter("all");
    setVisibleGroupsLimit(25);
    try {
      // Each provider opens from its own stored catalog, independent of the previous tab.
      const preferred = forceSource || "auto";
      const result = await loadProviderServicesForBrowse(provider.id, async (url: string) => {
        if (controller.signal.aborted) throw new DOMException("Aborted", "AbortError");
        const isRemote = url.endsWith("/fetch-services");
        setLoadingServiceSource(isRemote ? "remote" : "stored");
        const requestController = new AbortController();
        const cancelRequest = () => requestController.abort();
        controller.signal.addEventListener("abort", cancelRequest, { once: true });
        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          requestController.abort();
        }, isRemote ? 30000 : 10000);
        try {
          const res = await fetch(url, { cache: "no-store", signal: requestController.signal });
          const data = await res.json().catch((error) => {
            if (requestController.signal.aborted) throw error;
            return {};
          });
          return { ok: res.ok, data };
        } catch (error) {
          if (timedOut) throw new Error(isRemote
            ? "المزود لم يرد خلال 30 ثانية. أعد المحاولة أو اعرض الخدمات المضافة في الموقع."
            : "تعذر تحميل الخدمات المحفوظة خلال 10 ثوانٍ. أعد المحاولة.");
          throw error;
        } finally {
          clearTimeout(timeout);
          controller.signal.removeEventListener("abort", cancelRequest);
        }
      }, preferred);
      if (browseRequestRef.current !== controller || controller.signal.aborted) return;
      setProviderServices(result.services);
      setServiceLoadSource(result.source);
      setProviders((current) => current.map((item) => (
        item.id === provider.id && result.source === "stored" ? { ...item, servicesCount: result.services.length } : item
      )));
    } catch (error) {
      if (browseRequestRef.current !== controller || controller.signal.aborted) return;
      setServiceLoadError(error instanceof Error ? error.message : "فشل جلب خدمات المزود");
    } finally {
      if (browseRequestRef.current === controller) setLoadingServices(false);
    }
  };

  const serviceTypeCounts = useMemo(
    () => getProviderServiceTypeCounts(providerServices),
    [providerServices]
  );

  const typeFilteredProviderServices = useMemo(
    () => filterProviderServicesByType(providerServices, serviceTypeFilter),
    [providerServices, serviceTypeFilter]
  );

  // Group services by groupName (Package)
  const groupedPackages = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const s of typeFilteredProviderServices) {
      const rawG = s.groupName || s.group_name || "باقة عامة";
      const g = refinePackageGroupName(rawG, s.name || s.originalName || "");
      if (!map[g]) map[g] = [];
      map[g].push(s);
    }

    const groupsArray = Object.entries(map).map(([groupName, services]) => {
      const activeCount = services.filter((s) => s.isActive).length;
      const isStoredData = serviceLoadSource === "stored";
      const isAllActive = isStoredData && activeCount === services.length;
      const isAllHidden = isStoredData && activeCount === 0;

      return {
        groupName,
        services,
        serviceTypes: Array.from(new Set(services.map((service) => getProviderServiceType(service)))),
        total: services.length,
        activeCount,
        isAllActive,
        isAllHidden
      };
    });

    groupsArray.sort((a, b) => a.groupName.localeCompare(b.groupName, "ar"));
    return groupsArray;
  }, [serviceLoadSource, typeFilteredProviderServices]);

  // Filter groups according to search and status filter
  const filteredGroups = useMemo(() => {
    let list = groupedPackages;

    if (packageFilter === "active") {
      list = list.filter((g) => g.activeCount > 0);
    } else if (packageFilter === "hidden") {
      list = list.filter((g) => g.isAllHidden);
    }

    if (!deferredServiceSearch.trim()) return list;

    const q = deferredServiceSearch.trim().toLowerCase();
    return list
      .map((g) => {
        const matchesGroupName = g.groupName.toLowerCase().includes(q);
        if (matchesGroupName) return g;

        const matchingServices = g.services.filter((s) => {
          const nameMatch = s.name.toLowerCase().includes(q) || s.originalName?.toLowerCase().includes(q);
          const customFields = getServiceRequiredFields(s);
          const fieldMatch = customFields.some(f => f.label.toLowerCase().includes(q));
          return nameMatch || fieldMatch;
        });

        if (matchingServices.length > 0) {
          return {
            ...g,
            services: matchingServices
          };
        }
        return null;
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [deferredServiceSearch, groupedPackages, packageFilter]);

  const totalFilteredServicesCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.services.length, 0);
  }, [filteredGroups]);

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleGroupSelection = (groupName: string) => {
    setSelectedGroupNames((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupNames.length === filteredGroups.length) {
      setSelectedGroupNames([]);
    } else {
      setSelectedGroupNames(filteredGroups.map((g) => g.groupName));
    }
  };

  // Toggle single package visibility
  const handleToggleSinglePackage = async (groupName: string, nextActive: boolean) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("هذه معاينة مباشرة. قم بالمزامنة أولاً لحفظ الباقة والتحكم في ظهورها.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupNames: [groupName], isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (nextActive ? `تم إظهار باقة (${groupName})` : `تم إخفاء باقة (${groupName})`));
        setProviderServices((prev) =>
          prev.map((s) => (s.groupName === groupName ? { ...s, isActive: nextActive } : s))
        );
      } else {
        showToast(data.error || "فشل تغيير حالة الباقة", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  // Bulk toggle for selected packages
  const handleBulkToggleSelectedPackages = async (nextActive: boolean) => {
    if (!browseProvider || selectedGroupNames.length === 0) return;
    if (serviceLoadSource !== "stored") {
      showToast("قم بالمزامنة أولاً قبل تعديل الباقات.", "error");
      return;
    }
    setIsPerformingBulkAction(true);
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupNames: selectedGroupNames, isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم تحديث حالة الباقات المحددة بنجاح!");
        setProviderServices((prev) =>
          prev.map((s) => (selectedGroupNames.includes(s.groupName) ? { ...s, isActive: nextActive } : s))
        );
        setSelectedGroupNames([]);
      } else {
        showToast(data.error || "فشل تحديث الباقات المحددة", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  // Make ALL services of this provider visible or hidden
  const handleToggleAllServices = async (nextActive: boolean) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("قم بالمزامنة أولاً قبل تفعيل أو إخفاء الخدمات.", "error");
      return;
    }
    setIsPerformingBulkAction(true);
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (nextActive ? "تم تفعيل وإظهار كافة الخدمات في المتجر!" : "تم إخفاء كافة الخدمات عن المتجر"));
        setProviderServices((prev) => prev.map((s) => ({ ...s, isActive: nextActive })));
      } else {
        showToast(data.error || "فشل تحديث الخدمات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  // Toggle single service visibility
  const handleToggleSingleService = async (service: any) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("هذه الخدمة معروضة مباشرة من المزود. قم بالمزامنة أولاً للتحكم بها.", "error");
      return;
    }
    const nextActive = !service.isActive;
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviderServices((prev) =>
          prev.map((s) =>
            s.id === service.id || (service.dhruId && s.dhruId === service.dhruId)
              ? { ...s, isActive: nextActive }
              : s
          )
        );
        showToast(nextActive ? `تم إظهار (${service.name}) للعملاء` : `تم إخفاء (${service.name}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تعديل الخدمة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر", "error");
    }
  };

  const visibleGroups = filteredGroups.slice(0, visibleGroupsLimit);

  const lastGroupElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingServices) return;
    if (groupsObserverRef.current) groupsObserverRef.current.disconnect();

    groupsObserverRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleGroupsLimit < filteredGroups.length) {
        setVisibleGroupsLimit((prev) => prev + 25);
      }
    });

    if (node) groupsObserverRef.current.observe(node);
  }, [loadingServices, visibleGroupsLimit, filteredGroups.length]);

  // Helper to trigger browser JSON file download
  const downloadJsonFile = (data: any, defaultFilename: string) => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", defaultFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download JSON error:", err);
    }
  };

  // Export full JSON data for a single provider
  const handleExportProviderJson = async (provider: Provider) => {
    setExportingProviderId(provider.id);
    try {
      const res = await fetch(`/api/providers/${provider.id}/export-full-data?download=false`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data) {
        const cleanName = (provider.name || "provider").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
        const filename = `${cleanName}_full_data_${new Date().toISOString().slice(0, 10)}.json`;
        downloadJsonFile(data.data, filename);
        showToast(`تم تحميل ملف الـ JSON الشامل للمزود (${provider.name}) بنجاح!`, "success");
        return;
      }

      // Fallback: build JSON from stored provider services
      const storedRes = await fetch(`/api/providers/${provider.id}/services?include_info=true`);
      const storedData = await storedRes.json().catch(() => ({}));
      const services = Array.isArray(storedData.services) ? storedData.services : [];

      const packagesMap: Record<string, any[]> = {};
      for (const s of services) {
        const pkg = s.groupName || s.group_name || "باقة عامة";
        if (!packagesMap[pkg]) packagesMap[pkg] = [];
        packagesMap[pkg].push(s);
      }
      const packages = Object.entries(packagesMap).map(([packageName, srvs]) => ({
        packageName,
        servicesCount: srvs.length,
        services: srvs
      }));

      const fallbackData = {
        provider,
        metadata: {
          exportedAt: new Date().toISOString(),
          system: "BORAI STORE",
          totalServices: services.length,
          totalPackages: packages.length
        },
        packages,
        services
      };

      const cleanName = (provider.name || "provider").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
      const filename = `${cleanName}_full_data_${new Date().toISOString().slice(0, 10)}.json`;
      downloadJsonFile(fallbackData, filename);
      showToast(`تم تحميل بيانات المزود (${provider.name}) بنجاح!`, "success");
    } catch (err: any) {
      console.error("Export provider JSON error:", err);
      showToast("تعذر تحميل ملف الـ JSON للمزود: " + (err.message || ""), "error");
    } finally {
      setExportingProviderId(null);
    }
  };

  // Export full JSON data for all providers
  const handleExportAllProvidersJson = async () => {
    setIsExportingAll(true);
    try {
      const res = await fetch("/api/providers/export-all-data");
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.data) {
        const filename = `all_providers_full_data_${new Date().toISOString().slice(0, 10)}.json`;
        downloadJsonFile(data.data, filename);
        showToast("تم تحميل بيانات كافة المزودين والخدمات والباقات بنجاح!", "success");
        return;
      }

      const fallbackExport = {
        metadata: {
          exportedAt: new Date().toISOString(),
          system: "BORAI STORE",
          totalProviders: providers.length
        },
        providers
      };
      downloadJsonFile(fallbackExport, `all_providers_${new Date().toISOString().slice(0, 10)}.json`);
      showToast("تم تحميل بيانات المزودين المتاحة بنجاح!", "success");
    } catch (err: any) {
      console.error("Export all providers error:", err);
      showToast("تعذر تصدير بيانات كافة المزودين: " + (err.message || ""), "error");
    } finally {
      setIsExportingAll(false);
    }
  };

  // Export currently browsed services as JSON
  const handleExportCurrentBrowseServicesJson = () => {
    if (!browseProvider) return;
    const exportData = {
      provider: browseProvider,
      source: serviceLoadSource,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalServices: providerServices.length,
        totalPackages: groupedPackages.length
      },
      packages: groupedPackages,
      services: providerServices
    };
    const cleanName = (browseProvider.name || "provider").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
    const filename = `${cleanName}_${serviceLoadSource || "catalog"}_services_${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(exportData, filename);
    showToast(`تم تصدير ${providerServices.length} خدمة كملف JSON بنجاح!`, "success");
  };

  // Download untouched raw provider data directly from provider API without ANY modifications
  const handleDownloadRawProviderData = async (
    provider: Provider,
    type: "all" | "pure_dhru" | "imei" | "server" | "remote" = "all"
  ) => {
    setIsDownloadingRaw(true);
    try {
      const res = await fetch(`/api/providers/${provider.id}/raw-data?type=${type}&download=false`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        showToast(data.error || "تعذر سحب الداتا الأصلية من المزود", "error");
        return;
      }

      const cleanName = (provider.name || "provider").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
      const filenameSuffix =
        type === "pure_dhru" ? "RAW_Dhru_SUCCESS" :
        type === "imei" ? "RAW_IMEI_Services" :
        type === "server" ? "RAW_Server_Services" :
        type === "remote" ? "RAW_Remote_Services" : "RAW_Original_Full";

      const filename = `${cleanName}_${filenameSuffix}_${new Date().toISOString().slice(0, 10)}.json`;
      downloadJsonFile(data, filename);
      showToast(`تم تحميل الداتا الأصلية الخام للمزود (${provider.name}) بنجاح!`, "success");
    } catch (err: any) {
      console.error("Raw download error:", err);
      showToast("خطأ أثناء تحميل الداتا الأصلية: " + (err.message || ""), "error");
    } finally {
      setIsDownloadingRaw(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto" dir="rtl">
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">dns</span>
            <span>إدارة ومزودي الـ API (Providers)</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1">
            إضافة وإدارة سيرفرات المزودين لربط المنتجات وسحب الخدمات وتنفيذ طلبات العملاء تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportAllProvidersJson}
            disabled={isExportingAll}
            className="px-4 py-3 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold border border-outline-variant/30 hover:border-violet-500/40 transition-all flex items-center justify-center gap-2 shadow-sm"
            title="تحميل كافة بيانات المزودين والخدمات والباقات كملف JSON شامل"
          >
            <span className={`material-symbols-outlined text-base text-violet-400 ${isExportingAll ? "animate-spin" : ""}`}>
              {isExportingAll ? "refresh" : "download_for_offline"}
            </span>
            <span>{isExportingAll ? "جاري تجهيز البيانات..." : "تصدير كل المزودين (JSON)"}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            <span>إضافة مزود جديد</span>
          </button>
        </div>
      </div>

      {/* Providers List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-medium">جاري تحميل سيرفرات الـ API المربوطة...</span>
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border border-outline-variant/30 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">dns</span>
          <h3 className="text-lg font-bold text-on-surface">لا يوجد سيرفرات مربوطة حالياً</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            قم بإضافة سيرفر الـ API ومفتاح الوصول لبدء سحب الخدمات وتنفيذ الطلبات تلقائياً.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md"
          >
            إضافة مزود جديد
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {providers.map((provider) => {
            const isRefreshing = refreshingBalanceId === provider.id;
            const isSyncing = syncingProviderId === provider.id;

            return (
              <div
                key={provider.id}
                className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/40 transition-all shadow-xl bg-surface-container/30 flex flex-col gap-4"
              >
                {/* Top Row: Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0">
                      <span className="material-symbols-outlined text-3xl">dns</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-on-surface font-display">{provider.name}</h3>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            provider.isActive
                              ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }`}
                        >
                          {provider.isActive ? "نشط" : "معطل"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono">
                          {provider.type === "dhru" ? "Dhru Fusion API" : "Dynamic Mapper"}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant font-mono mt-1 text-left dir-ltr truncate max-w-sm sm:max-w-md">
                        {provider.apiUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal(provider)}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => setDeleteModalProvider(provider)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/20"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Balance, Services count & Sync Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/20">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-bold mb-0.5">رصيد الحساب المتاح في السيرفر</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary font-mono">
                          {(provider.balance || 0).toFixed(2)} {provider.currency || "USD"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRefreshBalance(provider)}
                      disabled={isRefreshing}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                      <span>{isRefreshing ? "جاري التحديث..." : "تحديث الرصيد"}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 flex-wrap">
                    <button
                      onClick={() => setRawExportModalProvider(provider)}
                      className="px-3.5 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-violet-500/30 shadow-sm"
                      title="تحميل محتوى المزود الأصلي بالكامل بدون أي إضافات منا (Raw JSON)"
                    >
                      <span className="material-symbols-outlined text-sm">download_for_offline</span>
                      <span>تحميل الداتا الأصلية الخام</span>
                    </button>

                    <button
                      onClick={() => handleExportProviderJson(provider)}
                      disabled={exportingProviderId === provider.id}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 border border-outline-variant/30 hover:border-violet-500/40"
                      title="تحميل كل داتا المزود والتفاصيل والباقات والحقول كملف JSON شامل"
                    >
                      <span className={`material-symbols-outlined text-sm text-violet-400 ${exportingProviderId === provider.id ? "animate-spin" : ""}`}>
                        {exportingProviderId === provider.id ? "refresh" : "download"}
                      </span>
                      <span>{exportingProviderId === provider.id ? "جاري التجهيز..." : "تصدير شامل"}</span>
                    </button>

                    <button
                      onClick={() => handleBrowseServices(provider)}
                      className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 border border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">search</span>
                      <span>استعراض الخدمات ({provider.servicesCount || 0})</span>
                    </button>

                    <button
                      onClick={() => openSyncModal(provider)}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${isSyncing ? "animate-spin" : ""}`}>
                        {isSyncing ? "refresh" : "sync"}
                      </span>
                      <span>{isSyncing ? "جاري المزامنة..." : "مزامنة تلقائية"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT PROVIDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingProvider ? "edit_square" : "add_box"}
                </span>
                <span>{editingProvider ? "تعديل بيانات المزود" : "إضافة مزود API جديد"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">اسم المزود:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: BORAI STORE أو GsmServer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-bold text-on-surface transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  رابط الـ API (URL):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://server-domain.com/api/index.php"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    اسم المستخدم (Username):
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    مفتاح الـ API (API Key / Access Key):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="API Key"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">نوع النظام والبروتوكول:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-bold text-on-surface transition-all cursor-pointer"
                >
                  <option value="dhru">قياسي (Dhru Fusion / PerfectPanel / GSM Standard)</option>
                  <option value="dynamic">مخصص (Dynamic Mapper - ربط ديناميكي)</option>
                </select>
              </div>

              {formData.type === "dynamic" && (
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    إعدادات الربط الديناميكي (JSON Mapping Rules):
                  </label>
                  <textarea
                    rows={4}
                    placeholder='{"sync_endpoint": "/services", "map_array_path": "data"}'
                    value={formData.mappingRules}
                    onChange={(e) => setFormData({ ...formData, mappingRules: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-primary/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>
              )}

              {/* TEST CONNECTION BUTTON & STATUS */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">network_ping</span>
                    <span>اختبار الاتصال بالسيرفر</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !formData.apiUrl || !formData.apiKey}
                    className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 border border-primary/30"
                  >
                    <span className={`material-symbols-outlined text-sm ${isTestingConnection ? "animate-spin" : ""}`}>
                      {isTestingConnection ? "refresh" : "sensors"}
                    </span>
                    <span>{isTestingConnection ? "جاري الاختبار..." : "فحص الاتصال والرصيد"}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      testResult.success
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {testResult.success ? "check_circle" : "error"}
                    </span>
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <input
                  id="providerActiveToggle"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-violet-500 cursor-pointer"
                />
                <label htmlFor="providerActiveToggle" className="text-xs font-bold text-violet-400 cursor-pointer select-none">
                  تفعيل السيرفر واستقبال وتنفيذ الطلبات والتفعيلات آلياً
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3.5 rounded-xl font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  <span>حفظ بيانات المزود</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3.5 rounded-xl font-bold text-xs transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYNC CONFIG MODAL */}
      {syncModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">sync</span>
                <span>مزامنة خدمات: {syncModalProvider.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSyncModalProvider(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-on-surface-variant leading-relaxed">
                سيتم جلب قوائم IMEI وServer وRemote تلقائياً، ثم اعتماد النوع المرسل داخل بيانات كل خدمة وحفظه للفلترة والتنفيذ الصحيح.
                <br /><br />
                <span className="font-bold text-amber-500">تنبيه هام:</span> يرجى التأكد من إضافة عناوين IP السيرفر الخاص بك في إعدادات API لدى المزود (WhiteList IP) قبل المزامنة لتجنب رفض الاتصال:
                <div className="mt-1 flex flex-col gap-1">
                  <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[11px] text-left dir-ltr w-fit">186.240.155.152</code>
                  <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[11px] text-left dir-ltr w-fit">2c0f:fc89:5e:8063:b178:82be:2580:b934</code>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1.5">
                  نسبة هامش الربح المضافة على التكلفة (%):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={syncConfig.markup_percent}
                  onChange={(e) => setSyncConfig({ ...syncConfig, markup_percent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-bold text-on-surface text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1.5">
                  معامل تحويل العملة (Exchange Rate):
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="0.01"
                  value={syncConfig.exchange_rate}
                  onChange={(e) => setSyncConfig({ ...syncConfig, exchange_rate: parseFloat(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-bold text-on-surface text-left dir-ltr"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeSync}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>بدء المزامنة الآن</span>
              </button>
              <button
                type="button"
                onClick={() => setSyncModalProvider(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">حذف المزود</h3>
                <p className="text-xs text-red-400 font-semibold">{deleteModalProvider.name}</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              هل أنت متأكد من رغبتك في إزالة هذا المزود من قائمة الربط؟ لن يتم إرسال طلبات جديدة إليه بعد الحذف.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                <span>تأكيد الحذف</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalProvider(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADED BROWSE SERVICES & PACKAGES MODAL WITH REQUIRED FIELDS */}
      {browseProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-5 animate-in fade-in overflow-hidden">
          <div className="bg-surface-container border border-outline-variant/30 rounded-2xl sm:rounded-3xl p-3 sm:p-6 max-w-4xl w-full shadow-2xl flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden">
            {/* Modal Top Header & Controls (Fixed / Non-shrinking) */}
            <div className="shrink-0 space-y-2 sm:space-y-3 pb-1">
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">category</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-on-surface flex items-center gap-1.5 sm:gap-2">
                      <span>خدمات وباقات المزود:</span>
                      <span className="text-primary font-display">{browseProvider.name}</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-on-surface-variant">
                      {loadingServices ? "جاري تحميل الخدمات، لم يكتمل حساب العدد بعد..." : serviceLoadError ? "تعذر تحميل قائمة الخدمات" : `${filteredGroups.length} باقة • ${totalFilteredServicesCount} خدمة متاحة مع تفاصيل حقول الطلب`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeBrowseServices}
                  aria-label="إغلاق خدمات المزود"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* View Switcher Tabs: Live Provider Catalog vs Stored In Store */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 sm:p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleBrowseServices(browseProvider, "remote")}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                      serviceLoadSource === "remote"
                        ? "bg-sky-500 text-white shadow-md"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="عرض كل باقات وخدمات المزود من الـ API مباشرة لاختيار واستيراد باقات جديدة"
                  >
                    <span className="material-symbols-outlined text-sm">cloud_sync</span>
                    <span>تصفح واستيراد باقات جديدة (API Live)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBrowseServices(browseProvider, "stored")}
                    className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 ${
                      serviceLoadSource === "stored"
                        ? "bg-primary text-on-primary shadow-md"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                    title="عرض الخدمات المستوردة حالياً في الموقع للتحكم في ظهورها وهوامش الربح"
                  >
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    <span>الخدمات المضافة في الموقع ({browseProvider.servicesCount || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRawExportModalProvider(browseProvider)}
                    disabled={loadingServices}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/30 shadow-sm"
                    title="تحميل محتوى المزود الأصلي بالكامل بدون أي إضافات منا (Raw JSON)"
                  >
                    <span className="material-symbols-outlined text-sm">download_for_offline</span>
                    <span>الداتا الأصلية الخام (Raw)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCurrentBrowseServicesJson}
                    disabled={loadingServices || providerServices.length === 0}
                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30"
                    title="تحميل الخدمات الحالية والباقات والحقول كملف JSON"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>تصدير JSON ({providerServices.length})</span>
                  </button>
                </div>

                {serviceLoadSource === "remote" && (
                  <span className="text-[10px] sm:text-[11px] text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 sm:py-1 rounded-xl flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">tune</span>
                    <span>يمكنك تحديد واستيراد أي باقة ولن تختفي باقي الباقات</span>
                  </span>
                )}
              </div>

              {/* Quick Bulk Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {serviceLoadSource === "stored" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleAllServices(true)}
                        disabled={isPerformingBulkAction || loadingServices}
                        className="px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 text-[11px]"
                        title="تفعيل وإظهار كافة خدمات وباقات هذا المزود للعملاء في المتجر"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>إظهار الكل للعملاء</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAllServices(false)}
                        disabled={isPerformingBulkAction || loadingServices}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-bold transition-all flex items-center gap-1 border border-outline-variant/20 disabled:opacity-50 text-[11px]"
                      >
                        <span className="material-symbols-outlined text-sm">visibility_off</span>
                        <span>إخفاء الكل</span>
                      </button>
                    </>
                  )}
                  {serviceLoadSource !== "stored" && (
                    <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-xl font-bold text-[11px]">
                      <span className="material-symbols-outlined text-sm">info</span>
                      <span>حدد الباقات التي تريد استيرادها أو انقر على استيراد بجانب كل باقة.</span>
                    </div>
                  )}

                  {selectedGroupNames.length > 0 && (
                    <>
                      {serviceLoadSource === "stored" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleBulkToggleSelectedPackages(true)}
                            disabled={isPerformingBulkAction}
                            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold transition-all flex items-center gap-1 shadow-sm text-[11px]"
                          >
                            <span className="material-symbols-outlined text-sm">check_box</span>
                            <span>إظهار الباقات ({selectedGroupNames.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBulkToggleSelectedPackages(false)}
                            disabled={isPerformingBulkAction}
                            className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold transition-all flex items-center gap-1 text-[11px]"
                          >
                            <span className="material-symbols-outlined text-sm">visibility_off</span>
                            <span>إخفاء الباقات ({selectedGroupNames.length})</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openSyncModal(browseProvider, "selected")}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all flex items-center gap-1 shadow-sm text-[11px]"
                        >
                          <span className="material-symbols-outlined text-sm">cloud_download</span>
                          <span>استيراد الباقات المحددة ({selectedGroupNames.length})</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openSyncModal(browseProvider)}
                    disabled={syncingProviderId === browseProvider.id}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all flex items-center gap-1 border border-outline-variant/30 disabled:opacity-50 text-[11px]"
                  >
                    <span className={`material-symbols-outlined text-xs text-primary ${syncingProviderId === browseProvider.id ? "animate-spin" : ""}`}>
                      sync
                    </span>
                    <span>مزامنة من المزود</span>
                  </button>
                </div>
              </div>

              {/* Provider Service Type Filters: Divided into 2 clean rows */}
              <div className="space-y-1.5 p-1.5 sm:p-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
                {/* الصف الأول: الأقسام الأساسية والسيرفر */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {([
                    { type: "all", label: "الكل", count: serviceTypeCounts.all, icon: "apps" },
                    { type: "imei", label: "IMEI", count: serviceTypeCounts.imei, icon: "fingerprint" },
                    { type: "server", label: "Server", count: serviceTypeCounts.server, icon: "dns" },
                    { type: "remote", label: "Remote", count: serviceTypeCounts.remote, icon: "settings_remote" }
                  ] as const).map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => {
                        setServiceTypeFilter(option.type);
                        setSelectedGroupNames([]);
                        setExpandedGroups({});
                        setVisibleGroupsLimit(25);
                      }}
                      className={`px-2 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                        serviceTypeFilter === option.type
                          ? "bg-primary text-on-primary border-primary shadow"
                          : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs sm:text-sm">{option.icon}</span>
                      <span className="truncate">{option.label}</span>
                      <span className={`font-mono px-1 py-0.2 rounded text-[10px] sm:text-xs ${
                        serviceTypeFilter === option.type ? "bg-black/20" : "bg-surface-container-highest"
                      }`}>
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* الصف الثاني: الألعاب والبطاقات الرقمية والاشتراكات */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  {([
                    { type: "topups", label: "شحن ألعاب", count: serviceTypeCounts.topups, icon: "sports_esports" },
                    { type: "gamecodes", label: "أكواد وبطاقات", count: serviceTypeCounts.gamecodes, icon: "vpn_key" },
                    { type: "appstores", label: "متاجر وتطبيقات", count: serviceTypeCounts.appstores, icon: "store" },
                    { type: "subscriptions", label: "اشتراكات", count: serviceTypeCounts.subscriptions, icon: "subscriptions" },
                    { type: "esim", label: "eSIM", count: serviceTypeCounts.esim, icon: "sim_card" }
                  ] as const).map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => {
                        setServiceTypeFilter(option.type);
                        setSelectedGroupNames([]);
                        setExpandedGroups({});
                        setVisibleGroupsLimit(25);
                      }}
                      className={`px-2 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                        serviceTypeFilter === option.type
                          ? "bg-primary text-on-primary border-primary shadow"
                          : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs sm:text-sm">{option.icon}</span>
                      <span className="truncate">{option.label}</span>
                      <span className={`font-mono px-1 py-0.2 rounded text-[10px] sm:text-xs ${
                        serviceTypeFilter === option.type ? "bg-black/20" : "bg-surface-container-highest"
                      }`}>
                        {option.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="بحث باسم الباقة أو الخدمة أو الحقل..."
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setVisibleGroupsLimit(25);
                    }}
                    className="w-full pr-9 pl-3 py-1.5 sm:py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:border-primary outline-none text-xs text-on-surface"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPackageFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                      packageFilter === "all"
                        ? "bg-primary text-on-primary shadow"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    الكل ({groupedPackages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFilter("active")}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                      packageFilter === "active"
                        ? "bg-violet-500 text-white shadow"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    النشطة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFilter("hidden")}
                    className={`px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                      packageFilter === "hidden"
                        ? "bg-amber-500 text-black shadow"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    المخفية
                  </button>
                </div>
              </div>

              {/* Select All Checkbox Row */}
              {filteredGroups.length > 0 && (
                <div className="flex items-center justify-between px-1 text-xs text-on-surface-variant">
                  <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-[11px] sm:text-xs">
                    <input
                      type="checkbox"
                      checked={selectedGroupNames.length > 0 && selectedGroupNames.length === filteredGroups.length}
                      onChange={handleSelectAllGroups}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span>تحديد كل الباقات ({filteredGroups.length} باقة)</span>
                  </label>
                  {selectedGroupNames.length > 0 && (
                    <span className="text-primary font-bold text-[11px] sm:text-xs">{selectedGroupNames.length} باقة محددة</span>
                  )}
                </div>
              )}
            </div>

            {/* Grouped Packages & Services List (Smooth Mobile Touch Scrolling with min-h-0) */}
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-2.5 sm:space-y-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 sm:p-3"
              style={{ WebkitOverflowScrolling: "touch" }}
              onScroll={(e) => {
                const t = e.currentTarget;
                if (t.scrollHeight - t.scrollTop - t.clientHeight < 350) {
                  if (visibleGroupsLimit < filteredGroups.length) {
                    setVisibleGroupsLimit((prev) => prev + 25);
                  }
                }
              }}
            >
              {loadingServices ? (
                <div role="status" className="p-8 sm:p-16 text-center text-on-surface-variant text-xs flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>{loadingServiceSource === "remote" ? "جاري جلب الباقات والخدمات من API المزود..." : "جاري تحميل الخدمات المضافة في الموقع..."}</span>
                  {loadingServiceSource === "remote" && <span>يمكنك عرض الخدمات المضافة في الموقع أثناء انتظار المزود.</span>}
                </div>
              ) : serviceLoadError ? (
                <div role="alert" className="p-8 sm:p-16 text-center text-on-surface-variant text-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-red-400">error_outline</span>
                  <p className="font-bold text-on-surface text-sm">تعذر جلب خدمات المزود</p>
                  <p className="break-words">{serviceLoadError}</p>
                  <button type="button" onClick={() => handleBrowseServices(browseProvider, loadingServiceSource)} className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold">إعادة المحاولة</button>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-16 text-center text-on-surface-variant text-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">category</span>
                  <p className="font-bold text-on-surface text-sm">{providerServices.length === 0 && serviceLoadSource === "stored" ? "لم يتم استيراد خدمات لهذا المزود في الموقع بعد." : "لا توجد باقات أو خدمات مطابقة للبحث."}</p>
                  {providerServices.length === 0 && serviceLoadSource === "stored" && <button type="button" onClick={() => handleBrowseServices(browseProvider, "remote")} className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold">تصفح باقات المزود من API</button>}
                </div>
              ) : (
                <>
                  {visibleGroups.map((group, gIdx) => {
                    const isSelected = selectedGroupNames.includes(group.groupName);
                    const isExpanded = expandedGroups[group.groupName] ?? false;

                    return (
                      <div
                        key={group.groupName}
                        ref={gIdx === visibleGroups.length - 1 ? lastGroupElementRef : null}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          group.isAllHidden
                            ? "bg-surface-container-high/30 border-outline-variant/20 opacity-75"
                            : "bg-surface-container/50 border-outline-variant/30 hover:border-primary/40"
                        }`}
                      >
                        {/* Package Row Header */}
                        <div className="p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-surface-container-high/40 border-b border-outline-variant/15">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleGroupSelection(group.groupName)}
                              className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                            />
                            <div
                              onClick={() => toggleGroupExpand(group.groupName)}
                              className="cursor-pointer"
                            >
                              <div className="font-bold text-on-surface text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span>{group.groupName}</span>
                                {group.serviceTypes.map((type: string) => (
                                  <span
                                    key={type}
                                    className="text-[9px] px-1.5 sm:px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono"
                                  >
                                    {getProviderServiceTypeLabel(type)}
                                  </span>
                                ))}
                                {serviceLoadSource === "stored" ? (
                                  group.isAllActive ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-400 font-bold border border-violet-500/20">
                                      مفعلة بالكامل ({group.activeCount}/{group.total})
                                    </span>
                                  ) : group.isAllHidden ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-bold border border-red-500/20">
                                      مخفية بالكامل
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20">
                                      ظهور جزئي ({group.activeCount}/{group.total})
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 font-bold border border-sky-500/20">
                                    معاينة مباشرة ({group.total})
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                                <span>{group.total} خدمة في هذه الباقة</span>
                                <span>•</span>
                                <span className="text-primary font-medium">{group.activeCount} نشطة</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            {serviceLoadSource !== "stored" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedGroupNames([group.groupName]);
                                  openSyncModal(browseProvider, "selected");
                                }}
                                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border-sky-500/20"
                                title="استيراد وتفعيل هذه الباقة"
                              >
                                <span className="material-symbols-outlined text-xs">cloud_download</span>
                                <span>استيراد الباقة</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleSinglePackage(group.groupName, !group.isAllActive)}
                                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border ${
                                  group.isAllActive
                                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                                    : "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/20"
                                }`}
                                title={group.isAllActive ? "إخفاء كل خدمات هذه الباقة عن المتجر" : "تفعيل وإظهار كل خدمات الباقة في المتجر"}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {group.isAllActive ? "visibility_off" : "visibility"}
                                </span>
                                <span>{group.isAllActive ? "إخفاء الباقة" : "إظهار الباقة"}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleGroupExpand(group.groupName)}
                              className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-bold transition-all flex items-center gap-1 border border-outline-variant/20"
                            >
                              <span>عرض الخدمات</span>
                              <span className={`material-symbols-outlined text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                expand_more
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Services List Inside This Package */}
                        {isExpanded && (
                          <div className="p-2 sm:p-3 space-y-2 bg-surface-container-lowest/70 divide-y divide-outline-variant/10">
                            {group.services.map((srv, srvIdx) => {
                              const srvType = getProviderServiceType(srv);
                              const reqFields = getServiceRequiredFields(srv);

                              return (
                                <div
                                  key={srv.id ? `${srv.id}_${srvIdx}` : `srv_${srv.service_id || srv.name}_${srvIdx}`}
                                  className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="font-bold text-on-surface flex items-center gap-2 flex-wrap">
                                      <span>{srv.name}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                                        {getProviderServiceTypeLabel(srvType)}
                                      </span>
                                      <span className="text-primary font-mono font-bold text-xs">
                                        ${Number(srv.credit ?? srv.providerPrice ?? srv.price ?? srv.originalPrice ?? 0).toFixed(2)}
                                      </span>
                                    </div>

                                    {/* Fields Details Tag */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] text-on-surface-variant font-medium">
                                        الحقول المطلوبة للطلب:
                                      </span>
                                      {reqFields.map((f, idx) => (
                                        <span
                                          key={idx}
                                          className={`text-[9px] px-1.5 py-0.5 rounded-md border font-mono ${
                                            f.required
                                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                              : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant"
                                          }`}
                                        >
                                          {f.label} {f.required ? "*" : "(اختياري)"}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                                    {serviceLoadSource !== "stored" ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showToast("يرجى استيراد الباقة أولاً لتتمكن من تفعيل أو إخفاء خدماتها.", "error");
                                        }}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20"
                                        title="يجب استيراد الباقة أولاً"
                                      >
                                        <span className="material-symbols-outlined text-xs">info</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isPerformingBulkAction}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleSingleService(srv);
                                        }}
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                          srv.isActive
                                            ? "bg-violet-500/10 text-violet-400 hover:bg-red-500/10 hover:text-red-400 border border-violet-500/20"
                                            : "bg-red-500/10 text-red-400 hover:bg-violet-500/10 hover:text-violet-400 border border-red-500/20"
                                        }`}
                                        title={srv.isActive ? "إخفاء عن المتجر" : "إظهار في المتجر"}
                                      >
                                        <span className="material-symbols-outlined text-xs">
                                          {srv.isActive ? "visibility" : "visibility_off"}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {visibleGroupsLimit < filteredGroups.length && (
                    <div className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleGroupsLimit((prev) => prev + 50)}
                        className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs border border-primary/20 transition-all shadow-sm flex items-center gap-1.5 mx-auto"
                      >
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                        <span>تحميل المزيد من الباقات ({visibleGroupsLimit} من أصل {filteredGroups.length}) ⬇️</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/admin/services"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>الانتقال لصفحة تعديل الأسعار وهوامش الربح لكافة الخدمات</span>
              </Link>
              <button
                type="button"
                onClick={closeBrowseServices}
                className="px-5 py-2 rounded-xl bg-surface-variant text-on-surface-variant hover:text-on-surface text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW DATA DOWNLOAD MODAL */}
      {rawExportModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">download</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">تحميل داتا المزود الأصلية الخام (Raw Data)</h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{rawExportModalProvider.name}</p>
                </div>
              </div>
              <button
                onClick={() => setRawExportModalProvider(null)}
                disabled={isDownloadingRaw}
                className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 text-xs text-on-surface-variant space-y-1 leading-relaxed">
              <p className="font-bold text-violet-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>بيانات خام أصلية 100% بدون أي إضافات أو تعديلات من نظامنا:</span>
              </p>
              <p>يتم سحب الرد الأصلي من سيرفر المزود كما هو بدون حقول إضافية أو حساب هوامش أو تغيير مسميات.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleDownloadRawProviderData(rawExportModalProvider, "all")}
                disabled={isDownloadingRaw}
                className="w-full p-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 hover:border-violet-500/40 text-right transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-on-surface group-hover:text-violet-400 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-violet-400">inventory_2</span>
                    <span>1. تحميل جميع الاستجابات الخام (Full Raw API)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    ملف JSON يضم الردود الكاملة الأصلية لجميع الأقسام: IMEI + Server + Remote
                  </p>
                </div>
                <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-violet-400 group-hover:translate-x-[-4px] transition-all">
                  download
                </span>
              </button>

              <button
                onClick={() => handleDownloadRawProviderData(rawExportModalProvider, "pure_dhru")}
                disabled={isDownloadingRaw}
                className="w-full p-4 rounded-2xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 hover:border-violet-500/40 text-right transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold text-on-surface group-hover:text-violet-400 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-violet-400">code</span>
                    <span>2. تحميل بصيغة Dhru الأصلية المباشرة (SUCCESS: LIST)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    مصفوفة SUCCESS موحدة للباقات والخدمات بنفس صياغة وسيرفرات Dhru القياسية
                  </p>
                </div>
                <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-violet-400 group-hover:translate-x-[-4px] transition-all">
                  download
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={() => handleDownloadRawProviderData(rawExportModalProvider, "imei")}
                  disabled={isDownloadingRaw}
                  className="p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 text-center transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-primary text-xl">phone_iphone</span>
                  <span className="text-xs font-bold text-on-surface">خدمات IMEI الخام</span>
                  <span className="text-[10px] text-on-surface-variant">imeiservicelist</span>
                </button>

                <button
                  onClick={() => handleDownloadRawProviderData(rawExportModalProvider, "server")}
                  disabled={isDownloadingRaw}
                  className="p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 text-center transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-primary text-xl">dns</span>
                  <span className="text-xs font-bold text-on-surface">خدمات السيرفر الخام</span>
                  <span className="text-[10px] text-on-surface-variant">serverservicelist</span>
                </button>

                <button
                  onClick={() => handleDownloadRawProviderData(rawExportModalProvider, "remote")}
                  disabled={isDownloadingRaw}
                  className="p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 text-center transition-all flex flex-col items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-primary text-xl">settings_remote</span>
                  <span className="text-xs font-bold text-on-surface">خدمات Remote الخام</span>
                  <span className="text-[10px] text-on-surface-variant">remoteservicelist</span>
                </button>
              </div>
            </div>

            {isDownloadingRaw && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                <span>جاري سحب وتجهيز البيانات الأصلية من سيرفر المزود...</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setRawExportModalProvider(null)}
                disabled={isDownloadingRaw}
                className="px-5 py-2.5 rounded-xl bg-surface-variant text-on-surface-variant hover:text-on-surface text-xs font-bold transition-all"
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
