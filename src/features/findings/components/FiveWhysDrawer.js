import { useState } from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormBuilder from '../../../components/FormBuilder';

const initialFormValues = {
  why1: '',
  why2: '',
  why3: '',
  why4: '',
  why5: '',
  attachment: null
};

const FiveWhysDrawer = ({ open, finding, onClose }) => {
  const [formValues, setFormValues] = useState(initialFormValues);

  const handleChange = (id, value) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => setFormValues(initialFormValues);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    console.log('Five Whys submitted:', formValues);
    handleClose();
  };

  const formFields = [
    { id: 'why1', label: 'Porqué 1', type: 'text', required: true, gridSize: 12 },
    { id: 'why2', label: 'Porqué 2', type: 'text', required: true, gridSize: 12 },
    { id: 'why3', label: 'Porqué 3', type: 'text', required: true, gridSize: 12 },
    { id: 'why4', label: 'Porqué 4', type: 'text', required: true, gridSize: 12 },
    { id: 'why5', label: 'Porqué 5', type: 'text', required: true, gridSize: 12 },
    { id: 'attachment', label: 'Adjunto', type: 'file', gridSize: 12 }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 520,
          maxWidth: '90vw',
          boxSizing: 'border-box'
        }
      }}
    >
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
          Análisis de 5 porqués
        </Typography>

        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Fuente */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || 'Sin fuente'} - ID: {finding?.id}
        </Typography>
      </Box>

      {/* Formulario */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
        <FormBuilder
          inputFields={formFields}
          initialValues={formValues}
          controlled={true}
          onChange={handleChange}
          successCallback={handleSubmit}
          cancelCallback={handleClose}
          formFieldSize="small"
        />
      </Box>
    </Drawer>
  );
};

export default FiveWhysDrawer;
