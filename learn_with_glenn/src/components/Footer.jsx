import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div><Link href="/"><Logo inverse /></Link><p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Ruang belajar online untuk membangun keterampilan, mencoba hal baru, dan berkembang dengan ritme sendiri.</p></div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold"><Link href="/courses" className="hover:text-cyan-300">Katalog Course</Link><Link href="/register" className="hover:text-cyan-300">Daftar</Link><Link href="/login" className="hover:text-cyan-300">Masuk</Link></div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} Learn With Glenn. Learn. Practice. Grow.</div>
    </footer>
  );
}
