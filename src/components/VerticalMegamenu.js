import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { getLucideIcon } from '../utils/lucideIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../providers/languageProvider';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function VerticalMegamenu({
  workareas,
  modules,
  hoveredWorkarea,
  activeModuleRouteKey,
  onWorkareaHover,
  onModuleClick,
  onClose
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const hoveredWa = workareas.find((w) => w.slug === hoveredWorkarea);

  const moduleCounts = useMemo(() => {
    const counts = {};
    for (const wa of workareas) {
      counts[wa.slug] = wa.modules.length;
    }
    return counts;
  }, [workareas]);

  const hoveredModules = useMemo(() => {
    if (!hoveredWorkarea) return [];
    const wa = workareas.find((w) => w.slug === hoveredWorkarea);
    if (!wa) return [];
    return wa.modules
      .map((slug) => modules.find((m) => m.slug === slug))
      .filter(Boolean);
  }, [workareas, modules, hoveredWorkarea]);

  const getName = (item) =>
    (language === 'en' ? item.name?.en : item.name?.es) || item.name?.es || item.slug;

  return (
    <div className="flex h-full flex-col sm:flex-row" onClick={(e) => e.stopPropagation()}>
      {/* ── Column 1: Workareas ── */}
      <div className="wa-mega-col1 flex flex-col shrink-0 overflow-y-auto bg-[#000e16] min-w-[160px]">
        <div className="px-4 pb-2.5 pt-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {language === 'en' ? 'Areas' : 'Áreas'}
        </div>

        {workareas.map((wa) => {
          const WaIcon = getLucideIcon(wa.icon);
          const isHovered = wa.slug === hoveredWorkarea;
          return (
            <div
              key={wa.slug}
              className="flex cursor-pointer items-center gap-3 border-l-[3px] px-3.5 py-2.5 transition-all duration-150"
              style={{
                borderLeftColor: isHovered ? wa.color : 'transparent',
                backgroundColor: isHovered ? `${wa.color}1F` : 'transparent'
              }}
              onMouseEnter={() => onWorkareaHover(wa.slug)}
            >
              <WaIcon
                size={16}
                style={{ color: isHovered ? wa.color : '#64748b', flexShrink: 0 }}
              />
              <span
                className={cn(
                  'flex-1 text-[12px] transition-colors duration-150 truncate',
                  isHovered ? 'font-semibold text-slate-100' : 'font-medium text-slate-500'
                )}
              >
                {getName(wa)}
              </span>
              <span className="text-[9px] font-semibold tabular-nums text-slate-600">
                {moduleCounts[wa.slug] ?? 0}
              </span>
              <ChevronRight
                size={12}
                className={cn(
                  'shrink-0 transition-colors duration-150',
                  isHovered ? 'text-white/40' : 'text-transparent'
                )}
              />
            </div>
          );
        })}

        <div className="flex-1" />
      </div>

      {/* ── Column 2: Modules ── */}
      <div className="wa-mega-col2 flex flex-col overflow-y-auto bg-white min-w-[280px]">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 pb-2.5 pt-3.5">
          <h3
            className="text-xs font-bold"
            style={{ color: hoveredWa?.color ?? '#00bcd4' }}
          >
            {hoveredWa ? getName(hoveredWa) : '—'}
          </h3>
        </div>

        <div className="flex-1 py-1">
          {hoveredModules.length === 0 && (
            <p className="px-4 py-6 text-xs italic text-slate-400">
              {language === 'en' ? 'No modules available' : 'Sin módulos disponibles'}
            </p>
          )}

          {hoveredModules.map((mod) => {
            const ModIcon = getLucideIcon(mod.icon);
            const isActive = mod.routeKey === activeModuleRouteKey;
            return (
              <div
                key={mod.slug}
                className="flex items-start gap-2.5 border-l-[3px] border-l-transparent px-3.5 py-2 cursor-pointer transition-all duration-100"
                style={isActive ? { borderLeftColor: mod.color, backgroundColor: `${mod.color}14` } : {}}
                onClick={() => { onModuleClick(mod.route); onClose(); }}
                onMouseEnter={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.borderLeftColor = mod.color ?? '#00bcd4';
                  e.currentTarget.style.backgroundColor = `${mod.color ?? '#00bcd4'}14`;
                }}
                onMouseLeave={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <span className="mt-0.5 flex w-5 shrink-0 items-center justify-center">
                  <ModIcon size={18} className="text-slate-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-700 leading-snug">
                    {getName(mod)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VerticalMegamenu;
