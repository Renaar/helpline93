import { parseDocument } from 'yaml';
import type { z } from 'zod';
import {
  baseOptionsSchema,
  callerSchema,
  codesSchema,
  docPageSchema,
  manualSchema,
  missionSchema,
  pageNumber,
  type BaseOptions,
  type Caller,
  type ContentBundle,
  type DocPage,
  type Manual,
  type Mission,
  type ResolutionCode,
} from './schemas.ts';
import { crossCheck } from './crossCheck.ts';

/**
 * Builds the content bundle from raw YAML sources (GDD 7.2 / 7.10).
 * Pure: used by the game (Vite glob) and by content:check (file system) alike.
 */

export interface ContentIssue {
  level: 'error' | 'warning';
  /** Path relative to content/, e.g. "missions/n01_03_trois_bips.yaml". */
  file: string;
  message: string;
}

export interface BuildResult {
  /** Null when there is at least one error. */
  bundle: ContentBundle | null;
  issues: ContentIssue[];
}

function schemaIssues(file: string, error: z.ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    level: 'error',
    file,
    message: `${issue.path.join('.') || '(root)'} — ${issue.message}`,
  }));
}

/** `files`: path relative to content/ → YAML source. */
export function buildBundle(files: Record<string, string>): BuildResult {
  const issues: ContentIssue[] = [];
  const error = (file: string, message: string) => issues.push({ level: 'error', file, message });
  const idOwners = new Map<string, string>();

  let manual: Manual | null = null;
  let base: BaseOptions | null = null;
  let codes: ResolutionCode[] | null = null;
  const pages: DocPage[] = [];
  const callers: Record<string, Caller> = {};
  const missions: Record<string, Mission> = {};
  const fileOf = new Map<string, string>();

  function parse<T>(file: string, schema: z.ZodType<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    issues.push(...schemaIssues(file, result.error));
    return null;
  }

  for (const file of Object.keys(files).sort()) {
    const document = parseDocument(files[file] ?? '');
    for (const e of document.errors) error(file, e.message);
    if (document.errors.length > 0) continue;

    const data: unknown = document.toJS();
    if (typeof data !== 'object' || data === null || !('id' in data)) {
      error(file, 'missing top-level "id"');
      continue;
    }
    const id = String(data.id);
    const owner = idOwners.get(id);
    if (owner !== undefined) error(file, `duplicate id "${id}" (already used in ${owner})`);
    else idOwners.set(id, file);
    fileOf.set(id, file);

    const folder = file.split('/')[0];
    if (folder === 'docs') {
      if (id === 'manual') manual = parse(file, manualSchema, data) ?? manual;
      else if (id === 'base') base = parse(file, baseOptionsSchema, data) ?? base;
      else {
        const page = parse(file, docPageSchema, data);
        if (page) pages.push(page);
      }
    } else if (folder === 'callers') {
      const caller = parse(file, callerSchema, data);
      if (caller) callers[caller.id] = caller;
    } else if (folder === 'missions') {
      const mission = parse(file, missionSchema, data);
      if (mission) missions[mission.id] = mission;
    } else if (folder === 'codes') {
      codes = parse(file, codesSchema, data)?.codes ?? codes;
    }
    // nights/, clients/, emails/, files/: schemas arrive with J3+ (ids are already checked).
  }

  if (!manual) error('docs/manual.yaml', 'the manual header is missing');
  if (!base) error('docs/base.yaml', 'the base options are missing');
  if (!codes) error('codes/codes.yaml', 'the resolution codes are missing');
  if (!manual || !base || !codes) return { bundle: null, issues };

  pages.sort((a, b) => pageNumber(a) - pageNumber(b));
  const bundle: ContentBundle = { manual, pages, base, callers, missions, codes };
  issues.push(...crossCheck(bundle, (id) => fileOf.get(id) ?? '?'));
  const ok = !issues.some((issue) => issue.level === 'error');
  return { bundle: ok ? bundle : null, issues };
}

/** Throws with every error at once (the game refuses to start on broken content). */
export function loadBundle(files: Record<string, string>): ContentBundle {
  const { bundle, issues } = buildBundle(files);
  if (bundle) return bundle;
  const lines = issues
    .filter((issue) => issue.level === 'error')
    .map((issue) => `${issue.file}: ${issue.message}`);
  throw new Error(`Invalid content:\n${lines.join('\n')}`);
}
