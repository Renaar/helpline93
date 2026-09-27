/**
 * Writes the generated theme files:
 *  - src/ui/theme/palette.css — one CSS variable per palette role;
 *  - assets/cursors/*.svg — pixel-art cursors in the palette colours;
 *  - src/ui/theme/cursors.css — one CSS variable per cursor (hotspot included).
 * Usage: npm run theme:generate (after editing palette.ts or cursorArt.ts).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cursorFile,
  cursorNames,
  renderCursorSvg,
  renderCursorsCss,
  renderPaletteCss,
} from './themeCss.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEME_DIR = join(ROOT, 'src', 'ui', 'theme');
const CURSOR_DIR = join(ROOT, 'assets', 'cursors');

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote ${path}`);
}

write(join(THEME_DIR, 'palette.css'), renderPaletteCss());
write(join(THEME_DIR, 'cursors.css'), renderCursorsCss());
for (const cursor of cursorNames) {
  write(join(CURSOR_DIR, cursorFile(cursor)), renderCursorSvg(cursor));
}
