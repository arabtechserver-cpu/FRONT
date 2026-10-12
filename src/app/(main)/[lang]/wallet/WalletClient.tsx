"use client";

import { SITE_CONTACTS } from "@/lib/site-contacts";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n/config";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { cleanHtmlToText } from "@/utils/cleanHtml";
import { Wallet, ArrowUpRight, ArrowDownLeft, Check, Clock3, ReceiptText, Copy, Upload, ShieldCheck, RefreshCw, Banknote, Smartphone, Bitcoin, CreditCard, Headphones, Search, X, ChevronRight } from "lucide-react";
import styles from "./wallet.module.css";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface PaymentMethod {
  id: string;
  nameAr: string;
  nameEn: string;
  badge: string;
  icon: string;
  color: string;
  copyValue: string;
  detailLabelAr: string;
  detailLabelEn: string;
  instructionsAr: string;
  instructionsEn: string;
  isAutomaticPayPal?: boolean;
  isBankak?: boolean;
  isFawry?: boolean;
  isRewarble?: boolean;
  isBnbServices?: boolean;
  isActive?: boolean;
}

interface CurrencyConfig {
  usdToSdg: number;
  usdToEgp: number;
  usdToSar: number;
  usdToAed: number;
  bankak?: {
    accountNumber: string;
    accountName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  fawry?: {
    accountNumber: string;
    accountName?: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  vodafone?: {
    walletNumber: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  binance: {
    payId: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  cryptoBnb: {
    address: string;
    network: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  rewarble?: {
    address: string;
    transferName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  paypal: {
    email: string;
    isActive: boolean;
  };
  paymentMethods?: any[];
}

interface DBTransaction {
  id: string;
  type: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed" | string;
  createdAt: string;
  refNo: string;
}

export default function WalletClient({ lang, dict }: { lang: Locale; dict: any }) {
  const router = useRouter();
  const isAr = lang === "ar";

  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<string>("10.00");
  const [depositSdgAmount, setDepositSdgAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("bankak");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingTx, setIsFetchingTx] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null);
  const [isVerifyingPayPal, setIsVerifyingPayPal] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<DBTransaction[]>([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historyQuery, setHistoryQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const fetchCurrencies = async () => {
    try {
      const res = await fetch("/api/currencies", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setCurrencyConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch currencies in wallet:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("user_session");
    const token =
      localStorage.getItem("user_token") ||
      localStorage.getItem("token");

    let currentUser: any = null;
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch {
        currentUser = null;
      }
    }

    if (currentUser && (token || currentUser.id || currentUser.email)) {
      setUserSession(currentUser);
      setIsAuthenticated(true);
      setCheckingAuth(false);
      fetchRealTransactions(currentUser?.id, currentUser?.email);
    } else {
      setUserSession(null);
      setIsAuthenticated(false);
      setCheckingAuth(false);
      setIsFetchingTx(false);
      router.replace(`/${lang}/login?redirect=/${lang}/wallet`);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get("method");
    if (methodParam) {
      setSelectedMethodId(methodParam.toLowerCase());
    }

    const paypalToken = urlParams.get("token");
    const paypalStatus = urlParams.get("paypal");

    if (paypalToken && (paypalStatus === "success" || paypalToken)) {
      handlePayPalReturnCapture(paypalToken, currentUser);
    } else if (paypalStatus === "cancel") {
      setErrorMessage(isAr ? "تم إلغاء عملية الدفع عبر PayPal." : "PayPal payment was cancelled.");
    }
  }, [lang, router]);

  useEffect(() => {
    if (currencyConfig?.usdToSdg) {
      const usd = parseFloat(depositAmount) || 0;
      setDepositSdgAmount((usd * currencyConfig.usdToSdg).toFixed(0));
    }
  }, [depositAmount, currencyConfig]);

  const handleSdgAmountChange = (val: string) => {
    setDepositSdgAmount(val);
    const sdg = parseFloat(val) || 0;
    const rate = currencyConfig?.usdToSdg || 2850;
    if (rate > 0) {
      setDepositAmount((sdg / rate).toFixed(2));
    }
  };

  const paymentMethods: PaymentMethod[] = useMemo(() => {
    if (
      currencyConfig?.paymentMethods &&
      Array.isArray(currencyConfig.paymentMethods) &&
      currencyConfig.paymentMethods.length > 0
    ) {
      return currencyConfig.paymentMethods
        .filter((m: any) => m.isActive !== false)
        .map((m: any) => {
          const isAutomaticPayPal = m.id === "paypal";
          const isBankak = m.id === "bankak";
          const isFawry = m.id === "fawry";
          const isBnbServices = m.id === "bnb";

          let copyVal = m.copyValue || "";
          if (!copyVal) {
            if (isBankak) copyVal = currencyConfig?.bankak?.accountNumber || "";
            else if (isFawry) copyVal = currencyConfig?.fawry?.accountNumber || "51589889";
            else if (m.id === "vodafone") copyVal = currencyConfig?.vodafone?.walletNumber || "";
            else if (m.id === "binance") copyVal = currencyConfig?.binance?.payId || "";
            else if (m.id === "bnb") copyVal = currencyConfig?.cryptoBnb?.address || currencyConfig?.rewarble?.address || "";
            else if (m.id === "paypal") copyVal = currencyConfig?.paypal?.email || "";
          }

          let detailLabelAr = m.detailLabelAr || "";
          let detailLabelEn = m.detailLabelEn || "";
          if (!detailLabelAr) {
            if (isBankak) {
              const accName = m.accountName || currencyConfig?.bankak?.accountName;
              detailLabelAr = accName ? `رقم حساب بنكك (باسم: ${accName}):` : "رقم حساب بنكك:";
              detailLabelEn = accName ? `Bankak Account # (Name: ${accName}):` : "Bankak Account #:";
            } else if (isFawry) {
              const accName = m.accountName || currencyConfig?.fawry?.accountName;
              detailLabelAr = accName ? `الرقم البنكي الموحد (باسم: ${accName}):` : "الرقم البنكي الموحد (تطبيق فوري):";
              detailLabelEn = accName ? `Unified Banking ID (Name: ${accName}):` : "Unified Banking ID (Fawri App):";
            } else if (m.accountName) {
              detailLabelAr = `رقم الحساب / المحفظة (باسم: ${m.accountName}):`;
              detailLabelEn = `Account / Wallet # (Name: ${m.accountName}):`;
            } else {
              detailLabelAr = "رقم الحساب / المحفظة للتحويل:";
              detailLabelEn = "Account / Wallet Number for transfer:";
            }
          }

          let instructionsAr = m.instructionsAr || "";
          let instructionsEn = m.instructionsEn || "";
          if (!instructionsAr) {
            if (isBankak) instructionsAr = currencyConfig?.bankak?.instructionsAr || "حول المبلغ بالجنيه السوداني عبر تطبيق بنكك إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد.";
            else if (isFawry) instructionsAr = currencyConfig?.fawry?.instructionsAr || "حول المبلغ بالجنيه السوداني عبر تطبيق فوري إلى الرقم البنكي الموحد ثم ارفع صورة إشعار التحويل للتأكيد.";
            else if (m.id === "vodafone") instructionsAr = currencyConfig?.vodafone?.instructionsAr || "حول المبلغ إلى رقم المحفظة واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التحويل.";
            else if (m.id === "binance") instructionsAr = currencyConfig?.binance?.instructionsAr || "افتح تطبيق باينانس واكتب معرف Binance Pay ID ثم ارفق لقطة الشاشة للتأكيد.";
            else if (m.id === "bnb") instructionsAr = currencyConfig?.cryptoBnb?.instructionsAr || "قم بالتحويل إلى عنوان المحفظة ثم ارفع صورة إشعار التحويل للتأكيد.";
            else if (m.id === "paypal") instructionsAr = "ادخل المبلغ واضغط زر الدفع عبر PayPal لإتمام العملية تلقائياً.";
          }

          return {
            id: m.id,
            nameAr: m.nameAr || m.name || "",
            nameEn: m.nameEn || m.name || "",
            badge: m.badge || (isBankak ? "SD" : isFawry ? "FAWRI" : "PAY"),
            icon: m.icon || "account_balance",
            color: m.color || "bg-blue-600",
            copyValue: copyVal,
            detailLabelAr,
            detailLabelEn,
            instructionsAr,
            instructionsEn,
            isAutomaticPayPal,
            isBankak,
            isFawry,
            isBnbServices,
            isActive: m.isActive !== false
          };
        });
    }

    return [
      {
        id: "bankak",
        nameAr: "بنك الخرطوم (بنكك)",
        nameEn: "Bank of Khartoum (Bankak)",
        badge: "SD",
        icon: "account_balance",
        color: "bg-blue-600",
        copyValue: currencyConfig?.bankak?.accountNumber || "",
        detailLabelAr: currencyConfig?.bankak?.accountName
          ? `رقم حساب بنكك (باسم: ${currencyConfig.bankak.accountName}):`
          : "رقم حساب بنكك:",
        detailLabelEn: currencyConfig?.bankak?.accountName
          ? `Bankak Account # (Name: ${currencyConfig.bankak.accountName}):`
          : "Bankak Account #:",
        instructionsAr:
          currencyConfig?.bankak?.instructionsAr ||
          "حول المبلغ بالجنيه السوداني عبر تطبيق بنكك إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد.",
        instructionsEn:
          currencyConfig?.bankak?.instructionsEn ||
          "Transfer via Bankak app in Sudanese Pounds then upload receipt image for confirmation.",
        isBankak: true
      },
      {
        id: "fawry",
        nameAr: "فوري - بنك فيصل الإسلامي",
        nameEn: "Fawri - Faisal Bank",
        badge: "FAWRI",
        icon: "account_balance",
        color: "bg-indigo-600",
        copyValue: currencyConfig?.fawry?.accountNumber || "51589889",
        detailLabelAr: "الرقم البنكي الموحد (تطبيق فوري):",
        detailLabelEn: "Unified Banking ID (Fawri App):",
        instructionsAr:
          currencyConfig?.fawry?.instructionsAr ||
          "حول المبلغ بالجنيه السوداني عبر تطبيق فوري إلى الرقم البنكي الموحد (51589889) ثم ارفع صورة إشعار التحويل للتأكيد.",
        instructionsEn:
          currencyConfig?.fawry?.instructionsEn ||
          "Transfer in Sudanese Pounds via Fawri app to Unified Banking ID # 51589889 then upload receipt image for confirmation.",
        isFawry: true
      },
      {
        id: "vodafone",
        nameAr: "فودافون كاش (Vodafone Cash)",
        nameEn: "Vodafone Cash",
        badge: "VF",
        icon: "phone_iphone",
        color: "bg-rose-600",
        copyValue: currencyConfig?.vodafone?.walletNumber || "",
        detailLabelAr: "رقم محفظة فودافون كاش:",
        detailLabelEn: "Vodafone Cash Wallet Number:",
        instructionsAr:
          currencyConfig?.vodafone?.instructionsAr ||
          "حول المبلغ إلى رقم المحفظة واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التحويل.",
        instructionsEn:
          currencyConfig?.vodafone?.instructionsEn ||
          "Transfer funds to the designated wallet number then attach receipt screenshot."
      },
      {
        id: "binance",
        nameAr: "Binance Pay (باينانس)",
        nameEn: "Binance Pay",
        badge: "PAY",
        icon: "currency_exchange",
        color: "bg-amber-500",
        copyValue: currencyConfig?.binance?.payId || "",
        detailLabelAr: "معرف باينانس باي (Binance Pay ID):",
        detailLabelEn: "Binance Pay ID:",
        instructionsAr:
          currencyConfig?.binance?.instructionsAr ||
          "افتح تطبيق باينانس واكتب معرف Binance Pay ID ثم ارفق لقطة الشاشة للتأكيد.",
        instructionsEn:
          currencyConfig?.binance?.instructionsEn ||
          "Open Binance App and send funds via Pay ID then attach payment screenshot."
      },
      {
        id: "bnb",
        nameAr: "تحويل BNB (للألعاب والبطاقات والاشتراكات)",
        nameEn: "BNB Transfer (Top-ups, Cards & Subscriptions)",
        badge: "BNB",
        icon: "account_balance_wallet",
        color: "bg-amber-600",
        copyValue:
          currencyConfig?.cryptoBnb?.address ||
          currencyConfig?.rewarble?.address ||
          "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
        detailLabelAr: "عنوان المحفظة (BEP20 / BSC Link):",
        detailLabelEn: "Wallet Address (BEP20 Link):",
        instructionsAr:
          currencyConfig?.cryptoBnb?.instructionsAr ||
          "طريقة تحويل عبر BNB معتمدة لكافة الأقسام (شحن الألعاب المباشر، متاجر التطبيقات، أكواد الألعاب، الاشتراكات، و Rewarble): قم بالتحويل إلى رابط المحفظة (0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f) ثم ارفع صورة إشعار التحويل للتأكيد.",
        instructionsEn:
          currencyConfig?.cryptoBnb?.instructionsEn ||
          "Approved BNB transfer method for all sections. Transfer to wallet address then upload receipt.",
        isBnbServices: true
      },
      {
        id: "paypal",
        nameAr: "باي بال PayPal (تلقائي فوري)",
        nameEn: "PayPal (Instant Auto)",
        badge: "PP",
        icon: "payments",
        color: "bg-blue-600",
        copyValue: currencyConfig?.paypal?.email || "paypal@gsmteam.com",
        detailLabelAr: "الدفع التلقائي المباشر عبر PayPal:",
        detailLabelEn: "Direct PayPal Instant Payment:",
        instructionsAr: "ادخل المبلغ واضغط زر الدفع عبر PayPal لإتمام العملية تلقائياً.",
        instructionsEn: "Enter amount and click PayPal button to pay instantly.",
        isAutomaticPayPal: true
      }
    ];
  }, [currencyConfig]);

  const handlePayPalReturnCapture = async (orderId: string, userObj?: any) => {
    setIsLoading(true);
    setIsVerifyingPayPal(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/wallet/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(
          isAr
            ? `تم الدفع واعتماد الشحن التلقائي بمبلغ $${data.amount} USD بنجاح! رصيدك الجديد: $${data.balance}`
            : `Payment successful! $${data.amount} USD added. New balance: $${data.balance}`
        );

        if (userObj || userSession) {
          const updated = { ...(userObj || userSession), balance: data.balance };
          localStorage.setItem("user_session", JSON.stringify(updated));
          setUserSession(updated);
          window.dispatchEvent(new Event("user_session_change"));
        }

        fetchRealTransactions(userObj?.id || userSession?.id, userObj?.email || userSession?.email);

        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setErrorMessage(
          data.error || (isAr ? "تعذر تأكيد عملية الدفع من PayPal" : "Failed to capture PayPal payment")
        );
      }
    } catch {
      setErrorMessage(
        isAr ? "خطأ في الاتصال أثناء تأكيد الدفع عبر PayPal" : "Connection error capturing PayPal payment"
      );
    } finally {
      setIsLoading(false);
      setIsVerifyingPayPal(false);
    }
  };

  const fetchRealTransactions = async (userId?: string, email?: string) => {
    setIsFetchingTx(true);
    try {
      let url = "/api/transactions";
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      else if (email) params.append("email", email);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers, credentials: "include" });
      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json().catch(() => ({ success: false, transactions: [] }));
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setIsFetchingTx(false);
    }
  };

  const normalizedMethodId = selectedMethodId === "rewarble" ? "bnb" : selectedMethodId;
  const activeMethod = paymentMethods.find((m) => m.id === normalizedMethodId) || paymentMethods[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(isAr ? "تم النسخ إلى الحافظة بنجاح" : "Copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage(isAr ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)" : "Please select a valid image file");
      return;
    }

    setReceiptFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = (event.target?.result as string) || "";
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setReceiptImage(compressed);
        } else {
          setReceiptImage(rawDataUrl);
        }
      };
      img.onerror = () => {
        setReceiptImage(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setErrorMessage(isAr ? "تعذر قراءة ملف الصورة" : "Could not read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage(isAr ? "الرجاء إدخال مبلغ إيداع صحيح! (حد أدنى $1.00 USD)" : "Please enter a valid amount (min $1.00)!");
      return;
    }

    if (activeMethod.isAutomaticPayPal) return;

    if (!transactionRef.trim()) {
      setErrorMessage(isAr ? "الرجاء إدخال رقم المعاملة أو رقم الحساب/المحفظة المحول منها!" : "Please enter transaction reference / sender number!");
      return;
    }

    if (!receiptImage) {
      setErrorMessage(isAr ? "يرجى إرفاق صورة إشعار أو إيصال التحويل للمتابعة (إجباري)" : "Please attach transfer receipt image (required)!");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          userId: userSession?.id,
          email: userSession?.email,
          type: isAr ? "طلب شحن محفظة" : "Top-up Request",
          amount: parseFloat(depositAmount),
          method: isAr ? activeMethod.nameAr : activeMethod.nameEn,
          refNo: transactionRef.trim(),
          receiptImage: receiptImage || undefined
        })
      });

      const data = await res.json().catch(() => ({ success: false, error: "تعذر قراءة رد الخادم" }));

      if (res.ok && data.success) {
        const successMsg = isAr
          ? `تم إرسال طلب الشحن بقيمة $${parseFloat(depositAmount).toFixed(2)} وإرفاق إشعار التحويل بنجاح! جاري المراجعة والتفعيل.`
          : `Deposit request of $${parseFloat(depositAmount).toFixed(2)} submitted successfully!`;

        setSuccessMessage(successMsg);
        showToast(isAr ? "تم إرسال الطلب بنجاح!" : "Deposit submitted!");

        setTransactionRef("");
        setReceiptImage("");
        setReceiptFileName("");
        fetchRealTransactions(userSession?.id, userSession?.email);
      } else {
        setErrorMessage(data.error || (isAr ? "فشل إرسال طلب الشحن" : "Failed to submit deposit request"));
      }
    } catch {
      setErrorMessage(isAr ? "تعذر الاتصال بالسيرفر لإتمام طلب الشحن." : "Connection error submitting deposit");
    } finally {
      setIsLoading(false);
    }
  };

