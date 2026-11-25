"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout gagal.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Gagal keluar. Coba kembali.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={handleLogout} disabled={loading} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60 sm:px-4 sm:text-sm">
        {loading ? "Keluar..." : "Keluar"}
      </button>
      {message && <span role="alert" className="text-[10px] text-rose-600">{message}</span>}
    </div>
  );
}
