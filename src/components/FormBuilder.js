import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Button, Box, Grid, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormControlLabel from '@mui/material/FormControlLabel';

// Lazy load the Input component
const InputTextField = lazy(() => import('./Input/InputTextField'));
const InputTextAreaField = lazy(() => import('./Input/InputTextAreaField'));
const InputSelectField = lazy(() => import('./Input/InputSelectField'));
const InputRadioGroup = lazy(() => import('./Input/InputRadioGroup'));
const InputDateField = lazy(() => import('./Input/InputDateField'));
const InputSignatureField = lazy(() => import('./Input/InputSignatureField'));
const InputAutoComplete = lazy(() => import('./Input/InputAutoComplete'));
const FilePickerComponent = lazy(() => import('./Input/FilePickerComponent'));
const InputSwitch = lazy(() => import('./Input/InputSwitch'));
const InputCheckbox = lazy(() => import('./Input/InputCheckbox'));
const InputProgressSlider = lazy(() => import('./Input/InputProgressSlider'));

const fieldComponents = {
  text: InputTextField,
  textarea: InputTextAreaField,
  dropdown: InputSelectField,
  radio: InputRadioGroup,
  datetime: InputDateField,
  date: InputDateField,
  signature: InputSignatureField,
  autocomplete: InputAutoComplete,
  file: FilePickerComponent,
  switch: InputSwitch,
  checkbox: InputCheckbox,
  progress: InputProgressSlider 
};

const FormBuilder = ({
  inputFields = [],
  initialValues = [],
  successCallback = () => {},
  cancelCallback = () => {},
  showActionButton = true,
  controlled = false,
  formFieldSize = 'small',
  formDisplay = 'grid',
  onChange = () => {},
  isLoading = false,
  // Nuevos props para campos mejorados
  enhancedFields = [], // Array o Set de IDs que deben usar componente mejorado
  EnhancedFieldComponent = null, // Componente personalizado para campos mejorados
  externalErrors = {} // Errores de validación externos
}) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  const { t } = useTranslation();

  // Convertir enhancedFields a Set para búsqueda rápida
  const enhancedFieldsSet = React.useMemo(() => {
    return Array.isArray(enhancedFields) ? new Set(enhancedFields) : enhancedFields;
  }, [enhancedFields]);

  useEffect(() => {
    if (initialValues && !controlled) {
      setFormValues(initialValues);
    }
  }, [initialValues, controlled]);

  const validateField = (field, value) => {
    if (!field) return true;

    if (field.required && !value && value !== 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field.id]: t('field_is_required')
      }));
      return false;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field.id]: null
      }));
      return true;
    }
  };

  const handleChange = (id, value) => {
    const field = inputFields.find((f) => f.id === id);
    validateField(field, value);
    if (controlled) onChange(id, value);
    else {
      const newFormValues = {
        ...formValues,
        [id]: value
      };

      setFormValues(newFormValues);
      onChange(newFormValues);
    }
  };

  const handleSubmit = () => {
    let isValid = true;
    inputFields.forEach((field) => {
      const value = getFieldValue(field);
      if (!validateField(field, value)) {
        isValid = false;
      }
    });
    if (isValid) {
      successCallback(formValues, resetFormFields);
    }
  };

  const handleCancel = () => {
    resetFormFields();
    cancelCallback();
  };

  const getFieldValue = (field) =>
    (controlled ? initialValues[field.id] : formValues[field.id]) || defaultFieldValue(field.type);

  const defaultFieldValue = (fieldType) => {
    let defaultValue = '';
    switch (fieldType) {
      case 'autocomplete':
      case 'date':
      case 'datetime':
        defaultValue = null;
        break;
      default:
    }
    return defaultValue;
  };

  const resetFormFields = () => {
    let formValues = {};
    let errors = {};
    if (!controlled) {
      inputFields.forEach((field) => {
        const value = defaultFieldValue(field);
        formValues[field.id] = value;
        errors[field.id] = null;
      });
    }
    setFormValues(formValues);
    setErrors(errors);
    return true;
  };

  // Función para renderizar un campo individual
  const renderField = (field) => {
    // Verificar si este campo debe usar el componente mejorado
    const isEnhanced = enhancedFieldsSet.has(field.id);
    
    // Combinar errores internos con errores externos
    const fieldError = errors[field.id] || externalErrors[field.id] || field.error;
    
    if (isEnhanced && EnhancedFieldComponent) {
      // Usar componente mejorado
      return (
        <Suspense fallback={<div>{t('loading')}</div>} key={field.id}>
          <EnhancedFieldComponent
            label={field.label || field.id}
            value={getFieldValue(field)}
            onChange={(value) => handleChange(field.id, value)}
            disabled={field.disabled}
            required={field.required || false}
            placeholder={field.placeholder || ''}
            error={fieldError}
          />
        </Suspense>
      );
    }

    // Usar componente normal según el tipo
    const FieldComponent = fieldComponents[field.type];
    
    if (!FieldComponent) return null;

    return (
      <Suspense fallback={<div>{t('loading')}</div>} key={field.id}>
        {field.type === 'switch' || field.type === 'checkbox' ? (
          <FormControlLabel
            control={
              <FieldComponent
                field={field}
                value={field.type === 'checkbox' ? getFieldValue(field) : Boolean(getFieldValue(field))}
                size={formFieldSize}
                error={fieldError}
                onChange={handleChange}
                disabled={field.disabled}
              />
            }
            label={field.label}
            sx={{ whiteSpace: 'nowrap' }}
          />
        ) : (
          <FieldComponent
            field={field}
            value={getFieldValue(field)}
            size={formFieldSize}
            error={fieldError}
            onChange={handleChange}
            disabled={field.disabled}
          />
        )}
      </Suspense>
    );
  };

  return (
    <Box component="form">
      {formDisplay === 'grid' ? (
        <Grid container spacing={3}>
          {inputFields.map((field) => (
            <Grid item xs={parseInt(field.gridSize) || 12} key={field.id}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box display="flex" gap={2} flexGrow={1} justifyContent="start">
          {inputFields.map((field) => (
            <Grid item xs={parseInt(field.gridSize) || 12} key={field.id}>
              {renderField(field)}
            </Grid>
          ))}
        </Box>
      )}
      {showActionButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
          <Button variant="contained" color="inherit" sx={{ mr: 1 }} onClick={handleCancel}>
            {t('Cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> : null}
            {t('Save')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FormBuilder;