# FEATURE TRACKER — Sistem Manajemen Bisnis Amat Sidojaya

> FILE INI MELACAK SEMUA FITUR YANG SUDAH DAN BELUM DIBUAT.
> UPDATE FILE INI SETIAP KALI MENYELESAIKAN ATAU MEMULAI SEBUAH FITUR.
>
> LEGEND:
> - ✅ = Sudah selesai dan berfungsi
> - 🔄 = Sedang dikerjakan
> - ⬜ = Belum dimulai
>
> BACA FILE `PROJECT_CONTEXT.md` DI FOLDER YANG SAMA UNTUK MEMAHAMI PROYEK INI.

---

## FASE 1: Foundation & Setup

### Project Setup
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Inisialisasi project (package.json, workspaces) | `package.json` | npm init, install dependencies |
| ✅ | Setup Vite + React (client) | `client/vite.config.js`, `client/src/main.jsx` | npx create-vite, konfigurasi proxy ke backend |
| ✅ | Setup Express server (server) | `server/index.js` | Express, cors, body-parser, serve static |
| ✅ | Setup SQLite + Drizzle ORM | `server/db/connection.js`, `server/db/schema.js` | better-sqlite3, drizzle-orm |
| ✅ | Database migration script | `server/db/migrate.js` | Buat semua tabel |
| ✅ | Database seed script | `server/db/seed.js` | Insert kategori default |
| ✅ | Drizzle config | `drizzle.config.js` | Config untuk generate migration |
| ✅ | README.md | `README.md` | Cara install & jalankan proyek |

### Design System & Layout
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Global CSS + Design System | `client/src/index.css` | CSS Variables, typography, reset, utilities |
| ✅ | Google Font "Inter" | `client/index.html` | Load via link tag |
| ✅ | AppLayout component | `client/src/components/layout/AppLayout.jsx` | Wrapper: sidebar + content area |
| ✅ | Sidebar component | `client/src/components/layout/Sidebar.jsx` | Menu navigasi dengan icon + link |
| ✅ | Header component | `client/src/components/layout/Header.jsx` | Judul halaman + breadcrumb |

### UI Components
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Button | `client/src/components/ui/Button.jsx` | Variants: primary, secondary, danger, ghost |
| ⬜ | Input | `client/src/components/ui/Input.jsx` | Label, placeholder, error, disabled |
| ⬜ | Select | `client/src/components/ui/Select.jsx` | Dropdown dengan options |
| ⬜ | SearchInput | `client/src/components/ui/SearchInput.jsx` | Input dengan icon search |
| ⬜ | Table | `client/src/components/ui/Table.jsx` | Tabel data dengan header & rows |
| ⬜ | Card | `client/src/components/ui/Card.jsx` | Container dengan title |
| ⬜ | Modal | `client/src/components/ui/Modal.jsx` | Dialog popup dengan overlay |
| ⬜ | Badge | `client/src/components/ui/Badge.jsx` | Label kecil: success, danger, warning |
| ⬜ | StatCard | `client/src/components/ui/StatCard.jsx` | Kartu statistik dashboard |
| ⬜ | Pagination | `client/src/components/ui/Pagination.jsx` | Navigasi halaman |
| ⬜ | LoadingSpinner | `client/src/components/ui/LoadingSpinner.jsx` | Indikator loading |
| ⬜ | EmptyState | `client/src/components/ui/EmptyState.jsx` | Tampilan data kosong |
| ⬜ | ConfirmDialog | `client/src/components/ui/ConfirmDialog.jsx` | Dialog konfirmasi hapus |

### Routing & Utilities
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | React Router setup | `client/src/App.jsx` | Semua routes + AppLayout wrapper |
| ✅ | API fetch wrapper | `client/src/lib/api.js` | GET, POST, PUT, DELETE helper functions |
| ✅ | Formatters | `client/src/lib/formatters.js` | Format Rupiah, tanggal, invoice number |
| ⬜ | Constants | `client/src/lib/constants.js` | VEHICLE_TYPES, UNITS, PAGE_SIZE, dll |

---

## FASE 2: Manajemen Produk & Kategori

### Backend — API Produk
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ⬜ | GET /api/products (list + search + filter + pagination) | `server/routes/products.js`, `server/services/productService.js` | Query params: search, category, vehicle_type, page, limit |
| ⬜ | GET /api/products/:id (detail) | `server/routes/products.js` | Return 1 produk + kategori |
| ⬜ | POST /api/products (tambah) | `server/routes/products.js` | Auto-generate kode barang |
| ⬜ | PUT /api/products/:id (edit) | `server/routes/products.js` | Update field yang berubah |
| ⬜ | DELETE /api/products/:id (hapus) | `server/routes/products.js` | Cek transaksi terkait sebelum hapus |

