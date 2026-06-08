import React from 'react';

export default function StockBadge({ stock, minStock, unit = 'pcs' }) {
  if (stock === 0) {
    return <span className="badge badge-danger">Habis</span>;
  }
  
  if (stock <= minStock) {
    return (
      <span className="badge badge-warning" title={`Di bawah batas minimum stok (${minStock} ${unit})`}>
        Sisa {stock} {unit}
      </span>
    );
  }

  return (
    <span className="badge badge-success">
      {stock} {unit}
    </span>
  );
}
