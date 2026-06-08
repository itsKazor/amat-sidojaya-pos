# PROJECT CONTEXT — Sistem Manajemen Bisnis Amat Sidojaya

> FILE INI ADALAH PANDUAN UTAMA UNTUK AI MODEL.
> BACA FILE INI SEBELUM MENGERJAKAN APAPUN.
> CEK JUGA FILE `FEATURE_TRACKER.md` DI FOLDER YANG SAMA UNTUK MELIHAT FITUR MANA YANG SUDAH/BELUM DIBUAT.

---

## 1. TENTANG PROYEK INI

### Apa ini?
Website sistem manajemen bisnis untuk **toko sparepart motor dan mobil** bernama **"Amat Sidojaya"**.

### Masalah yang diselesaikan:
- Pemilik toko selama ini mencatat transaksi secara MANUAL di buku tulis.
- Stok barang tidak pernah dicatat dengan benar, hanya "kira-kira".
- Laporan keuangan tidak jelas, tidak tahu profit atau rugi.
- Sering terjadi kesalahan hitung dan kehilangan data.

### Tujuan sistem:
1. Mencatat semua transaksi penjualan dan pembelian stok secara digital.
2. Melacak stok barang secara realtime (otomatis berkurang saat jual, bertambah saat beli).
3. Menghasilkan laporan keuangan otomatis (harian, bulanan, laba rugi).
4. Memberikan alert ketika stok barang hampir habis.

### Siapa yang pakai?
- Pemilik toko (1 orang), dijalankan di laptop via browser Chrome.
- Tidak ada sistem login/autentikasi untuk sekarang (single user).

---

## 2. TECH STACK

| Komponen | Teknologi | Versi | Keterangan |
|----------|-----------|-------|------------|
| Frontend | Vite + React | React 19, Vite 6 | SPA (Single Page Application) |
| Backend | Express.js | Express 5 | REST API server |
| Database | SQLite | via better-sqlite3 | File database lokal (1 file .db) |
| ORM | Drizzle ORM | Latest | Untuk definisi schema & query database |
| Routing Frontend | React Router | v7 | Navigasi antar halaman |
| Styling | Vanilla CSS | - | CSS Variables untuk design system, TIDAK PAKAI Tailwind |
| Charts | Chart.js + react-chartjs-2 | Latest | Grafik untuk laporan |
| Icons | Lucide React | Latest | Icon set |
| Bahasa Kode | JavaScript | ES Modules | BUKAN TypeScript |

### PENTING — Aturan Tech Stack:
- **JANGAN** gunakan TypeScript. Semua file pakai `.js` atau `.jsx`.
- **JANGAN** gunakan Tailwind CSS. Styling pakai Vanilla CSS dengan CSS Variables.
- **JANGAN** gunakan database lain selain SQLite (jangan MySQL, PostgreSQL, MongoDB, dll).
- **JANGAN** tambah library baru tanpa alasan yang jelas.
- **GUNAKAN** ES Modules (`import`/`export`), bukan CommonJS (`require`).

---

## 3. CARA MENJALANKAN PROYEK

```bash
# 1. Install semua dependencies
npm install

# 2. Jalankan migrasi database (buat tabel-tabel di SQLite)
npm run db:migrate

# 3. Isi data awal (kategori sparepart default)
npm run db:seed

# 4. Jalankan development server (frontend + backend sekaligus)
npm run dev
```

### Saat development:
- Frontend (Vite) jalan di: `http://localhost:5173`
- Backend (Express) jalan di: `http://localhost:3000`
- Vite di-proxy ke Express untuk request `/api/*`

### Saat production:
```bash
# Build frontend
npm run build

# Jalankan server (Express serve static files + API)
npm start
```
- Buka `http://localhost:3000` di browser.

---

## 4. STRUKTUR FOLDER

