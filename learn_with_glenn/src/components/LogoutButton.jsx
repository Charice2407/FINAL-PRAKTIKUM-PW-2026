
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Logout gagal. Silakan coba kembali.");
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
    >
      {loading ? "Keluar..." : "Logout"}
    </button>
  );
}
