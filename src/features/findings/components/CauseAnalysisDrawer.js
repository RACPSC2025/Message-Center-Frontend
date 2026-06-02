import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import FormBuilder from '../../../components/FormBuilder';
import UnsavedChangesDialog from '../../../components/UnsavedChangesDialog';
import useUnsavedChangesDrawer from '../hooks/useUnsavedChangesDrawer';

const CauseAnalysisDrawer = ({ open, finding, onClose }) => {
  const { t } = useTranslation();

  const {
    formValues,
    showConfirm,
    handleChange,
    handleClose,
    confirmClose,
    cancelClose,
    resetForm
  } = useUnsavedChangesDrawer({ initialValues: {}, onClose });

  const formFields = [
    { id: 'observaciones', label: t('observations'), type: 'textarea', gridSize: 12 },
    { id: 'adjunto', label: t('attachment'), type: 'file', gridSize: 12 }
  ];

  const handleSubmit = () => {
    console.log('[DEBUG] Análisis de Causas:', { ...formValues, findingId: finding?.id });
    resetForm();
    onClose();
  };

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
      {/* Título */}
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
          {t('cause_analysis_title')}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Fuente / Sin fuente */}
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

      {/* Diálogo de confirmación */}
      <UnsavedChangesDialog
        open={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </Drawer>
  );
};

export default CauseAnalysisDrawer;
