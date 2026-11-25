import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthenticatedUser, requireUserRole } from "@/lib/server-auth";

export async function GET(_request, { params }) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  const course = await query("SELECT id, teacher_id FROM courses WHERE id=$1", [id]);
  if (!course.rows[0]) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });
  const enrollment = user?.role === "student" ? await query("SELECT id FROM enrollments WHERE course_id=$1 AND student_id=$2", [id, user.id]) : { rowCount: 0 };
  if (user?.role !== "admin" && course.rows[0].teacher_id !== user?.id && !enrollment.rowCount)
    return NextResponse.json({ message: "Daftar materi hanya dapat diakses peserta course." }, { status: 403 });
  const result = await query(
    `SELECT ct.id, ct.course_id, ct.title, ct.content, ct.order_index,
     EXISTS(SELECT 1 FROM lesson_progress lp JOIN enrollments e ON e.id=lp.enrollment_id WHERE lp.content_id=ct.id AND e.student_id=$2) AS completed
     FROM contents ct WHERE ct.course_id=$1 ORDER BY ct.order_index`, [id, user?.id || 0]
  );
  return NextResponse.json({ contents: result.rows });
}

export async function POST(request, { params }) {
  const user = await requireUserRole(["teacher"]);
  if (!user) return NextResponse.json({ message: "Hanya Teacher yang dapat menambahkan materi." }, { status: 403 });
  const { id } = await params;
  const course = await query("SELECT id FROM courses WHERE id=$1 AND teacher_id=$2", [id, user.id]);
  if (!course.rowCount) return NextResponse.json({ message: "Course tidak ditemukan atau bukan milik Anda." }, { status: 403 });
  const body = await request.json();
  const title = body.title?.trim(); const content = body.content?.trim(); const order = Number(body.order_index);
  if (!title || !content || !Number.isInteger(order) || order < 1) return NextResponse.json({ message: "Judul, isi materi, dan urutan wajib valid." }, { status: 400 });
  try {
    const result = await query("INSERT INTO contents(course_id,title,content,order_index) VALUES($1,$2,$3,$4) RETURNING *", [id,title,content,order]);
    return NextResponse.json({ message: "Materi berhasil ditambahkan.", content: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ message: "Urutan materi sudah digunakan dalam course ini." }, { status: 409 });
    console.error(error); return NextResponse.json({ message: "Gagal menambahkan materi." }, { status: 500 });
  }
}
