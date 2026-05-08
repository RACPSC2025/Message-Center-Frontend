import { TextField } from '@mui/material';

const InputTextField = ({ field = {}, value, onChange = () => {}, error, ...rest }) => (
  <TextField
    key={field.id}
    label={field.label}
    fullWidth
    value={value}
    error={Boolean(error)}
    helperText={error}
    onChange={(e) => onChange(field.id, e.target.value)}
    autoComplete={field.autoComplete ?? 'off'}
    inputProps={field.inputProps}
    {...rest}
  />
);

export default InputTextField;
