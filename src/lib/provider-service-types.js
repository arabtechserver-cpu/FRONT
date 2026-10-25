const VALID_SERVICE_TYPES = [
  "imei",
  "server",
  "remote",
  "topups",
  "appstores",
  "gamecodes",
  "subscriptions",
  "esim"
];

function refinePackageGroupName(rawGroup, serviceName) {
  const g = String(rawGroup || "").trim();
  const lowerG = g.toLowerCase();
  const isGeneric =
    !g ||
    lowerG === "server default group" ||
    lowerG === "imei default group" ||
    lowerG === "remote default group" ||
    lowerG === "default group" ||
    lowerG === "server services" ||
    lowerG === "imei services" ||
    lowerG === "general" ||
    lowerG === "باقة عامة";

  if (!isGeneric) return g;

  const s = String(serviceName || "").toLowerCase();
  if (s.includes("pubg")) return "PUBG Mobile (شدات وباقات)";
  if (s.includes("free fire")) return "Free Fire (جواهر وبطاقات)";
  if (s.includes("efootball")) return "eFootball (Coins & Points)";
  if (s.includes("tiktok")) return "TikTok (عملات ومتابعين)";
  if (s.includes("google play")) return "Google Play Gift Cards";
  if (s.includes("itunes")) return "iTunes & Apple Gift Cards";
  if (s.includes("bein sport")) return "Bein Sport الاشتراكات";
  if (s.includes("cheetah")) return "Cheetah Tool";
  if (s.includes("chimera")) return "Chimera Tool";
  if (s.includes("eft")) return "EFT Dongle & Tool";
  if (s.includes("dft")) return "DFT PRO Tool";
  if (s.includes("halabtech")) return "HalabTech Support";
  if (s.includes("hydra")) return "Hydra Tool";
  if (s.includes("griffin")) return "Griffin Unlocker";
  if (s.includes("tsm")) return "TSM Tool Pro";
  if (s.includes("sigma")) return "Sigma Plus Activations";
  if (s.includes("sk-unloker") || s.includes("sk-tool")) return "SK-Unlocker Tool";
  if (s.includes("tfm")) return "TFM Pro Tool";
  if (s.includes("muslim odin")) return "Muslim Odin Tool";
  if (s.includes("z3x")) return "Z3X SamsTool";
  if (s.includes("amt")) return "AMT Android Multi Tool";
  if (s.includes("facebook") || s.includes("twitter")) return "Social Media (خدمات التواصل)";
  if (s.includes("idm") || s.includes("internet download")) return "برامج وتراخيص (PC Software)";
  if (s.includes("mastercard") || s.includes("redotpay")) return "بطاقات مصرفية (Cards)";
  if (s.includes("mdmfix")) return "MdmFixTool";
  if (s.includes("an tool")) return "AN TOOL";

  return g;
}

