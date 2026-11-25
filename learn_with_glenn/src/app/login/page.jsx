"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Email atau password tidak sesuai.");
        return;
      }
      const destination = { admin: "/dashboard/admin", teacher: "/dashboard/teacher", student: "/dashboard/student" };
      router.push(destination[data.user.role] || "/");
      router.refresh();
    } catch {
      setMessage("Tidak dapat terhubung ke server. Periksa koneksi dan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-cyan-600 via-cyan-700 to-slate-900 p-10 text-white md:flex">
          <Link href="/" className="rounded-xl bg-white/95 p-3"><Logo /></Link>
          <div><p className="text-xs font-extrabold tracking-[.2em] text-cyan-100">WELCOME BACK</p><h1 className="mt-4 text-4xl font-black leading-tight">Satu langkah lagi menuju tujuan belajarmu.</h1><p className="mt-4 max-w-sm text-sm leading-7 text-cyan-50/80">Masuk ke ruang belajarmu, lanjutkan materi, dan pantau perkembangan yang sudah kamu capai.</p></div>
          <p className="text-xs font-semibold text-cyan-100/70">LEARN. PRACTICE. GROW.</p>
        </section>
        <section className="p-7 sm:p-10">
          <Link href="/" className="inline-flex md:hidden"><Logo /></Link>
          <div className="mt-6 md:mt-3"><p className="eyebrow">YOUR LEARNING SPACE</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Selamat datang kembali</h2><p className="mt-2 text-sm leading-6 text-slate-500">Masuk untuk melanjutkan proses belajarmu.</p></div>
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="nama@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label><button type="button" onClick={() => setShowPassword((value) => !value)} className="text-xs font-bold text-cyan-700 hover:text-cyan-900">{showPassword ? "Sembunyikan" : "Tampilkan"}</button></div><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Masukkan password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" /></div>
            {message && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{message}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/20 hover:-translate-y-0.5 hover:bg-cyan-700 disabled:translate-y-0 disabled:opacity-60">{loading ? "Memverifikasi..." : "Masuk ke akun"}</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">Belum punya akun? <Link href="/register" className="font-extrabold text-cyan-700 hover:underline">Daftar sekarang</Link></p>
        </section>
      </div>
    </main>
  );
}
