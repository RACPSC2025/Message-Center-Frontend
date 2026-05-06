import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, Bell, LogOut, Globe, Lock } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../providers/languageProvider';
import { ReactComponent as AmatiaIconV } from '../assets/icons/amatia-v-logo.svg';
import AmatiaHor from '../assets/icons/amatiahor.png';
import { useNavConfig } from '../hooks/useNavConfig';
import { useModuleData } from '../hooks/useModuleData';
import { getLucideIcon } from '../utils/lucideIcons';
import StatusDoughnutChartNavbar from './StatusDoughnutChartNavbar';
import { VerticalMegamenu } from './VerticalMegamenu';
import { STATUS } from '../config/constants';
import storage from '../utils/storage';
import { getAPIUrl } from '../config/constants';

const COLLAPSED_W = 72;
const EXPANDED_W = 220;
const MEGAMENU_W = 470;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* ── Portal tooltip ─────────────────────────────────────────────────── */
function SidebarTooltip({ label, anchorRef, visible }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
  }, [visible, anchorRef]);

  if (!visible || !pos) return null;

  return createPortal(
    <span
      className="fixed flex items-center pointer-events-none z-[9999] -translate-y-1/2"
      style={{ top: pos.top, left: pos.left }}
    >
      <span className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[5px] border-r-slate-800" />
      <span className="px-2 py-1 rounded text-[10px] font-medium bg-slate-800 text-white whitespace-nowrap shadow-lg">
        {label}
      </span>
    </span>,
    document.body
  );
}

