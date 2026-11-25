"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, accountType }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/student");
          router.refresh();
        }, 1200);
      }
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
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid-cols-[.9fr_1.1fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-10 text-white md:flex">
          <Link href="/" className="rounded-xl bg-white/95 p-3"><Logo /></Link>
          <div><p className="text-xs font-extrabold tracking-[.2em] text-cyan-300">START YOUR JOURNEY</p><h1 className="mt-4 text-4xl font-black leading-tight">Belajar hari ini. Bertumbuh setiap hari.</h1><p className="mt-4 text-sm leading-7 text-slate-300">Bergabung dengan Learn With Glenn dan temukan ruang untuk mengembangkan kemampuanmu.</p><div className="mt-8 space-y-3 text-sm text-slate-300"><p>✓ Course dengan materi terstruktur</p><p>✓ Progress belajar tersimpan</p><p>✓ Ruang diskusi bersama</p></div></div>
          <p className="text-xs font-semibold text-slate-400">LEARN. PRACTICE. GROW.</p>
        </section>
        <section className="p-7 sm:p-10">
          <Link href="/" className="inline-flex md:hidden"><Logo /></Link>
          <div className="mt-6 md:mt-3"><p className="eyebrow">CREATE YOUR ACCOUNT</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Buat akun baru</h2><p className="mt-2 text-sm leading-6 text-slate-500">Isi informasi berikut. Setelah mendaftar, kamu langsung masuk sebagai Student.</p></div>
          <form onSubmit={handleRegister} className="mt-7 space-y-4">
            <div><label htmlFor="username" className="mb-2 block text-sm font-bold text-slate-700">Username</label><input id="username" type="text" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={100} placeholder="Nama pengguna" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" /></div>
            <div><label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="nama@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" /></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label><button type="button" onClick={() => setShowPassword((value) => !value)} className="text-xs font-bold text-cyan-700">{showPassword ? "Sembunyikan" : "Tampilkan"}</button></div><input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={72} placeholder="Minimal 8 karakter" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" /></div>
            <div><label htmlFor="accountType" className="mb-2 block text-sm font-bold text-slate-700">Daftar sebagai</label><select id="accountType" value={accountType} onChange={(event) => setAccountType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"><option value="student">Student</option><option value="teacher">Teacher Applicant</option></select></div>
            {accountType === "teacher" && <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Permohonan Teacher akan ditinjau oleh Admin. Akunmu tetap dapat menggunakan fitur Student sampai persetujuan diberikan.</p>}
            {message && <p role="status" className={`rounded-xl border p-3 text-sm ${success ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}>{message}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-cyan-600/20 hover:-translate-y-0.5 hover:bg-cyan-700 disabled:translate-y-0 disabled:opacity-60">{loading ? "Membuat akun..." : "Buat akun"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Sudah memiliki akun? <Link href="/login" className="font-extrabold text-cyan-700 hover:underline">Masuk</Link></p>
        </section>
      </div>
    </main>
  );
}
