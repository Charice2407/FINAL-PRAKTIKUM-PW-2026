import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/server-auth";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";

export default async function Navbar() {
  const user = await getAuthenticatedUser();
  const dashboardHref = user?.role === "admin"
    ? "/dashboard/admin"
    : user?.role === "teacher"
      ? "/dashboard/teacher"
      : user
        ? "/dashboard/student"
        : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" aria-label="Learn With Glenn - Beranda" className="shrink-0">
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/" className="hover:text-cyan-700">Beranda</Link>
          <Link href="/courses" className="hover:text-cyan-700">Katalog Course</Link>
          {user ? (
            <>
              <Link href={dashboardHref} className="hover:text-cyan-700">Dashboard</Link>
              <Link href="/profile" className="hover:text-cyan-700">Profil</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-cyan-700">Masuk</Link>
              <Link href="/register" className="rounded-xl bg-cyan-600 px-4 py-2.5 font-bold text-white shadow-sm shadow-cyan-600/20 hover:-translate-y-0.5 hover:bg-cyan-700">Mulai Belajar</Link>
            </>
          )}
        </div>
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50" aria-label="Buka menu navigasi">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </summary>
          <div className="absolute right-0 top-14 z-50 grid w-60 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50" href="/">Beranda</Link>
            <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50" href="/courses">Katalog Course</Link>
            {user ? (
              <>
                <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50" href={dashboardHref}>Dashboard</Link>
                <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50" href="/profile">Profil</Link>
                <div className="border-t border-slate-100 pt-2"><LogoutButton /></div>
              </>
            ) : (
              <>
                <Link className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50" href="/login">Masuk</Link>
                <Link className="rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-bold text-white" href="/register">Daftar</Link>
              </>
            )}
          </div>
        </details>
      </nav>
    </header>
  );
}
