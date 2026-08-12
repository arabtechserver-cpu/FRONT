"use client";

import { useEffect, useMemo, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "arabtech_user_language";

export const LANGUAGES = [
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl", htmlLang: "ar" },
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr", htmlLang: "en" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", dir: "ltr", htmlLang: "ru" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", dir: "ltr", htmlLang: "zh" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr", htmlLang: "hi" }
];

const ui = {
  ar: {
    language: "اللغة",
    home: "الرئيسية",
    services: "الخدمات",
    categoriesServices: "الأقسام والخدمات",
    allServices: "كل الخدمات",
    imeiServices: "خدمات IMEI",
    serverServices: "خدمات السيرفر",
    remoteServices: "خدمات الريموت",
    orders: "الطلبات",
    myOrders: "طلباتي",
    trackOrders: "تتبع الطلبات",
    wallet: "المحفظة",
    myWallet: "محفظتي",
    chargeWallet: "شحن المحفظة",
    chargeBalance: "شحن رصيدي",
    apiDocs: "الربط عبر الـ API",
    termsRefund: "الشروط وسياسة الاسترجاع",
    support: "الدعم الفني",
    fontSize: "حجم الخط",
    darkMode: "المظهر الليلي",
    logout: "تسجيل الخروج",
    login: "دخول",
    register: "تسجيل",
    loginRegister: "تسجيل الدخول / حساب جديد",
    balance: "الرصيد",
    secureFast: "خدمات آمنة وفورية",
    installApp: "ثبّت تطبيق {site}",
    installAppDesc: "تصفح أسرع وتجربة استخدام أفضل بدون متصفح!",
    installNow: "تثبيت الآن",
    welcomeUser: "مرحباً، {username}",
    availableServices: "الخدمات المتاحة",
    serviceCount: "{count} خدمة متوفرة",
    servicesIntro: "تصفح وابحث في كافة خدمات السوفت وير والتفعيلات والأدوات المتاحة.",
    searchServices: "ابحث عن خدمة، تفعيلات، أدوات...",
    loadingServices: "جاري تحميل الخدمات...",
    noSearchResults: "لا تتوفر خدمات مطابقة للبحث",
    tryOtherSearch: "يرجى تجربة كلمات بحث أخرى أو تصفح الأقسام الرئيسية.",
    backHome: "العودة للرئيسية",
    availablePackages: "الباقات المتوفرة:",
    viewMore: "عرض المزيد",
    clickToView: "اضغط للعرض",
    announcement: "مرحبا بكم في Arab Tech Server، جميع الخدمات متاحة والأسعار مناسبة للجميع",
    whatsapp1: "واتساب 1:",
    whatsapp2: "واتساب 2:",
    supportTitle: "الدعم الفني وتواصل الإدارة",
    supportIntro: "اختر إحدى قنوات الدعم الفني الرسمية للتواصل معنا أو الانضمام إلى مجتمعنا:",
    whatsappAdmin1: "واتساب الإدارة 1",
    whatsappAdmin2: "واتساب الإدارة 2",
    whatsappCommunity: "مجتمع واتساب عرب تك",
    facebookPage: "صفحة فيسبوك عرب تك",
    tiktokAccount: "حساب تيك توك عرب تك",
    telegramChannel: "قناة تيليجرام عرب تك",
    youtubeChannel: "قناة يوتيوب عرب تك",
    emailSupport: "البريد الإلكتروني"
  },
  en: {
    language: "Language",
    home: "Home",
    services: "Services",
    categoriesServices: "Categories & Services",
    allServices: "All Services",
    imeiServices: "IMEI Services",
    serverServices: "Server Services",
    remoteServices: "Remote Services",
    orders: "Orders",
    myOrders: "My Orders",
    trackOrders: "Track Orders",
    wallet: "Wallet",
    myWallet: "My Wallet",
    chargeWallet: "Add Wallet Balance",
    chargeBalance: "Add Balance",
    apiDocs: "API Integration",
    termsRefund: "Terms & Refund Policy",
    support: "Support",
    fontSize: "Font Size",
    darkMode: "Dark Mode",
    logout: "Log Out",
    login: "Login",
    register: "Register",
    loginRegister: "Login / New Account",
    balance: "Balance",
    secureFast: "Secure and instant services",
    installApp: "Install {site}",
    installAppDesc: "Browse faster with a better app-like experience.",
    installNow: "Install Now",
    welcomeUser: "Welcome, {username}",
    availableServices: "Available Services",
    serviceCount: "{count} services available",
    servicesIntro: "Browse and search all available software, activation, and tool services.",
    searchServices: "Search for a service, activation, or tool...",
    loadingServices: "Loading services...",
    noSearchResults: "No matching services found",
    tryOtherSearch: "Try different keywords or browse the main categories.",
    backHome: "Back Home",
    availablePackages: "Available packages:",
    viewMore: "Show more",
    clickToView: "Click to view",
    announcement: "Welcome to Arab Tech Server. All services are available at fair prices.",
    whatsapp1: "WhatsApp 1:",
    whatsapp2: "WhatsApp 2:",
    supportTitle: "Support and management contact",
    supportIntro: "Choose an official support channel to contact us or join our community:",
    whatsappAdmin1: "Management WhatsApp 1",
    whatsappAdmin2: "Management WhatsApp 2",
    whatsappCommunity: "Arab Tech WhatsApp Community",
    facebookPage: "Arab Tech Facebook Page",
    tiktokAccount: "Arab Tech TikTok Account",
    telegramChannel: "Arab Tech Telegram Channel",
    youtubeChannel: "Arab Tech YouTube Channel",
    emailSupport: "Email Support"
  },
  ru: {
    language: "Язык",
    home: "Главная",
    services: "Услуги",
    categoriesServices: "Категории и услуги",
    allServices: "Все услуги",
    imeiServices: "IMEI-услуги",
    serverServices: "Серверные услуги",
    remoteServices: "Удаленные услуги",
    orders: "Заказы",
    myOrders: "Мои заказы",
    trackOrders: "Отслеживание заказов",
    wallet: "Кошелек",
    myWallet: "Мой кошелек",
    chargeWallet: "Пополнить кошелек",
    chargeBalance: "Пополнить баланс",
    apiDocs: "API-интеграция",
    termsRefund: "Условия и возврат",
    support: "Поддержка",
    fontSize: "Размер шрифта",
    darkMode: "Темная тема",
    logout: "Выйти",
    login: "Войти",
    register: "Регистрация",
    loginRegister: "Войти / Новый аккаунт",
    balance: "Баланс",
    secureFast: "Безопасные и быстрые услуги",
    installApp: "Установить {site}",
    installAppDesc: "Быстрее просматривайте сайт в удобном режиме приложения.",
    installNow: "Установить",
    welcomeUser: "Здравствуйте, {username}",
    availableServices: "Доступные услуги",
    serviceCount: "Доступно услуг: {count}",
    servicesIntro: "Просматривайте и ищите доступные услуги, активации и инструменты.",
    searchServices: "Поиск услуги, активации или инструмента...",
    loadingServices: "Загрузка услуг...",
    noSearchResults: "Подходящие услуги не найдены",
    tryOtherSearch: "Попробуйте другие ключевые слова или откройте основные категории.",
    backHome: "На главную",
    availablePackages: "Доступные пакеты:",
    viewMore: "Показать еще",
    clickToView: "Нажмите для просмотра",
    announcement: "Добро пожаловать в Arab Tech Server. Все услуги доступны по хорошим ценам.",
    whatsapp1: "WhatsApp 1:",
    whatsapp2: "WhatsApp 2:",
    supportTitle: "Поддержка и связь с администрацией",
    supportIntro: "Выберите официальный канал поддержки для связи с нами или вступите в сообщество:",
    whatsappAdmin1: "WhatsApp администрации 1",
    whatsappAdmin2: "WhatsApp администрации 2",
    whatsappCommunity: "Сообщество Arab Tech в WhatsApp",
    facebookPage: "Страница Arab Tech в Facebook",
    tiktokAccount: "Аккаунт Arab Tech в TikTok",
    telegramChannel: "Канал Arab Tech в Telegram",
    youtubeChannel: "Канал Arab Tech на YouTube",
    emailSupport: "Email поддержка"
  },
  zh: {
    language: "语言",
    home: "首页",
    services: "服务",
    categoriesServices: "分类和服务",
    allServices: "全部服务",
    imeiServices: "IMEI 服务",
    serverServices: "服务器服务",
    remoteServices: "远程服务",
    orders: "订单",
    myOrders: "我的订单",
    trackOrders: "订单跟踪",
    wallet: "钱包",
    myWallet: "我的钱包",
    chargeWallet: "充值钱包",
    chargeBalance: "充值余额",
    apiDocs: "API 对接",
    termsRefund: "条款和退款政策",
    support: "技术支持",
    fontSize: "字体大小",
    darkMode: "深色模式",
    logout: "退出登录",
    login: "登录",
    register: "注册",
    loginRegister: "登录 / 新账户",
    balance: "余额",
    secureFast: "安全快速的服务",
    installApp: "安装 {site}",
    installAppDesc: "更快浏览，获得更好的应用体验。",
    installNow: "立即安装",
    welcomeUser: "欢迎，{username}",
    availableServices: "可用服务",
    serviceCount: "{count} 个服务可用",
    servicesIntro: "浏览并搜索所有可用的软件、激活和工具服务。",
    searchServices: "搜索服务、激活或工具...",
    loadingServices: "正在加载服务...",
    noSearchResults: "没有找到匹配的服务",
    tryOtherSearch: "请尝试其他关键词或浏览主要分类。",
    backHome: "返回首页",
    availablePackages: "可用套餐：",
    viewMore: "显示更多",
    clickToView: "点击查看",
    announcement: "欢迎来到 Arab Tech Server，所有服务均可用，价格合理。",
    whatsapp1: "WhatsApp 1：",
    whatsapp2: "WhatsApp 2：",
    supportTitle: "技术支持和管理联系",
    supportIntro: "请选择官方支持渠道联系我们或加入我们的社区：",
    whatsappAdmin1: "管理 WhatsApp 1",
    whatsappAdmin2: "管理 WhatsApp 2",
    whatsappCommunity: "Arab Tech WhatsApp 社区",
    facebookPage: "Arab Tech Facebook 页面",
    tiktokAccount: "Arab Tech TikTok 账号",
    telegramChannel: "Arab Tech Telegram 频道",
    youtubeChannel: "Arab Tech YouTube 频道",
    emailSupport: "邮件支持"
  },
  hi: {
    language: "भाषा",
    home: "होम",
    services: "सेवाएं",
    categoriesServices: "श्रेणियां और सेवाएं",
    allServices: "सभी सेवाएं",
    imeiServices: "IMEI सेवाएं",
    serverServices: "सर्वर सेवाएं",
    remoteServices: "रिमोट सेवाएं",
    orders: "ऑर्डर",
    myOrders: "मेरे ऑर्डर",
    trackOrders: "ऑर्डर ट्रैक करें",
    wallet: "वॉलेट",
    myWallet: "मेरा वॉलेट",
    chargeWallet: "वॉलेट बैलेंस जोड़ें",
    chargeBalance: "बैलेंस जोड़ें",
    apiDocs: "API इंटीग्रेशन",
    termsRefund: "नियम और रिफंड नीति",
    support: "सपोर्ट",
    fontSize: "फॉन्ट आकार",
    darkMode: "डार्क मोड",
    logout: "लॉग आउट",
    login: "लॉगिन",
    register: "रजिस्टर",
    loginRegister: "लॉगिन / नया अकाउंट",
    balance: "बैलेंस",
    secureFast: "सुरक्षित और तुरंत सेवाएं",
    installApp: "{site} इंस्टॉल करें",
    installAppDesc: "तेज ब्राउज़िंग और बेहतर ऐप जैसा अनुभव पाएं।",
    installNow: "अभी इंस्टॉल करें",
    welcomeUser: "स्वागत है, {username}",
    availableServices: "उपलब्ध सेवाएं",
    serviceCount: "{count} सेवाएं उपलब्ध",
    servicesIntro: "सभी उपलब्ध सॉफ्टवेयर, एक्टिवेशन और टूल सेवाएं खोजें।",
    searchServices: "सेवा, एक्टिवेशन या टूल खोजें...",
    loadingServices: "सेवाएं लोड हो रही हैं...",
    noSearchResults: "कोई मिलती-जुलती सेवा नहीं मिली",
    tryOtherSearch: "दूसरे शब्द खोजें या मुख्य श्रेणियां देखें।",
    backHome: "होम पर वापस",
    availablePackages: "उपलब्ध पैकेज:",
    viewMore: "और दिखाएं",
    clickToView: "देखने के लिए क्लिक करें",
    announcement: "Arab Tech Server में आपका स्वागत है। सभी सेवाएं उचित कीमतों पर उपलब्ध हैं।",
    whatsapp1: "WhatsApp 1:",
    whatsapp2: "WhatsApp 2:",
    supportTitle: "सपोर्ट और मैनेजमेंट संपर्क",
    supportIntro: "हमसे संपर्क करने या समुदाय से जुड़ने के लिए आधिकारिक सपोर्ट चैनल चुनें:",
    whatsappAdmin1: "मैनेजमेंट WhatsApp 1",
    whatsappAdmin2: "मैनेजमेंट WhatsApp 2",
    whatsappCommunity: "Arab Tech WhatsApp समुदाय",
    facebookPage: "Arab Tech Facebook पेज",
    tiktokAccount: "Arab Tech TikTok अकाउंट",
    telegramChannel: "Arab Tech Telegram चैनल",
    youtubeChannel: "Arab Tech YouTube चैनल",
    emailSupport: "ईमेल सपोर्ट"
  }
};

