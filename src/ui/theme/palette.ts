/**
 * Colour palettes (GDD 6.2). Each palette fills the same *roles*, so the whole UI can switch
 * palette live (sandbox selector). `npm run theme:generate` writes palettes.css (one CSS variable
 * per role, `--color-<kebab-role>`) and the cursor SVGs from this file.
 * Components never use these values directly: they use the CSS variables.
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

/**
 * Light and mid tones of palette A (copper → petrol), validated by Loïc. Never darkened:
 * only the dark tones change between the A levels.
 */
const copperLights = {
  border: '#5C4D3C',
  text: '#EFDFC6',
  textDim: '#BDA88C',
  textDisabled: '#6F523B',
  highlight: '#E9A263',
  accent: '#B76935',
  accentDeep: '#815839',
  alert: '#D9656B',
} as const;

/*
 * Dark levels: same hue as palette A, lightness lowered in OKLCH (perceptual), with even steps
 * between desktop, surfaces and reliefs so they never merge.
 */
export const palettes = {
  /** A — copper → petrol, as validated in J0 revision 1 (reference). */
  copper: {
    desktop: '#143642',
    surface: '#263C41',
    bevelLight: '#4A473E',
    bevelDark: '#0B232B',
    separator: '#38413F',
    ...copperLights,
  },
  /** A1 — darks slightly deeper. */
  copper1: {
    desktop: '#0B2B35',
    surface: '#1E3337',
    bevelLight: '#45423A',
    bevelDark: '#041920',
    separator: '#323A38',
    ...copperLights,
  },
  /** A2 — darks clearly deeper. */
  copper2: {
    desktop: '#031D26',
    surface: '#14262A',
    bevelLight: '#38352D',
    bevelDark: '#010D13',
    separator: '#262D2C',
    ...copperLights,
  },
  /** A3 — darks very deep, close to black. */
  copper3: {
    desktop: '#001017',
    surface: '#09191C',
    bevelLight: '#2A2821',
    bevelDark: '#000407',
    separator: '#19201E',
    ...copperLights,
  },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

export const DEFAULT_PALETTE: PaletteName = 'copper';

export const paletteNames = Object.keys(palettes) as PaletteName[];

export const paletteRoles = Object.keys(palettes.copper) as PaletteRole[];

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
