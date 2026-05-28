import { useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Alert, Button } from '@mui/material';
import { CheckCircleRounded, ErrorRounded } from '@mui/icons-material';
import PDFViewerComponent from '../../../../components/Input/lexicalWYSWYG/PDFViewerComponent';
import { useIngest } from '../../hooks/useIngest';

const IndexingState = ({ file, pdfUrl, docType, onIndexingComplete, onBack }) => {
  const { status, indexedChunks, processedFiles, error } = useIngest(file, docType);

  useEffect(() => {
    if (status === 'done' && onIndexingComplete) {
      onIndexingComplete({ processedFiles, indexedChunks });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Box display="flex" sx={{ height: '100%', overflow: 'hidden' }}>
      {/* Left: PDF preview */}
      <Box sx={{ flex: 1, overflow: 'hidden', borderRight: '1px solid #e0e0e0' }}>
        {pdfUrl && <PDFViewerComponent pdfUrl={pdfUrl} />}
      </Box>

      {/* Right: indexing status */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={3}
        sx={{ width: 300, px: 3, flexShrink: 0 }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress size={48} />
            <Typography variant="body1" fontWeight={600} textAlign="center">
              Indexando documento...
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              El microservicio IA está procesando el PDF. Esto puede tardar unos segundos.
            </Typography>
          </>
        )}

        {status === 'done' && (
          <>
            <CheckCircleRounded sx={{ fontSize: 56, color: '#2e7d32' }} />
            <Typography variant="body1" fontWeight={600} color="success.main" textAlign="center">
              Documento indexado correctamente
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
              <Chip
                label={`${indexedChunks} fragmentos indexados`}
                color="success"
                variant="outlined"
                size="small"
              />
              {processedFiles.map((f) => (
                <Chip key={f} label={f} size="small" />
              ))}
            </Box>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorRounded sx={{ fontSize: 56, color: '#c62828' }} />
            <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            <Button variant="outlined" onClick={onBack}>
              Volver e intentar con otro archivo
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default IndexingState;
