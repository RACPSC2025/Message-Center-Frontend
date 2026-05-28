import { useState, useEffect, useCallback } from 'react';
import { fetchTaxonomy } from '../api';

export function useTaxonomy(source) {
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!source) return;
    setLoading(true);
    setError(null);
    fetchTaxonomy(source)
      .then((data) => {
        setTaxonomy(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [source]);

  useEffect(() => {
    load();
  }, [load]);

  return { taxonomy, loading, error, reload: load };
}
