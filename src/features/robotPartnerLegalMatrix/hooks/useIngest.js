import { useState, useEffect } from 'react';
import { ingestPDF } from '../api';

export function useIngest(file, docType = null) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setStatus('loading');
    setError(null);
    setResult(null);

    ingestPDF(file, docType)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setStatus('done');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, [file]); // docType no se incluye — es fijo al momento de montar

  return {
    status,
    indexedChunks: result?.indexed_chunks ?? 0,
    processedFiles: result?.processed_files ?? [],
    pdfName: result?.processed_files?.[0] ?? null,
    error,
  };
}
