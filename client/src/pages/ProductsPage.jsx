import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProducts from '../hooks/useProducts.js';
import useCategories from '../hooks/useCategories.js';
import ProductTable from '../components/products/ProductTable.jsx';
import Button from '../components/ui/Button.jsx';
import { Plus, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import './ProductsPage.css';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { categories } = useCategories();

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [page, setPage] = useState(1);

  const { 
    products, 
    pagination, 
    loading, 
    error, 
    deleteProduct, 
    setFilters 
  } = useProducts({
    search: '',
    category: '',
    vehicleType: '',
    page: 1,
    limit: 10
  });

  // State to trigger delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setPage(1);
    setFilters(prev => ({ ...prev, category: value, page: 1 }));
  };

  const handleVehicleTypeChange = (e) => {
    const value = e.target.value;
    setVehicleType(value);
    setPage(1);
    setFilters(prev => ({ ...prev, vehicleType: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleEditProduct = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeleteProduct = async () => {
    setDeleteError('');
    const res = await deleteProduct(deleteId);
    if (res.success) {
      setDeleteId(null);
    } else {
      setDeleteError(res.error || 'Gagal menghapus produk.');
    }
  };

  return (
    <div className="products-page animate-fade-in">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Kelola data katalog sparepart Amat Sidojaya.</p>
        <Button onClick={() => navigate('/products/new')} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Tambah Produk
        </Button>
      </div>

      {deleteError && (
        <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          {deleteError}
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="filters-grid">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              value={search} 
              onChange={handleSearchChange}
              placeholder="Cari kode, nama, atau merek..."
              className="filter-input-search"
            />
          </div>

          <div className="filter-select-wrapper">
            <select 
              value={category} 
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select 
              value={vehicleType} 
              onChange={handleVehicleTypeChange}
              className="filter-select"
            >
              <option value="">Semua Tipe Kendaraan</option>
              <option value="universal">Universal</option>
              <option value="motor">Motor</option>
              <option value="mobil">Mobil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {error && <div className="error-alert" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
          Memuat data produk sparepart...
        </div>
      ) : (
        <>
          <ProductTable 
            products={products} 
            onEdit={handleEditProduct} 
            onDelete={(id) => {
              setDeleteError('');
              setDeleteId(id);
            }} 
          />

          {/* Pagination bar */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-lg)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Menampilkan Halaman {pagination.page} dari {pagination.totalPages} (Total {pagination.total} produk)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button 
                  variant="secondary" 
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}
                >
                  <ChevronLeft size={16} /> Sebelum
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}
                >
                  Berikut <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <h3 className="card-title" style={{ color: 'var(--danger)' }}>⚠️ Hapus Produk</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat diurungkan.
            </p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>
                Batal
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteProduct}>
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
