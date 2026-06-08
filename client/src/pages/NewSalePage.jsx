import React, { useState, useEffect, useCallback } from 'react';
import useTransactions from '../hooks/useTransactions.js';
import { api } from '../lib/api.js';
import { formatRupiah } from '../lib/formatters.js';
import Button from '../components/ui/Button.jsx';
import InvoicePrint from '../components/transactions/InvoicePrint.jsx';
import { Search, Plus, Trash2, ShoppingCart, Printer, RotateCcw, AlertCircle } from 'lucide-react';
import './NewSalePage.css';

export default function NewSalePage() {
  const { createSale, loading: txnLoading } = useTransactions();

  // Cart state
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Search & Category states
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Success transaction state for printing
  const [completedTxn, setCompletedTxn] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch products matching category and search term
  const fetchProducts = useCallback(async (catId, term) => {
    setSearchLoading(true);
    try {
      let url = `/api/products?limit=80`;
      if (catId && catId !== 'all') {
        url += `&category=${catId}`;
      }
      if (term.trim()) {
        url += `&search=${encodeURIComponent(term)}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        if (res.success) {
          setCategoriesList(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products when selectedCategory or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(selectedCategory, search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, search, fetchProducts]);

  const addToCart = (product) => {
    setErrorMsg('');
    if (product.stock <= 0) {
      setErrorMsg(`Produk "${product.name}" kehabisan stok.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setErrorMsg(`Batas maksimum pembelian untuk "${product.name}" adalah ${product.stock} (stok tersedia).`);
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        code: product.code,
        name: product.name,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        unit: product.unit,
        quantity: 1
      }];
    });
  };

  const updateQuantity = (productId, qty) => {
    setErrorMsg('');
    const target = cart.find(item => item.id === productId);
    if (!target) return;

    if (qty > target.stock) {
      setErrorMsg(`Stok tidak mencukupi. Hanya tersedia ${target.stock} unit.`);
      return;
    }

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Keranjang belanja masih kosong');
      return;
    }

    const checkoutItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.sellingPrice
    }));

    const res = await createSale(customerName, notes, checkoutItems);
    if (res.success) {
      // Fetch transaction detail with item details for receipt view
      try {
        const detailRes = await api.get(`/api/transactions/${res.data.id}`);
        if (detailRes.success) {
          setCompletedTxn(detailRes.data);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal memuat struk nota.');
      }
    } else {
      setErrorMsg(res.error || 'Gagal memproses transaksi.');
    }
  };

  const resetPOS = () => {
    setCart([]);
    setCustomerName('');
    setNotes('');
    setSearch('');
    setSelectedCategory('all');
    setCompletedTxn(null);
    setErrorMsg('');
  };

  const handlePrint = () => {
    window.print();
  };

  if (completedTxn) {
    return (
      <div className="pos-success-screen animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: 'var(--spacing-sm)' }}>✓ Transaksi Berhasil</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Nota <strong>{completedTxn.invoiceNumber}</strong> telah dicatat.
          </p>
          
          <InvoicePrint transaction={completedTxn} />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: 'var(--spacing-lg)' }}>
            <Button onClick={handlePrint} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={16} /> Cetak Struk
            </Button>
            <Button onClick={resetPOS} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} /> Transaksi Baru
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-container animate-fade-in">
      {errorMsg && (
        <div className="error-alert" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Left panel: Search & Add Products */}
      <div className="pos-left-panel card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} /> Pilih Sparepart
        </h3>
        
        <div className="search-box" style={{ marginBottom: 'var(--spacing-md)' }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari sparepart berdasarkan nama, kode, atau brand..."
            className="filter-input-search"
          />
        </div>

        {/* Category Tabs */}
        <div className="pos-categories-tabs">
          <button 
            type="button" 
            className={`pos-category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Semua
          </button>
          {categoriesList.map(cat => (
            <button 
              key={cat.id}
              type="button" 
              className={`pos-category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {searchLoading && <p style={{ color: 'var(--text-secondary)', margin: 'var(--spacing-md) 0' }}>Memuat produk...</p>}

        <div className="products-grid-container">
          {searchResults.length === 0 && !searchLoading && (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-muted)' }}>
              Produk tidak ditemukan dalam kategori ini.
            </div>
          )}
          
          <div className="products-grid">
            {searchResults.map(p => {
              const isLowStock = p.stock <= p.minStock;
              const isOutOfStock = p.stock <= 0;
              return (
                <div 
                  key={p.id} 
                  className={`product-grid-card ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low-stock-card' : ''}`} 
                  onClick={() => addToCart(p)}
                >
                  <div className="product-card-header">
                    <span className="product-card-code">{p.code}</span>
                    <span className="product-card-location" title="Lokasi Rak">{p.location || '-'}</span>
                  </div>
                  
                  <div className="product-card-body">
                    <span className="product-card-brand">{p.brand || 'No Brand'}</span>
                    <h4 className="product-card-name" title={p.name}>{p.name}</h4>
                    <span className="product-card-vehicle">{p.vehicleType ? p.vehicleType.toUpperCase() : 'UNIVERSAL'}</span>
                  </div>
                  
                  <div className="product-card-footer">
                    <span className="product-card-price">{formatRupiah(p.sellingPrice)}</span>
                    <span className={`product-card-stock ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`}>
                      {isOutOfStock ? 'Habis' : `${p.stock} ${p.unit}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: Cart & Checkout */}
      <div className="pos-right-panel card">
        <h3 className="card-title">🛒 Keranjang Belanja</h3>
        
        <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
            <input 
              type="text" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan (opsional)"
              className="modal-input"
            />
          </div>

          {/* Cart list items */}
          <div className="cart-items-list">
            {cart.length === 0 ? (
              <div className="empty-cart-state">
                <ShoppingCart size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }} />
                <p>Keranjang kosong.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-desc">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">{formatRupiah(item.sellingPrice)}</div>
                  </div>
                  
                  <div className="cart-item-controls">
                    <div className="qty-spinner">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn"
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="qty-input"
                      />
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >+</button>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-ghost cart-item-delete"
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
              placeholder="Catatan Transaksi (opsional)"
              className="modal-textarea"
              rows="2"
            />
          </div>

          {/* Totals & Submit */}
          <div className="cart-totals-summary">
            <div className="total-row">
              <span>Total Tagihan:</span>
              <span className="total-price-val">{formatRupiah(calculateTotal())}</span>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              disabled={cart.length === 0 || txnLoading} 
              style={{ width: '100%', padding: '12px', fontSize: 'var(--font-size-base)', fontWeight: 'bold', marginTop: 'var(--spacing-sm)' }}
            >
              {txnLoading ? 'Memproses...' : 'Proses Transaksi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
