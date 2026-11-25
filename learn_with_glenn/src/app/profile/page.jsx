import Link from "next/link";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";
import DashboardShell from "@/components/DashboardShell";

export default async function ProfilePage() {
  const user = await requireUserRole(["admin", "teacher", "student"]);
  if (!user) redirect("/login");
  const isNewTeacher = user.role === "teacher" && user.approved_at &&
    Date.now() - new Date(user.approved_at).getTime() < 24 * 60 * 60 * 1000;

  let studentCourses = [];
  let teacherCourses = [];
  let teacherProgress = [];

  if (user.role === "student") {
    const result = await query(`SELECT c.id,c.title,u.username AS teacher_name,
      COUNT(DISTINCT ct.id)::int AS total,COUNT(DISTINCT lp.id)::int AS done
      FROM enrollments e JOIN courses c ON c.id=e.course_id
      JOIN users u ON u.id=c.teacher_id
      LEFT JOIN contents ct ON ct.course_id=c.id
      LEFT JOIN lesson_progress lp ON lp.content_id=ct.id AND lp.enrollment_id=e.id
      WHERE e.student_id=$1 GROUP BY c.id,u.username ORDER BY e.enrolled_at DESC`, [user.id]);
    studentCourses = result.rows;
  }

  if (user.role === "teacher") {
    const [courses, progress] = await Promise.all([
      query(`SELECT c.id,c.title,COUNT(DISTINCT e.id)::int AS students
        FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id
        WHERE c.teacher_id=$1 GROUP BY c.id ORDER BY c.created_at DESC`, [user.id]),
      query(`SELECT c.id AS course_id,c.title,u.username,
        COUNT(DISTINCT ct.id)::int AS total,COUNT(DISTINCT lp.id)::int AS done
        FROM courses c JOIN enrollments e ON e.course_id=c.id
        JOIN users u ON u.id=e.student_id
        LEFT JOIN contents ct ON ct.course_id=c.id
        LEFT JOIN lesson_progress lp ON lp.content_id=ct.id AND lp.enrollment_id=e.id
        WHERE c.teacher_id=$1 GROUP BY c.id,u.id ORDER BY c.title,u.username`, [user.id]),
    ]);
    teacherCourses = courses.rows;
    teacherProgress = progress.rows;
  }

  return (
    <DashboardShell user={user}>
      <div className="mb-8"><p className="eyebrow">MY ACCOUNT</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Profil Pengguna</h1><p className="mt-2 text-sm text-slate-500">Informasi akun dan aktivitas pembelajaranmu.</p></div>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-700" />
        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-cyan-50 text-3xl font-black text-cyan-800 shadow-sm">{user.username.slice(0,1).toUpperCase()}</div>
            <span className="mb-1 rounded-full bg-cyan-50 px-4 py-2 text-xs font-extrabold capitalize text-cyan-800">{user.role}</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-950">{user.username}</h2><p className="mt-1 text-sm text-slate-500">{user.email}</p>
          {user.teacher_status === "pending" && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><b>Permohonan Teacher sedang ditinjau.</b> Untuk sementara, akunmu tetap dapat menggunakan fitur Student sampai Admin memberikan persetujuan.</p>}
          {isNewTeacher && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><b>Selamat, permohonan Teacher disetujui!</b> Sekarang kamu dapat membuat dan mengelola course.</p>}
        </div>
      </section>

      {user.role === "student" && <section className="mt-9"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">Course Saya</h2><p className="mt-1 text-sm text-slate-500">Pantau progres dari kelas yang kamu ikuti.</p></div><Link href="/courses" className="text-sm font-bold text-cyan-700 hover:underline">Cari course →</Link></div>
        {studentCourses.length ? <div className="grid gap-4 md:grid-cols-2">{studentCourses.map((course) => { const percent = course.total ? Math.round(course.done / course.total * 100) : 0; return <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-extrabold text-slate-900">{course.title}</h3><p className="mt-1 text-xs text-slate-500">Teacher: {course.teacher_name}</p><div className="mt-5 flex justify-between text-xs text-slate-500"><span>Progress belajar</span><b className="text-cyan-700">{course.done}/{course.total} · {percent}%</b></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${percent}%` }} /></div><Link href={`/learn/${course.id}`} className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:underline">Lanjutkan belajar →</Link></article>})}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-bold text-slate-800">Belum mengikuti course</p><p className="mt-1 text-sm text-slate-500">Pilih kelas dan mulai perjalanan belajarmu.</p><Link href="/courses" className="mt-4 inline-flex rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-700">Jelajahi course</Link></div>}
      </section>}

      {user.role === "teacher" && <>
        <section className="mt-9"><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold text-slate-900">Course Saya</h2><p className="mt-1 text-sm text-slate-500">Daftar kelas yang kamu ajarkan.</p></div><Link href="/dashboard/teacher/courses" className="text-sm font-bold text-cyan-700 hover:underline">Kelola course →</Link></div>
          {teacherCourses.length ? <div className="grid gap-4 md:grid-cols-2">{teacherCourses.map((course) => <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-extrabold text-slate-900">{course.title}</h3><p className="mt-2 text-sm text-slate-500">{course.students} peserta terdaftar</p><Link href={`/dashboard/teacher/courses/${course.id}`} className="mt-4 inline-flex text-sm font-bold text-cyan-700 hover:underline">Kelola materi →</Link></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-bold text-slate-800">Belum ada course</p><Link href="/dashboard/teacher/courses" className="mt-3 inline-flex text-sm font-bold text-cyan-700 hover:underline">Buat course pertama →</Link></div>}
        </section>
        <section className="mt-9"><h2 className="text-xl font-extrabold text-slate-900">Progress Student</h2><div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Course</th><th className="p-4">Student</th><th className="p-4">Materi selesai</th></tr></thead><tbody>{teacherProgress.map((item,index) => <tr key={`${item.course_id}-${index}`} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-800">{item.title}</td><td className="p-4 text-slate-600">{item.username}</td><td className="p-4 text-slate-600">{item.done}/{item.total}</td></tr>)}{!teacherProgress.length && <tr><td colSpan="3" className="p-6 text-center text-slate-500">Belum ada Student yang bergabung.</td></tr>}</tbody></table></div></section>
      </>}
      {user.role === "admin" && <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-extrabold text-slate-900">Administrator</h2><p className="mt-1 text-sm text-slate-500">Kelola seluruh aktivitas platform melalui dashboard Admin.</p><Link href="/dashboard/admin" className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-cyan-700">Buka Dashboard Admin →</Link></section>}
    </DashboardShell>
  );
}
