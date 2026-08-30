"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
  }
  return null;
};

const SERVICE_TYPE_LABELS = {
  imei: "IMEI",
  server: "Server",
  remote: "Remote"
};

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function normalizeFieldOptions(value) {
  if (Array.isArray(value)) return value.map((option) => stripHtml(option)).filter(Boolean);
  if (value && typeof value === "object") return Object.values(value).map((option) => stripHtml(option)).filter(Boolean);
  const cleaned = stripHtml(value);
  if (!cleaned) return [];
  return cleaned.split(/[,\n|]+/).map((option) => option.trim()).filter(Boolean);
}

function getServicePreviewFields(service) {
  const rawFields = Array.isArray(service?.customFields) ? service.customFields : [];

  return rawFields
    .map((field, index) => {
      const name = stripHtml(field?.fieldname || field?.FIELDNAME || field?.field_name || field?.name || field?.NAME || field?.customname || "");
      if (!name) return null;

      const options = normalizeFieldOptions(field?.fieldoptions ?? field?.FIELDOPTIONS ?? field?.options);
      const rawType = String(field?.fieldtype || field?.FIELDTYPE || field?.type || "").trim().toLowerCase();
      const type = options.length > 0 && (!rawType || rawType === "text") ? "select" : (rawType || "text");
      const requiredValue = field?.required ?? field?.REQUIRED;
      const required = requiredValue === true || requiredValue === 1 || ["1", "true", "yes", "on", "required"].includes(String(requiredValue ?? "").trim().toLowerCase());

      return {
        id: `${service?.id || "service"}_${index}_${name}`,
        name,
        type,
        required,
        description: stripHtml(field?.description || field?.DESCRIPTION || field?.placeholder || ""),
        options
      };
    })
    .filter(Boolean);
}

