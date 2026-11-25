
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { requireUserRole } from "@/lib/server-auth";

export async function GET() {
  try {
    const admin = await requireUserRole(["admin"]);

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT id, username, email, role, teacher_status,
              approved_at, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil data pengguna." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireUserRole(["admin"]);

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role;

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { message: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 100) {
      return NextResponse.json(
        { message: "Username harus 3–100 karakter." },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { message: "Password harus 8–72 karakter." },
        { status: 400 }
      );
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      return NextResponse.json(
        { message: "Role tidak valid." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users
       (username, email, password_hash, role, teacher_status, approved_at)
       VALUES (
         $1, $2, $3, $4,
         CASE WHEN $4 = 'teacher' THEN 'approved' ELSE NULL END,
         CASE WHEN $4 = 'teacher' THEN CURRENT_TIMESTAMP ELSE NULL END
       )
       RETURNING id, username, email, role, teacher_status, approved_at, created_at`,
      [username, email, passwordHash, role]
    );

    return NextResponse.json(
      {
        message: "Pengguna berhasil ditambahkan.",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Email sudah digunakan." },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan pengguna." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireUserRole(["admin"]);

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID pengguna tidak valid." },
        { status: 400 }
      );
    }

    // Menyetujui permohonan Teacher.
    if (body.action === "approve") {
      const approved = await query(
        `UPDATE users
         SET role = 'teacher',
             teacher_status = 'approved',
             approved_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND teacher_status = 'pending'
         RETURNING id, username, email, role, teacher_status, approved_at`,
        [id]
      );

      if (approved.rowCount === 0) {
        return NextResponse.json(
          { message: "Permohonan tidak ditemukan atau sudah diproses." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Teacher berhasil disetujui.",
        user: approved.rows[0],
      });
    }

    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = body.role;
    const password = body.password;

    if (!username || !email || !role) {
      return NextResponse.json(
        { message: "Username, email, dan role wajib diisi." },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 100) {
      return NextResponse.json(
        { message: "Username harus terdiri dari 3–100 karakter." },
        { status: 400 }
      );
    }

    if (!["admin", "teacher", "student"].includes(role)) {
      return NextResponse.json(
        { message: "Role tidak valid." },
        { status: 400 }
      );
    }

    if (id === admin.id && role !== "admin") {
      return NextResponse.json(
        { message: "Anda tidak dapat menurunkan role akun sendiri." },
        { status: 400 }
      );
    }

    let result;

    if (password && password.trim() !== "") {
      if (password.length < 8 || password.length > 72) {
        return NextResponse.json(
          { message: "Password harus 8–72 karakter." },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      result = await query(
        `UPDATE users
         SET username = $1,
             email = $2,
             role = $3,
             password_hash = $4,
             teacher_status = CASE
               WHEN $3::varchar = 'teacher' THEN 'approved'
               ELSE NULL
             END,
             approved_at = CASE
               WHEN $3::varchar = 'teacher' THEN COALESCE(approved_at, CURRENT_TIMESTAMP)
               ELSE NULL
             END
         WHERE id = $5
         RETURNING id, username, email, role, teacher_status, approved_at`,
        [username, email, role, passwordHash, id]
      );
    } else {
      result = await query(
        `UPDATE users
         SET username = $1,
             email = $2,
             role = $3,
             teacher_status = CASE
               WHEN $3::varchar = 'teacher' THEN 'approved'
               ELSE NULL
             END,
             approved_at = CASE
               WHEN $3::varchar = 'teacher' THEN COALESCE(approved_at, CURRENT_TIMESTAMP)
               ELSE NULL
             END
         WHERE id = $4
         RETURNING id, username, email, role, teacher_status, approved_at`,
        [username, email, role, id]
      );
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data pengguna berhasil diperbarui.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Email sudah digunakan." },
        { status: 409 }
      );
    }

    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui pengguna." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireUserRole(["admin"]);

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID pengguna tidak valid." },
        { status: 400 }
      );
    }

    if (id === admin.id) {
      return NextResponse.json(
        { message: "Anda tidak dapat menghapus akun sendiri." },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Pengguna berhasil dihapus.",
    });
  } catch (error) {
    // Course yang masih dimiliki Teacher tidak boleh terhapus begitu saja.
    if (error.code === "23503") {
      return NextResponse.json(
        {
          message:
            "Pengguna tidak dapat dihapus karena masih memiliki course. Pindahkan atau hapus course tersebut terlebih dahulu.",
        },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Gagal menghapus pengguna." },
      { status: 500 }
    );
  }
}
