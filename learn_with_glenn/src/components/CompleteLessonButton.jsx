"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteLessonButton({ contentId, completed }) {
  const [done, setDone] = useState(completed);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();

  async function mark() {
    if (done || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/contents/${contentId}/progress`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.message || "Progress belum berhasil disimpan.");
        return;
      }
      setDone(true);
      setNotice("Progress berhasil disimpan.");
      router.refresh();
    } catch {
      setNotice("Gagal terhubung ke server. Coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button type="button" onClick={mark} disabled={done || busy} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold ${done ? "bg-emerald-50 text-emerald-700" : "bg-cyan-600 text-white shadow-sm hover:bg-cyan-700"}`}>
        {done ? "✓ Materi selesai" : busy ? "Menyimpan..." : "Tandai selesai"}
      </button>
      {notice && <p role="status" className={`text-[11px] ${done ? "text-emerald-700" : "text-rose-600"}`}>{notice}</p>}
    </div>
  );
}
