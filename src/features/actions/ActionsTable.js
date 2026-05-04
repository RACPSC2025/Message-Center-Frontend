import { useEffect, useState, useRef, useCallback } from 'react';
import { resolveStatusColor } from '../../config/statusColors';
import { Badge, Box, Chip, IconButton, Select, MenuItem, TextField, Typography } from '@mui/material';
import {
  Lock as CloseActionIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Forum as CommentForumIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { debounce } from 'radash';
import TableComponent from '../../components/TableComponent';
import { formatDayjs } from '../../utils/dateTimeFunctions';
import { COLUMN_TYPES, COLUMN_TYPE_TO_WIDTH_MAPPING } from '../config/table';
import axiosInstance from '../../lib/axios';
import { showErrorMsg, showSuccessMsg } from '../../utils/others';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateAction } from '../../stores/actions/updateActionSlice';
import { Description, Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';

// Componente separado para el campo de descripción editable
// Usa estado interno para evitar re-renders del componente padre
const EditableDescriptionField = ({ 
  initialValue, 
  actionId, 
  onSave,
  onValueChange
}) => {
  const [localValue, setLocalValue] = useState(initialValue || '');
  const inputRef = useRef(null);
  
  // Notificar al padre del cambio inmediato (para sincronización)
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  // Solo notificar al padre cuando el usuario termine de editar (onBlur)
  const handleBlur = () => {
    if (localValue !== initialValue) {
      onSave(actionId, localValue);
    }
  };
  
  // O también al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Esto disparará onBlur
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      size="small"
      sx={{ flex: 1 }}
      multiline
      maxRows={3}
      autoFocus
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default function ActionTable({
  actions,
  actionStatus,
  columnConfig,
  isFetching,
  onClickTableAction,
  newActionByUser,
  onRefreshData
}) {
  const [tableWidth, setTableWidth] = useState(1560);
  const tableContainerRef = useRef(null);
  const [editableActions, setEditableActions] = useState(actions);
  const [newActionDescription, setNewActionDescription] = useState('');
  const [administradores, setAdministradores] = useState([]);

  const theme = useTheme();
  
  // Estado para controlar qué celda de status está siendo editada
  const [editingStatusCell, setEditingStatusCell] = useState(null);
  // Estado para controlar qué celda de administrador está siendo editada
  const [editingAdminCell, setEditingAdminCell] = useState(null); // { action_id: string, field: string }
  // Estado para controlar qué celda de fecha está siendo editada
  const [editingDateCell, setEditingDateCell] = useState(null); // { action_id: string, field: string }
  
  // ESTADO GLOBAL DE EDICIÓN POR FILA - Nueva funcionalidad
  const [globalEditMode, setGlobalEditMode] = useState({
    enabled: false,
    actionId: null,
    editableFields: ['action_status', 'what_description']
  });

  // Estado para acumular cambios pendientes por acción
  const [pendingChanges, setPendingChanges] = useState({});

  // Estado para guardar los datos originales antes de entrar en modo edición
  const [originalData, setOriginalData] = useState({});

  // Ref para guardar el valor actual del campo de descripción en edición
  const currentDescriptionValue = useRef('');

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading: updateLoading, data: updateData, error: updateError } = useSelector(
    (state) => state?.updateAction || {}
  );

  const updateWidth = useCallback(() => {
    if (tableContainerRef.current) {
      setTableWidth(tableContainerRef.current.offsetWidth);
    }
  }, []);

  const debouncedUpdateWidth = useCallback(debounce({ delay: 100 }, updateWidth), [updateWidth]);

  useEffect(() => {
    updateWidth();
    let resizeObserver;
    if (tableContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(debouncedUpdateWidth);
      resizeObserver.observe(tableContainerRef.current);
    }
    window.addEventListener('resize', debouncedUpdateWidth);
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', debouncedUpdateWidth);
    };
  }, [debouncedUpdateWidth, updateWidth]);

  const getFinalColumnConfig = (columnConfig, width) => {
    const finalColumms = [];
    const actionColumnWidth = getAbsoluteColumnWidth(COLUMN_TYPES.ACTIONS, width);
    let remainingWidth = width - actionColumnWidth;
    let isColumnWidthAcceptable = false;

    // 🔄 COLUMNA DE EDICIÓN GLOBAL
    // Se añade al inicio para que esté fija a la izquierda antes del ID
    finalColumms.push({
      field: 'global_edit',
      headerName: 'Opciones',
      width: 125,
      pinned: 'left', // Fijada a la izquierda
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: (params) => {
        const isCurrentlyEditing = globalEditMode.enabled && globalEditMode.actionId === params.data.action_id;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.2, width: '100%' }}>             
            {isCurrentlyEditing ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => toggleGlobalEditMode(params.data.action_id)}
                  sx={{
                    color: 'success.main'
                  }}
                  title={t('save_changes')}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => cancelGlobalEditMode(params.data.action_id)}
                  sx={{
                    color: 'error.main'
                  }}
                  title={t('Cancel_edit')}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton
                size="small"
                onClick={() => toggleGlobalEditMode(params.data.action_id)}
                sx={{
                  color: 'default'
                }}
                title={t('edit_row')}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton size="small" title={t('close_action')}
              onClick={(event) => {
                event.stopPropagation();
                onClickTableAction(params.data, 'view_comment', 'form');
              }}
            >
              <CloseActionIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                title={t('comments')}
                onClick={(event) => {
                  event.stopPropagation();
                  onClickTableAction(params.data, 'view_comment', 'list');
                }}
              >
                <CommentForumIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" color="currentColor" sx={{ fontWeight: 500, fontSize: '0.9rem', ml: -0.2 }}>
                { params.data.comments_count }
              </Typography>
            </Box>
          </Box>
        );
      }
    });

    // Solo saltamos estas columnas específicas
    const skippedColumns = ['responsible_person', 'action_created_by', 'nb_pais'];
    // Columnas de administradores editables
    const adminColumns = ['responsible_person_name', 'reviewer_person_name'];
    // Columnas de fecha editables
    const dateColumns = ['action_closing_date', 'action_real_closing_date', 'action_start_date'];
    
    console.log("columnConfig: ", columnConfig);

    // Ajustar el ancho restante después de añadir la columna de edición
    remainingWidth -= 50; // Restar el ancho de la columna de edición global

    for (let i = 0; i < columnConfig.length; i++) {
      // Saltar solo las columnas en skippedColumns
      if (skippedColumns.includes(columnConfig[i]['field'])) {
        console.log("Skipping column: ", columnConfig[i]['field']);
        continue;
      }

      const { column_type, ...restColumnConfig } = columnConfig[i];
      
      console.log("Processing column: ", restColumnConfig.field);
      
      // 🔥 Ancho fijo para diferentes tipos de columnas
      let columnWidth = restColumnConfig.width;
      if (!columnWidth) {
        if (restColumnConfig.field === 'module_string_id') {
          columnWidth = 170;
        } else if (restColumnConfig.field === 'action_status') {
          columnWidth = 170;
        } else if (adminColumns.includes(restColumnConfig.field)) {
          columnWidth = 200;
        } else if (dateColumns.includes(restColumnConfig.field)) {
          columnWidth = 200; // ✅ Ancho fijo para columnas de fecha
        } else {
          columnWidth = getAbsoluteColumnWidth(column_type, width);
        }
      }
      
      remainingWidth = remainingWidth - columnWidth;

      restColumnConfig.width = columnWidth;

      // Columnas de administradores
      if (adminColumns.includes(restColumnConfig.field)) {
        finalColumms.push({
          ...restColumnConfig,
          headerName:
            restColumnConfig.field === 'responsible_person_name'
              ? 'Responsable'
              : restColumnConfig.field === 'reviewer_person_name'
              ? 'Revisor'
              : restColumnConfig.headerName,
          width: 200, // ✅ Ancho fijo
          editable: false, // Usamos renderer custom
          cellRenderer: (params) => {
            return getAdminCellRenderer(params); // 📍 RENDERIZA CELDAS DE ADMINISTRADORES EDITABLES
          },
        });
      } 
      // Columnas de fecha - EDITABLES con renderer custom y ancho fijo de 200px
      else if (dateColumns.includes(restColumnConfig.field)) {
        finalColumms.push({
          column_type: column_type,
          ...restColumnConfig,
          width: 200, // ✅ Ancho fijo
          editable: false, // Usamos renderer custom
          cellRenderer: (params) => {
            return getDateCellRenderer(params); // 📍 RENDERIZA CELDAS DE FECHA EDITABLES
          },
        });
      }
      // Columna action_status - EDITABLE con renderer custom y ancho fijo de 170px
      else if (restColumnConfig.field === 'action_status') {
        finalColumms.push({
          column_type: column_type,
          ...restColumnConfig,
          width: 170, // ✅ Ancho fijo
          editable: false,
          cellRenderer: (params) => {
            return getTableDefaultCellRenderer(params); // 📍 RENDERIZA CELDA DE ESTADO EDITABLE
          },
        });
      }
      // 👉 Todas las demás columnas - NO EDITABLES
      else {
        finalColumms.push({
          column_type: i === 0 ? COLUMN_TYPES.ID_WITH_STATUS : column_type,
          ...restColumnConfig,
          editable: false,
          cellRenderer: (params) => {
            return getTableDefaultCellRenderer(params); // 📍 RENDERIZA CELDAS ESTÁNDAR (ID, FECHA, ACCIONES)
          },
        });
      }
    }

    console.log("Final columns: ", finalColumms.map(c => c.field));
    return finalColumms;
  };

  const getAbsoluteColumnWidth = (columnType, totalAbsoluteWidth) => {
    const relativeWidthPercent = COLUMN_TYPE_TO_WIDTH_MAPPING[columnType] || 10;
    return Math.floor(totalAbsoluteWidth * (relativeWidthPercent / 100));
  };

  useEffect(() => {
    setEditableActions(actions);
  }, [actions]);

  const handleCellValueChanged = (params) => {
    const updatedRow = {
      ...params.data,
      [params.colDef.field]: params.newValue
    };

    const updatedData = editableActions.map((row) =>
      row.action_id === updatedRow.action_id ? updatedRow : row
    );

    setEditableActions(updatedData);
  };

  // Función para acumular cambios pendientes
  const addPendingChange = (actionId, field, newValue) => {
    setPendingChanges(prev => {
      const currentChanges = prev[actionId] || {};
      const updatedChanges = {
        ...currentChanges,
        [field]: newValue
      };
      
      return {
        ...prev,
        [actionId]: updatedChanges
      };
    });
  };

  // Función para procesar y mostrar los cambios acumulados
  const processPendingChanges = async (actionId) => {
    const changes = pendingChanges[actionId];
    if (!changes || Object.keys(changes).length === 0) {
      console.log('[API] No hay cambios pendientes para la acción:', actionId);
      return;
    }

    const apiPayload = {
      action_id: parseInt(actionId),
      ...changes
    };

    console.log('[API] Enviando actualización al endpoint:', apiPayload);
    
    try {
      // Despachar la acción de Redux para actualizar
      const result = await dispatch(updateAction(apiPayload)).unwrap();
      
      if (result?.status === 1) {
        showSuccessMsg(result?.messages || 'Acción actualizada correctamente');
        
        // Refrescar datos si hay función de refresco
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        showErrorMsg(result?.messages || 'Error al actualizar la acción');
      }
    } catch (error) {
      showErrorMsg('Error al actualizar la acción');
    }
    
    // Limpiar cambios procesados
    setPendingChanges(prev => {
      const newPending = { ...prev };
      delete newPending[actionId];
      return newPending;
    });
  };

  // Manejar el cambio de status
  const handleStatusChange = (actionId, newStatusValue) => {
    // Acumular cambio pendiente
    addPendingChange(actionId, 'action_status', newStatusValue);
    
    const updatedData = editableActions.map((row) =>
      row.action_id === actionId ? { ...row, action_status: newStatusValue } : row
    );
    //console.log('[API] Status actualizado localmente:', { actionId, newStatus: newStatusValue });
    
    setEditableActions(updatedData);
    setEditingStatusCell(null);
  };

  // Manejar el cambio de descripción
  const handleDescriptionChange = useCallback((actionId, newDescriptionValue) => {
    addPendingChange(actionId, 'what_description', newDescriptionValue);
    setEditableActions(prev => 
      prev.map(row => 
        row.action_id === actionId 
          ? { ...row, what_description: newDescriptionValue } 
          : row
      )
    );
  }, []);

  // Manejar el cambio de fecha
  const handleDateChange = (actionId, field, newDateValue) => {
    // Acumular cambio pendiente
    addPendingChange(actionId, field, newDateValue);
    
    const updatedData = editableActions.map((row) =>
      row.action_id === actionId ? { ...row, [field]: newDateValue } : row
    );
    setEditableActions(updatedData);
    setEditingDateCell(null);
    
  };

  // FUNCIÓN GLOBAL DE EDICIÓN - Nueva funcionalidad
  const toggleGlobalEditMode = (actionId) => {
    const wasEditing = globalEditMode.enabled && globalEditMode.actionId === actionId;
    
    if (wasEditing) {
      // Crear el payload de cambios incluyendo el valor actual de descripción
      const changes = { ...pendingChanges[actionId] };
      
      // Añadir el valor de descripción del ref si existe
      if (currentDescriptionValue.current && currentDescriptionValue.current !== originalData[actionId]?.what_description) {
        changes.what_description = currentDescriptionValue.current;
      }
      
      // Si hay cambios, procesarlos directamente
      if (Object.keys(changes).length > 0) {
        const apiPayload = {
          action_id: parseInt(actionId),
          ...changes
        };
        
        console.log('[API] Enviando actualización al endpoint:', apiPayload);
        
        // Llamar a la API directamente
        dispatch(updateAction(apiPayload))
          .unwrap()
          .then((result) => {
            if (result?.status === 1) {
              showSuccessMsg(result?.messages || 'Acción actualizada correctamente');
              if (onRefreshData) {
                onRefreshData();
              }
            } else {
              showErrorMsg(result?.messages || 'Error al actualizar la acción');
            }
          })
          .catch(() => {
            showErrorMsg('Error al actualizar la acción');
          });
      } else {
        console.log('[API] No hay cambios pendientes para la acción:', actionId);
      }
      
      // Limpiar datos originales guardados
      setOriginalData(prev => {
        const newOriginal = { ...prev };
        delete newOriginal[actionId];
        return newOriginal;
      });
      
      // Limpiar cambios pendientes
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[actionId];
        return newPending;
      });
      
      // Limpiar el ref del valor actual
      currentDescriptionValue.current = '';
    } else {
      // Si va a entrar en modo edición, guardar los datos originales
      const currentAction = editableActions.find(action => action.action_id === actionId);
      if (currentAction) {
        setOriginalData(prev => ({
          ...prev,
          [actionId]: { ...currentAction }
        }));
        // Inicializar el ref con el valor actual
        currentDescriptionValue.current = currentAction.what_description || '';
      }
    }
    
    setGlobalEditMode(prev => ({
      enabled: !prev.enabled,
      actionId: prev.enabled ? null : actionId,
      editableFields: prev.editableFields
    }));
    
    // Limpiar estados de edición individuales al cambiar modo global
    setEditingStatusCell(null);
    setEditingAdminCell(null);
    setEditingDateCell(null);
  };

  // FUNCIÓN PARA CANCELAR EDICIÓN GLOBAL - Nueva funcionalidad
  const cancelGlobalEditMode = (actionId) => {
    // Restaurar los datos originales
    const original = originalData[actionId];
    if (original) {
      setEditableActions(prev => 
        prev.map(action => 
          action.action_id === actionId ? { ...original } : action
        )
      );
    }
    
    // Limpiar cambios pendientes sin procesarlos
    setPendingChanges(prev => {
      const newPending = { ...prev };
      delete newPending[actionId];
      return newPending;
    });
    
    // Limpiar datos originales guardados
    setOriginalData(prev => {
      const newOriginal = { ...prev };
      delete newOriginal[actionId];
      return newOriginal;
    });
    
    // Desactivar modo edición
    setGlobalEditMode(prev => ({
      enabled: false,
      actionId: null,
      editableFields: prev.editableFields
    }));
    
    // Limpiar estados de edición individuales
    setEditingStatusCell(null);
    setEditingAdminCell(null);
    setEditingDateCell(null);
  };

  const handleCreateNewAction = () => {
    console.log('handleCreateNewAction called');
    console.log("columnConfig: ", columnConfig);
    console.log("editable actions: ", editableActions);
    console.log('New action description:', newActionDescription);
    
    const trimmedDesc = newActionDescription.trim();
    if (!trimmedDesc) return;

    const newRow = {
      action_id: `temp_${Date.now()}`,
      description: newActionDescription,
      what_description: newActionDescription,
      comments_count: 0,
      action_status: '',
    };
    
    setEditableActions((prev) => [newRow, ...prev]);
    setNewActionDescription('');
  };

  const createNewActionByDescription = (newDesription) => {
    console.log('CreateNewActionByDescription called');
    console.log("columnConfig: ", columnConfig);
    console.log("editable actions: ", editableActions);

    const newRow = {
      action_id: '',
      description: newDesription,
      what_description: newDesription,
      comments_count: 0,
      action_status: '',
    };
    
    setEditableActions((prev) => [newRow, ...prev]);
    setNewActionDescription('');
  };

  useEffect(() => {
    if (newActionByUser !== '') {
      createNewActionByDescription(newActionByUser);
    }
  }, [newActionByUser]);
  
  const fetchUserName = async (user_id) => {
    try {
      const response = await axiosInstance.post(`/message_center_api/tasklist_api/list_administradores/`);
      const filteredId = response.data.data.filter(
        (user) => parseInt(user.value) === parseInt(user_id)
      );
      return filteredId[0].label;
    } catch (error) {
      console.error('Error fetching user name ', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchAdministradores = async () => {
      try {
        const response = await axiosInstance.post(`/message_center_api/tasklist_api/list_administradores/`);
        if (response.data.status === 200) {
          setAdministradores(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching administradores: ", error);
      }
    };  
    fetchAdministradores();
  }, []);

  // Renderer para columnas de administradores
  const getAdminCellRenderer = (params) => {
    const { data, value, colDef } = params;
    const field = colDef.field;
    
    // VERIFICACIÓN DE MODO GLOBAL
    const isGloballyEditing = globalEditMode.enabled && 
                           globalEditMode.actionId === data.action_id &&
                           globalEditMode.editableFields.includes(field);
    const isIndividualEditing = editingAdminCell?.action_id === data.action_id && editingAdminCell?.field === field;
    const isEditing = isGloballyEditing || isIndividualEditing;

    // Encontrar el value actual del administrador
    const currentAdmin = administradores.find(a => a.label === value);
    const currentValue = currentAdmin ? currentAdmin.value : value;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        {isEditing ? (
          <>
            <Select
              value={currentValue || ''}
              onChange={(e) => handleAdminChange(data.action_id, field, e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 150 }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            >
              {administradores.map((admin) => (
                <MenuItem key={admin.value} value={admin.value}>
                  {admin.label}
                </MenuItem>
              ))}
            </Select>
            {/* SOLO MOSTRAR CERRAR EN MODO INDIVIDUAL - Nueva funcionalidad */}
            {!isGloballyEditing && (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingAdminCell(null);
                }}
                sx={{ p: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || '-'}
          </Box>
        )}
      </Box>
    );
  };

  // Renderer para columnas de fecha
  const getDateCellRenderer = (params) => {
    const { data, value, colDef } = params;
    const field = colDef.field;
    
    // VERIFICACIÓN DE MODO GLOBAL - Nueva funcionalidad
    const isGloballyEditing = globalEditMode.enabled && 
                           globalEditMode.actionId === data.action_id &&
                           globalEditMode.editableFields.includes(field);
    const isIndividualEditing = editingDateCell?.action_id === data.action_id && editingDateCell?.field === field;
    const isEditing = isGloballyEditing || isIndividualEditing;

    // Formatear la fecha para el input type="date" (YYYY-MM-DD)
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return '';
      try {
        const date = new Date(dateValue);
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    const currentDateValue = formatDateForInput(value);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        {isEditing ? (
          <>
            <TextField
              type="date"
              value={currentDateValue}
              onChange={(e) => handleDateChange(data.action_id, field, e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: '1950-01-01', max: '2050-12-31' }}
            />
            {/* SOLO MOSTRAR CERRAR EN MODO INDIVIDUAL - Nueva funcionalidad */}
            {!isGloballyEditing && (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingDateCell(null);
                }}
                sx={{ p: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || '-'}
          </Box>
        )}
      </Box>
    );
  };

  const getTableDefaultCellRenderer = (params) => {
    const {
      colDef: { column_type },
      colDef,
      data,
      value
    } = params;
    const field = colDef?.field || 'action_status'; // Obtener el field del colDef

    switch (column_type) {
      case COLUMN_TYPES.DATE:
        // CELDA DE FECHA ESTÁNDAR 
        return !value ? '-' : formatDayjs(value, 'DD MMMM YYYY');
      
      case COLUMN_TYPES.ID_WITH_STATUS: {
        // CELDA DE ID CON BARRA DE COLOR DE ESTADO
        const { color_code } = actionStatus[data.action_status] || {};
        return (
          <Box sx={{ pl: 1 }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '5px',
                bgcolor: resolveStatusColor(data.action_status, color_code || '#ccc')
              }}
            />
            {data.action_id} 
          </Box>
        );
      }
      
      case COLUMN_TYPES.STATUS: {
        // CELDA DE ESTADO EDITABLE con dropdown y colores
        const statusInfo = actionStatus[value] || {};
        const { color_code, label } = statusInfo;
        
        // VERIFICACIÓN DE MODO GLOBAL
        const isGloballyEditing = globalEditMode.enabled && 
                               globalEditMode.actionId === data.action_id &&
                               globalEditMode.editableFields.includes(field);
        const isIndividualEditing = editingStatusCell === data.action_id;
        const isEditing = isGloballyEditing || isIndividualEditing;

        return (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isEditing ? (
              <>
                <Select
                  value={value || ''}
                  onChange={(e) => {
                    handleStatusChange(data.action_id, e.target.value);
                  }}
                  size="small"
                  sx={{ minWidth: 120 }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.entries(actionStatus).map(([statusKey, statusData]) => (
                    <MenuItem key={statusKey} value={statusKey}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={statusData.label}
                          size="small"
                          sx={{
                            backgroundColor: resolveStatusColor(statusKey, statusData.color_code || '#ccc'),
                            color: 'white',
                            minWidth: 100
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {/* SOLO MOSTRAR CERRAR EN MODO INDIVIDUAL - Nueva funcionalidad */}
                {!isGloballyEditing && (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingStatusCell(null);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: resolveStatusColor(value, color_code || '#ccc'),
                  flexShrink: 0,
                }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                  {label || 'Sin estado'}
                </Typography>
              </Box>
            )}
          </Box>
        );
      }
      
      case COLUMN_TYPES.ACTIONS:
        // CELDA DE ACCIONES (botones de comentarios y edición)
        return (
          <>
            <Badge
              badgeContent={data.comments_count}
              color="info"
              invisible={parseInt(data.comments_count) === 0}
              overlap="circular"
            >
              <IconButton
                aria-label="comment"
                onClick={(event) => {
                  event.stopPropagation();
                  onClickTableAction(data, 'view_comment');
                }}
              >
                <CommentIcon />
              </IconButton>
            </Badge>
            <IconButton
              aria-label="edit"
              sx={{ ml: 1 }}
              onClick={(event) => {
                event.stopPropagation();
                onClickTableAction(data, 'view_action');
              }}
            >
              <EditIcon />
            </IconButton>
          </>
        );
      
      default:
        // VERIFICAR SI ES CAMPO WHAT_DESCRIPTION PARA EDICIÓN
        if (field === 'what_description') {
          // VERIFICACIÓN DE MODO GLOBAL
          const isGloballyEditing = globalEditMode.enabled && 
                                 globalEditMode.actionId === data.action_id &&
                                 globalEditMode.editableFields.includes('what_description');
          const isEditing = isGloballyEditing;

          return (
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              {isEditing ? (
                <EditableDescriptionField
                  initialValue={value}
                  actionId={data.action_id}
                  onSave={handleDescriptionChange}
                  onValueChange={(newValue) => {
                    currentDescriptionValue.current = newValue;
                  }}
                />
              ) : (
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  px: 1
                }}>
                  {value || '-'}
                </Box>
              )}
            </Box>
          );
        }
        
        // CELDA DE TEXTO ESTÁNDAR
        return value;
    }
  };

  return (
    <Box
      ref={tableContainerRef}
      sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', px: 2 }}
    >
      {isFetching ? (
        <TableComponent isLoading={isFetching} />
      ) : (
        <TableComponent
          rowData={editableActions.map((a) => ({ ...a }))}
          columnDefs={getFinalColumnConfig(columnConfig, tableWidth)}
          editable={false}
          pageOption={[20, 50, 100]}
          perPage={20}
          onCellValueChanged={handleCellValueChanged}
          onRefresh={onRefreshData || (() => showErrorMsg('No se puede refrescar los datos'))}
        />
      )}
    </Box>
  );
}