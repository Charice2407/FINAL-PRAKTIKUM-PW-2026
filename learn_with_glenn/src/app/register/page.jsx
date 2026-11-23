
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("student");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          accountType,
        }),
      });

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1800);
      }
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link
          href="/"
          className="text-sm font-semibold text-cyan-600"
        >
          Learn With Glenn
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Buat akun untuk mulai belajar di Learn With Glenn.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Nama pengguna"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              maxLength={72}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Jenis Akun
            </label>
            <select
              value={accountType}
              onChange={(event) => setAccountType(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher Applicant</option>
            </select>
          </div>

          {accountType === "teacher" && (
            <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800">
              Pendaftaran Teacher akan ditinjau oleh Admin.
              Anda dapat menjadi Teacher setelah permohonan disetujui.
            </p>
          )}

          {message && (
            <p
              className={`rounded-lg p-3 text-sm ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-cyan-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
