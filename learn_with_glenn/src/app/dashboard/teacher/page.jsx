
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { requireUserRole } from "@/lib/server-auth";

export default async function TeacherDashboard() {
  const user = await requireUserRole(["teacher"]);

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-5">
        <Link href="/" className="text-xl font-bold text-cyan-600">
          Learn With Glenn
        </Link>
        <LogoutButton />
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="font-semibold text-cyan-600">TEACHER</p>
        <h1 className="mt-2 text-3xl font-bold">Teacher Dashboard</h1>
        <p className="mt-3 text-slate-600">
          Selamat datang, {user.username}.
        </p>
      </section>
    </main>
  );
}
