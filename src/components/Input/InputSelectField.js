import { Select, MenuItem, InputLabel, Chip, Box } from '@mui/material';
import BaseFormControl from '../BaseFormControl';
import { useRef, useState } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';

const InputSelectField = ({ field, value, onChange, error, ...rest }) => {
  const labelID = `simple-select-${field.id}-label`;
  const isDisabled = !field.options || field.options.length === 0;
  const isMultiple = field.multiple || false;
  const selectRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    const newValue = event.target.value;
    onChange(field.id, newValue);
    
    // Cerrar el dropdown automáticamente en modo múltiple después de cada selección
    if (isMultiple) setOpen(false);
  };

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleDelete = (valueToDelete) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.filter(val => val !== valueToDelete);
    onChange(field.id, newValues);
  };

  const renderValue = (selected) => {
    if (!isMultiple) return selected;
    
    if (!selected || selected.length === 0) return '';
    
    // Mostrar solo la última opción seleccionada
    const lastSelected = selected[selected.length - 1];
    const option = field.options.find(opt => opt.value === lastSelected);
    return option?.label || lastSelected;
  };

  const selectValue = isMultiple ? (Array.isArray(value) ? value : []) : (value?.toString() ?? '');

  return (
    <BaseFormControl field={field} value={value} error={error} {...rest}>
      <InputLabel id={labelID}>{field.label}</InputLabel>
      <Select
        labelId={labelID}
        id={field.id}
        label={field.label}
        multiple={isMultiple}
        value={selectValue}
        onChange={handleChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={open}
        disabled={isDisabled}
        ref={selectRef}
        renderValue={isMultiple ? renderValue : undefined}
        MenuProps={isMultiple ? {
          PaperProps: {
            style: {
              maxHeight: 224,
              width: 250,
            },
          },
        } : undefined}
      >
        {field.options &&
          field.options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
      </Select>
      
      {/* Chips externos debajo del input */}
      {isMultiple && Array.isArray(value) && value.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map((val) => {
            const option = field.options.find(opt => opt.value === val);
            return (
              <Chip 
                key={val} 
                label={option?.label || val} 
                size="small" 
                onDelete={() => handleDelete(val)}
                deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
              />
            );
          })}
        </Box>
      )}
    </BaseFormControl>
  );
};

export default InputSelectField;
