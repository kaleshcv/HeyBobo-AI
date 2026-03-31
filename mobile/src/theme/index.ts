/**
 * Bobo App – Shared Dark Theme
 * All screens, components and navigators import from here.
 */

export const T = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  bg:       '#0a0f1e',   // deepest navy – screen background
  bg2:      '#0f172a',   // slightly lighter – safe-area fills
  surface:  '#111827',   // card / section background
  surface2: '#1e293b',   // elevated card / modal
  surface3: '#263148',   // chip / tag background

  // ── Borders ────────────────────────────────────────────────────────────────
  border:   '#1e293b',
  border2:  '#334155',

  // ── Text ───────────────────────────────────────────────────────────────────
  text:     '#f1f5f9',   // primary text
  text2:    '#cbd5e1',   // secondary text
  muted:    '#94a3b8',   // muted / placeholder
  muted2:   '#475569',   // very muted

  // ── Brand ──────────────────────────────────────────────────────────────────
  primary:  '#818cf8',   // indigo-400  – main accent
  primary2: '#6366f1',   // indigo-500  – active / pressed

  // ── Semantic ───────────────────────────────────────────────────────────────
  green:    '#22c55e',
  orange:   '#f97316',
  yellow:   '#eab308',
  cyan:     '#22d3ee',
  red:      '#ef4444',
  pink:     '#ec4899',
  teal:     '#14b8a6',

  // ── Utility ────────────────────────────────────────────────────────────────
  white:    '#ffffff',
  black:    '#000000',
  overlay:  'rgba(0,0,0,0.7)',
} as const

/** Shade any hex colour with an alpha suffix, e.g. alpha(T.green, 0.15) */
export function alpha(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `${hex}${a}`
}

export default T