```
root/
│
├── .ai-instructions/              ← FOLDER INI (instruksi untuk AI)
│   ├── PROJECT_CONTEXT.md         ← File ini
│   └── FEATURE_TRACKER.md         ← Tracking fitur selesai/belum
│
├── client/                        ← FRONTEND (Vite + React)
│   ├── index.html                 ← Entry point HTML
│   ├── vite.config.js             ← Config Vite (proxy ke backend)
│   └── src/
│       ├── main.jsx               ← Entry React (render App)
│       ├── App.jsx                ← Root component + semua routes
│       ├── index.css              ← DESIGN SYSTEM + global styles
│       │
│       ├── components/            ← Komponen React reusable
│       │   ├── layout/            ← Layout: Sidebar, Header, AppLayout
│       │   ├── ui/                ← UI dasar: Button, Input, Table, Card, Modal, dll
│       │   ├── products/          ← Komponen khusus halaman produk
│       │   ├── transactions/      ← Komponen khusus halaman transaksi
│       │   ├── reports/           ← Komponen khusus halaman laporan
│       │   └── dashboard/         ← Komponen khusus dashboard
│       │
│       ├── pages/                 ← Halaman-halaman utama
│       │   ├── DashboardPage.jsx
│       │   ├── ProductsPage.jsx
│       │   ├── ProductFormPage.jsx
│       │   ├── CategoriesPage.jsx
│       │   ├── SalesPage.jsx
│       │   ├── NewSalePage.jsx        ← Halaman POS / Kasir
│       │   ├── PurchasesPage.jsx
│       │   ├── NewPurchasePage.jsx
│       │   ├── ReportsPage.jsx
│       │   └── StockPage.jsx
│       │
│       ├── hooks/                 ← Custom React hooks (useProducts, dll)
│       │
│       └── lib/                   ← Utility functions
│           ├── api.js             ← Fetch wrapper untuk panggil API backend
│           ├── formatters.js      ← Format Rupiah, tanggal, dll
│           └── constants.js       ← Konstanta (enum, config)
│
├── server/                        ← BACKEND (Express + SQLite)
│   ├── index.js                   ← Entry point Express server
│   │
│   ├── db/
│   │   ├── connection.js          ← Buka koneksi ke SQLite
│   │   ├── schema.js              ← Drizzle ORM schema (definisi tabel)
│   │   ├── migrate.js             ← Script migrasi (buat tabel)
│   │   └── seed.js                ← Script seed data awal
│   │
│   ├── routes/                    ← Express route handlers
│   │   ├── products.js            ← /api/products
│   │   ├── categories.js          ← /api/categories
│   │   ├── transactions.js        ← /api/transactions (penjualan)
│   │   ├── purchases.js           ← /api/purchases (pembelian stok)
│   │   ├── reports.js             ← /api/reports
│   │   └── stock.js               ← /api/stock
│   │
│   └── services/                  ← Business logic (dipanggil oleh routes)
│       ├── productService.js
│       ├── transactionService.js
│       ├── purchaseService.js
│       ├── reportService.js
│       └── stockService.js
│
├── data/                          ← Folder database SQLite
│   └── amat-sidojaya.db           ← File database (auto-created saat migrate)
│
├── drizzle/                       ← Drizzle migration files (auto-generated)
│
├── package.json                   ← Dependencies + scripts
├── drizzle.config.js              ← Config Drizzle ORM
└── README.md                      ← Panduan menjalankan proyek
```

---

## 5. DATABASE SCHEMA

Database menggunakan SQLite. Ada 5 tabel utama.

### Tabel: `categories`
Menyimpan kategori sparepart.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INTEGER PRIMARY KEY | Auto increment |
| name | TEXT NOT NULL | Nama kategori (contoh: "Oli", "Ban") |
| description | TEXT | Deskripsi opsional |
| created_at | TEXT | Timestamp ISO (default: now) |

