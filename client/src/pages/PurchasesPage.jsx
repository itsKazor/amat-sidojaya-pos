import React, { useState, useEffect } from 'react';
import usePurchases from '../hooks/usePurchases.js';
import { formatRupiah, formatDateTime } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import { Eye, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

export default function PurchasesPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { 
    purchases, 
    pagination, 
    loading, 
    error, 
    setFilters 
  } = usePurchases();

  // Selected purchase detail modal state
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Summary stats
  const [stats, setStats] = useState({ totalExpense: 0, count: 0 });

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

  useEffect(() => {
    const expense = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    setStats({ totalExpense: expense, count: purchases.length });
  }, [purchases]);

  return (
    <div className="purchases-page animate-fade-in">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Melihat riwayat restok barang masuk dari supplier Amat Sidojaya.</p>
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

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Transaksi Masuk (Halaman Ini)</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: '4px' }}>{stats.count} Transaksi</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Pengeluaran Restok (Halaman Ini)</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginTop: '4px', color: 'var(--accent-secondary)' }}>{formatRupiah(stats.totalExpense)}</div>
        </div>
      </div>

      {/* Purchases list */}
      {error && <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
          Memuat riwayat restok...
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No. Faktur</th>
                  <th>Tanggal Pembelian</th>
                  <th>Nama Supplier</th>
                  <th>Total Biaya</th>
                  <th>Catatan</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Tidak ada transaksi pembelian restok ditemukan.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                        {p.invoiceNumber}
                      </td>
                      <td>{formatDateTime(p.transactionDate)}</td>
                      <td>{p.supplierName || 'Supplier Umum'}</td>
                      <td style={{ fontWeight: '600' }}>{formatRupiah(p.totalAmount)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {p.notes || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            className="btn btn-ghost" 
                            onClick={() => viewDetail(p.id)}
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
                Menampilkan Halaman {pagination.page} dari {pagination.totalPages} (Total {pagination.total} pembelian)
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
              <h3 className="card-title" style={{ margin: 0 }}>🔎 Detail Pembelian (Restok)</h3>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {modalLoading ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-md)' }}>Memuat data detail...</p>
            ) : (
              selectedTxn && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>No. Faktur:</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>{selectedTxn.invoiceNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tanggal:</span>
                      <span>{formatDateTime(selectedTxn.transactionDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Supplier:</span>
                      <span>{selectedTxn.supplierName}</span>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: 'var(--spacing-md)' }}>
                    <table className="data-table" style={{ fontSize: 'var(--font-size-xs)' }}>
                      <thead>
                        <tr>
                          <th>Nama Barang</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th>Harga Beli</th>
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
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>TOTAL PENGELUARAN</div>
                      <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--accent-secondary)' }}>{formatRupiah(selectedTxn.totalAmount)}</strong>
                    </div>
                  </div>

                  {selectedTxn.notes && (
                    <div style={{ fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--bg-tertiary)', padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-lg)' }}>
                      <strong>Catatan:</strong> {selectedTxn.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>
                      Tutup
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
