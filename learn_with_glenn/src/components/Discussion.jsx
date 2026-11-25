"use client";

import { useCallback, useEffect, useState } from "react";

export default function Discussion({ contentId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contents/${contentId}/comments`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
        setNotice("");
      } else {
        setNotice(data.message || "Diskusi belum dapat dimuat.");
      }
    } catch {
      setNotice("Tidak dapat memuat diskusi. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(event) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/contents/${contentId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.message || "Gagal mengirim komentar.");
        return;
      }
      setMessage("");
      setComments((current) => [...current, data.comment]);
      setNotice("Komentar berhasil dikirim.");
    } catch {
      setNotice("Gagal mengirim komentar. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold tracking-[.16em] text-cyan-700">LEARNING COMMUNITY</p><h3 className="mt-1 text-lg font-black text-slate-900">Diskusi Materi</h3></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{comments.length} komentar</span></div>
      <div className="mt-5 space-y-3">
        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-500">Memuat diskusi...</p> :
          comments.length ? comments.map((comment) => <article key={comment.id} className="rounded-xl border border-slate-100 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-xs font-black text-cyan-800">{comment.username?.slice(0,1).toUpperCase()}</span><b className="text-sm text-slate-800">{comment.username}</b></div><time className="text-[11px] text-slate-400">{new Date(comment.created_at).toLocaleString("id-ID")}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.message}</p></article>) :
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">Belum ada diskusi. Jadilah yang pertama bertanya.</p>}
      </div>
      <form onSubmit={send} className="mt-5">
        <label htmlFor={`comment-${contentId}`} className="mb-2 block text-sm font-bold text-slate-700">Tulis pertanyaan atau tanggapan</label>
        <textarea id={`comment-${contentId}`} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required rows={3} placeholder="Bagikan pertanyaan atau insight tentang materi ini..." className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-slate-400">{message.length}/2.000 karakter</span><button disabled={busy || !message.trim()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Mengirim..." : "Kirim komentar"}</button></div>
        {notice && <p role="status" className={`mt-3 text-xs ${notice.toLowerCase().includes("gagal") || notice.toLowerCase().includes("tidak memiliki") || notice.toLowerCase().includes("login") ? "text-rose-600" : "text-emerald-700"}`}>{notice}</p>}
      </form>
    </section>
  );
}
