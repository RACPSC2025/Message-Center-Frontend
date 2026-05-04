import { useState, useCallback, useEffect, useMemo } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { STATUS_COLORS } from '../config/statusColors';

ChartJS.register(ArcElement, Tooltip);

const darkPanelTheme = createTheme({
  palette: { mode: 'dark' },
  components: {
    MuiTypography:  { styleOverrides: { root: { color: 'rgba(255,255,255,0.72)' } } },
    MuiInputLabel:  { styleOverrides: { root: { color: 'rgba(255,255,255,0.55)' } } },
    MuiInputBase:   { styleOverrides: { input: { color: 'rgba(255,255,255,0.9)' } } },
    MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: 'rgba(255,255,255,0.25)' } } },
  }
});
import { useLanguage } from '../providers/languageProvider';
import { useNavConfig } from '../hooks/useNavConfig';
import { useModuleData } from '../hooks/useModuleData';
import BaseFilter from './BaseFilter';

const COLLAPSED_W = 40;
const EXPANDED_W = 280;

const DONUT_OPTIONS = {
  cutout: '72%',
  animation: false,
  plugins: { legend: { display: false }, tooltip: { enabled: true } },
  maintainAspectRatio: true
};

// Tiny epsilon used to prevent Chart.js from rendering an all-grey empty ring
// when every value in a dataset is 0.
const EPSILON = 0.001;

/**
 * Resolve a status key to its canonical hex color.
 * Falls back to '#90a4ae' when the key is not found in STATUS_COLORS.
 */
function resolveColor(key) {
  return STATUS_COLORS[key] || '#90a4ae';
}

/**
 * Guard a data array so that Chart.js never receives an all-zero slice set.
 * If every value is 0 (or the array is empty) we add a tiny epsilon to the
 * first slot so Chart.js draws the ring shape instead of a grey placeholder.
 */
function guardAllZero(values) {
  if (!values || values.length === 0) return [EPSILON];
  const allZero = values.every((v) => !v || v === 0);
  if (allZero) {
    const patched = [...values];
    patched[0] = EPSILON;
    return patched;
  }
  return values;
}

/**
 * Build a transparent spacer dataset with the same number of data points as
 * the real datasets. Chart.js requires all datasets in a Doughnut to have
 * the same data-point count; a spacer with a different count causes the ring
 * to render invisible.
 */
function makeSpacerDataset(count) {
  const transparent = 'rgba(0,0,0,0)';
  return {
    data: Array(count).fill(0),
    backgroundColor: Array(count).fill(transparent),
    hoverBackgroundColor: Array(count).fill(transparent),
    borderWidth: 0
  };
}

/**
 * Produce the chart datasets + center-text lines for the active module.
 * Returns null when there is no data to show yet.
 */
function buildChartPayload(activeModule, moduleData) {
  // ── events (Tareas) ────────────────────────────────────────────────────────
  if (activeModule === 'events') {
    const d = moduleData?.tasks?.data;
    if (!Array.isArray(d?.taskStatusData) || d.taskStatusData.length === 0) return null;

    const sliceCount = d.taskStatusData.length;
    const taskColors = d.taskStatusData.map((s) => resolveColor(s.code));

    // Cycle ring may use its own per-slot count but shares the same status
    // color order as the task ring.
    const cycleValues = Array.isArray(d.cycleStatusData)
      ? d.cycleStatusData.map((s) => s.value ?? 0)
      : Array(sliceCount).fill(0);
    const cycleColors = Array.isArray(d.cycleStatusData)
      ? d.cycleStatusData.map((s) => resolveColor(s.code))
      : taskColors;

    return {
      datasets: [
        {
          data: guardAllZero(d.taskStatusData.map((s) => s.value ?? 0)),
          backgroundColor: taskColors,
          borderColor: taskColors,
          borderWidth: 0
        },
        makeSpacerDataset(sliceCount),
        {
          data: guardAllZero(cycleValues),
          backgroundColor: cycleColors,
          borderColor: cycleColors,
          borderWidth: 0
        }
      ],
      centerLines: [
        { value: d.numberOfTasks  ?? 0, label: 'Tareas'  },
        { value: d.numberOfCycles ?? 0, label: 'Ciclos'  }
      ]
    };
  }

  // ── actions (Acciones) ─────────────────────────────────────────────────────
  if (activeModule === 'actions') {
    const d = moduleData?.actions?.data;
    if (!Array.isArray(d?.actionStatusData) || d.actionStatusData.length === 0) return null;

    const colors = d.actionStatusData.map((s) => resolveColor(s.code));

    return {
      datasets: [
        {
          data: guardAllZero(d.actionStatusData.map((s) => s.value ?? 0)),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0
        }
      ],
      centerLines: [
        { value: d.totalActions ?? 0, label: 'Acciones' }
      ]
    };
  }

  // ── LegalMatriz (Requisitos legales) ───────────────────────────────────────
  if (activeModule === 'LegalMatriz') {
    const d = moduleData?.legals?.data;
    if (!d) return null;

    // legals data uses openTasks (mapped from open_articles) for the "pending"
    // bucket — the transform in useModuleData.js stores it as openTasks.
    const taskSlices = [
      { key: 'completed',   value: d.completedTasks  ?? 0 },
      { key: 'pending',     value: d.openTasks       ?? 0 },
      { key: 'delayed',     value: d.delayedTasks    ?? 0 },
      { key: 'in_progress', value: d.inProgressTasks ?? 0 }
    ];
    const cycleSlices = [
      { key: 'completed',   value: d.completedCycles  ?? 0 },
      { key: 'pending',     value: d.openCycles       ?? 0 },
      { key: 'delayed',     value: d.delayedCycles    ?? 0 },
      { key: 'in_progress', value: d.inProgressCycles ?? 0 }
    ];

    const sliceCount = taskSlices.length; // always 4
    const taskColors  = taskSlices.map((s) => resolveColor(s.key));
    const cycleColors = cycleSlices.map((s) => resolveColor(s.key));

    return {
      datasets: [
        {
          data: guardAllZero(taskSlices.map((s) => s.value)),
          backgroundColor: taskColors,
          borderColor: taskColors,
          borderWidth: 0
        },
        makeSpacerDataset(sliceCount),
        {
          data: guardAllZero(cycleSlices.map((s) => s.value)),
          backgroundColor: cycleColors,
          borderColor: cycleColors,
          borderWidth: 0
        }
      ],
      centerLines: [
        { value: d.numberOfTasks  ?? 0, label: 'Artículos'  },
        { value: d.numberOfCycles ?? 0, label: 'Requisitos' }
      ]
    };
  }

  return null;
}