### Tabel: `products`
Menyimpan data barang/sparepart.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INTEGER PRIMARY KEY | Auto increment |
| code | TEXT NOT NULL UNIQUE | Kode barang unik, auto-generate (contoh: "SPR-OLI-001") |
| name | TEXT NOT NULL | Nama barang (contoh: "Oli Yamalube 1L") |
| category_id | INTEGER | FK ke categories.id |
| vehicle_type | TEXT | "motor" / "mobil" / "universal" |
| brand | TEXT | Merek kendaraan terkait (contoh: "Yamaha", "Honda") |
| stock | INTEGER DEFAULT 0 | Jumlah stok saat ini |
| min_stock | INTEGER DEFAULT 5 | Batas minimum stok (untuk alert) |
| purchase_price | INTEGER DEFAULT 0 | Harga beli dari supplier (dalam Rupiah, tanpa desimal) |
| selling_price | INTEGER DEFAULT 0 | Harga jual ke pelanggan (dalam Rupiah) |
| unit | TEXT DEFAULT 'pcs' | Satuan: "pcs", "set", "liter", "meter", "box" |
| location | TEXT | Lokasi rak di toko (contoh: "Rak A3") |
| created_at | TEXT | Timestamp ISO |
| updated_at | TEXT | Timestamp ISO |

### Tabel: `transactions`
Header transaksi (penjualan ATAU pembelian stok).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INTEGER PRIMARY KEY | Auto increment |
| invoice_number | TEXT NOT NULL UNIQUE | Nomor nota unik (contoh: "INV-20260608-001") |
| type | TEXT NOT NULL | "sale" (penjualan) atau "purchase" (pembelian stok) |
| transaction_date | TEXT NOT NULL | Tanggal transaksi (ISO format) |
| total_amount | INTEGER DEFAULT 0 | Total harga transaksi (Rupiah) |
| total_profit | INTEGER DEFAULT 0 | Total keuntungan (hanya untuk sale) |
| customer_name | TEXT | Nama pelanggan (opsional, untuk sale) |
| supplier_name | TEXT | Nama supplier (opsional, untuk purchase) |
| notes | TEXT | Catatan tambahan |
| created_at | TEXT | Timestamp ISO |

### Tabel: `transaction_items`
Detail item dalam setiap transaksi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INTEGER PRIMARY KEY | Auto increment |
| transaction_id | INTEGER NOT NULL | FK ke transactions.id |
| product_id | INTEGER NOT NULL | FK ke products.id |
| quantity | INTEGER NOT NULL | Jumlah barang |
| unit_price | INTEGER NOT NULL | Harga satuan SAAT transaksi (Rupiah) |
| purchase_price_snapshot | INTEGER DEFAULT 0 | Harga beli SAAT transaksi (untuk hitung profit) |
| subtotal | INTEGER NOT NULL | quantity × unit_price |
| profit | INTEGER DEFAULT 0 | Keuntungan: (unit_price - purchase_price_snapshot) × quantity |

**PENTING**: `unit_price` dan `purchase_price_snapshot` menyimpan harga SAAT transaksi terjadi, BUKAN harga saat ini di tabel products. Ini karena harga bisa berubah seiring waktu.

### Tabel: `stock_movements`
Riwayat semua pergerakan stok (masuk, keluar, penyesuaian).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INTEGER PRIMARY KEY | Auto increment |
| product_id | INTEGER NOT NULL | FK ke products.id |
| transaction_id | INTEGER | FK ke transactions.id (nullable, untuk adjustment) |
| type | TEXT NOT NULL | "in" (masuk), "out" (keluar), "adjustment" (opname) |
| quantity | INTEGER NOT NULL | Jumlah pergerakan (positif = masuk, negatif = keluar) |
| stock_before | INTEGER NOT NULL | Stok sebelum pergerakan |
| stock_after | INTEGER NOT NULL | Stok setelah pergerakan |
| notes | TEXT | Keterangan (contoh: "Penjualan INV-20260608-001") |
| created_at | TEXT | Timestamp ISO |

### Relasi Antar Tabel:
```
categories (1) ──→ (many) products
products (1) ──→ (many) transaction_items
transactions (1) ──→ (many) transaction_items
products (1) ──→ (many) stock_movements
transactions (1) ──→ (many) stock_movements
```

---

## 6. API ENDPOINTS