### Backend — API Kategori
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ⬜ | GET /api/categories | `server/routes/categories.js`, `server/services/categoryService.js` | List semua kategori |
| ⬜ | POST /api/categories | `server/routes/categories.js` | Tambah kategori |
| ⬜ | PUT /api/categories/:id | `server/routes/categories.js` | Edit kategori |
| ⬜ | DELETE /api/categories/:id | `server/routes/categories.js` | Cek produk terkait sebelum hapus |

### Frontend — Halaman Produk
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ⬜ | Halaman list produk | `client/src/pages/ProductsPage.jsx` | Tabel + search + filter kategori + filter tipe kendaraan |
| ⬜ | ProductTable component | `client/src/components/products/ProductTable.jsx` | Tabel dengan kolom: kode, nama, kategori, stok, harga beli, harga jual, aksi |
| ⬜ | StockBadge component | `client/src/components/products/StockBadge.jsx` | Badge warna: hijau (aman), kuning (rendah), merah (habis) |
| ⬜ | Halaman tambah produk | `client/src/pages/ProductFormPage.jsx` | Form: nama, kategori, tipe, merek, stok, harga, dll |
| ⬜ | Halaman edit produk | `client/src/pages/ProductFormPage.jsx` | Form yang sama, pre-filled data |
| ⬜ | ProductForm component | `client/src/components/products/ProductForm.jsx` | Form reusable (untuk tambah & edit) |
| ⬜ | Dialog hapus produk | Menggunakan ConfirmDialog | Konfirmasi sebelum hapus |
| ⬜ | useProducts hook | `client/src/hooks/useProducts.js` | Fetch, create, update, delete products |

### Frontend — Halaman Kategori
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ⬜ | Halaman manajemen kategori | `client/src/pages/CategoriesPage.jsx` | Tabel + modal tambah/edit |

---

## FASE 3: Transaksi Penjualan (POS / Kasir)

### Backend — API Penjualan
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | GET /api/transactions (riwayat penjualan) | `server/routes/transactions.js`, `server/services/transactionService.js` | Filter: from, to, page, limit |
| ✅ | GET /api/transactions/:id (detail) | `server/routes/transactions.js` | Return transaksi + items + info produk |
| ✅ | POST /api/transactions (buat penjualan) | `server/routes/transactions.js` | Generate invoice, hitung profit, update stok, catat stock_movements |

### Frontend — POS / Kasir
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Halaman kasir baru | `client/src/pages/NewSalePage.jsx` | Layout: kiri (search barang) + kanan (keranjang) |
| ✅ | POSForm component | `client/src/components/transactions/POSForm.jsx` | Terintegrasi di NewSalePage |
| ✅ | CartPanel component | `client/src/components/transactions/CartPanel.jsx` | Terintegrasi di NewSalePage |
| ✅ | InvoicePrint component | `client/src/components/transactions/InvoicePrint.jsx` | Template nota untuk dicetak |
| ✅ | Halaman riwayat penjualan | `client/src/pages/SalesPage.jsx` | Tabel riwayat + filter tanggal |
| ✅ | TransactionTable component | `client/src/components/transactions/TransactionTable.jsx` | Terintegrasi di SalesPage |
| ✅ | Detail transaksi (modal/page) | Klik row di tabel → lihat detail items | Tampilkan items + cetak ulang nota |
| ✅ | useTransactions hook | `client/src/hooks/useTransactions.js` | Fetch, create transactions |

---

## FASE 4: Pembelian Stok (Restok dari Supplier)

### Backend — API Pembelian
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | GET /api/purchases (riwayat pembelian) | `server/routes/purchases.js`, `server/services/purchaseService.js` | Filter: from, to |
| ✅ | POST /api/purchases (buat pembelian) | `server/routes/purchases.js` | Update stok masuk, update harga beli, catat stock_movements |

### Frontend — Halaman Pembelian
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Halaman pembelian baru | `client/src/pages/NewPurchasePage.jsx` | Form: pilih barang, jumlah, harga beli, supplier |
| ✅ | Halaman riwayat pembelian | `client/src/pages/PurchasesPage.jsx` | Tabel riwayat pembelian |

---

## FASE 5: Laporan Keuangan

### Backend — API Laporan
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | GET /api/reports/daily (laporan harian) | `server/routes/reports.js`, `server/services/reportService.js` | Param: date |
| ✅ | GET /api/reports/monthly (laporan bulanan) | `server/routes/reports.js` | Param: month |
| ✅ | GET /api/reports/profit (laba rugi) | `server/routes/reports.js` | Param: from, to |
| ✅ | GET /api/reports/top-products (produk terlaris) | `server/routes/reports.js` | Param: period, limit |

