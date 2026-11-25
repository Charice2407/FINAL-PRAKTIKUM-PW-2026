import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { COOKIE_NAME, verifySessionToken } from "@/lib/token";

// Mengambil identitas dari cookie, lalu memeriksa role terbaru di database.
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);

  if (!session?.userId) return null;

  const result = await query(
    `SELECT id, username, email, role, teacher_status, approved_at
     FROM users
     WHERE id = $1`,
    [session.userId]
  );

  return result.rows[0] || null;
}

// Memastikan pengguna sudah login dan memiliki role yang diizinkan.
export async function requireUserRole(roles) {
  const user = await getAuthenticatedUser();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return user;
}
