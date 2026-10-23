import { useState, useEffect, useCallback } from 'react';
import type { HealthCheckData } from '@peerlume/shared';
import { apiService } from '../services/api.js';

export function useHealth() {
  const [data, setData] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiService.getHealth();
    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    data,
    loading,
    error,
    refetch: fetchHealth,
  };
}
