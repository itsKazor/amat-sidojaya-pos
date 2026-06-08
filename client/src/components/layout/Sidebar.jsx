import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  TrendingUp, 
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Produk', path: '/products', icon: Package },
    { name: 'Kategori', path: '/categories', icon: FolderTree },
    { name: 'Penjualan', path: '/sales', icon: ShoppingCart },
    { name: 'Kasir Baru', path: '/sales/new', icon: PlusCircle },
    { name: 'Pembelian', path: '/purchases', icon: FileSpreadsheet },
    { name: 'Pembelian Baru', path: '/purchases/new', icon: PlusCircle },
    { name: 'Laporan', path: '/reports', icon: TrendingUp },
    { name: 'Stok', path: '/stock', icon: RefreshCw },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Settings className="logo-icon" />
        <div className="logo-text">
          <h2>Amat Sidojaya</h2>
          <span>Business System</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={item.path === '/' || item.path.endsWith('/new')}
            >
              <Icon className="link-icon" size={20} />
              <span className="link-text">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 Amat Sidojaya</p>
      </div>
    </aside>
  );
}
