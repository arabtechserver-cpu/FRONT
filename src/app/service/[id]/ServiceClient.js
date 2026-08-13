"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";
import { useI18n } from "@/lib/i18n";
import { trackConversion } from "@/lib/analytics";

export default function ServiceDetail({ params, initialService = null }) {
  const unwrappedParams = use(params);
  const serviceId = unwrappedParams.id;
  const router = useRouter();
  const { language, meta, t } = useI18n();
  const localizeServiceText = (value) => {
    if (typeof value !== "string") return value;
    return value
      .replaceAll("باقات وتفعيل خدمات", t("servicePackagesActivation"))
      .replaceAll("تبدأ معالجة الطلب بعد الدفع مباشرة.", t("executionStartsAfterPayment"));
  };

  const [service, setService] = useState(initialService);
  const [loading, setLoading] = useState(!initialService);
  const [loadError, setLoadError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedSubServiceId, setSelectedSubServiceId] = useState(null);
  const [customQuantity, setCustomQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [customerPricingMode, setCustomerPricingMode] = useState("packages");
  const [packageSearchTerm, setPackageSearchTerm] = useState("");
  const [exchangeRates, setExchangeRates] = useState({ "USD": 50, "USDT": 51 });

  // Form state - dynamic fields
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [senderPhone, setSenderPhone] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [receiptImage, setReceiptImage] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [hideManualTransfersSetting, setHideManualTransfersSetting] = useState(false);
  const transferNumber = "01026785879";

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [imageError, setImageError] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Theme sync
    if (typeof window !== "undefined") {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(currentTheme);
    }

    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token && userStr) {
      setIsCustomerLoggedIn(true);
      setCustomerUser(JSON.parse(userStr));
    }
  }, [serviceId, router]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;

        const hideManual = !!data.hide_wallet_payment;
        setHideManualTransfersSetting(hideManual);
        if (data.payment_methods) {
          setPaymentMethods(data.payment_methods);
          const token = localStorage.getItem("customer_token");
          if (hideManual || token) {
            setPaymentMethod("wallet");
          } else if (data.payment_methods.length > 0) {
            setPaymentMethod(data.payment_methods[0].id);
          }
        }
        if (data.base_currency) {
          setBaseCurrency("USD");
        }
        if (data.exchange_rates) {
          setExchangeRates(data.exchange_rates);
        }
      })
      .catch(err => {
        console.error("Error fetching settings:", err);
      });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    setIsCustomerLoggedIn(false);
    setCustomerUser(null);
  };

  const goToLoginForOrder = (packageOverride = null) => {
    const packageToSave = packageOverride || selectedPackage;
    trackConversion("login_required", {
      serviceId,
      packageId: packageToSave?.id || "",
      paymentMethod: "wallet",
    });
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`order_draft_${serviceId}`, JSON.stringify({
        packageId: packageToSave?.id || null,
        subServiceId: selectedSubServiceId,
        customQuantity,
        formData,
        senderPhone,
        transferAmount,
        paymentMethod: "wallet",
        step
      }));
    }
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search || ""}`
      : `/service/${serviceId}`;
    router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  };

  // Backup static services if backend is unreachable
  const staticServices = [
    {
      id: 1,
      name: "ببجي موبايل (PUBG Mobile)",
      description: "اشحن شدات ببجي موبايل فوراً ومباشرة في حسابك عن طريق الآيدي ID بأفضل الأسعار.",
      price: 0.99,
      image: "pubg",
      packages: [
        { id: 1, name: "60 شدة (UC)", price: 0.99 },
        { id: 2, name: "325 شدة (UC)", price: 4.85 },
        { id: 3, name: "660 شدة (UC)", price: 9.50 },
        { id: 4, name: "1800 شدة (UC)", price: 23.99 }
      ]
    },
    {
      id: 2,
      name: "فري فاير (Free Fire)",
      description: "اشحن جواهر فري فاير فوراً لتفعيل الفاير باس والحصول على أحدث سكنات اللعبة عبر الآيدي.",
      price: 1.10,
      image: "freefire",
      packages: [
        { id: 1, name: "110 جواهر", price: 1.10 },
        { id: 2, name: "231 جواهر", price: 2.20 },
        { id: 3, name: "583 جواهر", price: 5.30 },
        { id: 4, name: "1188 جواهر", price: 10.50 }
      ]
    },
    {
      id: 3,
      name: "بيجو لايف (Bigo Live)",
      description: "اشحن فاصوليا ومجوهرات تطبيق بيجو لايف لدعم البث المباشر المفضل لديك.",
      price: 1.25,
      image: "bigo",
      packages: [
        { id: 1, name: "42 جوهرة", price: 1.25 },
        { id: 2, name: "297 جوهرة", price: 7.99 },
        { id: 3, name: "848 جوهرة", price: 22.50 }
      ]
    },
    {
      id: 4,
      name: "فودافون كاش مصر (Vodafone Cash)",
      description: "شحن رصيد وتحويل أموال عبر محفظة فودافون كاش مباشرة بسعر الصرف الممتاز.",
      price: 1.00,
      image: "vodafone",
      packages: [
        { id: 1, name: "إرسال 100 جنيه مصري", price: 2.10 },
        { id: 2, name: "إرسال 500 جنيه مصري", price: 10.50 },
        { id: 3, name: "إرسال 1000 جنيه مصري", price: 21.00 }
      ]
    },
    {
      id: 5,
      name: "شحن رصيد USDT (TRC20)",
      description: "شراء وسحب عملة USDT الرقمية بأفضل أسعار الصرف وبسرعة تنفيذ خيالية.",
      price: 1.00,
      image: "usdt",
      packages: [
        { id: 1, name: "10 USDT", price: 10.30 },
        { id: 2, name: "50 USDT", price: 51.50 },
        { id: 3, name: "100 USDT", price: 102.50 }
      ]
    },
    {
      id: 6,
      name: "اشتراك كانفا برو (Canva Pro)",
      description: "تفعيل اشتراك كانفا برو الحساب الشخصي بكافة ميزات التصميم والذكاء الاصطناعي.",
      price: 1.99,
      image: "canva",
      packages: [
        { id: 1, name: "تفعيل لمدة شهر", price: 1.99 },
        { id: 2, name: "تفعيل لمدة 6 أشهر", price: 8.99 },
        { id: 3, name: "تفعيل لمدة سنة كاملة", price: 14.99 }
      ]
    },
    {
      id: 7,
      name: "اشتراك نتفليكس (Netflix Premium)",
      description: "شاشة خاصة بك بجودة 4K UHD على حساب نتفليكس مشترك أو حساب مستقل بالكامل.",
      price: 2.50,
      image: "netflix",
      packages: [
        { id: 1, name: "شاشة واحدة لمدة شهر 4K", price: 2.50 },
        { id: 2, name: "حساب كامل مستقل لمدة شهر", price: 9.99 }
      ]
    }
  ];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setLoading(!initialService);
    setLoadError("");
    setImageError(false);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const token = typeof window !== 'undefined' ? localStorage.getItem("customer_token") : null;
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
      headers,
      signal: controller.signal,
      cache: "no-store"
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setService(data);
        if (data.packages && data.packages.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const pkgId = urlParams.get('package');
          const subId = urlParams.get('sub');
          
          if (subId && data.is_bundle) {
             setSelectedSubServiceId(subId);
             const subService = data.bundle_services_data?.find(s => s.id.toString() === subId.toString());
             if (subService && subService.packages && subService.packages.length > 0) {
                const preselectedPkg = subService.packages.find(p => String(p.id) === String(pkgId));
                if (preselectedPkg) {
                  setSelectedPackage(preselectedPkg);
                  setStep(2);
                } else {
                  setSelectedPackage(subService.packages[0]);
                }
             }
          } else {
            const preselectedPkg = data.packages.find(p => String(p.id) === String(pkgId));
            if (preselectedPkg) {
              setSelectedPackage(preselectedPkg);
              setStep(2);
            } else {
              setSelectedPackage(data.packages[0]);
            }
          }
        }
        if (data.price_type === "dynamic") {
          setCustomerPricingMode("dynamic");
        } else {
          setCustomerPricingMode("packages");
        }
        setLoadError("");
        setLoading(false);
      })
      .catch((error) => {
        const fallback = staticServices.find(s => s.id === Number(serviceId));
        if (fallback) {
          setService(fallback);
          if (fallback.packages && fallback.packages.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const pkgId = urlParams.get('package');
            const preselectedPkg = fallback.packages.find(p => String(p.id) === String(pkgId));
            if (preselectedPkg) {
              setSelectedPackage(preselectedPkg);
              setStep(2);
            } else {
              setSelectedPackage(fallback.packages[0]);
            }
          }
          if (fallback.price_type === "dynamic") {
            setCustomerPricingMode("dynamic");
          } else {
            setCustomerPricingMode("packages");
          }
        } else if (!initialService) {
          setService(null);
          setLoadError(
            error?.name === "AbortError"
              ? "استغرق تحميل الخدمة وقتًا أطول من المتوقع."
              : "تعذر تحميل تفاصيل الخدمة الآن."
          );
        }
        setLoading(false);
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [serviceId, initialService, retryNonce]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!service || typeof window === "undefined") return;
    const draftKey = `order_draft_${serviceId}`;
    const rawDraft = sessionStorage.getItem(draftKey);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      const packageSource = draft.subServiceId && service.is_bundle
        ? service.bundle_services_data?.find(item => String(item.id) === String(draft.subServiceId))
        : service;
      const restoredPackage = packageSource?.packages?.find(pkg => String(pkg.id) === String(draft.packageId));

      if (restoredPackage) setSelectedPackage(restoredPackage);
      if (draft.subServiceId) setSelectedSubServiceId(draft.subServiceId);
      if (draft.customQuantity) setCustomQuantity(draft.customQuantity);
      if (draft.formData) setFormData(draft.formData);
      if (draft.senderPhone) setSenderPhone(draft.senderPhone);
      if (draft.transferAmount) setTransferAmount(draft.transferAmount);
      if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod);
      if (draft.step === 2) setStep(2);
    } catch {
      sessionStorage.removeItem(draftKey);
    }
  }, [service, serviceId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!service?.id) return;
    trackConversion("service_view", { serviceId: service.id });
  }, [service?.id]);

  const activeService = useMemo(() => {
    if (!service) return null;
    if (service.is_bundle && service.bundle_services_data && selectedSubServiceId) {
      return service.bundle_services_data.find(s => s.id.toString() === selectedSubServiceId.toString()) || service;
    }
    return service;
  }, [service, selectedSubServiceId]);

  const hasImage = useMemo(() => {
    if (!activeService?.image) return false;
    const img = activeService.image.trim();
    if (img === "" || img === "default" || img.endsWith("/default")) return false;
    return !imageError;
  }, [activeService?.image, imageError]);

  // Parse dynamic fields from service
  const serviceFields = useMemo(() => {
    if (!activeService) return [];

    let sFields = [];
    if (Array.isArray(activeService.fields)) sFields = activeService.fields;
    else if (typeof activeService.fields === 'string') {
      try { sFields = JSON.parse(activeService.fields); } catch { }
    }

    if (sFields && sFields.length > 0) return sFields;
    return [];
  }, [activeService]);

  const defaultFields = useMemo(() => ([]), []);

  const activeFields = useMemo(() => {
    let rawFields = [];

    if (selectedPackage && Array.isArray(selectedPackage.fields)) {
      // A package with an explicit empty fields list must not inherit fields from the group.
      rawFields = [...selectedPackage.fields];
    } else if (Array.isArray(serviceFields)) {
      // Services without package metadata still use their service-level fields.
      rawFields = [...serviceFields];
    }

    const seen = new Set();
    const uniqueFields = [];

    for (const f of rawFields) {
      if (!f) continue;
      // Support both 'name' and 'id' as field identifier
      const fieldId = String(f.name || f.id || "").toLowerCase().trim();
      const fieldLabel = String(f.label || "").toLowerCase().trim();
      if (!fieldId && !fieldLabel) continue;

      const idKey = fieldId ? `id_${fieldId}` : null;
      const labelKey = fieldLabel ? `lbl_${fieldLabel}` : null;

      if ((idKey && seen.has(idKey)) || (labelKey && seen.has(labelKey))) {
        continue;
      }

      if (idKey) seen.add(idKey);
      if (labelKey) seen.add(labelKey);
      uniqueFields.push(f);
    }

    const activeServiceType = String(
      selectedPackage?.api_service_type || activeService?.api_service_type || ''
    ).toLowerCase();

    return uniqueFields
      .filter(f => {
        const fid = (f.name || f.id || "").toLowerCase().trim();
        if ((activeServiceType === "server" || activeServiceType === "remote") && (fid === "imei" || fid === "custom_imei")) {
          return false;
        }
        // Hide standalone phone/tel fields (they are collected separately in payment section)
        // Also hide provider quantity fields because they are collected via customQuantity
        if (fid === "phone" || fid === "tel" || fid === "quantity" || fid === "qty" || fid === "qnt") {
          return false;
        }

        return true;
      })
      .map(f => ({
        ...f,
        // Normalize: always use 'name' as the key for formData, falling back to 'id'
        name: (f.name || f.id || "").trim()
      }));
  }, [activeService, serviceFields, defaultFields, selectedPackage]);

  const fieldsSectionTitle = useMemo(() => {
    if (!activeService) return t("serviceData");
    if (activeService.fields_title && activeService.fields_title.trim()) {
      const title = activeService.fields_title.trim();
      return title === "بيانات الخدمة" ? t("serviceData") : title;
    }
    return t("serviceData");
  }, [activeService, t]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const selectPackageAndContinue = (pkg) => {
    if (!pkg) return;
    if (service.price_type === "both") {
      setCustomerPricingMode("packages");
    }
    setSelectedPackage(pkg);
    if (!isCustomerLoggedIn) {
      goToLoginForOrder(pkg);
      return;
    }
    setStep(2);
    trackConversion("package_selected", { serviceId, packageId: pkg.id || "" });
    trackConversion("checkout_started", { serviceId, packageId: pkg.id || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSpeedUpWhatsAppUrl = (phoneNum, orderObj, customerName = "") => {
    const custName = customerName || orderObj.customer_username || (orderObj.phone ? `زائر (${orderObj.phone})` : "عميل");
    const text = `🟢 *طلب تسريع خدمة (عرب تك)* ⚡\n\n` +
      `▫️ *رقم الطلب:* #${orderObj.id}\n` +
      `▫️ *اسم العميل:* ${custName}\n` +
      `▫️ *الخدمة:* ${orderObj.service_name || "خدمة"}\n` +
      (orderObj.package_name ? `▫️ *الباقة:* ${orderObj.package_name}\n` : "") +
      (orderObj.player_id ? `▫️ *معرف الحساب / ID:* ${orderObj.player_id}\n` : "") +
      `\nأرجو تسريع معالجة هذا الطلب في أسرع وقت ممكن، وشكراً لكم. 🙏`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isCustomerLoggedIn) {
      goToLoginForOrder();
      return;
    }

    if (service.is_bundle && !selectedSubServiceId) {
      setErrorMessage("من فضلك اختر الخدمة المطلوبة من الباقة أولاً.");
      return;
    }

    const isDynamic = activeService.price_type === "dynamic" || (activeService.price_type === "both" && customerPricingMode === "dynamic");

    if (!isDynamic && !selectedPackage) {
      setErrorMessage("من فضلك حدد الباقة المطلوبة.");
      return;
    }

    if (isDynamic) {
      const minQty = activeService.min_quantity || 100;
      const maxQty = activeService.max_quantity || 0;
      if (!customQuantity || customQuantity < minQty) {
        setErrorMessage(`من فضلك أدخل كمية صالحة (الحد الأدنى ${minQty}).`);
        return;
      }
      if (maxQty > 0 && customQuantity > maxQty) {
        setErrorMessage(`الكمية المطلوبة تتجاوز الحد الأقصى المسموح به (${maxQty}).`);
        return;
      }
    }

    // Validate required fields
    for (const field of activeFields) {
      if (field.required !== false && (!formData[field.name] || !formData[field.name].toString().trim())) {
        setErrorMessage(`حقل "${field.label}" مطلوب.`);
        return;
      }
    }

    trackConversion("order_submitted", {
      serviceId: activeService.id,
      packageId: selectedPackage?.id || "dynamic",
      paymentMethod: "wallet",
      guest: false,
    });
    setSubmitting(true);

    let computedPrice = 0;
    if (isDynamic) {
      const usdPrice = (customQuantity / 1000) * (activeService.price_per_thousand || 0);
      if (activeService.category_currency === 'USD' || activeService.category_currency === 'USDT') {
        const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);
        computedPrice = Number((usdPrice * usdRate).toFixed(2));
      } else {
        computedPrice = Number(usdPrice.toFixed(2));
      }
    } else {
      let multiplier = selectedPackage?.requires_quantity ? (customQuantity || 1) : 1;
      if (activeService.category_currency === 'USD' || activeService.category_currency === 'USDT') {
        // Use ?? (nullish coalescing) so that price=0 (free services) is NOT treated as falsy
        const usdPrice = (selectedPackage.usd_price != null) ? Number(selectedPackage.usd_price) : Number(selectedPackage.price ?? 0);
        const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);
        computedPrice = Number((usdPrice * usdRate * multiplier).toFixed(2));
      } else {
        computedPrice = Number(((selectedPackage.price ?? 0) * multiplier).toFixed(2));
      }
    }
    const computedPackageName = isDynamic
      ? `كمية: ${customQuantity}`
      : (selectedPackage?.requires_quantity ? `${selectedPackage.name} (الكمية: ${customQuantity || 1})` : selectedPackage.name);

    try {
      const headers = {
        "Content-Type": "application/json"
      };

      const token = localStorage.getItem("customer_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          service_id: activeService.id,
          player_id: formData.player_id || formData[activeFields[0]?.name] || "",
          phone: customerUser?.phone || formData.phone || formData[activeFields[1]?.name] || formData[activeFields[0]?.name] || "",
          package_name: computedPackageName,
          package_price: computedPrice,
          payment_method: "wallet",
          sender_phone: "",
          transfer_to: "",
          custom_fields: formData,
          quantity: (isDynamic || selectedPackage?.requires_quantity) ? customQuantity : 1,
          receipt_image: "",
          transfer_amount: 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل إرسال الطلب، الرجاء المحاولة مجدداً.");
      }

      if (typeof data.customer_balance === "number") {
        try {
          const currentUserStr = localStorage.getItem("customer_user");
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            const updatedUser = { ...currentUser, balance: data.customer_balance };
            localStorage.setItem("customer_user", JSON.stringify(updatedUser));
            setCustomerUser(updatedUser);
          }
        } catch {
          // Ignore local storage sync issues; balance already updated on the server.
        }
      }

      setSuccessData(data);
      trackConversion("order_completed", {
        serviceId: activeService.id,
        packageId: selectedPackage?.id || "dynamic",
        paymentMethod: "wallet",
        guest: false,
      });
      sessionStorage.removeItem(`order_draft_${serviceId}`);
    } catch (err) {
      setErrorMessage(err.message || "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFallbackEmoji = (name = "", image = "") => {
    const lowerName = (name || "").toLowerCase();
    const lowerImg = (image || "").toLowerCase();

    if (lowerImg.includes("pubg") || lowerName.includes("pubg") || lowerName.includes("ببجي")) return "🔫";
    if (lowerImg.includes("freefire") || lowerImg.includes("free fire") || lowerName.includes("فري فاير") || lowerName.includes("free fire") || lowerName.includes("freefire")) return "🔥";
    if (lowerImg.includes("bigo") || lowerName.includes("بيجو")) return "💬";
    if (lowerImg.includes("vodafone") || lowerName.includes("فودافون")) return "📱";
    if (lowerImg.includes("usdt") || lowerName.includes("usdt") || lowerName.includes("عملة") || lowerName.includes("أرصدة")) return "🪙";
    if (lowerImg.includes("canva") || lowerName.includes("كانفا")) return "🎨";
    if (lowerImg.includes("netflix") || lowerName.includes("نتفليكس")) return "🎬";
    if (lowerName.includes("ايفون") || lowerName.includes("iphone") || lowerName.includes("ipad") || lowerName.includes("ايباد") || lowerName.includes("bypass") || lowerName.includes("تخط") || lowerName.includes("icloud") || lowerName.includes("ايكلاود") || lowerName.includes("hello") || lowerName.includes("removal") || lowerName.includes("hfz") || lowerName.includes("smd") || lowerName.includes("otix")) return "📱";

    return "⚡";
  };

  const getServiceIcon = (image, name = "") => {
    if (!image) return getFallbackEmoji(name, image);
    if (image.startsWith("data:image") || image.startsWith("http") || image.includes("uploads")) {
      const src = image.startsWith("http") || image.startsWith("data:")
        ? image
        : (image.startsWith("/") ? `${API_BASE_URL}${image}` : `${API_BASE_URL}/${image}`);
      return <img
        src={src}
        alt="Service Icon"
        onError={(e) => {
          setImageError(true);
        }}
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }}
      />;
    }
    if (image.includes("pubg")) return "🔫";
    if (image.includes("freefire")) return "🔥";
    if (image.includes("bigo")) return "💬";
    if (image.includes("vodafone")) return "📱";
    if (image.includes("usdt")) return "🪙";
    if (image.includes("canva")) return "🎨";
    if (image.includes("netflix")) return "🎬";
    return "⚡";
  };

  const filteredPackages = !activeService?.packages
    ? []
    : (() => {
      const query = (packageSearchTerm || "").trim().toLowerCase();
      if (!query) return activeService.packages;
      return activeService.packages.filter(pkg =>
        (pkg.name || "").toLowerCase().includes(query)
      );
    })();

  if (loading) {
    return (
      <>
        <style>{`
          .spinner-loader {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin-loader 0.8s linear infinite;
            display: inline-block;
          }
          @keyframes spin-loader {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", flexDirection: "column", gap: "20px" }}>
          <div className="spinner-loader"></div>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>{t("serviceDetailsLoading")}</p>
        </div>
      </>
    );
  }

  if (!service) {
    return (
      <div style={{ minHeight: "420px", display: "grid", placeItems: "center", padding: "24px" }}>
        <div className="glass-panel" style={{ maxWidth: "560px", width: "100%", padding: "32px", textAlign: "center", borderRadius: "20px" }}>
          <div aria-hidden="true" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
          <h1 style={{ fontSize: "1.35rem", marginBottom: "10px" }}>تعذر فتح الخدمة</h1>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "20px" }}>
            {loadError || "الخدمة غير متاحة مؤقتًا. حاول مرة أخرى أو ارجع إلى قائمة الخدمات."}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" className="glass-btn glass-btn-primary" onClick={() => setRetryNonce(value => value + 1)}>
              إعادة المحاولة
            </button>
            <Link className="glass-btn" href="/services">العودة إلى الخدمات</Link>
          </div>
        </div>
      </div>
    );
  }

  const packagesSection = (
    <div>
      {service.is_bundle && service.bundle_services_data && service.bundle_services_data.length > 0 && (
        <div style={{ marginBottom: "24px", background: "rgba(16, 185, 129, 0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <h3 style={{ fontWeight: 800, marginBottom: "15px", fontSize: "1.1rem", color: "#6ee7b7" }}>
            {t("selectBundleServiceStep")}
          </h3>
          <select
            value={selectedSubServiceId || ""}
            onChange={(e) => {
              setSelectedSubServiceId(e.target.value);
              setSelectedPackage(null); // reset package selection when service changes
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              background: "var(--bg-secondary)",
              color: "#fff",
              outline: "none",
              cursor: "pointer",
              appearance: "none"
            }}
          >
            <option value="" disabled>{t("selectRequiredService")}</option>
            {service.bundle_services_data.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}

      <h3 style={{ fontWeight: 800, marginBottom: "15px", fontSize: "1.1rem" }}>
        {service.is_bundle ? t("selectPackageStepTwo") : t("selectPackageStepOne")}
      </h3>

      {service.packages && service.packages.length > 3 && (
        <div style={{ marginBottom: "20px", position: "relative" }}>
          <input
            type="text"
            placeholder="البحث عن باقة..."
            value={packageSearchTerm}
            onChange={(e) => setPackageSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 44px 14px 16px",
              fontSize: "0.95rem",
              borderRadius: "14px",
              border: "1px solid var(--bg-glass)",
              background: "var(--bg-glass)",
              color: "var(--text-main)",
              outline: "none",
              transition: "all 0.25s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary-color)";
              e.target.style.background = "var(--bg-glass)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--bg-glass)";
              e.target.style.background = "var(--bg-glass)";
            }}
          />
          <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.6, fontSize: "1.1rem" }}>🔍</span>
          {packageSearchTerm && (
            <button
              onClick={() => setPackageSearchTerm("")}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "1.2rem",
                padding: "2px"
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {filteredPackages && filteredPackages.length > 0 ? (
        <div className="scc-grid">
          {filteredPackages.map((pkg, idx) => {
            const isUsd = service.category_currency === 'USD' || service.category_currency === 'USDT';
            const usdPrice = pkg.usd_price || pkg.price;

            const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);
            const egpPrice = usdPrice * usdRate;

            const isSelected = selectedPackage?.id === pkg.id && (service.price_type !== "both" || customerPricingMode === "packages");

            // Generate a dynamic accent color for the side border line
            const accentColors = ["#6366f1", "#3b82f6", "#10b981", "#ec4899", "#f59e0b"];
            const accentColor = accentColors[idx % accentColors.length];
            const glowColor = `rgba(${idx % 2 === 0 ? "99, 102, 241" : "59, 130, 246"}, 0.35)`;

            return (
              <div key={pkg.id} className="scc-wrap">
                <div
                  className="scc-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPackageAndContinue(pkg);
                  }}
                  style={{
                    cursor: "pointer",
                    border: isSelected ? `2.5px solid ${accentColor}` : "1px solid var(--bg-glass)",
                    background: isSelected ? "var(--bg-hover)" : "",
                    transform: isSelected ? "translateY(-2px)" : "",
                    "--scc-ac": accentColor,
                    "--scc-gl": glowColor,
                    padding: "14px 18px"
                  }}
                >
                  <div className="scc-side-line"></div>

                  {hasImage && (
                    <div className="scc-img-ring" style={{ borderColor: accentColor }}>
                      <div className="scc-img-inner">
                        <img
                          alt={(pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? service.name : pkg.name}
                          className="scc-img"
                          src={service.image.startsWith("http") || service.image.startsWith("data:")
                            ? service.image
                            : (service.image.startsWith("/") ? `${API_BASE_URL}${service.image}` : `${API_BASE_URL}/${service.image}`)}
                          onError={() => {
                            setImageError(true);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="scc-content" style={{ paddingRight: hasImage ? "0px" : "4px" }}>
                    <span className="scc-name" style={{ fontSize: "1rem", fontWeight: "800" }}>{(pkg.name === "تفعيل فوري تلقائي" || !pkg.name) ? service.name : pkg.name}</span>
                    <div className="scc-meta" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                      <span style={{ color: "var(--primary-color)", fontWeight: "900", fontSize: "0.95rem" }}>
                        {baseCurrency === 'USD' || baseCurrency === 'USDT' || isUsd
                          ? `$ ${usdPrice.toFixed(2)}`
                          : `${Number(pkg.price).toFixed(2)} ${baseCurrency}`}
                      </span>
                      {!pkg.requires_quantity ? (parseInt(pkg.min_quantity) > 1 && <span style={{ color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.85rem', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>الكمية: {pkg.min_quantity}</span>) : (<span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.85rem', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>الكمية: {pkg.min_quantity} - {pkg.max_quantity > 0 ? pkg.max_quantity : '∞'}</span>)}
                    </div>
                  </div>

                  <div className="scc-arrow" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        let url = `${window.location.origin}/service/${serviceId}?package=${pkg.id}`;
                        if (service.is_bundle && selectedSubServiceId) {
                          url += `&sub=${selectedSubServiceId}`;
                        }
                        navigator.clipboard.writeText(url).then(() => alert("تم نسخ رابط الباقة بنجاح!"));
                      }}
                      style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer", padding: "4px 8px", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
                      title="نسخ رابط الباقة للمشاركة"
                      onMouseOver={(e) => { e.currentTarget.style.background = "var(--border-color)"; e.currentTarget.style.color = "var(--primary-color)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "var(--bg-glass)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left" style={{ opacity: 0.8 }}>
                      <path d="m15 18-6-6 6-6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.01)", borderRadius: "14px", border: "1px solid var(--bg-glass)" }}>لا تتوفر باقات مطابقة للبحث.</div>
      )}
    </div>
  );

  const minQty = service?.min_quantity || 100;
  const maxQty = service?.max_quantity || 0;

  const customQuantitySection = (
    <div>
      <h3 style={{ fontWeight: 800, marginBottom: "10px" }}>
        {service.is_bundle ? "2. أدخل الكمية المطلوبة:" : "1. أدخل الكمية المطلوبة:"}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--accent-color)", marginBottom: "12px", fontWeight: "bold" }}>
        سعر الـ 1000 وحدة هو: {baseCurrency === 'USD' || baseCurrency === 'USDT'
          ? `$ ${Number(service?.price_per_thousand || 0).toFixed(2)}`
          : (service?.category_currency === 'USD' || service?.category_currency === 'USDT'
            ? `$ ${Number(service?.price_per_thousand || 0).toFixed(2)} (ما يعادل ${Number((service?.price_per_thousand || 0) * (exchangeRates?.["USD"] || 50)).toFixed(2)} ${baseCurrency})`
            : `${Number(service?.price_per_thousand || 0).toFixed(2)} ${baseCurrency}`)} (أقل كمية: {minQty}{maxQty > 0 ? `، أقصى كمية: ${maxQty}` : ''})
      </p>
      <div className="form-group" style={{ marginBottom: "20px" }}>
        <input
          type="number"
          min={minQty}
          max={maxQty > 0 ? maxQty : undefined}
          step="100"
          value={customQuantity}
          onFocus={() => {
            if (service?.price_type === "both") {
              setCustomerPricingMode("dynamic");
            }
          }}
          onChange={(e) => {
            if (service?.price_type === "both") {
              setCustomerPricingMode("dynamic");
            }
            const val = e.target.value === "" ? "" : parseInt(e.target.value);
            setCustomQuantity(val);
          }}
          onBlur={() => {
            if (!customQuantity || customQuantity < minQty) {
              setCustomQuantity(minQty);
            } else if (maxQty > 0 && customQuantity > maxQty) {
              setCustomQuantity(maxQty);
            }
          }}
          style={{
            padding: "16px 20px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            borderRadius: "14px",
            border: (service.price_type !== "both" || customerPricingMode === "dynamic") ? "2px solid #3b82f6" : "var(--border-glass)",
            background: "var(--input-bg)",
            color: "var(--text-main)",
            width: "100%",
            boxSizing: "border-box",
            outline: "none"
          }}
          placeholder="أدخل الكمية هنا (مثال: 5000)"
        />
        <div style={{ marginTop: "8px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
          السعر الإجمالي للكمية: <strong style={{ color: "#34d399", fontSize: "1.05rem" }}>
            {(() => {
              const usdPrice = ((Number(customQuantity) || 0) / 1000) * (service.price_per_thousand || 0);
              if (baseCurrency === 'USD' || baseCurrency === 'USDT') {
                return `$ ${usdPrice.toFixed(2)}`;
              }
              if (service.category_currency === 'USD' || service.category_currency === 'USDT') {
                const egpPrice = usdPrice * Number(exchangeRates?.["USD"] || 50);
                return `$ ${usdPrice.toFixed(2)} (ما يعادل ${egpPrice.toFixed(2)} ${baseCurrency})`;
              } else {
                return `${Number(usdPrice).toFixed(2)} ${baseCurrency}`;
              }
            })()}
          </strong>
        </div>
      </div>
    </div>
  );

  const isContinueEnabled = (service?.price_type === "dynamic" || (service?.price_type === "both" && customerPricingMode === "dynamic"))
    ? (Number(customQuantity) >= (service?.min_quantity || 100))
    : (selectedPackage !== null && (!selectedPackage.requires_quantity || Number(customQuantity) >= (selectedPackage.min_quantity || 1)));

  const checkoutPage = (
    <div className="glass-panel" style={{
      background: "var(--bg-glass)",
      border: "var(--border-glass)",
      borderRadius: "20px",
      padding: "clamp(16px, 4vw, 28px)",
      boxShadow: "var(--shadow-glass)",
      color: "var(--text-main)",
      width: "100%",
      maxWidth: "1050px",
      margin: "0 auto",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)"
    }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => setStep(1)}
        style={{
          color: "var(--primary-color)",
          fontWeight: "bold",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.9rem",
          marginBottom: "18px",
          padding: "6px 12px",
          borderRadius: "8px",
          border: "1px solid var(--bg-glass)",
          background: "var(--bg-glass)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-glass)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg-glass)";
        }}
      >
        <span>← العودة لتعديل الباقة</span>
      </button>

      {/* Header */}
      <div style={{ marginBottom: "24px", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "16px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>
          {fieldsSectionTitle}
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "6px", marginBottom: 0 }}>
          الخدمة المختارة: <strong style={{ color: "var(--primary-color)", fontWeight: "800" }}>{service.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="service-details-layout">

        {/* Main section: Col 1 */}
        <div className="checkout-main-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Step 1: Account Details */}
          {(activeFields.length > 0 || selectedPackage?.requires_quantity) && (
            <div className="glass-panel" style={{
              background: "rgba(255, 255, 255, 0.01)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid var(--bg-glass)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <h3 style={{ fontWeight: 800, margin: 0, fontSize: "1.1rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--primary-color)", color: "#fff", fontSize: "0.9rem", fontWeight: "bold" }}>١</span>
                البيانات المطلوبة:
              </h3>
              {activeFields.map((field, idx) => (
                <div className="form-group" key={field.name || idx} style={{ marginBottom: "0px" }}>
                  <label htmlFor={`field_${field.name}`} style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-muted)" }}>
                    {field.label}:
                  </label>
                  {field.type === "select" && field.options ? (
                    <select
                      id={`field_${field.name}`}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required !== false}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "0.9rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--input-bg)",
                        color: "var(--text-main)",
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--primary-color)";
                        e.target.style.background = "var(--bg-glass)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.background = "var(--input-bg)";
                      }}
                    >
                      <option value="" style={{ color: "var(--text-main)", background: "var(--bg-color)" }}>-- اختر --</option>
                      {(typeof field.options === 'string' ? field.options.split(',') : field.options).map((opt, i) => (
                        <option key={i} value={opt.trim()} style={{ color: "var(--text-main)", background: "var(--bg-color)" }}>{opt.trim()}</option>
                      ))}
                    </select>
                  ) : (field.name || "").toLowerCase().includes("imei") ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        id={`field_${field.name}`}
                        type="text"
                        maxLength="30"
                        placeholder="IMEI / SN / ECID"
                        value={formData[field.name] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '').toUpperCase();
                          handleFieldChange(field.name, val);
                        }}
                        required={field.required !== false}
                        style={{
                          flex: 1,
                          padding: "12px 14px",
                          fontSize: "1rem",
                          letterSpacing: "2px",
                          fontFamily: "monospace",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--input-bg)",
                          color: "var(--text-main)",
                          outline: "none",
                          transition: "all 0.2s ease",
                          textAlign: "center"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--primary-color)";
                          e.target.style.background = "var(--bg-glass)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border-color)";
                          e.target.style.background = "var(--input-bg)";
                        }}
                      />
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`field_${field.name}`}
                      placeholder={field.placeholder || ""}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required !== false}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "0.9rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--input-bg)",
                        color: "var(--text-main)",
                        outline: "none",
                        transition: "all 0.2s ease",
                        resize: "vertical"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--primary-color)";
                        e.target.style.background = "var(--bg-glass)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.background = "var(--input-bg)";
                      }}
                    />
                  ) : (
                    <input
                      id={`field_${field.name}`}
                      type={field.type || "text"}
                      placeholder={field.placeholder || ""}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required !== false}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        fontSize: "0.9rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--input-bg)",
                        color: "var(--text-main)",
                        outline: "none",
                        transition: "all 0.2s ease"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--primary-color)";
                        e.target.style.background = "var(--bg-glass)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.background = "var(--input-bg)";
                      }}
                    />
                  )}
                </div>
              ))}

              {selectedPackage?.requires_quantity && (
                <div className="form-group" style={{ marginBottom: "0px", marginTop: "4px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-muted)" }}>
                    الكمية (الحد الأدنى {selectedPackage.min_quantity || 1}{selectedPackage.max_quantity > 0 ? `، الحد الأقصى ${selectedPackage.max_quantity}` : ''}):
                  </label>
                  <input
                    type="number"
                    min={selectedPackage.min_quantity || 1}
                    max={selectedPackage.max_quantity > 0 ? selectedPackage.max_quantity : undefined}
                    value={customQuantity}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : parseInt(e.target.value);
                      setCustomQuantity(val);
                    }}
                    onBlur={() => {
                      const min = selectedPackage.min_quantity || 1;
                      const max = selectedPackage.max_quantity || 0;
                      if (!customQuantity || customQuantity < min) setCustomQuantity(min);
                      else if (max > 0 && customQuantity > max) setCustomQuantity(max);
                    }}
                    style={{
                      width: "100%", padding: "12px 14px", fontSize: "0.9rem", borderRadius: "10px",
                      border: "1px solid var(--border-color)", background: "var(--input-bg)",
                      color: "var(--text-main)", outline: "none", transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary-color)";
                      e.target.style.background = "var(--bg-glass)";
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Method */}
          <div className="glass-panel" style={{
            background: "rgba(255, 255, 255, 0.01)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--bg-glass)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h3 style={{ fontWeight: 800, margin: 0, fontSize: "1.1rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "26px", height: "26px", borderRadius: "50%", background: "var(--primary-color)", color: "#fff", fontSize: "0.9rem", fontWeight: "bold" }}>٢</span>
                طريقة الدفع:
              </h3>
              <span style={{ fontSize: "0.9rem", color: "var(--primary-color)", fontWeight: "bold" }}>
                المبلغ المستحق: {(() => {
                  const isUsd = service.category_currency === 'USD' || service.category_currency === 'USDT' || baseCurrency === 'USD' || baseCurrency === 'USDT';
                  let usdPrice = 0;
                  let egpPrice = 0;
                  const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);

                  if (service.price_type === "dynamic" || (service.price_type === "both" && customerPricingMode === "dynamic")) {
                    const computedUsd = (customQuantity / 1000) * (service.price_per_thousand || 0);
                    if (isUsd) {
                      usdPrice = computedUsd;
                      egpPrice = usdPrice * usdRate;
                    } else {
                      egpPrice = computedUsd;
                    }
                  } else if (selectedPackage) {
                    let multiplier = selectedPackage.requires_quantity ? (customQuantity || 1) : 1;
                    if (isUsd) {
                      // Use explicit null check so price=0 (free services) is NOT skipped by ||
                      const pkgUsdPrice = (selectedPackage.usd_price != null) ? Number(selectedPackage.usd_price) : Number(selectedPackage.price ?? 0);
                      usdPrice = pkgUsdPrice * multiplier;
                      egpPrice = usdPrice * usdRate;
                    } else {
                      egpPrice = Number(selectedPackage.price ?? 0) * multiplier;
                    }
                  }

                  if (baseCurrency === 'USD' || baseCurrency === 'USDT' || isUsd) {
                    return `$ ${usdPrice.toFixed(2)}`;
                  } else {
                    return `${egpPrice.toFixed(2)} ${baseCurrency}`;
                  }
                })()}
              </span>
            </div>

            <div style={{ display: "grid", gap: "10px", marginTop: "4px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: isCustomerLoggedIn ? "pointer" : "not-allowed",
                padding: "14px 16px",
                borderRadius: "12px",
                border: paymentMethod === "wallet" ? "2px solid #22c55e" : "1px solid var(--bg-glass)",
                background: paymentMethod === "wallet" ? "rgba(34, 197, 94, 0.06)" : "var(--bg-glass)",
                opacity: isCustomerLoggedIn ? 1 : 0.6,
                transition: "all 0.2s ease"
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  disabled={!isCustomerLoggedIn}
                  style={{ width: "18px", height: "18px", cursor: isCustomerLoggedIn ? "pointer" : "not-allowed" }}
                />
                <div style={{ flexGrow: 1 }}>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem", display: "block" }}>💳 دفع عبر محفظة الموقع الرقمية</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                    {isCustomerLoggedIn
                      ? `سيتم خصم القيمة من رصيدك تلقائياً. رصيدك الحالي: ${Number(customerUser?.balance || 0).toFixed(2)} ${baseCurrency}`
                      : "يرجى تسجيل الدخول أولاً لتتمكن من استخدام المحفظة."}
                  </span>
                </div>
              </label>

              <Link href="/wallet" className="glass-btn" style={{ justifyContent: "center", textDecoration: "none", padding: "12px 16px", borderRadius: "12px", fontWeight: 800 }}>
                شحن رصيد المحفظة
              </Link>

              {false && !hideManualTransfersSetting && paymentMethods.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <label key={pm.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid var(--bg-glass)",
                    background: isSelected ? "rgba(59, 130, 246, 0.06)" : "var(--bg-glass)",
                    transition: "all 0.2s ease"
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(pm.id)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <strong style={{ color: "var(--text-main)", fontSize: "0.95rem", display: "block" }}>💸 تحويل يدوي مباشر: {pm.name}</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                        {pm.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {false && paymentMethod !== "wallet" && (
              (() => {
                const currentPM = paymentMethods.find(pm => pm.id === paymentMethod) || paymentMethods[0];
                if (!currentPM) return null;
                return (
                  <div style={{ marginTop: "14px", borderTop: "1px solid var(--bg-glass)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>

                    {/* Clipboard copy box */}
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(59, 130, 246, 0.05)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      color: "#38bdf8",
                      fontSize: "0.88rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}>
                      <span>بيانات الاستلام للتحويل: <strong style={{ color: "#ffffff", direction: "ltr", display: "inline-block", fontSize: "1rem", userSelect: "all", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--bg-glass)", fontWeight: "bold" }}>{currentPM.value}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentPM.value);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          background: copied ? "#10b981" : "#3b82f6",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "all 0.2s"
                        }}
                      >
                        {copied ? "تم النسخ! ✓" : "نسخ الرقم 📋"}
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: "0px" }}>
                      <label htmlFor="senderPhone" style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-muted)" }}>
                        الرقم أو اسم الحساب الذي تم التحويل منه *إجباري*:
                      </label>
                      <input
                        id="senderPhone"
                        type="text"
                        placeholder="مثال: 01023456789 أو اسم الحساب"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          fontSize: "0.9rem",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--input-bg)",
                          color: "var(--text-main)",
                          outline: "none",
                          transition: "all 0.2s"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--primary-color)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border-color)";
                        }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "0px" }}>
                      <label htmlFor="transferAmount" style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-muted)" }}>
                        المبلغ الذي قمت بتحويله فعلياً ({baseCurrency}) *إجباري*:
                      </label>
                      <input
                        id="transferAmount"
                        type="number"
                        step="any"
                        placeholder="أدخل المبلغ المحول بالضبط (مثال: 150)"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          fontSize: "0.9rem",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--input-bg)",
                          color: "var(--text-main)",
                          outline: "none",
                          transition: "all 0.2s"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--primary-color)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border-color)";
                        }}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: "0px" }}>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        ارفع صورة إيصال التحويل (لقطة شاشة) *إجباري*:
                      </label>
                      <div style={{ position: "relative", width: "100%" }}>
                        <label htmlFor="receipt-upload" style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          width: "100%",
                          padding: "16px",
                          borderRadius: "10px",
                          border: "2px dashed var(--bg-hover)",
                          background: "var(--bg-glass)",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          textAlign: "center",
                          transition: "all 0.2s"
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--primary-color)";
                            e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--bg-hover)";
                            e.currentTarget.style.background = "var(--bg-glass)";
                          }}
                        >
                          <span>📁 {receiptImage ? "✓ تغيير صورة الإيصال" : "اختر صورة إيصال التحويل أو اسحبها هنا"}</span>
                        </label>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptChange}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer"
                          }}
                          required
                        />
                      </div>
                      {receiptImage && (
                        <div style={{ marginTop: "10px", textAlign: "right" }}>
                          <img src={receiptImage} alt="Receipt Preview" style={{ maxWidth: "120px", maxHeight: "120px", borderRadius: "10px", border: "1px solid var(--bg-hover)" }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Side section: Col 2 */}
        <div className="checkout-side-section" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Summary Box */}
          <div className="glass-panel" style={{
            background: "rgba(255, 255, 255, 0.01)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid var(--bg-glass)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <h3 style={{ fontWeight: 800, margin: 0, fontSize: "1.1rem", color: "var(--text-main)", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "10px" }}>
              📋 ملخص الطلب
            </h3>

            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--bg-glass)", paddingBottom: "8px", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>الخدمة</span>
              <strong style={{ color: "var(--text-main)" }}>{service.name}</strong>
            </div>

            {(service.price_type === "dynamic" || (service.price_type === "both" && customerPricingMode === "dynamic")) ? (
              <>
                <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--bg-glass)", paddingBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>الكمية المطلوبة</span>
                  <strong style={{ color: "var(--text-main)" }}>{customQuantity} وحدة</strong>
                </div>
                <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--bg-glass)", paddingBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>سعر الـ 1000 وحدة</span>
                  <strong style={{ color: "var(--text-main)" }}>{Number(service.price_per_thousand || 0).toFixed(2)} {baseCurrency}</strong>
                </div>
              </>
            ) : (
              selectedPackage && (
                <>
                  <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--bg-glass)", paddingBottom: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>الباقة المختارة</span>
                    <strong style={{ color: "var(--text-main)", maxWidth: "160px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={selectedPackage.name}>{selectedPackage.name}</strong>
                  </div>
                  {/* سعر الباقة removed as requested */}
                </>
              )
            )}

            {activeFields.map((field, idx) => (
              <div className="summary-row" key={field.name || idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--bg-glass)", paddingBottom: "8px", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>{field.label}</span>
                <strong style={{ color: "var(--text-main)", wordBreak: "break-all" }}>{formData[field.name] || "---"}</strong>
              </div>
            ))}

            <div className="summary-row" style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingTop: "12px", borderTop: "2px solid var(--bg-hover)", alignItems: "center" }}>
              <span style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-main)" }}>الإجمالي المستحق</span>
              <strong style={{ fontSize: "1.25rem", color: "#22c55e", textShadow: "0 0 10px rgba(34, 197, 94, 0.2)" }}>
                {(() => {
                  const isUsd = service.category_currency === 'USD' || service.category_currency === 'USDT' || baseCurrency === 'USD' || baseCurrency === 'USDT';
                  let usdPrice = 0;
                  let egpPrice = 0;
                  const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);

                  if (service.price_type === "dynamic" || (service.price_type === "both" && customerPricingMode === "dynamic")) {
                    const computedUsd = (customQuantity / 1000) * (service.price_per_thousand || 0);
                    if (isUsd) {
                      usdPrice = computedUsd;
                      egpPrice = usdPrice * usdRate;
                    } else {
                      egpPrice = computedUsd;
                    }
                  } else if (selectedPackage) {
                    let multiplier = selectedPackage.requires_quantity ? (customQuantity || 1) : 1;
                    if (isUsd) {
                      usdPrice = (selectedPackage.usd_price || selectedPackage.price) * multiplier;
                      egpPrice = usdPrice * usdRate;
                    } else {
                      egpPrice = (selectedPackage.price) * multiplier;
                    }
                  }

                  if (baseCurrency === 'USD' || baseCurrency === 'USDT' || isUsd) {
                    return `$ ${usdPrice.toFixed(2)}`;
                  } else {
                    return `${egpPrice.toFixed(2)} ${baseCurrency}`;
                  }
                })()}
              </strong>
            </div>

            <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.6", background: "var(--bg-glass)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--bg-glass)" }}>
              📢 {(selectedPackage?.api_delivery_time || activeService?.api_delivery_time || service?.api_delivery_time) ? `مدة التنفيذ المتوقعة: ${selectedPackage?.api_delivery_time || activeService?.api_delivery_time || service?.api_delivery_time}` : 'بمجرد إتمام الطلب، سيتم مراجعة الدفع وتنفيذ الخدمة في غضون وقت قصير.'}
            </div>
          </div>

          {errorMessage && (
            <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.08)", borderRight: "4px solid #ef4444", color: "#f87171", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "bold" }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.05rem",
              fontWeight: "bold",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: submitting ? "not-allowed" : "pointer",
              background: submitting ? "var(--text-muted)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#ffffff",
              border: "none",
              boxShadow: submitting ? "none" : "0 8px 25px rgba(37,99,235,0.3)",
              transition: "all 0.2s"
            }}
          >
            {submitting ? (
              <>
                <span className="spinner-loader" style={{ borderTopColor: "#fff" }}></span>
                <span>جاري إرسال طلبك...</span>
              </>
            ) : (
              "تأكيد وإرسال طلب الخدمة"
            )}
          </button>
        </div>

      </form>
    </div>
  );

  return (
    <>
      <style>{`
        .spinner-loader {
          width: 18px;
          height: 18px;
          border: 3.5px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin-loader 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin-loader {
          to { transform: rotate(360deg); }
        }
        
        .success-ring-pulse {
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.12);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
          animation: pulse-ring 2s infinite;
          margin-bottom: 20px;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
      `}</style>

      {step === 1 ? (
        <div className="service-details-layout" style={{ gridTemplateColumns: "1fr" }}>
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {isCustomerLoggedIn && customerUser && (
              <div style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                padding: "12px 18px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.95rem",
                color: "#38bdf8",
                flexWrap: "wrap"
              }}>
                <span style={{ fontSize: "1.1rem" }}>👤</span>
                <span>أنت تقوم بالشراء بحساب: <strong>{customerUser.username}</strong></span>
                {typeof customerUser.balance === "number" && (
                  <span style={{ marginInlineStart: "auto", background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", padding: "4px 10px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.82rem" }}>
                    رصيد محفظتك: {customerUser.balance.toFixed(2)} {baseCurrency}
                  </span>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: hasImage ? "20px" : "0px", alignItems: "center" }}>
              {hasImage && (
                <div className="service-icon" style={{ width: "80px", height: "80px", borderRadius: "24px", fontSize: "2.4rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getServiceIcon(service.image, service.name)}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>{service.name}</h1>
              </div>
            </div>

            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.7" }}>{localizeServiceText(service.description)}</p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px"
            }}>
              <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.16)" }}>
                <strong style={{ display: "block", color: "#4ade80", marginBottom: "6px", fontSize: "0.9rem" }}>{t("executionTime")}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
                  {localizeServiceText(selectedPackage?.api_delivery_time || activeService?.api_delivery_time || service?.api_delivery_time) || t("executionStartsAfterPayment")}
                </span>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.16)" }}>
                <strong style={{ display: "block", color: "#60a5fa", marginBottom: "6px", fontSize: "0.9rem" }}>{t("guarantee")}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
                  {t("orderReviewGuarantee")}
                </span>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.16)" }}>
                <strong style={{ display: "block", color: "#fbbf24", marginBottom: "6px", fontSize: "0.9rem" }}>{t("requiredData")}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
                  {activeFields.length > 0
                    ? activeFields.map((field) => field.label || field.name).join(language === "ar" ? "، " : ", ")
                    : t("requiredDataAfterPackage")}
                </span>
              </div>
            </div>

            {service.download_link && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.88rem", fontWeight: "bold" }}>📥 رابط تحميل الأداة:</span>
                <a
                  href={service.download_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(56, 189, 248, 0.1)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#38bdf8",
                    fontWeight: "bold",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    fontSize: "0.85rem"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
                  }}
                >
                  {service.download_link_title || "تحميل الأداة"}
                </a>
              </div>
            )}

            <hr style={{ opacity: 0.1 }} />

            <div>
              {service.price_type === "both" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                  <div
                    onClick={() => setCustomerPricingMode("packages")}
                    style={{
                      border: customerPricingMode === "packages" ? "2px solid #3b82f6" : "1px solid var(--bg-glass)",
                      borderRadius: "16px",
                      padding: "20px 16px 16px 16px",
                      background: customerPricingMode === "packages" ? "rgba(59, 130, 246, 0.05)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <input
                        type="radio"
                        name="pricing_mode_selector"
                        checked={customerPricingMode === "packages"}
                        onChange={() => setCustomerPricingMode("packages")}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <strong style={{ fontSize: "1.05rem", color: customerPricingMode === "packages" ? "#3b82f6" : "var(--text-main)" }}>
                        📦 الخيار الأول: اختر باقة شحن جاهزة
                      </strong>
                    </div>

                    <div style={{
                      opacity: customerPricingMode === "packages" ? 1 : 0.6,
                      pointerEvents: customerPricingMode === "packages" ? "auto" : "none",
                      transition: "opacity 0.2s"
                    }}>
                      {packagesSection}
                    </div>
                  </div>

                  <div
                    onClick={() => setCustomerPricingMode("dynamic")}
                    style={{
                      border: customerPricingMode === "dynamic" ? "2px solid #3b82f6" : "1px solid var(--bg-glass)",
                      borderRadius: "16px",
                      padding: "20px 16px 16px 16px",
                      background: customerPricingMode === "dynamic" ? "rgba(59, 130, 246, 0.05)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <input
                        type="radio"
                        name="pricing_mode_selector"
                        checked={customerPricingMode === "dynamic"}
                        onChange={() => setCustomerPricingMode("dynamic")}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <strong style={{ fontSize: "1.05rem", color: customerPricingMode === "dynamic" ? "#3b82f6" : "var(--text-main)" }}>
                        ⚡ الخيار الثاني: الشحن بالكمية المخصصة (حسب الطلب)
                      </strong>
                    </div>

                    <div style={{
                      opacity: customerPricingMode === "dynamic" ? 1 : 0.6,
                      transition: "opacity 0.2s"
                    }}>
                      {customQuantitySection}
                    </div>
                  </div>
                </div>
              ) : (
                service.price_type === "dynamic" ? customQuantitySection : packagesSection
              )}
            </div>

            <hr style={{ opacity: 0.1 }} />

            {/* Continue to Checkout Button */}
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <button
                type="button"
                disabled={!isContinueEnabled}
                onClick={() => {
                  if (!isCustomerLoggedIn) {
                    goToLoginForOrder();
                    return;
                  }
                  setPaymentMethod("wallet");
                  setStep(2);
                  trackConversion("checkout_started", {
                    serviceId,
                    packageId: selectedPackage?.id || "dynamic",
                    guest: false,
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="glass-btn glass-btn-primary"
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "1.15rem",
                  fontWeight: "800",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: isContinueEnabled ? "pointer" : "not-allowed",
                  opacity: isContinueEnabled ? 1 : 0.5,
                  boxShadow: isContinueEnabled ? "0 8px 25px rgba(59, 130, 246, 0.4)" : "none",
                  transition: "all 0.3s ease"
                }}
              >
                <span>{t("continueToCheckout")} {isContinueEnabled && (
                  <span>({(() => {
                    const isUsd = service.category_currency === 'USD' || service.category_currency === 'USDT' || baseCurrency === 'USD' || baseCurrency === 'USDT';
                    let usdPrice = 0;
                    let egpPrice = 0;
                    const usdRate = (baseCurrency === 'USD' || baseCurrency === 'USDT') ? 1 : Number(exchangeRates?.["USD"] || 50);

                    if (service.price_type === "dynamic" || (service.price_type === "both" && customerPricingMode === "dynamic")) {
                      const computedUsd = (customQuantity / 1000) * (service.price_per_thousand || 0);
                      if (isUsd) {
                        usdPrice = computedUsd;
                        egpPrice = usdPrice * usdRate;
                      } else {
                        egpPrice = computedUsd;
                      }
                    } else if (selectedPackage) {
                      if (isUsd) {
                        usdPrice = selectedPackage.usd_price || selectedPackage.price;
                        egpPrice = usdPrice * usdRate;
                      } else {
                        egpPrice = selectedPackage.price;
                      }
                    }

                    if (baseCurrency === 'USD' || baseCurrency === 'USDT' || isUsd) {
                      return `$ ${usdPrice.toFixed(2)}`;
                    } else {
                      return `${egpPrice.toFixed(2)} ج.م`;
                    }
                  })()})</span>
                )}</span>
                <span style={{ fontSize: "1.2rem" }}>{meta.dir === "rtl" ? "←" : "→"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="service-details-layout" style={{ gridTemplateColumns: "1fr" }}>
          {checkoutPage}
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, padding: "20px", backdropFilter: "blur(8px)" }}>
          <div className="modal-content" style={{
            textAlign: "center",
            padding: "30px clamp(12px, 5vw, 24px)",
            width: "95%",
            maxWidth: "650px",
            borderRadius: "30px",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid var(--bg-hover)",
            boxShadow: "0 25px 50px -12px var(--bg-secondary), 0 0 40px rgba(59, 130, 246, 0.15)",
            backdropFilter: "blur(16px)"
          }}>
            <div className="success-ring-pulse">
              <span style={{ fontSize: "3rem", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>✓</span>
            </div>

            <h2 style={{ fontWeight: 800, fontSize: "1.8rem", color: "#ffffff", marginBottom: "10px" }}>تم استلام طلبك بنجاح!</h2>
            <p style={{ margin: "0 auto 30px auto", maxWidth: "480px", lineHeight: "1.6", color: "#94a3b8", fontSize: "0.95rem" }}>
              شكراً لثقتك بـ <strong style={{ color: "#38bdf8" }}>عرب تك</strong>. تم استلام وتسجيل طلب الخدمة الخاص بك وهو الآن قيد التنفيذ التلقائي الفوري.
            </p>

            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
              border: "1px solid var(--bg-glass)",
              padding: "24px",
              borderRadius: "20px",
              textAlign: "right",
              marginBottom: "24px",
              boxShadow: "inset 0 2px 4px var(--bg-secondary)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.2rem" }}>📄</span>
                <strong style={{ color: "#e2e8f0", fontSize: "1.05rem" }}>تفاصيل فاتورة الخدمة</strong>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px 20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>رقم الطلب:</span>
                  <strong style={{ color: "#38bdf8" }}>#{successData.id}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>الخدمة:</span>
                  <strong style={{ color: "#f1f5f9" }}>{successData.service_name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>الباقة / الكمية:</span>
                  <strong style={{ color: "#f1f5f9" }}>{successData.package_name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>القيمة المستحقة:</span>
                  <strong style={{ color: "#4ade80", fontSize: "1.05rem" }}>
                    {baseCurrency === 'USD' || baseCurrency === 'USDT'
                      ? `${Number(successData.package_price).toFixed(2)} ${baseCurrency}`
                      : (service.category_currency === 'USD' || service.category_currency === 'USDT'
                        ? `$ ${Number((successData.package_price) / (Number(exchangeRates?.["USD"] || 50))).toFixed(2)}`
                        : `${Number(successData.package_price).toFixed(2)} ${baseCurrency}`)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px", gridColumn: "1 / -1" }}>
                  <span style={{ color: "#94a3b8" }}>حساب الخدمة (Player ID):</span>
                  <strong style={{ color: "#22d3ee", direction: "ltr", display: "inline-block", letterSpacing: "0.5px" }}>{successData.player_id}</strong>
                </div>
                {successData.sender_phone && (
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px", gridColumn: "1 / -1" }}>
                    <span style={{ color: "#94a3b8" }}>الرقم المحول منه:</span>
                    <strong style={{ color: "#e2e8f0", direction: "ltr" }}>{successData.sender_phone}</strong>
                  </div>
                )}
                {successData.receipt_image && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "12px", textAlign: "right" }}>
                    <span style={{ color: "#94a3b8" }}>صورة إيصال التحويل المرفقة:</span>
                    <div style={{ marginTop: "4px" }}>
                      <img
                        src={`${API_BASE_URL}${successData.receipt_image}`}
                        alt="Receipt Screenshot"
                        style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "10px", border: "1px solid var(--border-color)", cursor: "pointer" }}
                        onClick={() => window.open(`${API_BASE_URL}${successData.receipt_image}`, '_self')}
                        title="انقر لفتح الصورة في نفس الصفحة"
                      />
                    </div>
                  </div>
                )}
                {typeof successData.customer_balance === "number" && (
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>الرصيد المتبقي:</span>
                    <strong style={{ color: "#86efac" }}>{successData.customer_balance.toFixed(2)} {baseCurrency}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--bg-glass)", paddingBottom: "8px" }}>
                  <span style={{ color: "#94a3b8" }}>الحالة:</span>
                  <span style={{ color: "#4ade80", background: "rgba(74, 222, 128, 0.1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold" }}>قيد الانتظار (سيتم التنفيذ فوراً)</span>
                </div>
              </div>

              {/* Payment Method Details inside Receipt */}
              <div style={{
                marginTop: "20px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--bg-glass)",
                border: "1px solid var(--bg-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>طريقة الدفع ومستلم التحويل:</span>
                {successData.payment_method === "wallet" ? (
                  <strong style={{ color: "#60a5fa" }}>المحفظة الشخصية للموقع</strong>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                    <span style={{ color: "#f1f5f9", fontWeight: "bold" }}>تحويل يدوي إلى الرقم:</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <strong style={{
                        color: "#ffffff",
                        background: "#1e293b",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        direction: "ltr",
                        display: "inline-block",
                        fontSize: "0.95rem",
                        userSelect: "all",
                        fontWeight: "bold",
                        letterSpacing: "0.5px"
                      }}>
                        {successData.transfer_to}
                      </strong>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(successData.transfer_to);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          background: copied ? "#22c55e" : "#3b82f6",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {copied ? "تم النسخ ✓" : "نسخ 📋"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Speed up buttons */}
              <div style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontWeight: "bold", fontSize: "0.95rem", justifyContent: "center" }}>
                  <span>⚡</span>
                  <span>لتسريع تنفيذ الطلب فوراً تواصل مع واتساب الإدارة:</span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    href={getSpeedUpWhatsAppUrl("16728972935", successData, customerUser?.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn"
                    style={{ flex: "1 1 200px", padding: "12px 14px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#ffffff", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <span>🟢 إدارة 1 (+1 672-897-2935)</span>
                  </a>
                  <a
                    href={getSpeedUpWhatsAppUrl("249123667227", successData, customerUser?.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn"
                    style={{ flex: "1 1 200px", padding: "12px 14px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.4)", color: "#ffffff", fontWeight: "bold", textAlign: "center", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <span>🟢 إدارة 2 (+249 12-366-7227)</span>
                  </a>
                </div>
              </div>

            </div>

            <button
              className="glass-btn glass-btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "1.05rem", borderRadius: "14px", fontWeight: "bold" }}
              onClick={() => {
                if (service?.category_id) {
                  router.push(`/category/${service.category_id}`);
                } else {
                  router.push("/");
                }
              }}
            >
              العودة لقسم الخدمة
            </button>
          </div>
        </div>
      )}
    </>
  );
}
