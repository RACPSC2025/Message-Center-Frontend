import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useHasPermission } from '../../hooks/usePlatformConfig';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Add as AddIcon,
  AssignmentReturned,
  MoreVert as MoreVertIcon,
  DeleteOutline,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TaskCycleRow from './TaskCycleRow';
import AddTagDialog from './AddTagDialog';
import TaskCyclesTable from './TaskCyclesTable';
import TaskDetailsSidebar from './TaskDetailsSidebar';
import UnsavedChangesDialog from '../../components/UnsavedChangesDialog';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';
import { fetchLogtaskList } from '../../stores/tasks/fetchLogtaskListSlice';
import { deleteLogtask } from '../../stores/tasks/deleteLogtaskSlice'; // Importar la acción de eliminación
import { selectFilterItemValue, setFilter } from '../../stores/filterSlice';
import { clearUploadAttachmentFocus } from '../../stores/actions/uploadCommentAttachmentsSlice';
import TaskDoubleRingChart from '../../components/TaskDoubleRingChart';
import EditEventDetailsDrawer from '../MessageCenterEventsList/EditEventDetailsDrawer';
import ExpandableText from '../../components/ExpandableText';
import { normalizeStatusCode, stripHtmlTags } from '../../utils/others';

const TASKS_PER_PAGE = 10;

