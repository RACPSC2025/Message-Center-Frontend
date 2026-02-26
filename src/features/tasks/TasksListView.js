import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemIcon as MuiListItemIcon,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Sync as SyncIcon,
  RadioButtonChecked as UniqueIcon,
  CheckCircleOutline as PermanentIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DownloadDone,
  Loop,
  AssignmentReturned,
  MoreVert,
  DeleteOutline,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TaskCycleRow from './TaskCycleRow';
import TaskCyclesTable from './TaskCyclesTable';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';
import { fetchLogtaskList } from '../../stores/tasks/fetchLogtaskListSlice';
import { deleteLogtask } from '../../stores/tasks/deleteLogtaskSlice'; // Importar la acción de eliminación
import { selectFilterItemValue, setFilter } from '../../stores/filterSlice';
import TaskDoubleRingChart from '../../components/TaskDoubleRingChart';
import EditEventDetailsDrawer from '../MessageCenterEventsList/EditEventDetailsDrawer';
import ExpandableText from '../../components/ExpandableText';
import { normalizeStatusCode } from '../../utils/others';

const TASKS_PER_PAGE = 10;

const TasksListView = ({ onCreateTask, refreshKey }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Ref para centinela de la lista de tareas
  const loaderRef = useRef(null);

  // Ref para scroll de lista de tareas
  const listRef = useRef(null);

  // States
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedLogtask, setSelectedLogtask] = useState(null);
  const [logtasks, setLogtasks] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [initialDrawerTab, setInitialDrawerTab] = useState('comentarios');
  const [initialCommentText, setInitialCommentText] = useState('');
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Paginación de tareas
  const [tasks, setTasks] = useState([]);
  const [visibleTasks, setVisibleTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  console.log("SELECTED_LOG_TASK:", selectedLogtask)
  // Redux Selectors
  const taskListLoading = useSelector((state) => state?.fetchListTaskNew?.loading ?? false);
  const logtaskListLoading = useSelector((state) => state?.fetchLogtaskList?.loading ?? false);
  const selectedStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'selectedStatus'));

  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];
  console.log('TasksListView - Estados de tareas:', listTaskStatus);

  //  Redux Selectors Filters 
  const keywordsFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_keywords'));
  const statusFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_status'));
  const sortBy = useSelector((state) => selectFilterItemValue(state, 'events', 'sort_by'));
  const startDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_start_date'));
  const endDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_end_date'));
  const executorFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_executor'));
  const reviewerFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_reviewer'));
  console.log("AAAAAAAAAAAAAAAAAAAAAAASTATUSSSSSSSSSS", statusFilter)
  console.log("HHHHHHHHHHHHHHHHHHHHHHHHSORTSSSSSSSSSS", sortBy)

  // ✅ COLORES DINÁMICOS DESDE REDUX
  const TASK_STATUS_COLORS = useMemo(() => {
    // 1. Definir defaults por seguridad
    const defaults = {
      '1': '#00f57a', // Completado (verde)
      '2': '#1a90ff', // En progreso (azul)
      '3': '#fbc02d', // Abierto (amarillo)
      '4': '#fb3d61' // Vencido (rojo)
    };

    // 2. Si no hay datos de la API, retornar defaults
    if (!listTaskStatus || listTaskStatus.length === 0) return defaults;

    // 3. Sobreescribir con colores de la API
    const dynamicColors = { ...defaults };
    
    listTaskStatus.forEach(status => {
      // ↓ La API a veces devuelve el entero o string ↓ 
      const code = String(status.value_number);

      if (status.color_code) dynamicColors[code] = status.color_code;
    });

    return dynamicColors;
  }, [listTaskStatus]);

  const STATUS_FILTER_META = useMemo(() => ({
    '1': { label: 'Completed', color: TASK_STATUS_COLORS['1'] },
    '2': { label: 'In_Progress', color: TASK_STATUS_COLORS['2'] },
    '3': { label: 'abierto', color: TASK_STATUS_COLORS['3'] },
    '4': { label: 'Expired', color: TASK_STATUS_COLORS['4'] }
  }), [TASK_STATUS_COLORS]);



  // ✅ API Real - Migración Sofactia (05/02/2026)
  useEffect(() => {
    console.log("🚀 Iniciando carga de tareas reales...");

    dispatch(fetchListTaskNew({})).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tasksData = data?.payload?.data || [];

        console.log("📋 Procesando tareas recibidas:", tasksData.length);
        console.log("📋 Tareas recibidas:", tasksData);

        // ⚠️ MAPEO CRÍTICO: La API devuelve campos con nombres diferentes
        const mappedTasks = tasksData.map(task => ({
          ...task,
          // Mapear campos de fecha
          start_date: task.task_start_date || task.start_date,
          end_date: task.task_end_date || task.end_date,
          // Manejo de valores null con defaults
          task_type: task.task_type || 'CÍCLICA',
          task_title: task.task_title?.trim() || 'Sin título',
          // Convertir tags de objeto a array
          tags: task.tags ? Object.values(task.tags) : [],
          // Asegurar que progress sea número
          progress: parseFloat(task.progress) || 0
        }));

        setTasks(mappedTasks);
        setIsInitialized(true);

        // Auto-seleccionar primera tarea si existe
        if (mappedTasks.length > 0 && !selectedTask) {
          console.log("🎯 Seleccionando primera tarea:", mappedTasks[0].task_title);
          handleSelectTask(mappedTasks[0]);
        }
      } else {
        setIsInitialized(true);
        console.error("❌ Error en respuesta de API:", data?.payload?.messages);
      }
    }).catch((error) => {
      setIsInitialized(true);
      console.error("❌ Error al cargar tareas:", error);
    });
  }, [dispatch, refreshKey]);

  // ✅ Filtro de tareas por palabras clave, estado y fechas
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      // 1. Filtro por Palabras Clave
      if (keywordsFilter && keywordsFilter.trim() !== '') {
        const searchTerm = keywordsFilter.toLowerCase().trim();
        const titleMatch = task.task_title?.toLowerCase().includes(searchTerm);
        if (!titleMatch) return false;
      }

      // 2. Filtro por Estado
      if (statusFilter && statusFilter !== '') {
        const statusFilterCode = normalizeStatusCode(statusFilter)
        const taskStatus = String(task.task_status || task.status);

        if (taskStatus !== String(statusFilterCode)) return false;
      }

      // 3. Filtro por Rango de Fechas: Muestra tareas que se solapan con el rango seleccionado
      // Ej: Tarea anual (2025-01-01 a 2025-12-31) aparece en búsqueda de septiembre
      if (startDateFilter || endDateFilter) {
        const taskStartDate = task.start_date ? new Date(task.start_date) : null;
        const taskEndDate = task.end_date ? new Date(task.end_date) : null;
        const filterStartDate = startDateFilter ? new Date(startDateFilter) : null;
        const filterEndDate = endDateFilter ? new Date(endDateFilter) : null;

        // Si hay fecha de inicio del filtro, verificar que la tarea empiece después
        if (filterStartDate) {
          const taskDateToCheck = taskEndDate || taskStartDate; // Priorizar fecha de fin, sino fecha de inicio
          if (!taskDateToCheck || taskDateToCheck < filterStartDate) return false;
        }

        // Si hay fecha de fin del filtro, verificar que la tarea termine antes
        if (filterEndDate) {
          const taskDateToCheck = taskStartDate || taskEndDate; // Priorizar fecha de inicio, sino fecha de fin
          if (!taskDateToCheck || taskDateToCheck > filterEndDate) return false;
        }
      }

      // 4. Filtro por Executor(responsibles)
      if (executorFilter && executorFilter.trim() !== '') {
        const executors = task.responsibles || {};
        // busca en las claves numéricas de la API
        const hasExecutor = executors.hasOwnProperty(executorFilter.trim());
        
        if (!hasExecutor) return false;
      }

      // 5. Filtro por Revisor
      if (reviewerFilter && reviewerFilter.trim() !== '') {
        const reviewers = task.reviewers || {};
        // buscar directamente en las claves numéricas de la API
        const hasReviewer = reviewers.hasOwnProperty(reviewerFilter.trim());
        
        if (!hasReviewer) return false;
      }
      return true; 
    });

    // 3. Filtro por Ordenamiento (Sort By)
    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case '1': // A - Z
            return (a.task_title || '').localeCompare(b.task_title || '');
          case '2': // Z - A
            return (b.task_title || '').localeCompare(a.task_title || '');
          case '3': // Newest (Más reciente)
            return new Date(b.task_start_date || 0) - new Date(a.task_start_date || 0);
          case '4': // Oldest (Más antiguo)
            return new Date(a.task_start_date || 0) - new Date(b.task_start_date || 0);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [tasks, keywordsFilter, statusFilter, sortBy, startDateFilter, endDateFilter, executorFilter, reviewerFilter]);


  // ✅ LAZY LOADING DE TAREAS
  // 1. Resetear página cuando cambian las tareas filtradas
  useEffect(() => {
    setCurrentPage(1);
    setVisibleTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
    setIsLoadingMoreTasks(false);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [filteredTasks]);

  // 2. Cargar más tareas cuando cambia la página
  useEffect(() => {
    if (currentPage === 1) return; // Ya manejado arriba
    setIsLoadingMoreTasks(true);
    
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    const nextBatch = filteredTasks.slice(startIndex, endIndex);

    const timer = setTimeout(() => {
      if (nextBatch.length > 0) {
        setVisibleTasks(prev => [...prev, ...nextBatch]);
      }
      setIsLoadingMoreTasks(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, filteredTasks]);

  // 3. Intersection Observer para cargar más tareas
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // Si es visible Y aún hay tareas por mostrar
      if (entries[0].isIntersecting && visibleTasks.length < filteredTasks.length) {
        setCurrentPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    
    if (loaderRef.current) observer.observe(loaderRef.current);
    
    return () => {
      observer.disconnect(); 
    };
  }, [visibleTasks, filteredTasks]);

  /*
    Selecciona una tarea y gestiona la carga de sus seguimientos (logtasks).
    Si la tarea ya tiene logs, los usa; de lo contrario, los solicita a la API.
   */
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setSelectedLogtask(null);
    setIsEditDrawerOpen(false); // Close drawer when switching tasks

    if (task?.logtask_list && task.logtask_list.length > 0) {
      setLogtasks(task.logtask_list);
      setSelectedLogtask(task.logtask_list[0]);
    } else {
      dispatch(fetchLogtaskList({ task_id: task.id })).then((data) => {
        if (data?.payload?.messages === 'Success') {
          const logtaskData = data?.payload?.data || [];
          setLogtasks(logtaskData);
          if (logtaskData.length > 0) {
            setSelectedLogtask(logtaskData[0]);
          }
        }
      });
    }
  };

  const handleRefreshLogtasks = () => {
    if (selectedTask) {
      dispatch(fetchLogtaskList({ task_id: selectedTask.id })).then((data) => {
        if (data?.payload?.messages === 'Success') {
          const logtaskData = data?.payload?.data || [];
          setLogtasks(logtaskData);
          if (selectedLogtask) {
            const updatedCurrent = logtaskData.find(lt => lt.id === selectedLogtask.id);
            if (updatedCurrent) setSelectedLogtask(updatedCurrent);
          }
        }
      });
    }
  };

  const getTaskIcon = (type, isSelected) => {
    const typeColors = {
      'ÚNICA': '#ba68c8',
      'PERMANENTE': '#ff9800',
      'CÍCLICA': '#90a4ae'
    };
    const iconColor = isSelected ? '#a4a4a4' : (typeColors[type?.toUpperCase()] || '#90a4ae');
    const iconStyle = { fontSize: 24, color: iconColor, transition: 'color 0.2s ease' };

    switch (type?.toUpperCase()) {
      case 'ÚNICA': return <UniqueIcon sx={iconStyle} />;
      case 'PERMANENTE': return <PermanentIcon sx={iconStyle} />;
      case 'CÍCLICA':
      default: return <SyncIcon sx={iconStyle} />;
    }
  };

  const getStatusCodeFromItem = (statusItem) =>
    normalizeStatusCode(statusItem?.value_number)
    || normalizeStatusCode(statusItem?.value)
    || normalizeStatusCode(statusItem?.label)
    || null;

  
  const statusFilters = useMemo(() => {
    const source = Array.isArray(listTaskStatus) ? listTaskStatus : [];
    const backendByCode = {};

    source.forEach((statusItem) => {
      const code = getStatusCodeFromItem(statusItem);
      if (!code || !STATUS_FILTER_META[code] || backendByCode[code]) return;
      backendByCode[code] = statusItem;
    });

    // Siempre mostrar los 4 filtros en el orden del diseño
    return ['3', '1', '4', '2'].map((code) => ({
      code,
      label: STATUS_FILTER_META[code].label,
      color: STATUS_FILTER_META[code].color
    }));
  }, [listTaskStatus, STATUS_FILTER_META]);

  const normalizedSelectedStatus = useMemo(
    () => normalizeStatusCode(selectedStatus),
    [selectedStatus]
  );

  const matchesSelectedStatus = (statusValue) => {
    if (!normalizedSelectedStatus) return true;
    return normalizeStatusCode(statusValue) === normalizedSelectedStatus;
  };

  // ✅ Obtener estado de prioridad de la tarea
  /*
    Si hay al menos uno Vencido ('4'), la tarea se pinta roja.
    Si no, busca Abierto ('3') -> Amarilla.
    Si no, busca En Progreso ('2') -> Azul.
    Si todo está Completado ('1') -> Verde.
  */ 
  const getTaskPriorityStatus = (task) => {
    if (!task) return null;

    const logtaskStatuses = Array.isArray(task.logtask_list)
      ? task.logtask_list
        .map((item) => normalizeStatusCode(item?.logtask_status || item?.task_status || item?.status))
        .filter(Boolean)
      : [];

    const statuses = logtaskStatuses.length > 0
      ? logtaskStatuses
      : [normalizeStatusCode(task.task_status || task.status)].filter(Boolean);

    if (statuses.includes('4')) return '4'; // Vencido
    if (statuses.includes('3')) return '3'; // Abierto
    if (statuses.includes('2')) return '2'; // En progreso
    if (statuses.includes('1')) return '1'; // Completado
    return null; // Sin color
  };

  // ✅ FILTRAR LOGTASKS SEGÚN EL ESTADO SELECCIONADO
  const filteredLogtasks = useMemo(() => {
    return logtasks.filter(lt => matchesSelectedStatus(lt.logtask_status));
  }, [logtasks, normalizedSelectedStatus]);

  // ✅ LIMPIAR SELECCIÓN SI EL CICLO SELECCIONADO NO ESTÁ EN LA VISTA FILTRADA
  useEffect(() => {
    if (selectedLogtask && !filteredLogtasks.some(l => l.id === selectedLogtask.id)) {
      setSelectedLogtask(null);
    }
  }, [filteredLogtasks, selectedLogtask]);

  const getTaskListItemColor = (task) => {
    const priorityStatus = getTaskPriorityStatus(task);
    if (!priorityStatus || !TASK_STATUS_COLORS[priorityStatus]) return 'transparent';
    return TASK_STATUS_COLORS[priorityStatus];
  };

  // Manejar la selección de tipo de tarea
  const handleCreateTask = (taskType) => {
    // Llama a la función pasada como prop para manejar la creación de tareas
    if (onCreateTask) {
      onCreateTask(taskType);
    }
    handleMenuClose();
  };

  // Cálculos para el Dashboard
  const stats = useMemo(() => {
    if (!logtasks || logtasks.length === 0) {
      return { completed: 0, inProgress: 0, expired: 0, open: 0, averageProgress: 0 };
    }

    const counts = { completed: 0, inProgress: 0, expired: 0, open: 0 };
    let totalProgress = 0;

    logtasks.forEach(lt => {
      const status = String(lt.logtask_status || lt.task_status);
      // Asegurar que sea número
      let progress = parseFloat(lt.percentage || lt.progress || 0);

      // Si el estado es "Completado" (1), forzamos 100% para el cálculo promedio
      // esto corrige casos donde la BE envía status:1 pero progress:0
      if (status === '1') {
        progress = 100;
      }

      totalProgress += progress;

      if (status === '1') counts.completed++;
      else if (status === '2') counts.inProgress++;
      else if (status === '4') counts.expired++;
      else if (status === '3') counts.open++;
    });

    return {
      ...counts,
      averageProgress: Math.round(totalProgress / logtasks.length)
    };
  }, [logtasks]);

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%', bgcolor: '#f5f7f9', overflow: 'hidden' }}>

      {/* Sidebar Izquierda - Tareas (Mini Sidebar) */}
      <Box
        sx={{
          width: isCollapsed ? 70 : 340,  
          borderRight: '1px solid #e0e0e0',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <Box sx={{ p: '12px 0 8px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {!isCollapsed && (
            <Box sx={{ position: 'absolute', left: 20, display: 'flex', alignItems: 'center', gap: 1 }}>
              { /* TAREAS */}
              <Typography sx={{ fontWeight: 800, color: '#474b4e', fontSize: '0.75rem', letterSpacing: 1.5 }}>
                {t('tasks').toUpperCase()}
              </Typography>

              { /* CANTIDAD DE TAREAS */}
              <Box sx={{ bgcolor: '#eceff1', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#455a64' }}>
                  {filteredTasks.length}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Botón de colapsar */}
          <Box sx={{ ml: isCollapsed ? 0 : 'auto', mr: isCollapsed ? 0 : 1 }}>
            {/* Ver más tareas */}
            <Tooltip title={t('show_more') + ' ' + t('tasks')}>
              <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)} sx={{ color: '#b0bec5' }}>
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Lista de tareas */}
        <List ref={listRef} sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
          {(!isInitialized || taskListLoading) ? (
            <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ mx: 2, my: 0.5, py: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#888888', fontSize: '0.75rem', fontWeight: 600 }}>
                No se encontraron tareas
              </Typography>
            </Box>
          ) : (
            (() => {
              return visibleTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;

                const itemStatusColor = getTaskListItemColor(task);
                const hasStatusColor = itemStatusColor !== 'transparent';
                const selectedBgColor = hasStatusColor
                  ? alpha(itemStatusColor, 0.12)
                  : alpha(theme.palette.primary.main, 0.08);
                const hoverBgColor = hasStatusColor
                  ? alpha(itemStatusColor, isSelected ? 0.18 : 0.08)
                  : alpha(theme.palette.primary.main, isSelected ? 0.12 : 0.04);

                return (
                  <Tooltip key={task.id} title={task.task_title} placement="right">
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleSelectTask(task)}
                      sx={{
                        py: 0.5,
                        px: 0,
                        justifyContent: 'center',
                        borderLeft: `4px solid ${itemStatusColor}`,
                        bgcolor: isSelected ? `${selectedBgColor} !important` : 'transparent',
                        '&:hover': { bgcolor: hoverBgColor },
                        minHeight: '36px'
                      }}
                    >
                      {/* Ícono tipo de tarea */}
                      <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                        {getTaskIcon(task.task_type, isSelected)}
                      </ListItemIcon>

                      {/* Título de la tarea */}
                      {!isCollapsed && (
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                sx={{ 
                                  fontWeight: isSelected ? 600 : 500, 
                                  color: isSelected ? '#263238' : '#5b5b5b', 
                                  fontSize: '0.8rem', 
                                  lineHeight: 1.1, 
                                  whiteSpace: 'nowrap', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  letterSpacing: isSelected ? 1 : 0,
                                  flex: 1
                                }}
                              >
                                {task.task_title}
                              </Typography>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 400, 
                                  color: isSelected ? '#78909c' : '#90a4ae',
                                  paddingRight: 1
                                }}
                              >
                                # {task.id}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography sx={{ 
                              textTransform: 'uppercase', 
                              fontSize: '0.7rem', 
                              fontWeight: 500, 
                              color: isSelected ? '#5b5b5b' : '#adadad', 
                              mt: 0.1 
                            }}>
                              {task.task_type || 'CÍCLICA'}
                            </Typography>
                          }
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                );
              });
            })()
          )}

          {/* Elemento centinela al final */}
          {(!taskListLoading && isInitialized) && filteredTasks.length > 0 && (
            visibleTasks.length < filteredTasks.length ? (
              <div ref={loaderRef} style={{ height: 20, margin: 10, backgroundColor: 'transparent' }}>
                {isLoadingMoreTasks && (
                  <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                )}
              </div>
            ) : (
              visibleTasks.length > 0 && (
                <Box sx={{ mx: 2, my: 0.5, py: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#888888', fontSize: '0.75rem', fontWeight: 600 }}>
                    No hay más tareas
                  </Typography>
                </Box>
              ) 
            )
          )}
        </List>
      </Box>

      {/* Panel Central con Filtro Superior */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Contador de resultados filtrados */}
        {(keywordsFilter || startDateFilter || endDateFilter) && (
          <Box sx={{ px: 2, py: 1, bgcolor: '#f8fbfc', borderBottom: '1px solid #e0e6ed' }}>
            <Typography variant="caption" sx={{ color: '#90a4ae', fontSize: '0.75rem' }}>
              {filteredTasks.length} de {tasks.length} tareas encontradas
            </Typography>
          </Box>
        )}
        
        {/* Barra de Filtros Contextual */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: 'white',
          borderBottom: '1px solid #edf2f4',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Filtrado por estado */}
            <Typography sx={{ textTransform: 'uppercase', fontWeight: 800, color: '#90a4ae', fontSize: '0.75rem', letterSpacing: 1.5 }}>
              {t('FilterBy') + ' ' + t('Status')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {statusFilters.map((status) => {
                const isActive = normalizedSelectedStatus === status.code;
                return (
                  <Tooltip key={status.code} title={t(status.label)}>
                    <Box
                      onClick={() => {
                        const newValue = isActive ? -1 : status.code;
                        dispatch(setFilter({ module: 'task', updatedFilter: { selectedStatus: newValue } }));
                      }}
                      sx={{
                        width: isActive ? 16 : 12,
                        height: isActive ? 16 : 12,
                        borderRadius: '50%',
                        bgcolor: status.color,
                        cursor: 'pointer',
                        border: isActive ? '2px solid #fff' : 'none',
                        outline: isActive ? `2px solid ${status.color}` : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'scale(1.3)' }
                      }}
                    />
                  </Tooltip>
                );
              })}
              {normalizedSelectedStatus && (
                <Tooltip title={t('Limpiar filtro')}>
                  <IconButton
                    size="small"
                    onClick={() => dispatch(setFilter({ module: 'task', updatedFilter: { selectedStatus: -1 } }))}
                    sx={{ color: '#90a4ae', ml: 1, p: 0.5 }}
                  >
                    <DeleteOutline sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Contenido Scrollable: Dashboard + Tabla */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', p: 2 }}>
          {/* Card de Cabecera (Dashboard) */}
          {selectedTask && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 3,
                border: '1px solid #edf2f4',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'white'
              }}
            >
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* ID de la tarea*/}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#757575',
                      fontSize: '0.9rem',
                      backgroundColor: '#f5f5f5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}
                  >
                    ID: {selectedTask.id}
                  </Typography>
                </Box>

                {/* Título de la tarea */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#263238',
                    fontSize: '1.0rem',
                    lineHeight: 1.2
                  }}
                >
                  {selectedTask.task_title}
                </Typography>

                {/* Descripción de la tarea */}
                <ExpandableText 
                  text={selectedTask.task_description}
                  sx={{
                    mt: 1,
                    mr: 3,
                    fontWeight: 500,
                    color: '#607d8b',
                    fontSize: '0.85rem',
                    lineHeight: 1.25
                  }}
                />
              </Box>
              
              {/* Chart doble para el estado de tareas y ciclos */}
              <Box display="flex" alignItems="center" gap={3}>
                <TaskDoubleRingChart
                  percentage={stats.averageProgress}
                  stats={stats}
                  size={88}
                  strokeWidth={9}
                  taskState={getTaskPriorityStatus(selectedTask)} // Pasamos el estado (código '1', '2', '3' o '4')
                />

                {/* Estados de los ciclos en formato vertical */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, alignItems: 'flex-start' }}>
                  {[
                    { label: t('Completed'), statusKey: '1', count: stats.completed },
                    { label: t('InProgress'), statusKey: '2', count: stats.inProgress },
                    { label: t('Delayed'), statusKey: '4', count: stats.expired },
                    { label: t('Pending'), statusKey: '3', count: stats.open }
                  ].map((item) => (
                    <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: TASK_STATUS_COLORS[item.statusKey] }} />
                      <Typography sx={{ color: '#78909c', fontWeight: 600, fontSize: '0.6rem' }}>
                        {item.label}: <b>{item.count}</b>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          )}

          {/* Tabla de Ciclos */}
          <TaskCyclesTable
            logtasks={filteredLogtasks}
            isLoading={logtaskListLoading}
            onSelectCycle={(cycle) => {
              setSelectedLogtask(cycle);
            }}
            onOpenFollowup={(cycle) => {
              setSelectedLogtask(cycle);
              setInitialDrawerTab('comentarios');
              setInitialCommentText('');
              setIsEditDrawerOpen(true);
            }}
            onCloseCycle={(cycle) => {
              setSelectedLogtask(cycle);
              setInitialDrawerTab('crear_comentario');
              setInitialCommentText(t('close_cycle'));
              setIsEditDrawerOpen(true);
            }}
            selectedLogtaskId={selectedLogtask?.id}
            onAttachmentUploaded={handleRefreshLogtasks}
          />
        </Box>
      </Box>

      {/* Sidebar Derecha - Detalles */}

      <EditEventDetailsDrawer
        openEditDrawer={isEditDrawerOpen}
        onCloseEditDrawer={() => {
          setIsEditDrawerOpen(false);
          setInitialDrawerTab('comentarios');
          setInitialCommentText('');
          console.log('Cerrando drawer');
        }}
        logTaskDetails={selectedLogtask || {}}
        initialTab={initialDrawerTab}
        initialCommentText={initialCommentText}
        onDrawerOpened={() => {
          console.log('Edición finalizada / Drawer cerrado completamente');
          // Aquí podrías disparar un refresco de la lista si hubo cambios
          // dispatch(fetchListTaskNew({})); 
        }}
        onCommentAdded={handleRefreshLogtasks}
      />
    </Box>
  );
};

export default TasksListView;
