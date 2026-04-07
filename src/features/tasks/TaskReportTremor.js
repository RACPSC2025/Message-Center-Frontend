import { Download } from '@mui/icons-material';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TheFullPageLoader from '../../components/TheFullPageLoader';
import { useModuleCatalogs } from '../../hooks/usePlatformConfig';
import { selectFilterItemValue } from '../../stores/filterSlice';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';
import { normalizeStatusCode, stripHtmlTags } from '../../utils/others';

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.values(value);
  return [];
};

const toPeopleNames = (people) =>
  toArray(people)
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (typeof entry === 'object') {
        return String(entry?.name || entry?.full_name || entry?.nb_user || entry?.label || '').trim();
      }
      return '';
    })
    .filter(Boolean);

const getTagName = (tag) => String(tag?.tag_name || tag?.name || tag?.label || tag?.nb_tag || '').trim();

const STATUS_FALLBACK = {
  '1': { label: 'completed', color: '#28a745' },
  '2': { label: 'in_progress', color: '#348fe2' },
  '3': { label: 'pending', color: '#ffc107' },
  '4': { label: 'delayed', color: '#dc3545' }
};

const normalizeTask = (task) => ({
  ...task,
  id: task?.id,
  task_title: (task?.task_title || '').trim(),
  task_description: stripHtmlTags(task?.task_description || ''),
  start_date: task?.task_start_date || task?.start_date || null,
  end_date: task?.task_end_date || task?.end_date || null,
  task_status: normalizeStatusCode(task?.task_status || task?.status) || '3',
  progress: Number.parseFloat(task?.progress || 0) || 0,
  tags: toArray(task?.tags),
  responsibles: toPeopleNames(task?.responsibles),
  reviewers: toPeopleNames(task?.reviewers),
  logtask_list: toArray(task?.logtask_list)
});

const taskMatchesDateRange = (task, startDateFilter, endDateFilter) => {
  if (!startDateFilter && !endDateFilter) return true;

  const taskStartDate = task.start_date ? new Date(task.start_date) : null;
  const taskEndDate = task.end_date ? new Date(task.end_date) : null;
  const filterStartDate = startDateFilter ? new Date(startDateFilter) : null;
  const filterEndDate = endDateFilter ? new Date(endDateFilter) : null;

  if (filterStartDate) {
    const taskDateToCheck = taskEndDate || taskStartDate;
    if (!taskDateToCheck || taskDateToCheck < filterStartDate) return false;
  }

  if (filterEndDate) {
    const taskDateToCheck = taskStartDate || taskEndDate;
    if (!taskDateToCheck || taskDateToCheck > filterEndDate) return false;
  }

  return true;
};

