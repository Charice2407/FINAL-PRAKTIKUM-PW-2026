import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";

function validDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true;
  return String(endDate) >= String(startDate);
}

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json({ message: "ID course tidak valid." }, { status: 400 });
  }
  try {
    const result = await query(
      `SELECT c.*, cat.name AS category_name, u.username AS teacher_name, u.email AS teacher_email
       FROM courses c
       JOIN categories cat ON cat.id=c.category_id
       JOIN users u ON u.id=c.teacher_id
       WHERE c.id=$1`,
      [id]
    );
    if (!result.rows[0]) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ course: result.rows[0] });
  } catch (error) {
    console.error("GET COURSE ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil detail course." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const user = await requireUserRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

  const { id } = await params;
  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json({ message: "ID course tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const existing = await query("SELECT * FROM courses WHERE id=$1", [id]);
    if (!existing.rows[0]) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });

    const current = existing.rows[0];
    if (user.role === "teacher" && Number(current.teacher_id) !== Number(user.id)) {
      return NextResponse.json({ message: "Anda hanya dapat mengubah course milik sendiri." }, { status: 403 });
    }

    const title = body.title === undefined ? current.title : body.title?.trim();
    const description = body.description === undefined ? current.description : body.description?.trim();
    const thumbnail = body.thumbnail === undefined ? current.thumbnail : (body.thumbnail?.trim() || null);
    const categoryId = body.category_id === undefined ? current.category_id : Number(body.category_id);
    const startDate = body.start_date === undefined ? current.start_date : (body.start_date || null);
    const endDate = body.end_date === undefined ? current.end_date : (body.end_date || null);
    const teacherId = user.role === "admin"
      ? (body.teacher_id === undefined ? current.teacher_id : Number(body.teacher_id))
      : user.id;

    if (!title || !description || !Number.isInteger(Number(categoryId)) || Number(categoryId) < 1 ||
        !Number.isInteger(Number(teacherId)) || Number(teacherId) < 1) {
      return NextResponse.json({ message: "Judul, deskripsi, kategori, dan Teacher wajib valid." }, { status: 400 });
    }
    if (!validDateRange(startDate, endDate)) {
      return NextResponse.json({ message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." }, { status: 400 });
    }

    if (user.role === "admin") {
      const teacher = await query("SELECT id FROM users WHERE id=$1 AND role='teacher'", [teacherId]);
      if (!teacher.rowCount) {
        return NextResponse.json({ message: "Pengajar yang dipilih tidak valid atau belum disetujui." }, { status: 400 });
      }
    }

    const result = await query(
      `UPDATE courses
       SET title=$1, description=$2, thumbnail=$3, category_id=$4,
           teacher_id=$5, start_date=$6, end_date=$7
       WHERE id=$8 RETURNING *`,
      [title, description, thumbnail, categoryId, teacherId, startDate, endDate, id]
    );
    return NextResponse.json({ message: "Course berhasil diperbarui.", course: result.rows[0] });
  } catch (error) {
    if (error.code === "23503" || error.code === "23514") {
      return NextResponse.json({ message: "Kategori, Teacher, atau rentang tanggal tidak valid." }, { status: 400 });
    }
    console.error("UPDATE COURSE ERROR:", error);
    return NextResponse.json({ message: "Gagal memperbarui course." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const user = await requireUserRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  const { id } = await params;
  if (!/^\d+$/.test(String(id))) {
    return NextResponse.json({ message: "ID course tidak valid." }, { status: 400 });
  }

  try {
    const result = user.role === "admin"
      ? await query("DELETE FROM courses WHERE id=$1 RETURNING id", [id])
      : await query("DELETE FROM courses WHERE id=$1 AND teacher_id=$2 RETURNING id", [id, user.id]);
    if (!result.rowCount) return NextResponse.json({ message: "Course tidak ditemukan atau bukan milik Anda." }, { status: 404 });
    return NextResponse.json({ message: "Course berhasil dihapus." });
  } catch (error) {
    if (error.code === "23503") {
      return NextResponse.json({ message: "Course tidak dapat dihapus karena masih memiliki data terkait." }, { status: 409 });
    }
    console.error("DELETE COURSE ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat menghapus course." }, { status: 500 });
  }
}
