/**
 * Validates the YAML content in content/ (GDD 7.10).
 * Every file parses, every top-level `id` is unique across all content, and documentation
 * pages match their schema. Missions, references and capture tags arrive with J2.
 * Usage: npm run content:check
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { docPageSchema, manualSchema } from '../src/content/schemas.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, 'content');

function listYamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listYamlFiles(path);
    return /\.ya?ml$/.test(name) ? [path] : [];
  });
}

const errors: string[] = [];
const idOwners = new Map<string, string>();
const files = listYamlFiles(CONTENT_DIR);

for (const file of files) {
  const name = relative(ROOT, file);
  const document = parseDocument(readFileSync(file, 'utf8'));
  for (const error of document.errors) errors.push(`${name}: ${error.message}`);
  if (document.errors.length > 0) continue;

  const data: unknown = document.toJS();
  if (typeof data !== 'object' || data === null || !('id' in data)) continue;
  const id = String(data.id);
  if (relative(CONTENT_DIR, file).startsWith('docs')) {
    const schema = id === 'manual' ? manualSchema : docPageSchema;
    const result = schema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${name}: ${issue.path.join('.') || '(root)'} — ${issue.message}`);
      }
    }
  }
  const owner = idOwners.get(id);
  if (owner !== undefined) errors.push(`${name}: duplicate id "${id}" (already used in ${owner})`);
  else idOwners.set(id, name);
}

if (errors.length > 0) {
  console.error(`content:check failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`content:check ok — ${files.length} file(s), ${idOwners.size} id(s).`);
