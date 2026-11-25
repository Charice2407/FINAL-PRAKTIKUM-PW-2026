import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUserRole } from "@/lib/server-auth";
import { query } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function StudentDashboard() {
  const user = await requireUserRole(["student"]);
  if (!user) redirect("/login");

  const [summary, courses] = await Promise.all([
    query(`SELECT COUNT(DISTINCT e.id)::int AS total,
      COUNT(DISTINCT CASE WHEN ct.id IS NOT NULL AND lp.id IS NOT NULL THEN (e.id::text || '-' || ct.id::text) END)::int AS completed_lessons
      FROM enrollments e LEFT JOIN contents ct ON ct.course_id=e.course_id
      LEFT JOIN lesson_progress lp ON lp.content_id=ct.id AND lp.enrollment_id=e.id
      WHERE e.student_id=$1`, [user.id]),
    query(`SELECT c.id,c.title,c.description,u.username AS teacher_name,
      COUNT(DISTINCT ct.id)::int AS total,
      COUNT(DISTINCT lp.id)::int AS done
      FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.teacher_id
      LEFT JOIN contents ct ON ct.course_id=c.id
      LEFT JOIN lesson_progress lp ON lp.content_id=ct.id AND lp.enrollment_id=e.id
      WHERE e.student_id=$1 GROUP BY c.id,u.username,e.enrolled_at ORDER BY e.enrolled_at DESC LIMIT 4`, [user.id]),
  ]);
  const total = summary.rows[0].total;
  const completed = summary.rows[0].completed_lessons;

  return (
    <DashboardShell user={user}>
      <div className="mb-8"><p className="eyebrow">STUDENT SPACE</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Halo, {user.username}!</h1><p className="mt-2 text-sm text-slate-500">Siap melanjutkan perjalanan belajarmu hari ini?</p></div>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl bg-gradient-to-br from-cyan-600 to-sky-700 p-6 text-white shadow-lg shadow-cyan-900/10"><p className="text-sm font-semibold text-cyan-100">Course yang diikuti</p><p className="mt-3 text-4xl font-black">{total}</p><p className="mt-1 text-sm text-cyan-100">Kelas dalam pembelajaranmu</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-slate-500">Materi diselesaikan</p><p className="mt-3 text-4xl font-black text-slate-950">{completed}</p><p className="mt-1 text-sm text-slate-500">Total materi yang telah ditandai selesai</p></article>
      </section>
      <section className="mt-9">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">Lanjutkan belajar</h2><p className="mt-1 text-sm text-slate-500">Akses cepat ke course yang terakhir kamu ikuti.</p></div><Link href="/courses" className="text-sm font-bold text-cyan-700 hover:underline">Jelajahi semua course →</Link></div>
        {courses.length ? <div className="grid gap-4 md:grid-cols-2">{courses.map((course) => { const pct = course.total ? Math.round(course.done / course.total * 100) : 0; return <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-slate-900">{course.title}</h3><p className="mt-1 text-xs text-slate-500">Pengajar: {course.teacher_name}</p></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">{pct}%</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${pct}%` }} /></div><p className="mt-2 text-xs text-slate-500">{course.done} dari {course.total} materi selesai</p><Link href={`/learn/${course.id}`} className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700">Lanjutkan belajar →</Link></article>})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center"><p className="font-bold text-slate-800">Belum ada course yang diikuti</p><p className="mt-1 text-sm text-slate-500">Temukan kelas yang sesuai dengan minatmu dan mulai belajar.</p><Link href="/courses" className="mt-5 inline-flex rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700">Jelajahi course</Link></div>}
      </section>
    </DashboardShell>
  );
}
