import { useState, useEffect, useRef } from 'react';
import { ingestPDFAsync, pollIngestStatus } from '../api';

const POLL_MS = 1500;

export function useIngest(file, docType = null) {
  const [status, setStatus]           = useState('idle');
  const [progress, setProgress]       = useState(0);
  const [indexedChunks, setIndexed]   = useState(0);
  const [totalChunks, setTotal]       = useState(0);
  const [processedFiles, setFiles]    = useState([]);
  const [source, setSource]           = useState(null);
  const [error, setError]             = useState(null);

  const intervalRef  = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!file) return;

    cancelledRef.current = false;
    setStatus('loading');
    setProgress(0);
    setIndexed(0);
    setTotal(0);
    setFiles([]);
    setSource(null);
    setError(null);

    let jobId = null;

    const startPolling = () => {
      intervalRef.current = setInterval(async () => {
        if (cancelledRef.current || !jobId) return;
        try {
          const s = await pollIngestStatus(jobId);
          if (cancelledRef.current) return;

          setProgress(s.progress ?? 0);
          setIndexed(s.indexed_chunks ?? 0);
          setTotal(s.total_chunks ?? 0);

          if (s.processed_files?.length) {
            setFiles(s.processed_files);
            setSource(s.processed_files[0]);
          }

          if (s.status === 'completed') {
            clearInterval(intervalRef.current);
            setProgress(1);
            setStatus('done');
          } else if (s.status === 'failed') {
            clearInterval(intervalRef.current);
            setError(s.errors?.[0] || 'Error en indexación');
            setStatus('error');
          }
        } catch (err) {
          if (!cancelledRef.current) {
            clearInterval(intervalRef.current);
            setError(err.message);
            setStatus('error');
          }
        }
      }, POLL_MS);
    };

    ingestPDFAsync(file, docType)
      .then((job) => {
        if (cancelledRef.current) return;
        if (!job?.job_id) {
          setError('Servidor no devolvió job_id');
          setStatus('error');
          return;
        }
        jobId = job.job_id;
        startPolling();
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setError(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelledRef.current = true;
      clearInterval(intervalRef.current);
    };
  // docType es fijo al montar — cambios post-mount no aplican (diseño intencional)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return { status, progress, source, indexedChunks, totalChunks, processedFiles, error };
}
