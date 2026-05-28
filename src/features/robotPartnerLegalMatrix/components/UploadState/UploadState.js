import { useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { UploadFileRounded } from '@mui/icons-material';

const UploadState = ({ onFileSelected }) => {
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type === 'application/pdf') onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100%', px: 4 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={{
          border: '2px dashed #b0bec5',
          borderRadius: 3,
          px: 6,
          py: 8,
          width: '100%',
          maxWidth: 480,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: '#1565c0' },
        }}
        onClick={() => inputRef.current?.click()}
      >
        <UploadFileRounded sx={{ fontSize: 64, color: '#90a4ae' }} />
        <Typography variant="h6" color="text.secondary" textAlign="center">
          Arrastra un PDF o haz clic para cargar
        </Typography>
        <Typography variant="body2" color="text.disabled" textAlign="center">
          Solo archivos .pdf — el documento será indexado para análisis legal
        </Typography>
        <Button
          variant="contained"
          size="medium"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Seleccionar PDF
        </Button>
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  );
};

export default UploadState;
