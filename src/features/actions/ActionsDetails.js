import { Alert, Box, Button, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BaseTab from '../../components/BaseTab';
import FormBuilder from '../../components/FormBuilder';
import TextFieldWithActions from './TextFieldWithActions';
import { isFieldRequired } from '../../config/validationConfig';

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
  const [validationErrors, setValidationErrors] = useState({});
  const { t } = useTranslation();

  // Estados para detectar cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormModel, setInitialFormModel] = useState({});
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const [firstItem] = tabItems;
    if (firstItem) {
      setActiveTab(firstItem.key);
    }
  }, [tabItems]);

  // Guardar estado inicial del formulario
  useEffect(() => {
    if (isInitialLoad.current && Object.keys(formModel).length > 0) {
      setInitialFormModel(JSON.parse(JSON.stringify(formModel)));
      isInitialLoad.current = false;
    }
  }, []);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!isInitialLoad.current && Object.keys(initialFormModel).length > 0) {
      const hasChanges = !deepEqual(initialFormModel, formModel);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formModel, initialFormModel]);

  // Función para comparar objetos profundamente (ignorando valores vacíos y por defecto)
  const deepEqual = (obj1, obj2) => {
    // Función para verificar si un valor es "significativo" (no vacío)
    const isSignificantValue = (value) => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      return true;
    };

    // Si ambos objetos son iguales por referencia
    if (obj1 === obj2) return true;
    
    // Si alguno es nulo
    if (obj1 == null || obj2 == null) return false;
    
    // Si tienen tipos diferentes
    if (typeof obj1 !== typeof obj2) return false;

    // Si no son objetos
    if (typeof obj1 !== 'object') {
      // Normalizar valores vacíos
      const norm1 = isSignificantValue(obj1) ? obj1 : null;
      const norm2 = isSignificantValue(obj2) ? obj2 : null;
      return norm1 === norm2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      
      const val1 = obj1[key];
      const val2 = obj2[key];
      
      // Si ambos valores no son significativos, considerarlos iguales
      if (!isSignificantValue(val1) && !isSignificantValue(val2)) {
        continue;
      }
      
      // Si uno es significativo y el otro no, hay diferencia
      if (!isSignificantValue(val1) || !isSignificantValue(val2)) {
        return false;
      }
      
      // Comparación recursiva para valores significativos
      if (!deepEqual(val1, val2)) {
        return false;
      }
    }

    return true;
  };

  // Función de validación completa para todos los campos de todas las pestañas
  const validateAllFields = () => {
    const errors = {};
    let isValid = true;

    // Iterar sobre todas las pestañas y sus campos
    Object.keys(formFields).forEach(tabKey => {
      const tabFields = formFields[tabKey];
      
      Object.keys(tabFields).forEach(fieldKey => {
        const field = tabFields[fieldKey];
        const fieldValue = formModel[field.name];
        
        // Validar campos requeridos usando configuración centralizada
        const isRequired = isFieldRequired(field.name);
        
        if (isRequired && (!fieldValue || fieldValue === '' || fieldValue === null)) {
          errors[field.name] = `${field.label} es obligatorio`;
          isValid = false;
        }
        
        // Validación específica para diferentes tipos de campos
        if (fieldValue && fieldValue !== '') {
          // Validación para campos de tipo fecha
          if (field.type === 'date' || field.type === 'datetime') {
            const dateValue = new Date(fieldValue);
            if (isNaN(dateValue.getTime())) {
              errors[field.name] = `${field.label} debe ser una fecha válida`;
              isValid = false;
            }
          }
          
          // Validación para campos autocomplete/dropdown
          if ((field.type === 'autocomplete' || field.type === 'dropdown') && 
              typeof fieldValue === 'string' && fieldValue.trim() === '') {
            errors[field.name] = `${field.label} requiere una selección válida`;
            isValid = false;
          }
        }
      });
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Función para obtener el primer campo con error y cambiar a esa pestaña
  const navigateToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Encontrar en qué pestaña está el campo con error
      Object.keys(formFields).forEach(tabKey => {
        const tabFields = formFields[tabKey];
        if (Object.keys(tabFields).includes(firstErrorField)) {
          setActiveTab(tabKey);
          return;
        }
      });
    }
  };

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

  const showErrorAlert = (message) => {
    // Creamos un estado temporal para mostrar errores de validación
    setValidationErrors(prev => ({ ...prev, _formError: message }));
    setTimeout(() => {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors._formError;
        return newErrors;
      });
    }, 5000);
  };

  const hideAlert = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  // Manejador de submit con validación completa
  const handleSubmit = () => {
    const isValid = validateAllFields();
    
    if (isValid) {
      onSubmit(showAlert);
    } else {
      // Navegar a la primera pestaña con error
      navigateToFirstError(validationErrors);
      
      // Mostrar mensaje de error general
      const errorCount = Object.keys(validationErrors).length;
      showErrorAlert(`Por favor complete los ${errorCount} campos obligatorios antes de guardar.`);
    }
  };

  // Manejador de cancelación con detección de cambios
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // Pasar true indicando que hay cambios sin guardar
      onCancel(true);
    } else {
      // Pasar false (por defecto) si no hay cambios
      onCancel(false);
    }
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
              externalErrors={validationErrors}        // Errores de validación externos
            />
          )}
        </Box>
        
        {/* Botones de acción del formulario */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderTop: 1 }}>
          {/* Mostrar botón Guardar solo en el último tab */}
          {activeTab === tabItems[tabItems.length - 1]?.key && (
            <Button
              variant="contained"
              size="small"
              color="primary"
              sx={{ mx: 1 }}
              onClick={handleSubmit}
            >
              {t('Save')}
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            sx={{ mx: 1 }}
            onClick={handleCancel}
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
      
      {/* Notificación de error de validación */}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={!!validationErrors._formError}
        autoHideDuration={5000}
        onClose={() => setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors._formError;
          return newErrors;
        })}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {validationErrors._formError}
        </Alert>
      </Snackbar>
    </>
  );
}