/* ── Module icon in collapsed mode ─────────────────────────────────── */
function CollapsedModuleIcon({ mod, isActive, hideDonut = false, onNavigate, getName }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const { moduleData, fetchAllModulesData } = useModuleData();

  useEffect(() => {
    fetchAllModulesData();
  }, []); // eslint-disable-line

  const donutData = useMemo(() => {
    if (!mod.dataId || !isActive) return null;
    const data = moduleData[mod.dataId]?.data;
    if (!data) return null;

    if (mod.dataId === 'actions') {
      if (Array.isArray(data.actionStatusData) && data.actionStatusData.length) {
        return data.actionStatusData.map((s) => ({ key: s.code, color: s.color, value: s.value }));
      }
      return [
        { key: STATUS.pending, value: data.openActions ?? 0 },
        { key: STATUS.completed, value: data.closedActions ?? 0 },
        { key: STATUS.delayed, value: data.delayedActions ?? 0 }
      ];
    }
    // Use taskStatusData from API when available — same color source as TaskCyclesDoughnutChart
    if (Array.isArray(data.taskStatusData) && data.taskStatusData.length) {
      return data.taskStatusData.map((s) => ({ key: s.code, color: s.color, value: s.value }));
    }
    return [
      { key: STATUS.completed, value: data.completedTasks ?? 0 },
      { key: STATUS.delayed, value: data.delayedTasks ?? 0 },
      { key: STATUS.pending, value: data.openTasks ?? 0 },
      { key: STATUS.in_progress, value: data.inProgressTasks ?? 0 }
    ];
  }, [mod.dataId, isActive, moduleData]);

  const ModIcon = getLucideIcon(mod.icon);
  const color = mod.color ?? '#00bcd4';

  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => { setHovered(false); navigate(mod.route); onNavigate?.(); }}
        className="flex flex-col items-center gap-0.5 relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isActive && donutData && !hideDonut ? (
          /* Active + has data + panel collapsed → donut ring */
          <div
            className={cn('relative w-11 h-11 flex items-center justify-center transition-transform duration-200', hovered && 'scale-110')}
          >
            <div className="absolute inset-0 w-full h-full">
              <StatusDoughnutChartNavbar
                dataSet={donutData}
                chartOptions={{
                  cutout: '74%',
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
            <ModIcon size={14} style={{ color }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none" />
          </div>
        ) : isActive ? (
          /* Active, no data yet → flat highlight */
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}26` }}
          >
            <ModIcon size={18} style={{ color }} />
          </div>
        ) : (
          /* Inactive */
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ backgroundColor: hovered ? `${color}22` : 'transparent' }}
          >
            <ModIcon size={18} className={hovered ? 'text-white' : 'text-slate-500'} />
          </div>
        )}
      </button>
      <SidebarTooltip label={getName(mod)} anchorRef={ref} visible={hovered} />
    </>
  );
}

/* ── Main Sidebar ───────────────────────────────────────────────────── */
export function Sidebar({ onWidthChange, filterPanelExpanded = false }) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const activeModule = useSelector((state) => state.globalData.activeModule);
  const unreadCount = useSelector((state) => state.unreadMessages?.count ?? 0);
  const user = useSelector((state) => state.globalData.userDetails ?? {});

  const { workareas, modules, getModule, loaded } = useNavConfig();

  const activeModuleDef = useMemo(
    () => modules.find((m) => m.routeKey === activeModule),
    [modules, activeModule]
  );

  const activeWorkarea = useMemo(
    () => workareas.find((wa) => activeModuleDef && wa.modules.includes(activeModuleDef.slug)) ?? null,
    [workareas, activeModuleDef]
  );

  const bandColor = activeWorkarea?.color ?? workareas[0]?.color ?? '#00bcd4';

  /* ── Sidebar expand/collapse ── */
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('amatia:sidebarExpanded') === 'true'; }
    catch { return false; }
  });

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try { localStorage.setItem('amatia:sidebarExpanded', String(next)); } catch { /* noop */ }
      onWidthChange?.(next ? EXPANDED_W : COLLAPSED_W);
      if (next) setMegamenuOpen(false);
      return next;
    });
  }, [onWidthChange]);

  useEffect(() => { onWidthChange?.(expanded ? EXPANDED_W : COLLAPSED_W); }, []); // eslint-disable-line

  /* ── Megamenu ── */
  const [megamenuOpen, setMegamenuOpen] = useState(false);
  const [hoveredWorkarea, setHoveredWorkarea] = useState('');
  const megamenuRef = useRef(null);

  const openMegamenu = useCallback(() => {
    setHoveredWorkarea(activeWorkarea?.slug ?? workareas[0]?.slug ?? '');
    setMegamenuOpen(true);
  }, [activeWorkarea, workareas]);

  // Close megamenu on outside click or when filter panel signals it
  useEffect(() => {
    const outsideHandler = (e) => {
      if (megamenuOpen && megamenuRef.current && !megamenuRef.current.contains(e.target)) {
        setMegamenuOpen(false);
      }
    };
    const closeHandler = () => setMegamenuOpen(false);
    document.addEventListener('mousedown', outsideHandler);
    window.addEventListener('amatia:close-megamenu', closeHandler);
    return () => {
      document.removeEventListener('mousedown', outsideHandler);
      window.removeEventListener('amatia:close-megamenu', closeHandler);
    };
  }, [megamenuOpen]);

  /* ── Expanded accordion ── */
  const [expandedWa, setExpandedWa] = useState(activeWorkarea?.slug ?? '');
  useEffect(() => {
    if (activeWorkarea?.slug) setExpandedWa(activeWorkarea.slug);
  }, [activeWorkarea?.slug]);

  const getName = useCallback(
    (item) => (language === 'en' ? item.name?.en : item.name?.es) || item.name?.es || item.slug,
    [language]
  );

  /* ── User actions ── */
  const handleSignOut = () => {
    storage.clearToken();
    storage.removeSystemToken();
    const apiUrl = getAPIUrl() || '';
    const base = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
    window.location.href = `${base}login-express/`;
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef(null);
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const sidebarWidth = expanded ? EXPANDED_W : COLLAPSED_W;

  return (
    <>
      {/* ── Sidebar ── */}
      <aside
        className="fixed left-0 top-0 flex flex-col h-full bg-[#000e16] overflow-visible shrink-0 z-[1200] transition-[width] duration-200 ease-in-out"
        style={{ width: sidebarWidth, borderRight: `3px solid ${bandColor}` }}
      >
        {/* Zone 1 — Logo (h-[50px], matches headerHeight) */}
        <div className="shrink-0 h-[50px] flex items-center overflow-hidden">
          {expanded ? (
            <div className="flex items-center w-full h-full px-3">
              <img src={AmatiaHor} alt="Amatia" className="h-6 w-auto opacity-90" />
              <button
                type="button"
                onClick={toggleExpanded}
                className="ml-auto p-1.5 rounded text-slate-500 hover:text-white transition-colors"
                title={t('Collapse')}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleExpanded}
              className="relative flex items-center justify-center w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              title={t('Expand')}
            >
              <AmatiaIconV className="h-8 w-auto text-white fill-white" style={{ fill: 'white' }} />
              <ChevronRight size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </button>
          )}
        </div>

        {/* Zone 2 — Menú trigger (h-12, workarea color) */}
        <div className="shrink-0 h-12 flex items-center" style={{ backgroundColor: bandColor }}>
          <button
            type="button"
            onClick={megamenuOpen ? () => setMegamenuOpen(false) : openMegamenu}
            onMouseEnter={!expanded ? () => { if (!megamenuOpen) openMegamenu(); } : undefined}
            className={cn(
              'flex items-center justify-center gap-2 w-full h-full opacity-90 hover:opacity-100 transition-opacity',
              expanded ? 'px-3' : 'flex-col gap-0.5'
            )}
            title={language === 'en' ? 'Open menu' : 'Abrir menú'}
          >
            <LayoutGrid size={16} className="text-white shrink-0" />
            <span className={cn('font-bold text-white/90 uppercase', expanded ? 'text-xs' : 'text-[8px] tracking-widest')}>
              Menú
            </span>
          </button>
        </div>

        {/* Zone 3 — Navigation (flex-1) */}
        {expanded ? (
          /* Expanded — accordion by workarea */
          <div className="flex flex-col flex-1 w-full overflow-hidden px-1 py-1">
            <nav className="flex flex-col flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e3a52 transparent' }}>
              {workareas.map((wa) => {
                const WaIcon = getLucideIcon(wa.icon);
                const isWaOpen = expandedWa === wa.slug;
                const waMods = wa.modules.map((slug) => modules.find((m) => m.slug === slug)).filter(Boolean);
                return (
                  <div key={wa.slug} className="mb-0.5">
                    <button
                      type="button"
                      onClick={() => setExpandedWa((p) => p === wa.slug ? '' : wa.slug)}
                      className={cn('flex items-center gap-2 w-full rounded-md px-2 py-1.5 transition-all duration-150', isWaOpen ? 'text-slate-200' : 'text-slate-500')}
                      style={{
                        backgroundColor: isWaOpen ? `${wa.color}18` : 'transparent',
                        borderLeft: isWaOpen ? `2px solid ${wa.color}` : '2px solid transparent'
                      }}
                    >
                      <ChevronDown
                        size={12}
                        className={cn('shrink-0 transition-transform duration-200', isWaOpen ? 'rotate-0' : '-rotate-90')}
                        style={{ color: isWaOpen ? wa.color : '#546e7a' }}
                      />
                      <WaIcon size={14} className="shrink-0" style={{ color: isWaOpen ? wa.color : '#546e7a' }} />
                      <span className="text-[11px] font-medium truncate flex-1 text-left">{getName(wa)}</span>
                      <span className="text-[9px] tabular-nums text-slate-600">{waMods.length}</span>
                    </button>

                    {isWaOpen && (
                      <div className="ml-4 pl-2 border-l border-slate-700/30">
                        {waMods.map((mod) => {
                          const ModIcon = getLucideIcon(mod.icon);
                          const isActive = mod.routeKey === activeModule;
                          return (
                            <button
                              key={mod.slug}
                              type="button"
                              onClick={() => { navigate(mod.route); setMegamenuOpen(false); }}
                              className={cn('flex items-center gap-2 w-full rounded-md px-2 py-1 transition-colors duration-100', isActive ? 'text-white' : 'text-slate-400')}
                              style={{ backgroundColor: isActive ? `${mod.color}25` : 'transparent' }}
                            >
                              <ModIcon size={13} className="shrink-0" />
                              <span className="text-[11px] truncate">{getName(mod)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ) : (
          /* Collapsed — module donut icons */
          <div className="flex flex-col items-center flex-1 w-full overflow-hidden pb-2">
            <nav className="flex flex-col items-center flex-1 w-full overflow-y-auto gap-2.5 mt-3"
              style={{ scrollbarWidth: 'none' }}>
              {(activeWorkarea?.modules ?? [])
                .map((slug) => modules.find((m) => m.slug === slug))
                .filter(Boolean)
                .map((mod) => (
                  <CollapsedModuleIcon
                    key={mod.slug}
                    mod={mod}
                    isActive={mod.routeKey === activeModule}
                    hideDonut={filterPanelExpanded}
                    onNavigate={() => setMegamenuOpen(false)}
                    getName={getName}
                  />
                ))}
            </nav>
          </div>
        )}

        {/* Bottom — language only */}
        <div className={cn('shrink-0 flex pb-2', expanded ? 'flex-col px-2 gap-1' : 'flex-col items-center gap-1')}>
          <div className="w-full border-t border-slate-700/40 my-1" />

          {/* Language toggle */}
          <button
            type="button"
            onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}
            className={cn(
              'flex items-center rounded-md py-1.5 transition-colors text-slate-400 hover:text-white',
              expanded ? 'gap-2 px-2 w-full' : 'flex-col gap-0.5 justify-center w-10'
            )}
            title={language === 'en' ? 'Cambiar a español' : 'Switch to English'}
          >
            <Globe size={16} className="shrink-0" />
            <span className={cn('font-bold uppercase', expanded ? 'text-[11px]' : 'text-[8px] tracking-widest')}>
              {language === 'en' ? 'EN' : 'ES'}
            </span>
          </button>
        </div>
      </aside>

      {/* ── Megamenu overlay ── */}
      {megamenuOpen && (
        <div
          ref={megamenuRef}
          className="fixed top-0 shadow-2xl overflow-hidden z-[1300]"
          style={{
            left: sidebarWidth + 3,
            height: '100vh',
            width: MEGAMENU_W,
            borderRight: `2px solid ${bandColor}22`
          }}
        >
          <VerticalMegamenu
            workareas={workareas}
            modules={modules}
            hoveredWorkarea={hoveredWorkarea}
            activeModuleRouteKey={activeModule}
            onWorkareaHover={setHoveredWorkarea}
            onModuleClick={(route) => navigate(route)}
            onClose={() => setMegamenuOpen(false)}
          />
        </div>
      )}

    </>
  );
}

export default Sidebar;
