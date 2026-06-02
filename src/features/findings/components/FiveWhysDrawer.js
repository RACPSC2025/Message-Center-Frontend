import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import FormBuilder from '../../../components/FormBuilder';
import UnsavedChangesDialog from '../../../components/UnsavedChangesDialog';
import useUnsavedChangesDrawer from '../hooks/useUnsavedChangesDrawer';

const initialFormValues = {
  why1: '',
  why2: '',
  why3: '',
  why4: '',
  why5: '',
  attachment: null
};

const FiveWhysDrawer = ({ open, finding, onClose }) => {
  const { t } = useTranslation();
  const {
    formValues,
    showConfirm,
    handleChange,
    handleClose,
    confirmClose,
    cancelClose,
    resetForm
  } = useUnsavedChangesDrawer({ initialValues: initialFormValues, onClose });

  const handleSubmit = () => {
    console.log('[DEBUG] Enviando 5 porqués:', formValues);
    resetForm();
    onClose();
  };

  const formFields = [
    { id: 'why1', label: t('why1'), type: 'text', required: true, gridSize: 12 },
    { id: 'why2', label: t('why2'), type: 'text', required: true, gridSize: 12 },
    { id: 'why3', label: t('why3'), type: 'text', required: true, gridSize: 12 },
    { id: 'why4', label: t('why4'), type: 'text', required: true, gridSize: 12 },
    { id: 'why5', label: t('why5'), type: 'text', required: true, gridSize: 12 },
    { id: 'attachment', label: t('attachment'), type: 'file', gridSize: 12 }
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
        {/* Análisis de 5 porqués */}
        <Typography variant="h6" fontWeight={600}>
          {t('five_whys_title')}
        </Typography>

        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Fuente */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || t('Nosource')} - ID: {finding?.id}
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

      {/* Dialogo de Guardar Cambios */}
      <UnsavedChangesDialog
        open={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </Drawer>
  );
};

export default FiveWhysDrawer;
