import { Download } from '@mui/icons-material';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TheFullPageLoader from '../../components/TheFullPageLoader';
import { useModuleCatalogs } from '../../hooks/usePlatformConfig';
import { normalizeStatusCode, stripHtmlTags } from '../../utils/others';

const ACTION_STATUS_FALLBACK = {
  '1': { label: 'Closed', color: '#2e7d32' },
  '2': { label: 'In Progress', color: '#0288d1' },
  '3': { label: 'Open', color: '#f9a825' },
  '4': { label: 'Overdue', color: '#c62828' }
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeAction = (action) => ({
  ...action,
  id: action?.action_id || action?.id,
  title: String(action?.action_description || action?.action_title || action?.title || '').trim(),
  statusCode: normalizeStatusCode(action?.action_status || action?.status) || '3',
  responsible: String(
    action?.responsible_person_name || action?.responsable_name || action?.executor_name || action?.responsible_name || ''
  ).trim(),
  reviewer: String(action?.reviewer_person_name || action?.reviewer_name || '').trim(),
  startDate: action?.action_start_date || action?.start_date || null,
  endDate: action?.action_closing_date || action?.action_real_closing_date || action?.end_date || null,
  comments: toNumber(action?.comment_count),
  progress: toNumber(action?.progress || action?.action_progress)
});

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

export default function ActionsReportTremos({ actions = [], isLoading = false }) {
  const { t } = useTranslation();
  const [showHeaderFilters] = useState(false);
  const actionStatusCatalog = useModuleCatalogs('actions', 'status') || [];

  const normalizedActions = useMemo(() => {
    return Array.isArray(actions) ? actions.map(normalizeAction) : [];
  }, [actions]);

  const statusMap = useMemo(() => {
    const map = { ...ACTION_STATUS_FALLBACK };

    if (!Array.isArray(actionStatusCatalog)) return map;

    actionStatusCatalog.forEach((statusItem) => {
      const numericCode = normalizeStatusCode(
        statusItem?.numeric_code || statusItem?.value_number || statusItem?.value || statusItem?.code
      );
      if (!numericCode) return;

      const current = map[numericCode] || ACTION_STATUS_FALLBACK['3'];
      map[numericCode] = {
        label: String(statusItem?.label || statusItem?.title || current.label).trim(),
        color: String(statusItem?.color || statusItem?.color_code || current.color).trim() || current.color
      };
    });

    return map;
  }, [actionStatusCatalog]);

  const reportData = useMemo(() => {
    const statusCount = { '1': 0, '2': 0, '3': 0, '4': 0 };
    let totalProgress = 0;
    let progressSamples = 0;

    normalizedActions.forEach((action) => {
      statusCount[action.statusCode] = (statusCount[action.statusCode] || 0) + 1;
      if (action.progress > 0) {
        totalProgress += action.progress;
        progressSamples += 1;
      }
    });

    const totalActions = normalizedActions.length;
    const closed = statusCount['1'] || 0;
    const open = statusCount['3'] || 0;
    const inProgress = statusCount['2'] || 0;
    const overdue = statusCount['4'] || 0;
    const completion = totalActions > 0 ? Math.round((closed / totalActions) * 100) : 0;
    const averageProgress = progressSamples > 0 ? Math.round(totalProgress / progressSamples) : completion;

    const firstDonutSegments = [
      {
        label: statusMap['2']?.label || t('action_status_in_progress', { defaultValue: 'En progreso' }),
        value: inProgress,
        color: statusMap['2']?.color || ACTION_STATUS_FALLBACK['2'].color
      },
      {
        label: statusMap['3']?.label || t('action_status_pending', { defaultValue: 'Pendiente' }),
        value: open,
        color: statusMap['3']?.color || ACTION_STATUS_FALLBACK['3'].color
      },
      {
        label: statusMap['1']?.label || t('action_status_completed', { defaultValue: 'Cerrado' }),
        value: closed,
        color: statusMap['1']?.color || ACTION_STATUS_FALLBACK['1'].color
      }
    ];

    const secondDonutSegments = [
      {
        label: statusMap['1']?.label || t('action_status_completed', { defaultValue: 'Cerrado' }),
        value: closed,
        color: statusMap['1']?.color || ACTION_STATUS_FALLBACK['1'].color
      },
      {
        label: statusMap['4']?.label || t('action_status_delayed', { defaultValue: 'Vencido' }),
        value: overdue,
        color: statusMap['4']?.color || ACTION_STATUS_FALLBACK['4'].color
      }
    ];

    return {
      totalActions,
      open,
      inProgress,
      closed,
      overdue,
      completion,
      averageProgress,
      firstDonutSegments,
      secondDonutSegments
    };
  }, [normalizedActions, statusMap, t]);

  const tableRows = useMemo(() => {
    return [...normalizedActions]
      .sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))
      .slice(0, 6);
  }, [normalizedActions]);

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
                <h1 className="text-3xl font-bold tracking-tight text-[#191c1e]">
                  {t('action_report_title', { defaultValue: 'Reporte de Gestión de Acciones' })}
                </h1>
                <p className="mt-1 text-sm text-[#454652]">
                  {t('action_report_subtitle', { defaultValue: 'Visualización consolidada del estado y cumplimiento de acciones.' })}
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#003aa0] to-[#004fd2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
                <Download fontSize="small" />
                {t('action_report_export', { defaultValue: 'Exportar Reporte' })}
              </button>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#454652]">{t('actions', { defaultValue: 'Total Acciones' })}</p>
            <h3 className="mt-1 text-4xl font-bold text-[#191c1e]">{reportData.totalActions}</h3>
            <p className="mt-4 text-xs font-semibold text-[#004e33]">
              {t('action_report_kpi_1', { defaultValue: 'Consolidado Actual' })}
            </p>
          </div>
          <div className="rounded-xl border border-[#c5c5d4]/20 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#454652]">{t('action_status', { defaultValue: 'Estado de Acciones' })}</p>
            <h3 className="mt-1 text-4xl font-bold text-[#191c1e]">{reportData.inProgress + reportData.open}</h3>
            <p className="mt-4 text-xs font-semibold text-[#454652]">
              {t('action_report_kpi_2', { defaultValue: 'Acciones activas en seguimiento' })}
            </p>
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
            <h4 className="mb-8 text-lg font-bold text-[#191c1e]">
              {t('action_report_status_title', { defaultValue: 'Estado de Acciones' })}
            </h4>
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <DonutRing
                segments={reportData.firstDonutSegments}
                centerMain={reportData.totalActions}
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
            <h4 className="mb-8 text-lg font-bold text-[#191c1e]">
              {t('action_report_compliance_title', { defaultValue: 'Cumplimiento de Acciones' })}
            </h4>
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
                  {t('action_report_caption', {
                    defaultValue: 'Basado en la lista de acciones vigentes, con colores y nombres del catálogo de estados configurado.'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#c5c5d4]/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eceef0] p-6">
            <h4 className="text-lg font-bold text-[#191c1e]">
              {t('action_report_key_actions', { defaultValue: 'Listado de Acciones Clave' })}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f2f4f6]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">
                    {t('action', { defaultValue: 'ID / Acción' })}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">
                    {t('executioner', { defaultValue: 'Responsable' })}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">
                    {t('reviewers', { defaultValue: 'Revisor' })}
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#454652]">
                    {t('status', { defaultValue: 'Estado' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {tableRows.map((action) => {
                  const tableStatus = statusMap[action.statusCode] || ACTION_STATUS_FALLBACK['3'];

                  return (
                    <tr key={action.id} className="transition-colors hover:bg-[#f7f9fb]">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#191c1e]">{stripHtmlTags(action.title || '-')}</p>
                        <p className="text-xs text-[#454652]">
                          Cód: A-{action.id || '-'} - {action.endDate ? dayjs(action.endDate).format('DD MMM') : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-[#454652]">
                        {action.responsible || t('unassigned', { defaultValue: 'Sin Asignar' })}
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-[#454652]">
                        {action.reviewer || t('unassigned', { defaultValue: 'Sin Asignar' })}
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight"
                          style={{ color: tableStatus.color }}
                        >
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tableStatus.color }}></div>
                          {tableStatus.label}
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
