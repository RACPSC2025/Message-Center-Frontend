import { Autocomplete, CircularProgress, TextField, Paper, MenuItem, List, ListItem, IconButton } from '@mui/material';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import Clear from '@mui/icons-material/Clear';

import { isEmpty, isEqual, isObject, isString } from 'radash';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../lib/axios';
import BaseFormControl from '../BaseFormControl';

const InputAutoComplete = ({ 
  field, 
  value, 
  onChange, 
  error, 
  size = 'small', 
  minSearchLength = 0, 
  useCustomDropdown = false, 
  ...rest 
}) => {
  
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const prevApiDetailsRef = useRef();

  const fieldID = `${field.id}-select`;

  const checkAPICallRequirements = (api_details) => {
    const isValidAPIURLAvailable = isObject(api_details) && typeof api_details.api_url === 'string';
    if (isValidAPIURLAvailable && !Object.prototype.hasOwnProperty.call(api_details, 'param_key')) {
      return true;
    }

    const isValidAPIParamAvailable =
      isObject(api_details) &&
      typeof api_details.param_key === 'string' &&
      typeof api_details.param_value === 'string';

    return isValidAPIURLAvailable && isValidAPIParamAvailable;
  };

  const getOptionsList = async (apiDetails) => {
    try {
      setLoading(true);
      const { api_url, param_key, param_value } = apiDetails;

      const formData = new FormData();
      if (param_key && param_value) formData.append(param_key, param_value);

      const response = await axiosInstance.post(api_url, formData);
      if (!(isEmpty(options) && isEmpty(response.data.data))) setOptions(response.data.data);
    } catch (error) {
      console.error('[Error] fetching options from API', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomInputChange = (event) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);
    
    if (newInputValue.length >= minSearchLength) {
      setShowDropdown(true);
    } else if (minSearchLength === 0) {
      setShowDropdown(true); // Siempre mostrar dropdown cuando minSearchLength es 0
    } else {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange(field.id, '');
    setShowDropdown(false);
  };

  const handleDropdownToggle = () => {
    if (minSearchLength === 0) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleCustomSelect = (option) => {
    const selectedValue = option.value || option;
    onChange(field.id, selectedValue);
    setInputValue(t(option.label || option));
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (inputValue.length >= minSearchLength || minSearchLength === 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleChangeSelection = (e, newValue) => {
    if (Object.prototype.isPrototypeOf(newValue)) onChange(field.id, newValue.value);
    else onChange(field.id, newValue);
  };

  const isOptionItemTypeObject = useMemo(() => {
    if (options.length > 0) {
      return options.some((opt) => isObject(opt));
    }
    return false;
  }, [options]);

  const internalValue = useMemo(() => {
    if (isOptionItemTypeObject && isString(value)) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (typeof selectedOption === 'undefined') return null;
      else return selectedOption;
    }
    return value;
  }, [value, options, isOptionItemTypeObject]);

  const filteredOptions = useMemo(() => {
    if (minSearchLength > 0 && inputValue.length < minSearchLength) return [];
    
    if (minSearchLength === 0 || inputValue.length >= minSearchLength) {
      return options.filter(option => {
        const label = t(option.label || option).toLowerCase();
        return label.includes(inputValue.toLowerCase());
      });
    }
    
    return options;
  }, [options, inputValue, minSearchLength]);

  useEffect(() => {
    let active = true;
    const shouldFetch = ((useCustomDropdown && showDropdown) || (!useCustomDropdown && (open || value))) && options.length === 0;

    if (!shouldFetch) return undefined;

    const { api_details = {}, options: fieldOptions = [] } = field;
    const shouldFetchOptionsFromAPI = checkAPICallRequirements(api_details);

    if (active) {
      if (shouldFetchOptionsFromAPI) {
        // Fetch options from API, optionally pass the current value
        getOptionsList(api_details);
      } else if (fieldOptions.length) {
        setOptions(fieldOptions);
      }
    }

    return () => {
      active = false;
    };
  }, [open, showDropdown, value, options, useCustomDropdown]);

  useEffect(() => {
    const currentApiDetails = field.api_details;
    const prevApiDetails = prevApiDetailsRef.current;
    if (isObject(currentApiDetails) && !isObject(prevApiDetails)) {
      // Update the ref to the current value
      prevApiDetailsRef.current = currentApiDetails;
    } else if (
      isObject(currentApiDetails) &&
      isObject(prevApiDetails) &&
      !isEqual(currentApiDetails, prevApiDetails)
    ) {
      // Update the ref to the current value
      prevApiDetailsRef.current = currentApiDetails;
      //clear the options
      setOptions([]);
    }
  }, [field.api_details]);

  useEffect(() => {
    if (!open && checkAPICallRequirements(field.api_details)) {
      setOptions([]);
    }
  }, [open, field.api_details]);

  // Efecto para sincronizar inputValue cuando la prop value cambia (especialmente cuando se limpian filtros)
  useEffect(() => {
    // Evitar ejecutar en el primer render para no interferir con la carga inicial
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    // Solo sincronizar si el dropdown NO está abierto para evitar cerrarlo inesperadamente
    if (showDropdown) return;

    if (value === null || value === undefined || value === '') {
      setInputValue('');
      setShowDropdown(false);
    } else if (isString(value)) {
      // Si el value es un string, buscar en options y actualizar inputValue
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) {
        setInputValue(t(selectedOption.label));
      } else {
        setInputValue(value);
      }
    } else if (isObject(value) && value.label) {
      // Si el value es un objeto con label
      setInputValue(t(value.label));
    }
  }, [value, options, isString, isObject, t, isInitialRender, showDropdown]);

  const isEnabled = useMemo(() => {
    const { api_details = {}, options: fieldOptions } = field;
    return fieldOptions.length > 0 || checkAPICallRequirements(api_details);
  }, [field]);

  // Renderizar dropdown personalizado si useCustomDropdown es true
  if (useCustomDropdown) {
    return (
      <BaseFormControl field={field} value={value} error={error} {...rest}>
        <div style={{ position: 'relative' }}>
          <TextField
            id={fieldID}
            disabled={!isEnabled}
            size={size}
            value={inputValue}
            onChange={handleCustomInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            label={t(field.label)}
            InputProps={{
              endAdornment: (
                <Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {inputValue && (
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      disabled={!isEnabled}
                      style={{ marginLeft: 0, marginRight: 0 }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  )}
                  {minSearchLength === 0 && !inputValue && (
                    <IconButton
                      size="small"
                      onClick={handleDropdownToggle}
                      disabled={!isEnabled}
                      style={{ marginRight: 0 }}
                    >
                      <ArrowDropDown fontSize="small" />
                    </IconButton>
                  )}
                </Fragment>
              )
            }}
            fullWidth
          />
          {showDropdown && filteredOptions.length > 0 && (
            <Paper
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 2,
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              <List dense>
                {filteredOptions.map((option, index) => (
                  <ListItem
                    key={option.value || index}
                    button
                    onClick={() => handleCustomSelect(option)}
                    style={{ cursor: 'pointer' }}
                  >
                    {t(option.label || option)}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </div>
      </BaseFormControl>
    );
  }

  // Renderizar Autocomplete original para otros casos
  return (
    <BaseFormControl field={field} value={value} error={error} {...rest}>
      <Autocomplete
        id={fieldID}
        disabled={!isEnabled}
        size={size}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionKey={(option) => option.value}
        value={internalValue}
        onChange={(e, newValue) => {
          handleChangeSelection(e, newValue);
          setOpen(false);
        }}
        options={filteredOptions}
        isOptionEqualToValue={(option, selectedValue) => {
          const normalizedSelectedValue =
            typeof selectedValue === 'object' ? selectedValue?.value : selectedValue;
          return option?.value === normalizedSelectedValue;
        }}
        getOptionLabel={(option) => t(option?.label || option || '')}
        loading={loading}
        renderInput={(params) => (
          <TextField
            // sx={{}}
            {...params}
            label={t(field.label)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </Fragment>
              )
            }}
          />
        )}
      />
    </BaseFormControl>
  );
};

export default InputAutoComplete;
