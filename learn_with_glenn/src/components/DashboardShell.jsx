import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardShell({ user, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Kembali ke beranda"><Logo /></Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">{user.username}</p>
              <p className="text-xs capitalize text-slate-500">{user.role}</p>
            </div>
            <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-black text-cyan-800" aria-label="Profil pengguna">{user.username?.slice(0,1).toUpperCase()}</Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <Sidebar role={user.role} username={user.username} />
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
