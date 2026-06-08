import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import NewSalePage from './pages/NewSalePage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import NewPurchasePage from './pages/NewPurchasePage.jsx';
import PurchasesPage from './pages/PurchasesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import StockPage from './pages/StockPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<NewPurchasePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="stock" element={<StockPage />} />
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
