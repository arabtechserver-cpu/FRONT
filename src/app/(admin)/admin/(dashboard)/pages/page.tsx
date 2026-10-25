"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { StorePagesAdminProvider, StorePagePlacementControl, useStorePagesAdmin } from '@/components/admin/StorePageAssignments';
import { PageTarget, StorePage, pageTargetKey, notifyStorePagesChanged } from '@/lib/store-pages';

const blank = { title: '', titleEn: '', slug: '', description: '', descriptionEn: '', enabled: false, navbar: true, menu: true, order: 10, archived: false };
const inputClass = 'block w-full mt-2 rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-white';

export default function StorePagesManager() { return <StorePagesAdminProvider><Manager /></StorePagesAdminProvider>; }

function Manager() {
  const { pages, loading, error, reload } = useStorePagesAdmin();
  const [editing, setEditing] = useState<(typeof blank & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [contentPage, setContentPage] = useState<StorePage | null>(null);
  async function save(page: typeof blank & { id?: string }) {
    setSaving(true); setSaveError(''); setMessage('');
    try {
      const response = await fetch('/api/store-pages/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'تعذر حفظ الصفحة');
      notifyStorePagesChanged(); reload(); setEditing(null); setMessage(page.archived ? 'تمت أرشفة الصفحة وإخفاؤها من القوائم.' : page.enabled ? 'الصفحة منشورة؛ القوائم تتحدث تلقائيًا بحسب أماكن الظهور التي اخترتها.' : 'الصفحة محفوظة كمسودة وغير ظاهرة للعملاء. اضغط «نشر الصفحة» لإظهارها.');
    } catch (e) { setSaveError(e instanceof Error ? e.message : 'تعذر حفظ الصفحة'); }
    finally { setSaving(false); }
  }
  return <div dir="rtl" className="max-w-6xl mx-auto p-3 sm:p-6 space-y-6 text-slate-100">
    <header className="flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-slate-700 bg-slate-900 p-6"><div><h1 className="text-2xl font-black">صفحات المتجر والقوائم</h1><p className="text-sm text-slate-400 mt-3 max-w-2xl leading-7">اعمل صفحة لشحن الألعاب أو الأكواد أو أي مجموعة خدمات. اختار اسمها ورابطها ومكان ظهورها، وبعدها حدد الباقات والخدمات الموجودة فيها.</p></div><button type="button" disabled={loading || !!error} onClick={() => { setEditing({ ...blank, order: pages.length * 10 }); setSaveError(''); }} className="rounded-xl px-5 py-3 bg-sky-600 font-bold disabled:opacity-50">+ إنشاء صفحة جديدة</button></header>
    <div className="grid sm:grid-cols-3 gap-3 text-sm">{['١. أنشئ الصفحة وحدد مكانها في القوائم.', '٢. اختار الباقات أو الخدمات من «تحديد المحتوى».', '٣. انشر الصفحة وافتحها لمراجعة ما يراه العميل.'].map(line => <p key={line} className="p-4 rounded-xl border border-slate-700 text-slate-300 leading-7">{line}</p>)}</div>
    {error && <div role="alert" className="text-red-400">{error} <button onClick={reload} className="underline">إعادة المحاولة</button></div>}
    {message && <p role="status" className="p-4 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm">{message}</p>}
    {saveError && <p role="alert" className="text-red-400">{saveError}</p>}
    {editing && <form onSubmit={event => { event.preventDefault(); save(editing); }} className="rounded-2xl border border-sky-500/40 bg-slate-900 p-5 sm:p-6 space-y-5">
      <h2 className="font-bold text-lg">{editing.id ? 'تعديل الصفحة' : 'صفحة جديدة'}</h2>
      <div className="grid sm:grid-cols-2 gap-5"><label className="text-sm">اسم الصفحة<input required maxLength={100} value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} className={inputClass} placeholder="مثلاً: شحن ألعاب بالكود" /></label><label className="text-sm">رابط الصفحة بالإنجليزية<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} dir="ltr" value={editing.slug} onChange={event => setEditing({ ...editing, slug: event.target.value.toLowerCase() })} className={inputClass} placeholder="game-codes" /><small className="block mt-2 text-slate-400" dir="ltr">/ar/pages/{editing.slug || 'game-codes'}</small></label></div>
      <label className="block text-sm">وصف الصفحة<textarea maxLength={1000} rows={2} value={editing.description} onChange={event => setEditing({ ...editing, description: event.target.value })} className={inputClass} /></label>
      <div className="flex flex-wrap gap-5 text-sm"><label className="flex gap-2 items-center"><input type="checkbox" checked={editing.enabled} onChange={event => setEditing({ ...editing, enabled: event.target.checked })} />نشر الصفحة للعملاء</label><label className="flex gap-2 items-center"><input type="checkbox" checked={editing.navbar} onChange={event => setEditing({ ...editing, navbar: event.target.checked })} />تظهر في الشريط العلوي</label><label className="flex gap-2 items-center"><input type="checkbox" checked={editing.menu} onChange={event => setEditing({ ...editing, menu: event.target.checked })} />تظهر في قائمة الموبايل</label><label className="flex gap-2 items-center">ترتيب الظهور<input type="number" min={0} max={999} value={editing.order} onChange={event => setEditing({ ...editing, order: Number(event.target.value) })} className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2" /></label></div>
      <details className="text-sm text-slate-400"><summary className="cursor-pointer">الاسم والوصف بالإنجليزية (اختياري)</summary><label className="block mt-3">الاسم بالإنجليزية<input maxLength={100} value={editing.titleEn} onChange={event => setEditing({ ...editing, titleEn: event.target.value })} className={inputClass} /></label><label className="block mt-3">الوصف بالإنجليزية<textarea maxLength={1000} value={editing.descriptionEn} onChange={event => setEditing({ ...editing, descriptionEn: event.target.value })} className={inputClass} /></label></details>
      <p className="text-xs text-slate-400 leading-6">الصفحة غير المنشورة لا تظهر للعملاء حتى لو اخترت ظهورها في القوائم. روابط كل الخدمات الحالية تظل كما هي.</p>
      <div className="flex gap-3"><button disabled={saving} className="rounded-xl px-5 py-3 bg-sky-600 font-bold disabled:opacity-50">{saving ? 'جاري الحفظ…' : 'حفظ الصفحة'}</button><button type="button" disabled={saving} onClick={() => setEditing(null)} className="px-4">إلغاء</button></div>
    </form>}
    <div className="flex items-center justify-between"><h2 className="font-bold">صفحاتك ({pages.filter(page => !page.archived).length})</h2><label className="flex gap-2 items-center text-xs text-slate-400"><input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />عرض المؤرشفة</label></div>
    {loading ? <p role="status">جاري تحميل الصفحات…</p> : !pages.some(page => showArchived || !page.archived) ? <div className="text-center rounded-2xl border border-dashed border-slate-700 p-10 text-slate-400">لسه مفيش صفحات. اضغط «إنشاء صفحة جديدة» وابدأ بصفحة زي شحن ألعاب بالكود.</div> : <div className="space-y-4">{pages.filter(page => showArchived || !page.archived).map(page => <article key={page.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 flex flex-wrap gap-5 justify-between items-center"><div><h3 className="font-bold text-lg">{page.title} <small className={page.archived || !page.enabled ? 'text-amber-400' : 'text-emerald-400'}>{page.archived ? 'مؤرشفة' : page.enabled ? 'منشورة' : 'غير منشورة'}</small></h3><p dir="ltr" className="text-xs text-slate-500 mt-2 text-right">/ar/pages/{page.slug}</p><p className="text-xs text-slate-400 mt-3">{page.navbar ? 'الشريط العلوي' : 'مخفية من الشريط'} · {page.menu ? 'قائمة الموبايل' : 'مخفية من قائمة الموبايل'} · الترتيب {page.order}</p></div><div className="flex flex-wrap gap-2 text-xs">{!page.archived && <button disabled={saving} onClick={() => save({ ...page, enabled: !page.enabled })} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold disabled:opacity-50">{page.enabled ? "إيقاف النشر" : "نشر الصفحة"}</button>}<button disabled={page.archived} onClick={() => setContentPage(page)} className="px-4 py-2 rounded-lg bg-violet-500/15 text-violet-300 disabled:opacity-50">تحديد المحتوى</button><button onClick={() => { setEditing({ ...page }); setSaveError(''); }} className="px-4 py-2 rounded-lg border border-slate-700">تعديل</button>{page.enabled && !page.archived && <Link href={`/ar/pages/${page.slug}`} target="_blank" className="px-4 py-2 rounded-lg border border-sky-700 text-sky-300">فتح الصفحة</Link>}<button disabled={saving} onClick={() => save({ ...page, archived: !page.archived, enabled: page.archived ? false : page.enabled })} className="px-4 py-2 rounded-lg text-amber-300">{page.archived ? 'استعادة كمسودة' : 'أرشفة'}</button></div></article>)}</div>}
    {contentPage && <PageContentPicker page={contentPage} close={() => setContentPage(null)} />}
  </div>;
}

