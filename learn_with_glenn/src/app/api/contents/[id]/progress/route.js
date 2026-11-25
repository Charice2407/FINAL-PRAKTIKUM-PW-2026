import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";

export async function POST(_request, { params }) {
  const user = await requireUserRole(["student"]);
  if (!user) return NextResponse.json({ message: "Login sebagai Student diperlukan." }, { status: 401 });
  const { id } = await params;
  const result = await query(
    `INSERT INTO lesson_progress(enrollment_id,content_id)
     SELECT e.id, ct.id FROM contents ct JOIN enrollments e ON e.course_id=ct.course_id
     WHERE ct.id=$1 AND e.student_id=$2
     ON CONFLICT(enrollment_id,content_id) DO NOTHING RETURNING id`, [id,user.id]
  );
  if (!result.rowCount) {
    const exists = await query(`SELECT 1 FROM contents ct JOIN enrollments e ON e.course_id=ct.course_id WHERE ct.id=$1 AND e.student_id=$2`, [id,user.id]);
    if (!exists.rowCount) return NextResponse.json({ message: "Materi tidak ditemukan atau Anda belum bergabung." }, { status: 403 });
  }
  return NextResponse.json({ message: "Materi ditandai selesai." });
}
