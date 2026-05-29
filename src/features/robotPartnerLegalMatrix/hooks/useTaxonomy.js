import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTaxonomy } from '../api';

export function useTaxonomy(source, { allowPartial = false, pollInterval = 0 } = {}) {
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(() => {
    if (!source) return;
    setLoading(true);
    setError(null);
    fetchTaxonomy(source, { allowPartial })
      .then((data) => {
        setTaxonomy(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [source, allowPartial]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!source || !pollInterval) return;
    pollRef.current = setInterval(load, pollInterval);
    return () => clearInterval(pollRef.current);
  }, [source, pollInterval, load]);

  return { taxonomy, loading, error, reload: load };
}
