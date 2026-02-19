import { TextField } from '@mui/material';

const InputTextAreaField = ({ field, value, onChange, error, ...rest }) => (
  <TextField
    key={field.id}
    label={field.label}
    multiline
    rows={4}
    fullWidth
    value={value}
    error={Boolean(error)}
    helperText={error}
    autoFocus={field.autoFocus}
    onChange={(e) => onChange(field.id, e.target.value)}
    onFocus={(e) => {
      const length = e.target.value.length;
      e.target.setSelectionRange(length, length);
    }}
    {...rest}
  />
);

export default InputTextAreaField;
