import { STATUS } from './constants';

// Frontend status color palette — single source of truth.
// This takes PRIORITY over API-provided colors so the frontend controls
// the visual language regardless of what the backend sends.
//
// Midpoint palette — exactly halfway between the original desaturated tones
// and a fully vivid version. Comfortable for long reading sessions,
// clearly distinguishable from one another.

export const STATUS_COLORS = {
  // ── Generic status keys (tasks, legals, cycles) ──────────────────────
  [STATUS.completed]:   '#589a53',  // verde medio    — done
  [STATUS.delayed]:     '#c74d5b',  // rojo medio     — needs attention
  [STATUS.pending]:     '#d5ae37',  // ámbar medio    — open, waiting
  [STATUS.in_progress]: '#5481bd',  // azul medio     — working, progress

  // ── String aliases ────────────────────────────────────────────────────
  in_progress:          '#5481bd',
  open:                 '#d5ae37',
  closed:               '#589a53',
  done:                 '#589a53',
  cancelled:            '#c3c3c4',  // gris medio — not applicable / neutral
  not_apply:            '#c3c3c4',
  not_completed:        '#c74d5b',
  under_progress:       '#5481bd',
  partially_completed:  '#5481bd',
  permanent:            '#5481bd',  // "Permanente" in tasks
  in_transition:        '#d5ae37',
  delayed:              '#c74d5b',

  // ── Numeric code aliases (1=closed/done, 2=in_progress, 3=open, 4=delayed) ──
  '1': '#589a53',
  '2': '#5481bd',
  '3': '#d5ae37',
  '4': '#c74d5b',
};

// Desaturated/muted variant — for use in charts on light backgrounds where
// the vivid midpoint palette draws too much attention.
export const STATUS_COLORS_MUTED = {
  '1': '#769656',  // muted green  — completed / closed
  '2': '#6F86B3',  // muted blue   — in progress / permanent
  '3': '#C4B46E',  // muted amber  — open / pending
  '4': '#B86672',  // muted red    — delayed / expired
};

/**
 * Resolve a status key (string name or numeric code) to its canonical hex color.
 * Always use this instead of hardcoded color maps.
 *
 * @param {string|number} key - status name or numeric code
 * @param {string} [fallback='#90a4ae'] - color to return when key is unknown
 */
export function resolveStatusColor(key, fallback = '#90a4ae') {
  if (key === null || key === undefined || key === '') return fallback;
  const normalized = String(key).trim().toLowerCase().replace(/ /g, '_');
  return STATUS_COLORS[normalized] ?? STATUS_COLORS[String(key).trim()] ?? fallback;
}

/**
 * Resolve a progress percentage (0–100) to a canonical color.
 * Bands: 100=done, 75+=nearing, 50+=in_progress, 25+=pending, <25=delayed.
 */
export function resolveProgressColor(progress) {
  const p = Number(progress) || 0;
  if (p >= 100) return '#589a53';
  if (p >= 75)  return '#589a53';
  if (p >= 50)  return '#5481bd';
  if (p >= 25)  return '#d5ae37';
  return '#c74d5b';
}

/**
 * Resolve opportunity days to a canonical color.
 * >5=good, >0=acceptable, =0=at-limit, <0=late.
 */
export function resolveOpportunityColor(days) {
  const d = Number(days) || 0;
  if (d > 5)  return '#589a53';
  if (d > 0)  return '#d5ae37';
  if (d === 0) return '#c74d5b';
  return '#c74d5b';
}
