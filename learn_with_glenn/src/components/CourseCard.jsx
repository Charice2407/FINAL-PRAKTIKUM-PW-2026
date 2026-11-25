import Link from "next/link";

const gradients = [
  "from-cyan-500 via-sky-500 to-blue-700",
  "from-violet-500 via-indigo-500 to-slate-900",
  "from-emerald-400 via-teal-500 to-cyan-800",
  "from-amber-400 via-orange-500 to-rose-700",
];

export default function CourseCard({ course, index = 0 }) {
  const progress = Math.max(0, Math.min(100, Number(course.progress_percent || 0)));
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-200 hover:shadow-[0_18px_45px_rgba(8,145,178,.13)]">
      <div className={`relative flex h-40 items-end overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]} p-5 text-white`}>
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[22px] border-white/10 transition duration-500 group-hover:scale-110" />
        <div className="absolute -bottom-14 right-20 h-32 w-32 rounded-full bg-white/10 blur-sm" />
        <span className="relative rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">{course.category_name || "Learning"}</span>
        <span className="relative ml-auto rounded-full bg-slate-950/20 px-3 py-1.5 text-xs font-semibold backdrop-blur">{course.enrollment_count ?? 0} peserta</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-700">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          KELAS ONLINE
        </div>
        <h3 className="text-lg font-extrabold leading-snug text-slate-900 transition group-hover:text-cyan-800">{course.title}</h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">{course.description}</p>
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-700">{(course.teacher_name || "T").slice(0,1).toUpperCase()}</span>
          <span>Pengajar <b className="ml-1 text-slate-700">{course.teacher_name || "Teacher"}</b></span>
        </div>
        {course.enrolled && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-slate-500"><span>Progress belajar</span><b className="text-cyan-700">{progress}%</b></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        <Link href={course.enrolled ? `/learn/${course.id}` : `/courses/${course.id}`} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700 focus-visible:outline-cyan-500">
          {course.enrolled ? "Lanjutkan belajar" : "Lihat detail"}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
