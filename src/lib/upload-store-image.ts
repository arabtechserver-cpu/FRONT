export async function uploadStoreImage(file: File, catalog = true) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('اختر صورة JPG أو PNG أو WebP');
  if (file.size > 10 * 1024 * 1024) throw new Error('حجم الصورة يجب ألا يتجاوز 10 ميجابايت');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const limit = catalog ? 960 : 1920;
  const scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذرت معالجة الصورة');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  } finally { bitmap.close(); }
  const response = await fetch('/api/upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: canvas.toDataURL('image/webp', catalog ? .8 : .85), filename: file.name, ...(catalog ? { purpose: 'catalog' } : {}) })
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'تعذر رفع الصورة');
  return data as { url: string; size: number; id: string };
}
