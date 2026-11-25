"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const initialForm = {
  username: "",
  email: "",
  password: "",
  role: "student",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(null);

  async function loadUsers() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Gagal mengambil data.");
        return;
      }

      setUsers(data.users);
    } catch {
      setMessage("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function openCreateForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
  }

  function openEditForm(user) {
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });
    setEditingId(user.id);
    setShowForm(true);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
        const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        };

        if (form.password.trim() !== "") {
        payload.password = form.password;
        }

        const response = await fetch("/api/admin/users", {
        method: editingId ? "PATCH" : "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            editingId ? { ...payload, id: editingId } : {
            ...payload,
            password: form.password,
            }
        ),
        });

        const data = await response.json();

        if (!response.ok) {
        setMessage(data.message || "Gagal menyimpan pengguna.");
        return;
        }

        setMessage(data.message);
        setShowForm(false);
        setForm(initialForm);
        setEditingId(null);

        await loadUsers();
    } catch (error) {
        console.error(error);
        setMessage("Tidak dapat terhubung ke server.");
    } finally {
        setSaving(false);
    }
  }

  function approveTeacher(id) {
    setPendingApproval(users.find((user) => user.id === id) || null);
  }

  async function confirmApproveTeacher() {
    if (!pendingApproval) return;
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingApproval.id, action: "approve" }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) await loadUsers();
    } catch {
      setMessage("Gagal menyetujui Teacher.");
    } finally {
      setPendingApproval(null);
    }
  }

  function deleteUser(user) {
    setPendingDelete(user);
  }

  async function confirmDeleteUser() {
    if (!pendingDelete) return;
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) await loadUsers();
    } catch {
      setMessage("Gagal menghapus pengguna.");
    } finally {
      setPendingDelete(null);
    }
  }

  const pendingUsers = users.filter(
    (user) => user.teacher_status === "pending"
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/dashboard/admin" className="font-bold text-cyan-600">
            ← Admin Dashboard
          </Link>
          <span className="font-semibold text-slate-700">
            User Management
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              User Management
            </h1>
            <p className="mt-2 text-slate-500">
              Kelola akun pengguna dan permohonan Teacher.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
          >
            + Tambah Pengguna
          </button>
        </div>

        {message && (
          <p className="mt-5 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800">
            {message}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? "Edit Pengguna" : "Tambah Pengguna"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Username
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  minLength={3}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  required
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {editingId
                    ? "Password baru (kosongkan jika tidak diubah)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  minLength={8}
                  maxLength={72}
                  required={!editingId}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  className="w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled={saving}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-5 py-2.5 font-semibold"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Permohonan Teacher</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              {pendingUsers.length} Pending
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              Belum ada permohonan Teacher yang menunggu persetujuan.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => approveTeacher(user.id)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Approve Teacher
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">Daftar Pengguna</h2>
            <p className="mt-1 text-sm text-slate-500">
              Total {users.length} pengguna terdaftar.
            </p>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Memuat data pengguna...</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-slate-500">Belum ada pengguna.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Pengguna</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status Teacher</th>
                    <th className="p-4">Tanggal Daftar</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-4">
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-slate-500">{user.email}</p>
                      </td>
                      <td className="p-4 capitalize">{user.role}</td>
                      <td className="p-4">
                        {user.teacher_status === "pending" ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                            Pending
                          </span>
                        ) : user.teacher_status === "approved" ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                            Approved
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(user)}
                            className="rounded-md border px-3 py-1.5 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user)}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {pendingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="approve-teacher-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl font-black text-emerald-700">✓</span>
            <h2 id="approve-teacher-title" className="mt-4 text-lg font-black text-slate-950">Setujui Teacher?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Akun <b className="text-slate-800">{pendingApproval.username}</b> akan mendapatkan role Teacher dan dapat mulai mengelola course.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingApproval(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button>
              <button type="button" onClick={confirmApproveTeacher} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">Setujui Teacher</button>
            </div>
          </div>
        </div>
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl font-black text-rose-700">!</span>
            <h2 id="delete-user-title" className="mt-4 text-lg font-black text-slate-950">Hapus pengguna?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Akun <b className="text-slate-800">{pendingDelete.username}</b> akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button>
              <button type="button" onClick={confirmDeleteUser} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">Ya, hapus akun</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
