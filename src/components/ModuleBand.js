import { useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CalendarDays, List, Table2, BarChart2, Filter, ClipboardList, Mail, MailOpen, Star, Archive } from 'lucide-react';
import { useNavConfig } from '../hooks/useNavConfig';
import { useCascadingFilters } from '../hooks/useCascadingFilters';
import { fetchTaskListLevel } from '../stores/tasks/fetchtaskListLevelSlice';
import { setFilter, removeFilter, selectAppliedFilterModel, selectFilterItemValue } from '../stores/filterSlice';
import FilterBar from './FilterBar';

export const MODULE_BAND_HEIGHT = 48;

// ── View toggle config per module ─────────────────────────────────────────────
const VIEW_CONFIG = {
  events: {
    views: ['calendar', 'list', 'table', 'report'],
    reduxModule: 'task',
    reduxKey: 'selectedTaskView',
    defaultView: 'list',
  },
  actions: {
    views: ['table', 'report'],
    reduxModule: 'actions',
    reduxKey: 'selectedActionsView',
    defaultView: 'table',
  },
  LegalMatriz: {
    views: ['requirements', 'list'],
    reduxModule: 'LegalMatriz',
    reduxKey: 'selectedLegalView',
    defaultView: 'requirements',
  },
};

const VIEW_META = {
  calendar:     { Icon: CalendarDays,  label: 'Calendario'  },
  list:         { Icon: List,          label: 'Lista'        },
  table:        { Icon: Table2,        label: 'Tabla'        },
  report:       { Icon: BarChart2,     label: 'Reporte'      },
  requirements: { Icon: ClipboardList, label: 'Requisitos'   },
};

// ── Org filter config per module ──────────────────────────────────────────────
const ORG_FILTER_CONFIG = {
  events:      { module: 'events',      keyPrefix: ''    },
  actions:     { module: 'actions',     keyPrefix: 'id_' },
  LegalMatriz: { module: 'LegalMatriz', keyPrefix: ''    },
};

