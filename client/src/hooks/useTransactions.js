import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api.js';

export default function useTransactions(initialFilters = {}) {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, ...initialFilters });

  const fetchSales = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.from) queryParams.append('from', currentFilters.from);
      if (currentFilters.to) queryParams.append('to', currentFilters.to);
      if (currentFilters.page) queryParams.append('page', currentFilters.page);
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit);

      const res = await api.get(`/api/transactions?${queryParams.toString()}`);
      if (res.success) {
        setSales(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.error || 'Gagal memuat riwayat penjualan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSales();
  }, [filters.page, filters.from, filters.to]); // Auto fetch when pagination or date filters change

  const createSale = async (customerName, notes, items) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/transactions', { customerName, notes, items });
      setLoading(false);
      if (res.success) {
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getSaleDetail = async (id) => {
    try {
      const res = await api.get(`/api/transactions/${id}`);
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    sales,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchSales,
    createSale,
    getSaleDetail,
  };
}
