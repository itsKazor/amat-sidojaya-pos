import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

export default function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProducts = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.search) queryParams.append('search', currentFilters.search);
      if (currentFilters.category) queryParams.append('category', currentFilters.category);
      if (currentFilters.vehicleType) queryParams.append('vehicle_type', currentFilters.vehicleType);
      if (currentFilters.page) queryParams.append('page', currentFilters.page);
      if (currentFilters.limit) queryParams.append('limit', currentFilters.limit);

      const res = await api.get(`/api/products?${queryParams.toString()}`);
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      } else {
        setError(res.error || 'Gagal memuat produk');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [filters.page, filters.category, filters.vehicleType]); // Fetch automatically when these filters change

  const addProduct = async (productData) => {
    setError(null);
    try {
      const res = await api.post('/api/products', productData);
      if (res.success) {
        await fetchProducts(); // Refresh list to get pagination and new codes correctly
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, productData) => {
    setError(null);
    try {
      const res = await api.put(`/api/products/${id}`, productData);
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === parseInt(id) ? { ...p, ...res.data } : p));
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    setError(null);
    try {
      const res = await api.delete(`/api/products/${id}`);
      if (res.success) {
        await fetchProducts();
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getProduct = async (id) => {
    try {
      const res = await api.get(`/api/products/${id}`);
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
  };
}
