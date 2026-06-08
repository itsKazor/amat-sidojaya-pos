# Sistem Manajemen Bisnis Amat Sidojaya

Website sistem manajemen bisnis digital untuk toko sparepart motor dan mobil **Amat Sidojaya**. Sistem ini dirancang untuk mencatat transaksi penjualan, pembelian stok, melacak sisa persediaan barang, dan menyusun laporan keuangan harian, bulanan, serta laba rugi secara otomatis.

## Fitur Utama (Rencana Pengembangan)
- **Fase 1: Foundation & Setup** (Selesai) — Struktur project frontend & backend, basis data SQLite dengan Drizzle ORM, layout dashboard dark mode premium.
- **Fase 2: Manajemen Produk & Kategori** (Fase Berikutnya) — CRUD Sparepart dan kategori barang.
- **Fase 3: Transaksi Penjualan (POS)** — Sistem kasir digital dengan cetak struk/nota.
- **Fase 4: Pembelian Stok (Restok)** — Pencatatan pasokan barang dari supplier.
- **Fase 5: Laporan Keuangan** — Visualisasi omset, profit, laba rugi, dan produk terlaris.
- **Fase 6: Manajemen Stok & Dashboard** — Alert stok minimum, opname stok, dan dashboard analitis.

## Tech Stack
- **Frontend:** React (Vite) + Vanilla CSS (CSS Variables) + React Router v7 + Lucide Icons.
- **Backend:** Express.js.
- **Database:** SQLite (via `@libsql/client` & Drizzle ORM).

## Cara Menjalankan Proyek

### 1. Install Dependensi
Jalankan perintah berikut di root folder untuk menginstal semua modul frontend dan backend:
```bash
npm install
```

### 2. Jalankan Migrasi Database
Buat tabel database SQLite secara otomatis:
```bash
npm run db:migrate
```

### 3. Isi Data Awal (Seeding)
Masukkan data kategori awal bawaan sistem:
```bash
npm run db:seed
```

### 4. Jalankan Server Development
Jalankan frontend (Vite) dan backend (Express) secara bersamaan:
```bash
npm run dev
```
- Frontend berjalan di: `http://localhost:5173`
- Backend berjalan di: `http://localhost:3000`

### 5. Build & Jalankan untuk Production
```bash
# Build frontend
npm run build

# Jalankan server
npm start
```
Buka `http://localhost:3000` di web browser Anda.
