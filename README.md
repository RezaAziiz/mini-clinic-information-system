# Mini Clinic Information System

Mini Clinic Information System adalah aplikasi berbasis web terintegrasi yang dirancang untuk mengelola proses administrasi dan pelayanan pasien di klinik pratama. Aplikasi ini mencakup fitur pengelolaan data pasien, pendaftaran kunjungan, antrean, pencatatan hasil pemeriksaan dokter (SOAP), hingga *dashboard* pemantauan operasional.

Sistem ini dikembangkan menggunakan **React.js** (Frontend) dan **Node.js/Express.js** (Backend) dengan database **PostgreSQL** yang dikelola melalui **Prisma ORM**.

---

## 🚀 Instalasi Aplikasi

Pastikan sistem Anda telah terinstal:
- **Node.js** (v18 atau lebih baru)
- **PostgreSQL**
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/RezaAziiz/mini-clinic-information-system.git
cd mini-clinic-information-system
```

### 2. Instalasi Backend
```bash
cd backend
npm install
```

### 3. Instalasi Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Konfigurasi Environment (`.env`)

Aplikasi ini memerlukan konfigurasi variabel lingkungan yang tidak disertakan di repositori (karena tidak boleh di-hardcode). Anda harus menyalin file `.env.example` menjadi `.env` baik di folder `backend` maupun `frontend`.

### Backend
1. Masuk ke folder `backend`.
2. Salin atau *rename* file `.env.example` menjadi `.env`.
3. Sesuaikan isi `.env` dengan kredensial PostgreSQL lokal Anda:

```env
# backend/.env
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/clinic_system"
PORT=3000
JWT_SECRET=rahasia_jwt_anda_yang_kuat
JWT_EXPIRES_IN=24h
```

### Frontend
1. Masuk ke folder `frontend`.
2. Salin atau *rename* file `.env.example` menjadi `.env`.
3. Sesuaikan isi `.env` (biasanya *default* sudah sesuai dengan backend):

```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗄️ Migrasi Database

Aplikasi ini menggunakan **Prisma ORM**. Untuk melakukan sinkronisasi tabel database dari skema Prisma ke PostgreSQL lokal Anda:

1. Pastikan PostgreSQL Anda sedang berjalan dan `DATABASE_URL` di dalam `backend/.env` sudah diisi dengan benar.
2. Buka terminal di dalam folder `backend` dan jalankan perintah sinkronisasi skema berikut:

```bash
cd backend
npx prisma db push
```
*(Catatan: Anda juga bisa menggunakan `npx prisma migrate dev` jika Anda ingin menyimpan file histori migrasi SQL secara permanen).*

### Seeding (Opsional)
Sistem ini dirancang untuk otomatis membuat akun Administrator jika tidak ada data satupun saat server dijalankan pertama kali.

---

## ▶️ Cara Menjalankan Aplikasi

Aplikasi berjalan pada dua server yang berbeda: Backend di *port* `3000` dan Frontend di *port* default Vite (seperti `5173` atau `5174`). Anda membutuhkan 2 terminal.

### 1. Menjalankan Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend akan aktif di: `http://localhost:3000`  
Dokumentasi API (Swagger) tersedia di: `http://localhost:3000/api-docs`

### 2. Menjalankan Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend akan aktif di URL lokal (misalnya `http://localhost:5173` atau `http://localhost:5174`). Buka link tersebut di *browser* Anda.

---

## 🔐 Akun Login

Jika Anda baru pertama kali menjalankan backend (dan database kosong), Anda dapat membuat akun secara *on-the-fly* lewat API (jika dizinkan), atau sistem akan mencetak di console bahwa akun **Admin Default** telah dibuat.

Anda dapat *login* menggunakan akun bawaan berikut (contoh jika telah dilakukan injeksi data lewat *seeder* atau pembuatan otomatis):

| Peran (Role) | Email | Password |
| --- | --- | --- |
| **Administrator** | `admin@klinik.com` | `password123` |
| **Petugas Pendaftaran** | `petugas@klinik.com` | `password123` |
| **Dokter 1** | `dr.sari@klinik.com` | `password123` |
| **Dokter 2** | `dr.budi@klinik.com` | `password123` |
| **Dokter 3** | `dr.rina@klinik.com` | `password123` |

*(Note: Password disimpan dengan proses enkripsi hash `bcrypt` di database demi keamanan).*

---

## 📂 Struktur Project

Repositori ini menggunakan arsitektur *monorepo* sederhana.

```text
mini-clinic-information-system/
├── backend/                  # REST API Node.js & Express.js
│   ├── prisma/               # Skema & Migrasi Database Prisma (schema.prisma)
│   ├── src/
│   │   ├── common/           # Middleware, Helpers, Konstanta
│   │   ├── config/           # Konfigurasi Database, Setup Swagger
│   │   └── modules/          # Domain Logic (Auth, Patients, Registrations, dll)
│   ├── .env.example          # Contoh variabel environment backend
│   └── package.json
│
├── frontend/                 # Aplikasi Web React.js & Vite
│   ├── src/
│   │   ├── components/       # Komponen UI Reusable
│   │   ├── contexts/         # React Context (Sistem State Auth)
│   │   ├── layouts/          # Template & Sidebar Navigation Layout
│   │   ├── pages/            # View Utama (Dashboard, Patients, Queue, dll)
│   │   └── services/         # Integrasi API Server (Axios Interceptors)
│   ├── .env.example          # Contoh variabel environment frontend
│   └── package.json
│
└── README.md                 # Anda sedang membaca file ini
```