export default function ApiProvidersTab() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [activeProvider, setActiveProvider] = useState(null); // Used for fetch modal
  
  // Form states
  const [formData, setFormData] = useState({ name: "", api_url: "", username: "", api_key: "", is_active: true, provider_type: "dhru", mapping_rules: "{}" });
  
  // Sync states
  const [syncConfig, setSyncConfig] = useState({ exchange_rate: 50, markup_percent: 10, group_as_packages: true });
  const [syncingProvider, setSyncingProvider] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(null);

  // Fetch / Import states
  const [fetchedServices, setFetchedServices] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [importConfig, setImportConfig] = useState({ exchange_rate: 1, markup_percent: 10, group_as_packages: false });
  const [isImporting, setIsImporting] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/api-providers`, { headers: { Authorization: `Bearer ${token}` } });
      setProviders(res.data);
    } catch (err) {
      toast.error("فشل جلب مزودي الـ API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (editingProvider) {
        await axios.put(`${API_BASE_URL}/api/api-providers/${editingProvider.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("تم التحديث بنجاح");
      } else {
        await axios.post(`${API_BASE_URL}/api/api-providers`, formData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("تم الإضافة بنجاح");
      }
      setShowModal(false);
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المزود؟ سيتم إلغاء ربط جميع الخدمات والطلبات الخاصة به ولن تعمل بشكل تلقائي.")) return;
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/api/api-providers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تم الحذف بنجاح");
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحذف");
    }
  };

  const checkBalance = async (id) => {
    try {
      setBalanceLoading(id);
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/api-providers/${id}/balance`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`الرصيد الحالي: ${res.data.credit}`);
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل جلب الرصيد");
    } finally {
      setBalanceLoading(null);
    }
  };

  // --- Auto Sync Logic ---
  const openSyncModal = (provider) => {
    setSyncingProvider(provider);
    setSyncResult(null);
    setShowSyncModal(true);
  };

  const startSync = async () => {
    if (!syncingProvider) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const token = getToken();
      const res = await axios.post(`${API_BASE_URL}/api/api-providers/${syncingProvider.id}/sync`, syncConfig, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تمت المزامنة بنجاح");
      setSyncResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل المزامنة");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Selective Fetch & Import Logic ---
  const openFetchModal = async (provider) => {
    setActiveProvider(provider);
    setShowFetchModal(true);
    setIsFetching(true);
    setFetchedServices([]);
    setSelectedServices([]);
    setSearchQuery("");
    setCategoryFilter("all");
    
    try {
      const token = getToken();
      const res = await axios.post(`${API_BASE_URL}/api/api-providers/${provider.id}/fetch-services`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFetchedServices(res.data.services || []);
      const cats = Array.from(new Set(res.data.services.map(s => s.category).filter(Boolean)));
      const initialExpanded = {};
      // If there are few categories, expand them. Otherwise collapse all to save performance
      if (cats.length <= 3 && res.data.services.length < 500) {
        cats.forEach(c => initialExpanded[c] = true);
      }
      setExpandedCats(initialExpanded);
      toast.success(`تم العثور على ${res.data.servicesCount} خدمة من المزود.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل جلب الخدمات من المزود.");
      setShowFetchModal(false);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredServices = useMemo(() => {
    return fetchedServices.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(s.id).includes(searchQuery);
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      const matchesType = typeFilter === "all" || s.serviceType === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [fetchedServices, searchQuery, categoryFilter, typeFilter]);

  const allCategories = useMemo(() => {
    const cats = new Set(fetchedServices.map(s => s.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [fetchedServices]);

  const toggleSelectService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredServices.map(s => s.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedServices.includes(id));
    
    if (allSelected) {
       setSelectedServices(selectedServices.filter(id => !filteredIds.includes(id)));
    } else {
       const newSelections = new Set([...selectedServices, ...filteredIds]);
       setSelectedServices(Array.from(newSelections));
    }
  };

  const updateFetchedService = (id, field, value) => {
    setFetchedServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const startImport = async () => {
    if (selectedServices.length === 0) {
      toast.error("يرجى تحديد خدمة واحدة على الأقل");
      return;
    }
    
    const servicesToImport = fetchedServices.filter(s => selectedServices.includes(s.id));
    setIsImporting(true);
    
    try {
      const token = getToken();
      const res = await axios.post(`${API_BASE_URL}/api/api-providers/${activeProvider.id}/import-services`, {
        services: servicesToImport,
        exchange_rate: importConfig.exchange_rate,
        markup_percent: importConfig.markup_percent,
        group_as_packages: importConfig.group_as_packages
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success(res.data.message || "تم الاستيراد بنجاح");
      setShowFetchModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل استيراد الخدمات");
    } finally {
      setIsImporting(false);
    }
  };

  const openModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        api_url: provider.api_url,
        username: provider.username,
        api_key: provider.api_key,
        is_active: provider.is_active,
        provider_type: provider.provider_type || "dhru",
        mapping_rules: provider.mapping_rules || "{\n  \"sync_endpoint\": \"\",\n  \"sync_method\": \"GET\",\n  \"map_array_path\": \"\",\n  \"map_service_id\": \"\",\n  \"map_service_name\": \"\"\n}"
      });
    } else {
      setEditingProvider(null);
      setFormData({ name: "", api_url: "", username: "", api_key: "", is_active: true, provider_type: "dhru", mapping_rules: "{\n  \"sync_endpoint\": \"\",\n  \"sync_method\": \"GET\",\n  \"map_array_path\": \"\",\n  \"map_service_id\": \"\",\n  \"map_service_name\": \"\"\n}" });
    }
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modern-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .modern-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", margin: 0 }}>مزودي الـ API</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "5px" }}>
            قم بإضافة وإدارة مزودي الخدمات لربط منتجات متجرك تلقائياً.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-add-premium"
          style={{ padding: "12px 24px", fontSize: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>➕</span> إضافة مزود جديد
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#38bdf8", fontWeight: "bold" }}>جاري تحميل البيانات...</div>
      ) : providers.length === 0 ? (
        <div style={{ 
          background: "rgba(255, 255, 255, 0.02)", border: "1px dashed rgba(255, 255, 255, 0.1)", 
          borderRadius: "16px", padding: "40px", textAlign: "center", color: "#94a3b8" 
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔗</div>
          <h3 style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "10px" }}>لا يوجد مزودين حالياً</h3>
          <p style={{ fontSize: "0.9rem" }}>أضف مزودك الأول للبدء في جلب الخدمات واستقبال الطلبات آلياً.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {providers.map((provider) => (
            <div key={provider.id} style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              transition: "all 0.3s ease",
              backdropFilter: "blur(25px)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ 
                    width: "50px", height: "50px", borderRadius: "12px", 
                    background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", 
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" 
                  }}>
                    🌐
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                      {provider.name}
                      <span style={{ 
                        fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", 
                        background: provider.is_active ? "rgba(16, 185, 129, 0.1)" : "rgba(248, 113, 113, 0.1)",
                        color: provider.is_active ? "#10b981" : "#f87171",
                        border: `1px solid ${provider.is_active ? "rgba(16, 185, 129, 0.2)" : "rgba(248, 113, 113, 0.2)"}`
                      }}>
                        {provider.is_active ? "نشط" : "معطل"}
                      </span>
                      {provider.provider_type === 'dynamic' && (
                        <span style={{ 
                          fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", 
                          background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.2)"
                        }}>مخصص (Dynamic)</span>
                      )}
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "5px 0 0 0", fontFamily: "monospace", direction: "ltr", textAlign: "left" }}>
                      {provider.api_url}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openModal(provider)} className="action-btn" style={{ padding: "8px 12px" }}>
                    ✏️ تعديل
                  </button>
                  <button onClick={() => handleDelete(provider.id)} className="action-btn btn-danger-premium" style={{ padding: "8px 12px" }}>
                    🗑️ حذف
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "10px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", marginBottom: "5px" }}>الرصيد المتاح</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#38bdf8" }}>
                      {provider.balance} {provider.currency}
                    </span>
                    <button 
                      onClick={() => checkBalance(provider.id)} 
                      disabled={balanceLoading === provider.id}
                      style={{ 
                        background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", 
                        color: "#38bdf8", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" 
                      }}
                    >
                      {balanceLoading === provider.id ? "جاري..." : "تحديث الرصيد"}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                  <button 
                    onClick={() => openFetchModal(provider)} 
                    className="action-btn" 
                    style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(56, 189, 248, 0.2)" }}
                  >
                    🔍 استعراض الخدمات
                  </button>
                  <button 
                    onClick={() => openSyncModal(provider)} 
                    className="btn-add-premium" 
                    style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "10px 16px", borderRadius: "10px" }}
                  >
                    🔄 مزامنة تلقائية
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fetch & Selective Import Modal */}
      <AnimatePresence>
        {showFetchModal && activeProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(4, 6, 14, 0.9)", backdropFilter: "blur(20px)",
              zIndex: 3000, display: "flex", flexDirection: "column", padding: "20px"
            }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", height: "100%", background: "rgba(17, 22, 45, 0.95)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)" }}>
              {/* Header */}
              <div style={{ padding: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px" }}>
                    🔍 استعراض خدمات: <span style={{ color: "#38bdf8" }}>{activeProvider.name}</span>
                  </h3>
                  <p style={{ color: "#94a3b8", margin: "5px 0 0 0", fontSize: "0.9rem" }}>
                    اختر الخدمات التي تريد إضافتها لمتجرك، وسيتم إنشاء أقسامها تلقائياً.
                  </p>
                </div>
                <button
                  onClick={() => setShowFetchModal(false)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: "40px", height: "40px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}
                >✕</button>
              </div>

              {/* Filters & Config */}
              {!isFetching && fetchedServices.length > 0 && (
                <div style={{ padding: "20px 25px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  <input
                    type="text"
                    placeholder="🔍 ابحث عن خدمة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-premium"
                    style={{ width: "100%" }}
                  />
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="search-input-premium"
                    style={{ width: "100%", cursor: "pointer", marginBottom: "10px" }}
                  >
                    <option value="all" style={{ background: "#11162d" }}>جميع أنواع الخدمات</option>
                    <option value="imei" style={{ background: "#11162d" }}>IMEI Services</option>
                    <option value="server" style={{ background: "#11162d" }}>Server Services</option>
                    <option value="remote" style={{ background: "#11162d" }}>Remote Services</option>
                  </select>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="search-input-premium"
                    style={{ width: "100%", cursor: "pointer" }}
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat} style={{ background: "#11162d" }}>
                        {cat === "all" ? "جميع الأقسام" : cat}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <label style={{ position: "absolute", top: "-10px", right: "10px", background: "#11162d", padding: "0 5px", fontSize: "0.75rem", color: "#10b981", borderRadius: "4px" }}>نسبة الربح %</label>
                      <input
                        type="number"
                        placeholder="نسبة الربح"
                        value={importConfig.markup_percent}
                        onChange={(e) => setImportConfig({...importConfig, markup_percent: e.target.value})}
                        className="search-input-premium"
                        style={{ width: "100%", color: "#10b981", fontWeight: "bold" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "25px" }} className="modern-scrollbar">
                {isFetching ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#38bdf8" }}>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ fontSize: "3rem", marginBottom: "15px" }}
                    >⚙️</motion.div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>جاري الاتصال بالمزود لجلب الخدمات...</h3>
                  </div>
                ) : fetchedServices.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⚠️</div>
                    <h3>لا توجد خدمات لعرضها</h3>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                        <input 
                          type="checkbox"
                          checked={filteredServices.length > 0 && filteredServices.every(s => selectedServices.includes(s.id))}
                          onChange={toggleSelectAllFiltered}
                          style={{ width: "18px", height: "18px", accentColor: "#38bdf8" }}
                        />
                        تحديد جميع الخدمات المعروضة ({filteredServices.length})
                      </label>
                      <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                        إجمالي المحدد: <span style={{ color: "#38bdf8", fontWeight: "900", background: "rgba(56, 189, 248, 0.1)", padding: "2px 8px", borderRadius: "8px" }}>{selectedServices.length}</span>
                      </span>
                    </div>

                    {Array.from(new Set(filteredServices.map(s => s.category))).map(cat => {
                      const catServices = filteredServices.filter(s => s.category === cat);
                      const allCatSelected = catServices.every(s => selectedServices.includes(s.id));
                      
                      const isExpanded = !!expandedCats[cat];
                      
                      const toggleCatServices = () => {
                         if (allCatSelected) {
                            setSelectedServices(prev => prev.filter(id => !catServices.map(s => s.id).includes(id)));
                         } else {
                            const newSelections = new Set([...selectedServices, ...catServices.map(s => s.id)]);
                            setSelectedServices(Array.from(newSelections));
                         }
                      };

                      const toggleExpand = (e) => {
                         // Prevent toggling if clicked on the checkbox
                         if (e.target.type === 'checkbox') return;
                         setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
                      };

                      // Performance fix: Limit rendered services if there are too many
                      const visibleCount = visibleCounts[cat] || 50;
                      
                      return (
                        <div key={cat} style={{ background: "rgba(0,0,0,0.15)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.03)" }}>
                          <div 
                            onClick={toggleExpand}
                            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", userSelect: "none", marginBottom: isExpanded ? "20px" : "0", paddingBottom: isExpanded ? "15px" : "0", borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.3s" }}
                          >
                            <span style={{ fontSize: "1.2rem", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>▶</span>
                            <input 
                              type="checkbox" 
                              checked={allCatSelected} 
                              onChange={toggleCatServices} 
                              onClick={(e) => e.stopPropagation()}
                              style={{ width: "22px", height: "22px", accentColor: "#10b981", cursor: "pointer" }} 
                            />
                            <h4 style={{ margin: 0, color: "#fff", fontSize: "1.3rem", fontWeight: "900" }}>{cat}</h4>
                            <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "4px 10px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "bold" }}>
                              {catServices.length} خدمات
                            </span>
                          </div>
                          
                          {isExpanded && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }}>
                            {catServices.slice(0, visibleCount).map(service => {
                              const previewFields = getServicePreviewFields(service);
                              const serviceTypeLabel = SERVICE_TYPE_LABELS[String(service.serviceType || "").toLowerCase()] || (service.serviceType || "Unknown");

                              return (
                              <label 
                                key={service.id}
                                style={{
                                  display: "flex", gap: "15px", padding: "18px",
                                  background: selectedServices.includes(service.id) ? "rgba(56, 189, 248, 0.08)" : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${selectedServices.includes(service.id) ? "rgba(56, 189, 248, 0.4)" : "rgba(255,255,255,0.05)"}`,
                                  borderRadius: "16px", cursor: "pointer", transition: "all 0.2s",
                                  alignItems: "flex-start"
                                }}
                              >
                                <input 
                                  type="checkbox"
                                  checked={selectedServices.includes(service.id)}
                                  onChange={() => toggleSelectService(service.id)}
                                  style={{ width: "22px", height: "22px", accentColor: "#38bdf8", marginTop: "2px" }}
                                />
                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <input 
                                    type="text"
                                    value={service.name}
                                    onChange={(e) => updateFetchedService(service.id, 'name', e.target.value)}
                                    onClick={(e) => e.preventDefault()}
                                    style={{ 
                                      width: "100%", background: "transparent", border: "1px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.1)",
                                      color: selectedServices.includes(service.id) ? "#fff" : "#cbd5e1", fontSize: "1rem", fontWeight: "bold", padding: "4px 0",
                                      outline: "none", transition: "border 0.3s"
                                    }}
                                    onFocus={(e) => e.target.style.borderBottom = "1px solid #38bdf8"}
                                    onBlur={(e) => e.target.style.borderBottom = "1px solid rgba(255,255,255,0.1)"}
                                    title="تعديل اسم الخدمة قبل الاستيراد"
                                  />
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                                    <input 
                                      type="text"
                                      value={service.category}
                                      onChange={(e) => updateFetchedService(service.id, 'category', e.target.value)}
                                      onClick={(e) => e.preventDefault()}
                                      className="search-input-premium"
                                      style={{ 
                                        width: "140px", fontSize: "0.8rem", padding: "4px 8px", 
                                        outline: "none", transition: "border 0.3s"
                                      }}
                                      onFocus={(e) => e.target.style.border = "1px solid #38bdf8"}
                                      onBlur={(e) => e.target.style.border = "1px solid transparent"}
                                      title="تعديل اسم القسم قبل الاستيراد"
                                    />
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>السعر:</span>
                                      <span style={{ fontSize: "1.1rem", fontWeight: "900", color: "#10b981", direction: "ltr" }}>
                                        $ {parseFloat(service.price)}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "2px" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#cbd5e1", background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: "999px" }}>
                                      ID: {service.id}
                                    </span>
                                    <span style={{ fontSize: "0.75rem", color: "#93c5fd", background: "rgba(59,130,246,0.12)", padding: "4px 8px", borderRadius: "999px" }}>
                                      النوع: {serviceTypeLabel}
                                    </span>
                                    {service.time ? (
                                      <span style={{ fontSize: "0.75rem", color: "#fcd34d", background: "rgba(234,179,8,0.12)", padding: "4px 8px", borderRadius: "999px" }}>
                                        الوقت: {service.time}
                                      </span>
                                    ) : null}
                                    {(service.min_quantity || service.max_quantity || service.requires_quantity) ? (
                                      <span style={{ fontSize: "0.75rem", color: "#a7f3d0", background: "rgba(16,185,129,0.12)", padding: "4px 8px", borderRadius: "999px" }}>
                                        الكمية: {service.min_quantity || 1}{service.max_quantity ? ` - ${service.max_quantity}` : "+"}
                                      </span>
                                    ) : null}
                                  </div>

                                  <div style={{ marginTop: "4px", padding: "12px", borderRadius: "12px", background: "rgba(2, 6, 23, 0.28)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: previewFields.length > 0 ? "10px" : 0 }}>
                                      <span style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#e2e8f0" }}>
                                        الحقول المطلوبة
                                      </span>
                                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                        {previewFields.length} حقل
                                      </span>
                                    </div>

                                    {previewFields.length > 0 ? (
                                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {previewFields.map((field) => (
                                          <div key={field.id} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: field.description || field.options.length > 0 ? "6px" : 0 }}>
                                              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "0.85rem" }}>{field.name}</span>
                                              <span style={{ fontSize: "0.72rem", color: "#93c5fd", background: "rgba(59,130,246,0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                                                {field.type}
                                              </span>
                                              <span style={{ fontSize: "0.72rem", color: field.required ? "#fca5a5" : "#86efac", background: field.required ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                                                {field.required ? "إجباري" : "اختياري"}
                                              </span>
                                            </div>
                                            {field.description ? (
                                              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: "1.6" }}>
                                                {field.description}
                                              </div>
                                            ) : null}
                                            {field.options.length > 0 ? (
                                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                                                {field.options.map((option) => (
                                                  <span key={`${field.id}_${option}`} style={{ fontSize: "0.72rem", color: "#dbeafe", background: "rgba(14,116,144,0.16)", padding: "3px 8px", borderRadius: "999px" }}>
                                                    {option}
                                                  </span>
                                                ))}
                                              </div>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                                        بدون حقول إضافية
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </label>
                            )})}
                            {catServices.length > visibleCount && (
                              <button 
                                onClick={(e) => { 
                                  e.preventDefault(); 
                                  setVisibleCounts(prev => ({ ...prev, [cat]: (prev[cat] || 50) + 100 })); 
                                }}
                                style={{
                                  gridColumn: "1 / -1", background: "rgba(56, 189, 248, 0.1)", border: "1px dashed rgba(56, 189, 248, 0.4)",
                                  color: "#38bdf8", padding: "12px", borderRadius: "16px", cursor: "pointer", fontWeight: "bold",
                                  marginTop: "10px"
                                }}
                              >
                                عرض المزيد (متبقي {catServices.length - visibleCount}) ↓
                              </button>
                            )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {!isFetching && fetchedServices.length > 0 && (
                <div style={{ padding: "20px 25px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "10px 15px", borderRadius: "10px" }}>
                    <input
                      type="checkbox"
                      id="groupPackagesImport"
                      checked={importConfig.group_as_packages}
                      onChange={(e) => setImportConfig({...importConfig, group_as_packages: e.target.checked})}
                      style={{ width: "20px", height: "20px", accentColor: "#818cf8" }}
                    />
                    <label htmlFor="groupPackagesImport" style={{ color: "#fff", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold" }}>
                      تجميع الخدمات في باقات داخل منتج واحد
                    </label>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                      عند التفعيل قد تصبح الحقول على مستوى الباقة بدل كل خدمة منفصلة.
                    </span>
                  </div>
                  <button
                    onClick={startImport}
                    disabled={isImporting || selectedServices.length === 0}
                    className="btn-add-premium"
                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", padding: "15px 30px", borderRadius: "14px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px", opacity: (isImporting || selectedServices.length === 0) ? 0.5 : 1, boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)" }}
                  >
                    {isImporting ? "⏳ جاري الاستيراد..." : `📥 استيراد المحدد (${selectedServices.length})`}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(4, 6, 14, 0.8)", backdropFilter: "blur(12px)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "rgba(17, 22, 45, 0.95)", border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px", padding: "25px", maxWidth: "600px", width: "100%", 
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)", maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{editingProvider ? "✏️" : "➕"}</span> 
                {editingProvider ? "تعديل بيانات المزود" : "إضافة مزود جديد"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}
              >✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}>اسم المزود:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important", width: "100%" }}
                  placeholder="مثال: API Provider 1"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}>رابط الـ API (URL):</label>
                <input
                  type="url"
                  required
                  value={formData.api_url}
                  onChange={(e) => setFormData({...formData, api_url: e.target.value})}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important", width: "100%", direction: "ltr", fontFamily: "monospace" }}
                  placeholder="https://provider.com/api/v2"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}>اسم المستخدم (إن وجد):</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="search-input-premium"
                    style={{ padding: "12px 16px !important", width: "100%", direction: "ltr" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}>مفتاح الـ API (API Key):</label>
                  <input
                    type="text"
                    required
                    value={formData.api_key}
                    onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                    className="search-input-premium"
                    style={{ padding: "12px 16px !important", width: "100%", direction: "ltr", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.9rem" }}>نوع المزود:</label>
                <select
                  value={formData.provider_type || "dhru"}
                  onChange={(e) => setFormData({...formData, provider_type: e.target.value})}
                  className="search-input-premium"
                  style={{ padding: "12px 16px !important", width: "100%", cursor: "pointer", background: "#11162d" }}
                >
                  <option value="dhru">قياسي (Dhru / PerfectPanel / GSM)</option>
                  <option value="dynamic">مخصص (Dynamic Mapper - ربط ديناميكي)</option>
                </select>
              </div>

              {formData.provider_type === "dynamic" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#38bdf8", fontSize: "0.9rem" }}>
                    إعدادات الربط الديناميكي (JSON Mapping Rules):
                  </label>
                  <textarea
                    value={formData.mapping_rules}
                    onChange={(e) => setFormData({...formData, mapping_rules: e.target.value})}
                    className="search-input-premium"
                    style={{ padding: "12px 16px !important", width: "100%", minHeight: "200px", fontFamily: "monospace", direction: "ltr" }}
                    placeholder='{"sync_endpoint": "https://api.com/services", "map_array_path": "data.services"}'
                  />
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "5px" }}>
                    قم بكتابة خريطة الـ JSON. مثال: 
                    <code>map_array_path</code> هو مسار المصفوفة، و <code>map_service_name</code> و <code>map_service_id</code> وغيرها.
                  </p>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#10b981" }}
                />
                <label htmlFor="isActiveToggle" style={{ fontWeight: "bold", color: "#cbd5e1", cursor: "pointer", fontSize: "0.9rem", userSelect: "none" }}>
                  تفعيل المزود (الردود والطلبات الآلية)
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="button" onClick={() => setShowModal(false)} className="action-btn" style={{ flex: 1, padding: "12px", borderRadius: "12px", justifyContent: "center" }}>
                  إلغاء
                </button>
                <button type="submit" className="btn-add-premium" style={{ flex: 2, padding: "12px", borderRadius: "12px", fontSize: "1rem" }}>
                  💾 حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && syncingProvider && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(4, 6, 14, 0.8)", backdropFilter: "blur(12px)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "rgba(17, 22, 45, 0.95)", border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "24px", padding: "30px", maxWidth: "600px", width: "100%", 
            boxShadow: "0 20px 50px rgba(79, 70, 229, 0.2)"
          }}>
            {!syncResult ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#ffffff", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#818cf8" }}>🔄</span> مزامنة الخدمات: {syncingProvider.name}
                  </h3>
                  <button onClick={() => !isSyncing && setShowSyncModal(false)} disabled={isSyncing} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                <div style={{ background: "rgba(79, 70, 229, 0.1)", border: "1px solid rgba(79, 70, 229, 0.2)", padding: "15px", borderRadius: "12px", marginBottom: "20px", color: "#c7d2fe", fontSize: "0.9rem", lineHeight: "1.5" }}>
                  سيتم سحب جميع الأقسام والخدمات الجديدة، بالإضافة لتحديث أسعار الخدمات الموجودة مسبقاً بناءً على نسبة الربح.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: "20px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#cbd5e1", fontSize: "0.85rem" }}>نسبة الربح المضافة (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={syncConfig.markup_percent}
                      onChange={(e) => setSyncConfig({...syncConfig, markup_percent: e.target.value})}
                      className="search-input-premium"
                      style={{ padding: "12px 16px !important", width: "100%", fontSize: "1.2rem", fontWeight: "bold", color: "#10b981", textAlign: "left", direction: "ltr" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(255, 255, 255, 0.02)", padding: "15px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "25px" }}>
                  <input
                    type="checkbox"
                    id="groupPackages"
                    checked={syncConfig.group_as_packages}
                    onChange={(e) => setSyncConfig({...syncConfig, group_as_packages: e.target.checked})}
                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#818cf8", marginTop: "2px" }}
                  />
                  <div>
                    <label htmlFor="groupPackages" style={{ fontWeight: "bold", color: "#ffffff", cursor: "pointer", fontSize: "1rem", display: "block", marginBottom: "4px" }}>
                      تجميع الخدمات في باقات (Packages)
                    </label>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                      يُفضل تفعيله لجمع الخدمات المتشابهة (مثل فئات شدات ببجي) في منتج واحد ليختاره العميل من قائمة منسدلة.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={startSync}
                  disabled={isSyncing}
                  className="btn-add-premium"
                  style={{ width: "100%", padding: "15px", borderRadius: "16px", fontSize: "1.1rem", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
                >
                  {isSyncing ? "⏳ جاري المزامنة... يرجى الانتظار" : "▶ بدء المزامنة الآن"}
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: "15px", color: "#10b981" }}>✅</div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#ffffff", margin: "0 0 10px 0" }}>اكتملت المزامنة بنجاح!</h3>
                <p style={{ color: "#cbd5e1", fontSize: "1rem", marginBottom: "25px", lineHeight: "1.5" }}>
                  {syncResult.message || "تم سحب وتحديث الخدمات والأسعار من المزود."}
                </p>
                <button 
                  onClick={() => setShowSyncModal(false)}
                  className="action-btn"
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", justifyContent: "center", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "#fff" }}
                >
                  إغلاق النافذة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
