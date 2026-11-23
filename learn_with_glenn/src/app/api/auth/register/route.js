
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const accountType = body.accountType;

    if (!username || !email || !password || !accountType) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 100) {
      return NextResponse.json(
        { message: "Username harus terdiri dari 3–100 karakter." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { message: "Password harus terdiri dari 8–72 karakter." },
        { status: 400 }
      );
    }

    if (!["student", "teacher"].includes(accountType)) {
      return NextResponse.json(
        { message: "Jenis akun tidak valid." },
        { status: 400 }
      );
    }

    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Password diubah menjadi hash sebelum disimpan.
    const passwordHash = await bcrypt.hash(password, 12);

    // Pendaftar Teacher tetap memiliki role student
    // sampai Admin menyetujui permohonannya.
    const teacherStatus =
      accountType === "teacher" ? "pending" : null;

    await query(
      `INSERT INTO users
       (username, email, password_hash, role, teacher_status)
       VALUES ($1, $2, $3, 'student', $4)`,
      [username, email, passwordHash, teacherStatus]
    );

    return NextResponse.json(
      {
        message:
          accountType === "teacher"
            ? "Pendaftaran berhasil. Permohonan Teacher menunggu persetujuan Admin."
            : "Pendaftaran Student berhasil. Silakan login.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
