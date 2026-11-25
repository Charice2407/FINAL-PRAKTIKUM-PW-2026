import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";

export async function PATCH(request, { params }) {
  const user = await requireUserRole(["teacher"]);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  const { id } = await params; const body = await request.json();
  const order = Number(body.order_index);
  if (!body.title?.trim() || !body.content?.trim() || !Number.isInteger(order) || order < 1)
    return NextResponse.json({ message: "Data materi belum valid." }, { status: 400 });
  try {
    const result = await query(
      `UPDATE contents ct SET title=$1, content=$2, order_index=$3
       FROM courses c WHERE ct.id=$4 AND ct.course_id=c.id AND c.teacher_id=$5 RETURNING ct.*`,
      [body.title.trim(), body.content.trim(), order, id, user.id]
    );
    if (!result.rowCount) return NextResponse.json({ message: "Materi tidak ditemukan atau bukan milik course Anda." }, { status: 404 });
    return NextResponse.json({ message: "Materi berhasil diperbarui.", content: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") return NextResponse.json({ message: "Urutan materi sudah digunakan." }, { status: 409 });
    return NextResponse.json({ message: "Gagal memperbarui materi." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const user = await requireUserRole(["teacher"]);
  if (!user) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
  const { id } = await params;
  const result = await query(
    `DELETE FROM contents ct USING courses c WHERE ct.id=$1 AND ct.course_id=c.id AND c.teacher_id=$2 RETURNING ct.id`, [id,user.id]
  );
  if (!result.rowCount) return NextResponse.json({ message: "Materi tidak ditemukan atau bukan milik course Anda." }, { status: 404 });
  return NextResponse.json({ message: "Materi berhasil dihapus." });
}
