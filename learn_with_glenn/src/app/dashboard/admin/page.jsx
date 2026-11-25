import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUserRole } from "@/lib/server-auth";
import { query } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function AdminDashboard() {
  const user = await requireUserRole(["admin"]);
  if (!user) redirect("/login");

  const [users, courses, categories, pending] = await Promise.all([
    query("SELECT COUNT(*)::int AS total FROM users"),
    query("SELECT COUNT(*)::int AS total FROM courses"),
    query("SELECT COUNT(*)::int AS total FROM categories"),
    query("SELECT COUNT(*)::int AS total FROM users WHERE teacher_status='pending'"),
  ]);
  const stats = [
    { label: "Total pengguna", value: users.rows[0].total, hint: "Akun terdaftar", icon: "♙" },
    { label: "Total course", value: courses.rows[0].total, hint: "Kelas tersedia", icon: "▤" },
    { label: "Kategori", value: categories.rows[0].total, hint: "Pengelompokan kelas", icon: "◇" },
    { label: "Teacher pending", value: pending.rows[0].total, hint: "Menunggu verifikasi", icon: "◷", highlight: true },
  ];

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">ADMINISTRATOR</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Dashboard Admin</h1><p className="mt-2 text-sm text-slate-500">Selamat datang kembali, {user.username}. Berikut ringkasan platform hari ini.</p></div>
        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-800">Admin workspace</span>
      </div>
      <section aria-label="Statistik platform" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <article key={stat.label} className={`rounded-2xl border p-5 shadow-sm ${stat.highlight ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-600">{stat.label}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-cyan-700 shadow-sm">{stat.icon}</span></div><p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.hint}</p></article>)}
      </section>
      <section className="mt-9">
        <div className="mb-4"><h2 className="text-xl font-extrabold text-slate-900">Kelola platform</h2><p className="mt-1 text-sm text-slate-500">Pilih modul yang ingin kamu kelola.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { href: "/dashboard/admin/users", title: "User Management", desc: "Kelola akun, role, dan persetujuan Teacher.", icon: "♙", action: "Kelola pengguna" },
            { href: "/dashboard/admin/courses", title: "Course Management", desc: "Pantau dan kelola seluruh kelas yang tersedia.", icon: "▤", action: "Kelola course" },
            { href: "/dashboard/admin/categories", title: "Category Management", desc: "Atur kategori sebagai sumber dropdown course.", icon: "◇", action: "Kelola kategori" },
          ].map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-xl text-cyan-800">{item.icon}</span><h3 className="mt-5 text-lg font-extrabold text-slate-900">{item.title}</h3><p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">{item.desc}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700">{item.action}<span className="transition-transform group-hover:translate-x-1">→</span></span></Link>)}
        </div>
      </section>
    </DashboardShell>
  );
}
