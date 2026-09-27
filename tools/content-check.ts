/**
 * Validates the YAML content in content/ (GDD 7.10): YAML syntax, schemas, unique ids,
 * broken references, capture tags, instruction parameters, resolution codes.
 * Warnings (unused captures, questions never unlocked…) do not fail the check.
 * Usage: npm run content:check
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle } from '../src/content/bundle.ts';

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');

function listYamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listYamlFiles(path);
    return /\.ya?ml$/.test(name) ? [path] : [];
  });
}

const files = Object.fromEntries(
  listYamlFiles(CONTENT_DIR).map((path) => [
    relative(CONTENT_DIR, path).split(sep).join('/'),
    readFileSync(path, 'utf8'),
  ]),
);
const { bundle, issues } = buildBundle(files);
const errors = issues.filter((issue) => issue.level === 'error');
const warnings = issues.filter((issue) => issue.level === 'warning');

for (const warning of warnings) console.warn(`  ⚠ content/${warning.file}: ${warning.message}`);
if (errors.length > 0 || !bundle) {
  console.error(`content:check failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`  ✖ content/${error.file}: ${error.message}`);
  process.exit(1);
}
console.log(
  `content:check ok — ${Object.keys(files).length} file(s): ${bundle.pages.length} page(s), ` +
    `${Object.keys(bundle.missions).length} mission(s), ${Object.keys(bundle.callers).length} caller(s), ` +
    `${bundle.codes.length} code(s), ${warnings.length} warning(s).`,
);
