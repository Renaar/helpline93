/**
 * Project guard rails from CLAUDE.md / GDD 10.4–10.6, checked automatically:
 * theme-only colours/sizes/fonts, pure engine, complete assets.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { soundDefinitions } from '../src/audio/soundDefinitions.ts';
import { cursorArt } from '../src/ui/icons/cursorArt.ts';
import { iconArt } from '../src/ui/icons/iconArt.ts';
import { TASKBAR_HEIGHT, TITLEBAR_HEIGHT } from '../src/ui/theme/layout.ts';
import { validatePixelArt } from '../src/ui/icons/pixelArt.ts';
import {
  cursorFile,
  cursorNames,
  renderCursorSvg,
  renderCursorsCss,
  renderPaletteCss,
} from '../tools/themeCss.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const THEME = join(SRC, 'ui', 'theme');

function listFiles(dir: string, extensions: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path, extensions);
    return extensions.test(name) ? [path] : [];
  });
}

function offenders(files: string[], pattern: RegExp): string[] {
  return files.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        pattern.test(line) ? [`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`] : [],
      ),
  );
}

const outsideTheme = (file: string) => !file.startsWith(THEME);
const codeFiles = listFiles(SRC, /\.(tsx?|css)$/).filter(outsideTheme);
const cssFiles = listFiles(SRC, /\.css$/).filter(outsideTheme);

describe('theme', () => {
  it('has generated files up to date with palette.ts and cursorArt.ts (npm run theme:generate)', () => {
    expect(readFileSync(join(THEME, 'palette.css'), 'utf8')).toBe(renderPaletteCss());
    expect(readFileSync(join(THEME, 'cursors.css'), 'utf8')).toBe(renderCursorsCss());
    for (const cursor of cursorNames) {
      const file = join(ROOT, 'assets', 'cursors', cursorFile(cursor));
      expect(readFileSync(file, 'utf8'), file).toBe(renderCursorSvg(cursor));
    }
  });

  it('uses the same bar heights in layout.ts (window maths) and tokens.css (styles)', () => {
    const tokens = readFileSync(join(THEME, 'tokens.css'), 'utf8');
    expect(tokens).toContain(`--taskbar-height: ${TASKBAR_HEIGHT}px;`);
    expect(tokens).toContain(`--titlebar-height: ${TITLEBAR_HEIGHT}px;`);
  });

  it('has no colour literal outside src/ui/theme/', () => {
    expect(
      offenders(
        codeFiles,
        /(?<![\w.])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?)\(/i,
      ),
    ).toEqual([]);
  });

  it('has no raw size, duration or font family in component stylesheets', () => {
    // `em` stays allowed: it is a proportion of the current text size, not a hard size.
    expect(offenders(cssFiles, /(?<![\w-])\d*\.?\d+(?:px|ms|s|rem|vh|vw)\b/)).toEqual([]);
    expect(offenders(cssFiles, /font-family:(?!\s*var\()/)).toEqual([]);
  });
});

describe('engine', () => {
  it('never imports UI, audio, platform or React code', () => {
    const engineFiles = listFiles(join(SRC, 'engine'), /\.ts$/);
    expect(offenders(engineFiles, /from '(?:\.\.\/(?:ui|audio|platform|debug)|react)/)).toEqual([]);
  });
});

describe('assets', () => {
  it('has a file for every sound variant', () => {
    for (const definition of Object.values(soundDefinitions)) {
      for (const variant of definition.variants) {
        expect(existsSync(join(ROOT, 'assets', 'sounds', `${variant}.wav`)), variant).toBe(true);
      }
    }
  });

  it('draws every icon and cursor on a valid 32 × 32 grid', () => {
    for (const [name, art] of Object.entries(iconArt))
      expect(validatePixelArt(art), name).toEqual([]);
    for (const [name, cursor] of Object.entries(cursorArt)) {
      expect(validatePixelArt(cursor.rows), name).toEqual([]);
    }
  });
});
