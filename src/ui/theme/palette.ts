/**
 * The HelplineOS palette, copper → petrol (GDD 6.2), described by *role*.
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
  /** Dark edge of reliefs, icon and cursor outlines. */
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
  /** Important / capturable information, hover tint, focus halo. */
  highlight: string;
  /** Vivid accent for graphics (icons, gradients). Not for text backgrounds. */
  accent: string;
  /** Deep accent: backgrounds that carry text (selection, active title bar). */
  accentDeep: string;
  /** Urgent calls, errors. Signals and icons, not running text. */
  alert: string;
}

export type PaletteRole = keyof Palette;

export const palette = {
  // Darks: petrol / brown, level A1 validated by Loïc (J0).
  desktop: '#0B2B35',
  surface: '#1E3337',
  bevelLight: '#45423A',
  bevelDark: '#041920',
  separator: '#323A38',
  // Warm neutrals.
  border: '#5C4D3C',
  textDisabled: '#8A7358',
  // Lights and accents.
  text: '#EFDFC6',
  textDim: '#BDA88C',
  highlight: '#E9A263',
  accent: '#B76935',
  accentDeep: '#815839',
  alert: '#D9656B',
} as const satisfies Palette;

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
  { text: 'text', background: 'accentDeep', minimum: 4.5 },
  { text: 'textDim', background: 'surface', minimum: 4.5 },
  { text: 'textDim', background: 'desktop', minimum: 4.5 },
  { text: 'highlight', background: 'surface', minimum: 4.5 },
  { text: 'highlight', background: 'desktop', minimum: 4.5 },
  { text: 'alert', background: 'surface', minimum: 3 },
  { text: 'accent', background: 'surface', minimum: 0 },
  { text: 'textDisabled', background: 'surface', minimum: 0 },
];
