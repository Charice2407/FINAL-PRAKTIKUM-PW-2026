import Link from "next/link";

const navigation = {
  admin: [
    { href: "/dashboard/admin", label: "Ringkasan", icon: "▦" },
    { href: "/dashboard/admin/users", label: "Pengguna", icon: "♙" },
    { href: "/dashboard/admin/courses", label: "Course", icon: "▤" },
    { href: "/dashboard/admin/categories", label: "Kategori", icon: "◇" },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Ringkasan", icon: "▦" },
    { href: "/dashboard/teacher/courses", label: "Course Saya", icon: "▤" },
    { href: "/profile", label: "Profil", icon: "♙" },
  ],
  student: [
    { href: "/dashboard/student", label: "Ringkasan", icon: "▦" },
    { href: "/courses", label: "Jelajahi Course", icon: "⌕" },
    { href: "/profile", label: "Pembelajaran Saya", icon: "▤" },
  ],
};

export default function Sidebar({ role, username }) {
  const items = navigation[role] || navigation.student;
  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-4 lg:min-h-[calc(100vh-73px)] lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-5 hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 p-4 lg:block">
        <p className="text-[10px] font-extrabold tracking-[.18em] text-cyan-700">WORKSPACE</p>
        <p className="mt-2 truncate text-sm font-bold text-slate-900">{username}</p>
        <p className="mt-1 text-xs capitalize text-slate-500">{role} account</p>
      </div>
      <p className="mb-2 hidden px-3 text-[10px] font-extrabold tracking-[.16em] text-slate-400 lg:block">MENU UTAMA</p>
      <nav aria-label="Navigasi dashboard" className="flex gap-2 overflow-x-auto lg:flex-col">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-800">
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-base shadow-sm">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden rounded-2xl bg-slate-950 p-4 text-white lg:block">
        <p className="text-sm font-bold">Terus berkembang.</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">Satu langkah kecil setiap hari membawa kemajuan besar.</p>
      </div>
    </aside>
  );
}
