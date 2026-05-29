import React from 'react';
import { Box, Typography } from '@mui/material';

const FindingsReportView = () => {
  return (
    <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 1 }}>
      <Typography variant="h6">Reporte de Hallazgos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Vista de reporte en desarrollo...
      </Typography>
    </Box>
  );
};

export default FindingsReportView;
