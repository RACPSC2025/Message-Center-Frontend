import React, { useState } from 'react';
import { Drawer, Box, IconButton, Typography, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FollowUpDrawer = ({ open, finding, onClose }) => {
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
          width: 600,
          maxWidth: '95vw',
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={600}>Seguimientos</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || 'Sin fuente'} - ID: {finding?.id}
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Seguimientos" />
          <Tab label="Cierre del hallazgo" />
        </Tabs>
      </Box>
      <Box sx={{ p: 2.5 }}>
        {activeTab === 0 && (
          <Typography variant="body2" color="text.secondary">
            Seguimientos en desarrollo...
          </Typography>
        )}
        {activeTab === 1 && (
          <Typography variant="body2" color="text.secondary">
            Cierre del hallazgo en desarrollo...
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default FollowUpDrawer;
