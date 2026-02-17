import { Box, Typography } from '@mui/material';

const ProcessingProgressBar = ({ progress, loading }) => {
  if (!loading && progress.current === 0) return null;

  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  const isComplete = progress.current === progress.total && progress.total > 0;

  return (
    <Box 
      sx={{
        p: 2,
        backgroundColor: isComplete ? '#f0fdf4' : '#f0f9ff',
        border: `1px solid ${isComplete ? '#86efac' : '#bae6fd'}`,
        borderRadius: 2,
        mb: 2
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight="medium">
          {loading ? '⏳ Procesando contenido...' : '✅ Procesamiento completado'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {progress.current}/{progress.total} bloques
        </Typography>
      </Box>

      <Box 
        sx={{
          width: '100%',
          height: 8,
          backgroundColor: '#e0f2fe',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 1
        }}
      >
        <Box 
          sx={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: isComplete ? '#22c55e' : '#0ea5e9',
            transition: 'width 0.3s ease, background-color 0.3s ease'
          }} 
        />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {percentage}% completado
        </Typography>
        
        {loading && (
          <Typography variant="caption" color="text.secondary">
            Máx. 5 bloques simultáneos
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProcessingProgressBar;
