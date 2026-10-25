"use client";

import { useRef, useState } from 'react';
import { uploadStoreImage } from '@/lib/upload-store-image';

export default function CatalogImageControl({ imageUrl, target, label, onSaved }: {
  imageUrl?: string | null;
  target: { serviceId: string } | { categoryId: string; groupName: string };
  label: string;
  onSaved: (url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  async function save(url: string | null) {
    const response = await fetch('/api/dhru/services/image', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...target, imageUrl: url })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'تعذر حفظ الصورة');
    onSaved(url);
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setMessage(''); setError(false);
    try {
      const result = await uploadStoreImage(file);
      await save(result.url);
      setMessage(`محفوظة في قاعدة البيانات • ${Math.ceil(result.size / 1024)} كيلوبايت`);
    } catch (e) { setError(true); setMessage(e instanceof Error ? e.message : 'تعذر رفع الصورة'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div className="flex flex-wrap items-center gap-2 text-xs">
    {imageUrl && <img src={imageUrl} width={44} height={44} alt={`صورة ${label}`} loading="lazy" decoding="async" className="h-11 w-11 rounded-lg object-cover border border-outline-variant/30" />}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={`رفع صورة ${label}`} onChange={e => upload(e.target.files?.[0])} />
    <button type="button" disabled={busy} onClick={() => input.current?.click()} className="px-3 py-2 rounded-lg border border-primary/30 text-primary bg-primary/10 font-bold disabled:opacity-50">{busy ? 'جاري الضغط والحفظ…' : imageUrl ? 'تغيير الصورة' : `رفع صورة ${label}`}</button>
    {imageUrl && <button type="button" disabled={busy} className="text-on-surface-variant underline" onClick={async () => {
      setBusy(true); setError(false);
      try { await save(null); setMessage('تمت إزالة الصورة من هذا العنصر'); }
      catch (e) { setError(true); setMessage(e instanceof Error ? e.message : 'تعذرت الإزالة'); }
      finally { setBusy(false); }
    }}>إزالة</button>}
    {message && <span role={error ? 'alert' : 'status'} className={error ? 'text-red-400' : 'text-emerald-400'}>{message}</span>}
  </div>;
}
