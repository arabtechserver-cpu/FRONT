/**
 * Load persisted services or live provider preview based on source preference.
 *
 * @param {string} providerId
 * @param {(url: string) => Promise<{ ok: boolean, data: any }>} request
 * @param {"auto" | "stored" | "remote"} [sourcePreference="auto"]
 * @returns {Promise<{ services: any[], source: "stored" | "remote" }>}
 */
async function loadProviderServicesForBrowse(providerId, request, sourcePreference = "auto") {
  if (sourcePreference === "remote") {
    const liveResponse = await request(`/api/providers/${providerId}/fetch-services`);
    const liveServices = Array.isArray(liveResponse.data?.services)
      ? liveResponse.data.services
      : [];

    if (liveResponse.ok && liveResponse.data?.success && liveServices.length > 0) {
      return { services: liveServices, source: "remote" };
    }
    throw new Error(liveResponse.data?.error || "لم يتم العثور على خدمات في API المزود أو تعذر الاتصال");
  }

  if (sourcePreference === "stored") {
    const storedResponse = await request(`/api/providers/${providerId}/services`);
    const storedServices = Array.isArray(storedResponse.data?.services)
      ? storedResponse.data.services
      : [];

    if (storedResponse.ok && storedResponse.data?.success) {
      return { services: storedServices, source: "stored" };
    }
    throw new Error(storedResponse.data?.error || "فشل جلب الخدمات المحفوظة للمزود");
  }

  // Default "auto": Check stored first, fall back to remote
  let storedError = "";
  try {
    const storedResponse = await request(`/api/providers/${providerId}/services`);
    const storedServices = Array.isArray(storedResponse.data?.services)
      ? storedResponse.data.services
      : [];

    if (storedResponse.ok && storedResponse.data?.success && storedServices.length > 0) {
      return { services: storedServices, source: "stored" };
    }
    storedError = storedResponse.data?.error || "";
  } catch (error) {
    // A cancelled browse must not start another remote request.
    if (error?.name === "AbortError") throw error;
    storedError = error instanceof Error ? error.message : String(error || "");
  }

  const liveResponse = await request(`/api/providers/${providerId}/fetch-services`);
  const liveServices = Array.isArray(liveResponse.data?.services)
    ? liveResponse.data.services
    : [];

  if (liveResponse.ok && liveResponse.data?.success && liveServices.length > 0) {
    return { services: liveServices, source: "remote" };
  }

  throw new Error(liveResponse.data?.error || storedError || "لم يتم العثور على خدمات للمزود");
}

module.exports = { loadProviderServicesForBrowse };
