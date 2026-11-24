
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { requireUserRole } from "@/lib/server-auth";

export default async function AdminDashboard() {
  const user = await requireUserRole(["admin"]);

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold text-cyan-600">
            Learn With Glenn
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold text-cyan-600">
          ADMINISTRATOR
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Selamat datang, {user.username}. Kelola platform kursus dari sini.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/admin/users"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-bold">User Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola pengguna dan persetujuan Teacher.
            </p>
          </Link>

          <Link href="/dashboard/admin/categories"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-bold">Category Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tambah, ubah, dan hapus kategori course.
            </p>
          </Link>

          <Link href="/dashboard/admin/courses"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-lg font-bold">Course Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola seluruh course yang tersedia.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
