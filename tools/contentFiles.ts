import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');

function listYamlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listYamlFiles(path);
    return /\.ya?ml$/.test(name) ? [path] : [];
  });
}

/** Every YAML file of content/, keyed by its path relative to content/ ("docs/p12.yaml"). */
export function readContentFiles(): Record<string, string> {
  return Object.fromEntries(
    listYamlFiles(CONTENT_DIR).map((path) => [
      relative(CONTENT_DIR, path).split(sep).join('/'),
      readFileSync(path, 'utf8'),
    ]),
  );
}