### Frontend — Halaman Laporan
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Halaman laporan utama | `client/src/pages/ReportsPage.jsx` | Tab/section: harian, bulanan, laba rugi, produk terlaris |
| ✅ | SalesChart component | `client/src/components/reports/SalesChart.jsx` | Terintegrasi di ReportsPage |
| ✅ | ProfitChart component | `client/src/components/reports/ProfitChart.jsx` | Terintegrasi di ReportsPage |
| ✅ | ReportTable component | `client/src/components/reports/ReportTable.jsx` | Terintegrasi di ReportsPage |
| ✅ | useReports hook | `client/src/hooks/useReports.js` | Fetch data laporan |
| ✅ | Cetak/export laporan | Di ReportsPage | window.print() dengan @media print CSS |

---

## FASE 6: Manajemen Stok & Dashboard

### Backend — API Stok
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | GET /api/stock (overview semua stok) | `server/routes/stock.js`, `server/services/stockService.js` | Semua produk + status stok |
| ✅ | GET /api/stock/low (barang stok rendah) | `server/routes/stock.js` | Produk dengan stok ≤ min_stock |
| ✅ | GET /api/stock/movements/:productId | `server/routes/stock.js` | Riwayat pergerakan stok 1 produk |
| ✅ | POST /api/stock/adjustment (stok opname) | `server/routes/stock.js` | Penyesuaian manual + catat stock_movements |

### Frontend — Halaman Stok
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Halaman stok overview | `client/src/pages/StockPage.jsx` | Tabel semua barang + status + filter stok rendah |
| ✅ | Riwayat pergerakan stok | Di StockPage (modal/expand) | Timeline masuk/keluar/adjustment |
| ✅ | Form stok opname | Di StockPage | Pilih produk → isi stok aktual → simpan |

### Frontend — Dashboard
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Halaman dashboard | `client/src/pages/DashboardPage.jsx` | 4 stat cards + grafik + top produk + alert stok |
| ✅ | DailyStats component | `client/src/components/dashboard/DailyStats.jsx` | Terintegrasi di DashboardPage |
| ✅ | TopProducts component | `client/src/components/dashboard/TopProducts.jsx` | Terintegrasi di DashboardPage |
| ✅ | LowStockAlert component | `client/src/components/dashboard/LowStockAlert.jsx` | Terintegrasi di DashboardPage |
| ✅ | Grafik tren penjualan 7 hari | Di DashboardPage | Chart.js line chart |
| ✅ | Grafik profit bulanan | Di DashboardPage | Chart.js bar chart |

### Polish & Final
| Status | Fitur | File Utama | Catatan |
|--------|-------|------------|---------|
| ✅ | Responsive design (tablet/mobile) | `client/src/index.css` | Media queries |
| ✅ | Micro-animations & transitions | `client/src/index.css` | Hover, focus, page transition |
| ✅ | Error handling UI | Semua halaman | Toast notification atau alert |
| ✅ | Loading states | Semua halaman | Skeleton atau spinner saat fetch data |
| ✅ | Empty states | Semua halaman | Pesan & ilustrasi saat data kosong |

---

## DEPENDENCY MAP

Urutan pengerjaan HARUS mengikuti dependency ini:

```
FASE 1 (Foundation) → WAJIB SELESAI DULU
    │
    ├──→ FASE 2 (Produk & Kategori) → WAJIB SELESAI DULU
    │        │
    │        ├──→ FASE 3 (Penjualan/POS) → butuh produk sudah ada
    │        │
    │        └──→ FASE 4 (Pembelian Stok) → butuh produk sudah ada
    │                │
    │                └──→ FASE 5 (Laporan) → butuh data transaksi penjualan & pembelian
    │
    └──→ FASE 6 (Dashboard & Stok) → butuh semua API sudah jadi
```

**JANGAN** kerjakan fase berikutnya sebelum fase sebelumnya selesai dan berfungsi.

---

## KNOWN ISSUES / BUGS

| No | Deskripsi | Status | Tanggal |
|----|-----------|--------|---------|
| - | Belum ada issue | - | - |

---

## CATATAN TEKNIS

| No | Catatan |
|----|---------|
| 1 | Semua harga dalam Rupiah INTEGER (contoh: 55000). Jangan float. |
| 2 | Invoice number di-generate di SERVER, bukan di client. |
| 3 | Setiap perubahan stok WAJIB dicatat di tabel stock_movements. |
| 4 | Harga di transaction_items adalah SNAPSHOT (harga saat transaksi terjadi). |
| 5 | Transaksi yang sudah disimpan TIDAK BOLEH dihapus. |
| 6 | Saat development, Vite proxy `/api/*` ke Express di port 3000. |
| 7 | File database: `data/amat-sidojaya.db` — ini yang harus di-backup. |
| 8 | Styling: WAJIB pakai CSS Variables, JANGAN hardcode warna. |
| 9 | Bahasa antarmuka: Bahasa Indonesia. |
| 10 | Timezone tampilan: WIB (UTC+7). Database simpan ISO string. |
