import React, { useState } from 'react';
import useCategories from '../hooks/useCategories.js';
import Button from '../components/ui/Button.jsx';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useCategories();
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFormError('');
    setIsOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setFormError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    let result;
    if (editingId) {
      result = await updateCategory(editingId, name, description);
    } else {
      result = await addCategory(name, description);
    }

    if (result.success) {
      setIsOpen(false);
      setName('');
      setDescription('');
    } else {
      setFormError(result.error || 'Terjadi kesalahan sistem');
    }
  };

  const handleDelete = async (id) => {
    setDeleteError('');
    const result = await deleteCategory(id);
    if (result.success) {
      setDeleteId(null);
    } else {
      setDeleteError(result.error || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="categories-page animate-fade-in">
      <div className="page-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Kelola kategori sparepart produk Amat Sidojaya.</p>
        <Button onClick={openAddModal} variant="primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Tambah Kategori
        </Button>
      </div>

      {error && (
        <div className="error-alert" style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-md)' }}>
          {error}
        </div>
      )}

      {deleteError && (
        <div className="error-alert" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-md)' }}>
          {deleteError}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
          Memuat data kategori...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlignment: 'center', color: 'var(--text-secondary)' }}>
                    Belum ada kategori data.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td style={{ fontWeight: '600' }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{cat.description || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => openEditModal(cat)}
                          title="Edit"
                          style={{ padding: '6px' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => {
                            setDeleteError('');
                            setDeleteId(cat.id);
                          }}
                          title="Hapus"
                          style={{ padding: '6px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
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

      {/* Modal Add/Edit */}
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 className="card-title" style={{ margin: '0' }}>
                {editingId ? '✍️ Edit Kategori' : '➕ Tambah Kategori'}
              </h3>
              <button className="btn btn-ghost" onClick={() => setIsOpen(false)} style={{ padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div style={{ color: 'var(--danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                  {formError}
                </div>
              )}
              
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Nama Kategori
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Oli, Ban, Aki"
                  className="modal-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat mengenai kategori"
                  className="modal-textarea"
                  rows="3"
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <h3 className="card-title" style={{ color: 'var(--danger)' }}>⚠️ Hapus Kategori</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>
                Batal
              </Button>
              <Button type="button" variant="danger" onClick={() => handleDelete(deleteId)}>
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
