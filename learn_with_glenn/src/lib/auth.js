
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  verifySessionToken,
} from "@/lib/token";

// Membaca session pengguna yang sedang login.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifySessionToken(token);
}

// Memeriksa apakah pengguna memiliki salah satu role yang diizinkan.
export async function requireRole(allowedRoles) {
  const user = await getCurrentUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
