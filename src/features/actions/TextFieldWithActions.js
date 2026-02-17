// src/components/Common/TextFieldWithActions.jsx
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  TextField, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  MoreVert, 
  Psychology,
  Spellcheck,
  Undo,
  ManageSearch // NUEVO: Ícono para Análisis profundo
} from '@mui/icons-material';
import { getActionResumeIA, getActionCorrectionIA, getDeepAnalysis } from '../../stores/actions/getActionDetailsSlice';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';

const TextFieldWithActions = ({ 
  value, 
  onChange, 
  label,
  disabled = false,
  ...otherProps 
}) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  
  // Historial de texto para la funcionalidad de deshacer
  const textHistory = useRef([]);
  const [canUndo, setCanUndo] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Guardar el estado actual antes de hacer cambios
  const saveToHistory = (currentText) => {
    if (currentText && currentText.trim() !== '') {
      textHistory.current.push(currentText);
      setCanUndo(true);
    }
  };

  // NUEVO: Función para análisis profundo
  const handleGetDeepAnalysis = async () => {
    handleClose();
    if (!value || value.trim() === '') {
      showErrorMsg('Por favor ingrese un texto para analizar');
      return;
    }

    setLoading(true);
    try {
      // Guardar el texto actual en el historial antes de reemplazarlo
      saveToHistory(value);
      
      // Llamar a la acción de Redux
      const result = await dispatch(getDeepAnalysis(value)).unwrap();
      
      // Reemplazar el contenido con el análisis profundo
      onChange(result);
      showSuccessMsg('Análisis profundo generado exitosamente');
      
    } catch (error) {
      console.error('Error getting deep analysis:', error);
      showErrorMsg(error || 'Error al obtener el análisis profundo');
    } finally {
      setLoading(false);
    }
  };

  const handleGetResume = async () => {
    handleClose();
    if (!value || value.trim() === '') {
      showErrorMsg('Por favor ingrese un texto para resumir');
      return;
    }

    setLoading(true);
    try {
      // Guardar el texto actual en el historial antes de reemplazarlo
      saveToHistory(value);
      
      // Llamar a la acción de Redux
      const result = await dispatch(getActionResumeIA(value)).unwrap();
      
      // Reemplazar el contenido con el resumen
      onChange(result);
      showSuccessMsg('Resumen generado exitosamente');
      
    } catch (error) {
      console.error('Error getting resume:', error);
      showErrorMsg(error || 'Error al obtener el resumen');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCorrection = async () => {
    handleClose();
    if (!value || value.trim() === '') {
      showErrorMsg('Por favor ingrese un texto para corregir');
      return;
    }

    setLoading(true);
    try {
      // Guardar el texto actual en el historial antes de reemplazarlo
      saveToHistory(value);
      
      // Llamar a la acción de Redux
      const result = await dispatch(getActionCorrectionIA(value)).unwrap();
      
      // Reemplazar el contenido con el texto corregido
      onChange(result);
      showSuccessMsg('Texto corregido exitosamente');
      
    } catch (error) {
      console.error('Error getting correction:', error);
      showErrorMsg(error || 'Error al corregir el texto');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    handleClose();
    
    if (textHistory.current.length > 0) {
      // Obtener el último texto guardado
      const previousText = textHistory.current.pop();
      
      // Restaurar el texto anterior
      onChange(previousText);
      
      // Actualizar el estado de canUndo
      setCanUndo(textHistory.current.length > 0);
      
      showSuccessMsg('Texto restaurado');
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        multiline
        rows={6}
        label={label}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        {...otherProps}
        sx={{
          '& .MuiInputBase-root': {
            paddingRight: '40px' // Espacio para el botón
          }
        }}
      />
      
      {/* Botón flotante en esquina inferior derecha */}
      <Tooltip title="Acciones de texto">
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={disabled || loading}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground'
            }
          }}
        >
          {loading ? <CircularProgress size={20} /> : <MoreVert fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Menú desplegable - ACTUALIZADO con Análisis profundo */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {/* NUEVO: Análisis profundo - PRIMERA OPCIÓN */}
        <MenuItem 
          onClick={handleGetDeepAnalysis}
          disabled={!value || value.trim() === ''}
        >
          <ListItemIcon>
            <ManageSearch fontSize="small" />
          </ListItemIcon>
          <ListItemText>Análisis profundo</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={handleGetResume}
          disabled={!value || value.trim() === ''}
        >
          <ListItemIcon>
            <Psychology fontSize="small" />
          </ListItemIcon>
          <ListItemText>Obtener Resumen</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={handleGetCorrection}
          disabled={!value || value.trim() === ''}
        >
          <ListItemIcon>
            <Spellcheck fontSize="small" />
          </ListItemIcon>
          <ListItemText>Corregir Texto</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <ListItemIcon>
            <Undo fontSize="small" />
          </ListItemIcon>
          <ListItemText>Deshacer</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TextFieldWithActions;