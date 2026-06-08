import React, { useState, useEffect } from 'react';
import useStock from '../hooks/useStock.js';
import useProducts from '../hooks/useProducts.js';
import Button from '../components/ui/Button.jsx';
import StockBadge from '../components/products/StockBadge.jsx';
import { RefreshCw, History, ArrowUpRight, ArrowDownLeft, X, Edit, Sliders } from 'lucide-react';
import './StockPage.css';

export default function StockPage() {
  const { stocks, loading, error, fetchStocks, fetchMovements, adjustStock } = useStock();
  const { products: allProducts, refresh: refreshAllProds } = useProducts({ limit: 100 });
  const [activeTab, setActiveTab] = useState('overview');

  // Filter state
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Movements state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Opname state
  const [opnameProdId, setOpnameProdId] = useState('');
  const [opnameCurrentStock, setOpnameCurrentStock] = useState(0);
  const [opnameNewStock, setOpnameNewStock] = useState(0);
  const [opnameNotes, setOpnameNotes] = useState('');
  const [opnameError, setOpnameError] = useState('');
  const [opnameSuccess, setOpnameSuccess] = useState(false);

  // Fetch stocks on mount/filter
  useEffect(() => {
    fetchStocks(showLowStockOnly ? 'low' : '');
  }, [showLowStockOnly, fetchStocks]);

  const toggleLowStockFilter = () => {
    setShowLowStockOnly(prev => !prev);
  };

  // View movements modal
  const openMovementsModal = async (prod) => {
    setSelectedProduct(prod);
    setModalOpen(true);
    setModalLoading(true);
    const res = await fetchMovements(prod.id);
    if (res.success) {
      setMovements(res.data);
    }
    setModalLoading(false);
  };

  // Sync current stock when selecting product in opname tab
  const handleOpnameProductChange = (e) => {
    const id = e.target.value;
    setOpnameProdId(id);
    setOpnameSuccess(false);
    setOpnameError('');
    if (!id) {
      setOpnameCurrentStock(0);
      setOpnameNewStock(0);
      return;
    }
    const match = allProducts.find(p => p.id === parseInt(id));
    if (match) {
      setOpnameCurrentStock(match.stock);
      setOpnameNewStock(match.stock);
    }
  };

  const handleOpnameSubmit = async (e) => {
    e.preventDefault();
    setOpnameError('');
    setOpnameSuccess(false);

    if (!opnameProdId) {
      setOpnameError('Silakan pilih produk terlebih dahulu');
      return;
    }

    const res = await adjustStock(opnameProdId, opnameNewStock, opnameNotes);
    if (res.success) {
      setOpnameSuccess(true);
      setOpnameNotes('');
      // Refresh list
      fetchStocks(showLowStockOnly ? 'low' : '');
      refreshAllProds();
      
      // Update local opname current stock
      setOpnameCurrentStock(opnameNewStock);
    } else {
      setOpnameError(res.error || 'Gagal menyimpan stok opname.');
    }
  };

  return (
    <div className="stock-page animate-fade-in">
      <div className="stock-tab-menu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview & Pergerakan
          </button>
          <button className={`tab-btn ${activeTab === 'opname' ? 'active' : ''}`} onClick={() => setActiveTab('opname')}>
            Stok Opname (Penyesuaian)
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <button 
            onClick={toggleLowStockFilter}
            className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sliders size={16} /> {showLowStockOnly ? 'Tampilkan Semua Stok' : 'Tampilkan Stok Rendah'}
          </button>
        )}
      </div>

      {error && <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {/* -------------------- TAB: OVERVIEW & MOVEMENTS -------------------- */}
      {activeTab === 'overview' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
              Memuat data overview stok...
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode Barang</th>
                    <th>Nama Sparepart</th>
                    <th>Kategori</th>
                    <th>Rak</th>
                    <th>Status Stok</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Riwayat</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Tidak ada barang dengan kriteria stok terpilih.
                      </td>
                    </tr>
                  ) : (
                    stocks.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{s.code}</td>
                        <td style={{ fontWeight: '600' }}>{s.name}</td>
                        <td><span className="badge badge-info">{s.categoryName || 'Umum'}</span></td>
                        <td>{s.location || '-'}</td>
                        <td>
                          <StockBadge stock={s.stock} minStock={s.minStock} unit={s.unit} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-ghost" 
                              onClick={() => openMovementsModal(s)}
                              title="Lihat Log Pergerakan"
                              style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <History size={16} /> Kartu Stok
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* -------------------- TAB: STOK OPNAME -------------------- */}
      {activeTab === 'opname' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="card-title">🔄 Stok Opname (Penyesuaian Fisik)</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
            Sesuaikan kuantitas stok di sistem jika terdapat selisih dengan perhitungan barang fisik di gudang/rak.
          </p>

          <form onSubmit={handleOpnameSubmit}>
            {opnameError && <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>{opnameError}</div>}
            {opnameSuccess && (
              <div className="success-alert" style={{ color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
                ✓ Penyesuaian stok berhasil disimpan dan tercatat di kartu stok.
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Pilih Sparepart
              </label>
              <select 
                value={opnameProdId} 
                onChange={handleOpnameProductChange}
                className="modal-input"
                required
              >
                <option value="">-- Pilih Barang --</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name} (Stok: {p.stock})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Stok di Sistem
                </label>
                <input 
                  type="number" 
                  value={opnameCurrentStock} 
                  className="modal-input" 
                  style={{ opacity: 0.6 }}
                  disabled 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Stok Fisik Aktual
                </label>
                <input 
                  type="number" 
                  value={opnameNewStock} 
                  onChange={(e) => setOpnameNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="modal-input" 
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Alasan Penyesuaian
              </label>
              <textarea 
                value={opnameNotes} 
                onChange={(e) => setOpnameNotes(e.target.value)}
                placeholder="Contoh: Barang rusak / Hilang / Koreksi pencatatan"
                className="modal-textarea"
                rows="3"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={16} /> Simpan Penyesuaian
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline Movements Modal */}
      {modalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-sm)' }}>
              <h3 className="card-title" style={{ margin: 0 }}>📋 Kartu Pergerakan Stok</h3>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
              <div>Barang: <strong>{selectedProduct.name}</strong></div>
              <div>Kode: <strong style={{ fontFamily: 'monospace' }}>{selectedProduct.code}</strong></div>
            </div>

            {modalLoading ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-md)' }}>Memuat kartu stok...</p>
            ) : (
              <div className="movements-timeline" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {movements.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-md)' }}>Belum ada log pergerakan stok.</p>
                ) : (
                  movements.map((mv) => {
                    const isIncrease = mv.type === 'in' || (mv.type === 'adjustment' && mv.quantity > 0);
                    const isDecrease = mv.type === 'out' || (mv.type === 'adjustment' && mv.quantity < 0);
                    
                    return (
                      <div key={mv.id} className="timeline-item" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                        <div className="timeline-icon">
                          {isIncrease && <ArrowUpRight style={{ color: 'var(--success)' }} />}
                          {isDecrease && <ArrowDownLeft style={{ color: 'var(--danger)' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                            <strong>
                              {mv.type === 'in' && 'Barang Masuk (Restok)'}
                              {mv.type === 'out' && 'Barang Keluar (Penjualan)'}
                              {mv.type === 'adjustment' && 'Opname (Penyesuaian)'}
                            </strong>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              {new Date(mv.createdAt).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', margin: '4px 0' }}>
                            Jumlah Perubahan: <strong style={{ color: isIncrease ? 'var(--success)' : 'var(--danger)' }}>{mv.quantity > 0 ? `+${mv.quantity}` : mv.quantity}</strong> | Saldo Akhir: <strong>{mv.stockAfter}</strong>
                          </p>
                          {mv.notes && (
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', italic: 'true' }}>
                              * {mv.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
