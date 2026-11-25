import Navbar from "@/components/Navbar";
import CourseCatalog from "@/components/CourseCatalog";
import { query } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/server-auth";

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;
  const initialSearch = typeof params?.search === "string" ? params.search.slice(0, 120) : "";
  const initialCategory = typeof params?.category === "string" ? params.category : "all";
  const user = await getAuthenticatedUser();
  const [coursesResult, categoriesResult] = await Promise.all([
    query(`SELECT c.id,c.title,c.description,c.thumbnail,c.category_id,cat.name AS category_name,
      u.username AS teacher_name, COUNT(DISTINCT e.id)::int AS enrollment_count,
      EXISTS(SELECT 1 FROM enrollments ex WHERE ex.course_id=c.id AND ex.student_id=$1) AS enrolled,
      CASE WHEN EXISTS(SELECT 1 FROM enrollments ex WHERE ex.course_id=c.id AND ex.student_id=$1)
      THEN COALESCE((SELECT ROUND(COUNT(DISTINCT lp.id)::numeric*100/NULLIF(COUNT(DISTINCT ct.id),0))::int
        FROM contents ct LEFT JOIN lesson_progress lp ON lp.content_id=ct.id
        AND lp.enrollment_id=(SELECT e2.id FROM enrollments e2 WHERE e2.course_id=c.id AND e2.student_id=$1)
        WHERE ct.course_id=c.id),0) ELSE 0 END AS progress_percent
      FROM courses c JOIN categories cat ON cat.id=c.category_id
      JOIN users u ON u.id=c.teacher_id LEFT JOIN enrollments e ON e.course_id=c.id
      GROUP BY c.id,cat.name,u.username ORDER BY enrollment_count DESC,c.created_at DESC`, [user?.id || 0]),
    query("SELECT id,name FROM categories ORDER BY name"),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex-1 bg-slate-50">
        <section className="relative overflow-hidden bg-slate-950 px-5 py-12 text-white sm:px-6 sm:py-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[50px] border-cyan-400/10" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-extrabold tracking-[.2em] text-cyan-300">EXPLORE & LEARN</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Temukan kelas berikutnya.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Jelajahi course pilihan, temukan pengajar yang tepat, dan kembangkan kemampuanmu selangkah demi selangkah.</p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <CourseCatalog initialCourses={coursesResult.rows} categories={categoriesResult.rows} initialSearch={initialSearch} initialCategory={initialCategory} />
        </section>
      </main>
    </>
  );
}