Semua API menggunakan prefix `/api/`. Format request/response: JSON.

### 6.1 Products — `/api/products`

| Method | URL | Body | Fungsi |
|--------|-----|------|--------|
| GET | `/api/products` | - | Ambil semua produk. Query params: `?search=`, `?category=`, `?vehicle_type=`, `?page=`, `?limit=` |
| GET | `/api/products/:id` | - | Ambil 1 produk berdasarkan id |
| POST | `/api/products` | `{ name, category_id, vehicle_type, brand, stock, min_stock, purchase_price, selling_price, unit, location }` | Tambah produk baru. `code` di-generate otomatis oleh server. |
| PUT | `/api/products/:id` | `{ name, category_id, ... }` | Update produk |
| DELETE | `/api/products/:id` | - | Hapus produk (soft delete atau cek apakah ada transaksi terkait) |

### 6.2 Categories — `/api/categories`

| Method | URL | Body | Fungsi |
|--------|-----|------|--------|
| GET | `/api/categories` | - | Ambil semua kategori |
| POST | `/api/categories` | `{ name, description }` | Tambah kategori baru |
| PUT | `/api/categories/:id` | `{ name, description }` | Update kategori |
| DELETE | `/api/categories/:id` | - | Hapus kategori (cek apakah ada produk terkait) |

### 6.3 Transactions (Penjualan) — `/api/transactions`

| Method | URL | Body | Fungsi |
|--------|-----|------|--------|
| GET | `/api/transactions` | - | Riwayat penjualan. Query: `?from=`, `?to=`, `?page=`, `?limit=` |
| GET | `/api/transactions/:id` | - | Detail 1 transaksi + items |
| POST | `/api/transactions` | Lihat contoh di bawah | Buat penjualan baru |

**Contoh body POST `/api/transactions`:**
```json
{
  "customer_name": "Pak Budi",
  "notes": "",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 55000 },
    { "product_id": 5, "quantity": 1, "unit_price": 40000 }
  ]
}
```

**Yang terjadi saat POST (di server):**
1. Generate `invoice_number` otomatis (format: INV-YYYYMMDD-XXX).
2. Untuk setiap item: ambil `purchase_price` dari tabel products → simpan sebagai `purchase_price_snapshot`.
3. Hitung `subtotal` = quantity × unit_price.
4. Hitung `profit` = (unit_price - purchase_price_snapshot) × quantity.
5. Hitung `total_amount` = sum semua subtotal.
6. Hitung `total_profit` = sum semua profit.
7. Insert ke tabel `transactions` dan `transaction_items`.
8. Update stok di tabel `products`: stok = stok - quantity.
9. Insert ke tabel `stock_movements` (type: "out").
10. **VALIDASI**: Jika stok produk < quantity yang diminta, TOLAK transaksi.

### 6.4 Purchases (Pembelian Stok) — `/api/purchases`

| Method | URL | Body | Fungsi |
|--------|-----|------|--------|
| GET | `/api/purchases` | - | Riwayat pembelian stok |
| POST | `/api/purchases` | Lihat contoh di bawah | Buat pembelian baru |

**Contoh body POST `/api/purchases`:**
```json
{
  "supplier_name": "Toko Abadi Motor",
  "notes": "Restok bulanan",
  "items": [
    { "product_id": 1, "quantity": 50, "unit_price": 45000 },
    { "product_id": 5, "quantity": 100, "unit_price": 25000 }
  ]
}
```

**Yang terjadi saat POST (di server):**
1. Generate `invoice_number` otomatis (format: PUR-YYYYMMDD-XXX).
2. Insert ke tabel `transactions` (type: "purchase") dan `transaction_items`.
3. Update stok di tabel `products`: stok = stok + quantity.
4. Update `purchase_price` di tabel `products` dengan harga beli terbaru (`unit_price`).
5. Insert ke tabel `stock_movements` (type: "in").

### 6.5 Reports — `/api/reports`

