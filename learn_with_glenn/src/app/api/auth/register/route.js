import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { COOKIE_NAME, createSessionToken } from "@/lib/token";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = normalizeEmail(body.email);
    const password = body.password;
    const accountType = body.accountType;

    if (!username || !email || !password || !accountType) {
      return NextResponse.json({ message: "Semua kolom wajib diisi." }, { status: 400 });
    }
    if (username.length < 3 || username.length > 100) {
      return NextResponse.json({ message: "Username harus terdiri dari 3–100 karakter." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Format email tidak valid." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      return NextResponse.json({ message: "Password harus terdiri dari 8–72 karakter." }, { status: 400 });
    }
    if (!["student", "teacher"].includes(accountType)) {
      return NextResponse.json({ message: "Jenis akun tidak valid." }, { status: 400 });
    }

    const existingUser = await query("SELECT id FROM users WHERE email=$1", [email]);
    if (existingUser.rowCount) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const teacherStatus = accountType === "teacher" ? "pending" : null;

    // Semua pendaftar langsung masuk sebagai Student. Teacher Applicant
    // tetap memiliki teacher_status pending sampai disetujui Admin.
    const created = await query(
      `INSERT INTO users (username,email,password_hash,role,teacher_status)
       VALUES ($1,$2,$3,'student',$4)
       RETURNING id,username,email,role,teacher_status`,
      [username, email, passwordHash, teacherStatus]
    );
    const user = created.rows[0];
    const token = await createSessionToken(user);
    const response = NextResponse.json({
      message: accountType === "teacher"
        ? "Pendaftaran berhasil. Kamu sudah masuk sebagai Student; permohonan Teacher menunggu persetujuan Admin."
        : "Pendaftaran berhasil. Kamu sudah masuk sebagai Student.",
      user: { id: user.id, username: user.username, email: user.email, role: user.role, teacherStatus: user.teacher_status },
    }, { status: 201 });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
