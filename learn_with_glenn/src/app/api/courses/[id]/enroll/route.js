import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";

export async function POST(_request, { params }) {
  const user = await requireUserRole(["student"]);
  if (!user) return NextResponse.json({ message: "Login sebagai Student untuk bergabung." }, { status: 401 });
  const { id } = await params;
  const course = await query("SELECT id FROM courses WHERE id=$1", [id]);
  if (!course.rowCount) return NextResponse.json({ message: "Course tidak ditemukan." }, { status: 404 });
  try {
    await query("INSERT INTO enrollments(student_id,course_id) VALUES($1,$2) ON CONFLICT(student_id,course_id) DO NOTHING", [user.id,id]);
    return NextResponse.json({ message: "Berhasil bergabung ke course.", redirect: `/learn/${id}` });
  } catch (error) {
    console.error(error); return NextResponse.json({ message: "Gagal bergabung ke course." }, { status: 500 });
  }
}