function PageContentPicker({ page, close }: { page: StorePage; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { pages, placements, savePlacement } = useStorePagesAdmin();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(35);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  useEffect(() => { const controller = new AbortController(); fetch('/api/dhru/services?all=true', { signal: controller.signal }).then(async response => { if (!response.ok) throw new Error('تعذر تحميل الخدمات'); setCatalog(await response.json()); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => setLoading(false)); return () => controller.abort(); }, []);
  const groups = useMemo(() => catalog.flatMap(category => { const map = new Map<string, any[]>(); (category.services || []).forEach((service: any) => map.set(service.groupName, [...(map.get(service.groupName) || []), service])); return [...map].map(([groupName, services]) => ({ categoryId: category.id, categoryName: category.name, groupName, services })); }).filter(group => `${group.groupName} ${group.services.map(service => service.name).join(' ')}`.toLowerCase().includes(search.toLowerCase())), [catalog, search]);
  function selectedIds(target: PageTarget, group?: PageTarget) {
    const own = placements[pageTargetKey(target)];
    const choice = own && own.mode !== 'inherit' ? own : group ? placements[pageTargetKey(group)] : own;
    return choice?.mode === 'all' ? pages.map(item => item.id) : choice?.pageIds || [];
  }
  async function toggle(target: PageTarget, checked: boolean, group?: PageTarget) {
    setBusy(true); setError('');
    try { const ids = selectedIds(target, group); await savePlacement(target, { mode: 'selected', pageIds: checked ? [...new Set([...ids, page.id])] : ids.filter(id => id !== page.id) }); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر حفظ الاختيار'); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={event => { if (busy) event.preventDefault(); else close(); }} className="m-auto fixed inset-0 w-[calc(100vw-24px)] max-w-4xl max-h-[88dvh] border-0 bg-transparent p-0 text-slate-100 backdrop:bg-black/75" aria-label={`محتوى صفحة ${page.title}`}><div className="w-full max-w-4xl max-h-[88dvh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden"><header className="p-5 border-b border-slate-700"><div className="flex justify-between gap-4"><h2 className="font-bold text-lg">محتوى صفحة: {page.title}</h2><button disabled={busy} onClick={close} className="text-slate-400 px-3" aria-label="إغلاق اختيار المحتوى">×</button></div><p className="mt-2 text-sm text-slate-400 leading-7">اختار باقة كاملة، أو افتحها لاختيار خدمات معينة. كل اختيار يتحفظ مباشرة. تغيير الصفحة الحالية لا يلغي ظهور العنصر في باقي الصفحات.</p><input type="search" value={search} onChange={event => { setSearch(event.target.value); setLimit(35); }} placeholder="ابحث باسم الباقة أو الخدمة" aria-label="البحث في محتوى الصفحة" className={inputClass} />{error && <p role="alert" className="mt-3 text-red-400">{error}</p>}</header><div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">{loading ? <p>تحميل الخدمات…</p> : groups.slice(0, limit).map(group => { const target = { categoryId: group.categoryId, groupName: group.groupName }; return <details key={pageTargetKey(target)} className="rounded-xl border border-slate-700 p-4"><summary className="cursor-pointer"><span className="inline-flex items-center gap-3"><input type="checkbox" aria-label={`إضافة باقة ${group.groupName} إلى ${page.title}`} disabled={busy} checked={selectedIds(target).includes(page.id)} onClick={event => event.stopPropagation()} onChange={event => toggle(target, event.target.checked)} /><span className="font-bold">{group.groupName}</span><small className="text-slate-400">{group.services.length} خدمة · {group.categoryName}</small></span></summary><div className="mt-4 space-y-2">{group.services.map((service: any) => <label key={service.id} className="flex gap-3 items-start p-3 rounded-xl bg-slate-950 text-sm"><input type="checkbox" disabled={busy} checked={selectedIds({ serviceId: service.id }, target).includes(page.id)} onChange={event => toggle({ serviceId: service.id }, event.target.checked, target)} /><span>{service.name}{!service.isActive && <small className="block text-amber-400 mt-1">مخفية عن العملاء؛ لن تظهر حتى تفعيلها.</small>}</span></label>)}<StorePagePlacementControl target={target} label={group.groupName} /></div></details>; })}{groups.length > limit && <button onClick={() => setLimit(value => value + 35)} className="w-full py-3 text-sky-300">عرض المزيد من الباقات</button>}{!loading && groups.length === 0 && <p className="text-slate-400 p-5">لا توجد باقات مطابقة.</p>}</div><footer className="p-4 border-t border-slate-700 flex items-center justify-between text-sm"><span className="text-slate-400">{busy ? 'جاري حفظ الاختيار…' : 'الاختيارات محفوظة مباشرة في قاعدة البيانات'}</span><button onClick={close} disabled={busy} className="bg-sky-600 px-5 py-2 rounded-xl font-bold disabled:opacity-50">تم</button></footer></div></dialog>;
}