// ── ViewToggles ───────────────────────────────────────────────────────────────
function ViewToggles({ moduleKey, bandColor }) {
  const cfg = VIEW_CONFIG[moduleKey];
  const dispatch = useDispatch();
  const currentView = useSelector(
    (state) => selectFilterItemValue(state, cfg.reduxModule, cfg.reduxKey) ?? cfg.defaultView
  );

  return (
    <div
      className="flex items-center gap-4 shrink-0 self-stretch px-4"
      style={{ backgroundColor: `${bandColor}0D` }}
    >
      {cfg.views.map((view) => {
        const { Icon, label } = VIEW_META[view];
        const isActive = currentView === view;
        return (
          <button
            key={view}
            type="button"
            onClick={() =>
              dispatch(setFilter({ module: cfg.reduxModule, updatedFilter: { [cfg.reduxKey]: view } }))
            }
            className="flex flex-col items-center gap-0.5 cursor-pointer transition-all"
          >
            <Icon size={15} color={isActive ? bandColor : '#475569'} />
            <span
              className="text-[9px] uppercase tracking-wider leading-none"
              style={{ fontWeight: isActive ? 800 : 600, color: isActive ? '#0f172a' : '#334155' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── OrgBandFilters ────────────────────────────────────────────────────────────
function OrgBandFilters({ moduleKey }) {
  const cfg = ORG_FILTER_CONFIG[moduleKey];
  const dispatch = useDispatch();
  const currentFilters = useSelector((state) => selectAppliedFilterModel(state, cfg.module));
  const [localState, setLocalState] = useState({});

  const getFormData = (vals) => {
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => { if (v) fd.append(`id_${k}`, v); });
    return fd;
  };

  const fetchLevel = useCallback(
    (level, formData = null) =>
      new Promise((resolve, reject) => {
        dispatch(fetchTaskListLevel(formData ? { level, formData } : { level }))
          .then((d) => {
            const items = d?.payload?.data?.data;
            if (Array.isArray(items)) {
              resolve(items.map((i) => ({ value: i.value, label: i.label })));
            } else {
              reject(new Error(`level ${level} failed`));
            }
          })
          .catch(reject);
      }),
    [dispatch]
  );

  const filterDefinitions = useMemo(
    () => [
      { id: 'level1', label: 'Negocio',   fetchOptions: ()  => fetchLevel(1) },
      { id: 'level2', label: 'Compañía',  fetchOptions: (p) => fetchLevel(2, getFormData(p)) },
      { id: 'level3', label: 'Región',    fetchOptions: (p) => fetchLevel(3, getFormData(p)) },
      { id: 'level4', label: 'Ubicación', fetchOptions: (p) => fetchLevel(4, getFormData(p)) },
    ],
    [fetchLevel]
  );

  const handleChange = useCallback(
    (values) => {
      const prev = { ...localState };
      setLocalState(values);
      Object.entries(values).forEach(([key, value]) => {
        const k = `${cfg.keyPrefix}${key}`;
        if (value && value !== prev[key]) dispatch(setFilter({ module: cfg.module, updatedFilter: { [k]: value } }));
      });
      Object.entries(prev).forEach(([key, prevVal]) => {
        const k = `${cfg.keyPrefix}${key}`;
        if (prevVal && (!values[key] || values[key] === '')) dispatch(removeFilter({ module: cfg.module, fieldID: k }));
      });
    },
    [dispatch, localState, cfg]
  );

  const initialValues = useMemo(() => {
    const v = {};
    filterDefinitions.forEach((f) => {
      const k = `${cfg.keyPrefix}${f.id}`;
      if (currentFilters[k]) v[f.id] = currentFilters[k];
    });
    return v;
  }, []); // eslint-disable-line

  const { filters, handleFilterChange, resetFilters } = useCascadingFilters({
    filterDefinitions,
    initialValues,
    onFilterChange: handleChange,
  });

  const handleClear = () => {
    resetFilters();
    filterDefinitions.forEach((f) =>
      dispatch(removeFilter({ module: cfg.module, fieldID: `${cfg.keyPrefix}${f.id}` }))
    );
    setLocalState({});
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <FilterBar filters={filters} onFilterChange={handleFilterChange} containerProps={{ p: 0, gap: 1 }} />
      <button
        type="button"
        onClick={handleClear}
        className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 h-7 rounded border border-slate-300/70 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors bg-white/40"
      >
        Limpiar
      </button>
    </div>
  );
}

// ── Band content per module ───────────────────────────────────────────────────
function EventsBandContent({ bandColor }) {
  return (
    <>
      <div className="flex items-center gap-3 flex-1 h-full px-4" style={{ backgroundColor: `${bandColor}40` }}>
        <OrgBandFilters moduleKey="events" />
      </div>
      <ViewToggles moduleKey="events" bandColor={bandColor} />
    </>
  );
}

function ActionsBandContent({ bandColor }) {
  return (
    <>
      <div className="flex items-center gap-3 flex-1 h-full px-4" style={{ backgroundColor: `${bandColor}40` }}>
        <OrgBandFilters moduleKey="actions" />
      </div>
      <ViewToggles moduleKey="actions" bandColor={bandColor} />
    </>
  );
}

function LegalMatrizBandContent({ bandColor }) {
  return (
    <>
      <div className="flex items-center gap-3 flex-1 h-full px-4" style={{ backgroundColor: `${bandColor}40` }}>
        <OrgBandFilters moduleKey="LegalMatriz" />
      </div>
      <ViewToggles moduleKey="LegalMatriz" bandColor={bandColor} />
    </>
  );
}

// ── NotificationsBandContent ──────────────────────────────────────────────────
function NotificationsBandContent({ bandColor }) {
  const stats = useSelector((state) => state.dashboardMessageStatistics?.data ?? {});

  const items = [
    { Icon: Mail,    label: 'Total',       count: stats.total_message_count     ?? 0 },
    { Icon: MailOpen,label: 'Sin leer',    count: stats.unread_message_count    ?? 0 },
    { Icon: Star,    label: 'Importantes', count: stats.important_message_count ?? 0 },
    { Icon: Archive, label: 'Archivados',  count: stats.archived_message_count  ?? 0 },
  ];

  return (
    <div className="flex items-center gap-6 flex-1 h-full px-5" style={{ backgroundColor: `${bandColor}20` }}>
      {items.map(({ Icon, label, count }) => (
        <div key={label} className="flex items-center gap-1.5 shrink-0">
          <Icon size={14} color={bandColor} />
          <span className="text-[13px] font-bold leading-none" style={{ color: '#0f172a' }}>{count}</span>
          <span className="text-[9px] uppercase tracking-wider font-semibold leading-none" style={{ color: '#64748b' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const MODULE_CONTENT = {
  events:        EventsBandContent,
  actions:       ActionsBandContent,
  LegalMatriz:   LegalMatrizBandContent,
  notifications: NotificationsBandContent,
};

// ── ModuleBand ────────────────────────────────────────────────────────────────
export function ModuleBand() {
  const activeModule = useSelector((state) => state.globalData.activeModule);
  const { workareas, modules } = useNavConfig();

  const activeModuleDef = useMemo(
    () => modules.find((m) => m.routeKey === activeModule),
    [modules, activeModule]
  );
  const activeWorkarea = useMemo(
    () =>
      workareas.find((wa) => activeModuleDef && wa.modules.includes(activeModuleDef.slug)) ??
      workareas[0],
    [workareas, activeModuleDef]
  );
  const bandColor = activeWorkarea?.color ?? '#00bcd4';
  const BandContent = MODULE_CONTENT[activeModule] ?? null;

  return (
    <div
      style={{ width: '100%', height: MODULE_BAND_HEIGHT, flexShrink: 0 }}
      className="flex overflow-hidden"
    >
      {BandContent && <BandContent bandColor={bandColor} />}
    </div>
  );
}

export default ModuleBand;
