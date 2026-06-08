import React, { useState, useEffect } from 'react';
import useTransactions from '../hooks/useTransactions.js';
import { formatRupiah, formatDateTime } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import InvoicePrint from '../components/transactions/InvoicePrint.jsx';
import { Search, Calendar, Eye, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function SalesPage() {
  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { 
    sales, 
    pagination, 
    loading, 
    error, 
    setFilters 
  } = useTransactions();

  // Selected txn for modal view
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({ revenue: 0, profit: 0, count: 0 });

  // Update date filters
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      from: fromDate ? new Date(fromDate).toISOString() : '',
      to: toDate ? new Date(toDate).toISOString() : '',
      page: 1
    }));
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setFilters(prev => ({
      ...prev,
      from: '',
      to: '',
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Open modal detail
  const viewDetail = async (id) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const res = await fetch(`/api/transactions/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTxn(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate stats on sales list changes
  useEffect(() => {
    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = sales.reduce((sum, s) => sum + s.totalProfit, 0);
    setStats({ revenue, profit, count: sales.length });
  }, [sales]);

  return (
    <div className="sales-page animate-fade-in">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Riwayat transaksi penjualan toko Amat Sidojaya.</p>
      </div>

      {/* Date Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Mulai Tanggal</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="modal-input" 
              style={{ width: '180px' }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Sampai Tanggal</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="modal-input" 
              style={{ width: '180px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="submit" variant="primary">Filter</Button>
            {(fromDate || toDate) && (
              <Button type="button" variant="secondary" onClick={handleClearFilters}>Reset</Button>
            )}
          </div>
        </div>
      </form>

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Transaksi (Halaman Ini)</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: '4px' }}>{stats.count} Transaksi</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Omset (Halaman Ini)</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: '4px', color: 'var(--success)' }}>{formatRupiah(stats.revenue)}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Keuntungan (Halaman Ini)</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: '4px', color: 'var(--accent-secondary)' }}>{formatRupiah(stats.profit)}</div>
        </div>
      </div>

      {/* Transactions List */}
      {error && <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
          Memuat riwayat penjualan...
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Tanggal Transaksi</th>
                  <th>Nama Pelanggan</th>
                  <th>Total Transaksi</th>
                  <th>Total Profit</th>
                  <th>Catatan</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Tidak ada transaksi penjualan ditemukan.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {sale.invoiceNumber}
                      </td>
                      <td>{formatDateTime(sale.transactionDate)}</td>
                      <td>{sale.customerName || 'Pelanggan Umum'}</td>
                      <td style={{ fontWeight: '600' }}>{formatRupiah(sale.totalAmount)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: '600' }}>{formatRupiah(sale.totalProfit)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {sale.notes || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            className="btn btn-ghost" 
                            onClick={() => viewDetail(sale.id)}
                            title="Lihat Detail"
                            style={{ padding: '6px' }}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-lg)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Menampilkan Halaman {pagination.page} dari {pagination.totalPages} (Total {pagination.total} transaksi)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  variant="secondary" 
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Sebelum
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Berikut <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '540px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)' }}>
              <h3 className="card-title" style={{ margin: 0 }}>🔎 Detail Penjualan</h3>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {modalLoading ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-md)' }}>Memuat data detail...</p>
            ) : (
              selectedTxn && (
                <div>
                  <div style={{ display: 'none' }}>
                    {/* Hidden printable receipt wrapper */}
                    <InvoicePrint transaction={selectedTxn} />
                  </div>
                  
                  {/* Screen readable receipt layout */}
                  <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>No. Invoice:</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{selectedTxn.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tanggal:</span>
                      <span>{formatDateTime(selectedTxn.transactionDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Pelanggan:</span>
                      <span>{selectedTxn.customerName}</span>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: 'var(--spacing-md)' }}>
                    <table className="data-table" style={{ fontSize: 'var(--font-size-xs)' }}>
                      <thead>
                        <tr>
                          <th>Nama Barang</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th>Harga</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTxn.items && selectedTxn.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.productName}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td>{formatRupiah(item.unitPrice)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>TOTAL BELANJA</div>
                      <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--accent-primary)' }}>{formatRupiah(selectedTxn.totalAmount)}</strong>
                    </div>
                  </div>

                  {selectedTxn.notes && (
                    <div style={{ fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--bg-tertiary)', padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-lg)' }}>
                      <strong>Catatan:</strong> {selectedTxn.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>
                      Tutup
                    </Button>
                    <Button variant="primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Printer size={16} /> Cetak Struk
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
