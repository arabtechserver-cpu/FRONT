"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { shouldShowDefaultImeiField, getProviderCustomFields, isProviderQuantityField as isQuantityField, supportsProviderQuantity, isPrimaryTargetCustomField } from "../../../../lib/purchase-service-fields";
import { cleanHtmlToText, stripEmojis } from "@/utils/cleanHtml";

function PurchaseClientContent({ lang, dict }: { lang: string, dict: any }) {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get("serviceId");

  const [userSession, setUserSession] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);

  // Dhru Services & Categories from Backend API
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || "");
  const [serviceDetailsById, setServiceDetailsById] = useState<Record<string, any>>({});
  const [loadedServiceDetails, setLoadedServiceDetails] = useState<Record<string, boolean>>({});

  // Order Submission Form Fields
  const [targetInput, setTargetInput] = useState<string>("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showServiceInfo, setShowServiceInfo] = useState<boolean>(false);

  // Coupon Code States
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Active Viewers & Fake 10% Discount States (رقم ثابت ومريح بدون اهتزاز)
  const [activeViewers, setActiveViewers] = useState<number>(60);
  const [discountTimeLeft, setDiscountTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 14, seconds: 35 });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Success Confirmation Modal Data
  const [successOrderModalData, setSuccessOrderModalData] = useState<{
    orderId: string;
    serviceName: string;
    targetInput: string;
    price: number;
    newBalance: number;
  } | null>(null);

  const extractLimitsFromText = (text: string): { min: number | null; max: number | null } => {
    if (!text || typeof text !== 'string') return { min: null, max: null };
    let min: number | null = null;
    let max: number | null = null;

    // استبعاد نصوص أوقات التسليم لتجنب اعتباره كحدود كمية (مثل 1-24 Hours أو 1-3 Days)
    const sanitized = text.replace(/\b\d+\s*[-–—]\s*\d+\s*(?:hours?|hrs?|days?|minutes?|mins?|ساعة|ساعات|يوم|أيام|دقيقة|دقائق)\b/gi, '');

    const minMatch =
      sanitized.match(/(?:qnt_min|min_qnt|min\s*qnt|minimum\s*qnt|min\s*quantity|minimum\s*quantity|أقل\s*كمية|اقل\s*كمية|الحد\s*الأدنى\s*للكمية|الحد\s*الادنى\s*للكمية|أدنى\s*كمية)[:\s]*([0-9]+)/i);
    if (minMatch && minMatch[1]) min = parseInt(minMatch[1], 10);

    const maxMatch =
      sanitized.match(/(?:qnt_max|max_qnt|max\s*qnt|maximum\s*qnt|max\s*quantity|maximum\s*quantity|أقصى\s*كمية|اقصى\s*كمية|الحد\s*الأقصى\s*للكمية|الحد\s*الاقصى\s*للكمية|أعلى\s*كمية)[:\s]*([0-9]+)/i);
    if (maxMatch && maxMatch[1]) max = parseInt(maxMatch[1], 10);

    if (min === null && max === null) {
      const explicitRangeMatch = sanitized.match(/\bmin[:\s]*([0-9]+)\s*[-–—,]\s*max[:\s]*([0-9]+)\b/i);
      if (explicitRangeMatch && explicitRangeMatch[1] && explicitRangeMatch[2]) {
        min = parseInt(explicitRangeMatch[1], 10);
        max = parseInt(explicitRangeMatch[2], 10);
      }
    }
    return { min, max };
  };

  // Helper to extract options list for select/dropdown fields — يقرأ من بيانات Dhru API الحقيقية
  const extractFieldOptions = (key: string, fieldObj: any): string[] => {
    let options: string[] = [];
    const raw = fieldObj?.options ?? fieldObj?.fieldoptions ?? fieldObj?.FIELDOPTIONS ?? fieldObj?.Options;

    if (Array.isArray(raw)) {
      options = raw
        .map((item: any) => {
          if (typeof item === 'string') return item.trim();
          if (item?.value !== undefined) return String(item.value).trim();
          if (item?.label !== undefined) return String(item.label).trim();
          return String(item).trim();
        })
        .filter(Boolean);
    } else if (typeof raw === 'string' && raw.trim()) {
      if (raw.includes('Router Beeline')) {
        options = ['Router Beeline TC-100', 'Router Beeline TC-150'];
      } else {
        options = raw.split(/\\n|[\r\n,|]+/).map((s: string) => s.trim()).filter(Boolean);
      }
    }

    return options;
  };

  const getLocalizedFieldLabel = (rawKey: string, fieldObj: any, lang: string): string => {
    const raw = fieldObj?.label || fieldObj?.fieldname || fieldObj?.reqid || fieldObj?.name || rawKey;
    const clean = String(raw).replace(/^custom_/i, '').trim();
    const lower = clean.toLowerCase();

    if (lang === 'ar') {
      if (lower === 'email' || lower === 'user email' || lower === 'user_email' || lower === 'e-mail') return 'البريد الإلكتروني (Email)';
      if (lower === 'username' || lower === 'user name' || lower === 'user_name' || lower === 'login' || lower === 'targetlogin') return 'اسم المستخدم (Username / Login)';
      if (lower === 'password' || lower === 'pass' || lower === 'user password') return 'كلمة المرور (Password)';
      if (lower === 'ecid' || lower === 'ecid copy from tool') return 'رقم الـ ECID (من الأداة)';
      if (lower === 'serial number' || lower === 'serial_number' || lower === 'sn' || lower === 'serial' || lower === 'serial no') return 'الرقم التسلسلي للجهاز (Serial Number)';
      if (lower === 'imei' || lower === 'imei number') return 'رقم الـ IMEI (15 رقم)';
      if (lower === 'sn or imei' || lower === 'imei/sn' || lower === 'sn / imeis' || lower === 'serial number or imei' || lower === 'imei or serial number' || lower === 'imei or sn') return 'رقم IMEI أو Serial Number';
      if (lower === 'model' || lower === 'model no') return 'موديل الجهاز (Model)';
      if (lower === 'lock code' || lower === 'code lock' || lower === 'keylock' || lower === 'lock code / imei') return 'رمز القفل (Lock Code)';
      if (lower.includes('battery') && (lower.includes('picture') || lower.includes('photo') || lower.includes('link') || lower.includes('image'))) return 'رابط صورة البطارية (Battery Picture Link)';
      if (lower.includes('lock screen photo') || lower.includes('lock screen')) return 'رابط صورة شاشة القفل (Lock Screen Photo)';
      if (lower.includes('screenshot') || lower.includes('screen shot')) return 'رابط لقطة الشاشة (Screenshot Link)';
      if (lower.includes('picture') || lower.includes('photo') || lower.includes('image link')) return 'رابط الصورة المطلوبة (Image / Photo Link)';
      if (lower.includes('video link') || lower.includes('video')) return 'رابط فيديو الإثبات (Video Link)';
      if (lower === 'checker report' || lower === 'link proof') return 'تقرير الفحص أو الإثبات (Report / Proof)';
      if (lower === 'apple id' || lower === 'icloud email id' || lower === 'apple id email') return 'حساب أبل (Apple ID / iCloud Email)';
      if (lower.includes('apple id hint') || lower.includes('link apple id hint')) return 'تلميح حساب أبل (Apple ID Hint Link)';
      if (lower === 'country' || lower === 'current country') return 'الدولة الحالية للجهاز (Country)';
      if (lower === 'mobile' || lower === 'phonenumber' || lower === 'whatsapp number') return 'رقم الهاتف / واتساب (Phone Number)';
      if (lower.includes('anydesk') || lower.includes('any desk') || lower.includes('ultra viewer') || lower.includes('ultraview')) return 'معرف وبيانات AnyDesk / UltraViewer';
      if (lower === 'playerid') return 'معرف اللاعب (Player ID)';
      if (lower === 'account id' || lower === 'userid') return 'معرف الحساب (Account ID / User ID)';
      if (lower === 'hardware id' || lower === 'hwid' || lower === 'machine id' || lower === 'processor id' || lower === 'fingerprint') return 'المعرف الصلب للجهاز (HWID / Machine ID)';
      if (lower === 'license key' || lower === 'domain name' || lower === 'workspace') return 'مفتاح الترخيص / النطاق (License / Domain)';
    }

    return clean;
  };

  const isLongTextField = (rawKey: string, fieldObj: any): boolean => {
    const raw = (fieldObj?.label || fieldObj?.fieldname || fieldObj?.reqid || fieldObj?.name || rawKey).toLowerCase();
    return raw.includes('report') || raw.includes('proof') || raw.includes('questions') || raw.includes('comments') || raw.includes('notes') || raw.includes('bulk') || raw.includes('link');
  };

  const getFieldIdentityText = (key: string, fieldObj: any): string => {
    return [
      key,
      fieldObj?.label,
      fieldObj?.fieldname,
      fieldObj?.reqid,
      fieldObj?.name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const isPrimaryImeiProviderField = (key: string, fieldObj: any): boolean => {
    return isPrimaryTargetCustomField(key, fieldObj);
  };

  // 1. Load User Session & Sync Live Balance
  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setUserBalance(parseFloat(parsed.balance || 0));

        if (parsed.email || parsed.id) {
          const token = localStorage.getItem("user_token");
          const queryParam = parsed.id ? `userId=${encodeURIComponent(parsed.id)}` : `email=${encodeURIComponent(parsed.email)}`;
          const headers: Record<string, string> = {};
          if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
          }
          fetch(`/api/users/profile?${queryParam}`, {
            headers,
            credentials: "include"
          })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUserBalance(data.user.balance);
                const updatedSession = { ...parsed, balance: data.user.balance };
                localStorage.setItem("user_session", JSON.stringify(updatedSession));
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    }
  }, []);

  // Real-time Active Viewers (تحديث هادئ ومتباعد دون اهتزاز أو تحريك للشاشة)
  useEffect(() => {
    let base = 60;
    if (selectedServiceId) {
      let hash = 0;
      for (let i = 0; i < selectedServiceId.length; i++) {
        hash = (hash << 5) - hash + selectedServiceId.charCodeAt(i);
      }
      base = 58 + (Math.abs(hash) % 5); // 58 to 62
    }
    setActiveViewers(base);

    let current = base;
    let timerId: any = null;

    const tick = () => {
      // سرعة التحديث هادئة ومتباعدة: كل 12 إلى 20 ثانية لتجنب أي إزعاج أو اهتزاز
      const delay = Math.floor(Math.random() * 8000) + 12000;
      timerId = setTimeout(() => {
        const step = Math.random() < 0.7 ? 1 : 2;
        let direction = 1;
        const randDir = Math.random();
        if (current <= 52) {
          direction = 1;
        } else if (current >= 72) {
          direction = -1;
        } else {
          direction = randDir < 0.5 ? 1 : -1;
        }

        current = Math.max(50, Math.min(74, current + step * direction));
        setActiveViewers(current);

        tick();
      }, delay);
    };

    tick();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [selectedServiceId]);

  // Fake 10% Discount Countdown Timer (مؤقت تنازلي ذكي متصل بـ sessionStorage)
  useEffect(() => {
    const STORAGE_KEY = "arabtech_discount_10_timer";
    let targetTime: number;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (stored) {
        targetTime = parseInt(stored, 10);
        if (isNaN(targetTime) || targetTime <= now) {
          targetTime = now + (14 * 60 + 45) * 1000;
          sessionStorage.setItem(STORAGE_KEY, targetTime.toString());
        }
      } else {
        targetTime = now + (14 * 60 + 45) * 1000;
        sessionStorage.setItem(STORAGE_KEY, targetTime.toString());
      }
    } catch {
      targetTime = Date.now() + (14 * 60 + 45) * 1000;
    }

    const updateTimer = () => {
      const remainingMs = targetTime - Date.now();
      if (remainingMs <= 0) {
        const nextTarget = Date.now() + (8 * 60 + 30) * 1000;
        try {
          sessionStorage.setItem(STORAGE_KEY, nextTarget.toString());
        } catch {}
        setDiscountTimeLeft({ minutes: 8, seconds: 30 });
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        setDiscountTimeLeft({ minutes: m, seconds: s });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Available Services & Groups from Backend API
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategoriesList(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch only the selected service's heavy fields instead of loading them for every service.
  useEffect(() => {
    if (!selectedServiceId || loadedServiceDetails[selectedServiceId]) return;

    let active = true;
    fetch(`/api/dhru/services/${encodeURIComponent(selectedServiceId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch service details");
        return res.json();
      })
      .then((service) => {
        if (active) {
          setServiceDetailsById((prev) => ({ ...prev, [selectedServiceId]: service }));
        }
      })
      .catch((err) => console.error("Failed to fetch selected service details:", err))
      .finally(() => {
        if (active) {
          setLoadedServiceDetails((prev) => ({ ...prev, [selectedServiceId]: true }));
        }
      });

    return () => {
      active = false;
    };
  }, [loadedServiceDetails, selectedServiceId]);

  // 3. Auto Sync Category & Service Selection from Query Param (serviceId)
  useEffect(() => {
    if (categoriesList.length > 0) {
      if (initialServiceId) {
        let matched = false;
        for (const group of categoriesList) {
          const found = (group.services || []).find((s: any) => s.id === initialServiceId);
          if (found) {
            setSelectedCategoryId(group.id);
            setSelectedServiceId(found.id);
            matched = true;
            break;
          }
        }
        if (!matched && categoriesList[0]) {
          setSelectedCategoryId(categoriesList[0].id);
          if (categoriesList[0].services?.[0]) {
            setSelectedServiceId(categoriesList[0].services[0].id);
          }
        }
      } else if (!selectedCategoryId) {
        setSelectedCategoryId(categoriesList[0].id);
        if (categoriesList[0].services?.[0]) {
          setSelectedServiceId(categoriesList[0].services[0].id);
        }
      }
    }
  }, [initialServiceId, categoriesList]);

  // Dynamic category and service derivation with auto-category sync
  let selectedCategory = categoriesList.find(c => c.id === selectedCategoryId);
  let availableServices = selectedCategory?.services || [];
  let selectedService = availableServices.find((s: any) => s.id === selectedServiceId);
  const selectedServiceDetails = selectedServiceId ? serviceDetailsById[selectedServiceId] : null;

  // If selectedServiceId is in a different category, auto-find & sync
  if (!selectedService && selectedServiceId) {
    for (const group of categoriesList) {
      const found = (group.services || []).find((s: any) => s.id === selectedServiceId);
      if (found) {
        selectedService = found;
        selectedCategory = group;
        availableServices = group.services || [];
        break;
      }
    }
  }

  if (!selectedCategory && categoriesList.length > 0) {
    selectedCategory = categoriesList[0];
    availableServices = selectedCategory?.services || [];
  }

  if (!selectedCategory && selectedServiceDetails?.dhruCategory) {
    selectedCategory = selectedServiceDetails.dhruCategory;
  }

  if (!selectedService && availableServices.length > 0) {
    selectedService = availableServices[0];
  }

  if (selectedServiceDetails) {
    selectedService = { ...(selectedService || {}), ...selectedServiceDetails };
  }

  const selectedServiceDetailsLoaded = !selectedServiceId || Boolean(loadedServiceDetails[selectedServiceId]);
  const providerFieldsForImei = getProviderCustomFields(selectedService);
  const isImeiService = selectedServiceDetailsLoaded && shouldShowDefaultImeiField(
    selectedCategory?.name || selectedServiceDetails?.dhruCategory?.name,
    providerFieldsForImei,
    selectedService?.apiServiceType || selectedServiceDetails?.apiServiceType,
    selectedService?.groupName || selectedServiceDetails?.groupName
  );
  const isBatteryExtractService = Boolean(
    selectedService?.name && /(battery serial|extract.*battery|battery.*extract)/i.test(selectedService.name)
  );

  // استخراج حقول المزود
  const providerFields = getProviderCustomFields(selectedService);

  // البحث عن حقل كمية مخصص
  const quantityFieldEntry = providerFields
    ? Object.entries(providerFields).find(([k, f]) => isQuantityField(f, k))
    : null;
  const quantityField = quantityFieldEntry ? quantityFieldEntry[1] : null;

  const textClues = extractLimitsFromText(
    `${selectedService?.name || ''} ${selectedService?.info || ''} ${quantityField?.description || ''} ${quantityField?.placeholder || ''}`
  );

  const serviceSupportsQty = selectedServiceDetailsLoaded && supportsProviderQuantity(selectedService);

  const rawMin =
    selectedService?.minQty ??
    selectedService?.min_quantity ??
    quantityField?.min_quantity ??
    quantityField?.minQty ??
    (serviceSupportsQty ? textClues.min : null);

  const rawMax =
    selectedService?.maxQty ??
    selectedService?.max_quantity ??
    quantityField?.max_quantity ??
    quantityField?.maxQty ??
    (serviceSupportsQty ? textClues.max : null);

  const minQty = Math.max(1, typeof rawMin === 'number' ? rawMin : (parseInt(String(rawMin || '1'), 10) || 1));
  const maxQty = typeof rawMax === 'number' ? Math.max(0, rawMax) : (rawMax !== undefined && rawMax !== null ? Math.max(0, parseInt(String(rawMax), 10) || 0) : 0);

  // ضبط الكمية تلقائياً: إذا كانت تدعم كمية يتم مراعاة الحد الأدنى، وإذا كانت لا تدعم كمية تعود فوراً إلى 1
  useEffect(() => {
    if (serviceSupportsQty && quantity < minQty) {
      setQuantity(minQty);
    } else if (!serviceSupportsQty && quantity !== 1) {
      setQuantity(1);
    }
  }, [selectedServiceId, serviceSupportsQty, minQty]);

  // Unit price & total calculation
  const getCalculatedUnitPrice = (service: any): number => {
    if (!service) return 0;
    if (service.finalPrice !== undefined && service.finalPrice !== null) return Number(service.finalPrice) || 0;
    if (service.price !== undefined && service.price !== null) return Number(service.price) || 0;
    const c = typeof service.credit === 'number' ? service.credit : parseFloat(service.credit) || 0;
    const m = typeof service.margin === 'number' ? service.margin : parseFloat(service.margin) || 0;
    return Number((c + m).toFixed(2));
  };

  // Membership discount from the authenticated session (synced from backend)
  const membershipDiscount = Math.max(
    userSession?.effectiveDiscount || 0,
    userSession?.membershipTier?.discountPercentage || 0,
    userSession?.customDiscount || 0
  );

  const unitPriceBase = getCalculatedUnitPrice(selectedService);
  const unitPrice = membershipDiscount > 0
    ? Number((unitPriceBase * (1 - membershipDiscount / 100)).toFixed(2))
    : unitPriceBase;

  const isFreeService = Boolean(selectedService && unitPriceBase === 0 && (
    selectedService.name?.toLowerCase().includes("free") || 
    selectedService.name?.includes("مجاني") || 
    selectedService.name?.includes("مجانا")
  ));
  const isZeroUnpriced = Boolean(selectedService && unitPriceBase === 0 && !isFreeService);

  const rawTotalPrice = serviceSupportsQty ? unitPrice * (quantity > 0 ? quantity : 1) : unitPrice;
  const couponDiscount = appliedCoupon ? Number(((rawTotalPrice * appliedCoupon.discountPercent) / 100).toFixed(2)) : 0;
  const totalPrice = Math.max(0, Number((rawTotalPrice - couponDiscount).toFixed(2)));
  const hasEnoughBalance = userBalance >= totalPrice;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponFeedback({
        type: "error",
        text: lang === "ar" ? "الرجاء كتابة كود الخصم أولاً" : "Please enter a coupon code"
      });
      return;
    }

    const cleanInput = couponInput.trim().toUpperCase();

    // التحقق من أكواد العرض الترويجي المطبقة مسبقاً
    if (["PRO10", "SAVE10", "ARAB10", "DISCOUNT10", "OFFER10", "SPECIAL10"].includes(cleanInput)) {
      setCouponFeedback({
        type: "success",
        text: lang === "ar"
          ? "كود الخصم (10%) مفعّل ومطبّق بالفعل وتلقائياً على السعر المعروض للخدمة!"
          : "Promo code (10% OFF) is already automatically included in the displayed rate!"
      });
      return;
    }

    setValidatingCoupon(true);
    setCouponFeedback(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          price: rawTotalPrice,
          userId: userSession?.id || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice
        });
        setCouponFeedback({
          type: "success",
          text: data.message || (lang === "ar" ? `تم تطبيق خصم ${data.discountPercent}% بنجاح!` : `Discount of ${data.discountPercent}% applied!`)
        });
      } else {
        setAppliedCoupon(null);
        setCouponFeedback({
          type: "error",
          text: data.error || (lang === "ar" ? "كود الخصم غير صالح أو منتهي الصلاحية" : "Invalid or expired coupon code")
        });
      }
    } catch {
      setCouponFeedback({
        type: "error",
        text: lang === "ar" ? "فشل التحقق من كود الخصم" : "Failed to validate coupon"
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponFeedback(null);
  };

  // Handle Category Select Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setTargetInput("");
    setCustomFieldValues({});
    const cat = categoriesList.find(c => c.id === catId);
    if (cat && cat.services && cat.services.length > 0) {
      setSelectedServiceId(cat.services[0].id);
    } else {
      setSelectedServiceId("");
    }
  };

  // Handle Service Select Change
  const handleServiceChange = (srvId: string) => {
    setSelectedServiceId(srvId);
    setTargetInput("");
    setCustomFieldValues({});
    for (const group of categoriesList) {
      const found = (group.services || []).find((s: any) => s.id === srvId);
      if (found) {
        setSelectedCategoryId(group.id);
        break;
      }
    }
  };

  // Track service view event in Analytics
  useEffect(() => {
    if (!selectedServiceId) return;
    const sessionId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("sessionId") || "" : "";
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "service_view",
        sessionId,
        path: `/purchase?service=${selectedServiceId}`,
        metadata: {
          serviceId: selectedServiceId,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          userName: userSession?.fullName || null,
          userEmail: userSession?.email || null
        }
      })
    }).catch(() => {});
  }, [selectedServiceId, userSession]);

  // 3. Handle Submitting a New Order
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingOrder) return;
    setSubmitFeedback(null);

    if (!userSession) {
      setSubmitFeedback({ type: "error", text: lang === 'ar' ? 'يرجى تسجيل الدخول أولاً لإرسال الطلب' : 'Please sign in to place an order.' });
      return;
    }

    if (!selectedService) {
      setSubmitFeedback({ type: "error", text: lang === 'ar' ? 'يرجى اختيار الخدمة المراد طلبها' : 'Please select a service.' });
      return;
    }

    if (!selectedServiceDetailsLoaded) {
      setSubmitFeedback({ type: "error", text: lang === 'ar' ? 'يرجى الانتظار حتى تحميل حقول الخدمة' : 'Please wait for the service fields to load.' });
      return;
    }

    const providerFields = getProviderCustomFields(selectedService);
    let payloadTarget = targetInput.trim();
    let rawImeiStr = "";

    if (providerFields && Object.keys(providerFields).length > 0) {
      // التحقق من الحقول الإجبارية المطلوبة من المزود
      for (const [k, f] of Object.entries(providerFields)) {
        if (isQuantityField(f, k)) continue;
        const isReq = (f as any)?.required === true || (f as any)?.required === 1 || (f as any)?.required === '1' || (f as any)?.required === 'on';
        const val = customFieldValues[k];
        if (isReq && (!val || !String(val).trim())) {
          const cleanLabel = getLocalizedFieldLabel(k, f, lang);
          setSubmitFeedback({
            type: "error",
            text: lang === 'ar' ? `يرجى تعبئة الحقل الإجباري: (${cleanLabel})` : `Please fill in the required field: (${cleanLabel})`
          });
          return;
        }
      }

      let customString = Object.entries(customFieldValues)
        .filter(([k, v]) => !isQuantityField(undefined, k) && Boolean(v && String(v).trim()))
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");

      // خدمة بها حقول مخصصة من المزود (تشمل IMEI/LOCK CODE/إلخ)
      // نبحث عن أول حقل IMEI أساسي في حقول المزود لاستخدامه كـ rawImei
      const imeiKey = Object.keys(providerFields).find(k => {
        const f = providerFields[k];
        return isPrimaryImeiProviderField(k, f);
      });
      if (imeiKey && customFieldValues[imeiKey]) {
        rawImeiStr = customFieldValues[imeiKey];
      } else if (targetInput.trim()) {
        rawImeiStr = targetInput.trim();
      }

      // إذا كانت خدمة IMEI ولا يوجد حقل IMEI في الحقول المخصصة، يجب إدخال السيريال/الـ IMEI في targetInput
      if (isImeiService && !imeiKey && !targetInput.trim()) {
        setSubmitFeedback({
          type: "error",
          text: isBatteryExtractService
            ? (lang === 'ar' ? 'يرجى إدخال الرقم التسلسلي للبطارية أو الـ IMEI' : 'Please enter Battery Serial or IMEI')
            : (lang === 'ar' ? 'يرجى إدخال رقم IMEI أو السيريال للجهاز' : 'Please enter the device IMEI or Serial number')
        });
        return;
      }

      if (targetInput.trim() && customString) {
        payloadTarget = `${targetInput.trim()} | ${customString}`;
      } else {
        payloadTarget = customString || targetInput.trim() || (lang === 'ar' ? 'طلب فوري' : 'Instant Order');
      }
    } else if (isImeiService) {
      if (!targetInput.trim()) {
        setSubmitFeedback({
          type: "error",
          text: isBatteryExtractService
            ? (lang === 'ar' ? 'يرجى إدخال الرقم التسلسلي للبطارية أو الـ IMEI' : 'Please enter Battery Serial or IMEI')
            : (lang === 'ar' ? 'يرجى إدخال رقم IMEI أو السيريال للجهاز' : 'Please enter the device IMEI or Serial number')
        });
        return;
      }
      rawImeiStr = targetInput.trim();
      payloadTarget = targetInput.trim();
    } else {
      payloadTarget = targetInput.trim() || (lang === 'ar' ? 'طلب فوري' : 'Instant Order');
    }

    // التحقق من حدود الكمية المفروضة من المزود
    if (serviceSupportsQty) {
      if (quantity < minQty) {
        setSubmitFeedback({
          type: "error",
          text: lang === 'ar'
            ? `عذراً، أقل كمية مسموح بطلبها لهذه الخدمة هي (${minQty})`
            : `Sorry, minimum quantity allowed for this service is (${minQty})`
        });
        return;
      }
      if (maxQty > 0 && quantity > maxQty) {
        setSubmitFeedback({
          type: "error",
          text: lang === 'ar'
            ? `عذراً، أقصى كمية مسموح بطلبها لهذه الخدمة هي (${maxQty})`
            : `Sorry, maximum quantity allowed for this service is (${maxQty})`
        });
        return;
      }
    }

    if (!hasEnoughBalance) {
      setSubmitFeedback({ 
        type: "error", 
        text: lang === 'ar' 
          ? `رصيدك الحالي ($${userBalance.toFixed(2)}) غير كافٍ لتنفيذ الطلب ($${totalPrice.toFixed(2)}). يرجى شحن المحفظة أولاً.` 
          : `Insufficient balance. Required: $${totalPrice.toFixed(2)}, Current: $${userBalance.toFixed(2)}.` 
      });
      return;
    }

    // دمج قيمة الكمية في الحقول المخصصة لضمان إرسالها للمزود بالاسم المطلوب (QNT)
    const finalCustomValues: Record<string, string> = { ...customFieldValues };
    if (serviceSupportsQty) {
      const qtyStr = String(quantity > 0 ? quantity : minQty);
      finalCustomValues['QNT'] = qtyStr;
      finalCustomValues['custom_QNT'] = qtyStr;
      if (quantityFieldEntry && quantityFieldEntry[0]) {
        finalCustomValues[quantityFieldEntry[0]] = qtyStr;
      }
    }

    setSubmittingOrder(true);
    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = { 
        "Content-Type": "application/json"
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        credentials: "omit",
        body: JSON.stringify({
          userId: userSession.id,
          email: userSession.email,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          targetInput: payloadTarget,
          rawImei: rawImeiStr,
          quantity: serviceSupportsQty && quantity > 0 ? quantity : 1,
          price: unitPrice,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          notes: notes.trim(),
          customFields: Object.keys(finalCustomValues).length > 0 ? finalCustomValues : null
        })
      });

      const data = await res.json().catch(() => ({ success: false, message: "تعذر قراءة رد الخادم" }));
      if (res.ok && data.success) {
        const orderId = data.order?.id ? data.order.id.slice(-6).toUpperCase() : "NEW";
        const newBal = data.newBalance !== undefined ? data.newBalance : Math.max(0, userBalance - totalPrice);

        setSubmitFeedback({ type: "success", text: data.message || "تم استلام وتأكيد طلبك بنجاح!" });
        setSuccessOrderModalData({
          orderId,
          serviceName: selectedService.name,
          targetInput: payloadTarget,
          price: totalPrice,
          newBalance: newBal
        });

        setTargetInput("");
        setNotes("");
        setCustomFieldValues({});
        setQuantity(minQty);
        setAppliedCoupon(null);
        setCouponInput("");
        setCouponFeedback(null);
        
        if (data.newBalance !== undefined) {
          setUserBalance(data.newBalance);
          const updated = { ...userSession, balance: data.newBalance };
          localStorage.setItem("user_session", JSON.stringify(updated));
        }
      } else {
        setSubmitFeedback({ type: "error", text: data.error || "حدث خطأ أثناء تنفيذ الطلب" });
      }
    } catch {
      setSubmitFeedback({ type: "error", text: "تعذر الاتصال بالسيرفر لإكمال عملية الشراء" });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-4xl mx-auto relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* CELEBRATION ORDER SUCCESS MODAL */}
      {successOrderModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-violet-500/50 shadow-2xl relative overflow-hidden space-y-6 text-center bg-surface-container-low">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/40 flex items-center justify-center mx-auto shadow-xl ring-8 ring-violet-500/10">
              <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-bold text-white font-display">
                {lang === 'ar' ? 'تم استلام وتأكيد طلبك بنجاح' : 'Order Placed Successfully'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {lang === 'ar'
                  ? 'طلبك الآن قيد الانتظار والمراجعة من قبل الإدارة، وسيتم تسليم النتيجة فور إتمامها.'
                  : 'Your order is currently pending review & processing. Result will be delivered upon completion.'}
              </p>
            </div>

            {/* Details Summary Card */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-xs space-y-2.5 text-right font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/15">
                <span className="text-on-surface-variant font-bold">رقم الطلب:</span>
                <span className="font-mono font-bold text-primary text-sm">#{successOrderModalData.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">الخدمة:</span>
                <span className="font-bold text-on-surface truncate max-w-[220px]">{successOrderModalData.serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">البيانات / IMEI:</span>
                <span className="font-mono font-bold text-primary dir-ltr">{successOrderModalData.targetInput}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-bold">المبلغ المخصوم:</span>
                <span className="font-mono font-bold text-violet-400">${successOrderModalData.price.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15">
                <span className="text-on-surface-variant font-bold">رصيد محفظتك الجديد:</span>
                <span className="font-mono font-bold text-primary text-sm">${successOrderModalData.newBalance.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={`/${lang}/orders`}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-black py-3.5 rounded-2xl font-bold text-xs shadow-lg hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>{lang === 'ar' ? 'الانتقال لسجل طلباتي' : 'View in My Orders'}</span>
              </Link>
              <button
                type="button"
                onClick={() => setSuccessOrderModalData(null)}
                className="px-6 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3.5 rounded-2xl font-bold text-xs border border-outline-variant/30 transition-all active:scale-95"
              >
                {lang === 'ar' ? 'طلب خدمة أخرى' : 'Order Another Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP URGENCY & SOCIAL PROOF BANNER: LIVE VIEWERS & FAKE 10% DISCOUNT ── */}
      <div className="rounded-3xl p-4 sm:p-5 border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-surface-container-low/95 to-primary/10 shadow-[0_0_35px_rgba(245,158,11,0.14)] backdrop-blur-xl relative overflow-hidden transition-all">
        {/* Glowing ambient background auras */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Section 1: Realistic Fluctuating Live Viewers (عداد المتصفحين الحي والواقعي) */}
          <div className="flex items-center gap-3.5 flex-1 border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-outline-variant/30 pb-3 md:pb-0 md:pe-5">
            {/* Live Indicator Icon with Glowing Pulse */}
            <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(109,40,217,0.25)]">
              <span className="material-symbols-outlined text-2xl">group</span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-violet-500 border-2 border-surface-container-lowest"></span>
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-extrabold text-[10px] tracking-wider uppercase border border-violet-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                  <span>{lang === 'ar' ? 'مباشر الآن' : 'LIVE NOW'}</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-amber-400">trending_up</span>
                  <span>{lang === 'ar' ? 'إقبال شراء مرتفع' : 'High Buying Demand'}</span>
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  {activeViewers}
                </span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  {lang === 'ar' ? 'شخص يتصفحون ويطلبون هذه الخدمة الآن' : 'people viewing & ordering this service now'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Fake 10% Discount Offer with Real-time Countdown Timer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[11px] shadow-sm flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  <span>{lang === 'ar' ? 'خصم خاص 10% مفعّل' : 'Special 10% OFF'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText("PRO10");
                    }
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2200);
                  }}
                  title={lang === 'ar' ? 'اضغط لنسخ الكود' : 'Click to copy code'}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/25 transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>كود: PRO10</span>
                  <span className="material-symbols-outlined text-xs">
                    {copiedCode ? "check" : "content_copy"}
                  </span>
                  {copiedCode && (
                    <span className="text-[10px] text-violet-400 font-sans">
                      {lang === 'ar' ? 'تم النسخ!' : 'Copied!'}
                    </span>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {lang === 'ar'
                  ? 'تم تطبيق خصم 10% تلقائياً لكافة الخدمات المعروضة!'
                  : '10% discount already applied automatically to displayed rates!'}
              </p>
            </div>

            {/* Live Countdown Clock Widget */}
            <div className="flex items-center gap-2 bg-black/50 border border-amber-500/35 px-3.5 py-2 rounded-2xl shadow-inner shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-base animate-pulse">timer</span>
              <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-black text-amber-300">
                <span className="w-6 text-center bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                  {String(discountTimeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="animate-pulse text-amber-400">:</span>
                <span className="w-6 text-center bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">
                  {String(discountTimeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-medium ms-0.5">
                {lang === 'ar' ? 'دقيقة' : 'min'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div>
          <h1 className="font-display-lg-mobile text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            <span>{lang === 'ar' ? 'طلب خدمة جديدة' : 'Place a New Order'}</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {lang === 'ar' 
              ? 'اختر الخدمة المطلوبة وادخل بيانات الجهاز IMEI لتقديم الطلب فوراً.' 
              : 'Select service, enter IMEI or target device data to order instantly.'}
          </p>
        </div>

        {/* Navigation to Orders History Page */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${lang}/orders`}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-primary">receipt_long</span>
            <span>{lang === 'ar' ? 'سجل طلباتي' : 'My Orders'}</span>
          </Link>

          {userSession && (
            <div className="p-2.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center gap-3 shadow-sm">
              <div className="text-end">
                <p className="text-[10px] font-bold text-on-surface-variant">{lang === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}</p>
                <p className="text-sm font-bold text-primary font-mono dir-ltr">${userBalance.toFixed(2)} USD</p>
              </div>
              <Link 
                href={`/${lang}/wallet`}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-all"
              >
                {lang === 'ar' ? 'شحن' : 'Top Up'}
              </Link>
            </div>
          )}
        </div>
      </div>


      {/* DEDICATED ORDER CREATION FORM CARD */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
        <div className="border-b border-outline-variant/20 pb-4">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">layers</span>
            <span>{lang === 'ar' ? 'اختيار الخدمة وتأكيد الطلب' : 'Service Selection & Confirmation'}</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {lang === 'ar' ? 'حدد الفئة ثم اختر الخدمة المطلوبة للتنفيذ الفوري والتلقائي.' : 'Select category and choose service for instant execution.'}
          </p>
        </div>

        {/* Feedback Alert */}
        {submitFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              submitFeedback.type === "success"
                ? "bg-violet-500/15 border border-violet-500/30 text-violet-300 glow-cyan"
                : "bg-red-500/15 border border-red-500/30 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {submitFeedback.type === "success" ? "check_circle" : "error"}
              </span>
              <span>{submitFeedback.text}</span>
            </div>

            {submitFeedback.type === "success" && (
              <Link
                href={`/${lang}/orders`}
                className="px-4 py-2 rounded-xl bg-violet-500 text-black font-bold text-xs hover:bg-violet-400 transition-all shrink-0 text-center"
              >
                {lang === 'ar' ? 'عرض ومتابعة طلباتي' : 'Track My Orders'}
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="purchase-category-select" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? '1. فئة الخدمة الرئيسية' : '1. Service Category'}
              </label>
              <select
                id="purchase-category-select"
                name="purchaseCategory"
                aria-label={lang === 'ar' ? 'فئة الخدمة الرئيسية' : 'Service Category'}
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loadingServices}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-xs"
              >
                {loadingServices ? (
                  <option>{lang === 'ar' ? 'جاري تحميل الأقسام...' : 'Loading categories...'}</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {stripEmojis(cat.name)} ({cat.services?.length || 0} {lang === 'ar' ? 'خدمة' : 'services'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Service Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="purchase-service-select" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? '2. اختيار الخدمة المطلوبة' : '2. Select Service'}
              </label>
              <select
                id="purchase-service-select"
                name="purchaseService"
                aria-label={lang === 'ar' ? 'اختيار الخدمة المطلوبة' : 'Select Service'}
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={loadingServices || availableServices.length === 0}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer font-semibold text-xs"
              >
                {availableServices.length === 0 ? (
                  <option value="">{lang === 'ar' ? 'لا توجد خدمات متاحة في هذا القسم' : 'No services available'}</option>
                ) : (
                  availableServices.map((srv: any) => {
                    const c = typeof srv.credit === 'number' ? srv.credit : parseFloat(srv.credit) || 0;
                    const m = typeof srv.margin === 'number' ? srv.margin : parseFloat(srv.margin) || 0;
                    const p = srv.finalPrice ?? srv.price ?? (c + m);
                    const pNum = typeof p === 'number' ? p : parseFloat(p) || 0;
                    const isFree = pNum === 0 && (srv.name?.toLowerCase().includes("free") || srv.name?.includes("مجاني") || srv.name?.includes("مجانا"));
                    const priceLabel = isFree 
                      ? (lang === 'ar' ? 'مجاناً' : 'Free') 
                      : pNum > 0 
                      ? `$${pNum.toFixed(2)} USD` 
                      : (lang === 'ar' ? 'سعر خاص' : 'Special Price');
                    const cleanGroupName = srv.groupName ? stripEmojis(srv.groupName) : '';
                    const groupPrefix = cleanGroupName ? `[${cleanGroupName}] ` : '';
                    return (
                      <option key={srv.id} value={srv.id}>
                        {groupPrefix}{stripEmojis(srv.name)} — ({priceLabel})
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {/* Selected Service Details Card */}
          <div className="min-h-[110px]">
            {loadingServices ? (
              <div className="p-5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/20 animate-pulse space-y-3">
                <div className="h-4 bg-surface-container-highest/60 rounded w-1/3" />
                <div className="h-6 bg-surface-container-highest/60 rounded w-2/3" />
                <div className="h-4 bg-surface-container-highest/60 rounded w-1/2" />
              </div>
            ) : selectedService ? (
              <div className="p-5 rounded-2xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  {/* Category & Group/Package Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">folder_open</span>
                      <span>القسم: {stripEmojis(selectedCategory?.name || (lang === 'ar' ? 'القسم الرئيسي' : 'Main Category'))}</span>
                    </span>

                    {selectedService.groupName && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">package_2</span>
                        <span>الباقة: {stripEmojis(selectedService.groupName)}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-on-surface">{stripEmojis(selectedService.name)}</h3>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-secondary">schedule</span>
                      <span>وقت التسليم: {selectedService.time || "فوري - 30 دقيقة"}</span>
                    </span>
                  </div>

                  {/* Collapsible Provider Instructions & Info */}
                  {selectedService.info && (
                    <div className="mt-3 pt-2.5 border-t border-outline-variant/15">
                      <button
                        type="button"
                        onClick={() => setShowServiceInfo(!showServiceInfo)}
                        className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">info</span>
                        <span>
                          {showServiceInfo
                            ? (lang === 'ar' ? 'إخفاء شروط وتعليمات المزود' : 'Hide provider rules & instructions')
                            : (lang === 'ar' ? 'عرض شروط وتعليمات المزود للخدمة' : 'View provider rules & instructions')}
                        </span>
                        <span className="material-symbols-outlined text-xs">
                          {showServiceInfo ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {showServiceInfo && (
                        <div className="mt-2.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap block">
                          {cleanHtmlToText(selectedService.info)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-start sm:text-end shrink-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    {lang === 'ar' ? 'سعر الخدمة' : 'Service Price'}
                  </span>
                  {unitPriceBase > 0 ? (
                    <div className="flex flex-col items-start sm:items-end gap-1 mt-0.5">
                      <div className="flex items-center gap-2">
                        {membershipDiscount > 0 && (
                          <span className="text-xs text-on-surface-variant/70 line-through font-mono">
                            ${unitPriceBase.toFixed(2)} USD
                          </span>
                        )}
                        <span className="text-2xl font-bold font-mono text-primary glow-cyan">
                          ${unitPrice.toFixed(2)} USD
                        </span>
                      </div>
                      {membershipDiscount > 0 && (
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">local_offer</span>
                          <span>
                            {lang === 'ar'
                              ? `خصم VIP ${membershipDiscount}% مطبق`
                              : `VIP ${membershipDiscount}% OFF Applied`}
                          </span>
                        </span>
                      )}
                    </div>
                  ) : isFreeService ? (
                    <span className="text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-xl inline-block mt-1">
                      {lang === 'ar' ? 'خدمة مجانية' : 'Free Service'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl inline-block mt-1">
                      {lang === 'ar' ? 'سعر خاص عند الطلب' : 'Price on Request'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-outline-variant/20 bg-surface-container-high/30 h-[110px] flex items-center justify-center text-xs text-on-surface-variant/60">
                {lang === 'ar' ? 'اختر الخدمة لعرض تفاصيلها والشروط الفنية' : 'Select a service to view technical specifications'}
              </div>
            )}
          </div>

          {/* PROVIDER REQUIRED CUSTOM FIELDS VS STANDARD INPUT */}
          {(() => {
            if (selectedServiceId && !selectedServiceDetailsLoaded) {
              return (
                <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-high/30 p-4 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-base text-primary">sync</span>
                  <span>{lang === 'ar' ? 'جاري تحميل حقول الطلب المطلوبة...' : 'Loading required order fields...'}</span>
                </div>
              );
            }

            const providerFields = getProviderCustomFields(selectedService);
            const nonQuantityFields = providerFields
              ? Object.entries(providerFields).filter(([k, f]: [string, any]) => !isQuantityField(f, k))
              : [];
            const hasCustomFields = nonQuantityFields.length > 0;
            const hasImeiInCustom = nonQuantityFields.some(([key, fieldObj]: [string, any]) => {
              return isPrimaryImeiProviderField(key, fieldObj);
            });

            return (
              <div className="space-y-6">
                {/* ── حالة 1: حقول مخصصة واردة ومطلوبة من المزود ── */}
                {hasCustomFields && (
                  <div className="space-y-4 p-5 rounded-2xl bg-surface-container-high/40 border border-primary/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-base">tune</span>
                      <span>
                        {lang === 'ar'
                          ? 'بيانات وحقول الطلب المطلوبة من المزود:'
                          : 'Order Details & Provider Required Fields:'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nonQuantityFields.map(([key, fieldObj]: [string, any]) => {
                        const cleanLabel = getLocalizedFieldLabel(key, fieldObj, lang);
                        const fieldType = (fieldObj?.fieldtype || fieldObj?.type || fieldObj?.FIELDTYPE || '').toLowerCase();
                        const fieldDesc = fieldObj?.description || fieldObj?.DESCRIPTION || fieldObj?.hint || fieldObj?.custominfo || '';
                        const optionsList = extractFieldOptions(key, fieldObj);
                        const isLong = isLongTextField(key, fieldObj);
                        const isRequired = fieldObj?.required === true || fieldObj?.required === 1 || fieldObj?.required === '1' || fieldObj?.required === 'on';
                        const fieldId = `custom-field-${key}`;

                        // حقل select / dropdown — لو فيه options حقيقية
                        if (fieldType === 'select' && optionsList.length > 0) {
                          return (
                            <div key={key} className="flex flex-col gap-2">
                              <label htmlFor={fieldId} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                <span>{cleanLabel}:</span>
                                {isRequired ? (
                                  <span className="text-rose-400 font-bold text-[11px] flex items-center gap-0.5">
                                    <span className="text-rose-500">*</span>
                                    <span>{lang === 'ar' ? 'مطلوب' : 'Required'}</span>
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant/60 text-[11px] font-normal">{lang === 'ar' ? '(اختياري)' : '(Optional)'}</span>
                                )}
                              </label>
                              <select
                                id={fieldId}
                                name={key}
                                aria-label={cleanLabel}
                                value={customFieldValues[key] || ""}
                                onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-semibold text-xs cursor-pointer"
                              >
                                <option value="">{lang === 'ar' ? '-- اختر من القائمة --' : '-- Select from list --'}</option>
                                {optionsList.map((opt, i) => (
                                  <option key={i} value={opt}>{opt}</option>
                                ))}
                              </select>
                              {fieldDesc && (
                                <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5 whitespace-pre-wrap">
                                  <span className="material-symbols-outlined text-xs text-primary">info</span>
                                  <span>{cleanHtmlToText(fieldDesc)}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        // حقل نصي طويل (تقرير، إثبات، روابط متعددة)
                        if (isLong) {
                          return (
                            <div key={key} className="flex flex-col gap-2 md:col-span-2">
                              <label htmlFor={fieldId} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                                <span>{cleanLabel}:</span>
                                {isRequired ? (
                                  <span className="text-rose-400 font-bold text-[11px] flex items-center gap-0.5">
                                    <span className="text-rose-500">*</span>
                                    <span>{lang === 'ar' ? 'مطلوب' : 'Required'}</span>
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant/60 text-[11px] font-normal">{lang === 'ar' ? '(اختياري)' : '(Optional)'}</span>
                                )}
                              </label>
                              <textarea
                                id={fieldId}
                                name={key}
                                aria-label={cleanLabel}
                                rows={2}
                                value={customFieldValues[key] || ""}
                                onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                                placeholder={lang === 'ar' ? `أدخل ${cleanLabel}...` : `Enter ${cleanLabel}...`}
                                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                              />
                              {fieldDesc && (
                                <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5 whitespace-pre-wrap">
                                  <span className="material-symbols-outlined text-xs text-primary">info</span>
                                  <span>{cleanHtmlToText(fieldDesc)}</span>
                                </p>
                              )}
                            </div>
                          );
                        }

                        // حقل نصي عادي / كلمة مرور / إيميل / سيريال
                        return (
                          <div key={key} className="flex flex-col gap-2">
                            <label htmlFor={fieldId} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                              <span>{cleanLabel}:</span>
                              {isRequired ? (
                                <span className="text-rose-400 font-bold text-[11px] flex items-center gap-0.5">
                                  <span className="text-rose-500">*</span>
                                  <span>{lang === 'ar' ? 'مطلوب' : 'Required'}</span>
                                </span>
                              ) : (
                                <span className="text-on-surface-variant/60 text-[11px] font-normal">{lang === 'ar' ? '(اختياري)' : '(Optional)'}</span>
                              )}
                            </label>
                            <input
                              id={fieldId}
                              name={key}
                              aria-label={cleanLabel}
                              type={fieldType === "password" ? "password" : "text"}
                              value={customFieldValues[key] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [key]: e.target.value })}
                              placeholder={lang === 'ar' ? `أدخل ${cleanLabel}...` : `Enter ${cleanLabel}...`}
                              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                            />
                            {fieldDesc && (
                              <p className="text-[11px] text-on-surface-variant/80 flex items-center gap-1 mt-0.5 whitespace-pre-wrap">
                                <span className="material-symbols-outlined text-xs text-primary">info</span>
                                <span>{cleanHtmlToText(fieldDesc)}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* ── حالة 2: خدمة IMEI ولا يوجد حقل IMEI في الحقول المخصصة للمزود ── */}
                  {isImeiService && !hasImeiInCustom && (
                    <div className="space-y-2 p-5 rounded-2xl bg-surface-container-high/40 border border-primary/20">
                      <label htmlFor="purchase-imei-input" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                        <span>
                          {isBatteryExtractService
                            ? (lang === 'ar' ? 'الرقم التسلسلي للبطارية أو IMEI (Battery Serial / IMEI):' : 'Battery Serial Number or IMEI:')
                            : (lang === 'ar' ? 'رقم IMEI أو السيريال للجهاز (Device IMEI / Serial):' : 'Device IMEI / Serial Number:')}
                        </span>
                        <span className="text-rose-400 font-bold text-[11px] flex items-center gap-0.5">
                          <span className="text-rose-500">*</span>
                          <span>{lang === 'ar' ? 'مطلوب' : 'Required'}</span>
                        </span>
                      </label>
                      <input
                        id="purchase-imei-input"
                        name="purchaseImei"
                        aria-label={
                          isBatteryExtractService
                            ? (lang === 'ar' ? 'الرقم التسلسلي للبطارية أو IMEI' : 'Battery Serial Number or IMEI')
                            : (lang === 'ar' ? 'رقم IMEI أو السيريال للجهاز' : 'Device IMEI or Serial Number')
                        }
                        type="text"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder={
                          isBatteryExtractService
                            ? (lang === 'ar' ? 'أدخل الرقم التسلسلي المطبوع على البطارية (Battery Serial)...' : 'Enter Battery Serial Number...')
                            : (lang === 'ar' ? 'أدخل رقم IMEI المكون من 15 رقم أو Serial...' : 'Enter 15-digit IMEI or device Serial number...')
                        }
                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm dir-ltr"
                      />
                    </div>
                  )}

                </div>
              );
            })()}

          {/* Quantity & Notes — يظهر قسم الكمية المحسن مع الحدين الأدنى والأقصى */}
          <div className="space-y-4">
            {serviceSupportsQty && (
              <div className="p-5 rounded-2xl bg-surface-container-high/50 border border-primary/25 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">pin</span>
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                        {lang === 'ar' ? 'الكمية المطلوبة (Quantity)' : 'Required Quantity'}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        {lang === 'ar'
                          ? `أقل كمية: ${minQty} ${maxQty > 0 ? `| أقصى كمية: ${maxQty}` : '| بدون حد أقصى'}`
                          : `Min: ${minQty} ${maxQty > 0 ? `| Max: ${maxQty}` : '| Unlimited'}`}
                      </p>
                    </div>
                  </div>

                  {/* Badges for Min & Max */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold flex items-center gap-1">
                      <span>{lang === 'ar' ? 'الحد الأدنى:' : 'Min:'}</span>
                      <span className="dir-ltr">{minQty}</span>
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant font-medium flex items-center gap-1">
                      <span>{lang === 'ar' ? 'الحد الأقصى:' : 'Max:'}</span>
                      <span className="dir-ltr">{maxQty > 0 ? maxQty : (lang === 'ar' ? 'غير محدود' : 'Unlimited')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
                      disabled={quantity <= minQty}
                      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-l-xl rounded-r-none bg-surface-container-highest/80 hover:bg-primary/20 border border-r-0 border-outline-variant/40 text-on-surface hover:text-primary transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      title={lang === 'ar' ? 'تقليل الكمية (-)' : 'Decrease (-)'}
                    >
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <input
                      id="purchase-quantity-input"
                      name="purchaseQuantity"
                      aria-label={lang === 'ar' ? 'الكمية المطلوبة' : 'Required Quantity'}
                      type="number"
                      min={minQty}
                      max={maxQty > 0 ? maxQty : undefined}
                      step={1}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(isNaN(val) ? minQty : val);
                      }}
                      className={`w-full text-center bg-surface-container-lowest border rounded-none py-2.5 px-3 text-on-surface focus:outline-none transition-all font-mono text-base font-bold dir-ltr ${
                        quantity < minQty || (maxQty > 0 && quantity > maxQty)
                          ? 'border-error ring-1 ring-error/50'
                          : 'border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => (maxQty > 0 ? Math.min(maxQty, q + 1) : q + 1))}
                      disabled={maxQty > 0 && quantity >= maxQty}
                      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-r-xl rounded-l-none bg-surface-container-highest/80 hover:bg-primary/20 border border-l-0 border-outline-variant/40 text-on-surface hover:text-primary transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                      title={lang === 'ar' ? 'زيادة الكمية (+)' : 'Increase (+)'}
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant font-medium">
                      {lang === 'ar' ? 'الحساب الإجمالي للكمية:' : 'Live Cost Calculation:'}
                    </span>
                    <span className="text-sm font-mono font-bold text-primary dir-ltr">
                      ${unitPrice.toFixed(2)} × {quantity} = ${(unitPrice * (quantity > 0 ? quantity : 1)).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Range alerts */}
                {quantity < minQty && (
                  <div className="p-2.5 rounded-xl bg-error/10 border border-error/25 text-error text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>
                      {lang === 'ar'
                        ? `تنبيه: لقد أدخلت (${quantity}). الحد الأدنى المسموح به من المزود هو (${minQty})، لا يمكن إرسال الطلب بأقل من ذلك.`
                        : `Warning: You entered (${quantity}). Provider minimum is (${minQty}), orders below this will be rejected.`}
                    </span>
                  </div>
                )}

                {maxQty > 0 && quantity > maxQty && (
                  <div className="p-2.5 rounded-xl bg-error/10 border border-error/25 text-error text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>
                      {lang === 'ar'
                        ? `تنبيه: لقد أدخلت (${quantity}). الحد الأقصى المسموح به من المزود هو (${maxQty})، لا يمكن إرسال الطلب بأكثر من ذلك.`
                        : `Warning: You entered (${quantity}). Provider maximum is (${maxQty}), orders exceeding this will be rejected.`}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="purchase-notes-input" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
              </label>
              <input
                id="purchase-notes-input"
                name="purchaseNotes"
                aria-label={lang === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'ar' ? 'أي تعليمات أو ملاحظات للمزود...' : 'Optional notes for provider...'}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3.5 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-xs"
              />
            </div>

            {/* Coupon Code Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-high/40 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="purchase-coupon-input" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">confirmation_number</span>
                  <span>{lang === 'ar' ? 'كود الخصم (Coupon Code)' : 'Coupon Code'}</span>
                </label>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                    <span>{lang === 'ar' ? 'إلغاء الكود' : 'Remove'}</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  id="purchase-coupon-input"
                  name="purchaseCoupon"
                  aria-label={lang === 'ar' ? 'كود الخصم' : 'Coupon Code'}
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedCoupon) || validatingCoupon}
                  placeholder={lang === 'ar' ? 'أدخل كود الخصم هنا (مثال: SAVE20)...' : 'Enter coupon code (e.g. SAVE20)...'}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold text-sm tracking-wider uppercase disabled:opacity-60 dir-ltr"
                />
                {!appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none shadow-md cursor-pointer"
                  >
                    {validatingCoupon ? (
                      <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                    <span>{lang === 'ar' ? 'تطبيق الخصم' : 'Apply'}</span>
                  </button>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 font-bold text-xs shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>{appliedCoupon.discountPercent}% OFF</span>
                  </div>
                )}
              </div>

              {couponFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    couponFeedback.type === 'success'
                      ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm shrink-0">
                    {couponFeedback.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{couponFeedback.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cost Summary & Balance Check */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant">{lang === 'ar' ? 'إجمالي التكلفة المطلوبة:' : 'Total Cost Required:'}</p>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  {membershipDiscount > 0 && rawTotalPrice > 0 && (
                    <span className="text-sm line-through text-on-surface-variant/60 font-mono dir-ltr">
                      ${(unitPriceBase * (serviceSupportsQty ? (quantity > 0 ? quantity : 1) : 1)).toFixed(2)} USD
                    </span>
                  )}
                  <p className="text-xl font-bold font-mono text-primary glow-cyan dir-ltr">${totalPrice.toFixed(2)} USD</p>
                  {membershipDiscount > 0 && rawTotalPrice > 0 && (
                    <span className="text-[11px] font-bold text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 dir-ltr">
                      <span>-{membershipDiscount}% VIP</span>
                    </span>
                  )}
                  {appliedCoupon && (
                    <span className="text-[11px] font-bold text-secondary bg-secondary/15 border border-secondary/30 px-2 py-0.5 rounded-md dir-ltr">
                      -{appliedCoupon.discountPercent}% {lang === 'ar' ? 'كود إضافي' : 'Coupon'}
                    </span>
                  )}
                </div>
                {membershipDiscount > 0 && rawTotalPrice > 0 && (
                  <p className="text-[11px] text-violet-400/90 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>
                      {lang === 'ar'
                        ? `تم تطبيق خصم عضوية VIP ${membershipDiscount}% تلقائياً`
                        : `VIP membership discount of ${membershipDiscount}% applied automatically`}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-center sm:text-end">
              {hasEnoughBalance ? (
                <span className="px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-bold text-xs inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                  <span>{lang === 'ar' ? `رصيدك كافٍ ($${userBalance.toFixed(2)})` : `Sufficient balance ($${userBalance.toFixed(2)})`}</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>{lang === 'ar' ? `رصيدك غير كافٍ ($${userBalance.toFixed(2)})` : `Insufficient ($${userBalance.toFixed(2)})`}</span>
                  </span>
                  <Link
                    href={`/${lang}/wallet`}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
                  >
                    {lang === 'ar' ? 'شحن المحفظة' : 'Top Up'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={submittingOrder || !hasEnoughBalance || !selectedService}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.99] ${
              !hasEnoughBalance || !selectedService
                ? "bg-surface-container-high border border-outline-variant/30 text-on-surface-variant/50 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-secondary text-on-primary hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]"
            }`}
          >
            {submittingOrder ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>{lang === 'ar' ? 'جاري خصم الرصيد وتنفيذ الطلب...' : 'Processing order & deducting balance...'}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                <span>
                  {isFreeService
                    ? (lang === 'ar' ? 'تأكيد وإرسال الطلب (مجاناً)' : 'Confirm & Send Order (Free)')
                    : (lang === 'ar'
                        ? `تأكيد وإرسال الطلب ($${totalPrice.toFixed(2)} USD)${
                            membershipDiscount > 0 ? ` - خصم VIP ${membershipDiscount}%` : ''
                          }`
                        : `Confirm & Send Order ($${totalPrice.toFixed(2)} USD)${
                            membershipDiscount > 0 ? ` - VIP ${membershipDiscount}% OFF` : ''
                          }`)}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PurchaseClient({ lang, dict }: { lang: string, dict: any }) {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
        <p className="text-xs font-bold mt-2">جاري التحميل...</p>
      </div>
    }>
      <PurchaseClientContent lang={lang} dict={dict} />
    </Suspense>
  );
}
