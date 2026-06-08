import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';

// Beautiful placeholder pages for Fase 1
const Dashboard = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">🏠 Dashboard</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Selamat datang di Sistem Manajemen Bisnis Amat Sidojaya. Silakan navigasikan menu untuk mengelola bisnis.
    </p>
  </div>
);

const Products = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">📦 Daftar Produk</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Modul manajemen produk sparepart. Fitur pencarian, filter, tambah, edit, dan hapus barang akan diaktifkan pada Fase 2.
    </p>
  </div>
);

const Categories = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">📁 Kategori Produk</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Modul manajemen kategori barang. Anda bisa membagi sparepart menjadi beberapa kategori (contoh: Ban, Oli, Aki).
    </p>
  </div>
);

const Sales = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">🛒 Riwayat Penjualan</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Melihat semua nota penjualan digital yang pernah diproses.
    </p>
  </div>
);

const NewSale = () => (
  <div className="card animate-fade-in">
    <h2 className="card-title">➕ Transaksi Kasir POS</h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Modul kasir / Point of Sale untuk mencatat transaksi penjualan barang.
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
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<NewSale />} />
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
