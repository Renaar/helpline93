import { fr } from './fr.ts';

/** Plural variants, selected with Intl.PluralRules (GDD 8.10). `other` is mandatory. */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

type Leaf = string | PluralForms;
export interface Dictionary {
  readonly [key: string]: Leaf | Dictionary;
}

/** Dotted keys of every string in a dictionary, e.g. "sandbox.title". */
export type StringKey<T> = {
  [K in keyof T & string]: T[K] extends Leaf ? K : `${K}.${StringKey<T[K]>}`;
}[keyof T & string];

export type Params = Readonly<Record<string, string | number>>;

export type UiStringKey = StringKey<typeof fr>;

function isPlural(value: Leaf | Dictionary): value is PluralForms {
  return typeof value === 'object' && typeof value.other === 'string';
}

function lookup(dictionary: Dictionary, key: string): Leaf | undefined {
  let node: Leaf | Dictionary | undefined = dictionary;
  for (const part of key.split('.')) {
    if (node === undefined || typeof node === 'string' || isPlural(node)) return undefined;
    node = node[part];
  }
  if (node === undefined || typeof node === 'string' || isPlural(node)) return node;
  return undefined;
}

/** Builds a translate function for one locale. Missing keys show up as the key itself. */
export function createTranslator<T extends Dictionary>(dictionary: T, locale: string) {
  const plurals = new Intl.PluralRules(locale);
  const numbers = new Intl.NumberFormat(locale);

  return function translate(key: StringKey<T>, params: Params = {}): string {
    const entry = lookup(dictionary, key);
    if (entry === undefined) return key;
    let template: string;
    if (typeof entry === 'string') template = entry;
    else {
      const count = params.count;
      const category = typeof count === 'number' ? plurals.select(count) : 'other';
      template = entry[category] ?? entry.other;
    }
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = params[name];
      if (value === undefined) return match;
      return typeof value === 'number' ? numbers.format(value) : value;
    });
  };
}

/** Locale of the active language, for every Intl formatter. Only French for now. */
export const LOCALE = 'fr';

/** UI strings of the active language. */
export const t = createTranslator(fr, LOCALE);

/** Formats a number for the active language (never build number strings by hand). */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LOCALE, options).format(value);
}
