import React from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FiveWhysDrawer = ({ open, finding, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 520,
          maxWidth: '90vw',
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={600}>Análisis de 5 porqués</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || 'Sin fuente'} - ID: {finding?.id}
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          Análisis de 5 porqués en desarrollo...
        </Typography>
      </Box>
    </Drawer>
  );
};

export default FiveWhysDrawer;
