# Learn With Glenn (LWG)

Learn With Glenn adalah platform kursus online berbasis multi-role untuk Admin, Teacher, Student, dan Public User (Guest). Aplikasi dikembangkan menggunakan Next.js App Router, React, Tailwind CSS, dan PostgreSQL.

## Teknologi

- Next.js 16 (App Router dan Route Handlers)
- React 19
- JavaScript (JSX)
- Tailwind CSS 4
- PostgreSQL
- `pg` untuk koneksi dan raw SQL berparameter
- `bcryptjs` untuk hashing password
- `jose` untuk session JWT
- ESLint untuk pemeriksaan kode

## Fitur utama

### Public User (Guest)
- Melihat homepage dan lima course populer.
- Menjelajahi katalog, mencari course, dan memfilter kategori.
- Melihat detail course dan informasi Teacher.
- Harus login sebagai Student untuk bergabung ke course.

### Student
- Registrasi dan login.
- Mengikuti course.
- Mengakses materi pembelajaran.
- Menandai materi sebagai selesai.
- Melihat persentase progress.
- Mengikuti diskusi pada setiap materi.
- Melihat course yang diikuti melalui dashboard dan profil.

### Teacher
- Mendaftar sebagai Teacher Applicant dengan status Pending.
- Tetap menggunakan akses Student sampai disetujui Admin.
- Setelah disetujui, membuat, mengedit, dan menghapus course miliknya.
- Mengelola materi course dengan `course_id` dan `order_index`.
- Memantau jumlah peserta dan progress materi Student.

### Admin
- Mengelola pengguna.
- Menambah, mengedit, dan menghapus pengguna.
- Menyetujui permohonan Teacher.
- Mengelola kategori.
- Mengelola seluruh course dan memilih Teacher yang sudah disetujui.

## Struktur proyek

```text
learn_with_glenn/
├── database/
│   └── lwg_database.sql
├── public/
│   └── images/
│       └── logo-lwg.png
├── src/
│   ├── app/
│   │   ├── api/                 # Route Handlers
│   │   ├── dashboard/           # Dashboard Admin, Teacher, Student
│   │   ├── courses/             # Katalog dan detail course
│   │   ├── learn/               # Ruang pembelajaran Student
│   │   ├── login/
│   │   ├── register/
│   │   └── profile/
│   ├── components/              # Komponen UI bersama
│   ├── lib/                     # Database dan autentikasi
│   └── proxy.js
├── .env.example
├── package.json
└── README.md
```

## Persyaratan

- Node.js versi LTS yang kompatibel dengan Next.js 16.
- npm.
- PostgreSQL.
- pgAdmin (opsional, untuk menjalankan file SQL melalui Query Tool).

## Instalasi

1. Ekstrak ZIP proyek.
2. Buka folder proyek `learn_with_glenn` melalui terminal.
3. Instal dependensi:

   ```bash
   npm install
   ```

4. Buat database PostgreSQL bernama `learn_with_glenn`.
5. Jalankan seluruh isi `database/lwg_database.sql` satu kali melalui pgAdmin Query Tool atau `psql`.
6. Salin `.env.example` menjadi `.env.local`.
7. Sesuaikan nilai environment di `.env.local`.
8. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

9. Buka `http://localhost:3000`.

## Environment variables

Contoh isi `.env.local`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/learn_with_glenn
SESSION_SECRET=GANTI_DENGAN_SECRET_ACAK_MINIMAL_32_KARAKTER
```

Buat secret acak yang kuat. Contoh membuat secret melalui Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Jangan mengunggah `.env.local`, password database, atau secret ke GitHub. File `.env.example` aman untuk diunggah karena hanya berisi placeholder.

## Menjalankan pemeriksaan

```bash
npm run lint
npm run build
```

Untuk menjalankan hasil production build:

```bash
npm run start
```

## Database

Struktur database terdapat di `database/lwg_database.sql`. File tersebut membuat tabel:

- `users`
- `categories`
- `courses`
- `contents`
- `enrollments`
- `lesson_progress`
- `comments`

File SQL harus disimpan di luar folder `src/app` agar mudah ditemukan saat penilaian praktikum.

## Catatan akun dan pengujian

Akun Admin tidak dibuat otomatis oleh proses registrasi publik. Siapkan akun Admin melalui database atau mekanisme administrasi yang aman sebelum menguji fitur Admin. Jangan menyimpan password asli di README atau repositori.

Uji alur Teacher dengan mendaftar sebagai Teacher Applicant, lalu setujui permohonan tersebut melalui akun Admin. Setelah itu uji pembuatan course, pengelolaan materi, enrollment Student, progress, dan diskusi.

## Keamanan

- Password disimpan sebagai hash bcrypt, bukan teks biasa.
- Session menggunakan JWT pada cookie HTTP-only.
- Server membaca ulang role terbaru dari database pada halaman dan API yang dilindungi.
- Query PostgreSQL menggunakan parameter.
- Teacher hanya boleh mengelola course dan materi miliknya.
- Student hanya boleh mengakses ruang belajar course yang diikuti.
- Simpan `DATABASE_URL` dan `SESSION_SECRET` hanya di `.env.local`.