const TasksListView = ({ onCreateTask, refreshKey }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  // Permisos de plataforma para el módulo de tareas
  const canEditTask = useHasPermission('task', 'edit_task');
  const canDeleteTask = useHasPermission('task', 'delete_task');
  const canCreateTags = useHasPermission('task', 'create_tags');

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
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [focusedCommentId, setFocusedCommentId] = useState(null);
  // Nueva variable de estado para mostrar el tooltip del título
  const [showTaskTitleTooltip, setShowTaskTitleTooltip] = useState(false);

  // Menú de opciones de tarea
  const [taskMenuAnchor, setTaskMenuAnchor] = useState(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [taskIdForTag, setTaskIdForTag] = useState(null);
  const handleAddTag = () => {
    setAddTagDialogOpen(true);
    setTaskIdForTag(selectedTaskForMenu?.id);
    handleTaskMenuClose();
  };

  // Manejadores para el diálogo de cambios sin guardar
  const handleConfirmExitWithoutSave = () => {
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
    setShowUnsavedChangesDialog(false);
  };

  const handleCancelExit = () => {
    setPendingCloseAction(null);
    setShowUnsavedChangesDialog(false);
  };

  // Manejadores del menú de opciones
  const handleTaskMenuClick = (event, task) => {
    event.stopPropagation();
    setTaskMenuAnchor(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
    setSelectedTaskForMenu(null);
  };

  const handleEditTask = () => {
    console.log('Editar tarea:', selectedTaskForMenu);
    handleTaskMenuClose();
  };

  const handleDeleteTask = () => {
    setDeleteDialogOpen(true);
    handleTaskMenuClose();
  };

  const handleConfirmDelete = () => {
    console.log('Eliminar tarea:', selectedTaskForMenu);
    setDeleteDialogOpen(false);
    setSelectedTaskForMenu(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedTaskForMenu(null);
  };

  // Paginación de tareas
  const [tasks, setTasks] = useState([]);
  const [visibleTasks, setVisibleTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  //console.log("SELECTED_LOG_TASK:", selectedLogtask)
  // Redux Selectors
  const taskListLoading = useSelector((state) => state?.fetchListTaskNew?.loading ?? false);
  const logtaskListLoading = useSelector((state) => state?.fetchLogtaskList?.loading ?? false);
  const selectedStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'selectedStatus'));

  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];
  const taskStatusCatalog = useSelector(
    (state) => state?.platformConfig?.data?.modules?.task?.catalogs?.status ?? []
  );
  const taskTypeCatalog = useSelector(
    (state) => state?.platformConfig?.data?.modules?.task?.catalogs?.task_type ?? []
  );
  const selectedLegalTaskIds =
    useSelector((state) => selectFilterItemValue(state, 'task', 'selected_legal_task_ids')) || [];
  const uploadAttachmentFocus = useSelector(
    (state) => state?.uploadCommentAttachments?.lastUpload ?? null
  );
  //console.log('TasksListView - Estados de tareas:', listTaskStatus);

  const lastAppliedAttachmentFocusRef = useRef(null);

  const resetFocusedDrawerFilters = () => {
    setSelectedLogtask(null);
    setFocusedCommentId(null);
    lastAppliedAttachmentFocusRef.current = null;
    dispatch(clearUploadAttachmentFocus());
  };

  const selectedLegalTaskIdSet = useMemo(
    () =>
      new Set(
        (Array.isArray(selectedLegalTaskIds) ? selectedLegalTaskIds : [])
          .map((id) => String(id).trim())
          .filter(Boolean)
      ),
    [selectedLegalTaskIds]
  );

  //  Redux Selectors Filters 
  const keywordsFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_keywords'));
  const statusFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_status'));
  const sortBy = useSelector((state) => selectFilterItemValue(state, 'events', 'sort_by'));
  const startDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_start_date'));
  const endDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_end_date'));
  const executorFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_executor'));
  const reviewerFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_reviewer'));
  const etiquetasFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'Etiquetas'));


  const TASK_STATUS_FALLBACK = useMemo(
    () => [
      { code: 'pending', numeric_code: 3, label: 'Abierto', color: '#ffc107' },
      { code: 'completed', numeric_code: 1, label: 'Cerrado', color: '#28a745' },
      { code: 'delayed', numeric_code: 4, label: 'Vencido', color: '#dc3545' },
      { code: 'permanent', numeric_code: 2, label: 'Permanente', color: '#348fe2' }
    ],
    []
  );

  const normalizedTaskStatusCatalog = useMemo(() => {
    const sourceCatalog = Array.isArray(taskStatusCatalog) && taskStatusCatalog.length
      ? taskStatusCatalog
      : TASK_STATUS_FALLBACK;

    return sourceCatalog
      .map((statusItem) => {
        const numericCode = normalizeStatusCode(statusItem?.numeric_code);
        if (!numericCode) return null;

        const fallbackStatus = TASK_STATUS_FALLBACK.find(
          (item) => normalizeStatusCode(item.numeric_code) === numericCode
        );

        return {
          code: String(statusItem?.code || fallbackStatus?.code || '').trim().toLowerCase(),
          numericCode,
          label: String(statusItem?.label || fallbackStatus?.label || '').trim(),
          color: String(statusItem?.color || fallbackStatus?.color || '').trim() || fallbackStatus?.color
        };
      })
      .filter(Boolean);
  }, [taskStatusCatalog, TASK_STATUS_FALLBACK]);

  const TASK_STATUS_COLORS = useMemo(
    () =>
      normalizedTaskStatusCatalog.reduce((acc, status) => {
        acc[status.numericCode] = status.color;
        return acc;
      }, {}),
    [normalizedTaskStatusCatalog]
  );

  const STATUS_FILTER_META = useMemo(
    () =>
      normalizedTaskStatusCatalog.reduce((acc, status) => {
        acc[status.numericCode] = {
          label: status.label,
          color: status.color
        };
        return acc;
      }, {}),
    [normalizedTaskStatusCatalog]
  );

  const normalizedTaskTypeCatalog = useMemo(() => {
    const sourceCatalog = Array.isArray(taskTypeCatalog) && taskTypeCatalog.length
      ? taskTypeCatalog
      : [
          { code: 'unique', numeric_code: 1, label_es: 'Única', label_en: 'Unique' },
          { code: 'cyclic', numeric_code: 3, label_es: 'Cíclica', label_en: 'Cyclic' },
          { code: 'permanent', numeric_code: 5, label_es: 'Permanente', label_en: 'Permanent' }
        ];

    return sourceCatalog.map((item) => ({
      code: String(item?.code || '').trim().toLowerCase(),
      numericCode: Number(item?.numeric_code),
      labelEs: String(item?.label_es || '').trim(),
      labelEn: String(item?.label_en || '').trim()
    }));
  }, [taskTypeCatalog]);

  const getTaskTypeInfoFromActivityType = (activityType) => {
    const fallbackType =
      normalizedTaskTypeCatalog.find((item) => item.code === 'cyclic' || item.numericCode === 3)
      || normalizedTaskTypeCatalog[0]
      || null;

    const normalizedActivityType = String(activityType ?? '').trim();
    const activityTypeNumber = Number(normalizedActivityType);

    const matchedType = normalizedTaskTypeCatalog.find((item) => {
      if (!item) return false;
      const codeMatches = item.code && item.code === normalizedActivityType.toLowerCase();
      const numericMatches = Number.isFinite(activityTypeNumber) && item.numericCode === activityTypeNumber;
      return codeMatches || numericMatches;
    });

    const resolvedType = matchedType || fallbackType;
    const language = (i18n?.language || 'es').toLowerCase();
    const isEnglish = language.startsWith('en');
    const label = isEnglish
      ? (resolvedType?.labelEn || resolvedType?.labelEs || 'Cyclic')
      : (resolvedType?.labelEs || resolvedType?.labelEn || 'Cíclica');

    return {
      code: resolvedType?.code || 'cyclic',
      numericCode: resolvedType?.numericCode ?? 3,
      label
    };
  };

  const mapTaskFromApi = (task) => {
    const taskTypeInfo = getTaskTypeInfoFromActivityType(task?.activity_type ?? task?.task_type);

    return {
      ...task,
      start_date: task.task_start_date || task.start_date,
      end_date: task.task_end_date || task.end_date,
      task_type: taskTypeInfo.label,
      task_type_code: taskTypeInfo.code,
      task_type_numeric_code: taskTypeInfo.numericCode,
      task_title: task.task_title?.trim() || 'Sin título',
      tags: task.tags ? Object.values(task.tags) : [],
      progress: parseFloat(task.progress) || 0
    };
  };



  // ✅ API Real - Migración Sofactia (05/02/2026)
  useEffect(() => {
    console.log("🚀 Iniciando carga de tareas reales...");

    dispatch(fetchListTaskNew({})).then((data) => {
      if (data?.payload?.messages === 'Success') {
        const tasksData = data?.payload?.data || [];

        console.log("📋 Procesando tareas recibidas:", tasksData.length);
        console.log("📋 Tareas recibidas:", tasksData);

        // ⚠️ MAPEO CRÍTICO: La API devuelve campos con nombres diferentes
        const mappedTasks = tasksData.map(mapTaskFromApi);

        setTasks(mappedTasks);
        setIsInitialized(true);

        const hasPendingAttachmentFocus =
          Number(uploadAttachmentFocus?.status) === 200 || Number(uploadAttachmentFocus?.status) === 303;

        // Auto-seleccionar primera tarea si existe y no hay foco pendiente de adjunto
        if (mappedTasks.length > 0 && !selectedTask && !hasPendingAttachmentFocus) {
          //console.log("🎯 Seleccionando primera tarea:", mappedTasks[0].task_title);
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
  }, [dispatch, refreshKey, taskTypeCatalog, i18n.language]);

  useEffect(() => {
    const status = Number(uploadAttachmentFocus?.status);
    const logtaskId = Number(uploadAttachmentFocus?.logtask_id);
    const commentId = Number(uploadAttachmentFocus?.comment_id);

    if (!(status === 200 || status === 303) || !Number.isFinite(logtaskId) || logtaskId <= 0) {
      return;
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return;
    }

    const focusKey = `${logtaskId}:${Number.isFinite(commentId) ? commentId : ''}`;
    if (lastAppliedAttachmentFocusRef.current === focusKey) {
      return;
    }

    const targetTask = tasks.find(
      (task) =>
        Array.isArray(task?.logtask_list)
        && task.logtask_list.some((logtask) => Number(logtask?.id) === logtaskId)
    );

    if (!targetTask) {
      return;
    }

    lastAppliedAttachmentFocusRef.current = focusKey;
    handleSelectTask(targetTask, {
      preferredLogtaskId: logtaskId,
      openDrawer: true,
      focusedCommentId: Number.isFinite(commentId) ? commentId : null
    });
    dispatch(clearUploadAttachmentFocus());
  }, [uploadAttachmentFocus, tasks, dispatch]);

  // ✅ Filtro de tareas por palabras clave, estado y fechas
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      if (selectedLegalTaskIdSet.size > 0 && !selectedLegalTaskIdSet.has(String(task?.id))) {
        return false;
      }

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
        const hasExecutor = executors.hasOwnProperty(executorFilter.trim());
        
        if (!hasExecutor) return false;
      }

      // 5. Filtro por Revisor
      if (reviewerFilter && reviewerFilter.trim() !== '') {
        const reviewers = task.reviewers || {};
        const hasReviewer = reviewers.hasOwnProperty(reviewerFilter.trim());
        
        if (!hasReviewer) return false;
      }

      // 6. Filtro por Etiquetas
      if (etiquetasFilter && etiquetasFilter.trim() !== '') {
        const tags = task.tags || [];
        const hasTag = tags.some(tag => String(tag.id) === etiquetasFilter.trim());
        
        if (!hasTag) return false;
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
  }, [
    tasks,
    selectedLegalTaskIdSet,
    keywordsFilter,
    statusFilter,
    sortBy,
    startDateFilter,
    endDateFilter,
    executorFilter,
    reviewerFilter,
    etiquetasFilter
  ]);


  // ✅ LAZY LOADING DE TAREAS
  // 1. Resetear página y scroll SOLO cuando cambian los filtros principales (NO cuando cambia visibleTasks por lazy load)
  const lastMainFilters = useRef({
    keywordsFilter: null,
    statusFilter: null,
    sortBy: null,
    startDateFilter: null,
    endDateFilter: null,
    executorFilter: null,
    reviewerFilter: null,
    etiquetasFilter: null,
    selectedLegalTaskIds: null
  });

  useEffect(() => {
    const mainFilters = {
      keywordsFilter,
      statusFilter,
      startDateFilter,
      endDateFilter,
      executorFilter,
      reviewerFilter,
      etiquetasFilter,
      selectedLegalTaskIds: JSON.stringify(selectedLegalTaskIds)
    };
    const filtersChanged = Object.keys(mainFilters).some(
      key => lastMainFilters.current[key] !== mainFilters[key]
    );
    if (filtersChanged) {
      setCurrentPage(1);
      setVisibleTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
      setIsLoadingMoreTasks(false);
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    }
    lastMainFilters.current = mainFilters;
  }, [keywordsFilter, statusFilter, startDateFilter, endDateFilter, executorFilter, reviewerFilter, etiquetasFilter, selectedLegalTaskIds, filteredTasks]);

  // 2. Cuando cambia la página, cargar más tareas (lazy load) solo en frontend
  useEffect(() => {
    if (currentPage === 1) return;
    setIsLoadingMoreTasks(true);
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    const nextBatch = filteredTasks.slice(startIndex, endIndex);
    const timer = setTimeout(() => {
      setVisibleTasks(prev => {
        // Evitar duplicados si el usuario hace scroll muy rápido
        const ids = new Set(prev.map(t => t.id));
        const uniqueBatch = nextBatch.filter(t => !ids.has(t.id));
        return [...prev, ...uniqueBatch];
      });
      setIsLoadingMoreTasks(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // 3. Cuando cambian los datos filtrados (por ejemplo, al cargar la primera vez o cambiar la API),
  // solo resetear visibleTasks si currentPage === 1 (es decir, tras un reset de filtros o carga inicial)
  useEffect(() => {
    if (currentPage === 1) {
      setVisibleTasks(filteredTasks.slice(0, TASKS_PER_PAGE));
    }
    // Si currentPage > 1, NO sobrescribas visibleTasks (deja que el lazy load acumule)
    // Esto previene que el loader se quede atascado y la lista no crezca
  }, [filteredTasks, currentPage]);



  // 3. Intersection Observer para cargar más tareas
  useEffect(() => {
    if (isLoadingMoreTasks) return; // No observar si ya está cargando
    if (visibleTasks.length >= filteredTasks.length) return; // No observar si ya se cargaron todas

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isLoadingMoreTasks && visibleTasks.length < filteredTasks.length) {
        setCurrentPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });

    const loader = loaderRef.current;
    if (loader) observer.observe(loader);

    return () => {
      if (loader) observer.unobserve(loader);
      observer.disconnect();
    };
  }, [visibleTasks.length, filteredTasks.length, isLoadingMoreTasks]);

  /*
    Selecciona una tarea y gestiona la carga de sus seguimientos (logtasks).
    Si la tarea ya tiene logs, los usa; de lo contrario, los solicita a la API.
   */
  const handleSelectTask = (task, options = {}) => {
    const preferredLogtaskId = Number(options?.preferredLogtaskId);
    const hasPreferredLogtask = Number.isFinite(preferredLogtaskId) && preferredLogtaskId > 0;
    const openDrawer = Boolean(options?.openDrawer);

    setSelectedTask(task);
    setSelectedLogtask(null);
    if (!openDrawer) {
      setIsEditDrawerOpen(false); // Close drawer when switching tasks
      setFocusedCommentId(null);
    }

    const applyDrawerFocus = (resolvedLogtask) => {
      if (!openDrawer || !resolvedLogtask) return;

      setInitialDrawerTab('comentarios');
      setInitialCommentText('');
      setFocusedCommentId(options?.focusedCommentId ?? null);
      setIsEditDrawerOpen(true);
    };

    if (task?.logtask_list && task.logtask_list.length > 0) {
      setLogtasks(task.logtask_list);

      const nextLogtask = hasPreferredLogtask
        ? task.logtask_list.find((logtask) => Number(logtask?.id) === preferredLogtaskId)
        : null;
      const resolvedLogtask = nextLogtask || task.logtask_list[0] || null;

      setSelectedLogtask(resolvedLogtask);
      applyDrawerFocus(resolvedLogtask);
    } else {
      dispatch(fetchLogtaskList({ task_id: task.id })).then((data) => {
        if (data?.payload?.messages === 'Success') {
          const logtaskData = data?.payload?.data || [];
          setLogtasks(logtaskData);

          const nextLogtask = hasPreferredLogtask
            ? logtaskData.find((logtask) => Number(logtask?.id) === preferredLogtaskId)
            : null;
          const resolvedLogtask = nextLogtask || logtaskData[0] || null;

          if (logtaskData.length > 0) {
            setSelectedLogtask(resolvedLogtask);
            applyDrawerFocus(resolvedLogtask);
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

  const getTaskIcon = (taskTypeCode, isSelected) => {
    const typeColors = {
      unique: '#ba68c8',
      permanent: '#ff9800',
      cyclic: '#90a4ae'
    };
    const normalizedTypeCode = String(taskTypeCode || '').trim().toLowerCase();
    const iconColor = isSelected ? '#a4a4a4' : (typeColors[normalizedTypeCode] || '#90a4ae');
    const iconStyle = { fontSize: 16, color: iconColor, transition: 'color 0.2s ease' };

    switch (normalizedTypeCode) {
      case 'unique': return <UniqueIcon sx={iconStyle} />;
      case 'permanent': return <PermanentIcon sx={iconStyle} />;
      case 'cyclic':
      default: return <SyncIcon sx={iconStyle} />;
    }
  };

  const getStatusCodeFromItem = (statusItem) =>
    normalizeStatusCode(statusItem?.value_number)
    || normalizeStatusCode(statusItem?.value)
    || normalizeStatusCode(statusItem?.label)
    || null;

  
  const statusFilters = useMemo(() => {
    const desiredOrder = ['3', '1', '4', '2'];
    return desiredOrder
      .filter((code) => STATUS_FILTER_META[code])
      .map((code) => ({
        code,
        label: STATUS_FILTER_META[code].label,
        color: STATUS_FILTER_META[code].color
      }));
  }, [STATUS_FILTER_META]);

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
    const initialCountsByStatus = normalizedTaskStatusCatalog.reduce((acc, status) => {
      acc[status.numericCode] = 0;
      return acc;
    }, {});

    const completedStatusCode =
      normalizedTaskStatusCatalog.find((status) => status.code === 'completed')?.numericCode || '1';

    if (!logtasks || logtasks.length === 0) {
      return { countsByStatus: initialCountsByStatus, averageProgress: 0 };
    }

    const countsByStatus = { ...initialCountsByStatus };
    let totalProgress = 0;

    logtasks.forEach(lt => {
      const status = normalizeStatusCode(lt.logtask_status || lt.task_status || lt.status);
      // Asegurar que sea número
      let progress = parseFloat(lt.percentage || lt.progress || 0);

      // Si el estado es "Completado" (1), forzamos 100% para el cálculo promedio
      // esto corrige casos donde la BE envía status:1 pero progress:0
      if (status === completedStatusCode) {
        progress = 100;
      }

      totalProgress += progress;

      if (status) {
        countsByStatus[status] = (countsByStatus[status] || 0) + 1;
      }
    });

    return {
      countsByStatus,
      averageProgress: Math.round(totalProgress / logtasks.length)
    };
  }, [logtasks, normalizedTaskStatusCatalog]);

  const statsByStatusCode = useMemo(
    () => stats.countsByStatus || {},
    [stats]
  );

  const chartStatusItems = useMemo(
    () =>
      normalizedTaskStatusCatalog.map((status) => ({
        code: status.numericCode,
        label: status.label,
        color: status.color,
        count: Number(statsByStatusCode[status.numericCode] || 0)
      })),
    [normalizedTaskStatusCatalog, statsByStatusCode]
  );

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
          flexShrink: 0,
          height: '100%', // Ensure sidebar fills parent height
          minHeight: 0 // Prevent overflow issues
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
        <List
          ref={listRef}
          sx={{
            p: 1,
            flex: 1,
            overflowY: 'auto',
            minHeight: 0, // Ensure List can shrink
            maxHeight: '100%', // Prevent List from overflowing sidebar
            height: '100%', // Fill sidebar height for proper scrolling
            bgcolor: '#f8f9fa'
          }}
        >
          {(!isInitialized || taskListLoading) ? (
            <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ mx: 2, my: 0.5, py: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#888888', fontSize: '0.75rem', fontWeight: 600 }}>
                {t('no_tasks_found')}
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
                        py: 1,
                        px: 1,
                        justifyContent: 'center',
                        borderLeft: `4px solid ${itemStatusColor}`,
                        borderRadius: '0 8px 8px 0',
                        mb: 1,
                        bgcolor: isSelected ? `${selectedBgColor} !important` : '#ffffff',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        '&:hover': { 
                          bgcolor: hoverBgColor,
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-1px)'
                        },
                        minHeight: '48px',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >

                      {/* Vista colapsada */}
                      {isCollapsed && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}>
                          <Typography 
                            sx={{ 
                              fontWeight: 600, 
                              color: isSelected ? '#263238' : '#5b5b5b', 
                              fontSize: '0.7rem', 
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}
                          >
                            {task.id || '?'}
                          </Typography>
                        </Box>
                      )}

                      {/* Título de la tarea */}
                      {!isCollapsed && (
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1 }}>
                                {showTaskTitleTooltip ? (
                                  <Tooltip title={task.task_title} placement="right">
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
                                  </Tooltip>
                                ) : (
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
                                )}

                              <Typography 
                                sx={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 400, 
                                  color: isSelected ? '#78909c' : '#90a4ae'
                                }}
                              >
                                # {task.id}
                              </Typography>
                              <Tooltip title={t('task_options')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleTaskMenuClick(e, task)}
                                  sx={{
                                    p: 0.5,
                                    color: isSelected ? '#757575' : '#90a4ae',
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {/* Menú de opciones de tarea */}
                              <Menu
                                anchorEl={taskMenuAnchor}
                                open={Boolean(taskMenuAnchor)}
                                onClose={handleTaskMenuClose}
                                onClick={(e) => e.stopPropagation()}
                                PaperProps={{
                                  elevation: 1,
                                  sx: {
                                    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.07)',
                                    border: '1px solid rgba(0, 0, 0, 0.04)',
                                    borderRadius: '8px'
                                  }
                                }}
                              >
                                {canEditTask && (
                                  <MenuItem onClick={handleEditTask}>
                                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                    {t('edit_task')}
                                  </MenuItem>
                                )}
                                {canCreateTags && (
                                  <MenuItem onClick={handleAddTag}>
                                    <AddIcon fontSize="small" sx={{ mr: 1 }} />
                                    {t('add_tag')}
                                  </MenuItem>
                                )}
                                {/* Modal para agregar etiqueta (fuera del Menu para evitar errores de onClose) */}
                                <AddTagDialog
                                  open={addTagDialogOpen}
                                  setIsOpen={setAddTagDialogOpen}
                                  taskId={taskIdForTag}
                                  onTagsSaved={(updatedTaskId) => {
                                    dispatch(fetchListTaskNew()).then((data) => {
                                      const tasksData = data?.payload?.data || [];
                                      const mappedTasks = tasksData.map(task => ({
                                        ...task,
                                        start_date: task.task_start_date || task.start_date,
                                        end_date: task.task_end_date || task.end_date,
                                        ...mapTaskFromApi(task)
                                      }));
                                      const found = mappedTasks.find(t => String(t.id) === String(updatedTaskId));
                                      if (found) {
                                        setSelectedTask(found);
                                        setTimeout(() => {
                                          if (listRef.current) {
                                            const listItems = listRef.current.querySelectorAll('.MuiListItemButton-root');
                                            for (let item of listItems) {
                                              if (item.textContent.includes(`# ${updatedTaskId}`)) {
                                                item.focus();
                                                break;
                                              }
                                            }
                                          }
                                        }, 200);
                                      }
                                    });
                                  }}
                                />
                                {canDeleteTask && (
                                  <MenuItem onClick={handleDeleteTask} sx={{ '&:hover': { color: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.04)' } }}>
                                    <DeleteOutline fontSize="small" sx={{ mr: 1, '&:hover': { color: '#d32f2f' } }} />
                                    {t('delete_task')}
                                  </MenuItem>
                                )}
                              </Menu>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip 
                                icon={getTaskIcon(task.task_type_code, isSelected)}
                                label={task.task_type || getTaskTypeInfoFromActivityType(task?.activity_type).label}
                                size="small"
                                sx={{
                                  height: 'auto',
                                  mb: 0.5,
                                  mr: 0.5,
                                  p: 0.3,
                                  backgroundColor: isSelected ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  borderRadius: '12px',
                                  '& .MuiChip-label': {
                                    textTransform: 'uppercase',
                                    fontSize: '0.6rem',
                                    fontWeight: 500,
                                    color: isSelected ? '#4a4a4a' : '#6a6a6a',
                                    px: 0.5
                                  },
                                  '& .MuiChip-icon': {
                                    marginLeft: 0.5,
                                    marginRight: -0.2,
                                    color: isSelected ? '#6a6a6a' : '#8a8a8a',
                                    fontSize: '1.27em !important',
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              />
                              {/* Etiquetas de la tarea - Indicadores circulares */}
                              {task.tags && Object.values(task.tags).map((tag) => (
                                <Tooltip key={tag.id} title={tag.tag_name} placement="bottom-start" arrow>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: `#${tag.tag_color}`,
                                      mb: 0.5,
                                      mr: 0.5,
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                      border: '1px solid rgba(255,255,255,0.3)',
                                      cursor: 'pointer',
                                      transition: 'transform 0.2s ease',
                                      '&:hover': {
                                        transform: 'scale(1.2)'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
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
                    {t('no_more_tasks')}
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
              {t('tasks_found_count', { filtered: filteredTasks.length, total: tasks.length })}
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
                {/* ID de la tarea */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
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
                  text={stripHtmlTags(selectedTask.task_description || '')}
                  maxChars={100}
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
                  chartData={chartStatusItems.map((item) => ({
                    key: item.code,
                    value: item.count,
                    color: item.color,
                    label: item.label
                  }))}
                  size={88}
                  strokeWidth={9}
                  taskState={getTaskPriorityStatus(selectedTask)} // Pasamos el estado (código '1', '2', '3' o '4')
                />

                {/* Estados de los ciclos en formato vertical */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, alignItems: 'flex-start' }}>
                  {chartStatusItems.map((item) => (
                    <Box key={item.code} display="flex" alignItems="center" gap={0.5}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: item.color || '#90a4ae' }} />
                      <Typography sx={{ color: '#78909c', fontWeight: 600, fontSize: '0.8rem' }}>
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
            taskStatusCatalog={normalizedTaskStatusCatalog}
            onSelectCycle={(cycle) => {
              setSelectedLogtask(cycle);
              setFocusedCommentId(null);
            }}
            onOpenFollowup={(cycle) => {
              setSelectedLogtask(cycle);
              setInitialDrawerTab('comentarios');
              setInitialCommentText('');
              setFocusedCommentId(null);
              setIsEditDrawerOpen(true);
            }}
            onCloseCycle={(cycle) => {
              setSelectedLogtask(cycle);
              setInitialDrawerTab('crear_comentario');
              setInitialCommentText(t('close_cycle'));
              setFocusedCommentId(null);
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
        onCloseEditDrawer={(hasUnsavedChanges = false) => {
          if (hasUnsavedChanges) {
            setShowUnsavedChangesDialog(true);
            setPendingCloseAction(() => () => {
              setIsEditDrawerOpen(false);
              setInitialDrawerTab('comentarios');
              setInitialCommentText('');
              resetFocusedDrawerFilters();
            });
          } else {
            setIsEditDrawerOpen(false);
            setInitialDrawerTab('comentarios');
            setInitialCommentText('');
            resetFocusedDrawerFilters();
          }
        }}
        logTaskDetails={selectedLogtask || {}}
        initialTab={initialDrawerTab}
        initialCommentText={initialCommentText}
        focusedCommentId={focusedCommentId}
        onDrawerOpened={() => {
          console.log('[DEBUG] Edición finalizada / Drawer cerrado completamente');
        }}
        onCommentAdded={handleRefreshLogtasks}
      />

      {/* Diálogo de confirmación para eliminar tarea */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {t('confirm_delete_title')}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#546e7a' }}>
            {t('confirm_delete_message')}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCancelDelete}
            sx={{ 
              textTransform: 'none',
              color: '#757575',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            {t('cancel')}
          </Button>
          
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              bgcolor: '#d32f2f',
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para cambios sin guardar */}
      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExitWithoutSave}
        onCancel={handleCancelExit}
      />

      {/* Modal para agregar etiqueta: debe ir fuera de cualquier Menu o Drawer para evitar cierre inmediato y problemas de stacking */}
      <AddTagDialog
        open={addTagDialogOpen}
        setIsOpen={setAddTagDialogOpen}
        taskId={taskIdForTag}
        onTagsSaved={(updatedTaskId) => {
          // Esperar a que fetchListTaskNew termine y luego seleccionar la tarea
          // fetchListTaskNew es async thunk, así que podemos esperar a que termine
          dispatch(fetchListTaskNew()).then((data) => {
            const tasksData = data?.payload?.data || [];
            const mappedTasks = tasksData.map(mapTaskFromApi);
            const found = mappedTasks.find(t => String(t.id) === String(updatedTaskId));
            if (found) {
              setSelectedTask(found);
              // Scroll al elemento si es necesario
              setTimeout(() => {
                if (listRef.current) {
                  const listItems = listRef.current.querySelectorAll('.MuiListItemButton-root');
                  for (let item of listItems) {
                    if (item.textContent.includes(`# ${updatedTaskId}`)) {
                      item.focus();
                      break;
                    }
                  }
                }
              }, 200);
            }
          });
        }}
      />
    </Box>
  );
};

export default TasksListView;
