"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";

export default function CourseCatalog({ initialCourses, categories, initialSearch = "", initialCategory = "all" }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const filtered = useMemo(() => initialCourses.filter((course) => {
    const text = `${course.title} ${course.description} ${course.teacher_name}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) &&
      (category === "all" || String(course.category_id) === category);
  }), [initialCourses, search, category]);

  return (
    <>
      <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px_auto]">
          <label className="relative block">
            <span className="sr-only">Cari course</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, deskripsi, atau pengajar..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10" />
          </label>
          <label>
            <span className="sr-only">Filter kategori</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10">
              <option value="all">Semua kategori</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800">Reset filter</button>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500"><b className="text-slate-900">{filtered.length}</b> course ditemukan</p>
        {(search || category !== "all") && <p className="text-xs font-semibold text-cyan-700">Filter aktif</p>}
      </div>
      {filtered.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}</div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">⌕</span>
          <h2 className="mt-4 font-extrabold text-slate-900">Course tidak ditemukan</h2>
          <p className="mt-1 text-sm text-slate-500">Coba kata kunci atau kategori yang berbeda.</p>
          <button type="button" onClick={() => { setSearch(""); setCategory("all"); }} className="mt-4 text-sm font-bold text-cyan-700 hover:underline">Hapus semua filter</button>
        </div>
      )}
    </>
  );
}
