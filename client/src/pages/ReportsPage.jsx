import React, { useState, useEffect } from 'react';
import useReports from '../hooks/useReports.js';
import { formatRupiah, formatDate } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import { Printer, TrendingUp, DollarSign, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './ReportsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const { loading, getDailyReport, getMonthlyReport, getProfitReport, getTopProducts } = useReports();
  const [activeTab, setActiveTab] = useState('daily');

  // Input states
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().substring(0, 7));
  const [profitFrom, setProfitFrom] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // First day of month
  const [profitTo, setProfitTo] = useState(new Date().toISOString().split('T')[0]);

  // Data states
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [topProductsData, setTopProductsData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Load daily report
  const loadDaily = async (dateVal) => {
    setErrorMsg('');
    const res = await getDailyReport(dateVal);
    if (res.success) {
      setDailyData(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal memuat laporan harian.');
    }
  };

  // Load monthly report
  const loadMonthly = async (monthVal) => {
    setErrorMsg('');
    const res = await getMonthlyReport(monthVal);
    if (res.success) {
      setMonthlyData(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal memuat laporan bulanan.');
    }
  };

  // Load profit report
  const loadProfit = async (fromVal, toVal) => {
    setErrorMsg('');
    const res = await getProfitReport(fromVal, toVal);
    if (res.success) {
      setProfitData(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal memuat laporan laba rugi.');
    }
  };

  // Load top products
  const loadTopProducts = async () => {
    setErrorMsg('');
    const res = await getTopProducts('month', 10);
    if (res.success) {
      setTopProductsData(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal memuat produk terlaris.');
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'daily') {
      loadDaily(dailyDate);
    } else if (activeTab === 'monthly') {
      loadMonthly(monthlyMonth);
    } else if (activeTab === 'profit') {
      loadProfit(profitFrom, profitTo);
    } else if (activeTab === 'top') {
      loadTopProducts();
    }
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  // Setup monthly chart options & data
  const renderMonthlyChart = () => {
    if (!monthlyData || !monthlyData.dailyStats || monthlyData.dailyStats.length === 0) {
      return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>Tidak ada data grafik bulanan.</p>;
    }

    const sortedStats = [...monthlyData.dailyStats].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sortedStats.map(s => s.date.split('-')[2]); // just day numbers
    const revenues = sortedStats.map(s => s.revenue);
    const profits = sortedStats.map(s => s.profit);

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Omset Penjualan (Rp)',
          data: revenues,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          tension: 0.2,
          fill: true
        },
        {
          label: 'Laba Bersih (Rp)',
          data: profits,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.2,
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
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    );
  };

  // Setup top products chart
  const renderTopProductsChart = () => {
    if (topProductsData.length === 0) {
      return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>Tidak ada data grafik produk terlaris.</p>;
    }

    const labels = topProductsData.map(p => p.name);
    const quantities = topProductsData.map(p => p.totalQuantity);

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Jumlah Terjual (Unit)',
          data: quantities,
          backgroundColor: 'rgba(6, 182, 212, 0.7)',
          borderWidth: 1
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { labels: { color: '#f1f5f9' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
      }
    };

    return (
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="reports-page animate-fade-in">
      <div className="reports-header-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div className="tab-menu" style={{ display: 'flex', gap: '8px' }}>
          <button className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Harian</button>
          <button className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Bulanan</button>
          <button className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`} onClick={() => setActiveTab('profit')}>Laba Rugi</button>
          <button className={`tab-btn ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>Produk Terlaris</button>
        </div>
        <Button onClick={handlePrint} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={16} /> Cetak Laporan
        </Button>
      </div>

      {errorMsg && (
        <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* -------------------- TAB: DAILY -------------------- */}
      {activeTab === 'daily' && dailyData && (
        <div className="report-content">
          <div className="filter-card card no-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
              <input 
                type="date" 
                value={dailyDate} 
                onChange={(e) => {
                  setDailyDate(e.target.value);
                  loadDaily(e.target.value);
                }}
                className="modal-input" 
                style={{ width: '180px' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Melihat rincian omset penjualan pada hari terpilih.</span>
            </div>
          </div>

          <div className="report-title-print">
            <h2>Laporan Penjualan Harian</h2>
            <p>Tanggal: {formatDate(dailyDate)}</p>
          </div>

          <div className="reports-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: 'var(--spacing-lg)' }}>
            <div className="card stat-c-1">
              <span>Total Transaksi</span>
              <h3>{dailyData.totalTransactions} Nota</h3>
            </div>
            <div className="card stat-c-2">
              <span>Items Terjual</span>
              <h3>{dailyData.itemsSold} unit</h3>
            </div>
            <div className="card stat-c-3">
              <span>Omset Penjualan</span>
              <h3 style={{ color: 'var(--success)' }}>{formatRupiah(dailyData.totalRevenue)}</h3>
            </div>
            <div className="card stat-c-4">
              <span>Keuntungan Bersih</span>
              <h3 style={{ color: 'var(--accent-secondary)' }}>{formatRupiah(dailyData.totalProfit)}</h3>
            </div>
          </div>

          <div className="card">
            <h4 className="card-title">Daftar Transaksi</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Jam</th>
                    <th>Pelanggan</th>
                    <th>Omset</th>
                    <th>Laba Bersih</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlignment: 'center', color: 'var(--text-secondary)' }}>Tidak ada transaksi hari ini.</td>
                    </tr>
                  ) : (
                    dailyData.transactions.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{t.invoiceNumber}</td>
                        <td>{new Date(t.transactionDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{t.customerName || 'Pelanggan Umum'}</td>
                        <td style={{ fontWeight: '600' }}>{formatRupiah(t.totalAmount)}</td>
                        <td style={{ color: 'var(--success)' }}>{formatRupiah(t.totalProfit)}</td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{t.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: MONTHLY -------------------- */}
      {activeTab === 'monthly' && monthlyData && (
        <div className="report-content">
          <div className="filter-card card no-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
              <input 
                type="month" 
                value={monthlyMonth} 
                onChange={(e) => {
                  setMonthlyMonth(e.target.value);
                  loadMonthly(e.target.value);
                }}
                className="modal-input" 
                style={{ width: '180px' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Melihat rincian tren penjualan dan profit bulanan.</span>
            </div>
          </div>

          <div className="report-title-print">
            <h2>Laporan Penjualan Bulanan</h2>
            <p>Bulan: {monthlyMonth}</p>
          </div>

          <div className="reports-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: 'var(--spacing-lg)' }}>
            <div className="card stat-c-1">
              <span>Transaksi</span>
              <h3>{monthlyData.totalTransactions} Nota</h3>
            </div>
            <div className="card stat-c-2">
              <span>HPP / Modal</span>
              <h3>{formatRupiah(monthlyData.totalCost)}</h3>
            </div>
            <div className="card stat-c-3">
              <span>Total Omset</span>
              <h3 style={{ color: 'var(--success)' }}>{formatRupiah(monthlyData.totalRevenue)}</h3>
            </div>
            <div className="card stat-c-4">
              <span>Laba Kotor</span>
              <h3 style={{ color: 'var(--accent-secondary)' }}>{formatRupiah(monthlyData.totalProfit)}</h3>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h4 className="card-title"><TrendingUp size={16} /> Grafik Tren Penjualan Bulanan</h4>
            {renderMonthlyChart()}
          </div>
        </div>
      )}

      {/* -------------------- TAB: LABA RUGI -------------------- */}
      {activeTab === 'profit' && profitData && (
        <div className="report-content">
          <div className="filter-card card no-print" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <form onSubmit={(e) => { e.preventDefault(); loadProfit(profitFrom, profitTo); }} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Dari</span>
                <input type="date" value={profitFrom} onChange={(e) => setProfitFrom(e.target.value)} className="modal-input" style={{ width: '150px' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>S/D</span>
                <input type="date" value={profitTo} onChange={(e) => setProfitTo(e.target.value)} className="modal-input" style={{ width: '150px' }} />
              </div>
              <Button type="submit" variant="primary">Filter Laporan</Button>
            </form>
          </div>

          <div className="report-title-print">
            <h2>Laporan Laba Rugi Buku Toko</h2>
            <p>Periode: {formatDate(profitFrom)} s/d {formatDate(profitTo)}</p>
          </div>

          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 className="card-title"><DollarSign size={20} /> Laporan Laba Rugi</h3>
            
            <div className="profit-loss-statement" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'var(--spacing-lg)' }}>
              <div className="p-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Omset / Pendapatan Penjualan:</span>
                <strong style={{ color: 'var(--success)' }}>{formatRupiah(profitData.totalRevenue)}</strong>
              </div>
              <div className="p-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Harga Pokok Penjualan (HPP):</span>
                <span style={{ color: 'var(--text-secondary)' }}>-{formatRupiah(profitData.totalCostOfGoodsSold)}</span>
              </div>
              <div className="p-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px', fontWeight: 'bold' }}>
                <span>Margin Laba Kotor Penjualan:</span>
                <strong style={{ color: 'var(--success)' }}>{formatRupiah(profitData.totalProfit)}</strong>
              </div>
              <div className="p-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Belanja Modal Restok (Supplier Cash Outflow):</span>
                <span style={{ color: 'var(--danger)' }}>-{formatRupiah(profitData.totalPurchaseExpense)}</span>
              </div>
              
              <div className="p-row highlight-box" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-tertiary)', fontWeight: 'bold', fontSize: 'var(--font-size-base)', border: '1px solid var(--border-color)' }}>
                <span>Laba Bersih Penjualan:</span>
                <span style={{ color: 'var(--accent-primary)' }}>{formatRupiah(profitData.totalProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB: TOP PRODUCTS -------------------- */}
      {activeTab === 'top' && (
        <div className="report-content">
          <div className="report-title-print">
            <h2>Daftar 10 Sparepart Terlaris</h2>
            <p>Bulan Ini</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="card">
              <h4 className="card-title">Grafik Produk Terlaris</h4>
              {renderTopProductsChart()}
            </div>

            <div className="card">
              <h4 className="card-title"><BarChart3 size={16} /> Data Penjualan Produk</h4>
              <div className="table-container">
                <table className="data-table" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <thead>
                    <tr>
                      <th>Nama Sparepart</th>
                      <th>Jumlah</th>
                      <th>Omset</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductsData.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlignment: 'center', color: 'var(--text-secondary)' }}>Tidak ada data terlaris.</td>
                      </tr>
                    ) : (
                      topProductsData.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{p.name}</td>
                          <td><strong>{p.totalQuantity}</strong> {p.unit}</td>
                          <td>{formatRupiah(p.totalRevenue)}</td>
                          <td style={{ color: 'var(--success)' }}>{formatRupiah(p.totalProfit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
