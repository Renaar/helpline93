/**
 * The HelplineOS palette, amber → grey (GDD 6.2), described by *role*.
 * `npm run theme:generate` writes palette.css (one CSS variable per role, `--color-<kebab-role>`)
 * and the cursor SVGs from this file. Components never use these values directly: they use the
 * CSS variables.
 */
export interface Palette {
  /** Desktop background, sunken areas. */
  desktop: string;
  /** Windows, taskbar, panels. */
  surface: string;
  /** Light edge of reliefs. */
  bevelLight: string;
  /** Dark edge of reliefs, icon and cursor outlines, ink of printed pages. */
  bevelDark: string;
  /** Separator lines. */
  separator: string;
  /** Warm neutral borders. */
  border: string;
  /** Running text. */
  text: string;
  /** Secondary text (hints, captions). */
  textDim: string;
  /** Text of disabled elements. */
  textDisabled: string;
  /** Important / capturable information, hover tint, focus halo (amber, hover). */
  highlight: string;
  /** Vivid accent: active buttons, clickable elements, icons, gradients. */
  accent: string;
  /** Deep accent (amber, pressed): decorations, gradient ends. Not for text backgrounds. */
  accentDeep: string;
  /**
   * Computed, not chosen: the deep accent darkened towards the desktop, so that running text
   * stays readable on it (selection, active title bar, felt marker, stamps).
   */
  accentShade: string;
  /** Urgent calls, errors. Signals and icons, not running text. */
  alert: string;
  /** Success, validation. Signals and icons, not running text. */
  success: string;
}

export type PaletteRole = keyof Palette;

/** Mixes two `#RRGGBB` colours like CSS `color-mix(in srgb, a p, b)`. */
export function mixHex(a: string, b: string, weightOfA: number): string {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ca, cb] = [channels(a), channels(b)];
  return `#${ca
    .map((value, i) => Math.round(value * weightOfA + (cb[i] ?? 0) * (1 - weightOfA)))
    .map((value) => value.toString(16).padStart(2, '0').toUpperCase())
    .join('')}`;
}

/** Share of the deep accent in `accentShade` (the rest is the desktop colour). */
const ACCENT_SHADE_WEIGHT = 0.6;

const base = {
  // Amber / grey palette validated by Loïc (J2).
  desktop: '#211D19',
  surface: '#332C25',
  separator: '#5A4E42',
  border: '#5A4E42',
  text: '#EDE4D6',
  textDim: '#A99A88',
  textDisabled: '#A99A88',
  accent: '#D9922E',
  highlight: '#F0AC4C',
  accentDeep: '#B7761F',
  // Lightened from #B4432E so that the urgent-call signal stays visible on windows (≥ 3:1).
  alert: '#C8533B',
  success: '#6E7F4A',
  // Reliefs derived from the greys: a lighter warm edge, a near-black warm shadow.
  bevelLight: '#4A4036',
  bevelDark: '#14110E',
} as const;

export const palette: Palette = {
  ...base,
  accentShade: mixHex(base.accentDeep, base.desktop, ACCENT_SHADE_WEIGHT),
};

export const paletteRoles = Object.keys(palette) as PaletteRole[];

export function paletteCssVar(role: PaletteRole): string {
  return `--color-${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

/** Text/background pairs whose contrast is checked (WCAG 2), with the minimum required. */
export const contrastPairs: readonly {
  text: PaletteRole;
  background: PaletteRole;
  /** 4.5 = running text, 3 = graphics / signals, 0 = informative only (disabled). */
  minimum: number;
}[] = [
  { text: 'text', background: 'surface', minimum: 4.5 },
  { text: 'text', background: 'desktop', minimum: 4.5 },
  { text: 'text', background: 'accentShade', minimum: 4.5 },
  { text: 'accentShade', background: 'text', minimum: 4.5 },
  { text: 'textDim', background: 'surface', minimum: 4.5 },
  { text: 'textDim', background: 'desktop', minimum: 4.5 },
  { text: 'highlight', background: 'surface', minimum: 4.5 },
  { text: 'highlight', background: 'desktop', minimum: 4.5 },
  { text: 'accent', background: 'surface', minimum: 3 },
  { text: 'alert', background: 'surface', minimum: 3 },
  { text: 'success', background: 'surface', minimum: 3 },
  { text: 'text', background: 'accentDeep', minimum: 0 },
  { text: 'textDisabled', background: 'surface', minimum: 0 },
];
