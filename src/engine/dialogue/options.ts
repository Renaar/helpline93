import type { OptionIndex, OptionSource } from '../../content/options.ts';
import type { ContentBundle, Instruction, Param } from '../../content/schemas.ts';
import type { Dialogue, Verb } from './types.ts';

export interface ChatOption {
  verb: Verb;
  id: string;
  text: string;
  source: OptionSource;
  /** Instructions only. */
  params: Record<string, Param>;
}

/** What the operator can say right now, grouped by verb and sorted by origin (GDD 4.2.2). */
export function availableOptions(
  content: ContentBundle,
  index: OptionIndex,
  dialogue: Dialogue,
): Record<Verb, ChatOption[]> {
  const base = { kind: 'base' } as const;
  const option = (verb: Verb, source: OptionSource) => (o: { id: string; text: string }) => ({
    verb,
    id: o.id,
    text: o.text,
    source,
    params: {},
  });
  const instruction = (source: OptionSource) => (o: Instruction) => ({
    ...option('instruct', source)(o),
    params: o.params ?? {},
  });
  const pages = dialogue.pages.flatMap((id) => {
    const page = content.pages.find((p) => p.id === id);
    return page ? [page] : [];
  });
  const local = dialogue.localQuestions.flatMap((id) => {
    const entry = index.questions.get(id);
    return entry ? [option('ask', entry.source)(entry.option)] : [];
  });
  return {
    ask: [
      ...content.base.questions.map(option('ask', base)),
      ...pages.flatMap((p) => p.questions.map(option('ask', { kind: 'page', pageId: p.id }))),
      ...local,
    ],
    instruct: [
      ...content.base.instructions.map(instruction(base)),
      ...pages.flatMap((p) => p.instructions.map(instruction({ kind: 'page', pageId: p.id }))),
    ],
    manage: content.base.manage.map(option('manage', base)),
  };
}

const CODE_CHARS: Record<string, RegExp> = { '#': /[0-9]/, A: /[A-Z]/i };

/** Is `value` acceptable for this parameter? (GDD 7.5) */
export function paramAccepts(param: Param, value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '') return false;
  switch (param.type) {
    case 'choice':
      return param.options.map(String).includes(trimmed);
    case 'number': {
      if (!/^-?\d+(?:[.,]\d+)?$/.test(trimmed)) return false;
      const number = Number(trimmed.replace(',', '.'));
      return (
        (param.min === undefined || number >= param.min) &&
        (param.max === undefined || number <= param.max)
      );
    }
    case 'text':
      return (
        (param.max_length === undefined || trimmed.length <= param.max_length) &&
        (param.pattern === undefined || new RegExp(`^(?:${param.pattern})$`, 'i').test(trimmed))
      );
    case 'code':
      return (
        trimmed.length === param.format.length &&
        Array.from(param.format).every((char, i) => {
          const rule = CODE_CHARS[char];
          const given = trimmed[i] ?? '';
          return rule ? rule.test(given) : given.toUpperCase() === char.toUpperCase();
        })
      );
  }
}

/** Normalised parameters, or null if one is missing or refused. */
export function acceptParams(
  params: Record<string, Param>,
  values: Readonly<Record<string, string>>,
): Record<string, string> | null {
  const accepted: Record<string, string> = {};
  for (const [name, param] of Object.entries(params)) {
    const value = values[name];
    if (value === undefined || !paramAccepts(param, value)) return null;
    accepted[name] = param.type === 'code' ? value.trim().toUpperCase() : value.trim();
  }
  return accepted;
}

/** "Retirez la barrette en position {slot}." → "… position 2." */
export function fillPlaceholders(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{([a-z_][a-z0-9_]*)\}/g, (whole, name: string) => values[name] ?? whole);
}

/** Identifies an action for repeat detection: same option and same parameters. */
export function actionKey(id: string, params: Readonly<Record<string, string>> = {}): string {
  const entries = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return entries.length === 0 ? id : `${id}{${entries.map(([k, v]) => `${k}=${v}`).join(',')}}`;
}
