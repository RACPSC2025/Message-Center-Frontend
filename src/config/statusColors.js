import { STATUS } from './constants';

// Frontend status color palette — single source of truth.
// This takes PRIORITY over API-provided colors so the frontend controls
// the visual language regardless of what the backend sends.
//
// Philosophy: calm, desaturated, harmonious. Sufficient contrast on both
// light and dark/colored backgrounds. No neon, no alarm — these users
// already live surrounded by alerts.
//
// Lightness ~55–65%, saturation ~28–44% across all colors for visual balance.

export const STATUS_COLORS = {
  // ── Generic status keys (tasks, legals, cycles) ──────────────────────
  [STATUS.completed]:   '#769656',  // verde liquen   — done, calm confirmation
  [STATUS.delayed]:     '#B86672',  // terracota suave — needs attention, not alarm
  [STATUS.pending]:     '#C4B46E',  // dorado mate    — open, waiting
  [STATUS.in_progress]: '#6F86B3',  // azul sereno    — working, progress

  // ── String aliases ────────────────────────────────────────────────────
  in_progress:          '#6F86B3',  // underscore variant
  open:                 '#C4B46E',  // same as pending
  closed:               '#769656',  // same as completed
  done:                 '#769656',
  cancelled:            '#E8E9EB',  // gris ceniza — not applicable / neutral
  not_apply:            '#E8E9EB',
  not_completed:        '#B86672',
  under_progress:       '#6F86B3',
  partially_completed:  '#6F86B3',
  permanent:            '#6F86B3',  // "Permanente" in tasks
  in_transition:        '#C4B46E',
  delayed:              '#B86672',

  // ── Numeric code aliases (1=closed/done, 2=in_progress, 3=open, 4=delayed) ──
  '1': '#769656',
  '2': '#6F86B3',
  '3': '#C4B46E',
  '4': '#B86672',
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
  if (p >= 100) return '#769656';
  if (p >= 75)  return '#769656';
  if (p >= 50)  return '#6F86B3';
  if (p >= 25)  return '#C4B46E';
  return '#B86672';
}

/**
 * Resolve opportunity days to a canonical color.
 * >5=good, >0=acceptable, =0=at-limit, <0=late.
 */
export function resolveOpportunityColor(days) {
  const d = Number(days) || 0;
  if (d > 5)  return '#769656';
  if (d > 0)  return '#C4B46E';
  if (d === 0) return '#B86672';
  return '#B86672';
}