function FilterSidebarChart({ activeModule, moduleData }) {
  const payload = buildChartPayload(activeModule, moduleData);
  if (!payload) return null;

  const chartData = { datasets: payload.datasets };
  const lineCount = payload.centerLines.length;

  const SIZE = 220;

  const holeSize = Math.round(SIZE * 0.72);

  return (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '16px 0 12px' }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE, isolation: 'isolate' }}>

        {/* Imagen de fondo en el hueco del donut (z:-1 queda detrás del canvas transparente) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: holeSize,
          height: holeSize,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: -1,
          pointerEvents: 'none',
        }}>
          <img
            src="/assets/chart_background.png"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Doughnut sin wrapper — Chart.js usa directamente el contenedor 220×220 */}
        <Doughnut options={{ ...DONUT_OPTIONS, maintainAspectRatio: false }} data={chartData} />

        {/* Texto central */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {payload.centerLines.map((line, i) => (
            <div key={i} style={{ lineHeight: '1.4', textAlign: 'center' }}>
              <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{line.value} </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500 }}>{line.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar({ sidebarWidth, onWidthChange, onExpandedChange }) {
  const { language } = useLanguage();
  const activeModule = useSelector((state) => state.globalData.activeModule);
  const { moduleData } = useModuleData();

  const { workareas, modules } = useNavConfig();
  const activeModuleDef = useMemo(
    () => modules.find((m) => m.routeKey === activeModule),
    [modules, activeModule]
  );
  const activeWorkarea = useMemo(
    () => workareas.find((wa) => activeModuleDef && wa.modules.includes(activeModuleDef.slug)) ?? workareas[0],
    [workareas, activeModuleDef]
  );
  const bandColor = activeWorkarea?.color ?? '#00bcd4';

  const filterCount = useSelector((state) => {
    const filterData = state.filter?.modules?.[activeModule]?.filterData ?? {};
    return Object.values(filterData).filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '' && v !== '-1';
    }).length;
  });

  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      onWidthChange?.(next ? EXPANDED_W : COLLAPSED_W);
      onExpandedChange?.(next);
      if (next) window.dispatchEvent(new CustomEvent('amatia:close-megamenu'));
      return next;
    });
  }, [onWidthChange, onExpandedChange]);

  useEffect(() => {
    onWidthChange?.(COLLAPSED_W);
    onExpandedChange?.(false);
  }, []); // eslint-disable-line

  const width = expanded ? EXPANDED_W : COLLAPSED_W;
  const buttonBg = `${bandColor}BF`;

  return (
    <aside
      className="fixed top-0 flex flex-col h-full z-[1150] overflow-hidden"
      style={{ backgroundColor: '#1e3d52', left: sidebarWidth, width, transition: 'width 0.2s ease-in-out' }}
    >
      {/* Zone 1 — spacer aligned with header (50px) */}
      <div className="shrink-0 h-[50px]" />

      {/* Zone 2 — toggle button, h-12 */}
      <div className="shrink-0 h-12 border-b border-white/10" style={{ backgroundColor: buttonBg }}>
        <button
          type="button"
          onClick={toggle}
          className="w-full h-full flex items-center gap-2 px-2.5 text-white hover:brightness-110 transition-all"
          title={
            expanded
              ? language === 'en' ? 'Collapse filters' : 'Colapsar filtros'
              : language === 'en' ? 'Expand filters' : 'Expandir filtros'
          }
        >
          <span className="relative shrink-0 flex items-center justify-center">
            <Filter size={16} className="text-white" />
            {filterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-orange-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 leading-none">
                {filterCount > 9 ? '9+' : filterCount}
              </span>
            )}
          </span>

          {expanded && (
            <>
              <span className="text-xs font-bold flex-1 text-left text-white/90 uppercase whitespace-nowrap">
                {language === 'en' ? 'Filters' : 'Filtros'}
              </span>
              <ChevronLeft size={14} className="shrink-0 text-white/60" />
            </>
          )}
          {!expanded && (
            <ChevronRight size={11} className="shrink-0 text-white/50" />
          )}
        </button>
      </div>

      {/* Zone 3 — content */}
      {expanded ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chart */}
          <FilterSidebarChart activeModule={activeModule} moduleData={moduleData} />

          {/* Filter form */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent', color: 'rgba(255,255,255,0.82)' }}
          >
            {activeModule && (
              <ThemeProvider theme={darkPanelTheme}>
                <BaseFilter component={activeModule} />
              </ThemeProvider>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed: vertical label */
        <div className="flex-1 flex flex-col items-center overflow-hidden pt-3">
          <span
            className="text-[9px] font-bold uppercase tracking-widest text-white/40 whitespace-nowrap select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {language === 'en' ? 'Filters' : 'Filtros'}
          </span>
        </div>
      )}
    </aside>
  );
}

export default FilterSidebar;
