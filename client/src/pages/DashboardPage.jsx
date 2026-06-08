import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useReports from '../hooks/useReports.js';
import useStock from '../hooks/useStock.js';
import { formatRupiah } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import { Line, Bar } from 'react-chartjs-2';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowRight,
  ShieldAlert,
  Loader
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getDailyReport, getMonthlyReport, getTopProducts } = useReports();
  const { fetchLowStock } = useStock();

  // Loading states
  const [loading, setLoading] = useState(true);

  // Dashboard metrics states
  const [dailyMetrics, setDailyMetrics] = useState({ revenue: 0, profit: 0, transactionsCount: 0, itemsSold: 0 });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = new Date().toISOString().substring(0, 7);

    try {
      // 1. Fetch Today's Daily Report
      const dailyRes = await getDailyReport(todayStr);
      if (dailyRes.success) {
        setDailyMetrics({
          revenue: dailyRes.data.totalRevenue,
          profit: dailyRes.data.totalProfit,
          transactionsCount: dailyRes.data.totalTransactions,
          itemsSold: dailyRes.data.itemsSold
        });
      }

      // 2. Fetch Monthly sales trends
      const monthlyRes = await getMonthlyReport(monthStr);
      if (monthlyRes.success) {
        setMonthlyStats(monthlyRes.data.dailyStats || []);
      }

      // 3. Fetch Top selling products
      const topRes = await getTopProducts('month', 5);
      if (topRes.success) {
        setTopProducts(topRes.data);
      }

      // 4. Fetch Low stock items
      const stockRes = await fetchLowStock();
      if (stockRes.success) {
        setLowStockAlerts(stockRes.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 7-day sales line chart
  const renderWeeklyChart = () => {
    if (monthlyStats.length === 0) {
      return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Belum ada data penjualan bulan ini.</p>;
    }

    // Sort by date, take last 7 days
    const sorted = [...monthlyStats].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
    const labels = sorted.map(s => s.date.split('-')[2]); // day number
    const revenues = sorted.map(s => s.revenue);
    const profits = sorted.map(s => s.profit);

    const data = {
      labels,
      datasets: [
        {
          label: 'Omset (Rp)',
          data: revenues,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Laba Bersih (Rp)',
          data: profits,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          tension: 0.3,
          fill: true
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f1f5f9' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
      }
    };

    return (
      <div style={{ height: '260px' }}>
        <Line data={data} options={options} />
      </div>
    );
  };

  // Monthly profit bar chart
  const renderMonthlyChart = () => {
    if (monthlyStats.length === 0) {
      return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>Belum ada data laba kotor bulan ini.</p>;
    }

    const sorted = [...monthlyStats].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(s => s.date.split('-')[2]);
    const profits = sorted.map(s => s.profit);

    const data = {
      labels,
      datasets: [
        {
          label: 'Laba Kotor Harian (Rp)',
          data: profits,
          backgroundColor: '#22c55e',
          borderRadius: 4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f1f5f9' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
      }
    };

    return (
      <div style={{ height: '260px' }}>
        <Bar data={data} options={options} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <Loader className="animate-spin" size={40} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
        <p>Menyusun data ringkasan dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Overview statistik kinerja bisnis hari ini.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => navigate('/sales/new')} variant="primary">Kasir POS Baru</Button>
          <Button onClick={() => navigate('/purchases/new')} variant="secondary">Restok Barang</Button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="dashboard-stats-grid">
        <div className="card d-stat-c">
          <div className="d-stat-header">
            <span>Omset Hari Ini</span>
            <DollarSign className="d-icon" style={{ color: 'var(--success)' }} />
          </div>
          <h2>{formatRupiah(dailyMetrics.revenue)}</h2>
          <span className="d-stat-subtitle">Kotor hasil penjualan</span>
        </div>

        <div className="card d-stat-c">
          <div className="d-stat-header">
            <span>Profit Hari Ini</span>
            <ArrowUpRight className="d-icon" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <h2 style={{ color: 'var(--accent-secondary)' }}>{formatRupiah(dailyMetrics.profit)}</h2>
          <span className="d-stat-subtitle">Keuntungan bersih penjualan</span>
        </div>

        <div className="card d-stat-c">
          <div className="d-stat-header">
            <span>Transaksi Hari Ini</span>
            <ShoppingCart className="d-icon" style={{ color: 'var(--info)' }} />
          </div>
          <h2>{dailyMetrics.transactionsCount} Nota</h2>
          <span className="d-stat-subtitle">Transaksi penjualan kasir</span>
        </div>

        <div className="card d-stat-c">
          <div className="d-stat-header">
            <span>Items Terjual Hari Ini</span>
            <Package className="d-icon" style={{ color: 'var(--warning)' }} />
          </div>
          <h2>{dailyMetrics.itemsSold} unit</h2>
          <span className="d-stat-subtitle">Sparepart keluar</span>
        </div>
      </div>

      {/* Charts section */}
      <div className="dashboard-charts-grid">
        <div className="card">
          <h4 className="card-title"><TrendingUp size={16} /> Tren Penjualan 7 Hari Terakhir</h4>
          {renderWeeklyChart()}
        </div>

        <div className="card">
          <h4 className="card-title"><DollarSign size={16} /> Laba Kotor Bulanan Harian</h4>
          {renderMonthlyChart()}
        </div>
      </div>

      {/* Alerts & Top lists */}
      <div className="dashboard-lists-grid">
        {/* Low Stock alert list */}
        <div className="card">
          <h4 className="card-title" style={{ color: 'var(--danger)' }}><ShieldAlert size={18} /> Peringatan Stok Kritis ({lowStockAlerts.length})</h4>
          
          <div className="dashboard-list-items">
            {lowStockAlerts.length === 0 ? (
              <p style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-md)' }}>✓ Semua stok barang terpantau aman.</p>
            ) : (
              lowStockAlerts.slice(0, 5).map(p => (
                <div key={p.id} className="list-row-item" onClick={() => navigate('/stock')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>{p.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.code}</span>
                  </div>
                  <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {p.stock === 0 ? 'Habis' : `${p.stock} pcs`}
                  </span>
                </div>
              ))
            )}
            
            {lowStockAlerts.length > 5 && (
              <div 
                onClick={() => navigate('/stock')} 
                style={{ textAlign: 'center', padding: '10px', fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Lihat Semua {lowStockAlerts.length} Peringatan <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
              </div>
            )}
          </div>
        </div>

        {/* Top products list */}
        <div className="card">
          <h4 className="card-title" style={{ color: 'var(--accent-primary)' }}><TrendingUp size={18} /> Top 5 Sparepart Terlaris Bulan Ini</h4>
          
          <div className="dashboard-list-items">
            {topProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-md)' }}>Belum ada data transaksi bulan ini.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="list-row-item">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 'var(--font-size-sm)' }}>{p.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.code}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 'var(--font-size-sm)' }}>{p.totalQuantity} {p.unit}</div>
                    <span style={{ fontSize: '10px', color: 'var(--success)' }}>Profit: {formatRupiah(p.totalProfit)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
