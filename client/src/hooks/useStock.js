import { useState, useCallback } from 'react';
import { api } from '../lib/api.js';

export default function useStock() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStocks = useCallback(async (status = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = status ? `/api/stock?status=${status}` : '/api/stock';
      const res = await api.get(url);
      if (res.success) {
        setStocks(res.data);
      } else {
        setError(res.error || 'Gagal memuat overview stok');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/stock/movements/${productId}`);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = async (productId, newStock, notes) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/stock/adjustment', { productId, newStock, notes });
      if (res.success) {
        await fetchStocks();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await api.get('/api/stock/low');
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    stocks,
    loading,
    error,
    fetchStocks,
    fetchMovements,
    adjustStock,
    fetchLowStock
  };
}
