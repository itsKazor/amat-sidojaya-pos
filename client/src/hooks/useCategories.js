import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/categories');
      if (res.success) {
        setCategories(res.data);
      } else {
        setError(res.error || 'Gagal memuat kategori');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name, description) => {
    setError(null);
    try {
      const res = await api.post('/api/categories', { name, description });
      if (res.success) {
        setCategories(prev => [...prev, res.data]);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCategory = async (id, name, description) => {
    setError(null);
    try {
      const res = await api.put(`/api/categories/${id}`, { name, description });
      if (res.success) {
        setCategories(prev => prev.map(c => c.id === parseInt(id) ? res.data : c));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCategory = async (id) => {
    setError(null);
    try {
      const res = await api.delete(`/api/categories/${id}`);
      if (res.success) {
        setCategories(prev => prev.filter(c => c.id !== parseInt(id)));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
