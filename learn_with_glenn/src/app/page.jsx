import Link from "next/link";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import { query } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/server-auth";

export default async function Home() {
  let courses = [];
  let categories = [];
  try {
    const user = await getAuthenticatedUser();
    const [courseResult, categoryResult] = await Promise.all([
      query(`SELECT c.id,c.title,c.description,c.thumbnail,cat.name AS category_name,
        u.username AS teacher_name, COUNT(DISTINCT e.id)::int AS enrollment_count,
        EXISTS(SELECT 1 FROM enrollments ex WHERE ex.course_id=c.id AND ex.student_id=$1) AS enrolled,
        CASE WHEN EXISTS(SELECT 1 FROM enrollments ex WHERE ex.course_id=c.id AND ex.student_id=$1)
        THEN COALESCE((SELECT ROUND(COUNT(DISTINCT lp.id)::numeric*100/NULLIF(COUNT(DISTINCT ct.id),0))::int
          FROM contents ct LEFT JOIN lesson_progress lp ON lp.content_id=ct.id
          AND lp.enrollment_id=(SELECT e2.id FROM enrollments e2 WHERE e2.course_id=c.id AND e2.student_id=$1)
          WHERE ct.course_id=c.id),0) ELSE 0 END AS progress_percent
        FROM courses c JOIN categories cat ON cat.id=c.category_id
        JOIN users u ON u.id=c.teacher_id LEFT JOIN enrollments e ON e.course_id=c.id
        GROUP BY c.id,cat.name,u.username ORDER BY enrollment_count DESC,c.created_at DESC LIMIT 5`, [user?.id || 0]),
      query("SELECT id,name FROM categories ORDER BY name"),
    ]);
    courses = courseResult.rows;
    categories = categoryResult.rows;
  } catch (error) {
    console.error("Homepage data error:", error);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <section className="relative isolate overflow-hidden bg-slate-950 text-white">
          <div className="absolute -right-28 -top-28 -z-10 h-[34rem] w-[34rem] rounded-full border-[70px] border-cyan-400/10" />
          <div className="absolute -bottom-48 left-[38%] -z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 sm:py-24 md:grid-cols-[1.1fr_.9fr] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[.18em] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> LEARN. PRACTICE. GROW.</p>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Upgrade your skills, <span className="text-cyan-300">shape your future.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Temukan kelas online yang membantumu belajar hal baru, berlatih, dan berkembang sesuai tujuanmu.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="/courses" className="rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 hover:bg-cyan-300">Jelajahi Course <span aria-hidden="true">→</span></Link><Link href="/register" className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white hover:border-white/40 hover:bg-white/10">Mulai Belajar</Link></div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-400"><span>✓ Materi terstruktur</span><span>✓ Progress tersimpan</span><span>✓ Diskusi pembelajaran</span></div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/5 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/[.06] p-5 shadow-2xl backdrop-blur sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-bold tracking-widest text-cyan-300">LEARN WITH GLENN</p><h2 className="mt-1 text-xl font-extrabold">Your learning space</h2></div><span className="rounded-xl bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-200">LWG</span></div>
                <div className="mt-6 space-y-5">
                  {[["01","Belajar terarah","Materi tersusun berdasarkan urutan pembelajaran."],["02","Pantau progres","Tandai materi selesai dan lihat perkembanganmu."],["03","Diskusi bersama","Tanyakan hal yang belum dipahami pada setiap materi."]].map(([number,title,description]) => <div key={number} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-300">{number}</span><div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div></div>)}
                </div>
                <div className="mt-7 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 p-4 text-slate-950"><p className="text-xs font-bold uppercase tracking-wider text-cyan-950/70">Small steps, big progress</p><p className="mt-1 text-lg font-black">Mulai perjalanan belajarmu hari ini.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center"><p className="eyebrow">FIND YOUR NEXT CLASS</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Belajar sesuatu yang baru.</h2><p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">Cari kelas berdasarkan topik yang ingin kamu kuasai.</p></div>
          <form action="/courses" method="get" className="mx-auto mt-7 grid max-w-3xl gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 sm:grid-cols-[1fr_220px_auto]">
            <label className="relative"><span className="sr-only">Kata kunci course</span><span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">⌕</span><input name="search" placeholder="Contoh: Web Development..." className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20" /></label>
            <label><span className="sr-only">Kategori course</span><select name="category" defaultValue="all" className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500/20"><option value="all">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <button className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700">Cari Course</button>
          </form>
        </section>

        <section className="bg-slate-50 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">POPULAR COURSES</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Course populer</h2><p className="mt-2 text-sm text-slate-500">Lima course yang paling banyak diikuti komunitas.</p></div><Link href="/courses" className="text-sm font-bold text-cyan-700 hover:underline">Lihat semua course →</Link></div>
            {courses.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course,index) => <CourseCard key={course.id} course={course} index={index} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-bold text-slate-800">Course akan segera hadir</p><p className="mt-1 text-sm text-slate-500">Kelas akan muncul di sini setelah Admin atau Teacher menambahkannya.</p></div>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
