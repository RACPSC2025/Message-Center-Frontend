import React, { useState } from 'react';
import { Drawer, Box, IconButton, Typography, Divider, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FindingDetailDrawer = ({ open, finding, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {finding?.titulo || 'Detalle del hallazgo'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Detalles del Hallazgo" />
          <Tab label="Análisis de 5 porqués" />
          <Tab label="Análisis de Causas" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 2.5 }}>
        {activeTab === 0 && (
          <Typography variant="body2" color="text.secondary">
            Detalles del hallazgo en desarrollo...
          </Typography>
        )}
        {activeTab === 1 && (
          <Typography variant="body2" color="text.secondary">
            Análisis de 5 porqués en desarrollo...
          </Typography>
        )}
        {activeTab === 2 && (
          <Typography variant="body2" color="text.secondary">
            Análisis de Causas en desarrollo...
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default FindingDetailDrawer;