const phraseMap = {
  "الرئيسية": "home",
  "الخدمات": "services",
  "الأقسام والخدمات": "categoriesServices",
  "كل الخدمات": "allServices",
  "طلباتى": "myOrders",
  "طلباتي": "myOrders",
  "الطلبات": "orders",
  "تتبع الطلبات": "trackOrders",
  "المحفظة": "wallet",
  "محفظتي": "myWallet",
  "شحن المحفظة": "chargeWallet",
  "شحن رصيدي": "chargeBalance",
  "الربط عبر الـ API": "apiDocs",
  "الشروط وسياسة الاسترجاع": "termsRefund",
  "الدعم الفني": "support",
  "حجم الخط": "fontSize",
  "المظهر الليلي": "darkMode",
  "تسجيل الخروج": "logout",
  "تسجيل": "register",
  "دخول": "login",
  "تسجيل الدخول / حساب جديد": "loginRegister",
  "الرصيد:": "balance",
  "خدمات آمنة وفورية ⚡": "secureFast",
  "الخدمات المتاحة": "availableServices",
  "جاري تحميل الخدمات...": "loadingServices",
  "لا تتوفر خدمات مطابقة للبحث": "noSearchResults",
  "يرجى تجربة كلمات بحث أخرى أو تصفح الأقسام الرئيسية.": "tryOtherSearch",
  "العودة للرئيسية": "backHome",
  "الباقات المتوفرة:": "availablePackages",
  "عرض المزيد": "viewMore",
  "اضغط للعرض": "clickToView",
  "واتساب 1:": "whatsapp1",
  "واتساب 2:": "whatsapp2",
  "الدعم الفني وتواصل الإدارة": "supportTitle",
  "اختر أحد قنوات الدعم الفني الرسمية للتواصل معنا أو الانضمام إلى مجتمعنا:": "supportIntro",
  "واتساب الإدارة 1": "whatsappAdmin1",
  "واتساب الإدارة 2": "whatsappAdmin2",
  "مجتمع واتساب عرب تك": "whatsappCommunity",
  "صفحة فيسبوك عرب تك": "facebookPage",
  "حساب تيك توك عرب تك": "tiktokAccount",
  "قناة تيليجرام عرب تك": "telegramChannel",
  "قناة يوتيوب عرب تك": "youtubeChannel",
  "البريد الإلكتروني": "emailSupport"
};

