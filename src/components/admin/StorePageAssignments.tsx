"use client";
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PagePlacement, PageTarget, StorePage, pageTargetKey, notifyStorePagesChanged } from '@/lib/store-pages';

const Context = createContext<{ pages: StorePage[]; placements: Record<string, PagePlacement>; loading: boolean; error: string; reload: () => void; savePlacement: (target: PageTarget, choice: PagePlacement) => Promise<void>; open: (target: PageTarget, label: string) => void }>({ pages: [], placements: {}, loading: true, error: '', reload: () => {}, savePlacement: async () => {}, open: () => {} });
export const useStorePagesAdmin = () => useContext(Context);

export function StorePagesAdminProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<StorePage[]>([]);
  const [placements, setPlacements] = useState<Record<string, PagePlacement>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [target, setTarget] = useState<(PageTarget & { label: string }) | null>(null);
  const [choice, setChoice] = useState<PagePlacement>({ mode: 'selected', pageIds: [] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setLoading(true); setError('');
    const controller = new AbortController();
    fetch('/api/store-pages/admin', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('تعذر تحميل صفحات المتجر؛ حدّث الصفحة للمحاولة مرة أخرى');
      const data = await response.json(); setPages(data.pages); setPlacements(data.placements);
    }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [version]);
  useEffect(() => { if (target && dialog.current && !dialog.current.open) dialog.current.showModal(); }, [target]);
  function open(next: PageTarget, label: string) {
    setChoice(placements[pageTargetKey(next)] || { mode: next.serviceId ? 'inherit' : 'selected', pageIds: [] });
    setSaveError(''); setTarget({ ...next, label });
  }
  async function savePlacement(item: PageTarget, selection: PagePlacement) {
      const response = await fetch('/api/store-pages/admin/placement', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, ...selection }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر الحفظ');
      setPlacements(previous => ({ ...previous, [data.key]: data.selection }));
      notifyStorePagesChanged();
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!target || saving) return;
    setSaving(true); setSaveError('');
    try {
      await savePlacement(target, choice); setTarget(null);
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'تعذر الحفظ'); }
    finally { setSaving(false); }
  }
  const visiblePages = pages.filter(page => !page.archived);
  return <Context.Provider value={{ pages, placements, loading, error, open, reload: () => setVersion(value => value + 1), savePlacement }}>{children}
    {target && createPortal(<dialog ref={dialog} onCancel={event => { if (saving) event.preventDefault(); else setTarget(null); }} className="m-auto fixed inset-0 w-[min(560px,calc(100vw-32px))] max-h-[85dvh] rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 p-0 shadow-2xl backdrop:bg-black/70" dir="rtl">
      <form onSubmit={save} className="p-6 space-y-5">
        <div className="flex justify-between gap-4"><div><h2 className="font-bold text-xl">ظهور {target.serviceId ? 'الخدمة' : 'الباقة'} في الصفحات</h2><p className="text-sm text-slate-400 mt-2 break-words">{target.label}</p></div><button type="button" aria-label="إغلاق اختيار الصفحات" disabled={saving} onClick={() => setTarget(null)} className="text-xl">×</button></div>
        <fieldset className="space-y-3"><legend className="sr-only">طريقة ظهور العنصر</legend>
          {target.serviceId && <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700"><input type="radio" name="placement-mode" value="inherit" checked={choice.mode === 'inherit'} onChange={() => setChoice({ mode: 'inherit', pageIds: [] })} /><span>اتباع إعدادات الباقة<small className="block text-slate-400 mt-1">أي تغيير في صفحات الباقة ينعكس على هذه الخدمة تلقائيًا.</small></span></label>}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700"><input type="radio" name="placement-mode" value="all" checked={choice.mode === 'all'} onChange={() => setChoice({ mode: 'all', pageIds: [] })} /><span>كل الصفحات<small className="block text-slate-400 mt-1">تظهر في جميع صفحات الخدمات الحالية والجديدة.</small></span></label>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700"><input type="radio" name="placement-mode" value="selected" checked={choice.mode === 'selected'} onChange={() => setChoice({ mode: 'selected', pageIds: choice.pageIds })} /><span>صفحات أحددها بنفسي<small className="block text-slate-400 mt-1">ممكن تختار أكثر من صفحة، أو لا تختار أي صفحة.</small></span></label>
        </fieldset>
        {choice.mode === 'selected' && <div className="max-h-56 overflow-y-auto space-y-2 rounded-xl bg-slate-950 p-3">{visiblePages.length ? visiblePages.map(page => <label key={page.id} className="flex items-center gap-3 p-2 text-sm"><input type="checkbox" checked={choice.pageIds.includes(page.id)} onChange={event => setChoice({ mode: 'selected', pageIds: event.target.checked ? [...choice.pageIds, page.id] : choice.pageIds.filter(id => id !== page.id) })} /><span>{page.title}{!page.enabled && <small className="text-amber-400 mr-2">غير منشورة</small>}</span></label>) : <p className="text-sm text-slate-400">أنشئ صفحة أولاً من <Link href="/admin/pages" className="text-sky-400 underline">إدارة صفحات المتجر</Link>.</p>}</div>}
        <p className="text-xs leading-6 text-slate-400">إخفاء الخدمة عن العملاء يمنع ظهورها في كل الصفحات. تخصيص صفحات الخدمة يتقدم على اختيار الباقة؛ والخدمات التي تتبع الباقة تظل مرتبطة بها.</p>
        {saveError && <p role="alert" className="text-red-400 text-sm">{saveError}</p>}
        <div className="flex gap-3"><button type="submit" disabled={saving} className="rounded-xl bg-sky-600 px-5 py-3 font-bold disabled:opacity-50">{saving ? 'جاري الحفظ…' : 'حفظ صفحات الظهور'}</button><button type="button" disabled={saving} onClick={() => setTarget(null)} className="px-4">إلغاء</button></div>
      </form>
    </dialog>, document.body)}
  </Context.Provider>;
}

export function StorePagePlacementControl({ target, label }: { target: PageTarget; label: string }) {
  const { placements, pages, loading, error, open } = useContext(Context);
  const choice = placements[pageTargetKey(target)];
  const summary = choice?.mode === 'all' ? 'الكل' : choice?.mode === 'selected' ? `${choice.pageIds.filter(id => pages.some(page => page.id === id && !page.archived)).length} صفحة` : target.serviceId ? 'حسب الباقة' : 'بدون صفحات';
  return <span className="inline-flex flex-col items-start gap-1 shrink-0"><button type="button" disabled={loading || !!error} onClick={() => open(target, label)} className="text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-violet-400/30 text-violet-300 bg-violet-500/10 disabled:opacity-50 whitespace-nowrap shrink-0">{loading ? 'تحميل الصفحات…' : `صفحات الظهور · ${summary}`}</button>{error && <small role="alert" className="text-red-400">{error}</small>}</span>;
}
