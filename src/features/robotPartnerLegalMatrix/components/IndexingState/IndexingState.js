import { useEffect } from 'react';
import {
  Box, Typography, CircularProgress, LinearProgress,
  Chip, Alert, Button,
} from '@mui/material';
import { CheckCircleRounded, ErrorRounded } from '@mui/icons-material';
import PDFViewerComponent from '../../../../components/Input/lexicalWYSWYG/PDFViewerComponent';
import TaxonomyPanel from '../TaxonomyPanel';
import { useIngest } from '../../hooks/useIngest';

const TAXONOMY_POLL_MS = 3000;

const IndexingState = ({ file, pdfUrl, docType, onIndexingComplete, onBack }) => {
  const { status, progress, source, indexedChunks, totalChunks, processedFiles, error } =
    useIngest(file, docType);

  // processed_files solo se popula en mark_completed — usar file.name inmediatamente
  // para que TaxonomyPanel pueda hacer polling con allow_partial desde el inicio
  const effectiveSource = source ?? file?.name ?? null;

  useEffect(() => {
    if (status === 'done' && onIndexingComplete) {
      onIndexingComplete({ processedFiles, indexedChunks });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const pct = Math.round(progress * 100);

  return (
    <Box display="flex" flexDirection="column" sx={{ height: '100%', overflow: 'hidden' }}>
      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
        {status === 'loading' && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {effectiveSource ? `Indexando ${effectiveSource}…` : 'Iniciando indexación…'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {totalChunks > 0 && (
                  <Typography variant="caption" color="text.disabled">
                    {indexedChunks} / {totalChunks} fragmentos
                  </Typography>
                )}
                <Chip label={`${pct}%`} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Box>
            </Box>
            <LinearProgress
              variant={totalChunks > 0 ? 'determinate' : 'indeterminate'}
              value={pct}
              sx={{ borderRadius: 1, height: 6 }}
            />
          </>
        )}

        {status === 'done' && (
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleRounded sx={{ fontSize: 16, color: '#2e7d32' }} />
            <Typography variant="caption" fontWeight={600} color="success.main">
              Indexado — {indexedChunks} fragmentos
            </Typography>
            {processedFiles.map((f) => (
              <Chip key={f} label={f} size="small" sx={{ fontSize: 10, height: 18 }} />
            ))}
          </Box>
        )}

        {status === 'error' && (
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorRounded sx={{ fontSize: 16, color: '#c62828' }} />
            <Typography variant="caption" color="error.main">{error}</Typography>
          </Box>
        )}

        {status === 'idle' && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">Preparando…</Typography>
          </Box>
        )}
      </Box>

      {/* ── Main body ────────────────────────────────────────────────── */}
      {status === 'error' ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2} sx={{ flex: 1 }}>
          <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
          <Button variant="outlined" onClick={onBack}>Volver e intentar con otro archivo</Button>
        </Box>
      ) : (
        <Box display="flex" sx={{ flex: 1, overflow: 'hidden' }}>
          {/* PDF */}
          <Box sx={{ flex: 1, overflow: 'hidden', borderRight: '1px solid #e0e0e0' }}>
            {pdfUrl && <PDFViewerComponent pdfUrl={pdfUrl} />}
          </Box>

          {/* Taxonomía en vivo (aparece desde inicio con file.name) */}
          {effectiveSource ? (
            <Box sx={{ width: 320, overflow: 'hidden', flexShrink: 0 }}>
              <TaxonomyPanel
                source={effectiveSource}
                selectedArticles={[]}
                editedArticles={{}}
                onToggleArticle={() => {}}
                onToggleParagraph={() => {}}
                onOpenArticle={() => {}}
                readOnly
                pollInterval={status === 'done' ? 0 : TAXONOMY_POLL_MS}
                allowPartial
              />
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={2}
              sx={{ width: 280, px: 3, flexShrink: 0 }}
            >
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Procesando documento…
              </Typography>
              <Typography variant="caption" color="text.disabled" textAlign="center">
                Los artículos aparecerán aquí a medida que se indexan
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default IndexingState;
