import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUserRole } from "@/lib/server-auth";
import { query } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function TeacherDashboard() {
  const user = await requireUserRole(["teacher"]);
  if (!user) redirect("/login");

  const [summary, courses] = await Promise.all([
    query(`SELECT COUNT(DISTINCT c.id)::int AS total_courses,
      COUNT(DISTINCT e.id)::int AS total_students
      FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id
      WHERE c.teacher_id=$1`, [user.id]),
    query(`SELECT c.id,c.title,COUNT(DISTINCT e.id)::int AS students,
      COUNT(DISTINCT ct.id)::int AS lessons
      FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id
      LEFT JOIN contents ct ON ct.course_id=c.id
      WHERE c.teacher_id=$1 GROUP BY c.id ORDER BY c.created_at DESC LIMIT 5`, [user.id]),
  ]);

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">TEACHER STUDIO</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Selamat datang, {user.username}.</h1><p className="mt-2 text-sm text-slate-500">Kelola kelas dan pantau perkembangan peserta didikmu.</p></div><Link href="/dashboard/teacher/courses" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-cyan-700">+ Kelola course</Link></div>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white"><p className="text-sm font-semibold text-slate-300">Course aktif</p><p className="mt-3 text-4xl font-black">{summary.rows[0].total_courses}</p><p className="mt-1 text-sm text-slate-300">Kelas yang kamu kelola</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-slate-500">Total peserta</p><p className="mt-3 text-4xl font-black text-slate-950">{summary.rows[0].total_students}</p><p className="mt-1 text-sm text-slate-500">Akumulasi enrollment seluruh course</p></article>
      </section>
      <section className="mt-9"><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">Course yang dikelola</h2><p className="mt-1 text-sm text-slate-500">Ringkasan kelas terbaru milikmu.</p></div><Link href="/profile" className="text-sm font-bold text-cyan-700 hover:underline">Lihat profil →</Link></div>
        {courses.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{courses.map((course) => <div key={course.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 className="font-bold text-slate-900">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.students} peserta · {course.lessons} materi</p></div><Link href={`/dashboard/teacher/courses/${course.id}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-800">Kelola materi →</Link></div>)}</div></div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center"><p className="font-bold text-slate-800">Belum ada course</p><p className="mt-1 text-sm text-slate-500">Buat course pertamamu untuk mulai mengajar.</p><Link href="/dashboard/teacher/courses" className="mt-5 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">Buat course</Link></div>}
      </section>
    </DashboardShell>
  );
}
