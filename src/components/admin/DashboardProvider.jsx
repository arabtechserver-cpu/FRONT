"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { API_BASE_URL } from "@/config";
// import dashboardStyles removed
import { AdminDashboardContext } from "@/components/admin/AdminDashboardContext";
export default function DashboardProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // orders, categories, services, banners, wallet, customers
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  const defaultFields = [
    { id: "player_id", label: "معرّف اللاعب / حساب الخدمة (Player ID / Email)", placeholder: "أدخل معرّف الحساب بدقة هنا (مثال: 512495910)", type: "text", required: true }
  ];

  // Data states
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all"); // all, pending, completed, cancelled
  const [catSearch, setCatSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  // Modal / Form states
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("games");
  const [catUploadedFile, setCatUploadedFile] = useState(null);
  const [newCatFields, setNewCatFields] = useState(defaultFields);
  const [newCatFieldsTitle, setNewCatFieldsTitle] = useState("بيانات الخدمة");
  const [newCatParentId, setNewCatParentId] = useState("");
  const [newCatLinkedCategories, setNewCatLinkedCategories] = useState([]);
  const [newCatIsFeatured, setNewCatIsFeatured] = useState(false);
  const [newCatCoverImage, setNewCatCoverImage] = useState(null);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceCatId, setNewServiceCatId] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceApiProviderId, setNewServiceApiProviderId] = useState("");
  const [apiProviders, setApiProviders] = useState([]);
  const [newServiceImage, setNewServiceImage] = useState("pubg");
  const [serviceUploadedFile, setServiceUploadedFile] = useState(null);
  const [newServicePriceType, setNewServicePriceType] = useState("fixed"); // fixed or dynamic
  const [newServicePricePerThousand, setNewServicePricePerThousand] = useState(0);
  const [newServiceIsPopular, setNewServiceIsPopular] = useState(false);
  const [newServiceShowInMenu, setNewServiceShowInMenu] = useState(true);
  const [newServiceIsFeatured, setNewServiceIsFeatured] = useState(false);

  // Package list builder
  const [newServicePackages, setNewServicePackages] = useState([
    { name: "", price: 0 }
  ]);

  const [newServiceFields, setNewServiceFields] = useState(defaultFields);
  const [newServiceFieldsTitle, setNewServiceFieldsTitle] = useState("");
  const [newServiceDownloadLink, setNewServiceDownloadLink] = useState("");
  const [newServiceDownloadLinkTitle, setNewServiceDownloadLinkTitle] = useState("تحميل الأداة");

  // Edit Category Modal / Form states
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatImage, setEditCatImage] = useState("games");
  const [editCatUploadedFile, setEditCatUploadedFile] = useState(null);
  const [editCatFields, setEditCatFields] = useState(defaultFields);
  const [editCatFieldsTitle, setEditCatFieldsTitle] = useState("بيانات الخدمة");
  const [applyToServices, setApplyToServices] = useState(false);
  const [editCatParentId, setEditCatParentId] = useState("");
  const [editCatLinkedCategories, setEditCatLinkedCategories] = useState([]);
  const [editCatIsFeatured, setEditCatIsFeatured] = useState(false);
  const [editCatCoverImage, setEditCatCoverImage] = useState(null);

  // Edit Service Modal / Form states
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceDesc, setEditServiceDesc] = useState("");
  const [editServiceCatId, setEditServiceCatId] = useState("");
  const [editServiceImage, setEditServiceImage] = useState("pubg");
  const [editServiceApiProviderId, setEditServiceApiProviderId] = useState("");
  const [editServiceUploadedFile, setEditServiceUploadedFile] = useState(null);
  const [editServicePackages, setEditServicePackages] = useState([{ name: "", price: 0 }]);
  const [editServiceFields, setEditServiceFields] = useState(defaultFields);
  const [editServicePriceType, setEditServicePriceType] = useState("fixed");
  const [editServicePricePerThousand, setEditServicePricePerThousand] = useState(0);
  const [editServiceFieldsTitle, setEditServiceFieldsTitle] = useState("");
  const [editServiceDownloadLink, setEditServiceDownloadLink] = useState("");
  const [editServiceDownloadLinkTitle, setEditServiceDownloadLinkTitle] = useState("تحميل الأداة");
  const [editServiceIsPopular, setEditServiceIsPopular] = useState(false);
  const [editServiceShowInMenu, setEditServiceShowInMenu] = useState(true);
  const [editServiceIsFeatured, setEditServiceIsFeatured] = useState(false);

  // Banners data & form states
  const [banners, setBanners] = useState([]);
  const [bannerSearch, setBannerSearch] = useState("");

  const [walletRequests, setWalletRequests] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletSearch, setWalletSearch] = useState("");
  const [walletFilter, setWalletFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerTransactions, setSelectedCustomerTransactions] = useState([]);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [editCustomerUsername, setEditCustomerUsername] = useState("");
  const [editCustomerEmail, setEditCustomerEmail] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editCustomerBalance, setEditCustomerBalance] = useState("");
  const [editCustomerBalances, setEditCustomerBalances] = useState({});
  const [editCustomerNewPassword, setEditCustomerNewPassword] = useState("");

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerHighlight, setNewBannerHighlight] = useState("");
  const [newBannerDesc, setNewBannerDesc] = useState("");
  const [newBannerBadge, setNewBannerBadge] = useState("");
  const [newBannerColor, setNewBannerColor] = useState("#8b5cf6");
  const [newBannerIcon, setNewBannerIcon] = useState("⚡");
  const [newBannerLink, setNewBannerLink] = useState("");
  const [bannerUploadedFile, setBannerUploadedFile] = useState(null);

  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [editBannerTitle, setEditBannerTitle] = useState("");
  const [editBannerHighlight, setEditBannerHighlight] = useState("");
  const [editBannerDesc, setEditBannerDesc] = useState("");
  const [editBannerBadge, setEditBannerBadge] = useState("");
  const [editBannerColor, setEditBannerColor] = useState("#8b5cf6");
  const [editBannerIcon, setEditBannerIcon] = useState("⚡");
  const [editBannerLink, setEditBannerLink] = useState("");
  const [editBannerUploadedFile, setEditBannerUploadedFile] = useState(null);

  const [siteName, setSiteName] = useState("");
  const [announcementText, setAnnouncementText] = useState("🟢 واتساب الإدارة 1: +1 (672) 897-2935 | 🟢 واتساب الإدارة 2: +249 12 366 7227");
  const [siteLogo, setSiteLogo] = useState("");
  const [siteFavicon, setSiteFavicon] = useState("");
  const [logoUploadedFile, setLogoUploadedFile] = useState(null);
  const [faviconUploadedFile, setFaviconUploadedFile] = useState(null);
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);
  const [globalCurrencies, setGlobalCurrencies] = useState(["USD", "USDT"]);
  const [exchangeRates, setExchangeRates] = useState({ "USD": 50, "USDT": 51 });
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [supportedCurrenciesText, setSupportedCurrenciesText] = useState("USD, USDT");
  const [hideWalletPayment, setHideWalletPayment] = useState(false);
  const [apiAutoSubmit, setApiAutoSubmit] = useState(true);
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [newWhatsappNumber, setNewWhatsappNumber] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [waStatus, setWaStatus] = useState("disconnected"); // 'disconnected'|'loading'|'qr'|'ready'
  const [waQR, setWaQR] = useState(null);
  const waPollingRef = useRef(null);
  const settingsLoadedRef = useRef(false);
  const [featuredSections, setFeaturedSections] = useState([]);

  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [globalMarkupPercent, setGlobalMarkupPercent] = useState(0);
  const [savingMarkup, setSavingMarkup] = useState(false);
  const [unlockerSortOrder, setUnlockerSortOrder] = useState("original"); // original or alphabetical
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [credentialsErrorMsg, setCredentialsErrorMsg] = useState("");
  const [credentialsSuccessMsg, setCredentialsSuccessMsg] = useState("");

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeModalOrder, setCodeModalOrder] = useState(null);
  const [codeValue, setCodeValue] = useState("");
  const [codeModalStatusToUpdate, setCodeModalStatusToUpdate] = useState(null);
  const [orderDownloadLinkValue, setOrderDownloadLinkValue] = useState("");
  const [orderDownloadLinkTitleValue, setOrderDownloadLinkTitleValue] = useState("");
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [orderDetailsData, setOrderDetailsData] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [addCurrencySelect, setAddCurrencySelect] = useState("USD");
  const [addCurrencyCustomCode, setAddCurrencyCustomCode] = useState("");
  const [addCurrencyRate, setAddCurrencyRate] = useState("");

  const [excelAppleUsdRate, setExcelAppleUsdRate] = useState(50.0);
  const [excelAppleMarkup, setExcelAppleMarkup] = useState(10.0);
  const [excelFrpUsdRate, setExcelFrpUsdRate] = useState(50.0);
  const [excelFrpMarkup, setExcelFrpMarkup] = useState(10.0);
  const [excelSettingsSuccessMsg, setExcelSettingsSuccessMsg] = useState("");
  const [excelSettingsErrorMsg, setExcelSettingsErrorMsg] = useState("");
  const [excelAppleUploadMsg, setExcelAppleUploadMsg] = useState("");
  const [excelFrpUploadMsg, setExcelFrpUploadMsg] = useState("");
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [unlockerApiKey, setUnlockerApiKey] = useState("5TC-O62-NRZ-HF3-NQ4-3VJ-S7V-FPK");
  const [unlockerUsername, setUnlockerUsername] = useState("Hassen1990");
  const [unlockerApiUrl, setUnlockerApiUrl] = useState("https://amrr-unlocker.com/api/index.php");
  const [unlockerExchangeRate, setUnlockerExchangeRate] = useState(50);
  const [unlockerMarkupPercent, setUnlockerMarkupPercent] = useState(10);
  const [unlockerServices, setUnlockerServices] = useState([]);
  const [unlockerLoading, setUnlockerLoading] = useState(false);
  const [unlockerSearch, setUnlockerSearch] = useState("");
  const [unlockerCategoryFilter, setUnlockerCategoryFilter] = useState("ALL");
  const [unlockerPage, setUnlockerPage] = useState(1);
  const [unlockerPageSize, setUnlockerPageSize] = useState(50);
  const [unlockerImportTargetCat, setUnlockerImportTargetCat] = useState("auto");
  const [unlockerNewCatName, setUnlockerNewCatName] = useState("");
  const [selectedUnlockerServices, setSelectedUnlockerServices] = useState([]);
  const [unlockerSettingsMsg, setUnlockerSettingsMsg] = useState("");
  const [unlockerSyncMsg, setUnlockerSyncMsg] = useState("");
  const [unlockerGroupAsPackages, setUnlockerGroupAsPackages] = useState(true);
  const [unlockerCustomPrices, setUnlockerCustomPrices] = useState({});
  const [unlockerCustomDiscounts, setUnlockerCustomDiscounts] = useState({});
  const [unlockerBalance, setUnlockerBalance] = useState(null);
  const [unlockerBalanceLoading, setUnlockerBalanceLoading] = useState(false);
  const [unlockerBalanceEmail, setUnlockerBalanceEmail] = useState("");
  const [unlockerCurrency, setUnlockerCurrency] = useState("USD");

  // Deletion Gate (OTP verification modal for sensitive deletes)
  const [deleteOtpModal, setDeleteOtpModal] = useState({
    isOpen: false,
    url: "",
    message: "",
    method: "DELETE",
    body: null,
    onSuccess: null,
  });
  const [deleteOtpCode, setDeleteOtpCode] = useState("");
  const [deleteOtpLoading, setDeleteOtpLoading] = useState(false);
  const [deleteOtpError, setDeleteOtpError] = useState("");

  const [showMergeCategoriesModal, setShowMergeCategoriesModal] = useState(false);
  const [mergeSourceIds, setMergeSourceIds] = useState([]);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [onMergeSuccessCallback, setOnMergeSuccessCallback] = useState(null);

  const secureDeleteFetch = async (url, onSuccessCallback) => {
    return secureActionFetch(url, "DELETE", null, onSuccessCallback, "يرجى إدخال كود التحقق (OTP) المرسل على الواتساب لإتمام عملية الحذف.", "فشل عملية الحذف.");
  };

  const secureActionFetch = async (url, method, body, onSuccessCallback, defaultOtpMessage = "يرجى إدخال كود التحقق (OTP).", defaultErrorMessage = "فشلت العملية.") => {
    try {
      const options = {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      };
      if (body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.status === 403 && data && data.requireOtp) {
        setDeleteOtpModal({
          isOpen: true,
          url,
          method,
          body,
          message: data.message || defaultOtpMessage,
          onSuccess: onSuccessCallback
        });
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || defaultErrorMessage);
      }
      onSuccessCallback(data);
    } catch (err) {
      alert(err.message || defaultErrorMessage);
    }
  };

  const handleConfirmDeleteOtp = async (e) => {
    e.preventDefault();
    if (!deleteOtpModal.url || !deleteOtpCode) return;
    setDeleteOtpLoading(true);
    setDeleteOtpError("");
    try {
      const options = {
        method: deleteOtpModal.method || "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-OTP-Code": deleteOtpCode
        }
      };
      if (deleteOtpModal.body) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(deleteOtpModal.body);
      }
      const response = await fetch(deleteOtpModal.url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "كود التحقق غير صحيح أو انتهت صلاحيته.");
      }
      if (deleteOtpModal.onSuccess) {
        deleteOtpModal.onSuccess(data);
      }
      setDeleteOtpModal({ isOpen: false, url: "", message: "", method: "DELETE", body: null, onSuccess: null });
      setDeleteOtpCode("");
    } catch (err) {
      setDeleteOtpError(err.message || "فشل التنفيذ باستخدام كود الواتساب.");
    } finally {
      setDeleteOtpLoading(false);
    }
  };

  const fetchUnlockerBalance = useCallback(async () => {
    if (!token) return;
    setUnlockerBalanceLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/balance`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUnlockerBalance(data.credit);
        setUnlockerBalanceEmail(data.email);
        if (data.currency) {
          setUnlockerCurrency(data.currency);
        }
      } else {
        console.warn("Failed to fetch unlocker balance:", data.message);
      }
    } catch (err) {
      console.warn("Failed to fetch unlocker balance:", err.message);
    } finally {
      setUnlockerBalanceLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "amrr_unlocker" && token) {
      const timer = setTimeout(() => {
        void fetchUnlockerBalance();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, token, fetchUnlockerBalance]);

  const unlockerCategories = useMemo(() => {
    return ["ALL", ...Array.from(new Set(unlockerServices.map(s => s.category))).sort()];
  }, [unlockerServices]);

  const importedUnlockerServiceIds = useMemo(() => {
    return new Set(services.filter(s => s.api_source === 'amrr-unlocker').map(s => String(s.api_service_id)));
  }, [services]);

  const filteredUnlockerServices = useMemo(() => {
    const query = (unlockerSearch || "").trim().toLowerCase();
    const filtered = unlockerServices.filter(s => {
      const name = s.name || "";
      const category = s.category || "";
      const matchSearch = !query ||
        name.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        String(s.id).includes(query);
      const matchCat = unlockerCategoryFilter === "ALL" || s.category === unlockerCategoryFilter;
      return matchSearch && matchCat;
    });

    if (unlockerSortOrder === "alphabetical") {
      return [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || "", 'en'));
    }
    return filtered;
  }, [unlockerServices, unlockerSearch, unlockerCategoryFilter, unlockerSortOrder]);

  const totalUnlockerPages = Math.max(1, Math.ceil(filteredUnlockerServices.length / unlockerPageSize));
  const paginatedUnlockerServices = useMemo(() => {
    const start = (unlockerPage - 1) * unlockerPageSize;
    return filteredUnlockerServices.slice(start, start + unlockerPageSize);
  }, [filteredUnlockerServices, unlockerPage, unlockerPageSize]);

  useEffect(() => {
    setHydrated(true);

    const storedToken = localStorage.getItem("admin_token") || "";
    setToken(storedToken);

    try {
      const storedUser = localStorage.getItem("admin_user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setAdminUser(parsedUser);
      setNewAdminUsername(parsedUser?.username || "");
    } catch {
      setAdminUser(null);
      setNewAdminUsername("");
    }
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const revenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + Number(o.package_price || 0), 0);

    return {
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      revenue
    };
  }, [orders]);

  const currentDashboardTab = useMemo(() => {
    const match = pathname?.match(/\/admin\/dashboard\/([^/?#]+)/);
    return match?.[1] || "orders";
  }, [pathname]);

  const authedHeaders = useCallback(() => ({ "Authorization": `Bearer ${token}` }), [token]);

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  }, [router]);

  // Security Check
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.push("/admin/login");
    }
  }, [hydrated, token, router]);

  const loadCategories = useCallback(async () => {
    const catRes = await fetch(`${API_BASE_URL}/api/categories`);
    if (!catRes.ok) return;
    const catData = await catRes.json();
    const sortedCats = [...(catData || [])].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    setCategories(sortedCats);
    if (sortedCats.length > 0) {
      setNewServiceCatId((current) => current || sortedCats[0].id.toString());
    }
  }, []);

  const loadServices = useCallback(async () => {
    const serviceRes = await fetch(`${API_BASE_URL}/api/services`);
    if (!serviceRes.ok) return;
    const serviceData = await serviceRes.json();
    const sortedServices = [...(serviceData || [])].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    setServices(sortedServices);
  }, []);

  const loadSettings = useCallback(async () => {
    const settingsRes = await fetch(`${API_BASE_URL}/api/settings/admin`, { headers: authedHeaders() });
    if (!settingsRes.ok) return;

    const settingsData = await settingsRes.json();
    setSiteName(settingsData.site_name || "Arab Tech Server");
    setSiteLogo(settingsData.site_logo || "default");
    setSiteFavicon(settingsData.site_favicon || "default");
    setPaymentMethodsList(settingsData.payment_methods || []);
    if (settingsData.supported_currencies) {
      setGlobalCurrencies(settingsData.supported_currencies);
      setSupportedCurrenciesText(settingsData.supported_currencies.join(", "));
    }
    if (settingsData.exchange_rates) {
      setExchangeRates(settingsData.exchange_rates);
    }
    setBaseCurrency("USD");
    setHideWalletPayment(settingsData.hide_wallet_payment || false);
    if (settingsData.api_auto_submit !== undefined) {
      setApiAutoSubmit(settingsData.api_auto_submit);
    }
    if (settingsData.whatsapp_numbers && Array.isArray(settingsData.whatsapp_numbers)) {
      setWhatsappNumbers(settingsData.whatsapp_numbers);
    }
    if (settingsData.email_user !== undefined) setEmailUser(settingsData.email_user);
    if (settingsData.email_pass !== undefined) setEmailPass(settingsData.email_pass);
    if (settingsData.global_markup_percent !== undefined) {
      setGlobalMarkupPercent(settingsData.global_markup_percent);
    }
    if (settingsData.announcement_text !== undefined) {
      setAnnouncementText(settingsData.announcement_text);
    }
    if (settingsData.featured_sections !== undefined) {
      setFeaturedSections(Array.isArray(settingsData.featured_sections) ? settingsData.featured_sections : []);
    }
    settingsLoadedRef.current = true;
  }, [authedHeaders]);

  const loadOrders = useCallback(async () => {
    const orderRes = await fetch(`${API_BASE_URL}/api/orders?limit=100`, { headers: authedHeaders() });
    if (orderRes.status === 401 || orderRes.status === 403) {
      handleAuthFailure();
      return;
    }
    if (orderRes.ok) {
      setOrders(await orderRes.json());
    }
  }, [authedHeaders, handleAuthFailure]);

  const loadBanners = useCallback(async () => {
    const bannerRes = await fetch(`${API_BASE_URL}/api/banners`);
    if (bannerRes.ok) setBanners(await bannerRes.json());
  }, []);

  const loadWallets = useCallback(async () => {
    const headers = authedHeaders();
    const [walletRes, walletTxRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/wallet`, { headers }),
      fetch(`${API_BASE_URL}/api/wallet/transactions`, { headers })
    ]);
    if (walletRes.ok) setWalletRequests(await walletRes.json());
    if (walletTxRes.ok) setWalletTransactions(await walletTxRes.json());
  }, [authedHeaders]);

  const loadWalletTransactions = useCallback(async () => {
    const walletTxRes = await fetch(`${API_BASE_URL}/api/wallet/transactions`, { headers: authedHeaders() });
    if (walletTxRes.ok) setWalletTransactions(await walletTxRes.json());
  }, [authedHeaders]);

  const loadCustomers = useCallback(async () => {
    const customersRes = await fetch(`${API_BASE_URL}/api/customer/admin/customers`, { headers: authedHeaders() });
    if (!customersRes.ok) return;
    const customersData = await customersRes.json();
    setCustomers(customersData);
    if (customersData.length > 0) {
      setSelectedCustomerId((current) => current || customersData[0].id);
    }
  }, [authedHeaders]);

  const loadApiProviders = useCallback(async () => {
    const apiProvidersRes = await fetch(`${API_BASE_URL}/api/api-providers`, { headers: authedHeaders() });
    if (apiProvidersRes.ok) setApiProviders(await apiProvidersRes.json());
  }, [authedHeaders]);

  const loadUnlockerSettings = useCallback(async () => {
    const unlockerSettingsRes = await fetch(`${API_BASE_URL}/api/unlocker/settings`, { headers: authedHeaders() });
    if (!unlockerSettingsRes.ok) return;
    const unlockerSettingsData = await unlockerSettingsRes.json();
    setUnlockerApiKey(unlockerSettingsData.api_key || "");
    setUnlockerApiUrl(unlockerSettingsData.api_url || "");
    setUnlockerUsername(unlockerSettingsData.username || "");
  }, [authedHeaders]);

  const fetchData = useCallback(async (isSilent = false, tabOverride = null) => {
    if (!isSilent) setLoading(true);
    setErrorMsg("");
    try {
      const tab = tabOverride || currentDashboardTab;
      const requests = [];

      // Site identity is shared by the sidebar. Fetch it once, in parallel with
      // the active page data, and refresh it only on settings-driven pages.
      if (!isSilent && (
        !settingsLoadedRef.current ||
        tab === "settings" ||
        tab === "featured-sections"
      )) {
        requests.push(loadSettings());
      }

      if (tab === "orders") {
        requests.push(loadOrders(), loadWalletTransactions());
      } else if (tab === "categories" || tab === "menu-drawer" || tab === "featured-sections") {
        requests.push(loadCategories());
        if (tab === "menu-drawer" || tab === "featured-sections") requests.push(loadServices());
      } else if (tab === "services") {
        requests.push(loadCategories(), loadServices(), loadApiProviders());
      } else if (tab === "amrr_unlocker") {
        requests.push(loadCategories(), loadUnlockerSettings());
      } else if (tab === "banners") {
        requests.push(loadBanners());
      } else if (tab === "wallets") {
        requests.push(loadWallets());
      } else if (tab === "customers" || tab === "api_resellers") {
        requests.push(loadCustomers());
      }

      // API providers, memberships, Gmail, reviews, and backups own their data
      // loading. Avoid issuing a second copy of the same requests here.
      await Promise.all(requests);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setErrorMsg("Failed to load admin data from the server.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [
    currentDashboardTab,
    loadApiProviders,
    loadBanners,
    loadCategories,
    loadCustomers,
    loadOrders,
    loadServices,
    loadSettings,
    loadUnlockerSettings,
    loadWalletTransactions,
    loadWallets,
  ]);
  // Load dashboard data when token is available
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData, token]);

  // Auto-refresh only live queues; heavy management tabs should not refetch in a loop.
  useEffect(() => {
    if (!token) return;
    if (!["orders", "wallets"].includes(currentDashboardTab)) return;
    const interval = setInterval(() => {
      void fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDashboardTab, fetchData, token]);

  useEffect(() => {
    if (!token || !selectedCustomerId || currentDashboardTab !== "customers") return;

    const loadCustomerTransactions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customer/admin/${selectedCustomerId}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        setSelectedCustomerTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error loading customer transactions:", err);
      }
    };

    loadCustomerTransactions();
  }, [token, selectedCustomerId, currentDashboardTab]);


  const saveUnlockerSettings = async (e) => {
    e.preventDefault();
    setUnlockerSettingsMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          api_key: unlockerApiKey,
          api_url: unlockerApiUrl,
          username: unlockerUsername
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل تحديث الإعدادات.");
      setUnlockerSettingsMsg("✅ تم حفظ إعدادات البوابة بنجاح!");
      setTimeout(() => setUnlockerSettingsMsg(""), 3000);
    } catch (err) {
      setUnlockerSettingsMsg(`❌ خطأ: ${err.message}`);
    }
  };

  const fetchUnlockerServices = async () => {
    setUnlockerLoading(true);
    setUnlockerSyncMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/fetch-services`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل جلب الخدمات.");
      setUnlockerServices(data.services || []);
      setUnlockerSyncMsg(`✅ تم جلب عدد ${data.services.length} خدمة بنجاح من المزود.`);
      setSelectedUnlockerServices([]);
      setUnlockerPage(1);
      setUnlockerCategoryFilter("ALL");
    } catch (err) {
      setUnlockerSyncMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setUnlockerLoading(false);
    }
  };

  const importSelectedUnlockerServices = async () => {
    if (selectedUnlockerServices.length === 0) {
      alert("يرجى تحديد خدمة واحدة على الأقل للاستيراد.");
      return;
    }

    setUnlockerLoading(true);
    setUnlockerSyncMsg("");

    try {
      let allServicesToImport = unlockerServices
        .filter(s => selectedUnlockerServices.includes(s.id))
        .map(s => ({
          ...s,
          custom_price: unlockerCustomPrices[s.id] !== undefined && unlockerCustomPrices[s.id] !== "" ? parseFloat(unlockerCustomPrices[s.id]) : null,
          custom_discount: unlockerCustomDiscounts[s.id] !== undefined && unlockerCustomDiscounts[s.id] !== "" ? parseFloat(unlockerCustomDiscounts[s.id]) : null
        }));

      if (unlockerSortOrder === "alphabetical") {
        allServicesToImport.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'en'));
      }

      const CHUNK_SIZE = 25;
      const totalServices = allServicesToImport.length;
      let importedCount = 0;

      for (let i = 0; i < totalServices; i += CHUNK_SIZE) {
        const chunk = allServicesToImport.slice(i, i + CHUNK_SIZE);
        const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
        const totalChunks = Math.ceil(totalServices / CHUNK_SIZE);

        setUnlockerSyncMsg(`⏳ جاري استيراد الدفعة ${chunkNum} من ${totalChunks} (${importedCount}/${totalServices} خدمة)...`);

        const response = await fetch(`${API_BASE_URL}/api/unlocker/import-services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            services: chunk,
            exchange_rate: parseFloat(unlockerExchangeRate) || 50,
            markup_percent: parseFloat(unlockerMarkupPercent) || 0,
            local_category_id: unlockerImportTargetCat,
            custom_category_name: unlockerNewCatName,
            group_as_packages: unlockerGroupAsPackages
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `فشل استيراد الدفعة ${chunkNum}.`);

        importedCount += chunk.length;
      }

      setUnlockerSyncMsg(`✅ تم استيراد عدد ${totalServices} خدمة بنجاح على دفعات متتالية دون أي مشاكل!`);
      setSelectedUnlockerServices([]);
      void fetchData();
    } catch (err) {
      setUnlockerSyncMsg(`❌ فشل الاستيراد: ${err.message}`);
    } finally {
      setUnlockerLoading(false);
    }
  };

  const handleWipeAndSyncAll = async () => {
    if (!confirm("⚠️ تحذير هام جداً:\n\nسيتم مسح كافة الأقسام والخدمات الحالية في موقعك بالكامل من قاعدة البيانات!\nثم سيتم استيراد كافة الأقسام والخدمات من سيرفر Amrr Unlocker بشكل نظيف وجديد.\n\nهل أنت متأكد تماماً من الاستمرار؟")) return;

    setUnlockerLoading(true);
    setUnlockerSyncMsg("⏳ جاري مسح قاعدة البيانات القديمة والاتصال بسيرفر المزود لجلب البيانات الجديدة...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/wipe-and-sync-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          exchange_rate: parseFloat(unlockerExchangeRate) || 50,
          markup_percent: parseFloat(unlockerMarkupPercent) || 0,
          group_as_packages: unlockerGroupAsPackages
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل مسح واستيراد البيانات من السيرفر.");

      setUnlockerSyncMsg(`✅ ${data.message}`);
      void fetchData();
    } catch (err) {
      setUnlockerSyncMsg(`❌ فشل العملية الشاملة: ${err.message}`);
    } finally {
      setUnlockerLoading(false);
    }
  };


  const triggerUnlockerOrderApproval = useCallback(async (orderId) => {
    if (!confirm("هل أنت متأكد من تفعيل هذا الطلب وإرساله لمزود الـ API المرتبط؟")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/place-order/${orderId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إرسال الطلب لـ API.");

      alert(data.message);
      void fetchData();
    } catch (err) {
      alert(`خطأ: ${err.message}`);
    }
  }, [fetchData, token]);

  const isUnlockerOrder = useCallback((order) => {
    if (!order) return false;
    if (order.api_provider_id || order.api_source) return true;
    const relatedService = services.find((service) => Number(service.id) === Number(order.service_id));
    return Boolean(relatedService?.api_provider_id || relatedService?.api_source);
  }, [services]);

  const checkUnlockerOrderStatus = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/check-status/${orderId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل تحديث حالة الطلب.");

      alert(data.message);
      void fetchData();
    } catch (err) {
      alert(`خطأ: ${err.message}`);
    }
  };

  const cancelUnlockerOrder = useCallback(async (orderId) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟ سيتم إلغاؤه من المزود واسترداد الرصيد للعميل.")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/unlocker/cancel-order/${orderId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إلغاء الطلب.");

      alert(data.message);
      void fetchData();
    } catch (err) {
      alert(`خطأ: ${err.message}`);
    }
  }, [fetchData, token]);

  const handleManualRefund = useCallback(async (orderId) => {
    if (!confirm("هل أنت متأكد من إرجاع رصيد هذا الطلب يدوياً إلى محفظة العميل؟ سيؤدي ذلك أيضاً إلى إلغاء الطلب.")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل إرجاع الرصيد.");

      alert(data.message);
      void fetchData();
    } catch (err) {
      alert(`خطأ: ${err.message}`);
    }
  }, [fetchData, token]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  // Orders Actions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error();

      // Update locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("فشل تحديث حالة الطلب.");
    }
  };

  const updateOrderCodeAndStatus = async (orderId, newStatus, newCode, newDownloadLink, newDownloadLinkTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus || undefined,
          code: newCode,
          download_link: newDownloadLink,
          download_link_title: newDownloadLinkTitle
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update locally
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: newStatus || o.status,
        code: newCode,
        download_link: newDownloadLink,
        download_link_title: newDownloadLinkTitle
      } : o));
    } catch (err) {
      alert(err.message || "فشل تحديث الطلب.");
    }
  };

  const handleOpenCodeModal = useCallback((order, statusToUpdate = null) => {
    setCodeModalOrder(order);
    setCodeValue(order.code || "");
    const service = services.find(s => s.id === order.service_id);
    const defaultLink = service ? (service.download_link || "") : "";
    const defaultLinkTitle = service ? (service.download_link_title || "تحميل الأداة") : "تحميل الأداة";

    setOrderDownloadLinkValue(order.download_link || defaultLink);
    setOrderDownloadLinkTitleValue(order.download_link_title || defaultLinkTitle);
    setCodeModalStatusToUpdate(statusToUpdate);
    setShowCodeModal(true);
  }, [services]);

  const handleApproveOrder = useCallback(async (order) => {
    if (!order) return;

    if (isUnlockerOrder(order)) {
      await triggerUnlockerOrderApproval(order.id);
      return;
    }

    handleOpenCodeModal(order, "completed");
  }, [handleOpenCodeModal, isUnlockerOrder, triggerUnlockerOrderApproval]);

  const handleSubmitCodeModal = async (e) => {
    e.preventDefault();
    if (!codeModalOrder) return;

    await updateOrderCodeAndStatus(codeModalOrder.id, codeModalStatusToUpdate, codeValue, orderDownloadLinkValue, orderDownloadLinkTitleValue);
    setShowCodeModal(false);
    setCodeModalOrder(null);
    setCodeValue("");
    setOrderDownloadLinkValue("");
    setOrderDownloadLinkTitleValue("");
    setCodeModalStatusToUpdate(null);
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    await secureDeleteFetch(`${API_BASE_URL}/api/orders/${orderId}`, () => {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setWalletTransactions(prev => prev.filter(tx => !((tx.reference_type === "order" || tx.reference_type === "order_refund") && tx.reference_id === orderId)));
    });
  };

  const handleOpenEditCustomer = (customer) => {
    setEditCustomerId(customer.id);
    setEditCustomerUsername(customer.username || "");
    setEditCustomerEmail(customer.email || "");
    setEditCustomerPhone(customer.phone || "");
    setEditCustomerBalance(Number(customer.balance || 0).toFixed(2));
    setEditCustomerBalances(customer.balances ? (typeof customer.balances === 'string' ? JSON.parse(customer.balances) : customer.balances) : {});
    setEditCustomerNewPassword("");
    setShowEditCustomerModal(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/admin/${editCustomerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editCustomerUsername,
          email: editCustomerEmail,
          phone: editCustomerPhone,
          balance: editCustomerBalance,
          balances: editCustomerBalances,
          new_password: editCustomerNewPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل تحديث بيانات العميل.");

      setCustomers(prev => prev.map((customer) =>
        customer.id === editCustomerId
          ? { ...customer, username: data.customer.username, email: data.customer.email, phone: data.customer.phone, balance: data.customer.balance, balances: data.customer.balances, password_masked: data.customer.password_masked }
          : customer
      ));

      if (selectedCustomerId === editCustomerId) {
        setSelectedCustomerTransactions([]);
        setSelectedCustomerId(editCustomerId);
      }

      setShowEditCustomerModal(false);
      setEditCustomerNewPassword("");
    } catch (err) {
      alert(err.message || "فشل تحديث بيانات العميل.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا العميل نهائياً؟ سيتم حذف كافة حركات حسابه ورصيده ولا يمكن التراجع عن هذا الإجراء!")) {
      return;
    }

    await secureDeleteFetch(`${API_BASE_URL}/api/customer/admin/${customerId}`, () => {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomerId === customerId) {
        setSelectedCustomerId(null);
        setSelectedCustomerTransactions([]);
      }
      alert("تم حذف العميل والبيانات المرتبطة به بنجاح.");
    });
  };

  const updateWalletRequestStatus = async (requestId, newStatus, adminNote = "") => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, admin_note: adminNote })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "فشل تحديث طلب الشحن.");

      setWalletRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus, admin_note: adminNote, processed_at: new Date().toISOString() } : r));
    } catch (err) {
      alert(err.message || "فشل تحديث طلب الشحن.");
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newCatName.trim()) {
      setErrorMsg("اسم القسم مطلوب.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName, image: catUploadedFile || newCatImage, fields: newCatFields, fields_title: newCatFieldsTitle, parent_id: newCatParentId || null, linked_categories: newCatLinkedCategories, is_featured: newCatIsFeatured, cover_image: newCatCoverImage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إضافة القسم.");
      }

      setCategories(prev => [...prev, data]);
      setNewCatName("");
      setNewCatImage("games");
      setCatUploadedFile(null);
      setNewCatFields(defaultFields);
      setNewCatFieldsTitle("بيانات الخدمة");
      setNewCatParentId("");
      setNewCatLinkedCategories([]);
      setNewCatIsFeatured(false);
      setNewCatCoverImage(null);
      setShowCatModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الخدمات التابعة له تلقائياً!")) return;

    await secureDeleteFetch(`${API_BASE_URL}/api/categories/${id}`, () => {
      fetchData(true);
    });
  };

  // Clear All Categories (Delete all permanently from server)
  const handleClearAllCategories = async () => {
    const confirmation = prompt("يرجى كتابة 'حذف كل الأقسام' لتأكيد حذف جميع الأقسام والخدمات نهائياً من السيرفر:");
    if (confirmation !== "حذف كل الأقسام") {
      if (confirmation !== null) alert("لم يتم تأكيد الحذف. يرجى كتابة العبارة المطلوبة بدقة.");
      return;
    }

    await secureDeleteFetch(`${API_BASE_URL}/api/categories/all/clear`, () => {
      alert("تم حذف جميع الأقسام والخدمات التابعة لها بنجاح من السيرفر! 📁🗑️");
      setCategories([]);
      setServices([]);
    });
  };

  const handleOpenMergeCategories = (sourceIds, onSuccess) => {
    setMergeSourceIds(sourceIds);
    setOnMergeSuccessCallback(() => onSuccess);
    setMergeTargetId("");
    setShowMergeCategoriesModal(true);
  };

  const handleConfirmMergeCategories = async () => {
    if (!mergeTargetId) {
      alert("يرجى اختيار القسم الذي تريد الدمج بداخله.");
      return;
    }

    const finalSourceIds = mergeSourceIds.filter(id => String(id) !== String(mergeTargetId));
    if (finalSourceIds.length === 0) {
      alert("يجب تحديد أقسام أخرى لدمجها داخل القسم الرئيسي المختار.");
      return;
    }

    setShowMergeCategoriesModal(false);
    
    await secureActionFetch(
      `${API_BASE_URL}/api/categories/merge`,
      "POST",
      { sourceIds: finalSourceIds, targetId: mergeTargetId },
      () => {
        alert("تم دمج الأقسام ونقل الخدمات بنجاح!");
        fetchData(true);
        if (onMergeSuccessCallback) onMergeSuccessCallback();
      },
      "يرجى إدخال كود التحقق (OTP) لإتمام عملية الدمج.",
      "فشل عملية الدمج."
    );
  };

  // Clear All Services (Delete all permanently from server)
  const handleClearAllServices = async () => {
    const confirmation = prompt("يرجى كتابة 'حذف كل الخدمات' لتأكيد حذف جميع الخدمات نهائياً من السيرفر:");
    if (confirmation !== "حذف كل الخدمات") {
      if (confirmation !== null) alert("لم يتم تأكيد الحذف. يرجى كتابة العبارة المطلوبة بدقة.");
      return;
    }

    await secureDeleteFetch(`${API_BASE_URL}/api/services/all/clear`, () => {
      alert("تم حذف جميع الخدمات بنجاح من السيرفر! ⚡🗑️");
      setServices([]);
    });
  };

  // Package list helpers
  const handleAddPkgInput = () => {
    setNewServicePackages(prev => [...prev, { name: "", price: 0 }]);
  };

  const handleRemovePkgInput = (index) => {
    setNewServicePackages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePkgChange = (index, field, value) => {
    setNewServicePackages(prev => prev.map((pkg, i) => {
      if (i === index) {
        return {
          ...pkg,
          [field]: field === "price" ? parseFloat(value) || 0 : value
        };
      }
      return pkg;
    }));
  };

  // Custom fields helpers
  const handleAddField = () => {
    setNewServiceFields(prev => [...prev, { id: `field_${Date.now()}`, label: "", placeholder: "", type: "text", required: true }]);
  };

  const handleRemoveField = (index) => {
    setNewServiceFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    setNewServiceFields(prev => prev.map((f, i) => {
      if (i === index) {
        return {
          ...f,
          [field]: value
        };
      }
      return f;
    }));
  };

  // Add Service
  const handleAddService = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newServiceName.trim()) {
      setErrorMsg("اسم الخدمة مطلوب.");
      return;
    }

    let validPackages = [];
    let minPrice = 0;

    if (newServicePriceType === "fixed") {
      validPackages = newServicePackages
        .filter(p => p.name.trim())
        .map((p, idx) => ({ ...p, id: idx + 1 }));

      if (validPackages.length === 0) {
        setErrorMsg("يجب إضافة باقة واحدة على الأقل للخدمة.");
        return;
      }
      minPrice = Math.min(...validPackages.map(p => p.price));
    } else if (newServicePriceType === "dynamic") {
      minPrice = parseFloat(newServicePricePerThousand) || 0;
      validPackages = [{ id: 1, name: "شحن بالكمية", price: minPrice }];
    } else {
      validPackages = newServicePackages
        .filter(p => p.name.trim())
        .map((p, idx) => ({ ...p, id: idx + 1 }));

      if (validPackages.length === 0) {
        setErrorMsg("يجب إضافة باقة واحدة على الأقل للخدمة.");
        return;
      }
      minPrice = parseFloat(newServicePricePerThousand) || 0;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: parseInt(newServiceCatId),
          name: newServiceName,
          description: newServiceDesc,
          price: minPrice,
          image: serviceUploadedFile || newServiceImage,
          packages: validPackages,
          fields: newServiceFields,
          price_type: newServicePriceType,
          price_per_thousand: parseFloat(newServicePricePerThousand) || 0.0,
          fields_title: newServiceFieldsTitle,
          download_link: newServiceDownloadLink,
          download_link_title: newServiceDownloadLinkTitle,
          is_popular: newServiceIsPopular,
          show_in_menu: newServiceShowInMenu,
          api_provider_id: newServiceApiProviderId || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إضافة الخدمة.");
      }

      setServices(prev => [...prev, data]);

      // Reset form
      setNewServiceName("");
      setNewServiceDesc("");
      setNewServicePrice(0);
      setNewServiceImage("pubg");
      setServiceUploadedFile(null);
      setNewServicePackages([{ name: "", price: 0 }]);
      setNewServiceFields(defaultFields);
      setNewServiceFieldsTitle("");
      setNewServicePriceType("fixed");
      setNewServicePricePerThousand(0);
      setNewServiceIsPopular(false);
      setNewServiceShowInMenu(true);
      setNewServiceDownloadLink("");
      setNewServiceDownloadLinkTitle("تحميل الأداة");
      setNewServiceApiProviderId("");
      setShowServiceModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete Service
  const handleDeleteService = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    await secureDeleteFetch(`${API_BASE_URL}/api/services/${id}`, () => {
      setServices(prev => prev.filter(s => s.id !== id));
    });
  };

  const handleToggleCategoryMenuVisibility = async (id, currentVal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}/menu-visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ show_in_menu: !currentVal })
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, show_in_menu: !currentVal } : c));
      } else {
        alert(data.message || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال");
    }
  };

  const handleHideAllCategoriesFromMenu = async () => {
    if (!confirm("هل أنت متأكد أنك تريد إخفاء جميع الأقسام من القائمة الجانبية؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/hide-all-menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => prev.map(c => ({ ...c, show_in_menu: false })));
        alert(data.message || "تم إخفاء جميع الأقسام بنجاح");
      } else {
        alert(data.message || "حدث خطأ");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال");
    }
  };

  // Open Edit Category Modal
  const handleOpenEditCat = (cat) => {
    setErrorMsg("");
    setEditCatId(cat.id);
    setEditCatName(cat.name);
    const isCustom = cat.image && (cat.image.startsWith("data:image") || cat.image.startsWith("http") || cat.image.startsWith("/uploads"));
    if (isCustom) {
      setEditCatUploadedFile(cat.image);
      setEditCatImage("games");
    } else {
      setEditCatUploadedFile(null);
      setEditCatImage(cat.image || "games");
    }

    // Parse and set edit fields
    let parsedFields = [];
    try {
      parsedFields = typeof cat.fields === 'string'
        ? JSON.parse(cat.fields)
        : cat.fields;
    } catch (e) {
      parsedFields = cat.fields || [];
    }
    setEditCatFields(parsedFields && parsedFields.length > 0 ? parsedFields : defaultFields);
    setEditCatFieldsTitle(cat.fields_title || "بيانات الخدمة");
    setEditCatParentId(cat.parent_id || "");
    let parsedLinked = [];
    try {
      parsedLinked = typeof cat.linked_categories === 'string' ? JSON.parse(cat.linked_categories) : (cat.linked_categories || []);
    } catch (e) { parsedLinked = []; }
    setEditCatLinkedCategories(Array.isArray(parsedLinked) ? parsedLinked.map(String) : []);
    setEditCatIsFeatured(!!cat.is_featured);
    setEditCatCoverImage(null); // Wait for user to upload a new one, or leave null to keep existing if unchanged

    setShowEditCatModal(true);
  };

  // Edit Category handler
  const handleEditCategory = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!editCatName.trim()) {
      setErrorMsg("اسم القسم مطلوب.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${editCatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editCatName,
          image: editCatUploadedFile || editCatImage,
          fields: editCatFields,
          fields_title: editCatFieldsTitle,
          apply_to_services: applyToServices,
          parent_id: editCatParentId || null,
          linked_categories: editCatLinkedCategories,
          is_featured: editCatIsFeatured,
          cover_image: editCatCoverImage !== null ? editCatCoverImage : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تعديل القسم.");
      }

      setCategories(prev => prev.map(c => c.id === editCatId ? { ...c, name: editCatName, image: data.image, fields: data.fields, fields_title: data.fields_title, parent_id: data.parent_id, is_featured: data.is_featured, cover_image: data.cover_image !== undefined ? data.cover_image : c.cover_image } : c));

      if (applyToServices) {
        setServices(prev => prev.map(s => Number(s.category_id) === Number(editCatId) ? {
          ...s,
          fields: editCatFields,
          fields_title: editCatFieldsTitle
        } : s));
      }
      setApplyToServices(false);
      setEditCatParentId("");
      setShowEditCatModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Open Edit Service Modal
  const handleOpenEditService = (service) => {
    setErrorMsg("");
    setEditServiceId(service.id);
    setEditServiceName(service.name);
    setEditServiceDesc(service.description || "");
    setEditServiceCatId(service.category_id.toString());

    const isCustom = service.image && (service.image.startsWith("data:image") || service.image.startsWith("http") || service.image.startsWith("/uploads"));
    if (isCustom) {
      setEditServiceUploadedFile(service.image);
      setEditServiceImage("pubg");
    } else {
      setEditServiceUploadedFile(null);
      setEditServiceImage(service.image || "pubg");
    }

    let parsedPackages = [];
    try {
      parsedPackages = typeof service.packages === 'string'
        ? JSON.parse(service.packages)
        : service.packages;
    } catch (e) {
      parsedPackages = service.packages || [];
    }
    setEditServicePackages(parsedPackages.length > 0 ? parsedPackages : [{ name: "", price: 0 }]);

    let parsedFields = [];
    try {
      parsedFields = typeof service.fields === 'string'
        ? JSON.parse(service.fields)
        : service.fields;
    } catch (e) {
      parsedFields = service.fields || [];
    }
    setEditServiceFields(parsedFields.length > 0 ? parsedFields : defaultFields);
    setEditServicePriceType(service.price_type || "fixed");
    setEditServicePricePerThousand(service.price_per_thousand || 0);
    setEditServiceFieldsTitle(service.fields_title || "بيانات الخدمة");
    setEditServiceApiProviderId(service.api_provider_id || "");
    setEditServiceDownloadLink(service.download_link || "");
    setEditServiceDownloadLinkTitle(service.download_link_title || "تحميل الأداة");
    setEditServiceIsPopular(service.is_popular ? true : false);
    setEditServiceShowInMenu(service.show_in_menu === false ? false : true);
    setEditServiceIsFeatured(!!service.is_featured);

    setShowEditServiceModal(true);
  };

  // Edit Service Packages helpers
  const handleAddEditPkgInput = () => {
    setEditServicePackages(prev => [...prev, { name: "", price: 0 }]);
  };

  const handleRemoveEditPkgInput = (index) => {
    setEditServicePackages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditPkgChange = (index, field, value) => {
    setEditServicePackages(prev => prev.map((pkg, i) => {
      if (i === index) {
        return {
          ...pkg,
          [field]: field === "price" ? parseFloat(value) || 0 : value
        };
      }
      return pkg;
    }));
  };

  // Edit Service Fields helpers
  const handleAddEditField = () => {
    setEditServiceFields(prev => [...prev, { id: `field_${Date.now()}`, label: "", placeholder: "", type: "text", required: true }]);
  };

  const handleRemoveEditField = (index) => {
    setEditServiceFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditFieldChange = (index, field, value) => {
    setEditServiceFields(prev => prev.map((f, i) => {
      if (i === index) {
        return {
          ...f,
          [field]: value
        };
      }
      return f;
    }));
  };

  // Category Fields helpers
  const handleAddCatField = () => {
    setNewCatFields(prev => [...prev, { id: `field_${Date.now()}`, label: "", placeholder: "", type: "text", required: true }]);
  };

  const handleRemoveCatField = (index) => {
    setNewCatFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCatFieldChange = (index, field, value) => {
    setNewCatFields(prev => setNewCatFields(prev.map((f, i) => {
      if (i === index) {
        return { ...f, [field]: value };
      }
      return f;
    })));
  };

  const handleAddEditCatField = () => {
    setEditCatFields(prev => [...prev, { id: `field_${Date.now()}`, label: "", placeholder: "", type: "text", required: true }]);
  };

  const handleRemoveEditCatField = (index) => {
    setEditCatFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCatFieldChange = (index, field, value) => {
    setEditCatFields(prev => prev.map((f, i) => {
      if (i === index) {
        return { ...f, [field]: value };
      }
      return f;
    }));
  };

  // Edit Service handler
  const handleEditService = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!editServiceName.trim()) {
      setErrorMsg("اسم الخدمة مطلوب.");
      return;
    }

    let validPackages = [];
    let minPrice = 0;

    if (editServicePriceType === "fixed") {
      validPackages = editServicePackages
        .filter(p => p.name.trim())
        .map((p, idx) => ({ ...p, id: idx + 1 }));

      if (validPackages.length === 0) {
        setErrorMsg("يجب إضافة باقة واحدة على الأقل للخدمة.");
        return;
      }
      minPrice = Math.min(...validPackages.map(p => p.price));
    } else if (editServicePriceType === "dynamic") {
      minPrice = parseFloat(editServicePricePerThousand) || 0;
      validPackages = [{ id: 1, name: "شحن بالكمية", price: minPrice }];
    } else {
      validPackages = editServicePackages
        .filter(p => p.name.trim())
        .map((p, idx) => ({ ...p, id: idx + 1 }));

      if (validPackages.length === 0) {
        setErrorMsg("يجب إضافة باقة واحدة على الأقل للخدمة.");
        return;
      }
      minPrice = parseFloat(editServicePricePerThousand) || 0;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/services/${editServiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: parseInt(editServiceCatId),
          name: editServiceName,
          description: editServiceDesc,
          price: minPrice,
          image: editServiceUploadedFile || editServiceImage,
          packages: validPackages,
          fields: editServiceFields,
          price_type: editServicePriceType,
          price_per_thousand: parseFloat(editServicePricePerThousand) || 0.0,
          fields_title: editServiceFieldsTitle,
          download_link: editServiceDownloadLink,
          download_link_title: editServiceDownloadLinkTitle,
          is_popular: editServiceIsPopular,
          show_in_menu: editServiceShowInMenu,
          api_provider_id: editServiceApiProviderId || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تعديل الخدمة.");
      }

      setServices(prev => prev.map(s => s.id === editServiceId ? {
        ...s,
        category_id: parseInt(editServiceCatId),
        name: editServiceName,
        description: editServiceDesc,
        price: minPrice,
        image: data.image,
        packages: validPackages,
        fields: data.fields,
        fields_title: data.fields_title,
        price_type: editServicePriceType,
        price_per_thousand: parseFloat(editServicePricePerThousand) || 0.0,
        download_link: data.download_link,
        download_link_title: data.download_link_title,
        is_popular: editServiceIsPopular,
        show_in_menu: editServiceShowInMenu,
        api_provider_id: editServiceApiProviderId || null
      } : s));

      setShowEditServiceModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Add Banner handler
  const handleAddBanner = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newBannerTitle.trim()) {
      setErrorMsg("العنوان مطلوب.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newBannerTitle,
          highlight: newBannerHighlight,
          desc: newBannerDesc,
          badge: newBannerBadge,
          color: newBannerColor,
          icon: bannerUploadedFile || newBannerIcon,
          link: newBannerLink
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إضافة شريحة البانر.");
      }

      setBanners(prev => [...prev, data]);
      setNewBannerTitle("");
      setNewBannerHighlight("");
      setNewBannerDesc("");
      setNewBannerBadge("");
      setNewBannerColor("#8b5cf6");
      setNewBannerIcon("⚡");
      setNewBannerLink("");
      setBannerUploadedFile(null);
      setShowBannerModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Open Edit Banner
  const handleOpenEditBanner = (banner) => {
    setErrorMsg("");
    setEditBannerId(banner.id);
    setEditBannerTitle(banner.title);
    setEditBannerHighlight(banner.highlight || "");
    setEditBannerDesc(banner.desc || "");
    setEditBannerBadge(banner.badge || "");
    setEditBannerColor(banner.color || "#8b5cf6");
    setEditBannerLink(banner.link || "");

    const isCustom = banner.icon && (banner.icon.startsWith("data:image") || banner.icon.startsWith("http") || banner.icon.startsWith("/uploads"));
    if (isCustom) {
      setEditBannerUploadedFile(banner.icon);
      setEditBannerIcon("⚡");
    } else {
      setEditBannerUploadedFile(null);
      setEditBannerIcon(banner.icon || "⚡");
    }
    setShowEditBannerModal(true);
  };

  // Edit Banner handler
  const handleEditBanner = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!editBannerTitle.trim()) {
      setErrorMsg("العنوان مطلوب للتحديث.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/banners/${editBannerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editBannerTitle,
          highlight: editBannerHighlight,
          desc: editBannerDesc,
          badge: editBannerBadge,
          color: editBannerColor,
          icon: editBannerUploadedFile || editBannerIcon,
          link: editBannerLink
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تعديل شريحة البانر.");
      }

      setBanners(prev => prev.map(b => b.id === editBannerId ? data : b));
      setEditBannerLink("");
      setEditBannerUploadedFile(null);
      setShowEditBannerModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete Banner handler
  const handleDeleteBanner = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشريحة من البانر؟")) return;

    await secureDeleteFetch(`${API_BASE_URL}/api/banners/${id}`, () => {
      setBanners(prev => prev.filter(b => b.id !== id));
    });
  };

  // ── WhatsApp status polling ───────────────────────────────────────────────
  const fetchWaStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/status`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setWaStatus(d.status || "disconnected");
        setWaQR(d.qr || null);
      }
    } catch { }
  };

  useEffect(() => {
    if (activeTab !== "whatsapp") {
      if (waPollingRef.current) {
        clearInterval(waPollingRef.current);
        waPollingRef.current = null;
      }
      return;
    }
    // Start polling every 3 seconds when on WhatsApp tab
    const bootstrapTimer = setTimeout(() => {
      void fetchWaStatus();
    }, 0);
    const interval = setInterval(fetchWaStatus, 3000);
    waPollingRef.current = interval;
    return () => {
      clearTimeout(bootstrapTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          site_name: siteName,
          site_logo: logoUploadedFile || siteLogo,
          site_favicon: faviconUploadedFile || siteFavicon,
          payment_methods: paymentMethodsList,
          supported_currencies: globalCurrencies,
          exchange_rates: exchangeRates,
          base_currency: baseCurrency,
          hide_wallet_payment: hideWalletPayment,
          whatsapp_numbers: whatsappNumbers,
          email_user: emailUser,
          email_pass: emailPass,
          global_markup_percent: globalMarkupPercent,
          announcement_text: announcementText
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث الإعدادات.");
      }

      alert("تم تحديث إعدادات الموقع بنجاح!");
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleAutoSubmit = async (newValue) => {
    setApiAutoSubmit(newValue);
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ api_auto_submit: newValue })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "فشل تحديث وضع التقديم التلقائي.");
      }
    } catch (err) {
      alert(err.message);
      setApiAutoSubmit(!newValue);
    }
  };

  const handleSaveGlobalMarkup = async (e) => {
    if (e) e.preventDefault();
    setSavingMarkup(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          global_markup_percent: parseFloat(globalMarkupPercent) || 0
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث هامش الربح.");
      }

      alert("تم تحديث هامش الربح العام بنجاح!");
      void fetchData();
    } catch (err) {
      alert("خطأ: " + err.message);
    } finally {
      setSavingMarkup(false);
    }
  };

  const handleUpdateExcelSettings = async (e) => {
    if (e) e.preventDefault();
    setExcelSettingsErrorMsg("");
    setExcelSettingsSuccessMsg("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/excel/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          apple_usd_rate: excelAppleUsdRate,
          apple_markup: excelAppleMarkup,
          frp_usd_rate: excelFrpUsdRate,
          frp_markup: excelFrpMarkup
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث أسعار الصرف والأرباح.");
      }

      setExcelSettingsSuccessMsg("تم حفظ الإعدادات وإعادة حساب الأسعار في قاعدة البيانات بنجاح!");
      void fetchData(); // reload categories and services
    } catch (err) {
      setExcelSettingsErrorMsg(err.message);
    }
  };

  const handleUploadExcelFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'apple') {
      setExcelAppleUploadMsg("جاري الرفع والمعالجة...");
    } else {
      setExcelFrpUploadMsg("جاري الرفع والمعالجة...");
    }
    setExcelUploadLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/excel/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            file_name: file.name,
            file_data: reader.result,
            type: type
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "فشل استيراد الملف.");
        }

        if (type === 'apple') {
          setExcelAppleUploadMsg(`✅ ${data.message}`);
        } else {
          setExcelFrpUploadMsg(`✅ ${data.message}`);
        }
        void fetchData(); // Reload services
      } catch (err) {
        if (type === 'apple') {
          setExcelAppleUploadMsg(`❌ خطأ: ${err.message}`);
        } else {
          setExcelFrpUploadMsg(`❌ خطأ: ${err.message}`);
        }
      } finally {
        setExcelUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredentialsErrorMsg("");
    setCredentialsSuccessMsg("");

    if (!newAdminUsername && !newAdminPassword) {
      setCredentialsErrorMsg("يرجى إدخال اسم المستخدم أو كلمة المرور الجديدة.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-credentials`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          new_username: newAdminUsername,
          new_password: newAdminPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "فشل تحديث البيانات.");
      }

      setCredentialsSuccessMsg("تم تحديث بيانات المسؤول بنجاح!");

      // Update local storage username if it changed
      if (adminUser) {
        const updatedUser = { ...adminUser, username: newAdminUsername };
        localStorage.setItem("admin_user", JSON.stringify(updatedUser));
        setAdminUser(updatedUser);
      }
      setNewAdminPassword("");
    } catch (err) {
      setCredentialsErrorMsg(err.message);
    }
  };

  const dashboardContextValue = {
    errorMsg,
    apiProviders,
    setApiProviders,
    catModal: {
      showCatModal,
      setShowCatModal,
      handleAddCategory,
      newCatName,
      setNewCatName,
      newCatImage,
      setNewCatImage,
      catUploadedFile,
      setCatUploadedFile,
      newCatFieldsTitle,
      setNewCatFieldsTitle,
      newCatFields,
      handleAddField,
      handleRemoveField,
      handleFieldChange,
      newCatParentId,
      setNewCatParentId,
      newCatLinkedCategories,
      setNewCatLinkedCategories,
      newCatIsFeatured,
      setNewCatIsFeatured,
      newCatCoverImage,
      setNewCatCoverImage,
      categories,
      API_BASE_URL
    },
    serviceModal: {
      showServiceModal,
      setShowServiceModal,
      handleAddService,
      newServiceName,
      setNewServiceName,
      newServiceDesc,
      setNewServiceDesc,
      newServiceCatId,
      setNewServiceCatId,
      newServicePrice,
      setNewServicePrice,
      newServiceImage,
      setNewServiceImage,
      serviceUploadedFile,
      setServiceUploadedFile,
      newServiceApiProviderId,
      setNewServiceApiProviderId,
      newServicePriceType,
      setNewServicePriceType,
      newServicePricePerThousand,
      setNewServicePricePerThousand,
      setNewServiceDownloadLinkTitle,
      newServiceIsPopular,
      setNewServiceIsPopular,
      newServiceShowInMenu,
      setNewServiceShowInMenu,
      newServiceIsFeatured,
      setNewServiceIsFeatured,
      apiProviders,
      newServicePackages,
      handleAddPkgInput,
      handleRemovePkgInput,
      handlePkgChange,
      newServiceFieldsTitle,
      setNewServiceFieldsTitle,
      newServiceFields,
      handleAddField,
      handleRemoveField,
      handleFieldChange,
      newServiceDownloadLink,
      setNewServiceDownloadLink,
      newServiceDownloadLinkTitle,
      setNewServiceDownloadLinkTitle
    },
    editCatModal: {
      showEditCatModal,
      setShowEditCatModal,
      handleEditCategory,
      editCatName,
      setEditCatName,
      editCatImage,
      setEditCatImage,
      editCatUploadedFile,
      setEditCatUploadedFile,
      editCatFieldsTitle,
      setEditCatFieldsTitle,
      editCatFields,
      handleAddEditCatField,
      handleRemoveEditCatField,
      handleEditCatFieldChange,
      editCatParentId,
      setEditCatParentId,
      editCatLinkedCategories,
      setEditCatLinkedCategories,
      editCatIsFeatured,
      setEditCatIsFeatured,
      editCatCoverImage,
      setEditCatCoverImage,
      applyToServices,
      categories,
      setApplyToServices,
      editCatId
    },
    editServiceModal: {
      showEditServiceModal,
      setShowEditServiceModal,
      handleEditService,
      editServiceName,
      setEditServiceName,
      editServiceDesc,
      setEditServiceDesc,
      editServiceCatId,
      setEditServiceCatId,
      editServiceImage,
      setEditServiceImage,
      editServiceUploadedFile,
      setEditServiceUploadedFile,
      editServiceApiProviderId,
      setEditServiceApiProviderId,
      editServicePackages,
      handleAddEditPkgInput,
      handleRemoveEditPkgInput,
      handleEditPkgChange,
      editServiceFields,
      handleAddEditField,
      handleRemoveEditField,
      handleEditFieldChange,
      editServicePriceType,
      setEditServicePriceType,
      editServicePricePerThousand,
      setEditServicePricePerThousand,
      setEditServiceDownloadLinkTitle,
      editServiceIsPopular,
      setEditServiceIsPopular,
      editServiceShowInMenu,
      setEditServiceShowInMenu,
      editServiceIsFeatured,
      setEditServiceIsFeatured,
      apiProviders,
      editServiceFieldsTitle,
      setEditServiceFieldsTitle,
      editServiceDownloadLink,
      setEditServiceDownloadLink,
      editServiceDownloadLinkTitle,
      setEditServiceDownloadLinkTitle
    },
    bannerModal: {
      showBannerModal,
      setShowBannerModal,
      handleAddBanner,
      newBannerTitle,
      setNewBannerTitle,
      newBannerHighlight,
      setNewBannerHighlight,
      newBannerDesc,
      setNewBannerDesc,
      newBannerBadge,
      setNewBannerBadge,
      newBannerColor,
      setNewBannerColor,
      newBannerIcon,
      setNewBannerIcon,
      newBannerLink,
      setNewBannerLink,
      bannerUploadedFile,
      setBannerUploadedFile
    },
    editBannerModal: {
      showEditBannerModal,
      setShowEditBannerModal,
      handleEditBanner,
      editBannerTitle,
      setEditBannerTitle,
      editBannerHighlight,
      setEditBannerHighlight,
      editBannerDesc,
      setEditBannerDesc,
      editBannerBadge,
      setEditBannerBadge,
      editBannerColor,
      setEditBannerColor,
      editBannerIcon,
      setEditBannerIcon,
      editBannerLink,
      setEditBannerLink,
      editBannerUploadedFile,
      setEditBannerUploadedFile
    },
    customerModal: {
      showEditCustomerModal,
      setShowEditCustomerModal,
      handleUpdateCustomer,
      editCustomerUsername,
      setEditCustomerUsername,
      editCustomerEmail,
      setEditCustomerEmail,
      editCustomerPhone,
      setEditCustomerPhone,
      editCustomerBalance,
      setEditCustomerBalance,
      globalCurrencies,
      editCustomerBalances,
      setEditCustomerBalances,
      editCustomerNewPassword,
      setEditCustomerNewPassword
    },
    orderModal: {
      showOrderDetailsModal,
      setShowOrderDetailsModal,
      orderDetailsData,
      baseCurrency,
      API_BASE_URL,
      isUnlockerOrder,
      handleApproveOrder,
      handleOpenCodeModal,
      updateOrderStatus,
      cancelUnlockerOrder
    },
    codeModal: {
      codeModalOrder,
      showCodeModal,
      setShowCodeModal,
      codeModalStatusToUpdate,
      codeValue,
      setCodeValue,
      orderDownloadLinkValue,
      setOrderDownloadLinkValue,
      orderDownloadLinkTitleValue,
      setOrderDownloadLinkTitleValue,
      handleSubmitCodeModal,
      updateOrderCodeAndStatus
    },
    shared: {
      categories,
      baseCurrency,
      API_BASE_URL
    }
  };

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const query = (orderSearch || "").trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderFilter === "all" || order.status === orderFilter;
      if (!query) return matchesStatus;
      const matchesSearch =
        String(order.id).includes(query) ||
        (order.service_name || "").toLowerCase().includes(query) ||
        (order.player_id || "").toLowerCase().includes(query) ||
        (order.phone || "").includes(query) ||
        (order.payment_method || "").toLowerCase().includes(query) ||
        (order.sender_phone || "").includes(query) ||
        (order.transfer_to || "").includes(query);
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderFilter]);

  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const query = (catSearch || "").trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      (category.name || "").toLowerCase().includes(query)
    );
  }, [categories, catSearch]);

  const categoryNamesById = useMemo(() => new Map(
    (Array.isArray(categories) ? categories : []).map((category) => [
      String(category.id),
      (category.name || "").toLowerCase(),
    ])
  ), [categories]);

  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    const query = (serviceSearch || "").trim().toLowerCase();
    if (!query) return services;

    return services.filter((service) => {
      if (
        (service.name || "").toLowerCase().includes(query) ||
        (categoryNamesById.get(String(service.category_id)) || "").includes(query) ||
        String(service.id).includes(query)
      ) {
        return true;
      }

      let packages = service.packages || [];
      if (typeof packages === "string") {
        try {
          packages = JSON.parse(packages);
        } catch {
          packages = [];
        }
      }
      return Array.isArray(packages) && packages.some((item) =>
        (item.name || "").toLowerCase().includes(query)
      );
    });
  }, [services, serviceSearch, categoryNamesById]);

  const filteredWalletRequests = useMemo(() => {
    if (!Array.isArray(walletRequests)) return [];
    const search = (walletSearch || "").toLowerCase();
    return walletRequests.filter((request) => {
      const matchesSearch =
        String(request.id).includes(search) ||
        (request.customer_username || "").toLowerCase().includes(search) ||
        String(request.amount).includes(search) ||
        (request.sender_phone || "").toLowerCase().includes(search) ||
        (request.method || "").toLowerCase().includes(search) ||
        (request.notes || "").toLowerCase().includes(search);
      const matchesStatus = walletFilter === "all" || request.status === walletFilter;
      return matchesSearch && matchesStatus;
    });
  }, [walletRequests, walletSearch, walletFilter]);

  const filteredWalletTransactions = useMemo(() => {
    if (!Array.isArray(walletTransactions)) return [];
    const search = (walletSearch || "").toLowerCase();
    return walletTransactions.filter((transaction) => {
      const typeLabel = transaction.type === "credit" ? "إضافة" : "خصم";
      return (
        String(transaction.id).includes(search) ||
        (transaction.customer_username || "").toLowerCase().includes(search) ||
        String(transaction.amount || "").includes(search) ||
        String(transaction.reference_id || "").includes(search) ||
        (transaction.description || "").toLowerCase().includes(search) ||
        typeLabel.toLowerCase().includes(search)
      );
    });
  }, [walletTransactions, walletSearch]);

  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    const search = (customerSearch || "").toLowerCase();
    return customers.filter((customer) => (
      String(customer.id).includes(search) ||
      (customer.username || "").toLowerCase().includes(search) ||
      (customer.phone || "").toLowerCase().includes(search) ||
      String(customer.balance || "").includes(search)
    ));
  }, [customers, customerSearch]);

  if (!hydrated) return null;



  const fullContextValue = {
    ...dashboardContextValue,
    API_BASE_URL: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : undefined,
    addCurrencyCustomCode: typeof addCurrencyCustomCode !== 'undefined' ? addCurrencyCustomCode : undefined,
    addCurrencyRate: typeof addCurrencyRate !== 'undefined' ? addCurrencyRate : undefined,
    addCurrencySelect: typeof addCurrencySelect !== 'undefined' ? addCurrencySelect : undefined,
    adminDrawerOpen: typeof adminDrawerOpen !== 'undefined' ? adminDrawerOpen : undefined,
    adminUser: typeof adminUser !== 'undefined' ? adminUser : undefined,
    announcementText: typeof announcementText !== 'undefined' ? announcementText : undefined,
    apiAutoSubmit: typeof apiAutoSubmit !== 'undefined' ? apiAutoSubmit : undefined,
    bannerSearch: typeof bannerSearch !== 'undefined' ? bannerSearch : undefined,
    banners: typeof banners !== 'undefined' ? banners : undefined,
    baseCurrency: typeof baseCurrency !== 'undefined' ? baseCurrency : undefined,
    cancelUnlockerOrder: typeof cancelUnlockerOrder !== 'undefined' ? cancelUnlockerOrder : undefined,
    catSearch: typeof catSearch !== 'undefined' ? catSearch : undefined,
    categories: typeof categories !== 'undefined' ? categories : undefined,
    checkUnlockerOrderStatus: typeof checkUnlockerOrderStatus !== 'undefined' ? checkUnlockerOrderStatus : undefined,
    credentialsErrorMsg: typeof credentialsErrorMsg !== 'undefined' ? credentialsErrorMsg : undefined,
    credentialsSuccessMsg: typeof credentialsSuccessMsg !== 'undefined' ? credentialsSuccessMsg : undefined,
    customerSearch: typeof customerSearch !== 'undefined' ? customerSearch : undefined,
    customers: typeof customers !== 'undefined' ? customers : undefined,
    deleteOrder: typeof deleteOrder !== 'undefined' ? deleteOrder : undefined,
    emailPass: typeof emailPass !== 'undefined' ? emailPass : undefined,
    emailUser: typeof emailUser !== 'undefined' ? emailUser : undefined,
    errorMsg: typeof errorMsg !== 'undefined' ? errorMsg : undefined,
    excelAppleMarkup: typeof excelAppleMarkup !== 'undefined' ? excelAppleMarkup : undefined,
    excelAppleUploadMsg: typeof excelAppleUploadMsg !== 'undefined' ? excelAppleUploadMsg : undefined,
    excelAppleUsdRate: typeof excelAppleUsdRate !== 'undefined' ? excelAppleUsdRate : undefined,
    excelFrpMarkup: typeof excelFrpMarkup !== 'undefined' ? excelFrpMarkup : undefined,
    excelFrpUploadMsg: typeof excelFrpUploadMsg !== 'undefined' ? excelFrpUploadMsg : undefined,
    excelFrpUsdRate: typeof excelFrpUsdRate !== 'undefined' ? excelFrpUsdRate : undefined,
    excelSettingsErrorMsg: typeof excelSettingsErrorMsg !== 'undefined' ? excelSettingsErrorMsg : undefined,
    excelSettingsSuccessMsg: typeof excelSettingsSuccessMsg !== 'undefined' ? excelSettingsSuccessMsg : undefined,
    excelUploadLoading: typeof excelUploadLoading !== 'undefined' ? excelUploadLoading : undefined,
    exchangeRates: typeof exchangeRates !== 'undefined' ? exchangeRates : undefined,
    faviconUploadedFile: typeof faviconUploadedFile !== 'undefined' ? faviconUploadedFile : undefined,
    fetchUnlockerBalance: typeof fetchUnlockerBalance !== 'undefined' ? fetchUnlockerBalance : undefined,
    fetchUnlockerServices: typeof fetchUnlockerServices !== 'undefined' ? fetchUnlockerServices : undefined,
    featuredSections: typeof featuredSections !== 'undefined' ? featuredSections : [],
    setFeaturedSections: typeof setFeaturedSections !== 'undefined' ? setFeaturedSections : undefined,
    filteredCategories: typeof filteredCategories !== 'undefined' ? filteredCategories : undefined,
    filteredCustomers: typeof filteredCustomers !== 'undefined' ? filteredCustomers : undefined,
    filteredOrders: typeof filteredOrders !== 'undefined' ? filteredOrders : undefined,
    filteredServices: typeof filteredServices !== 'undefined' ? filteredServices : undefined,
    filteredUnlockerServices: typeof filteredUnlockerServices !== 'undefined' ? filteredUnlockerServices : undefined,
    filteredWalletRequests: typeof filteredWalletRequests !== 'undefined' ? filteredWalletRequests : undefined,
    filteredWalletTransactions: typeof filteredWalletTransactions !== 'undefined' ? filteredWalletTransactions : undefined,
    globalCurrencies: typeof globalCurrencies !== 'undefined' ? globalCurrencies : undefined,
    globalMarkupPercent: typeof globalMarkupPercent !== 'undefined' ? globalMarkupPercent : undefined,
    handleApproveOrder: typeof handleApproveOrder !== 'undefined' ? handleApproveOrder : undefined,
    handleClearAllCategories: typeof handleClearAllCategories !== 'undefined' ? handleClearAllCategories : undefined,
    handleClearAllServices: typeof handleClearAllServices !== 'undefined' ? handleClearAllServices : undefined,
    handleDeleteBanner: typeof handleDeleteBanner !== 'undefined' ? handleDeleteBanner : undefined,
    handleDeleteCategory: typeof handleDeleteCategory !== 'undefined' ? handleDeleteCategory : undefined,
    handleDeleteCustomer: typeof handleDeleteCustomer !== 'undefined' ? handleDeleteCustomer : undefined,
    handleDeleteService: typeof handleDeleteService !== 'undefined' ? handleDeleteService : undefined,
    handleLogout: typeof handleLogout !== 'undefined' ? handleLogout : undefined,
    handleManualRefund: typeof handleManualRefund !== 'undefined' ? handleManualRefund : undefined,
    handleOpenCodeModal: typeof handleOpenCodeModal !== 'undefined' ? handleOpenCodeModal : undefined,
    handleOpenEditBanner: typeof handleOpenEditBanner !== 'undefined' ? handleOpenEditBanner : undefined,
    handleToggleCategoryMenuVisibility: typeof handleToggleCategoryMenuVisibility !== 'undefined' ? handleToggleCategoryMenuVisibility : undefined,
    handleHideAllCategoriesFromMenu: typeof handleHideAllCategoriesFromMenu !== 'undefined' ? handleHideAllCategoriesFromMenu : undefined,
    handleOpenEditCat: typeof handleOpenEditCat !== 'undefined' ? handleOpenEditCat : undefined,
    handleOpenEditCustomer: typeof handleOpenEditCustomer !== 'undefined' ? handleOpenEditCustomer : undefined,
    handleOpenEditService: typeof handleOpenEditService !== 'undefined' ? handleOpenEditService : undefined,
    handleSaveGlobalMarkup: typeof handleSaveGlobalMarkup !== 'undefined' ? handleSaveGlobalMarkup : undefined,
    handleToggleAutoSubmit: typeof handleToggleAutoSubmit !== 'undefined' ? handleToggleAutoSubmit : undefined,
    handleUpdateCredentials: typeof handleUpdateCredentials !== 'undefined' ? handleUpdateCredentials : undefined,
    handleUpdateExcelSettings: typeof handleUpdateExcelSettings !== 'undefined' ? handleUpdateExcelSettings : undefined,
    handleUpdateSettings: typeof handleUpdateSettings !== 'undefined' ? handleUpdateSettings : undefined,
    handleUploadExcelFile: typeof handleUploadExcelFile !== 'undefined' ? handleUploadExcelFile : undefined,
    handleWipeAndSyncAll: typeof handleWipeAndSyncAll !== 'undefined' ? handleWipeAndSyncAll : undefined,
    hideWalletPayment: typeof hideWalletPayment !== 'undefined' ? hideWalletPayment : undefined,
    importSelectedUnlockerServices: typeof importSelectedUnlockerServices !== 'undefined' ? importSelectedUnlockerServices : undefined,
    importedUnlockerServiceIds: typeof importedUnlockerServiceIds !== 'undefined' ? importedUnlockerServiceIds : undefined,
    logoUploadedFile: typeof logoUploadedFile !== 'undefined' ? logoUploadedFile : undefined,
    newAdminPassword: typeof newAdminPassword !== 'undefined' ? newAdminPassword : undefined,
    newAdminUsername: typeof newAdminUsername !== 'undefined' ? newAdminUsername : undefined,
    newWhatsappNumber: typeof newWhatsappNumber !== 'undefined' ? newWhatsappNumber : undefined,
    orderFilter: typeof orderFilter !== 'undefined' ? orderFilter : undefined,
    orderSearch: typeof orderSearch !== 'undefined' ? orderSearch : undefined,
    orders: typeof orders !== 'undefined' ? orders : undefined,
    paginatedUnlockerServices: typeof paginatedUnlockerServices !== 'undefined' ? paginatedUnlockerServices : undefined,
    paymentMethodsList: typeof paymentMethodsList !== 'undefined' ? paymentMethodsList : undefined,
    savingMarkup: typeof savingMarkup !== 'undefined' ? savingMarkup : undefined,
    selectedCustomerId: typeof selectedCustomerId !== 'undefined' ? selectedCustomerId : undefined,
    selectedCustomerTransactions: typeof selectedCustomerTransactions !== 'undefined' ? selectedCustomerTransactions : undefined,
    selectedUnlockerServices: typeof selectedUnlockerServices !== 'undefined' ? selectedUnlockerServices : undefined,
    serviceSearch: typeof serviceSearch !== 'undefined' ? serviceSearch : undefined,
    handleOpenMergeCategories: typeof handleOpenMergeCategories !== 'undefined' ? handleOpenMergeCategories : undefined,
    setAddCurrencyCustomCode: typeof setAddCurrencyCustomCode !== 'undefined' ? setAddCurrencyCustomCode : undefined,
    setAddCurrencyRate: typeof setAddCurrencyRate !== 'undefined' ? setAddCurrencyRate : undefined,
    setAddCurrencySelect: typeof setAddCurrencySelect !== 'undefined' ? setAddCurrencySelect : undefined,
    setAdminDrawerOpen: typeof setAdminDrawerOpen !== 'undefined' ? setAdminDrawerOpen : undefined,
    setAnnouncementText: typeof setAnnouncementText !== 'undefined' ? setAnnouncementText : undefined,
    setBannerSearch: typeof setBannerSearch !== 'undefined' ? setBannerSearch : undefined,
    setBaseCurrency: typeof setBaseCurrency !== 'undefined' ? setBaseCurrency : undefined,
    setCatSearch: typeof setCatSearch !== 'undefined' ? setCatSearch : undefined,
    setCustomerSearch: typeof setCustomerSearch !== 'undefined' ? setCustomerSearch : undefined,
    setEmailPass: typeof setEmailPass !== 'undefined' ? setEmailPass : undefined,
    setEmailUser: typeof setEmailUser !== 'undefined' ? setEmailUser : undefined,
    setExcelAppleMarkup: typeof setExcelAppleMarkup !== 'undefined' ? setExcelAppleMarkup : undefined,
    setExcelAppleUsdRate: typeof setExcelAppleUsdRate !== 'undefined' ? setExcelAppleUsdRate : undefined,
    setExcelFrpMarkup: typeof setExcelFrpMarkup !== 'undefined' ? setExcelFrpMarkup : undefined,
    setExcelFrpUsdRate: typeof setExcelFrpUsdRate !== 'undefined' ? setExcelFrpUsdRate : undefined,
    setExchangeRates: typeof setExchangeRates !== 'undefined' ? setExchangeRates : undefined,
    setFaviconUploadedFile: typeof setFaviconUploadedFile !== 'undefined' ? setFaviconUploadedFile : undefined,
    setGlobalCurrencies: typeof setGlobalCurrencies !== 'undefined' ? setGlobalCurrencies : undefined,
    setGlobalMarkupPercent: typeof setGlobalMarkupPercent !== 'undefined' ? setGlobalMarkupPercent : undefined,
    setHideWalletPayment: typeof setHideWalletPayment !== 'undefined' ? setHideWalletPayment : undefined,
    setLogoUploadedFile: typeof setLogoUploadedFile !== 'undefined' ? setLogoUploadedFile : undefined,
    setNewAdminPassword: typeof setNewAdminPassword !== 'undefined' ? setNewAdminPassword : undefined,
    setNewAdminUsername: typeof setNewAdminUsername !== 'undefined' ? setNewAdminUsername : undefined,
    setNewWhatsappNumber: typeof setNewWhatsappNumber !== 'undefined' ? setNewWhatsappNumber : undefined,
    setOrderDetailsData: typeof setOrderDetailsData !== 'undefined' ? setOrderDetailsData : undefined,
    setOrderFilter: typeof setOrderFilter !== 'undefined' ? setOrderFilter : undefined,
    setOrderSearch: typeof setOrderSearch !== 'undefined' ? setOrderSearch : undefined,
    setPaymentMethodsList: typeof setPaymentMethodsList !== 'undefined' ? setPaymentMethodsList : undefined,
    setSelectedCustomerId: typeof setSelectedCustomerId !== 'undefined' ? setSelectedCustomerId : undefined,
    setSelectedUnlockerServices: typeof setSelectedUnlockerServices !== 'undefined' ? setSelectedUnlockerServices : undefined,
    setServiceSearch: typeof setServiceSearch !== 'undefined' ? setServiceSearch : undefined,
    setServices: typeof setServices !== 'undefined' ? setServices : undefined,
    services: typeof services !== 'undefined' ? services : undefined,
    setShowAdminPassword: typeof setShowAdminPassword !== 'undefined' ? setShowAdminPassword : undefined,
    setShowOrderDetailsModal: typeof setShowOrderDetailsModal !== 'undefined' ? setShowOrderDetailsModal : undefined,
    setSiteFavicon: typeof setSiteFavicon !== 'undefined' ? setSiteFavicon : undefined,
    setSiteLogo: typeof setSiteLogo !== 'undefined' ? setSiteLogo : undefined,
    setSiteName: typeof setSiteName !== 'undefined' ? setSiteName : undefined,
    setUnlockerCategoryFilter: typeof setUnlockerCategoryFilter !== 'undefined' ? setUnlockerCategoryFilter : undefined,
    setUnlockerCustomDiscounts: typeof setUnlockerCustomDiscounts !== 'undefined' ? setUnlockerCustomDiscounts : undefined,
    setUnlockerCustomPrices: typeof setUnlockerCustomPrices !== 'undefined' ? setUnlockerCustomPrices : undefined,
    setUnlockerExchangeRate: typeof setUnlockerExchangeRate !== 'undefined' ? setUnlockerExchangeRate : undefined,
    setUnlockerGroupAsPackages: typeof setUnlockerGroupAsPackages !== 'undefined' ? setUnlockerGroupAsPackages : undefined,
    setUnlockerImportTargetCat: typeof setUnlockerImportTargetCat !== 'undefined' ? setUnlockerImportTargetCat : undefined,
    setUnlockerMarkupPercent: typeof setUnlockerMarkupPercent !== 'undefined' ? setUnlockerMarkupPercent : undefined,
    setUnlockerNewCatName: typeof setUnlockerNewCatName !== 'undefined' ? setUnlockerNewCatName : undefined,
    setUnlockerPage: typeof setUnlockerPage !== 'undefined' ? setUnlockerPage : undefined,
    setUnlockerPageSize: typeof setUnlockerPageSize !== 'undefined' ? setUnlockerPageSize : undefined,
    setUnlockerSearch: typeof setUnlockerSearch !== 'undefined' ? setUnlockerSearch : undefined,
    setUnlockerSortOrder: typeof setUnlockerSortOrder !== 'undefined' ? setUnlockerSortOrder : undefined,
    setWalletFilter: typeof setWalletFilter !== 'undefined' ? setWalletFilter : undefined,
    setWalletSearch: typeof setWalletSearch !== 'undefined' ? setWalletSearch : undefined,
    setWhatsappNumbers: typeof setWhatsappNumbers !== 'undefined' ? setWhatsappNumbers : undefined,
    showAdminPassword: typeof showAdminPassword !== 'undefined' ? showAdminPassword : undefined,
    siteFavicon: typeof siteFavicon !== 'undefined' ? siteFavicon : undefined,
    siteLogo: typeof siteLogo !== 'undefined' ? siteLogo : undefined,
    siteName: typeof siteName !== 'undefined' ? siteName : undefined,
    stats: typeof stats !== 'undefined' ? stats : undefined,
    token: typeof token !== 'undefined' ? token : undefined,
    totalUnlockerPages: typeof totalUnlockerPages !== 'undefined' ? totalUnlockerPages : undefined,
    unlockerBalance: typeof unlockerBalance !== 'undefined' ? unlockerBalance : undefined,
    unlockerBalanceEmail: typeof unlockerBalanceEmail !== 'undefined' ? unlockerBalanceEmail : undefined,
    unlockerBalanceLoading: typeof unlockerBalanceLoading !== 'undefined' ? unlockerBalanceLoading : undefined,
    unlockerCategories: typeof unlockerCategories !== 'undefined' ? unlockerCategories : undefined,
    unlockerCategoryFilter: typeof unlockerCategoryFilter !== 'undefined' ? unlockerCategoryFilter : undefined,
    unlockerCurrency: typeof unlockerCurrency !== 'undefined' ? unlockerCurrency : undefined,
    unlockerCustomDiscounts: typeof unlockerCustomDiscounts !== 'undefined' ? unlockerCustomDiscounts : undefined,
    unlockerCustomPrices: typeof unlockerCustomPrices !== 'undefined' ? unlockerCustomPrices : undefined,
    unlockerExchangeRate: typeof unlockerExchangeRate !== 'undefined' ? unlockerExchangeRate : undefined,
    unlockerGroupAsPackages: typeof unlockerGroupAsPackages !== 'undefined' ? unlockerGroupAsPackages : undefined,
    unlockerImportTargetCat: typeof unlockerImportTargetCat !== 'undefined' ? unlockerImportTargetCat : undefined,
    unlockerLoading: typeof unlockerLoading !== 'undefined' ? unlockerLoading : undefined,
    unlockerMarkupPercent: typeof unlockerMarkupPercent !== 'undefined' ? unlockerMarkupPercent : undefined,
    unlockerNewCatName: typeof unlockerNewCatName !== 'undefined' ? unlockerNewCatName : undefined,
    unlockerPage: typeof unlockerPage !== 'undefined' ? unlockerPage : undefined,
    unlockerPageSize: typeof unlockerPageSize !== 'undefined' ? unlockerPageSize : undefined,
    unlockerSearch: typeof unlockerSearch !== 'undefined' ? unlockerSearch : undefined,
    unlockerServices: typeof unlockerServices !== 'undefined' ? unlockerServices : undefined,
    unlockerSortOrder: typeof unlockerSortOrder !== 'undefined' ? unlockerSortOrder : undefined,
    unlockerSyncMsg: typeof unlockerSyncMsg !== 'undefined' ? unlockerSyncMsg : undefined,
    updateOrderStatus: typeof updateOrderStatus !== 'undefined' ? updateOrderStatus : undefined,
    updateWalletRequestStatus: typeof updateWalletRequestStatus !== 'undefined' ? updateWalletRequestStatus : undefined,
    walletFilter: typeof walletFilter !== 'undefined' ? walletFilter : undefined,
    walletRequests: typeof walletRequests !== 'undefined' ? walletRequests : undefined,
    walletSearch: typeof walletSearch !== 'undefined' ? walletSearch : undefined,
    walletTransactions: typeof walletTransactions !== 'undefined' ? walletTransactions : undefined,
    whatsappNumbers: typeof whatsappNumbers !== 'undefined' ? whatsappNumbers : undefined,
    API_BASE_URL: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : undefined,
  };

  return (
    <AdminDashboardContext.Provider value={fullContextValue}>
      {children}
      {deleteOtpModal.isOpen && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "28px", borderRadius: "20px", border: "1px solid rgba(239, 68, 68, 0.4)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: "12px" }}>
                🔒
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#fff", margin: 0 }}>تأكيد الحذف بواسطة كود الواتساب</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "6px" }}>أمان عالي لمنع الحذف غير المصرح به من لوحة التحكم</p>
            </div>

            <div style={{ padding: "12px 14px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "10px", color: "#4ade80", fontSize: "0.86rem", lineHeight: "1.6", textAlign: "center", marginBottom: "18px" }}>
              📲 {deleteOtpModal.message}
            </div>

            <form onSubmit={handleConfirmDeleteOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", textAlign: "center", fontWeight: "700", marginBottom: "8px", color: "#f87171" }}>
                  أدخل كود التحقق (6 أرقام):
                </label>
                <input
                  type="text"
                  placeholder="1 2 3 4 5 6"
                  maxLength={6}
                  value={deleteOtpCode}
                  onChange={(e) => setDeleteOtpCode(e.target.value.replace(/\D/g, ""))}
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

              {deleteOtpError && (
                <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.15)", borderRight: "4px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                  ❌ {deleteOtpError}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="submit"
                  disabled={deleteOtpLoading || deleteOtpCode.length < 6}
                  className="glass-btn"
                  style={{ flex: 1, padding: "14px", background: "#ef4444", color: "#fff", fontWeight: "800", borderRadius: "12px", fontSize: "0.95rem" }}
                >
                  {deleteOtpLoading ? "جاري التحقق والتنفيذ..." : "🚀 تأكيد وحذف الآن"}
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteOtpModal({ isOpen: false, url: "", message: "", onSuccess: null }); setDeleteOtpCode(""); setDeleteOtpError(""); }}
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

      {/* Merge Categories Modal */}
      {showMergeCategoriesModal && (
        <div className="modal-overlay" onClick={() => setShowMergeCategoriesModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>تجميع الأقسام المحددة</h2>
              <button className="close-btn" onClick={() => setShowMergeCategoriesModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <p style={{ color: "var(--text-muted)" }}>سيتم تعيين الأقسام المحددة ({mergeSourceIds.length} أقسام) كأقسام فرعية داخل القسم الذي ستختاره بالأسفل، ولن يتم حذفها.</p>
              
              <div className="form-group">
                <label>اختر القسم الأب (القسم الرئيسي):</label>
                <select 
                  className="form-input-premium" 
                  value={mergeTargetId} 
                  onChange={(e) => setMergeTargetId(e.target.value)}
                >
                  <option value="">-- اختر القسم --</option>
                  {categories.filter(c => !mergeSourceIds.includes(c.id)).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button 
                  onClick={handleConfirmMergeCategories}
                  className="action-btn"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "bold" }}
                >
                  تأكيد وتجميع
                </button>
                <button 
                  onClick={() => setShowMergeCategoriesModal(false)}
                  className="action-btn"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "bold" }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminDashboardContext.Provider>
  );
}
