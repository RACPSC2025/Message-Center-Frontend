import { X } from 'lucide-react';
import { useModuleData } from '../hooks/useModuleData';
import { useLanguage } from '../providers/languageProvider';
import { STATUS } from '../config/constants';
import BaseFilter from './BaseFilter';
import StatusDoughnutChart from './StatusDoughnutChart';
import TaskCyclesDoughnutChart from './TasksCyclesDoughnutChart';
import RequirementsArticlesDoughnutChart from './RequirementsArticlesDoughnutChart';

const EMPTY_CYCLES = [
  { key: STATUS.completed, value: 0 },
  { key: STATUS.delayed, value: 0 },
  { key: STATUS.pending, value: 0 },
  { key: STATUS.in_progress, value: 0 }
];

// Per-module chart config, mirroring TheLayoutNavbar MODULE_CONFIG
const CHART_CONFIG = {
  LegalMatriz: {
    Component: RequirementsArticlesDoughnutChart,
    dataId: 'legals',
    getProps: (data) => ({ dataSetTasks: data, dataSetCycles: EMPTY_CYCLES })
  },
  events: {
    Component: TaskCyclesDoughnutChart,
    dataId: 'tasks',
    getProps: (data) => ({ dataSetTasks: data, dataSetCycles: EMPTY_CYCLES })
  },
  actions: {
    Component: StatusDoughnutChart,
    dataId: 'actions',
    getProps: (data) => {
      const statusData =
        Array.isArray(data?.actionStatusData) && data.actionStatusData.length
          ? data.actionStatusData.map((s) => ({
              key: s.code,
              label: s.label,
              color: s.color,
              value: s.value
            }))
          : [
              { key: 'open', value: data?.openActions ?? 0 },
              { key: 'closed', value: data?.closedActions ?? 0 },
              { key: 'delayed', value: data?.delayedActions ?? 0 }
            ];
      return { dataSet: statusData };
    }
  }
};

export function SidebarFilterPanel({ activeModule, activeModuleDef, bandColor, onClose }) {
  const { language } = useLanguage();
  const { moduleData } = useModuleData();

  const getName = (item) =>
    (language === 'en' ? item?.name?.en : item?.name?.es) || item?.name?.es || activeModule;

  const chartCfg = CHART_CONFIG[activeModule];
  const chartRawData = chartCfg ? moduleData[chartCfg.dataId]?.data : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 h-[50px] border-b border-slate-100"
        style={{ borderTop: `3px solid ${bandColor ?? '#00bcd4'}` }}
      >
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {language === 'en' ? 'Filters' : 'Filtros'}
          </p>
          <h3 className="text-sm font-semibold text-slate-700 leading-tight">
            {activeModuleDef ? getName(activeModuleDef) : activeModule}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Chart — only when data is available */}
      {chartCfg && chartRawData && (
        <div className="shrink-0 px-4 pt-3 pb-2 border-b border-slate-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {language === 'en' ? 'Status' : 'Estado'}
          </p>
          <div className="h-36 w-full">
            <chartCfg.Component {...chartCfg.getProps(chartRawData)} />
          </div>
        </div>
      )}

      {/* Filter form */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <BaseFilter component={activeModule} />
      </div>
    </div>
  );
}

export default SidebarFilterPanel;