function normalizeLanguage(code) {
  if (code === "zh-CN") return "zh";
  return LANGUAGES.some((lang) => lang.code === code) ? code : "ar";
}

export function getSavedLanguage() {
  if (typeof window === "undefined") return "ar";
  return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || "ar");
}

export function setSiteLanguage(languageCode) {
  if (typeof window === "undefined") return;
  const nextLanguage = normalizeLanguage(languageCode);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  window.dispatchEvent(new CustomEvent("arabtech-language-change", { detail: nextLanguage }));
}

export function getLanguageMeta(languageCode) {
  return LANGUAGES.find((lang) => lang.code === normalizeLanguage(languageCode)) || LANGUAGES[0];
}

export function translate(key, languageCode = "ar", values = {}) {
  const language = normalizeLanguage(languageCode);
  const template = ui[language]?.[key] || ui.ar[key] || key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

function replaceTextWithDictionary(text, languageCode) {
  if (languageCode === "ar") return text;
  let nextText = text;

  Object.entries(phraseMap).forEach(([arabicPhrase, key]) => {
    const translated = translate(key, languageCode);
    nextText = nextText.replaceAll(arabicPhrase, translated);
  });

  return nextText;
}

export function applyStaticTranslations(languageCode) {
  if (typeof document === "undefined") return;
  const language = normalizeLanguage(languageCode);
  const meta = getLanguageMeta(language);

  document.documentElement.lang = meta.htmlLang;
  document.documentElement.dir = meta.dir;
  document.body?.setAttribute("dir", meta.dir);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-i18n-skip], script, style, textarea, input, select, option, code, pre")) {
        return NodeFilter.FILTER_REJECT;
      }
      const text = node.nodeValue || "";
      return text.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    if (!node.__arabtechOriginalText) {
      node.__arabtechOriginalText = node.nodeValue;
    }
    const translatedText = replaceTextWithDictionary(node.__arabtechOriginalText, language);
    if (node.nodeValue !== translatedText) {
      node.nodeValue = translatedText;
    }
  });
}

export function useI18n() {
  const [language, setLanguage] = useState("ar");

  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    setLanguage(savedLanguage);
    applyStaticTranslations(savedLanguage);

    const handleLanguageChange = (event) => {
      const nextLanguage = normalizeLanguage(event.detail || getSavedLanguage());
      setLanguage(nextLanguage);
      applyStaticTranslations(nextLanguage);
    };

    window.addEventListener("arabtech-language-change", handleLanguageChange);
    return () => window.removeEventListener("arabtech-language-change", handleLanguageChange);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyStaticTranslations(language);
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [language]);

  return useMemo(() => ({
    language,
    meta: getLanguageMeta(language),
    languages: LANGUAGES,
    setLanguage: setSiteLanguage,
    t: (key, values) => translate(key, language, values)
  }), [language]);
}
