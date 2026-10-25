import { useCallback, useEffect, useState } from 'react';
import api, { errorMessage } from '../utils/api';

// Small GET helper with loading / error state and a manual reload.
export default function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const paramKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(url, { params: JSON.parse(paramKey) });
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err, 'Could not load this information.'));
    } finally {
      setLoading(false);
    }
  }, [url, paramKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}