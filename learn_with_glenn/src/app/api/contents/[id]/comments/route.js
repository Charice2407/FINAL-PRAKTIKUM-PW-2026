import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/server-auth";

async function canAccessDiscussion(contentId, user) {
  const allowed = await query(
    `SELECT 1
     FROM contents ct
     JOIN courses c ON c.id=ct.course_id
     WHERE ct.id=$1
       AND (
         c.teacher_id=$2
         OR EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.course_id=c.id AND e.student_id=$2
         )
         OR $3='admin'
       )`,
    [contentId, user.id, user.role]
  );
  return allowed.rowCount > 0;
}

export async function GET(_request, { params }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ message: "Login diperlukan untuk melihat diskusi." }, { status: 401 });
  const { id } = await params;

  try {
    if (!await canAccessDiscussion(id, user)) {
      return NextResponse.json({ message: "Anda tidak memiliki akses ke diskusi materi ini." }, { status: 403 });
    }
    const result = await query(
      `SELECT cm.id, cm.message, cm.created_at, u.username
       FROM comments cm
       JOIN users u ON u.id=cm.user_id
       WHERE cm.content_id=$1
       ORDER BY cm.created_at ASC`,
      [id]
    );
    return NextResponse.json({ comments: result.rows });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    return NextResponse.json({ message: "Gagal mengambil diskusi." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ message: "Login untuk ikut berdiskusi." }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const message = body.message?.trim();
    if (!message || message.length > 2000) {
      return NextResponse.json({ message: "Komentar wajib diisi (maksimal 2.000 karakter)." }, { status: 400 });
    }
    if (!await canAccessDiscussion(id, user)) {
      return NextResponse.json({ message: "Anda tidak memiliki akses ke diskusi materi ini." }, { status: 403 });
    }
    const result = await query(
      "INSERT INTO comments(content_id,user_id,message) VALUES($1,$2,$3) RETURNING id,message,created_at",
      [id, user.id, message]
    );
    return NextResponse.json({
      message: "Komentar berhasil dikirim.",
      comment: { ...result.rows[0], username: user.username },
    }, { status: 201 });
  } catch (error) {
    console.error("POST COMMENT ERROR:", error);
    return NextResponse.json({ message: "Gagal mengirim komentar." }, { status: 500 });
  }
}
