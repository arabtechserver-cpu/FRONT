const { getUserAuthToken } = require('./client-auth-token');

/** A rejected authenticated request must never become a successful guest cart. */
async function requestCart(fetcher, storage, path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getUserAuthToken(storage);
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const session = JSON.parse(storage.getItem('user_session') || 'null');
    if (typeof session?.id === 'string' && session.id) headers['x-cart-user-id'] = session.id;
  } catch { /* A cookie-only session can still be authenticated by the server. */ }
  let response;
  try {
    response = await fetcher(path, { ...options, headers, credentials: 'include', cache: 'no-store' });
  } catch {
    throw new Error('تعذر الاتصال بالسيرفر. تحقق من الاتصال وحاول مجددًا.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success !== true) {
    const error = new Error(response.status === 401
      ? 'انتهت جلسة الدخول. سجّل الدخول مجددًا لإتمام الشراء.'
      : data.error || 'تعذر تحديث سلة المشتريات. حاول مجددًا.');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

module.exports = { requestCart };