| Method | URL | Query Params | Fungsi |
|--------|-----|-------------|--------|
| GET | `/api/reports/daily` | `?date=2026-06-08` | Laporan penjualan 1 hari |
| GET | `/api/reports/monthly` | `?month=2026-06` | Laporan penjualan 1 bulan |
| GET | `/api/reports/profit` | `?from=2026-01-01&to=2026-06-30` | Laporan laba rugi (range tanggal) |
| GET | `/api/reports/top-products` | `?period=month&limit=10` | Produk terlaris |

**Format response laporan harian:**
```json
{
  "date": "2026-06-08",
  "total_transactions": 15,
  "total_revenue": 2500000,
  "total_cost": 1800000,
  "total_profit": 700000,
  "items_sold": 42,
  "transactions": [ ... ]
}
```

### 6.6 Stock — `/api/stock`

| Method | URL | Body/Query | Fungsi |
|--------|-----|-----------|--------|
| GET | `/api/stock` | `?status=low` (opsional) | Overview stok semua barang |
| GET | `/api/stock/movements/:productId` | - | Riwayat pergerakan stok 1 produk |
| POST | `/api/stock/adjustment` | `{ product_id, new_stock, notes }` | Stok opname (penyesuaian manual) |
| GET | `/api/stock/low` | - | Daftar barang yang stok ≤ min_stock |

---

## 7. DESIGN SYSTEM (CSS)

File: `client/src/index.css`

### CSS Variables yang HARUS dipakai:

