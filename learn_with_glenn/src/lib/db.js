import { Pool } from "pg";

// Koneksi database bersama agar aplikasi tidak membuat pool baru
// setiap kali halaman atau API dijalankan.
const globalForPg = globalThis;

const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

// Fungsi untuk menjalankan query SQL dengan parameter.
export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

export default pool;
