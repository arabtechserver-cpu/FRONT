export const PRIMARY_SERVICE_MAPPINGS: Record<string, string> = {
  pubg: "67e4e321-3960-486d-992d-53e3cf749cab",
  "8ball": "48d93ea6-edd7-4f07-8b05-a7a91ba4cf13",
  "8ballpool": "48d93ea6-edd7-4f07-8b05-a7a91ba4cf13",
  pool: "48d93ea6-edd7-4f07-8b05-a7a91ba4cf13",
  freefire: "c41bd577-c172-482b-a0f7-b553fad84300",
  starlink: "fe14ba68-8989-4634-9c17-9ece0d50a6f9",
  fcmobile: "d5182f4b-fb1a-449e-973e-f53d27f04cfb",
  fifa: "d5182f4b-fb1a-449e-973e-f53d27f04cfb",
  tiktok: "bedcce9a-dd89-40c1-869a-a5c5ee97dcc3",
  lordsmobile: "3daf900c-91ef-46b2-b169-412ea3dac55f",
  visa: "fff2b321-a6a3-4b32-b80c-920ea56f6a3e",
  redotpay: "fff2b321-a6a3-4b32-b80c-920ea56f6a3e",
  itunes: "266e8362-d3f8-4ffd-8813-b43238a2868b",
  apple: "266e8362-d3f8-4ffd-8813-b43238a2868b",
  razer: "e74e8643-2d9e-40a8-9d3f-b4b175e9c715",
  steam: "5b164875-f91f-4abd-871e-00dff1ecd966",
  playstation: "f12cc2f9-b8be-4489-b827-5bf2f4637f10",
  psn: "f12cc2f9-b8be-4489-b827-5bf2f4637f10",
  xbox: "f12cc2f9-b8be-4489-b827-5bf2f4637f10",
  chimera: "52edf5bd-1bc7-4bdb-a3c9-e48082f29cff",
  unlocktool: "3d6d6791-c640-4045-8044-9f997cb46488",
  borneo: "1fcef2a5-734c-433d-8af8-2a0ddaa4d196",
  iremoval: "d16ed3f1-61ec-4cba-bdbb-e3792d8b436b",
  dft: "2fc70a99-e36b-4e1d-bc17-64a346c2b110",
  mobilesea: "d19b3df0-9bee-4347-94a9-c744994efc7b",
  amt: "2993a886-9314-426a-9c21-c112e67c9dc8",
  phoenix: "00a1e58e-45ae-49fb-b1b7-8a77460b87f1",
  cheetah: "5f6036dc-766e-44a0-93f7-d3620f9aaf2e",
  samsung: "6f9e3d09-9629-4b03-ac16-b064ab02cd9f",
  asignal: "6eee6ee3-425a-4152-b543-bc87c4c7dac2",
  asignall: "6eee6ee3-425a-4152-b543-bc87c4c7dac2",
  hiddenicloud: "6eee6ee3-425a-4152-b543-bc87c4c7dac2",
  xiaomiremove: "b3775dc6-52ba-436a-8d18-310c2fb9ca48"
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function resolveServiceId(query: string, categories?: any[]): string {
  if (!query) return PRIMARY_SERVICE_MAPPINGS.pubg;
  const rawLower = query.trim().toLowerCase();
  const normalized = normalizeKey(query);

  for (const [key, id] of Object.entries(PRIMARY_SERVICE_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return id;
    }
  }

  // Arabic keyword matching
  if (rawLower.includes("ببجي") || rawLower.includes("بوجي")) return PRIMARY_SERVICE_MAPPINGS.pubg;
  if (rawLower.includes("بلياردو") || rawLower.includes("8 بول")) return PRIMARY_SERVICE_MAPPINGS["8ballpool"];
  if (rawLower.includes("فري فاير")) return PRIMARY_SERVICE_MAPPINGS.freefire;
  if (rawLower.includes("استارلينك") || rawLower.includes("ستارلينك")) return PRIMARY_SERVICE_MAPPINGS.starlink;
  if (rawLower.includes("فيفا")) return PRIMARY_SERVICE_MAPPINGS.fcmobile;
  if (rawLower.includes("تيك توك")) return PRIMARY_SERVICE_MAPPINGS.tiktok;
  if (rawLower.includes("لوردس")) return PRIMARY_SERVICE_MAPPINGS.lordsmobile;
  if (rawLower.includes("شيميرا")) return PRIMARY_SERVICE_MAPPINGS.chimera;
  if (rawLower.includes("بورنيو")) return PRIMARY_SERVICE_MAPPINGS.borneo;
  if (rawLower.includes("انلوك")) return PRIMARY_SERVICE_MAPPINGS.unlocktool;
  if (rawLower.includes("ايتونز")) return PRIMARY_SERVICE_MAPPINGS.itunes;
  if (rawLower.includes("ريزر")) return PRIMARY_SERVICE_MAPPINGS.razer;
  if (rawLower.includes("استيم")) return PRIMARY_SERVICE_MAPPINGS.steam;
  if (rawLower.includes("بلايستيشن")) return PRIMARY_SERVICE_MAPPINGS.playstation;

  // Search through categories if provided
  if (categories && Array.isArray(categories)) {
    const allServices: any[] = [];
    categories.forEach((cat: any) => {
      (cat.services || []).forEach((s: any) => {
        if (s && s.isActive !== false) allServices.push(s);
      });
    });

    // 1. Exact match on groupName
    const exactGroup = allServices.find(
      (s) => (s.groupName || "").trim().toLowerCase() === rawLower
    );
    if (exactGroup?.id) return exactGroup.id;

    // 2. Partial group match
    const partialGroup = allServices.find(
      (s) => (s.groupName || "").toLowerCase().includes(rawLower) || rawLower.includes((s.groupName || "").toLowerCase())
    );
    if (partialGroup?.id) return partialGroup.id;

    // 3. Match on service name
    const nameMatch = allServices.find(
      (s) => (s.name || "").toLowerCase().includes(rawLower)
    );
    if (nameMatch?.id) return nameMatch.id;
  }

  return PRIMARY_SERVICE_MAPPINGS.pubg;
}

let cachedServices: any[] | null = null;
let lastFetchTime = 0;

export async function resolveServiceIdAsync(query: string): Promise<string> {
  const syncId = resolveServiceId(query);
  if (syncId !== PRIMARY_SERVICE_MAPPINGS.pubg || query.toLowerCase().includes("pubg")) {
    return syncId;
  }

  const now = Date.now();
  if (!cachedServices || now - lastFetchTime > 60000) {
    try {
      const candidates = [
        process.env.INTERNAL_API_URL,
        process.env.NEXT_PUBLIC_API_URL,
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "https://api.borai.store"
      ].filter(Boolean);

      const res = await Promise.any(
        candidates.map(async (c) => {
          const clean = (c as string).replace(/\/$/, "");
          const r = await fetch(`${clean}/api/dhru/services?view=pricing`, {
            signal: AbortSignal.timeout(1500)
          });
          if (!r.ok) throw new Error("HTTP error");
          return r.json();
        })
      );
      if (Array.isArray(res)) {
        cachedServices = res;
        lastFetchTime = now;
      }
    } catch {
      // ignore
    }
  }

  if (cachedServices) {
    const id = resolveServiceId(query, cachedServices);
    if (id) return id;
  }

  return PRIMARY_SERVICE_MAPPINGS.pubg;
}

export function getPurchaseUrl(queryOrId: string, lang: string = "ar"): string {
  const serviceId = resolveServiceId(queryOrId);
  return `/${lang}/purchase?serviceId=${serviceId}`;
}
