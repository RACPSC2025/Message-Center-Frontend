import React from 'react';
import { Box, Typography } from '@mui/material';

const FindingsHowToView = () => {
  return (
    <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 1 }}>
      <Typography variant="h6">¿Cómo puedo?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Guía de uso en desarrollo...
      </Typography>
    </Box>
  );
};

export default FindingsHowToView;
