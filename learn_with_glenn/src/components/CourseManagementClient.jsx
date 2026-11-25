"use client";

import { useMemo, useState } from "react";

const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-normal outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10";

export default function CourseManagementClient({ initialCourses, categories, teachers = [], role, teacherId }) {
  const [courses, setCourses] = useState(initialCourses);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const emptyForm = useMemo(() => ({
    title: "", description: "", category_id: categories[0]?.id || "",
    teacher_id: teachers[0]?.id || "", thumbnail: "", start_date: "", end_date: "",
  }), [categories, teachers]);
  const [form, setForm] = useState(emptyForm);

  function change(event) {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  }

  function edit(course) {
    setEditing(course.id);
    setForm({
      title: course.title, description: course.description,
      category_id: String(course.category_id), teacher_id: String(course.teacher_id),
      thumbnail: course.thumbnail || "", start_date: course.start_date?.slice(0, 10) || "",
      end_date: course.end_date?.slice(0, 10) || "",
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
    setNotice("");
  }

  async function refresh() {
    const response = await fetch("/api/courses", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal memuat course.");
    setCourses(data.courses.filter((course) => role === "admin" || Number(course.teacher_id) === Number(teacherId)));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setNoticeType("error");
      setNotice("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(editing ? `/api/courses/${editing}` : "/api/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setNoticeType("error");
        setNotice(data.message || "Gagal menyimpan course.");
        return;
      }
      setNoticeType("success");
      setNotice(data.message);
      setEditing(null);
      setForm(emptyForm);
      await refresh();
    } catch {
      setNoticeType("error");
      setNotice("Tidak dapat terhubung ke server. Periksa koneksi dan coba kembali.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCourse() {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/courses/${pendingDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setNoticeType("error");
        setNotice(data.message || "Gagal menghapus course.");
      } else {
        setNoticeType("success");
        setNotice(data.message);
        setCourses((items) => items.filter((item) => item.id !== pendingDelete.id));
      }
    } catch {
      setNoticeType("error");
      setNotice("Tidak dapat terhubung ke server.");
    } finally {
      setPendingDelete(null);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
        <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="eyebrow">{editing ? "UPDATE CLASS" : "CREATE CLASS"}</p><h2 className="mt-1 text-xl font-black text-slate-950">{editing ? "Edit Course" : "Buat Course Baru"}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Lengkapi informasi kelas. Tanggal mulai dan selesai bersifat opsional.</p></div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Nama Course<input name="title" value={form.title} onChange={change} required maxLength={200} placeholder="Contoh: Dasar Web Development" className={fieldClass} /></label>
            <label className="block text-sm font-bold text-slate-700">Deskripsi<textarea name="description" value={form.description} onChange={change} required rows={5} placeholder="Jelaskan tujuan dan materi utama course..." className={fieldClass} /></label>
            <label className="block text-sm font-bold text-slate-700">Kategori<select name="category_id" value={form.category_id} onChange={change} required className={fieldClass}><option value="" disabled>Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            {role === "admin" && <label className="block text-sm font-bold text-slate-700">Teacher<select name="teacher_id" value={form.teacher_id} onChange={change} required className={fieldClass}><option value="" disabled>Pilih Teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.username} · {teacher.email}</option>)}</select></label>}
            <label className="block text-sm font-bold text-slate-700">URL Thumbnail <span className="font-normal text-slate-400">(opsional)</span><input type="url" name="thumbnail" value={form.thumbnail} onChange={change} placeholder="https://example.com/image.jpg" className={fieldClass} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold text-slate-700">Tanggal mulai<input type="date" name="start_date" value={form.start_date} onChange={change} className={fieldClass} /></label><label className="block text-sm font-bold text-slate-700">Tanggal selesai<input type="date" name="end_date" value={form.end_date} onChange={change} min={form.start_date || undefined} className={fieldClass} /></label></div>
          </div>
          <button disabled={busy || !categories.length || (role === "admin" && !teachers.length)} className="mt-5 w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Course"}</button>
          {editing && <button type="button" onClick={cancelEdit} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Batalkan edit</button>}
          {!categories.length && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Tambahkan kategori terlebih dahulu sebelum membuat course.</p>}
          {role === "admin" && !teachers.length && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Belum ada Teacher yang disetujui Admin.</p>}
          {notice && <p role="status" className={`mt-3 rounded-xl p-3 text-xs leading-5 ${noticeType === "error" ? "bg-rose-50 text-rose-700" : noticeType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-cyan-50 text-cyan-800"}`}>{notice}</p>}
        </form>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="eyebrow">COURSE LIBRARY</p><h2 className="mt-1 text-xl font-black text-slate-950">Daftar Course</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{courses.length} kelas</span></div>
          <div className="space-y-3">
            {courses.map((course) => <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-800">{course.category_name}</span><h3 className="mt-3 text-lg font-extrabold text-slate-900">{course.title}</h3><p className="mt-1 text-xs text-slate-500">Teacher: {course.teacher_name} · {course.enrollment_count} peserta</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>{(course.start_date || course.end_date) && <p className="mt-3 text-xs text-slate-400">Periode: {course.start_date ? new Date(course.start_date).toLocaleDateString("id-ID") : "Tanpa batas mulai"} – {course.end_date ? new Date(course.end_date).toLocaleDateString("id-ID") : "Lifetime access"}</p>}</div>
                <div className="flex shrink-0 gap-2"><button type="button" onClick={() => edit(course)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-cyan-300 hover:text-cyan-800">Edit</button><button type="button" onClick={() => setPendingDelete(course)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100">Hapus</button></div>
              </div>
              {role === "teacher" && <a href={`/dashboard/teacher/courses/${course.id}`} className="mt-4 inline-flex text-xs font-extrabold text-cyan-700 hover:underline">Kelola materi course →</a>}
            </article>)}
            {!courses.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center"><p className="font-bold text-slate-800">Belum ada course</p><p className="mt-1 text-sm text-slate-500">Course yang dibuat akan muncul di daftar ini.</p></div>}
          </div>
        </section>
      </div>

      {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="delete-course-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl text-rose-700">!</span><h2 id="delete-course-title" className="mt-4 text-lg font-black text-slate-950">Hapus course?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Course <b className="text-slate-800">{pendingDelete.title}</b> akan dihapus. Data materi, enrollment, dan progress terkait juga dapat ikut terhapus.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPendingDelete(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button><button type="button" disabled={busy} onClick={removeCourse} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">{busy ? "Menghapus..." : "Ya, hapus course"}</button></div>
        </div>
      </div>}
    </>
  );
}
