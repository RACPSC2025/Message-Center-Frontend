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

const TASKS_PER_PAGE = 10;

const TasksListView = ({ onCreateTask }) => {
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
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);

  // Paginación de tareas
  const [tasks, setTasks] = useState([]);
  const [visibleTasks, setVisibleTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const TASK_STATUS_COLORS = useMemo(() => ({
    '1': '#00f57a', // Completado (verde)
    '2': '#1a90ff', // En progreso (azul)
    '3': '#fbc02d', // Abierto (amarillo)
    '4': '#fb3d61' // Vencido (rojo)
  }), []);

  const STATUS_FILTER_META = useMemo(() => ({
    '1': { label: 'Completed', color: TASK_STATUS_COLORS['1'] },
    '2': { label: 'In_Progress', color: TASK_STATUS_COLORS['2'] },
    '3': { label: 'abierto', color: TASK_STATUS_COLORS['3'] },
    '4': { label: 'Expired', color: TASK_STATUS_COLORS['4'] }
  }), [TASK_STATUS_COLORS]);

  console.log("SELECTED_LOG_TASK:", selectedLogtask)
  // Redux Selectors
  const taskListLoading = useSelector((state) => state?.fetchListTaskNew?.loading ?? false);
  const logtaskListLoading = useSelector((state) => state?.fetchLogtaskList?.loading ?? false);
  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];
  console.log('TasksListView - Estados de tareas:', listTaskStatus);
  const selectedStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'selectedStatus'));
  const keywordsFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_keywords'));

  /* 🎭 Data Mock - Bloque preservado (Migración: 05/02/2026)
  useEffect(() => {
    dispatch(fetchListTaskNew({})).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tasksData = data?.payload?.data || [];
        setTasks(tasksData);
        if (tasksData.length > 0 && !selectedTask) {
          handleSelectTask(tasksData[0]);
        }
      }
    });
  }, [dispatch]);
  */

  // ✅ API Real - Migración Sofactia (05/02/2026)
  useEffect(() => {
    console.log("🚀 Iniciando carga de tareas reales...");

    dispatch(fetchListTaskNew({})).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tasksData = data?.payload?.data || [];

        console.log("📋 Procesando tareas recibidas:", tasksData.length);

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

        // Auto-seleccionar primera tarea si existe
        if (mappedTasks.length > 0 && !selectedTask) {
          console.log("🎯 Seleccionando primera tarea:", mappedTasks[0].task_title);
          handleSelectTask(mappedTasks[0]);
        }
      } else {
        console.error("❌ Error en respuesta de API:", data?.payload?.messages);
      }
    }).catch((error) => {
      console.error("❌ Error al cargar tareas:", error);
    });
  }, [dispatch]);

  const filteredTasks = useMemo(() => {
    if (!keywordsFilter || keywordsFilter.trim() === '') {
      return tasks;
    }

    const searchTerm = keywordsFilter.toLowerCase().trim();
    
    return tasks.filter(task => {
      // TODO: Implementar búsqueda por descripción y tags (la api esta fallando)
      const titleMatch = task.task_title?.toLowerCase().includes(searchTerm);
      //const descMatch = task.task_description?.toLowerCase().includes(searchTerm);
      //const tagsMatch = Array.isArray(task.tags) && task.tags.some(tag => 
      //  typeof tag === 'string' && tag.toLowerCase().includes(searchTerm)
      //);
      // const responsiblesMatch = Array.isArray(task.responsibles) && task.responsibles.some(resp => 
      //   resp.name && typeof resp.name === 'string' && resp.name.toLowerCase().includes(searchTerm)
      // );
      
      return titleMatch; //|| descMatch || tagsMatch || responsiblesMatch;
    });
  }, [tasks, keywordsFilter]);

  // Resetear página cuando cambian las tareas filtradas
  useEffect(() => {
    setCurrentPage(1);
    setVisibleTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [filteredTasks]);

  // Cargar más tareas cuando cambia la página
  useEffect(() => {
    if (currentPage === 1) return; // Ya manejado arriba
    setIsLoadingMoreTasks(true);
    
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    const nextBatch = filteredTasks.slice(startIndex, endIndex);

    setTimeout(() => {
      if (nextBatch.length > 0) {
        setVisibleTasks(prev => [...prev, ...nextBatch]);
      }
      setIsLoadingMoreTasks(false);
    }, 500);
  }, [currentPage, filteredTasks]);

  // Intersection Observer para cargar más tareas
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
  }, [visibleTasks.length, filteredTasks.length]);

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

  const normalizeStatusCode = (value) => {
    const status = String(value || '').trim().toLowerCase();
    if (!status || status === '-1' || status === '0' || status === 'all') return null;

    if (status === '4' || status === 'vencido' || status === 'expired' || status === 'delayed') return '4';
    if (status === '3' || status === 'abierto' || status === 'open' || status === 'pending') return '3';
    if (
      status === '2'
      || status === 'en progreso'
      || status === 'in progress'
      || status === 'in_progress'
      || status === 'under_progress'
    ) return '2';
    if (status === '1' || status === 'completado' || status === 'completed' || status === 'closed') return '1';

    return null;
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

  // Funciones para manejar el menú desplegable
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
          width: isCollapsed ? '70px' : '240px',  // Reducido de 280px a 240px
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
            <Box sx={{ position: 'absolute', left: 20, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontWeight: 800, color: '#b0bec5', fontSize: '0.75rem', letterSpacing: 1.5 }}>
                TAREAS
              </Typography>
              <Box sx={{ bgcolor: '#eceff1', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#455a64' }}>{filteredTasks.length}</Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ ml: isCollapsed ? 0 : 'auto', mr: isCollapsed ? 0 : 1 }}>
            <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)} sx={{ color: '#b0bec5' }}>
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Lista de tareas */}
        <List ref={listRef} sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
          {taskListLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
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
                  <Tooltip key={task.id} title={isCollapsed ? task.task_title : ""} placement="right">
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
                      <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                        {getTaskIcon(task.task_type, isSelected)}
                      </ListItemIcon>
                      {!isCollapsed && (
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 700, color: isSelected ? '#5b5b5b' : '#263238', fontSize: '0.75rem', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.task_title}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ textTransform: 'uppercase', fontSize: '0.5rem', fontWeight: 800, color: isSelected ? '#5b5b5b' : '#b0bec5', mt: 0.1 }}>
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
          <div ref={loaderRef} style={{ height: 20, margin: 10, backgroundColor: 'transparent' }}>
            {isLoadingMoreTasks && (
              <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
            )}
          </div>
        </List>
      </Box>

      {/* Panel Central con Filtro Superior */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Contador de resultados filtrados */}
        {keywordsFilter && (
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
            <Typography sx={{ fontWeight: 800, color: '#90a4ae', fontSize: '0.75rem', letterSpacing: 1.5 }}>
              FILTRAR ESTADO
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

          {/* <Button
            variant="contained"
            sx={{
              bgcolor: '#D9FDD3',  // Color estándar
              color: '#00a884',
              '&:hover': { bgcolor: '#c8eac5' },  // Efecto de hover más sutil
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.85rem',
              px: 3,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
            onClick={handleMenuOpen}
            endIcon={<MoreVert />}
            aria-controls={openMenu ? 'task-creation-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
          >
            Crear tarea
          </Button> */}

          <Menu
            id="task-creation-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleCreateTask('permanente')}>
              <MuiListItemIcon>
                <DownloadDone fontSize="small" />
              </MuiListItemIcon>
              <Typography>Añadir Tarea Permanente</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleCreateTask('ciclica')}>
              <MuiListItemIcon>
                <Loop fontSize="small" />
              </MuiListItemIcon>
              <Typography>Añadir Tarea Cíclica</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleCreateTask('unica')}>
              <MuiListItemIcon>
                <AssignmentReturned fontSize="small" />
              </MuiListItemIcon>
              <Typography>Añadir Tarea Única</Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Contenido Scrollable: Dashboard + Tabla */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
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
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.25,
                    fontWeight: 500,
                    color: '#607d8b',
                    fontSize: '0.85rem',
                    lineHeight: 1.25
                  }}
                >
                  Colocar Descripción aquí cuando se tenga disponible el campo desde la API
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={3}>
                <TaskDoubleRingChart
                  percentage={stats.averageProgress}
                  stats={stats}
                  size={88}
                  strokeWidth={9}
                />

                {/* Estados de los ciclos en formato vertical */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, alignItems: 'flex-start' }}>
                  {[
                    { label: 'Completado', color: '#00f57a', count: stats.completed },
                    { label: 'En Progreso', color: '#1a90ff', count: stats.inProgress },
                    { label: 'Vencido', color: '#fb3d61', count: stats.expired },
                    { label: 'Abierto', color: '#fbc02d', count: stats.open }
                  ].map((item) => (
                    <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.color }} />
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
              setIsEditDrawerOpen(true);
            }}
            selectedLogtaskId={selectedLogtask?.id}
          />
        </Box>
      </Box>

      {/* Sidebar Derecha - Detalles */}

      <EditEventDetailsDrawer
        openEditDrawer={isEditDrawerOpen}
        onCloseEditDrawer={() => {
          setIsEditDrawerOpen(false);
          console.log('Cerrando drawer');
        }}
        logTaskDetails={selectedLogtask || {}}
        onDrawerOpened={() => {
          console.log('Edición finalizada / Drawer cerrado completamente');
          // Aquí podrías disparar un refresco de la lista si hubo cambios
          // dispatch(fetchListTaskNew({})); 
        }}
      />

      {/*
      <Box sx={{
        width: isRightSidebarCollapsed ? '40px' : '240px',  // Reducido de 280px a 240px
        flexShrink: 0,
        bgcolor: 'white',
        borderLeft: '1px solid #e0e0e0',
        overflowX: 'hidden',
        overflowY: 'auto',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        {isRightSidebarCollapsed ? (
          <IconButton
            size="small"
            onClick={() => setIsRightSidebarCollapsed(false)}
            sx={{
              color: '#b0bec5',
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <TaskDetailsSidebar
            selectedTask={selectedLogtask || selectedTask}
            statuses={listTaskStatus}
            onCollapse={() => setIsRightSidebarCollapsed(true)}
          />
        )}
      </Box>*/}
    </Box>
  );
};

export default TasksListView;