function getProviderServiceType(service) {
  const directType = String(service?.api_service_type || service?.apiServiceType || service?.service_type || "").toLowerCase().trim();
  if (["topups", "appstores", "gamecodes", "subscriptions", "esim"].includes(directType)) return directType;
  if (directType === "gamecurrency" || directType === "game_codes") return "gamecodes";
  if (directType === "app_stores" || directType === "appstore") return "appstores";
  if (directType === "topup" || directType === "top_ups" || directType === "in-game top-ups") return "topups";
  if (directType === "sub" || directType === "subscription") return "subscriptions";

  const name = String(service?.name || service?.service_name || service?.originalName || "").toLowerCase();
  const group = String(service?.groupName || service?.group_name || "").toLowerCase();
  const cat = String(service?.category_name || service?.categoryName || service?.dhruCategory?.name || service?.category?.name || "").toLowerCase();
  const text = `${cat} ${group} ${name}`;

  // 1. App Stores & Gift Cards
  if (
    text.includes("itunes") ||
    text.includes("google play") ||
    text.includes("app store") ||
    text.includes("appstore") ||
    text.includes("apple store") ||
    text.includes("متجر") ||
    text.includes("متاجر")
  ) {
    return "appstores";
  }

  // 2. In-Game Top-Ups
  if (
    text.includes("pubg") ||
    text.includes("free fire") ||
    text.includes("efootball") ||
    text.includes("diamonds") ||
    text.includes("diamond") ||
    text.includes("uc ") ||
    text.includes(" uc") ||
    text.includes("coins") ||
    text.includes("player id") ||
    text.includes("شدات") ||
    text.includes("جواهر") ||
    text.includes("بالايدي") ||
    text.includes("بلاير ايدي") ||
    text.includes("تيك توك") ||
    text.includes("tiktok") ||
    text.includes("topup") ||
    text.includes("top-up") ||
    text.includes("roblox") ||
    text.includes("valorant") ||
    text.includes("mobile legends") ||
    text.includes("brawl stars") ||
    text.includes("fifa") ||
    text.includes("cod mobile") ||
    text.includes("شحن")
  ) {
    return "topups";
  }

  // 3. Game Codes & Digital Cards
  if (
    text.includes("gift card") ||
    text.includes("recharge card") ||
    text.includes("card pin") ||
    text.includes("قسيمة") ||
    text.includes("voucher") ||
    text.includes("steam") ||
    text.includes("playstation") ||
    text.includes("psn") ||
    text.includes("xbox") ||
    text.includes("razer") ||
    text.includes("بطاقة") ||
    text.includes("بطاق")
  ) {
    return "gamecodes";
  }

  // 4. Subscriptions
  if (
    text.includes("bein sport") ||
    text.includes("netflix") ||
    text.includes("shahid") ||
    text.includes("iptv") ||
    text.includes("spotify") ||
    text.includes("youtube premium") ||
    text.includes("اشتراك") ||
    text.includes("اشتراكات")
  ) {
    return "subscriptions";
  }

  // 5. eSIM
  if (
    (text.includes("esim") || text.includes("شريحة إلكترونية") || text.includes("شرائح إلكترونية") || text.includes("شريحة انترنت")) &&
    !text.includes("compatibility") &&
    !text.includes("check") &&
    !text.includes("imei")
  ) {
    return "esim";
  }

  // 6. Generic code/pin (excluding GSM unlock/repair codes)
  if (
    (text.includes("كود") || text.includes("code")) &&
    !text.includes("nck") &&
    !text.includes("unlock") &&
    !text.includes("schematic") &&
    !text.includes("activation") &&
    !text.includes("tool") &&
    !text.includes("otp") &&
    !text.includes("repair") &&
    !text.includes("bypass") &&
    !text.includes("frp") &&
    !text.includes("passcode") &&
    !text.includes("hello") &&
    !text.includes("lumia") &&
    !text.includes("motorola") &&
    !text.includes("samsung") &&
    !text.includes("sony") &&
    !text.includes("htc") &&
    !text.includes("huawei") &&
    !text.includes("xiaomi") &&
    !text.includes("apple") &&
    !text.includes("carrier") &&
    !text.includes("simlock")
  ) {
    return "gamecodes";
  }

  // GSM Types
  if (cat.includes("remote") || group.includes("remote") || directType.includes("remote")) return "remote";
  if (cat.includes("imei") || group.includes("imei") || directType.includes("imei")) return "imei";
  if (cat.includes("server") || group.includes("server") || directType.includes("server")) return "server";

  return "unknown";
}

function getProviderServiceTypeCounts(services) {
  const counts = {
    all: services.length,
    imei: 0,
    server: 0,
    remote: 0,
    topups: 0,
    gamecodes: 0,
    appstores: 0,
    subscriptions: 0,
    esim: 0
  };
  for (const service of services) {
    const type = getProviderServiceType(service);
    if (type in counts && type !== "all") counts[type] += 1;
  }
  return counts;
}

function filterProviderServicesByType(services, selectedType) {
  if (selectedType === "all") return services;
  return services.filter((service) => getProviderServiceType(service) === selectedType);
}

function getProviderServiceTypeLabel(type) {
  switch (type) {
    case "imei":
      return "IMEI";
    case "server":
      return "Server";
    case "remote":
      return "Remote";
    case "topups":
      return "شحن ألعاب";
    case "gamecodes":
      return "أكواد وبطاقات";
    case "appstores":
      return "متاجر وتطبيقات";
    case "subscriptions":
      return "اشتراكات";
    case "esim":
      return "eSIM";
    default:
      return "عام";
  }
}

module.exports = {
  filterProviderServicesByType,
  getProviderServiceType,
  getProviderServiceTypeCounts,
  getProviderServiceTypeLabel,
  refinePackageGroupName,
  VALID_SERVICE_TYPES
};
