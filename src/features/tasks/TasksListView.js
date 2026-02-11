import React, { useState, useEffect, useMemo } from 'react';
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
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemIcon as MuiListItemIcon,
} from '@mui/material';
import {
  Sync as SyncIcon,
  RadioButtonChecked as UniqueIcon,
  CheckCircleOutline as PermanentIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DeleteOutline,
  Add,
  DownloadDone,
  Loop,
  AssignmentReturned,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TaskCycleRow from './TaskCycleRow';
import TaskTableList from './TaskTableList';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';
import { fetchLogtaskList } from '../../stores/tasks/fetchLogtaskListSlice';
import { deleteLogtask } from '../../stores/tasks/deleteLogtaskSlice'; // Importar la acción de eliminación
import { selectFilterItemValue, setFilter } from '../../stores/filterSlice';
import TaskDoubleRingChart from '../../components/TaskDoubleRingChart';
import SpeedDialComponent from '../../components/SpeedDialComponent';

const TasksListView = ({ onCreateTask }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // States
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedLogtask, setSelectedLogtask] = useState(null);
  const [logtasks, setLogtasks] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  const [currentCyclePage, setCurrentCyclePage] = useState(1);
  const cyclesPerPage = 10;
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);

  // Redux Selectors
  const taskListLoading = useSelector((state) => state?.fetchListTaskNew?.loading ?? false);
  const logtaskListLoading = useSelector((state) => state?.fetchLogtaskList?.loading ?? false);
  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];
  console.log('TasksListView - Estados de tareas:', listTaskStatus);

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

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setSelectedLogtask(null);

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
    const iconColor = isSelected ? '#1a90ff' : (typeColors[type?.toUpperCase()] || '#90a4ae');
    const iconStyle = { fontSize: 24, color: iconColor, transition: 'color 0.2s ease' };

    switch (type?.toUpperCase()) {
      case 'ÚNICA': return <UniqueIcon sx={iconStyle} />;
      case 'PERMANENTE': return <PermanentIcon sx={iconStyle} />;
      case 'CÍCLICA':
      default: return <SyncIcon sx={iconStyle} />;
    }
  };

  // Create-task menu and status filter handlers removed.

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
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#455a64' }}>{tasks.length}</Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ ml: isCollapsed ? 0 : 'auto', mr: isCollapsed ? 0 : 1 }}>
            <IconButton size="small" onClick={() => setIsCollapsed(!isCollapsed)} sx={{ color: '#b0bec5' }}>
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        </Box>

        <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
          {taskListLoading ? (
            <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
          ) : (
            (() => {
              const startIndex = (currentPage - 1) * tasksPerPage;
              const endIndex = startIndex + tasksPerPage;
              const paginatedTasks = tasks.slice(startIndex, endIndex);

              return paginatedTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;
                return (
                  <Tooltip key={task.id} title={isCollapsed ? task.task_title : ""} placement="right">
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleSelectTask(task)}
                      sx={{
                        py: 0.5,
                        px: 0,
                        justifyContent: 'center',
                        borderLeft: isSelected ? '4px solid #1a90ff' : '4px solid transparent',
                        bgcolor: isSelected ? '#f5f9ff !important' : 'transparent',
                        '&:hover': { bgcolor: '#f8fbfc' },
                        minHeight: '36px'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                        {getTaskIcon(task.task_type, isSelected)}
                      </ListItemIcon>
                      {!isCollapsed && (
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 700, color: isSelected ? '#1a90ff' : '#263238', fontSize: '0.75rem', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.task_title}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ textTransform: 'uppercase', fontSize: '0.5rem', fontWeight: 800, color: isSelected ? '#1a90ff80' : '#b0bec5', mt: 0.1 }}>
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
        </List>

        {/* Paginación */}
        {!isCollapsed && tasks.length > tasksPerPage && (
          <Box sx={{ p: 1, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              sx={{ width: 24, height: 24 }}
            >
              <ChevronLeftIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#455a64', minWidth: 60, textAlign: 'center' }}>
              {currentPage} / {Math.ceil(tasks.length / tasksPerPage)}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCurrentPage(Math.min(Math.ceil(tasks.length / tasksPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(tasks.length / tasksPerPage)}
              sx={{ width: 24, height: 24 }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Floating SpeedDial */}
      <SpeedDialComponent
        openSpeedDial={openSpeedDial}
        handleOpenSpeedDial={() => setOpenSpeedDial(true)}
        handleCloseSpeedDial={() => setOpenSpeedDial(false)}
        // Actions: multiple task types similar to other modules
        speedDialActions={[
          { id: 'permanente', name: 'Añadir Tarea Permanente', icon: <DownloadDone /> },
          { id: 'ciclica', name: 'Añadir Tarea Cíclica', icon: <Loop /> },
          { id: 'unica', name: 'Añadir Tarea Única', icon: <AssignmentReturned /> }
        ]}
        // Close the speed dial then execute the selected action
        handleClick={() => setOpenSpeedDial(false)}
        handleActionClick={(action) => {
          if (!action) return;
          const id = action.id;
          if (onCreateTask) onCreateTask(id);
        }}
      />

      {/* Panel Central con Filtro Superior */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Cabecera simplificada: filtros de estado y creación de tarea eliminados */}

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
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#263238', fontSize: '1.0rem' }}>
                  {selectedTask.task_title}
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

          {/* Centro: Tabla reutilizada (TaskTableList) mostrando ciclos según tarea seleccionada */}
          <Box sx={{ mt: 0.5 }}>
            <TaskTableList
              selectedTaskForTable={selectedTask}
              highlightedRowId={selectedLogtask?.id || selectedTask?.id}
              onRowClicked={(event) => {
                // cuando se hace click en una fila de la tabla central, seleccionar la tarea correspondiente
                const rowData = event.data;
                if (rowData) {
                  // rowData puede ser un task o un logtask; si es logtask, intentar mapear al padre (task)
                  // Preferimos seleccionar la tarea completa cuando la fila representa la tarea
                  // Si la fila es un logtask, usamos el logtask como seleccionado en el sidebar derecho
                  if (rowData.task_id) {
                    // Es un logtask -> seleccionar logtask
                    setSelectedLogtask(rowData);
                    // También asegurarnos de que la lista de logtasks contiene este ciclo
                    if (!logtasks.some(l => l.id === rowData.id)) {
                      setLogtasks(prev => [rowData, ...prev]);
                    }
                  } else {
                    // Es una tarea -> seleccionar tarea
                    handleSelectTask(rowData);
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Sidebar Derecha - Detalles (comentado para hacer espacio) */}
      { /*
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
      </Box>
      */ }
    </Box>
  );
};

export default TasksListView;
