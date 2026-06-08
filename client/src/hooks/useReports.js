import { useState, useCallback } from 'react';
import { api } from '../lib/api.js';

export default function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDailyReport = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/daily?date=${date}`);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonthlyReport = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/monthly?month=${month}`);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfitReport = useCallback(async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/profit?from=${from}&to=${to}`);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopProducts = useCallback(async (period = 'month', limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/reports/top-products?period=${period}&limit=${limit}`);
      return res;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getDailyReport,
    getMonthlyReport,
    getProfitReport,
    getTopProducts,
  };
}
