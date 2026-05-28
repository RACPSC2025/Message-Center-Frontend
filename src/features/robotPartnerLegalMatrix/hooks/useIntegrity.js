import { useState, useCallback } from 'react';
import { fetchIntegrity } from '../api';

export function useIntegrity(source) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const check = useCallback(() => {
    if (!source) return;
    setLoading(true);
    setError(null);
    fetchIntegrity(source)
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [source]);

  return { data, loading, error, check };
}
