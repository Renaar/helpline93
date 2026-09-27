import { describe, expect, it } from 'vitest';
import type { DocPage } from '../../../content/schemas.ts';
import { findMatches, fold, searchPages } from './search.ts';

const page = (id: string, title: string, body: string, keywords: string[] = []): DocPage => ({
  id,
  tab: 'T',
  title,
  body,
  keywords,
  revision: { night: 1 },
});

describe('fold', () => {
  it('ignores case and accents, keeping the length', () => {
    expect(fold('Mémoire ÉCRAN')).toBe('memoire ecran');
    expect(fold('œuvre').length).toBe(5);
  });
});

describe('findMatches', () => {
  it('finds every occurrence, accent-insensitively', () => {
    expect(findMatches('Mémoire et memoire', 'MEMOIRE')).toEqual([
      [0, 7],
      [11, 18],
    ]);
    expect(findMatches('abc', '  ')).toEqual([]);
  });
});

describe('searchPages', () => {
  const pages = [
    page('p.12', 'Codes sonores BIOS', 'Trois **bips** courts : mémoire vive.'),
    page('p.20', 'Imprimantes', 'Bourrage papier.', ['ruban']),
  ];

  it('needs at least two letters', () => {
    expect(searchPages(pages, 'b')).toEqual([]);
  });

  it('matches text with an excerpt, title or keywords without', () => {
    expect(searchPages(pages, 'memoire').map((r) => r.page.id)).toEqual(['p.12']);
    expect(searchPages(pages, 'memoire')[0]?.excerpt).toContain('mémoire');
    expect(searchPages(pages, 'ruban')).toEqual([{ page: pages[1], excerpt: '' }]);
    expect(searchPages(pages, 'bios')[0]?.page.id).toBe('p.12');
  });
});
