import React from 'react';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import { formatRupiah } from '../../lib/formatters.js';
import StockBadge from './StockBadge.jsx';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="table-empty-state" style={{ padding: 'var(--spacing-xl)', textAlignment: 'center', color: 'var(--text-secondary)' }}>
        <p>Tidak ada produk ditemukan. Silakan tambahkan produk baru.</p>
      </div>
    );
  }

  return (
    <div className="table-container animate-fade-in">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>Kategori</th>
            <th>Kendaraan</th>
            <th>Merek</th>
            <th>Stok</th>
            <th>Harga Beli</th>
            <th>Harga Jual</th>
            <th>Lokasi Rak</th>
            <th style={{ textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                {p.code}
              </td>
              <td>
                <div style={{ fontWeight: '500' }}>{p.name}</div>
              </td>
              <td>
                <span className="badge badge-info">{p.categoryName || 'Umum'}</span>
              </td>
              <td>
                <span style={{ textTransform: 'capitalize' }}>
                  {p.vehicleType || 'Universal'}
                </span>
              </td>
              <td>{p.brand || '-'}</td>
              <td>
                <StockBadge stock={p.stock} minStock={p.minStock} unit={p.unit} />
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{formatRupiah(p.purchasePrice)}</td>
              <td style={{ fontWeight: '500' }}>{formatRupiah(p.sellingPrice)}</td>
              <td>
                {p.location ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <MapPin size={12} /> {p.location}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => onEdit(p.id)}
                    title="Edit Produk"
                    style={{ padding: '6px' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => onDelete(p.id)}
                    title="Hapus Produk"
                    style={{ padding: '6px', color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