const DonutRing = ({ segments, centerMain, centerSub }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, item) => acc + item.value, 0);

  let accumulated = 0;
  const circles = segments.map((segment, index) => {
    const ratio = total > 0 ? segment.value / total : 0;
    const dash = ratio * circumference;
    const offset = -accumulated;
    accumulated += dash;

    return (
      <circle
        key={`${segment.label}-${index}`}
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        stroke={segment.color}
        strokeWidth="12"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="relative h-52 w-52">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e6e8ea" strokeWidth="12" />
        {circles}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900">{centerMain}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{centerSub}</span>
      </div>
    </div>
  );
};

export default function TaskReportTremor() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeaderFilters, setShowHeaderFilters] = useState(false); // Controla visibilidad de título y filtros
  const taskStatusCatalog = useModuleCatalogs('task', 'status') || [];

  const selectedLegalTaskIds = useSelector((state) => selectFilterItemValue(state, 'task', 'selected_legal_task_ids')) || [];
  const keywordsFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_keywords'));
  const statusFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_status'));
  const sortBy = useSelector((state) => selectFilterItemValue(state, 'events', 'sort_by'));
  const startDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_start_date'));
  const endDateFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_end_date'));
  const executorFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_executor'));
  const reviewerFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'filter_reviewer'));
  const etiquetasFilter = useSelector((state) => selectFilterItemValue(state, 'events', 'Etiquetas'));

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchListTaskNew({})).then((response) => {
      const payload = response?.payload;
      const data = payload?.messages === 'Success' ? payload?.data || [] : [];
      setTasks(data.map(normalizeTask));
      setIsLoading(false);
    }).catch(() => {
      setTasks([]);
      setIsLoading(false);
    });
  }, [dispatch]);

  const selectedLegalTaskIdSet = useMemo(
    () => new Set(selectedLegalTaskIds.map((id) => String(id).trim()).filter(Boolean)),
    [selectedLegalTaskIds]
  );

  const statusMap = useMemo(() => {
    const map = { ...STATUS_FALLBACK };

    if (!Array.isArray(taskStatusCatalog)) return map;

    taskStatusCatalog.forEach((statusItem) => {
      const numericCode = normalizeStatusCode(statusItem?.numeric_code);
      if (!numericCode) return;

      map[numericCode] = {
        label: String(statusItem?.label || map[numericCode]?.label || '').trim(),
        color: String(statusItem?.color || map[numericCode]?.color || '').trim() || map[numericCode].color
      };
    });

    return map;
  }, [taskStatusCatalog]);

  const filteredTasks = useMemo(() => {
    const normalizedStatusFilter = normalizeStatusCode(statusFilter);

    const result = tasks.filter((task) => {
      if (selectedLegalTaskIdSet.size > 0 && !selectedLegalTaskIdSet.has(String(task?.id))) return false;

      if (keywordsFilter && !task.task_title.toLowerCase().includes(keywordsFilter.toLowerCase().trim())) return false;

      if (normalizedStatusFilter && task.task_status !== normalizedStatusFilter) return false;

      if (!taskMatchesDateRange(task, startDateFilter, endDateFilter)) return false;

      if (executorFilter && !task.responsibles.some((name) => name === executorFilter.trim())) return false;

      if (reviewerFilter && !task.reviewers.some((name) => name === reviewerFilter.trim())) return false;

      if (etiquetasFilter && !task.tags.some((tag) => String(tag?.id) === etiquetasFilter.trim())) return false;

      return true;
    });

    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case '1':
            return (a.task_title || '').localeCompare(b.task_title || '');
          case '2':
            return (b.task_title || '').localeCompare(a.task_title || '');
          case '3':
            return new Date(b.start_date || 0) - new Date(a.start_date || 0);
          case '4':
            return new Date(a.start_date || 0) - new Date(b.start_date || 0);
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

  const reportData = useMemo(() => {
    const taskStatus = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const cycleStatus = { '1': 0, '2': 0, '3': 0, '4': 0 };
    let progressSum = 0;

    filteredTasks.forEach((task) => {
      taskStatus[task.task_status] += 1;
      progressSum += task.progress;
      task.logtask_list.forEach((cycle) => {
        const code = normalizeStatusCode(cycle?.logtask_status || cycle?.task_status || cycle?.status) || '3';
        cycleStatus[code] += 1;
      });
    });

    const totalTasks = filteredTasks.length;
    const totalCycles = Object.values(cycleStatus).reduce((acc, value) => acc + value, 0);
    const completion = totalTasks > 0 ? Math.round((taskStatus['1'] / totalTasks) * 100) : 0;
    const averageProgress = totalTasks > 0 ? Math.round(progressSum / totalTasks) : 0;

    const firstDonutSegments = [
      {
        label: statusMap['2'].label || t('task_status_in_progress', { defaultValue: 'En progreso' }),
        value: taskStatus['2'],
        color: statusMap['2'].color
      },
      {
        label: statusMap['3'].label || t('task_status_pending', { defaultValue: 'Pendiente' }),
        value: taskStatus['3'],
        color: statusMap['3'].color
      },
      {
        label: statusMap['1'].label || t('task_status_completed', { defaultValue: 'Cerrado' }),
        value: taskStatus['1'],
        color: statusMap['1'].color
      }
    ];

    const completedCycles = cycleStatus['1'];
    const remainingCycles = Math.max(totalCycles - completedCycles, 0);
    const secondDonutSegments = [
      {
        label: statusMap['1'].label || t('task_status_completed', { defaultValue: 'Cerrado' }),
        value: completedCycles,
        color: statusMap['1'].color
      },
      {
        label: statusMap['3'].label || t('task_status_pending', { defaultValue: 'Pendiente' }),
        value: remainingCycles,
        color: statusMap['3'].color
      }
    ];

    return {
      taskStatus,
      cycleStatus,
      totalTasks,
      totalCycles,
      completion,
      averageProgress,
      delayed: taskStatus['4'],
      activeCycles: cycleStatus['2'] + cycleStatus['3'],
      firstDonutSegments,
      secondDonutSegments
    };
  }, [filteredTasks, statusMap, t]);

  const tableRows = filteredTasks.slice(0, 6);

  if (isLoading) {
    return <TheFullPageLoader />;
  }


    return (
      <Box className="min-h-full bg-[#f7f9fb] px-4 py-6 lg:px-8">
        <main className="mx-auto max-w-[1440px] space-y-8">
          {showHeaderFilters && (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-[#191c1e]">{t('task_report_title', { defaultValue: 'Reporte de Gestión y Avance' })}</h1>
                  <p className="mt-1 text-sm text-[#454652]">{t('task_report_subtitle', { defaultValue: 'Visualización detallada del cumplimiento de compromisos institucionales.' })}</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#003aa0] to-[#004fd2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
                  <Download fontSize="small" />
                  {t('task_report_export', { defaultValue: 'Exportar Reporte' })}
                </button>
              </div>

              <section className="flex flex-wrap items-center gap-4 rounded-xl bg-[#f2f4f6] p-4">
                <div className="min-w-[220px] flex-1">
                  <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[#454652]">{t('executioner', { defaultValue: 'Responsables' })}</label>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-[#191c1e]">{executorFilter || t('all', { defaultValue: 'Todos' })}</div>
                </div>
                <div className="min-w-[220px] flex-1">
                  <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[#454652]">{t('reviewers', { defaultValue: 'Revisores' })}</label>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-[#191c1e]">{reviewerFilter || t('all', { defaultValue: 'Todos' })}</div>
                </div>
                <div className="min-w-[180px] flex-1">
                  <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[#454652]">{t('status', { defaultValue: 'Estado' })}</label>
                  <div className="rounded-lg bg-white px-3 py-2 text-sm text-[#191c1e]">{statusFilter || t('all', { defaultValue: 'Cualquier Estado' })}</div>
                </div>
                <div className="min-w-[220px] flex-1">
                  <label className="mb-1 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[#454652]">{t('tags', { defaultValue: 'Tags' })}</label>
                  <div className="flex gap-1 overflow-x-auto rounded-lg bg-white px-2 py-2">
                    {filteredTasks.flatMap((task) => task.tags).slice(0, 4).map((tag, index) => (
                      <span key={`${getTagName(tag)}-${index}`} className="whitespace-nowrap rounded-full border border-[#BBADFF]/30 bg-[#BBADFF]/20 px-2 py-1 text-[10px] font-bold text-[#6a54e6]">
                        {getTagName(tag) || '-'}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#454652]">{t('tasks', { defaultValue: 'Total Tareas' })}</p>
            <h3 className="mt-1 text-4xl font-bold text-[#191c1e]">{reportData.totalTasks}</h3>
            <p className="mt-4 text-xs font-semibold text-[#004e33]">{t('task_report_kpi_1', { defaultValue: 'Consolidado Actual' })}</p>
          </div>
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#454652]">{t('active_cycles', { defaultValue: 'Ciclos Activos' })}</p>
            <h3 className="mt-1 text-4xl font-bold text-[#191c1e]">{reportData.activeCycles}</h3>
            <p className="mt-4 text-xs font-semibold text-[#454652]">{t('task_report_kpi_2', { defaultValue: 'Sin cambios este mes' })}</p>
          </div>
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#454652]">{t('progress', { defaultValue: 'Progreso General' })}</p>
            <h3 className="mt-1 text-4xl font-bold text-[#191c1e]">{reportData.averageProgress}%</h3>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#eceef0]">
              <div className="h-full bg-[#ba1a1a]" style={{ width: `${Math.max(2, reportData.averageProgress)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-8 shadow-sm">
            <h4 className="mb-8 text-lg font-bold text-[#191c1e]">{t('Task_status', { defaultValue: 'Estado de Tareas' })}</h4>
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <DonutRing
                segments={reportData.firstDonutSegments}
                centerMain={reportData.totalTasks}
                centerSub={t('total', { defaultValue: 'Total' })}
              />
              <div className="w-full max-w-[220px] space-y-4">
                {reportData.firstDonutSegments.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-[#454652]">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-8 shadow-sm">
            <h4 className="mb-8 text-lg font-bold text-[#191c1e]">{t('Cycle_status', { defaultValue: 'Cumplimiento de Ciclos' })}</h4>
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <DonutRing
                segments={reportData.secondDonutSegments}
                centerMain={`${reportData.completion}%`}
                centerSub={t('achieved', { defaultValue: 'Logrado' })}
              />
              <div className="w-full max-w-[220px] space-y-4">
                {reportData.secondDonutSegments.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-[#454652]">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                ))}
                <div className="mt-4 border-t border-[#c5c5d4]/20 pt-4 text-[11px] text-[#454652]">
                  {t('task_report_cycles_caption', { defaultValue: 'Basado en el listado de tareas pendientes y ciclos de auditoría actuales.' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#c5c5d4]/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eceef0] p-6">
            <h4 className="text-lg font-bold text-[#191c1e]">{t('task_report_key_tasks', { defaultValue: 'Listado de Tareas Clave' })}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f2f4f6]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">{t('task', { defaultValue: 'ID / Nombre Tarea' })}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">{t('executioner', { defaultValue: 'Responsable' })}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">{t('tags', { defaultValue: 'Etiquetas' })}</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">{t('status', { defaultValue: 'Estado' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {tableRows.map((task) => {
                  const tableStatus = statusMap[task.task_status] || STATUS_FALLBACK['3'];
                  const statusLabel =
                    task.task_status === '1'
                      ? (statusMap['1'].label || t('task_status_completed', { defaultValue: 'Finalizado' }))
                      : task.task_status === '4'
                        ? (statusMap['4'].label || t('task_status_delayed', { defaultValue: 'Vencido' }))
                        : task.task_status === '2'
                          ? (statusMap['2'].label || t('task_status_in_progress', { defaultValue: 'En progreso' }))
                          : (statusMap['3'].label || t('task_status_pending', { defaultValue: 'Pendiente' }));

                  return (
                  <tr key={task.id} className="transition-colors hover:bg-[#f7f9fb]">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-[#191c1e]">{task.task_title || '-'}</p>
                      <p className="text-xs text-[#454652]">Cód: T-{task.id} - {task.end_date ? dayjs(task.end_date).format('DD MMM') : '-'}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-[#454652]">{task.responsibles[0] || t('unassigned', { defaultValue: 'Sin Asignar' })}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {task.tags.slice(0, 2).map((tag, idx) => (
                          <span key={`${task.id}-${idx}`} className="rounded border border-[#BBADFF]/20 bg-[#BBADFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#6a54e6]">
                            {getTagName(tag) || '-'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight" style={{ color: tableStatus.color }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tableStatus.color }}></div>
                        {statusLabel}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Box>
  );
}
