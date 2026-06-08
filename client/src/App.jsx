import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NewSalePage from './pages/NewSalePage.jsx';
import SalesPage from './pages/SalesPage.jsx';

// Placeholder views for remaining modules
const Dashboard = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">🏠 Dashboard</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Selamat datang di Sistem Manajemen Bisnis Amat Sidojaya. Silakan navigasikan menu untuk mengelola bisnis.
    </p>
  </div>
);

const Purchases = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">📥 Riwayat Pembelian</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Melihat riwayat transaksi pembelian stok barang dari supplier.
    </p>
  </div>
);

const NewPurchase = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">➕ Input Pembelian Baru</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Mencatat restok barang yang baru dibeli dari supplier.
    </p>
  </div>
);

const Reports = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">📈 Laporan Keuangan</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Laporan penjualan harian, bulanan, laba rugi, dan produk terlaris dengan grafik visual terintegrasi.
    </p>
  </div>
);

const Stock = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">🔄 Manajemen Stok & Opname</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Memantau kartu stok barang, pergerakan masuk-keluar barang, dan melakukan stok opname (penyesuaian fisik).
    </p>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="purchases/new" element={<NewPurchase />} />
        <Route path="reports" element={<Reports />} />
        <Route path="stock" element={<Stock />} />
        <Route path="*" element={
          <div className="card animate-fade-in">
            <h2 className="card-title">⚠️ Halaman Tidak Ditemukan</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Silakan pilih menu navigasi di sebelah kiri.
            </p>
          </div>
        } />
      </Route>
    </Routes>
  );
}