```css
:root {
  /* Background Colors */
  --bg-primary: #0a0f1c;       /* Background utama (paling gelap) */
  --bg-secondary: #111827;     /* Background sidebar, card */
  --bg-tertiary: #1f2937;      /* Background input, hover, tabel row */
  --bg-hover: #374151;         /* Background saat hover */

  /* Accent Colors */
  --accent-primary: #06b6d4;   /* Warna utama: cyan (tombol utama, link) */
  --accent-secondary: #8b5cf6; /* Warna sekunder: ungu (badge, highlight) */
  --accent-primary-hover: #0891b2;
  --accent-secondary-hover: #7c3aed;

  /* Text Colors */
  --text-primary: #f1f5f9;     /* Teks utama (putih terang) */
  --text-secondary: #94a3b8;   /* Teks sekunder (abu-abu) */
  --text-muted: #64748b;       /* Teks tersier (abu gelap) */

  /* Status Colors */
  --success: #22c55e;          /* Hijau: profit, stok aman, berhasil */
  --danger: #ef4444;           /* Merah: rugi, stok habis, error */
  --warning: #f59e0b;          /* Kuning: stok hampir habis, perhatian */
  --info: #3b82f6;             /* Biru: informasi */

  /* Border & Shadow */
  --border-color: #1e293b;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Aturan Styling:
- Semua warna HARUS menggunakan CSS Variable, JANGAN hardcode warna langsung.
- Font utama: Google Fonts "Inter". Load via `<link>` di `index.html`.
- Theme: DARK MODE only (tidak perlu light mode).
- Semua komponen harus punya transisi halus (hover, focus).
- Border radius: gunakan `--border-radius` (8px) atau `--border-radius-lg` (12px).

---

## 8. KONVENSI KODE

### Penamaan File:
- Komponen React: **PascalCase** → `ProductTable.jsx`, `SalesChart.jsx`
- Halaman: **PascalCase + Page** → `DashboardPage.jsx`, `ProductsPage.jsx`
- Hooks: **camelCase + use** → `useProducts.js`, `useReports.js`
- Backend routes: **camelCase** → `products.js`, `transactions.js`
- Backend services: **camelCase + Service** → `productService.js`
- CSS: Satu file global `index.css` + CSS classes per komponen

### Penamaan Variabel & Fungsi:
- Variabel & fungsi: **camelCase** → `totalAmount`, `getProductById`
- Komponen React: **PascalCase** → `ProductTable`, `StatCard`
- Konstanta: **UPPER_SNAKE_CASE** → `DEFAULT_PAGE_SIZE`, `VEHICLE_TYPES`
- API route path: **kebab-case** → `/api/top-products`, `/api/stock/low`

### Penamaan CSS Class:
- Gunakan format **komponen-element-modifier** → `.card`, `.card-header`, `.card-header-title`
- Atau format **page-section** → `.dashboard-stats`, `.product-table`

### Format Angka:
- Semua harga dalam **Rupiah (integer)**, tanpa desimal. Contoh: 55000 (bukan 55000.00).
- Tampilkan dengan format: `Rp 55.000` (pakai titik sebagai separator ribuan).
- Fungsi format ada di `client/src/lib/formatters.js`.

### Format Tanggal:
- Di database: simpan sebagai ISO string → `"2026-06-08T10:30:00.000Z"`
- Di tampilan: format Indonesia → `"08 Juni 2026"` atau `"08/06/2026"`
- Fungsi format ada di `client/src/lib/formatters.js`.

### Format Invoice Number:
- Penjualan: `INV-YYYYMMDD-XXX` → contoh: `INV-20260608-001`
- Pembelian: `PUR-YYYYMMDD-XXX` → contoh: `PUR-20260608-001`
- XXX = nomor urut hari itu, reset setiap hari mulai dari 001.

---

## 9. ALUR KERJA FITUR UTAMA

### 9.1 Alur Tambah Produk Baru
```
User klik "Tambah Produk" di halaman Produk
→ Buka form (ProductFormPage.jsx)
→ Isi: nama, kategori, tipe kendaraan, merek, stok awal, min stok, harga beli, harga jual, satuan, lokasi rak
→ Klik "Simpan"
→ Frontend POST ke /api/products
→ Backend generate kode barang otomatis
→ Backend insert ke tabel products
→ Jika stok awal > 0, insert ke stock_movements (type: "in", notes: "Stok awal")
→ Response: produk baru
→ Frontend redirect ke halaman list produk
```

### 9.2 Alur Transaksi Penjualan (POS)
```
User buka halaman "Penjualan Baru" (NewSalePage.jsx)
→ Ketik nama barang di kolom pencarian
→ Muncul daftar barang yang cocok (dari API GET /api/products?search=...)
→ Klik barang → masuk ke keranjang
→ Atur jumlah di keranjang
→ Sistem hitung otomatis: subtotal = harga jual × jumlah, profit = (jual - beli) × jumlah
→ Isi nama pelanggan (opsional)
→ Klik "Proses Transaksi"
→ Frontend POST ke /api/transactions dengan items
→ Backend validasi stok cukup
→ Backend simpan transaksi + items
→ Backend kurangi stok produk
→ Backend catat stock_movements (type: "out")
→ Response: transaksi berhasil + data untuk cetak nota
→ Frontend tampilkan nota (InvoicePrint) → bisa cetak/print
```

### 9.3 Alur Pembelian Stok (Restok)
```
User buka halaman "Pembelian Baru" (NewPurchasePage.jsx)
→ Pilih barang-barang yang dibeli dari supplier
→ Isi jumlah dan harga beli per item
→ Isi nama supplier (opsional)
→ Klik "Simpan Pembelian"
→ Frontend POST ke /api/purchases
→ Backend simpan transaksi (type: "purchase") + items
→ Backend tambah stok produk
→ Backend update purchase_price di products jika harga beli berubah
→ Backend catat stock_movements (type: "in")
→ Response: pembelian berhasil
```

### 9.4 Alur Lihat Laporan
```
User buka halaman "Laporan" (ReportsPage.jsx)
→ Pilih jenis laporan: Harian / Bulanan / Laba Rugi / Produk Terlaris
→ Pilih tanggal/periode
→ Frontend GET ke /api/reports/... dengan query params
→ Backend query database, hitung aggregasi (SUM, COUNT, GROUP BY)
→ Response: data laporan
→ Frontend render: tabel ringkasan + grafik Chart.js
→ User bisa cetak laporan (window.print dengan @media print CSS)
```

### 9.5 Alur Stok Opname
```
User buka halaman "Stok" → tab "Stok Opname"
→ Pilih produk yang mau disesuaikan
→ Sistem tampilkan stok saat ini di sistem
→ User isi stok aktual (hasil hitung fisik)
→ Isi catatan (contoh: "Hasil stock take 08 Juni 2026")
→ Klik "Simpan Penyesuaian"
→ Frontend POST ke /api/stock/adjustment
→ Backend hitung selisih: new_stock - current_stock
→ Backend update stok di products
→ Backend catat stock_movements (type: "adjustment")
→ Response: berhasil
```

---

## 10. KOMPONEN UI YANG PERLU DIBUAT

### Layout Components (di `components/layout/`):
| Komponen | File | Fungsi |
|----------|------|--------|
| AppLayout | AppLayout.jsx | Wrapper: sidebar kiri + konten kanan |
| Sidebar | Sidebar.jsx | Menu navigasi kiri (link ke semua halaman) |
| Header | Header.jsx | Bar atas: judul halaman + breadcrumb |

### UI Components (di `components/ui/`):
| Komponen | File | Fungsi |
|----------|------|--------|
| Button | Button.jsx | Tombol (variant: primary, secondary, danger, ghost) |
| Input | Input.jsx | Input text (label, placeholder, error message) |
| Select | Select.jsx | Dropdown select |
| SearchInput | SearchInput.jsx | Input dengan icon search |
| Table | Table.jsx | Tabel data (header, rows, empty state) |
| Card | Card.jsx | Kartu container (title, children) |
| Modal | Modal.jsx | Dialog popup (overlay + konten) |
| Badge | Badge.jsx | Label kecil (variant: success, danger, warning, info) |
| StatCard | StatCard.jsx | Kartu statistik dashboard (icon, label, value, trend) |
| Pagination | Pagination.jsx | Navigasi halaman tabel |
| LoadingSpinner | LoadingSpinner.jsx | Indikator loading |
| EmptyState | EmptyState.jsx | Tampilan saat data kosong |
| ConfirmDialog | ConfirmDialog.jsx | Dialog konfirmasi hapus |

### Menu Sidebar:
```
🏠 Dashboard          → /
📦 Produk             → /products
   └─ Kategori        → /categories
