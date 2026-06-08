import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/products')) return 'Manajemen Produk';
    if (path.startsWith('/categories')) return 'Manajemen Kategori';
    if (path === '/sales/new') return 'Kasir Baru (POS)';
    if (path.startsWith('/sales')) return 'Riwayat Penjualan';
    if (path === '/purchases/new') return 'Pembelian Baru (Restok)';
    if (path.startsWith('/purchases')) return 'Riwayat Pembelian';
    if (path.startsWith('/reports')) return 'Laporan Keuangan';
    if (path.startsWith('/stock')) return 'Manajemen & Opname Stok';
    return 'Amat Sidojaya';
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>{getPageTitle()}</h1>
      </div>
      <div className="header-meta">
        <div className="meta-item">
          <Calendar size={16} />
          <span>{formatDate(time)}</span>
        </div>
        <div className="meta-item">
          <Clock size={16} />
          <span>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</span>
        </div>
      </div>
    </header>
  );
}
