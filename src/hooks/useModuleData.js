import { useDispatch, useSelector } from 'react-redux';
import { fetchActionCount } from '../stores/actions/fetchActionSlice';
import { fetchTaskCounts } from '../stores/tasks/fetchTaskCountsSlice';
import { fetchLegalCounts } from '../stores/legal/fetchLegalCountsSlice';
import { setModuleData, setModuleLoading, setModuleError } from '../stores/moduleStatisticsSlice';
import { normalizeStatusCode, showErrorMsg } from '../utils/others';

const toNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const TASK_STATUS_FALLBACK = [
  { numeric_code: 3, code: 'pending', label: 'Abierto', color: '#ffc107' },
  { numeric_code: 1, code: 'completed', label: 'Cerrado', color: '#28a745' },
  { numeric_code: 4, code: 'delayed', label: 'Vencido', color: '#dc3545' },
  { numeric_code: 2, code: 'permanent', label: 'Permanente', color: '#348fe2' }
];

const normalizeTaskStatusCatalog = (taskStatusCatalog = []) => {
  const sourceCatalog = Array.isArray(taskStatusCatalog) && taskStatusCatalog.length
    ? taskStatusCatalog
    : TASK_STATUS_FALLBACK;

  return sourceCatalog
    .map((statusItem) => {
      const normalizedNumericCode = normalizeStatusCode(statusItem?.numeric_code);
      if (!normalizedNumericCode) return null;

      const fallbackStatus = TASK_STATUS_FALLBACK.find(
        (item) => normalizeStatusCode(item.numeric_code) === normalizedNumericCode
      );

      return {
        numericCode: normalizedNumericCode,
        code: String(statusItem?.code || fallbackStatus?.code || '').trim(),
        label: String(statusItem?.label || fallbackStatus?.label || '').trim(),
        color: String(statusItem?.color || fallbackStatus?.color || '').trim() || fallbackStatus?.color
      };
    })
    .filter(Boolean);
};

const buildTaskModuleData = (data = {}, taskStatusCatalog = []) => {
  const statusCatalog = normalizeTaskStatusCatalog(taskStatusCatalog);
  const taskStatusCounts = data?.tasks || {};
  const cycleStatusCounts = data?.logtasks || {};

  const statusItems = statusCatalog.map((statusItem) => {
    const taskCount = toNumber(taskStatusCounts?.[statusItem.numericCode]);
    const cycleCount = toNumber(cycleStatusCounts?.[statusItem.numericCode]);

    return {
      ...statusItem,
      taskCount,
      cycleCount
    };
  });

  const getCountByCode = (targetCode) => {
    const status = statusItems.find((item) => item.code === targetCode);
    return {
      taskCount: toNumber(status?.taskCount),
      cycleCount: toNumber(status?.cycleCount)
    };
  };

  const pendingCounts = getCountByCode('pending');
  const completedCounts = getCountByCode('completed');
  const delayedCounts = getCountByCode('delayed');
  const permanentCounts = getCountByCode('permanent');

  return {
    numberOfTasks: toNumber(data?.total_tasks),
    numberOfCycles: toNumber(data?.total_logtasks),

    // Compatibilidad con consumidores existentes
    openTasks: pendingCounts.taskCount,
    completedTasks: completedCounts.taskCount,
    closedTasks: completedCounts.taskCount,
    delayedTasks: delayedCounts.taskCount,
    inProgressTasks: permanentCounts.taskCount,

    openCycles: pendingCounts.cycleCount,
    completedCycles: completedCounts.cycleCount,
    closedCycles: completedCounts.cycleCount,
    delayedCycles: delayedCounts.cycleCount,
    inProgressCycles: permanentCounts.cycleCount,

    // Datos dinámicos para gráficas según configuración
    taskStatusData: statusItems.map((status) => ({
      code: status.code,
      label: status.label,
      color: status.color,
      value: status.taskCount
    })),
    cycleStatusData: statusItems.map((status) => ({
      code: status.code,
      label: status.label,
      color: status.color,
      value: status.cycleCount
    }))
  };
};

