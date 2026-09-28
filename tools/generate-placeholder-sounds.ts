/**
 * Synthesizes the placeholder sounds into assets/sounds/ (16-bit mono WAV).
 * Deterministic: running it twice produces identical files.
 * These are original sounds made by this script, so they carry no third-party licence.
 * Usage: npm run sounds:generate
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRng } from '../src/engine/rng.ts';
import { chatRecipes } from './sounds/chatRecipes.ts';
import { toWav } from './sounds/dsp.ts';
import { osRecipes } from './sounds/osRecipes.ts';
import { uiRecipes } from './sounds/uiRecipes.ts';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, recipe] of Object.entries({ ...uiRecipes, ...osRecipes, ...chatRecipes })) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, toWav(recipe.render(createRng(recipe.seed))));
  console.log(`wrote ${file}`);
}
