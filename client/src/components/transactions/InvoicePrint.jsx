import React from 'react';
import { formatRupiah, formatDateTime } from '../../lib/formatters.js';

export default function InvoicePrint({ transaction }) {
  if (!transaction) return null;

  return (
    <div className="invoice-print-container">
      <style>{`
        .invoice-print-container {
          background-color: white;
          color: black;
          padding: 24px;
          border-radius: 8px;
          max-width: 480px;
          margin: 0 auto;
          font-family: 'Courier New', Courier, monospace;
          border: 1px dashed #ccc;
        }
        
        .invoice-print-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px dashed black;
          padding-bottom: 12px;
        }

        .invoice-print-header h2 {
          font-size: 20px;
          margin-bottom: 4px;
          font-weight: bold;
        }

        .invoice-print-header p {
          font-size: 12px;
          margin: 2px 0;
        }

        .invoice-meta-info {
          font-size: 12px;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .invoice-print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 12px;
        }

        .invoice-print-table th {
          border-bottom: 1px dashed black;
          padding: 6px 0;
          text-align: left;
        }

        .invoice-print-table td {
          padding: 6px 0;
        }

        .invoice-totals {
          border-top: 1px dashed black;
          padding-top: 8px;
          font-size: 13px;
          font-weight: bold;
          text-align: right;
          margin-bottom: 24px;
        }

        .invoice-print-footer {
          text-align: center;
          font-size: 11px;
          border-top: 1px dashed black;
          padding-top: 12px;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-container, .invoice-print-container * {
            visibility: visible;
          }
          .invoice-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            border: none;
            padding: 0;
          }
        }
      `}</style>

      <div className="invoice-print-header">
        <h2>AMAT SIDOJAYA</h2>
        <p>Toko Sparepart Motor & Mobil</p>
        <p>Jl. Raya Amat Sidojaya, Indonesia</p>
        <p>Telp: 0812-3456-7890</p>
      </div>

      <div className="invoice-meta-info">
        <div><strong>Nota:</strong> {transaction.invoiceNumber}</div>
        <div><strong>Tanggal:</strong> {formatDateTime(transaction.transactionDate)}</div>
        <div><strong>Pelanggan:</strong> {transaction.customerName || 'Pelanggan Umum'}</div>
      </div>

      <table className="invoice-print-table">
        <thead>
          <tr>
            <th style={{ width: '50%' }}>Nama Barang</th>
            <th style={{ textAlign: 'center', width: '15%' }}>Qty</th>
            <th style={{ textAlign: 'right', width: '35%' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items && transaction.items.map((item, index) => (
            <tr key={index}>
              <td>
                <div>{item.productName}</div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {item.quantity} x {formatRupiah(item.unitPrice)}
                </div>
              </td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{formatRupiah(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals">
        <div>TOTAL: {formatRupiah(transaction.totalAmount)}</div>
      </div>

      {transaction.notes && (
        <div style={{ fontSize: '11px', marginBottom: '16px', borderTop: '1px dotted #ccc', paddingTop: '8px' }}>
          <strong>Catatan:</strong> {transaction.notes}
        </div>
      )}

      <div className="invoice-print-footer">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
      </div>
    </div>
  );
}
