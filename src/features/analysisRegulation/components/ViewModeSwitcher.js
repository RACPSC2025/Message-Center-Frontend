import { Box, Button, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { PictureAsPdfRounded, UploadFileRounded, SettingsRounded } from '@mui/icons-material';
import { useRef, useState } from 'react';
import { ingestPDF } from '../../../lib/iaApi';

const ViewModeSwitcher = ({ viewMode, onViewModeChange, pdfAvailable, onUploadPdf, toolbarVisible, onToggleToolbar }) => {
  const fileInputRef = useRef(null);
  const [ingestStatus,  setIngestStatus]  = useState('idle'); // idle | loading | done | error
  const [ingestInfo,    setIngestInfo]    = useState(null);
  const [ingestSeconds, setIngestSeconds] = useState(null);
  const [showIngestTime] = useState(true);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    if (onUploadPdf) onUploadPdf(file);

    setIngestStatus('loading');
    setIngestInfo(null);
    setIngestSeconds(null);

    const start = performance.now();
    try {
      const result = await ingestPDF(file);
      const elapsed = (performance.now() - start) / 1000;
      setIngestStatus('done');
      setIngestInfo(result);
      setIngestSeconds(elapsed);
    } catch {
      const elapsed = (performance.now() - start) / 1000;
      setIngestStatus('error');
      setIngestSeconds(elapsed);
    }

    event.target.value = '';
  };
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 0,
        borderBottom: '2px solid #e0e0e0',
        pb: 0,
        alignItems: 'center'
      }}
    >
      <Button
        variant={viewMode === 'pdf' ? 'contained' : 'outlined'}
        onClick={() => onViewModeChange('pdf')}
        startIcon={<PictureAsPdfRounded />}
        disabled={!pdfAvailable}
        sx={{
          textTransform: 'none',
          minWidth: '120px'
        }}
      >
        PDF Original
      </Button>
      <Button
        variant="outlined"
        onClick={() => fileInputRef.current?.click()}
        disabled={ingestStatus === 'loading'}
        startIcon={
          ingestStatus === 'loading'
            ? <CircularProgress size={14} />
            : <UploadFileRounded />
        }
        sx={{
          textTransform: 'none',
          minWidth: '120px',
          marginLeft: 'auto'
        }}
      >
        {ingestStatus === 'loading' ? 'Indexando...' : 'Cargar PDF'}
      </Button>
      {ingestStatus === 'done' && (
        <Chip
          label={`${ingestInfo?.indexed_chunks} chunks`}
          color="success"
          size="small"
        />
      )}
      {ingestStatus === 'error' && (
        <Chip label="Error al indexar" color="error" size="small" />
      )}
      {showIngestTime && ingestSeconds != null && (
        <Tooltip title="Tiempo de respuesta del endpoint /v1/documents/ingest">
          <Chip
            label={`${ingestSeconds.toFixed(2)} s`}
            color={ingestStatus === 'error' ? 'default' : 'info'}
            variant="outlined"
            size="small"
          />
        </Tooltip>
      )}
      {viewMode === 'pdf' && pdfAvailable && onToggleToolbar && (
        <Tooltip title={toolbarVisible ? "Ocultar herramientas" : "Mostrar herramientas"}>
          <IconButton
            onClick={onToggleToolbar}
            sx={{
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: toolbarVisible ? 'primary.main' : 'grey.400',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <SettingsRounded color={toolbarVisible ? 'primary' : 'action'} />
          </IconButton>
        </Tooltip>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default ViewModeSwitcher;
