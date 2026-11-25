import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";
import Navbar from "@/components/Navbar";
import Discussion from "@/components/Discussion";
import CompleteLessonButton from "@/components/CompleteLessonButton";

export default async function LearnPage({ params }) {
  const user = await requireUserRole(["student"]);
  if (!user) redirect("/login");
  const { courseId } = await params;
  const enrollment = await query("SELECT id FROM enrollments WHERE student_id=$1 AND course_id=$2", [user.id, courseId]);
  if (!enrollment.rowCount) redirect(`/courses/${courseId}`);

  const [courseResult, contentsResult] = await Promise.all([
    query(`SELECT c.id,c.title,c.description,u.username AS teacher_name
      FROM courses c JOIN users u ON u.id=c.teacher_id WHERE c.id=$1`, [courseId]),
    query(`SELECT ct.id,ct.title,ct.content,ct.order_index,
      lp.completed_at IS NOT NULL AS completed
      FROM contents ct LEFT JOIN lesson_progress lp
      ON lp.content_id=ct.id AND lp.enrollment_id=$2
      WHERE ct.course_id=$1 ORDER BY ct.order_index`, [courseId, enrollment.rows[0].id]),
  ]);

  const course = courseResult.rows[0];
  if (!course) notFound();
  const completed = contentsResult.rows.filter((item) => item.completed).length;
  const total = contentsResult.rows.length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
          <Link href="/profile" className="text-sm font-bold text-cyan-700 hover:underline">← Kembali ke pembelajaran saya</Link>
          <section className="relative mt-5 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-9">
            <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[45px] border-cyan-400/10" />
            <div className="relative">
              <p className="text-xs font-extrabold tracking-[.18em] text-cyan-300">LEARNING ROOM</p>
              <h1 className="mt-3 max-w-3xl text-2xl font-black tracking-tight sm:text-4xl">{course.title}</h1>
              <p className="mt-2 text-sm text-slate-300">Pengajar: {course.teacher_name}</p>
              <div className="mt-7 max-w-2xl">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-semibold text-slate-300">Progress pembelajaran</span><b className="text-cyan-300">{completed} dari {total} materi · {percent}%</b></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 transition-all" style={{ width: `${percent}%` }} /></div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between"><h2 className="font-extrabold text-slate-900">Daftar Materi</h2><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-800">{completed}/{total}</span></div>
              {total ? <nav aria-label="Daftar materi course" className="mt-4 space-y-1.5">{contentsResult.rows.map((item) => <a key={item.id} href={`#lesson-${item.id}`} className="flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-cyan-50"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${item.completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.completed ? "✓" : item.order_index}</span><span className={`leading-5 ${item.completed ? "text-slate-500" : "font-semibold text-slate-700"}`}>{item.title}</span></a>)}</nav> : <p className="mt-3 text-sm leading-6 text-slate-500">Teacher belum menambahkan materi.</p>}
              {percent === 100 && total > 0 && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-700">Hebat! Kamu telah menyelesaikan seluruh materi course ini.</p>}
            </aside>

            <section className="min-w-0">
              {total ? contentsResult.rows.map((item, index) => <article id={`lesson-${item.id}`} key={item.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-[11px] font-extrabold tracking-[.16em] text-cyan-700">MATERI {item.order_index}</p><h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{item.title}</h2></div><CompleteLessonButton contentId={item.id} completed={item.completed} /></div>
                <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap text-sm leading-8 text-slate-700">{item.content}</div>
                <Discussion contentId={item.id} />
                {index < total - 1 && <div className="mt-6 flex justify-end border-t border-slate-100 pt-5"><a href={`#lesson-${contentsResult.rows[index + 1].id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white hover:bg-cyan-700">Materi berikutnya <span>→</span></a></div>}
              </article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><p className="font-bold text-slate-900">Materi belum tersedia</p><p className="mt-1 text-sm text-slate-500">Silakan kembali lagi setelah Teacher menambahkan materi pembelajaran.</p></div>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
