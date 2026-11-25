
import { NextResponse } from "next/server";
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
      "SELECT id, name, description, created_at FROM categories ORDER BY name ASC"
    );

    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil kategori." },
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
    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { message: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, created_at`,
      [name, description]
    );

    return NextResponse.json(
      {
        message: "Kategori berhasil ditambahkan.",
        category: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Nama kategori sudah digunakan." },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Gagal menambahkan kategori." },
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
    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!Number.isInteger(id) || id <= 0 || !name) {
      return NextResponse.json(
        { message: "Data kategori tidak valid." },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE categories
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING id, name, description, created_at`,
      [name, description, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Kategori berhasil diperbarui.",
      category: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "Nama kategori sudah digunakan." },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Gagal memperbarui kategori." },
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
        { message: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const result = await query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Kategori berhasil dihapus.",
    });
  } catch (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          message:
            "Kategori tidak dapat dihapus karena masih digunakan oleh course. Ubah kategori course terlebih dahulu.",
        },
        { status: 409 }
      );
    }

    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menghapus kategori." },
      { status: 500 }
    );
  }
}
