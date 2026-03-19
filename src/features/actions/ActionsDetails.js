import { Alert, Box, Button, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTab from '../../components/BaseTab';
import FormBuilder from '../../components/FormBuilder';
import TextFieldWithActions from './TextFieldWithActions';

export default function ActionsDetails({
  isFetching,
  formFields,
  formTabItems: tabItems,
  formModel,
  onUpdateModel,
  onSubmit,
  onCancel,
  showBorderRadius = true
}) {
  const [activeTab, setActiveTab] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const [firstItem] = tabItems;
    if (firstItem) {
      setActiveTab(firstItem.key);
    }
  }, [tabItems]);

  // IDs de los campos que deben usar TextFieldWithActions
  const ENHANCED_FIELDS = [
    'description_fuente',
    'cause_description',
    'what_description',
    'how_description',
    'sourceDescription', 
    'immediateActions',
    'action',
    'executionSuggestion'
  ];

  const tabSpecificInputFields = useMemo(() => {
    const inputFieldsMapping = formFields[activeTab] || {};

    if (Object.keys(inputFieldsMapping).length) {
      return Object.keys(inputFieldsMapping).map((fieldKey) => {
        const field = inputFieldsMapping[fieldKey];
        const { name: id, ...rest } = field;
        return { id, ...rest };
      });
    }
    return [];
  }, [formFields, activeTab]);

  const containerProps = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    ...(showBorderRadius && { borderRadius: '0px' })
  };

  const vertical = 'bottom';
  const horizontal = 'left';

  const showAlert = () => {
    setOpenAlert(true);
  };

  const hideAlert = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  if (!activeTab) return null;

  return (
    <>
      {/* Contenedor principal del formulario de detalles */}
      <Box sx={containerProps}>
        {/* Navegación por pestañas del formulario */}
        <BaseTab
          items={tabItems}
          activeTab={activeTab}
          tabContainerProps={{
            sx: {
              flexShrink: 0
            },
            variant: 'fullWidth',
            onChange: (_, value) => setActiveTab(value)
          }}
          valueKey="key"
        />
        
        {/* Área de contenido del formulario con scroll */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 1, mt: 2 }}>
          {isFetching ? (
            <Box>{t('loading')}</Box>
          ) : (
            /* Constructor dinámico del formulario */
            <FormBuilder
              inputFields={tabSpecificInputFields}  // Campos configurados para la pestaña actual
              initialValues={formModel}              // Valores actuales del formulario
              showActionButton={false}               // No mostrar botón por defecto
              controlled={true}                       // Modo controlado
              onChange={onUpdateModel}                 // Manejador de cambios
              enhancedFields={ENHANCED_FIELDS}         // Campos con funcionalidad IA
              EnhancedFieldComponent={TextFieldWithActions} // Componente mejorado para campos específicos
            />
          )}
        </Box>
        
        {/* Botones de acción del formulario */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderTop: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            sx={{ mx: 1 }}
            onClick={() => {
              onSubmit(showAlert);  // Ejecuta callback de submit y muestra alerta
            }}
          >
            {t('Save')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            sx={{ mx: 1 }}
            onClick={onCancel}
          >
            {t('Cancel')}
          </Button>
        </Box>
      </Box>
      
      {/* Notificación de éxito al guardar */}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openAlert}
        autoHideDuration={6000}
        onClose={hideAlert}
      >
        <Alert onClose={hideAlert} severity="success" sx={{ width: '100%' }}>
          {t('FormSavedMessage')}
        </Alert>
      </Snackbar>
    </>
  );
}