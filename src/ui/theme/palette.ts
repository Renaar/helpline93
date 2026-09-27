/**
 * Raw palette (GDD 6.2). tokens.css declares one custom property per entry
 * (`--color-<kebab-name>`); a test keeps both files in sync.
 * Components never use these values directly: they use the CSS variables.
 */
export const palette = {
  night: '#0B1026',
  surface: '#1A2248',
  bevelLight: '#2E3A6E',
  bevelDark: '#060914',
  amber: '#FFB000',
  amberDim: '#B37A00',
  violet: '#7B5BD6',
  violetDeep: '#3D2A73',
  alert: '#FF5A36',
} as const;

export type PaletteColor = keyof typeof palette;

export function paletteCssVar(color: PaletteColor): string {
  return `--color-${color.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}
