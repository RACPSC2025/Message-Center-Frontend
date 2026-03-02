import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { Badge, Box, Chip, IconButton, Select, MenuItem, TextField } from '@mui/material';
import { useEffect, useState, useRef, useCallback } from 'react';
import { debounce } from 'radash';
import TableComponent from '../../components/TableComponent';
import { formatDayjs } from '../../utils/dateTimeFunctions';
import { COLUMN_TYPES, COLUMN_TYPE_TO_WIDTH_MAPPING } from '../config/table';
import { Description, Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';
import axiosInstance from '../../lib/axios';
import { showErrorMsg } from '../../utils/others';

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
    editableFields: ['action_status', 'responsible_person_name', 'reviewer_person_name', 'action_created_by_name', 'action_closing_date', 'action_real_closing_date', 'action_start_date', 'action_registered_date']
    // MODIFICAR AQUÍ: Cambia los campos que serán editables en modo global
  });

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
    console.log("Estado", COLUMN_TYPES)
    const finalColumms = [];
    const actionColumnWidth = getAbsoluteColumnWidth(COLUMN_TYPES.ACTIONS, width);
    let remainingWidth = width - actionColumnWidth;
    let isColumnWidthAcceptable = false;

    // 🔄 COLUMNA DE EDICIÓN GLOBAL - Nueva funcionalidad
    // Se añade al inicio para que esté fija a la izquierda antes del ID
    finalColumms.push({
      field: 'global_edit',
      headerName: 'Opciones',
      width: 50,
      pinned: 'left', // Fijada a la izquierda
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: (params) => {
        const isCurrentlyEditing = globalEditMode.enabled && globalEditMode.actionId === params.data.action_id;
        return (
          <IconButton
            size="small"
            onClick={() => toggleGlobalEditMode(params.data.action_id)}
            sx={{ 
              p: 0.5,
              color: isCurrentlyEditing ? 'primary.main' : 'default'
            }}
            title={isCurrentlyEditing ? 'Cancelar edición' : 'Editar fila'}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      }
    });

    // Solo saltamos estas columnas específicas
    const skippedColumns = ['responsible_person', 'action_created_by', 'nb_pais'];
    // Columnas de administradores editables
    const adminColumns = ['responsible_person_name', 'reviewer_person_name', 'action_created_by_name'];
    // Columnas de fecha editables
    const dateColumns = ['action_closing_date', 'action_real_closing_date', 'action_start_date', 'action_registered_date'];
    
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
      let columnWidth;
      if (restColumnConfig.field === 'action_status') {
        columnWidth = 170;
      } else if (adminColumns.includes(restColumnConfig.field)) {
        columnWidth = 200;
      } else if (dateColumns.includes(restColumnConfig.field)) {
        columnWidth = 200; // ✅ Ancho fijo para columnas de fecha
      } else {
        columnWidth = getAbsoluteColumnWidth(column_type, width);
      }
      
      remainingWidth = remainingWidth - columnWidth;

      isColumnWidthAcceptable =
        remainingWidth > 0 ||
        (remainingWidth < 0 && columnWidth + remainingWidth >= columnWidth * 0.75);

      if (!isColumnWidthAcceptable) break;

      restColumnConfig.width = columnWidth;

      // 🔥 Columnas de administradores - EDITABLES con renderer custom
      if (adminColumns.includes(restColumnConfig.field)) {
        finalColumms.push({
          ...restColumnConfig,
          headerName:
            restColumnConfig.field === 'responsible_person_name'
              ? 'Responsable'
              : restColumnConfig.field === 'reviewer_person_name'
              ? 'Revisor'
              : 'Creado por',
          width: 200, // ✅ Ancho fijo
          editable: false, // Usamos renderer custom
          cellRenderer: (params) => {
            return getAdminCellRenderer(params); // 📍 RENDERIZA CELDAS DE ADMINISTRADORES EDITABLES
          },
        });
      } 
      // 🔥 Columnas de fecha - EDITABLES con renderer custom y ancho fijo de 200px
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
      // 🔥 Columna action_status - EDITABLE con renderer custom y ancho fijo de 170px
      else if (restColumnConfig.field === 'action_status') {
        finalColumms.push({
          column_type: column_type,
          ...restColumnConfig,
          width: 170, // ✅ Ancho fijo
          editable: true,
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

      if (remainingWidth < 0) break;
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

  // Manejar el cambio de status
  const handleStatusChange = (actionId, newStatusValue) => {
    const updatedData = editableActions.map((row) =>
      row.action_id === actionId ? { ...row, action_status: newStatusValue } : row
    );
    setEditableActions(updatedData);
    setEditingStatusCell(null);
    
    console.log('Status actualizado:', { actionId, newStatus: newStatusValue });
  };

  // Manejar el cambio de administrador
  const handleAdminChange = (actionId, field, newAdminValue) => {
    // Buscar el label del administrador seleccionado
    const selectedAdmin = administradores.find(a => a.value === newAdminValue);
    
    const updatedData = editableActions.map((row) =>
      row.action_id === actionId ? { ...row, [field]: selectedAdmin ? selectedAdmin.label : newAdminValue } : row
    );
    setEditableActions(updatedData);
    setEditingAdminCell(null);
    
    console.log('Administrador actualizado:', { actionId, field, newAdmin: newAdminValue });
  };

  // Manejar el cambio de fecha
  const handleDateChange = (actionId, field, newDateValue) => {
    const updatedData = editableActions.map((row) =>
      row.action_id === actionId ? { ...row, [field]: newDateValue } : row
    );
    setEditableActions(updatedData);
    setEditingDateCell(null);
    
    console.log('Fecha actualizada:', { actionId, field, newDate: newDateValue });
  };

  // 🔄 FUNCIÓN GLOBAL DE EDICIÓN - Nueva funcionalidad
  const toggleGlobalEditMode = (actionId) => {
    setGlobalEditMode(prev => ({
      enabled: !prev.enabled,
      actionId: prev.enabled ? null : actionId, // Si ya está activo, lo desactiva
      editableFields: prev.editableFields // Mantiene los mismos campos editables
    }));
    
    // Limpiar estados de edición individuales al cambiar modo global
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
      const response = await axiosInstance.post(`/tasklist_api/list_administradores/`);
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
        const response = await axiosInstance.post(`/tasklist_api/list_administradores/`);
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
    
    // VERIFICACIÓN DE MODO GLOBAL - Nueva funcionalidad
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
    console.log("columnas types", COLUMN_TYPES)
    console.log("Colores:", actionStatus)
    const {
      colDef: { column_type },
      colDef,
      data,
      value
    } = params;
    const field = colDef?.field || 'action_status'; // Obtener el field del colDef

    switch (column_type) {
      case COLUMN_TYPES.DATE:
        // CELDA DE FECHA ESTÁNDAR (no editable)
        return !value ? '-' : formatDayjs(value, 'DD MMMM YYYY');
      
      case COLUMN_TYPES.ID_WITH_STATUS: {
        // CELDA DE ID CON BARRA DE COLOR DE ESTADO
        const { color_code } = actionStatus[data.action_status] || {};
        console.log("Color code")
        return (
          <Box sx={{ pl: 3 }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: '5px',
                bgcolor: color_code || '#ccc'
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
        
        // VERIFICACIÓN DE MODO GLOBAL - Nueva funcionalidad
        const isGloballyEditing = globalEditMode.enabled && 
                               globalEditMode.actionId === data.action_id &&
                               globalEditMode.editableFields.includes(field);
        const isIndividualEditing = editingStatusCell === data.action_id;
        const isEditing = isGloballyEditing || isIndividualEditing;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditing ? (
              <>
                <Select
                  value={value || ''}
                  onChange={(e) => handleStatusChange(data.action_id, e.target.value)}
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
                            backgroundColor: statusData.color_code || '#ccc',
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
              <Chip
                label={label || 'Sin estado'}
                size="small"
                sx={{
                  backgroundColor: color_code || '#ccc',
                  color: 'white',
                  minWidth: 100
                }}
              />
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