  const sdgRate = currencyConfig?.usdToSdg || 2850;
  const userBalanceUsd = userSession?.balance || 0.0;
  const userBalanceSdg = Math.round(userBalanceUsd * sdgRate);

  const pendingCount = transactions.filter(tx => tx.status === "pending").length;
  const visibleTransactions = transactions.filter(tx => {
    const matches = historyFilter === "all" || (historyFilter === "failed" ? !["completed", "pending"].includes(tx.status) : tx.status === historyFilter);
    const query = historyQuery.trim().toLocaleLowerCase();
    return matches && (!query || [tx.refNo, tx.type, tx.method].some(value => (value || "").toLocaleLowerCase().includes(query)));
  });
  const methodIcons: Record<string, typeof Wallet> = {
    bankak: Banknote,
    fawry: Banknote,
    vodafone: Smartphone,
    binance: Bitcoin,
    bnb: Wallet,
    paypal: CreditCard
  };

  const getMethodIcon = (method: PaymentMethod) => {
    if (methodIcons[method.id]) return methodIcons[method.id];
    if (method.icon === "phone_iphone" || method.icon === "smartphone") return Smartphone;
    if (method.icon === "currency_exchange" || method.icon === "bitcoin") return Bitcoin;
    if (method.icon === "payments" || method.icon === "credit_card") return CreditCard;
    if (method.icon === "account_balance_wallet") return Wallet;
    return Banknote;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" dir={isAr ? "rtl" : "ltr"}>
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={36} />
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          {isAr ? "جاري التحقق من الحساب..." : "Verifying account..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !userSession) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <ShieldCheck className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {isAr ? "تسجيل الدخول مطلوب" : "Sign-in Required"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {isAr
              ? "لا يمكنك الوصول إلى المحفظة أو عرض وسائل الدفع دون تسجيل الدخول إلى حسابك."
              : "You must be signed in to access the wallet and view payment methods."}
          </p>
          <Link
            href={`/${lang}/login?redirect=/${lang}/wallet`}
            className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
          >
            {isAr ? "الانتقال إلى صفحة تسجيل الدخول" : "Go to Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <div className={styles.page} dir={isAr ? "rtl" : "ltr"}>
        {toastMessage && <div className={styles.toast + " bg-slate-900 text-white"} role="status"><Check size={17} /><span>{toastMessage}</span></div>}
        <header className={styles.pageHeader}>
          <div><p className={styles.eyebrow}>{isAr ? "حسابك / المحفظة" : "Your account / Wallet"}</p><h1>{isAr ? "كل رصيدك. في مكان واحد." : "Your balance. All in one place."}</h1><p className={styles.subheading}>{isAr ? "اشحن بسهولة، وتابع كل حركة في محفظتك." : "Add funds easily and track every transaction."}</p></div>
          <a href="#wallet-topup" className={styles.headerAction + " bg-blue-600 hover:bg-blue-700 text-white"}>{isAr ? "شحن المحفظة" : "Add funds"}<ArrowUpRight size={20} /></a>
        </header>
        <section className={styles.overview} aria-label={isAr ? "ملخص المحفظة" : "Wallet overview"}>
          <div className={styles.balanceCard + " bg-surface-container shadow-sm"}>
            <div className={styles.balanceTop}><span className={styles.iconTile + " text-blue-600 dark:text-blue-400"}><Wallet size={22} /></span><span className={styles.eyebrow}>BORAI WALLET</span><span className={styles.balanceCurrency}>USD</span></div>
            <div className={styles.balanceContent}><span className={styles.muted}>{isAr ? "رصيدك المتاح" : "Available balance"}</span><div className={styles.balanceValue + " text-blue-600 dark:text-blue-400"} dir="ltr">{userSession ? "$" + userBalanceUsd.toFixed(2) : "—"}<span>USD</span></div><p className={styles.muted}>{userSession ? "≈ " + userBalanceSdg.toLocaleString() + " SDG" : isAr ? "سجّل الدخول لعرض رصيدك" : "Sign in to view your balance"}</p></div>
            <div className={styles.balanceBottom}><span><ShieldCheck size={16} />{isAr ? "رصيد جاهز لخدماتك" : "Ready for your next service"}</span><Wallet size={19} /></div>
            <div className={styles.cardArtwork} aria-hidden="true"><div /><div /><div /></div>
          </div>
          <div className={styles.accountCard + " bg-surface-container shadow-sm"}>
            <div className={styles.accountIdentity}><span className={styles.avatar}>{(userSession?.fullName || "B").slice(0, 1).toUpperCase()}</span><div><h2>{userSession?.fullName || (isAr ? "محفظتك تبدأ من هنا" : "Your wallet starts here")}</h2><p className={styles.muted}>{userSession?.email || (isAr ? "دفع أسهل. متابعة أوضح." : "Easy payments. Clear tracking.")}</p></div></div>
            <div className={styles.accountStats}><div><span className={styles.muted}>{isAr ? "قيد المراجعة في السجل" : "Pending in history"}</span><strong>{isFetchingTx ? "—" : pendingCount}<Clock3 size={17} className="text-amber-600 dark:text-amber-400" /></strong></div><div><span className={styles.muted}>{isAr ? "عمليات في السجل" : "History entries"}</span><strong>{isFetchingTx ? "—" : transactions.length}<ReceiptText size={17} /></strong></div></div>
            <div className={styles.membership}><ShieldCheck size={16} /><span>{userSession?.membershipTier ? (isAr ? userSession.membershipTier.nameAr || userSession.membershipTier.name : userSession.membershipTier.name) + " · " + userSession.membershipTier.discountPercentage + "% " + (isAr ? "خصم" : "discount") : isAr ? "بنكك، فوري، كاش، باينانس وباي بال" : "Bankak, Fawri, Cash, Binance and PayPal"}</span></div>
          </div>
        </section>
        {errorMessage && <div className={styles.alert + " bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"} role="alert"><X size={20} /><span>{errorMessage}</span></div>}
        {successMessage && <div className={styles.alert + " bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"} role="status"><Check size={20} /><span>{successMessage}</span></div>}
        <section id="wallet-topup" className={styles.topup + " bg-surface-container shadow-sm"} aria-labelledby="topup-title">
          <div className={styles.topupHeader}><div><span className={styles.eyebrow}>{isAr ? "أضف إلى رصيدك" : "ADD TO YOUR BALANCE"}</span><h2 id="topup-title">{isAr ? "شحن جديد، بخطوات بسيطة" : "A simple way to add funds"}</h2></div><span className={styles.secure}><ShieldCheck size={16} />{isAr ? "إيصال لكل عملية" : "A receipt for every transfer"}</span></div>
          <div className={styles.topupGrid}>
            <aside className={styles.methods}>
              <div className={styles.sectionTitle}><span className={styles.step + " text-blue-600 dark:text-blue-400"}>01</span><div><h3>{isAr ? "اختر وسيلة الدفع" : "Choose how to pay"}</h3><p className={styles.muted}>{isAr ? "الطريقة المناسبة لك" : "Pick what works for you"}</p></div></div>
              <div className={styles.methodList}>{paymentMethods.map(method => {
                const selected = activeMethod.id === method.id; const Icon = getMethodIcon(method);
                return <button key={method.id} type="button" aria-pressed={selected} aria-label={isAr ? method.nameAr : method.nameEn} onClick={() => { setSelectedMethodId(method.id); setErrorMessage(""); }} className={styles.method + " " + (selected ? styles.methodSelected + " bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500" : "dark:bg-background dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-surface-container-high/30")}><span className={styles.methodIcon + " text-white " + method.color}><Icon size={20} /></span><span className={styles.methodName}><strong>{isAr ? method.nameAr : method.nameEn}</strong><small>{method.badge} · {method.isAutomaticPayPal ? (isAr ? "دفع مباشر" : "Direct payment") : isAr ? "تحويل وإرفاق إيصال" : "Transfer with receipt"}</small></span><span className={styles.radio + " text-blue-600 dark:text-blue-400"}>{selected && <Check size={12} strokeWidth={3} />}</span></button>;
              })}</div>
              <div className={styles.rates}><div className={styles.ratesHeader}><span>{isAr ? "أسعار الصرف" : "Exchange rates"}</span><span className={styles.muted}>1 USD</span></div>{[{code:"SDG", value:sdgRate}, {code:"EGP", value:currencyConfig?.usdToEgp || 50}, {code:"SAR", value:currencyConfig?.usdToSar || 3.75}].map(rate => <div key={rate.code}><span className={styles.muted}>{rate.code}</span><strong dir="ltr">{rate.value.toLocaleString()}</strong></div>)}</div>
            </aside>
            <div className={styles.details}>
              <div className={styles.sectionTitle}><span className={styles.step + " text-blue-600 dark:text-blue-400"}>02</span><div><h3>{isAr ? "المبلغ وتفاصيل التحويل" : "Amount and transfer details"}</h3><p className={styles.muted}>{isAr ? "كل التفاصيل قبل تأكيد طلبك" : "Everything you need before you confirm"}</p></div></div>
              {!activeMethod.isAutomaticPayPal && <div className={styles.transferDetails + " dark:bg-background border dark:border-white/10"}><div className={styles.transferAccount}><div><span className={styles.muted}>{isAr ? activeMethod.detailLabelAr : activeMethod.detailLabelEn}</span><strong dir="ltr">{activeMethod.copyValue || "N/A"}</strong></div>{activeMethod.copyValue && <button type="button" aria-label={isAr ? "نسخ بيانات التحويل" : "Copy transfer details"} onClick={() => handleCopy(activeMethod.copyValue, "method-" + activeMethod.id)} className={styles.copyButton + " text-blue-600 dark:text-blue-400"}>{copiedId === "method-" + activeMethod.id ? <Check size={18} /> : <Copy size={18} />}<span>{copiedId === "method-" + activeMethod.id ? (isAr ? "تم النسخ" : "Copied") : isAr ? "نسخ" : "Copy"}</span></button>}</div><p>{cleanHtmlToText(isAr ? activeMethod.instructionsAr : activeMethod.instructionsEn)}</p></div>}
                          <form onSubmit={handleDepositSubmit} className={styles.form}>
              {/* AMOUNT FIELDS */}
              <div className="space-y-2">
                <label className="text-xs font-bold dark:text-slate-200 uppercase block">
                  {isAr ? "تحديد مبلغ الشحن:" : "Deposit Amount:"}
                </label>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  {["5", "10", "25", "50", "100"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(parseFloat(preset).toFixed(2))}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                        parseFloat(depositAmount) === parseFloat(preset)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "dark:bg-background dark:text-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-surface-container-high"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                {/* Amount Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* USD Amount */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isAr ? "المبلغ بالدولار ($ USD):" : "Amount ($ USD):"}
                    </span>
                    <div className="relative">
                      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 font-bold text-blue-600 dark:text-blue-400">
                        $
                      </span>
                      <input
                        aria-label={isAr ? "المبلغ بالدولار" : "Amount in USD"}
                        type="number"
                        step="0.01"
                        min="1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="10.00"
                        className="w-full dark:bg-background border dark:border-white/10 rounded-xl py-2.5 ps-8 pe-4 dark:text-white font-mono font-bold text-sm focus:outline-none focus:bg-white dark:focus:bg-background focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Sudan SDG Equivalent (for bankak / fawri / SD methods) */}
                  {(activeMethod.isBankak || activeMethod.isFawry || activeMethod.badge === "SD" || activeMethod.badge === "FAWRI") && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {isAr ? "المعادل بالجنيه السوداني (SDG):" : "Equivalent (SDG):"}
                      </span>
                      <div className="relative">
                        <input
                          aria-label={isAr ? "المبلغ بالجنيه السوداني" : "Amount in SDG"}
                          type="number"
                          value={depositSdgAmount}
                          onChange={(e) => handleSdgAmountChange(e.target.value)}
                          placeholder="28500"
                          className="w-full dark:bg-background border dark:border-white/10 rounded-xl py-2.5 px-4 dark:text-white font-mono font-bold text-sm focus:outline-none focus:bg-white dark:focus:bg-background focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                        />
                        <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          SDG
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NON-PAYPAL FIELDS */}
              {!activeMethod.isAutomaticPayPal && (
                <>
                  {/* Transaction Ref Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold dark:text-slate-200 uppercase block">
                      {activeMethod.isBankak
                        ? (isAr ? "رقم إشعار أو عملية بنكك (Transaction ID / Reference):" : "Bankak Reference #:")
                        : activeMethod.isFawry
                        ? (isAr ? "رقم عملية فوري (Transaction ID / Reference):" : "Fawri Reference #:")
                        : (isAr ? "رقم التحويل / رقم المحفظة المحول منها:" : "Transaction Ref / Sender #:")}
                    </label>
                    <input
                      aria-label={isAr ? "رقم المعاملة أو المحفظة" : "Transaction reference or sender number"}
                      type="text"
                      required
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder={
                        isAr
                          ? "مثال: رقم العملية في الإشعار أو رقم حسابك المحول منه"
                          : "e.g. Transaction ID or sender number"
                      }
                      className="w-full dark:bg-background border dark:border-white/10 rounded-xl py-2.5 px-4 dark:text-white font-mono text-sm focus:outline-none focus:bg-white dark:focus:bg-background focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all"
                    />
                  </div>

                  {/* RECEIPT UPLOAD BOX */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold dark:text-slate-200 uppercase flex items-center gap-1.5">
                        <span>{isAr ? "إرفاق صورة إشعار أو إيصال التحويل" : "Attach Transfer Receipt"}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">* ({isAr ? "إجباري" : "Required"})</span>
                      </label>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded-md">
                        {isAr ? "مطلوب للمراجعة" : "Required"}
                      </span>
                    </div>

                    <div
                      className={`${styles.upload} relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl transition-all text-center cursor-pointer ${
                        receiptImage
                          ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                          : "border-slate-300 dark:border-white/15 hover:border-blue-500 dark:bg-background"
                      }`}
                    >
                      <input
                        type="file"
                        aria-label={isAr ? "اختيار صورة الإيصال" : "Choose receipt image"}
                        required={!receiptImage}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />

                      {receiptImage ? (
                        <div className="flex flex-col items-center gap-2.5 w-full">
                          <img
                            src={receiptImage}
                            alt="Receipt Preview"
                            className="max-h-32 w-auto object-contain rounded-xl border dark:border-white/10 shadow-xs"
                          />
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span>{receiptFileName || (isAr ? "تم تجهيز صورة الإيصال" : "Receipt selected")}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptImage("");
                                setReceiptFileName("");
                              }}
                              className="text-rose-600 dark:text-rose-400 hover:underline ms-2 cursor-pointer z-20"
                            >
                              {isAr ? "حذف" : "Remove"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2">
                          <Upload size={28} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                          <p className="text-xs font-bold dark:text-slate-300">
                            {isAr ? "اضغط هنا لاختيار صورة الإشعار من جهازك" : "Click here to upload receipt image"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            JPG, PNG, WEBP (يتم الضغط تلقائياً)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !transactionRef.trim() ||
                      !depositAmount ||
                      parseFloat(depositAmount) <= 0
                    }
                    className={`${styles.submit} w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        <span>{isAr ? "جاري إرسال الطلب..." : "Submitting..."}</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={20} aria-hidden="true" />
                        <span>
                          {isAr
                            ? `تأكيد وإرسال طلب الشحن (${parseFloat(depositAmount || "0").toFixed(2)} USD)`
                            : `Submit Deposit Request (${parseFloat(depositAmount || "0").toFixed(2)} USD)`}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* PAYPAL AUTOMATIC IN-PAGE BUTTON */}
              {activeMethod.isAutomaticPayPal && (
                <div className="space-y-3 pt-2 border-t dark:border-white/5">
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 font-medium">
                    {isAr
                      ? `مبلغ الشحن المعتمد: ${parseFloat(depositAmount || "10.00").toFixed(2)} USD. اضغط زر PayPal أدناه للدفع المباشر.`
                      : `Top-up Amount: ${parseFloat(depositAmount || "10.00").toFixed(2)} USD. Click PayPal button below.`}
                  </div>

                  <div className="w-full relative z-10">
                    <PayPalButtons
                      key={`paypal-btn-${depositAmount || "10"}`}
                      disabled={!depositAmount || parseFloat(depositAmount) < 1.0 || isLoading || isVerifyingPayPal}
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "pay",
                        height: 48
                      }}
                      createOrder={async () => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        const num = parseFloat(depositAmount || "0");
                        if (isNaN(num) || num < 1.0) {
                          setErrorMessage(isAr ? "الحد الأدنى للإيداع هو $1.00 USD" : "Minimum deposit is $1.00 USD");
                          throw new Error("Invalid deposit amount");
                        }

                        const token = localStorage.getItem("user_token");
                        const res = await fetch("/api/wallet/paypal/create-order", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({ amount: num })
                        });

                        const data = await res.json();
                        if (!res.ok || !data.success || !data.orderId) {
                          const errMsg =
                            data.error || (isAr ? "فشل إنشاء طلب الدفع عبر PayPal" : "Failed to create PayPal order");
                          setErrorMessage(errMsg);
                          throw new Error(errMsg);
                        }

                        return data.orderId;
                      }}
                      onApprove={async (data) => {
                        if (data.orderID) {
                          await handlePayPalReturnCapture(data.orderID, userSession);
                        }
                      }}
                      onError={() => {
                        setErrorMessage(isAr ? "حدث خطأ أثناء الاتصال ببوابة PayPal" : "Error connecting to PayPal");
                      }}
                    />
                  </div>
                </div>
              )}
            </form>
              <div className={styles.reviewNote}><ShieldCheck size={16} /><span>{activeMethod.isAutomaticPayPal ? (isAr ? "يُضاف الرصيد بعد تأكيد الدفع من PayPal." : "Funds are added after PayPal confirms payment.") : isAr ? "تُراجع الإدارة الإيصال قبل إضافة الرصيد لمحفظتك." : "Your receipt is reviewed before funds are added to your wallet."}</span></div>
            </div>
          </div>
        </section>
        <section className={styles.history + " bg-surface-container shadow-sm"} aria-labelledby="wallet-history-title">
          <div className={styles.historyHeader}><div><span className={styles.eyebrow}>{isAr ? "نشاط المحفظة" : "WALLET ACTIVITY"}</span><h2 id="wallet-history-title">{isAr ? "سجل معاملاتك" : "Your transactions"}</h2></div><button type="button" onClick={() => fetchRealTransactions(userSession?.id, userSession?.email)} disabled={isFetchingTx} className={styles.refresh + " text-blue-600 dark:text-blue-400"}><RefreshCw size={17} className={isFetchingTx ? "animate-spin" : ""} />{isAr ? "تحديث" : "Refresh"}</button></div>
          <div className={styles.historyToolbar}><div className={styles.filters} role="group" aria-label={isAr ? "تصفية المعاملات" : "Filter transactions"}>{[{id:"all", ar:"الكل", en:"All"},{id:"pending", ar:"قيد المراجعة", en:"Pending"},{id:"completed", ar:"مكتملة", en:"Completed"},{id:"failed", ar:"مرفوضة", en:"Failed"}].map(filter => <button key={filter.id} type="button" aria-pressed={historyFilter === filter.id} onClick={() => setHistoryFilter(filter.id)} className={historyFilter === filter.id ? styles.filterActive + " bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}>{isAr ? filter.ar : filter.en}</button>)}</div><label className={styles.search}><Search size={16} /><input type="search" value={historyQuery} onChange={e => setHistoryQuery(e.target.value)} placeholder={isAr ? "ابحث عن معاملة…" : "Find a transaction…"} aria-label={isAr ? "البحث في معاملات المحفظة" : "Search wallet transactions"} /></label></div>
          {isFetchingTx ? <div className={styles.empty}><RefreshCw size={28} className="animate-spin text-blue-600 dark:text-blue-400" /><strong>{isAr ? "جاري تحميل معاملاتك…" : "Loading your transactions…"}</strong></div> : visibleTransactions.length === 0 ? <div className={styles.empty}><span className={styles.emptyIcon}><ReceiptText size={30} strokeWidth={1.5} /></span><strong>{transactions.length ? (isAr ? "لا توجد معاملات مطابقة" : "No matching transactions") : isAr ? "أول معاملة ليك هتظهر هنا" : "Your first transaction will appear here"}</strong><p>{transactions.length ? (isAr ? "جرّب تغيير البحث أو التصفية." : "Try another search or filter.") : isAr ? "تابع المبلغ، وسيلة الدفع، وحالة كل طلب." : "Track the amount, payment method and status of each request."}</p></div> : <div className={styles.transactionList}>{visibleTransactions.map(tx => <article key={tx.id} className={styles.transaction}><span className={styles.transactionIcon + " text-blue-600 dark:text-blue-400"}><ArrowDownLeft size={21} /></span><div className={styles.transactionDescription}><h3>{tx.type}</h3><p>{tx.method}<span>·</span><span dir="ltr">#{tx.refNo || tx.id.slice(-6).toUpperCase()}</span></p></div><time className={styles.transactionDate} dateTime={tx.createdAt}>{new Date(tx.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"})}</time><div className={styles.transactionAmount}><strong dir="ltr">${(tx.amount || 0).toFixed(2)}<small>USD</small></strong><span className={styles.status + " " + (tx.status === "completed" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" : tx.status === "pending" ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40")}><span />{tx.status === "completed" ? (isAr ? "مكتمل" : "Completed") : tx.status === "pending" ? (isAr ? "قيد المراجعة" : "Pending") : isAr ? "مرفوض" : "Failed"}</span></div></article>)}</div>}
        </section>
        <div className={styles.support}><Headphones size={22} /><div><strong>{isAr ? "محتاج مساعدة في الشحن؟" : "Need a hand adding funds?"}</strong><p>{isAr ? "فريقنا يساعدك في تفاصيل التحويل ومتابعة طلبك." : "Our team can help with transfer details and your request."}</p></div><a href={SITE_CONTACTS.whatsappUrl} target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-400">{isAr ? "تواصل معنا" : "Get in touch"}<ArrowUpRight size={17} /></a></div>
      </div>
    </PayPalScriptProvider>
  );
}
