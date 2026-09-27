/**
 * Writes the generated theme files:
 *  - src/ui/theme/palettes.css — one CSS variable per palette role, for every palette;
 *  - assets/cursors/<palette>/*.svg — pixel-art cursors in each palette's colours;
 *  - src/ui/theme/cursors.css — one CSS variable per cursor (hotspot included), per palette.
 * Usage: npm run theme:generate (after editing palette.ts or cursorArt.ts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { paletteNames } from '../src/ui/theme/palette.ts';
import {
  cursorFile,
  cursorNames,
  renderCursorSvg,
  renderCursorsCss,
  renderPalettesCss,
} from './themeCss.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME_DIR = join(ROOT, 'src', 'ui', 'theme');
const CURSOR_DIR = join(ROOT, 'assets', 'cursors');

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${path}`);
}

write(join(THEME_DIR, 'palettes.css'), renderPalettesCss());
write(join(THEME_DIR, 'cursors.css'), renderCursorsCss());
for (const palette of paletteNames) {
  for (const cursor of cursorNames) {
    write(join(CURSOR_DIR, cursorFile(palette, cursor)), renderCursorSvg(palette, cursor));
  }
}
