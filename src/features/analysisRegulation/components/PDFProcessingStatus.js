import { Box, Typography, CircularProgress } from '@mui/material';
import { AttachFileRounded } from '@mui/icons-material';

const PDFProcessingStatus = ({ 
  selectedFile, 
  loadingPDF, 
  progressPDF, 
  processingStatusPDF,
  pdfDataError,
  resultFilesPDF,
  onSend
}) => {
  return (
    <>
      {selectedFile && (
        <div style={{ 
          marginBottom: '10px', 
          padding: '8px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AttachFileRounded fontSize="small" />
          <span style={{ fontSize: '14px', color: '#333' }}>
            {selectedFile.name}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
      )}

      {loadingPDF && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '5px',
            height: '30px',
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPDF}%`,
              backgroundColor: progressPDF === 100 ? '#4caf50' : '#2196f3',
              height: '100%',
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }} />
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold'
            }}>
              {progressPDF}%
            </span>
          </div>
          <p style={{ marginTop: '10px', textAlign: 'center' }}>
            Estado: {processingStatusPDF || 'Iniciando...'}
          </p>
        </div>
      )}

      {pdfDataError && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error al procesar el archivo. Por favor, intente nuevamente.
        </div>
      )}

      {resultFilesPDF.length > 0 && !loadingPDF && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32', fontSize: '16px' }}>
            ✅ Archivo procesado exitosamente:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {resultFilesPDF.map((file, index) => (
              <li key={index} style={{ color: '#1b5e20' }}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default PDFProcessingStatus;
