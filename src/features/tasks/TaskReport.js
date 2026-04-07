import {
  AreaChart,
  Badge,
  BarList,
  Card,
  DonutChart,
  Flex,
  Grid,
  Metric,
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title
} from '@tremor/react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TheFullPageLoader from '../../components/TheFullPageLoader';
import { selectFilterItemValue } from '../../stores/filterSlice';
import { fetchListTaskNew } from '../../stores/tasks/fetchListTaskNewSlice';
import { normalizeStatusCode, stripHtmlTags } from '../../utils/others';

const COLOR_BY_STATUS = {
  '1': 'emerald',
  '2': 'blue',
  '3': 'amber',
  '4': 'rose'
};

const FALLBACK_STATUS_META = {
  '1': { key: 'closed', label: 'closed' },
  '2': { key: 'In_Progress', label: 'In progress' },
  '3': { key: 'task_open', label: 'Open' },
  '4': { key: 'Expired', label: 'Expired' }
};

const TASKS_PER_TABLE = 8;

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
        return (
          entry?.name
          || entry?.full_name
          || entry?.nb_user
          || entry?.label
          || ''
        ).trim();
      }
      return '';
    })
    .filter(Boolean);

const normalizeTask = (task) => ({
  ...task,
  id: task?.id,
  task_title: (task?.task_title || '').trim(),
  task_description: stripHtmlTags(task?.task_description || ''),
  start_date: task?.task_start_date || task?.start_date || null,
  end_date: task?.task_end_date || task?.end_date || null,
  task_status: normalizeStatusCode(task?.task_status || task?.status),
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

export default function TaskReport() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];
  const selectedLegalTaskIds =
    useSelector((state) => selectFilterItemValue(state, 'task', 'selected_legal_task_ids')) || [];

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
    setLoadError('');

    dispatch(fetchListTaskNew({})).then((response) => {
      const payload = response?.payload;
      if (payload?.messages === 'Success') {
        const data = payload?.data || [];
        setTasks(data.map(normalizeTask));
      } else {
        setTasks([]);
        setLoadError(t('task_report_error_loading', { defaultValue: 'Unable to load report data.' }));
      }
    }).catch(() => {
      setTasks([]);
      setLoadError(t('task_report_error_loading', { defaultValue: 'Unable to load report data.' }));
    }).finally(() => {
      setIsLoading(false);
    });
  }, [dispatch, t]);

  const selectedLegalTaskIdSet = useMemo(
    () =>
      new Set(
        (Array.isArray(selectedLegalTaskIds) ? selectedLegalTaskIds : [])
          .map((id) => String(id).trim())
          .filter(Boolean)
      ),
    [selectedLegalTaskIds]
  );

  const statusMeta = useMemo(() => {
    const byCode = {};

    listTaskStatus.forEach((item) => {
      const code = normalizeStatusCode(item?.value_number || item?.value || item?.label);
      if (!code) return;
      byCode[code] = {
        key: item?.label || FALLBACK_STATUS_META[code]?.key,
        label: item?.label || FALLBACK_STATUS_META[code]?.label || code
      };
    });

    Object.keys(FALLBACK_STATUS_META).forEach((code) => {
      if (!byCode[code]) byCode[code] = FALLBACK_STATUS_META[code];
    });

    return byCode;
  }, [listTaskStatus]);

  const filteredTasks = useMemo(() => {
    const normalizedStatusFilter = normalizeStatusCode(statusFilter);

    const result = tasks.filter((task) => {
      if (selectedLegalTaskIdSet.size > 0 && !selectedLegalTaskIdSet.has(String(task?.id))) {
        return false;
      }

      if (keywordsFilter && keywordsFilter.trim() !== '') {
        const searchTerm = keywordsFilter.toLowerCase().trim();
        const titleMatch = task.task_title?.toLowerCase().includes(searchTerm);
        if (!titleMatch) return false;
      }

      if (normalizedStatusFilter && task.task_status !== normalizedStatusFilter) {
        return false;
      }

      if (!taskMatchesDateRange(task, startDateFilter, endDateFilter)) {
        return false;
      }

      if (executorFilter && executorFilter.trim() !== '') {
        const hasExecutor = task.responsibles.some((name) => name === executorFilter.trim());
        if (!hasExecutor) return false;
      }

      if (reviewerFilter && reviewerFilter.trim() !== '') {
        const hasReviewer = task.reviewers.some((name) => name === reviewerFilter.trim());
        if (!hasReviewer) return false;
      }

      if (etiquetasFilter && etiquetasFilter.trim() !== '') {
        const hasTag = task.tags.some((tag) => String(tag?.id) === etiquetasFilter.trim());
        if (!hasTag) return false;
      }

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
    startDateFilter,
    endDateFilter,
    executorFilter,
    reviewerFilter,
    etiquetasFilter,
    sortBy
  ]);

  const analytics = useMemo(() => {
    const taskStatusCounters = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const cycleStatusCounters = { '1': 0, '2': 0, '3': 0, '4': 0 };
    const ownerCounter = {};
    const tagCounter = {};

    let progressAccumulator = 0;
    let cycleTotal = 0;

    filteredTasks.forEach((task) => {
      if (task.task_status && taskStatusCounters[task.task_status] !== undefined) {
        taskStatusCounters[task.task_status] += 1;
      }

      progressAccumulator += task.progress;

      task.responsibles.forEach((person) => {
        ownerCounter[person] = (ownerCounter[person] || 0) + 1;
      });

      task.tags.forEach((tag) => {
        const tagName = String(tag?.name || tag?.label || tag?.nb_tag || '').trim();
        if (!tagName) return;
        tagCounter[tagName] = (tagCounter[tagName] || 0) + 1;
      });

      task.logtask_list.forEach((cycle) => {
        const statusCode = normalizeStatusCode(
          cycle?.logtask_status || cycle?.task_status || cycle?.status
        );
        if (!statusCode || cycleStatusCounters[statusCode] === undefined) return;
        cycleStatusCounters[statusCode] += 1;
        cycleTotal += 1;
      });
    });

    const taskStatusData = Object.keys(taskStatusCounters).map((code) => {
      const item = statusMeta[code] || FALLBACK_STATUS_META[code];
      return {
        code,
        name: t(item.key, { defaultValue: item.label }),
        value: taskStatusCounters[code],
        color: COLOR_BY_STATUS[code]
      };
    });

    const cycleStatusData = Object.keys(cycleStatusCounters).map((code) => {
      const item = statusMeta[code] || FALLBACK_STATUS_META[code];
      return {
        code,
        name: t(item.key, { defaultValue: item.label }),
        value: cycleStatusCounters[code],
        color: COLOR_BY_STATUS[code]
      };
    });

    const ownerRanking = Object.entries(ownerCounter)
      .map(([name, value]) => ({ name, value, color: 'blue' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const tagRanking = Object.entries(tagCounter)
      .map(([name, value]) => ({ name, value, color: 'cyan' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const today = dayjs();
    const trendData = Array.from({ length: 6 }).map((_, index) => {
      const month = today.subtract(5 - index, 'month');
      const monthLabel = month.locale(i18n.language).format('MMM YYYY');
      const count = filteredTasks.filter((task) => {
        if (!task.start_date) return false;
        return dayjs(task.start_date).format('YYYY-MM') === month.format('YYYY-MM');
      }).length;

      return {
        month: monthLabel,
        tareas: count
      };
    });

    const totalTasks = filteredTasks.length;
    const delayedTasks = taskStatusCounters['4'];
    const completionRate = totalTasks > 0
      ? Math.round((taskStatusCounters['1'] / totalTasks) * 100)
      : 0;

    const activeCycles = cycleStatusCounters['2'] + cycleStatusCounters['3'];
    const averageProgress = totalTasks > 0 ? Math.round(progressAccumulator / totalTasks) : 0;

    return {
      totalTasks,
      delayedTasks,
      completionRate,
      activeCycles,
      averageProgress,
      taskStatusData,
      cycleStatusData,
      ownerRanking,
      tagRanking,
      trendData,
      cycleTotal
    };
  }, [filteredTasks, i18n.language, statusMeta, t]);

  const tableRows = useMemo(
    () => filteredTasks.slice(0, TASKS_PER_TABLE),
    [filteredTasks]
  );

  return (
    <Box className="h-full overflow-auto bg-gradient-to-b from-slate-50 via-slate-100 to-cyan-50 px-4 py-4 lg:px-6">
      {isLoading ? (
        <TheFullPageLoader />
      ) : null}
      <div className="mx-auto max-w-[1500px] space-y-5">
        {loadError ? (
          <Card className="border-0 bg-rose-50 shadow-sm">
            <Title>{t('task_report_error_title', { defaultValue: 'Report unavailable' })}</Title>
            <Text className="mt-2">{loadError}</Text>
          </Card>
        ) : null}

        <Card className="border-0 bg-white/85 backdrop-blur-md shadow-sm">
          <Flex alignItems="start" justifyContent="between" className="gap-4">
            <div>
              <Text>{t('report', { defaultValue: 'Report' })}</Text>
              <Title>{t('task_report_title', { defaultValue: 'Task performance dashboard' })}</Title>
              <Text className="mt-1">
                {t('task_report_subtitle', {
                  defaultValue: 'Built with list_tasks_new_complete_amatia_express and synced with current task filters.'
                })}
              </Text>
            </div>
            <Badge color="cyan">{t('task_report_live', { defaultValue: 'Live data' })}</Badge>
          </Flex>
        </Card>

        <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
          <Card decoration="top" decorationColor="blue" className="shadow-sm">
            <Text>{t('tasks', { defaultValue: 'Tasks' })}</Text>
            <Metric>{analytics.totalTasks}</Metric>
            <Text>{t('task_report_filtered_count', { defaultValue: 'Tasks after active filters' })}</Text>
          </Card>

          <Card decoration="top" decorationColor="cyan" className="shadow-sm">
            <Text>{t('active_cycles', { defaultValue: 'Active cycles' })}</Text>
            <Metric>{analytics.activeCycles}</Metric>
            <Text>{t('task_report_cycle_total', { defaultValue: 'Total cycles' })}: {analytics.cycleTotal}</Text>
          </Card>

          <Card decoration="top" decorationColor="rose" className="shadow-sm">
            <Text>{t('Expired', { defaultValue: 'Expired' })}</Text>
            <Metric>{analytics.delayedTasks}</Metric>
            <Text>{t('task_report_risk_label', { defaultValue: 'Tasks in risk status' })}</Text>
          </Card>

          <Card decoration="top" decorationColor="emerald" className="shadow-sm">
            <Text>{t('progress', { defaultValue: 'Progress' })}</Text>
            <Metric>{analytics.averageProgress}%</Metric>
            <ProgressBar value={analytics.averageProgress} color="emerald" className="mt-3" />
          </Card>
        </Grid>

        <Grid numItemsLg={2} className="gap-4">
          <Card className="shadow-sm">
            <Title>{t('Task_status', { defaultValue: 'Task status' })}</Title>
            <Text>{t('task_report_status_split', { defaultValue: 'Distribution by current status' })}</Text>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex min-w-[280px] items-center justify-center">
                <DonutChart
                  className="h-56 w-56"
                  data={analytics.taskStatusData}
                  category="value"
                  index="name"
                  variant="donut"
                  colors={analytics.taskStatusData.map((entry) => entry.color)}
                  valueFormatter={(value) => `${value}`}
                />
              </div>
              <div className="w-full">
                <BarList data={analytics.taskStatusData} />
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <Title>{t('Cycle_status', { defaultValue: 'Cycle status' })}</Title>
            <Text>{t('task_report_cycle_split', { defaultValue: 'Distribution for loaded cycles' })}</Text>
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex min-w-[280px] items-center justify-center">
                <DonutChart
                  className="h-56 w-56"
                  data={analytics.cycleStatusData}
                  category="value"
                  index="name"
                  variant="donut"
                  colors={analytics.cycleStatusData.map((entry) => entry.color)}
                  valueFormatter={(value) => `${value}`}
                />
              </div>
              <div className="w-full">
                <BarList data={analytics.cycleStatusData} />
              </div>
            </div>
          </Card>
        </Grid>

        <Grid numItemsLg={2} className="gap-4">
          <Card className="shadow-sm">
            <Title>{t('task_report_monthly_trend', { defaultValue: 'Monthly task trend' })}</Title>
            <Text>{t('task_report_monthly_trend_desc', { defaultValue: 'Tasks by start date over the last 6 months' })}</Text>
            <AreaChart
              className="mt-5 h-72"
              data={analytics.trendData}
              index="month"
              categories={['tareas']}
              colors={['blue']}
              yAxisWidth={42}
            />
          </Card>

          <Card className="shadow-sm">
            <Title>{t('task_report_owners', { defaultValue: 'Top responsible users' })}</Title>
            <Text>{t('task_report_owners_desc', { defaultValue: 'Who owns most tasks in this filtered set' })}</Text>
            <div className="mt-5">
              {analytics.ownerRanking.length > 0 ? (
                <BarList data={analytics.ownerRanking} />
              ) : (
                <Text>{t('task_report_no_owner_data', { defaultValue: 'No responsible users for the current filters.' })}</Text>
              )}
            </div>

            <Title className="mt-8">{t('Activities_by_tag', { defaultValue: 'Activities by tag' })}</Title>
            <div className="mt-4">
              {analytics.tagRanking.length > 0 ? (
                <BarList data={analytics.tagRanking} />
              ) : (
                <Text>{t('task_report_no_tag_data', { defaultValue: 'No tags available for the current filters.' })}</Text>
              )}
            </div>
          </Card>
        </Grid>

        <Card className="shadow-sm">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Title>{t('task_report_key_tasks', { defaultValue: 'Key task listing' })}</Title>
              <Text>{t('task_report_key_tasks_desc', { defaultValue: 'First tasks after applying the active filters and sort.' })}</Text>
            </div>
            <Badge color="blue">{t('task_report_completion', { defaultValue: 'Completion' })}: {analytics.completionRate}%</Badge>
          </Flex>

          <Table className="mt-5">
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t('task', { defaultValue: 'Task' })}</TableHeaderCell>
                <TableHeaderCell>{t('executioner', { defaultValue: 'Responsible' })}</TableHeaderCell>
                <TableHeaderCell>{t('tags', { defaultValue: 'Tags' })}</TableHeaderCell>
                <TableHeaderCell>{t('status', { defaultValue: 'Status' })}</TableHeaderCell>
                <TableHeaderCell>{t('progress', { defaultValue: 'Progress' })}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((task) => {
                const statusCode = task.task_status || '3';
                const statusItem = statusMeta[statusCode] || FALLBACK_STATUS_META[statusCode];
                const statusLabel = t(statusItem.key, { defaultValue: statusItem.label });
                const firstResponsible = task.responsibles[0] || '-';

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="max-w-[430px]">
                        <Text>{task.task_title || '-'}</Text>
                        <Text className="mt-1 text-xs text-slate-500">
                          {task.task_description || '-'}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell>{firstResponsible}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => {
                          const tagName = String(tag?.name || tag?.label || tag?.nb_tag || '').trim();
                          if (!tagName) return null;
                          return (
                            <Badge key={`${task.id}-${tagName}`} color="cyan">
                              {tagName}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge color={COLOR_BY_STATUS[statusCode] || 'slate'}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Text>{Math.round(task.progress)}%</Text>
                        <ProgressBar value={Math.round(task.progress)} color="blue" className="mt-1" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {tableRows.length === 0 && (
            <div className="py-8">
              <Text>{t('task_report_empty', { defaultValue: 'No tasks available for the selected filters.' })}</Text>
            </div>
          )}
        </Card>
      </div>
    </Box>
  );
}
