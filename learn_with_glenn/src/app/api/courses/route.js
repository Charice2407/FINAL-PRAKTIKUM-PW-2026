import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthenticatedUser, requireUserRole } from "@/lib/server-auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().slice(0, 120);
    const category = searchParams.get("category") || "";
    const user = await getAuthenticatedUser();
    const values = [`%${search}%`];
    let categorySql = "";
    if (category) {
      const categoryId = Number(category);
      if (!Number.isInteger(categoryId) || categoryId < 1) {
        return NextResponse.json({ message: "Filter kategori tidak valid." }, { status: 400 });
      }
      values.push(categoryId);
      categorySql = `AND c.category_id = $${values.length}`;
    }
    const result = await query(
      `SELECT c.id, c.title, c.description, c.thumbnail, c.category_id,
              c.teacher_id, c.start_date, c.end_date, c.created_at,
              cat.name AS category_name, u.username AS teacher_name,
              COUNT(DISTINCT e.id)::int AS enrollment_count,
              EXISTS(SELECT 1 FROM enrollments e2 WHERE e2.course_id=c.id AND e2.student_id=$${values.length + 1}) AS enrolled
       FROM courses c
       JOIN categories cat ON cat.id=c.category_id
       JOIN users u ON u.id=c.teacher_id
       LEFT JOIN enrollments e ON e.course_id=c.id
       WHERE (c.title ILIKE $1 OR c.description ILIKE $1) ${categorySql}
       GROUP BY c.id, cat.name, u.username
       ORDER BY enrollment_count DESC, c.created_at DESC`,
      [...values, user?.id || 0]
    );
    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil course." }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await requireUserRole(["admin", "teacher"]);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

  try {
    const body = await request.json();
    const title = body.title?.trim();
    const description = body.description?.trim();
    const categoryId = Number(body.category_id);
    const teacherId = user.role === "admin" ? Number(body.teacher_id) : user.id;
    const startDate = body.start_date || null;
    const endDate = body.end_date || null;

    if (!title || title.length > 200 || !description || !Number.isInteger(categoryId) ||
        categoryId < 1 || !Number.isInteger(teacherId) || teacherId < 1) {
      return NextResponse.json({ message: "Judul (maksimal 200 karakter), deskripsi, kategori, dan Teacher wajib diisi dengan benar." }, { status: 400 });
    }
    if (startDate && endDate && String(endDate) < String(startDate)) {
      return NextResponse.json({ message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." }, { status: 400 });
    }
    if (user.role === "admin") {
      const teacher = await query("SELECT id FROM users WHERE id=$1 AND role='teacher'", [teacherId]);
      if (!teacher.rowCount) {
        return NextResponse.json({ message: "Teacher tidak ditemukan atau belum disetujui Admin." }, { status: 400 });
      }
    }

    const result = await query(
      `INSERT INTO courses (title, description, thumbnail, category_id, teacher_id, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, body.thumbnail?.trim() || null, categoryId, teacherId, startDate, endDate]
    );
    return NextResponse.json({ message: "Course berhasil dibuat.", course: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error.code === "23503") return NextResponse.json({ message: "Kategori atau Teacher tidak ditemukan." }, { status: 400 });
    if (error.code === "23514" || error.code === "22007") return NextResponse.json({ message: "Tanggal course tidak valid." }, { status: 400 });
    console.error("CREATE COURSE ERROR:", error);
    return NextResponse.json({ message: "Gagal membuat course." }, { status: 500 });
  }
}
