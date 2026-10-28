const { getUserAuthToken } = require('./client-auth-token');

/** A rejected authenticated request must never become a successful guest cart. */
async function requestCart(fetcher, storage, path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getUserAuthToken(storage);
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetcher(path, { ...options, headers, credentials: 'include' });
  } catch {
    throw new Error('تعذر الاتصال بالسيرفر. تحقق من الاتصال وحاول مجددًا.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true) {
    const error = new Error(response.status === 401
      ? 'انتهت جلسة الدخول. سجّل الدخول مجددًا لإتمام الشراء.'
      : data.error || 'تعذر تحديث سلة المشتريات. حاول مجددًا.');
    error.status = response.status;
    throw error;
  }
  return data;
}

module.exports = { requestCart };