export const useModuleData = () => {
  const dispatch = useDispatch();
  const moduleData = useSelector((state) => state.moduleStatistics);
  const taskStatusCatalog = useSelector(
    (state) => state.platformConfig?.data?.modules?.task?.catalogs?.status ?? []
  );

  const MODULE_CONFIG = [
    {
      id: 'actions',
      label: 'Actions',
      reduxFetchAction: fetchActionCount,
      transformData: (data) => ({
        openActions: toNumber(data?.open),
        closedActions: toNumber(data?.closed),
        cancelledActions: toNumber(data?.cancelled),
        delayedActions: toNumber(data?.delayed),
        totalActions: toNumber(data?.total)
      })
    },
    {
      id: 'tasks',
      label: 'Tasks',
      reduxFetchAction: fetchTaskCounts,
      transformData: (data) => buildTaskModuleData(data, taskStatusCatalog)
    },
    {
      id: 'legals',
      label: 'Legals',
      reduxFetchAction: fetchLegalCounts,
      transformData: (data) => ({
        numberOfTasks: toNumber(data?.total_articles),
        completedTasks: toNumber(data?.completed_articles),
        inProgressTasks: toNumber(data?.inprogress_articles),
        openTasks: toNumber(data?.open_articles),
        delayedTasks: toNumber(data?.delayed_articles),
        numberOfCycles: toNumber(data?.total_requirements),
        completedCycles: toNumber(data?.completed_requirements),
        inProgressCycles: toNumber(data?.inprogress_requirements),
        openCycles: toNumber(data?.open_requirements),
        delayedCycles: toNumber(data?.delayed_requirements)
      })
    }
  ];

  // Function to fetch data for a specific module
  const fetchModuleData = (moduleConfig) => {
    // Set loading state
    dispatch(setModuleLoading({ moduleId: moduleConfig.id, loading: true }));

    dispatch(moduleConfig.reduxFetchAction())
      .then((response) => {
        if (response?.payload?.messages === 'Success') {
          const transformedData = moduleConfig.transformData(response?.payload?.data);
          dispatch(
            setModuleData({
              moduleId: moduleConfig.id,
              data: transformedData,
              loading: false
            })
          );
          // console.log(`${moduleConfig.id} data:`, transformedData);
        } else {
          dispatch(
            setModuleError({
              moduleId: moduleConfig.id,
              error: response?.payload?.message || 'Failed to fetch data'
            })
          );
          showErrorMsg(response?.payload?.message);
        }
      })
      .catch((error) => {
        dispatch(
          setModuleError({
            moduleId: moduleConfig.id,
            error: error.message || 'Network error'
          })
        );
      });
  };

  // Function to fetch data for a specific module by ID
  const fetchModuleDataById = (moduleId) => {
    const moduleConfig = MODULE_CONFIG.find((config) => config.id === moduleId);
    if (moduleConfig) {
      fetchModuleData(moduleConfig);
    } else {
      console.error(`Module config not found for ID: ${moduleId}`);
    }
  };

  // Function to fetch all modules data
  const fetchAllModulesData = () => {
    MODULE_CONFIG.forEach(fetchModuleData);
  };

  return {
    moduleData,
    fetchModuleData,
    fetchModuleDataById,
    fetchAllModulesData,
    // Helper functions for easier data access
    getModuleData: (moduleId) => moduleData[moduleId]?.data || null,
    getModuleLoading: (moduleId) => moduleData[moduleId]?.loading || false,
    getModuleError: (moduleId) => moduleData[moduleId]?.error || null,
    isModuleLoaded: (moduleId) =>
      moduleData[moduleId]?.data !== null && !moduleData[moduleId]?.loading
  };
};
