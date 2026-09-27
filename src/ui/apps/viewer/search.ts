import type { DocPage } from '../../../content/schemas.ts';
import { plainText } from './markdownLight.ts';

/** Case- and accent-insensitive fold, one character in → one character out. */
export function fold(text: string): string {
  return Array.from(text, (char) => {
    const base = char.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return (base[0] ?? char).toLowerCase();
  }).join('');
}

/** Ranges [start, end) of every match of `query` in `text` (folded comparison). */
export function findMatches(text: string, query: string): [number, number][] {
  const needle = fold(query.trim());
  if (needle.length === 0) return [];
  const haystack = fold(text);
  const ranges: [number, number][] = [];
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    ranges.push([index, index + needle.length]);
    index = haystack.indexOf(needle, index + needle.length);
  }
  return ranges;
}

export interface SearchResult {
  page: DocPage;
  /** Short excerpt around the first match of the page text, or empty if only the title matched. */
  excerpt: string;
}

export const MIN_QUERY_LENGTH = 2;
const EXCERPT_RADIUS = 36;

/** Pages whose title, keywords or text contain the query. */
export function searchPages(pages: readonly DocPage[], query: string): SearchResult[] {
  if (query.trim().length < MIN_QUERY_LENGTH) return [];
  return pages.flatMap((page) => {
    const text = plainText(page.body);
    const [first] = findMatches(text, query);
    const inTitle = findMatches(page.title, query).length > 0;
    const inKeywords = page.keywords.some((k) => findMatches(k, query).length > 0);
    if (!first && !inTitle && !inKeywords) return [];
    if (!first) return [{ page, excerpt: '' }];
    const start = Math.max(0, first[0] - EXCERPT_RADIUS);
    const end = Math.min(text.length, first[1] + EXCERPT_RADIUS);
    const excerpt = `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
    return [{ page, excerpt }];
  });
}
