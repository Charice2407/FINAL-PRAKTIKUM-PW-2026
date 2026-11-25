"use client";

import { useMemo, useState } from "react";

const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10";

export default function ContentManagementClient({ courseId, initialContents }) {
  const [items, setItems] = useState(initialContents);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const nextOrderIndex = useMemo(
    () => items.reduce((highest, item) => Math.max(highest, Number(item.order_index) || 0), 0) + 1,
    [items]
  );
  const blank = useMemo(() => ({ title: "", content: "", order_index: nextOrderIndex }), [nextOrderIndex]);
  const [form, setForm] = useState(blank);

  function change(event) {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  }

  function edit(item) {
    setEditing(item.id);
    setForm({ title: item.title, content: item.content, order_index: item.order_index });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function reload() {
    const response = await fetch(`/api/courses/${courseId}/contents`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal memuat materi.");
    setItems(data.contents);
    return data.contents;
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(editing ? `/api/contents/${editing}` : `/api/courses/${courseId}/contents`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setNoticeType("error");
        setNotice(data.message || "Gagal menyimpan materi.");
        return;
      }
      setNoticeType("success");
      setNotice(data.message);
      setEditing(null);
      const refreshedItems = await reload();
      const nextOrder = refreshedItems.reduce(
        (highest, item) => Math.max(highest, Number(item.order_index) || 0), 0
      ) + 1;
      setForm({ title: "", content: "", order_index: nextOrder });
    } catch {
      setNoticeType("error");
      setNotice("Tidak dapat terhubung ke server. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/contents/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setNoticeType("error");
        setNotice(data.message || "Gagal menghapus materi.");
      } else {
        setNoticeType("success");
        setNotice(data.message);
        await reload();
      }
    } catch {
      setNoticeType("error");
      setNotice("Tidak dapat terhubung ke server.");
    } finally {
      setPendingDelete(null);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="eyebrow">{editing ? "UPDATE LESSON" : "ADD LESSON"}</p><h2 className="mt-1 text-xl font-black text-slate-950">{editing ? "Edit Materi" : "Tambah Materi"}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Susun materi secara berurutan agar mudah diikuti Student.</p></div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Judul Materi<input name="title" value={form.title} onChange={change} required maxLength={200} placeholder="Contoh: Pengenalan HTML" className={fieldClass} /></label>
            <label className="block text-sm font-bold text-slate-700">Isi Materi<textarea name="content" value={form.content} onChange={change} required rows={10} placeholder="Tulis penjelasan materi di sini..." className={`${fieldClass} resize-y leading-6`} /></label>
            <label className="block text-sm font-bold text-slate-700">Order Index<input type="number" min="1" name="order_index" value={form.order_index} onChange={change} required className={fieldClass} /><span className="mt-1 block text-[11px] font-normal text-slate-400">Urutan harus unik dalam course ini.</span></label>
          </div>
          <button disabled={busy} className="mt-5 w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-cyan-700 disabled:opacity-50">{busy ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Materi"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batalkan edit</button>}
          {notice && <p role="status" className={`mt-3 rounded-xl p-3 text-xs leading-5 ${noticeType === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{notice}</p>}
        </form>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="eyebrow">LEARNING CONTENT</p><h2 className="mt-1 text-xl font-black text-slate-950">Daftar Materi</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{items.length} materi</span></div>
          <div className="space-y-3">
            {items.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold tracking-[.16em] text-cyan-700">MATERI {item.order_index}</p><h3 className="mt-1 font-extrabold text-slate-900">{item.title}</h3><p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-500">{item.content}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => edit(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-800">Edit</button><button type="button" onClick={() => setPendingDelete(item)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">Hapus</button></div></div>
            </article>)}
            {!items.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center"><p className="font-bold text-slate-800">Belum ada materi</p><p className="mt-1 text-sm text-slate-500">Tambahkan materi pertama melalui formulir di samping.</p></div>}
          </div>
        </section>
      </div>

      {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div role="dialog" aria-modal="true" aria-labelledby="delete-content-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl text-rose-700">!</span><h2 id="delete-content-title" className="mt-4 text-lg font-black text-slate-950">Hapus materi?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Materi <b className="text-slate-800">{pendingDelete.title}</b> dan data progress terkait akan dihapus.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPendingDelete(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button><button type="button" disabled={busy} onClick={removeItem} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">{busy ? "Menghapus..." : "Ya, hapus materi"}</button></div></div></div>}
    </>
  );
}