🛒 Penjualan          → /sales
   └─ Kasir Baru      → /sales/new
📥 Pembelian          → /purchases
   └─ Pembelian Baru  → /purchases/new
📈 Laporan            → /reports
🔄 Stok               → /stock
```

---

## 11. PACKAGE.JSON SCRIPTS

```json
{
  "name": "amat-sidojaya",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npx vite",
    "dev:server": "node --watch server/index.js",
    "build": "cd client && npx vite build",
    "start": "NODE_ENV=production node server/index.js",
    "db:migrate": "node server/db/migrate.js",
    "db:seed": "node server/db/seed.js"
  }
}
```

---

## 12. CATATAN PENTING

1. **Semua harga dalam Rupiah (integer)**. Jangan pakai float/desimal. Contoh: 55000, bukan 55000.00 atau 550.00.
2. **Stok adalah integer**. Tidak ada stok desimal (0.5 pcs tidak ada).
3. **Invoice number harus unik**. Generate di server, bukan di client.
4. **Validasi stok sebelum jual**. Jangan izinkan penjualan jika stok tidak cukup.
5. **Harga snapshot di transaction_items**. SELALU simpan harga saat transaksi, jangan referensi ke tabel products.
6. **Stock movements harus selalu dicatat**. Setiap perubahan stok HARUS ada record di stock_movements.
7. **Jangan hapus data transaksi**. Transaksi yang sudah disimpan tidak boleh dihapus (integritas data keuangan).
8. **Backup database**: File `data/amat-sidojaya.db` adalah SATU-SATUNYA file yang perlu di-backup.
9. **Timezone**: Gunakan timezone lokal Indonesia (WIB, UTC+7) untuk tampilan. Di database simpan sebagai ISO string.
10. **Error handling**: Semua API harus return format konsisten: `{ success: true, data: ... }` atau `{ success: false, error: "pesan error" }`.
