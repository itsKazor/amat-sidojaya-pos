import React, { useState, useEffect, useCallback } from 'react';
import usePurchases from '../hooks/usePurchases.js';
import { api } from '../lib/api.js';
import { formatRupiah } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import { Search, Plus, Trash2, Import, RotateCcw, AlertCircle, Save } from 'lucide-react';
import './NewPurchasePage.css';

export default function NewPurchasePage() {
  const { createPurchase, loading: submitLoading } = usePurchases();

  // Selected restok items
  const [items, setItems] = useState([]);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  // Search state
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Status
  const [successTxn, setSuccessTxn] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch search products
  const fetchProductSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.get(`/api/products?search=${term}&limit=8`);
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProductSearch(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, fetchProductSearch]);

  const addProductToPurchase = (prod) => {
    setErrorMsg('');
    setItems(prev => {
      const existing = prev.find(item => item.id === prod.id);
      if (existing) {
        return prev.map(item => 
          item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: prod.id,
        code: prod.code,
        name: prod.name,
        purchasePrice: prod.purchasePrice, // default modal price
        quantity: 1,
        unit: prod.unit
      }];
    });
  };

  const updateItemQty = (id, val) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, parseInt(val) || 1) } : item
      )
    );
  };

  const updateItemPrice = (id, val) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, purchasePrice: Math.max(0, parseInt(val) || 0) } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('Daftar restok barang masih kosong');
      return;
    }

    const restokItems = items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.purchasePrice
    }));

    const res = await createPurchase(supplierName, notes, restokItems);
    if (res.success) {
      setSuccessTxn(res.data);
    } else {
      setErrorMsg(res.error || 'Gagal menyimpan transaksi pembelian.');
    }
  };

  const resetPage = () => {
    setItems([]);
    setSupplierName('');
    setNotes('');
    setSearch('');
    setSuccessTxn(null);
    setErrorMsg('');
  };

  if (successTxn) {
    return (
      <div className="pos-success-screen animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: 'var(--spacing-md)' }}>✓ Pembelian Stok Disimpan</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Nomor Nota: <strong>{successTxn.invoiceNumber}</strong>
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Total Biaya Pengeluaran: <strong>{formatRupiah(successTxn.totalAmount)}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-lg)' }}>
            Stok sparepart telah bertambah dan harga beli terbaru telah disinkronisasikan ke katalog produk.
          </p>
          
          <Button onClick={resetPage} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
            <RotateCcw size={16} /> Input Pembelian Lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-container animate-fade-in">
      {errorMsg && (
        <div className="error-alert" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Left Column: Search products */}
      <div className="purchase-left-panel card">
        <h3 className="card-title"><Import size={20} /> Pilih Produk Supplier</h3>
        
        <div className="search-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sparepart yang ingin di-restok..."
            className="filter-input-search"
          />
        </div>

        {searchLoading && <p style={{ color: 'var(--text-secondary)' }}>Mencari produk...</p>}

        <div className="search-results-list">
          {searchResults.length === 0 && search.trim() !== '' && !searchLoading && (
            <p style={{ color: 'var(--text-muted)' }}>Produk tidak ditemukan.</p>
          )}

          {searchResults.map(p => (
            <div key={p.id} className="product-search-item" onClick={() => addProductToPurchase(p)}>
              <div className="product-search-info">
                <span className="product-search-code">{p.code}</span>
                <span className="product-search-name">{p.name}</span>
                <span className="product-search-meta">{p.brand || 'No Brand'} • Stok saat ini: {p.stock} {p.unit}</span>
              </div>
              <div className="product-search-action" style={{ textAlign: 'right' }}>
                <div className="product-search-price" style={{ color: 'var(--accent-secondary)' }}>
                  Beli: {formatRupiah(p.purchasePrice)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Checkout restok */}
      <div className="purchase-right-panel card">
        <h3 className="card-title">📝 Detail Faktur Pembelian</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
            <input 
              type="text" 
              value={supplierName} 
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Nama Supplier / Toko Grosir"
              className="modal-input"
              required
            />
          </div>

          <div className="purchase-items-list">
            {items.length === 0 ? (
              <div className="empty-cart-state">
                <Import size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }} />
                <p>Silakan klik produk di panel kiri untuk memulai input restok.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="purchase-item-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)' }}>{item.name}</div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.code}</span>
                  </div>

                  <div className="purchase-item-inputs">
                    {/* Qty */}
                    <div style={{ display: 'flex', flexDirection: 'column', width: '70px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Jumlah</label>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItemQty(item.id, e.target.value)}
                        className="modal-input" 
                        style={{ padding: '6px' }}
                        required
                      />
                    </div>

                    {/* Cost price */}
                    <div style={{ display: 'flex', flexDirection: 'column', width: '110px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Harga Beli (Rp)</label>
                      <input 
                        type="number" 
                        value={item.purchasePrice} 
                        onChange={(e) => updateItemPrice(item.id, e.target.value)}
                        className="modal-input" 
                        style={{ padding: '6px' }}
                        required
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeItem(item.id)}
                      className="btn btn-ghost"
                      style={{ color: 'var(--danger)', padding: '6px', marginTop: '14px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="form-group" style={{ margin: 'var(--spacing-md) 0' }}>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pembelian (contoh: restok bulanan ban)"
              className="modal-textarea"
              rows="2"
            />
          </div>

          <div className="cart-totals-summary">
            <div className="total-row">
              <span>Total Pengeluaran:</span>
              <span className="total-price-val" style={{ color: 'var(--accent-secondary)' }}>{formatRupiah(calculateTotal())}</span>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              disabled={items.length === 0 || submitLoading} 
              style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', marginTop: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Save size={18} /> {submitLoading ? 'Menyimpan...' : 'Simpan Pembelian'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
